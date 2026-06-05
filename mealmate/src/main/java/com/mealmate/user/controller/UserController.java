package com.mealmate.user.controller;

import com.mealmate.user.model.User;
import com.mealmate.user.model.dto.UserMemberResponse;
import com.mealmate.user.service.UserService;
import com.mealmate.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/users/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Đảm bảo mở CORS để không bị chặn khi gọi từ React
public class UserController {

    private final UserService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> create(@RequestBody User entity) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", service.save(entity)));
    }

    @GetMapping("/current")
    public ResponseEntity<ApiResponse<UserMemberResponse>> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User currentUser)) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Người dùng không hợp lệ", null));
        }

        UserMemberResponse response = UserMemberResponse.builder()
                .id(currentUser.getId())
                .fullName(currentUser.getFullName())
                .email(currentUser.getEmail())
                .roleId(currentUser.getRole() != null ? currentUser.getRole().getId() : null)
                .roleName(currentUser.getRole() != null ? currentUser.getRole().getName() : null)
                .familyId(currentUser.getFamilyId())
                .avatarUrl(currentUser.getAvatarUrl())
                .build();

        return ResponseEntity.ok(new ApiResponse<>(true, "Success", response));
    }

    // =========================================================================
    // 🎯 API LẤY DANH SÁCH THÀNH VIÊN TRONG GIA ĐÌNH ĐỘNG THEO TOKEN
    // =========================================================================
    @GetMapping("/family/members")
    public ResponseEntity<ApiResponse<List<UserMemberResponse>>> getFamilyMembers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }

        Object principal = authentication.getPrincipal();
        if (!(principal instanceof User currentUser)) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Người dùng không hợp lệ", null));
        }
        Long currentFamilyId = currentUser.getFamilyId();

        if (currentFamilyId == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Người dùng chưa tham gia vào gia đình nào", List.of()));
        }

        List<UserMemberResponse> members = service.findByFamilyId(currentFamilyId).stream()
                .map(user -> UserMemberResponse.builder()
                        .id(user.getId())
                        .fullName(user.getFullName())
                        .email(user.getEmail())
                        .roleId(user.getRole() != null ? user.getRole().getId() : null)
                        .roleName(user.getRole() != null ? user.getRole().getName() : null)
                        .familyId(user.getFamilyId())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new ApiResponse<>(true, "Success", members));
    }
}
