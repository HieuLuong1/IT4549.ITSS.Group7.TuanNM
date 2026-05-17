package com.mealmate.user.controller;

import com.mealmate.user.model.Family;
import com.mealmate.user.model.User; // 1. Import chuẩn thực thể User của bạn
import com.mealmate.user.model.dto.FamilyResponse;
import com.mealmate.user.service.FamilyService;
import com.mealmate.user.mapper.FamilyMapper;
import com.mealmate.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/familys")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Mở khóa CORS để React gọi sang không bị chặn
public class FamilyController {

    private final FamilyService service;
    private final FamilyMapper familyMapper;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Family>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findAll()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Family>> create(@RequestBody Family entity) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", service.save(entity)));
    }

    // =========================================================================
    // 1. API LẤY GIA ĐÌNH HIỆN TẠI (ĐÃ ĐỘNG HÓA 100% THEO TOKEN ĐĂNG NHẬP)
    // =========================================================================
    @GetMapping("/current")
    public ResponseEntity<ApiResponse<FamilyResponse>> getCurrentFamily() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }

        // 🎯 ĐỘNG HÓA: Ép kiểu thẳng principal về thực thể User của hệ thống bạn
        User currentUser = (User) authentication.getPrincipal(); 
        
        // 🎯 ĐỘNG HÓA: Bốc mã familyId trực tiếp từ tài khoản động của token gửi lên
        Long currentFamilyId = currentUser.getFamilyId(); 

        // Kiểm tra an toàn bảo mật, tránh lỗi sập server khi user chưa được cấp nhà
        if (currentFamilyId == null) {
            return ResponseEntity.ok(new ApiResponse<>(false, "Tài khoản của bạn chưa tham gia vào bất kỳ nhóm gia đình nào!", null));
        }

        // Tìm thông tin gia đình trong DB theo mã ID động
        Family family = service.findByFamilyId(currentFamilyId);
        
        // Chuyển đổi sang DTO qua MapStruct (Tự động map id, name, housekeeperId vì trùng tên biến)
        FamilyResponse response = familyMapper.toResponse(family);
        
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", response));
    }

    // =========================================================================
    // 2. API CẬP NHẬT TÊN NHÓM GIA ĐÌNH (ĐỐI CHIẾU ID CHỦ NHÀ ĐỘNG BẢO MẬT VỚI TOKEN)
    // =========================================================================
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<FamilyResponse>> updateFamilyName(
            @PathVariable Long id, 
            @RequestBody FamilyResponse familyRequest) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "Chưa đăng nhập", null));
        }

        // Lấy thông tin nhóm gia đình hiện tại từ Database lên trước
        Family family = service.findByFamilyId(id);
        
        // 🎯 ĐỘNG HÓA: Bốc thông tin User đang tạo request ra để kiểm tra quyền hạn
        User currentUser = (User) authentication.getPrincipal();
        Long currentUserId = currentUser.getId(); 

        // Kiểm tra quyền: Đối chiếu trực tiếp 2 biến Long xem có khớp khập khiễng không
        if (family.getHousekeeperId() == null || !family.getHousekeeperId().equals(currentUserId)) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "Bạn không phải là chủ nhà! Chỉ chủ nhà mới được quyền đổi tên nhóm.", null));
        }

        // Tiến hành cập nhật tên mới vào thực thể và lưu xuống DB
        family.setName(familyRequest.getName());
        Family updatedFamily = service.save(family);
        
        // Trả về DTO mới sau khi cập nhật thành công
        FamilyResponse response = familyMapper.toResponse(updatedFamily);

        return ResponseEntity.ok(new ApiResponse<>(true, "Cập nhật tên nhóm gia đình thành công!", response));
    }
}