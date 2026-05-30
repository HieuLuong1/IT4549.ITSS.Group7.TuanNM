package com.mealmate.user.controller;

import com.mealmate.user.model.User;
import com.mealmate.user.model.Invitation;
import com.mealmate.user.model.Family;
import com.mealmate.user.service.UserService;
import com.mealmate.user.service.FamilyService;
import com.mealmate.user.repository.InvitationRepository;
import com.mealmate.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/users/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService service;
    private final InvitationRepository invitationRepository;
    private final FamilyService familyService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<User>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<User>> create(@RequestBody User entity) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", service.save(entity)));
    }

    @GetMapping("/family/members")
    public ResponseEntity<ApiResponse<List<User>>> getFamilyMembers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }
        User currentUser = (User) authentication.getPrincipal();
        Long currentFamilyId = currentUser.getFamilyId();

        if (currentFamilyId == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "Chưa tham gia gia đình nào", List.of()));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findByFamilyId(currentFamilyId)));
    }

    @GetMapping("/search-member")
    public ResponseEntity<ApiResponse<User>> searchUser(@RequestParam("keyword") String keyword) {
        try {
            if (keyword == null || keyword.trim().isEmpty()) {
                return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Từ khóa trống", null));
            }
            User user = service.searchByEmailOrPhone(keyword.trim());
            if (user == null) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy", null));
            }
            user.setPasswordHash(null); 
            return ResponseEntity.ok(new ApiResponse<>(true, "Success", user));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    // =========================================================================
    // 🎯 SỬA FULL HÀM CHECK LỜI MỜI: Trả về Object và HashMap trống, triệt tiêu lỗi 500
    // =========================================================================
    @GetMapping("/check-invite")
    public ResponseEntity<ApiResponse<Object>> checkIncomingInvite() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", new java.util.HashMap<>()));
        }
        
        try {
            User currentUser = (User) authentication.getPrincipal();
            if (currentUser == null || currentUser.getId() == null) {
                return ResponseEntity.ok(new ApiResponse<>(false, "Không tìm thấy thông tin cơ bản người dùng", new java.util.HashMap<>()));
            }

            Optional<Invitation> inviteOpt = invitationRepository
                    .findFirstByReceiverIdAndStatusOrderByIdDesc(currentUser.getId(), "PENDING");

            if (inviteOpt.isPresent()) {
                Invitation invite = inviteOpt.get();
                try {
                    Family family = familyService.findByFamilyId(invite.getFamilyId());
                    if (family == null) {
                        return ResponseEntity.ok(new ApiResponse<>(false, "Lời mời thuộc về nhóm không tồn tại", new java.util.HashMap<>()));
                    }
                    
                    Map<String, Object> data = new java.util.HashMap<>();
                    data.put("familyId", invite.getFamilyId());
                    data.put("familyName", family.getName());
                    
                    return ResponseEntity.ok(new ApiResponse<>(true, "Success", data));
                } catch (Exception e) {
                    return ResponseEntity.ok(new ApiResponse<>(false, "Lỗi lấy thông tin nhóm", new java.util.HashMap<>()));
                }
            }
            
            // 🎯 THAY THẾ CHỖ NÀY: Trả về một HashMap trống thay vì null để Jackson bóc tách êm đẹp
            return ResponseEntity.ok(new ApiResponse<>(false, "Không có lời mời", new java.util.HashMap<>()));
            
        } catch (Exception e) {
            System.err.println("❌ LỖI TẠI CHECK-INVITE: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Lỗi hệ thống: " + e.getMessage(), new java.util.HashMap<>()));
        }
    }

    @PostMapping("/accept-invite")
    public ResponseEntity<ApiResponse<Void>> acceptFamilyInvite(@RequestBody Map<String, Long> body) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }
        Long familyId = body.get("familyId");
        User currentUser = (User) authentication.getPrincipal();

        Optional<Invitation> inviteOpt = invitationRepository
                .findByFamilyIdAndReceiverIdAndStatus(familyId, currentUser.getId(), "PENDING");

        if (inviteOpt.isPresent()) {
            Invitation invite = inviteOpt.get();
            invite.setStatus("ACCEPTED");
            invitationRepository.save(invite);

            User dbUser = service.findAll().stream()
                    .filter(u -> u.getId().equals(currentUser.getId()))
                    .findFirst().orElse(currentUser);
            dbUser.setFamilyId(familyId);
            service.save(dbUser);

            return ResponseEntity.ok(new ApiResponse<>(true, "Đồng ý thành công", null));
        }
        return ResponseEntity.status(404).body(new ApiResponse<>(false, "Không tìm thấy lời mời", null));
    }

    @PostMapping("/decline-invite")
    public ResponseEntity<ApiResponse<Void>> declineFamilyInvite() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }
        User currentUser = (User) authentication.getPrincipal();

        Optional<Invitation> inviteOpt = invitationRepository
                .findFirstByReceiverIdAndStatusOrderByIdDesc(currentUser.getId(), "PENDING");

        if (inviteOpt.isPresent()) {
            Invitation invite = inviteOpt.get();
            invite.setStatus("DECLINED");
            invitationRepository.save(invite);
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã từ chối", null));
    }
}