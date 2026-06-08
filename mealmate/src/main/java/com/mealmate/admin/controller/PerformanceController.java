package com.mealmate.admin.controller;

import com.mealmate.catalog.model.Food;
import com.mealmate.catalog.model.Category;
import com.mealmate.catalog.repository.CategoryRepository;
import com.mealmate.catalog.repository.FoodRepository;
import com.mealmate.catalog.repository.RecipeRepository;
import com.mealmate.user.repository.UserRepository;
import com.mealmate.user.repository.FamilyRepository;
import com.mealmate.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.*;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PerformanceController {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FoodRepository foodRepository;
    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    private final JdbcTemplate jdbcTemplate;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        
        long totalUsers = userRepository.count();
        long totalFamilies = familyRepository.count();
        long totalFoods = foodRepository.count();
        long totalRecipes = recipeRepository.count();
        
        stats.put("totalUsers", totalUsers);
        stats.put("totalFamilies", totalFamilies);
        stats.put("totalFoods", totalFoods);
        stats.put("totalRecipes", totalRecipes);
        
        List<Category> categories = categoryRepository.findAll();
        List<Food> foods = foodRepository.findAll();
        
        List<Map<String, Object>> foodStatsList = new ArrayList<>();
        for (Category cat : categories) {
            long count = foods.stream()
                    .filter(f -> f.getCategoryId() != null && f.getCategoryId().equals(cat.getId()))
                    .count();
            if (count > 0) {
                Map<String, Object> catStat = new HashMap<>();
                catStat.put("name", cat.getName());
                catStat.put("value", count);
                foodStatsList.add(catStat);
            }
        }
        stats.put("foodStats", foodStatsList);
        
        List<Map<String, Object>> userActivity = new ArrayList<>();
        String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
        int[] activeCounts = {40, 55, 60, 80, 75, 95, 110};
        for (int i = 0; i < days.length; i++) {
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("name", days[i]);
            dayMap.put("users", activeCounts[i]);
            userActivity.add(dayMap);
        }
        stats.put("userActivity", userActivity);

        return ResponseEntity.ok(new ApiResponse<>(true, "Success", stats));
    }

    // =========================================================================
    // 🎯 LUỒNG XỬ LÝ: KHÔI PHỤC ĐỦ TRƯỜNG ACTUALNAME TRẢ VỀ CHO FRONT-END
    // =========================================================================
    @GetMapping("/unidentified-items")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getUnidentifiedItems() {
        try {
            String sql = "SELECT fi.id AS id, " +
                         "       fi.family_id AS familyId, " +
                         "       fi.food_id AS foodId, " +
                         "       c.name AS generalName, " +       
                         "       fi.custom_name AS actualName, " +  
                         "       fi.quantity AS quantity, " +
                         "       fi.storage_location AS storageLocation, " +
                         "       fi.specific_location AS specificLocation, " +
                         "       fi.added_date AS addedDate, " +
                         "       fi.expiry_date AS expiryDate, " +
                         "       fi.status AS status, " +
                         "       fi.image_url AS imageUrl, " +
                         "       fi.note AS note, " +
                         "       fi.removed_reason AS removedReason, " +
                         "       fi.removed_reason_note AS removedReasonNote, " +
                         "       fi.removed_at AS removedAt, " +
                         "       fi.removed_by AS removedBy, " +
                         "       fi.created_at AS createdAt, " +
                         "       fi.updated_at AS updatedAt, " +
                         "       COALESCE(u.full_name, 'Thành viên gia đình') AS submittedBy, " +
                         "       DATE(fi.created_at) AS submittedAt " +
                         "FROM fridge_items fi " +
                         "JOIN foods f ON fi.food_id = f.id " +
                         "JOIN categories c ON f.category_id = c.id " + 
                         "LEFT JOIN users u ON f.created_by = u.id " +  
                         "WHERE fi.custom_name IS NOT NULL " +
                         "ORDER BY fi.created_at DESC, fi.id DESC";

            List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
            List<Map<String, Object>> formattedItems = new ArrayList<>();

            for (Map<String, Object> row : rows) {
                Map<String, Object> finalMap = new HashMap<>();
                
                finalMap.put("id", row.get("id"));
                finalMap.put("familyid", row.get("familyid"));
                finalMap.put("familyId", row.get("familyid"));
                finalMap.put("foodid", row.get("foodid"));
                finalMap.put("foodId", row.get("foodid"));
                finalMap.put("quantity", row.get("quantity"));
                finalMap.put("storagelocation", row.get("storagelocation"));
                finalMap.put("storageLocation", row.get("storagelocation"));
                finalMap.put("specificlocation", row.get("specificlocation"));
                finalMap.put("specificLocation", row.get("specificlocation"));
                finalMap.put("addeddate", row.get("addeddate"));
                finalMap.put("addedDate", row.get("addeddate"));
                finalMap.put("expirydate", row.get("expirydate"));
                finalMap.put("expiryDate", row.get("expirydate"));
                finalMap.put("status", row.get("status"));
                finalMap.put("imageurl", row.get("imageurl"));
                finalMap.put("imageUrl", row.get("imageurl"));
                finalMap.put("note", row.get("note"));
                finalMap.put("removedreason", row.get("removedreason"));
                finalMap.put("removedReason", row.get("removedreason"));
                finalMap.put("removedreasonnote", row.get("removedreasonnote"));
                finalMap.put("removedReasonNote", row.get("removedreasonnote"));
                finalMap.put("removedat", row.get("removedat"));
                finalMap.put("removedAt", row.get("removedat"));
                finalMap.put("removedby", row.get("removedby"));
                finalMap.put("removedBy", row.get("removedby"));
                finalMap.put("createdat", row.get("createdat"));
                finalMap.put("createdAt", row.get("createdat"));
                finalMap.put("updatedat", row.get("updatedat"));
                finalMap.put("updatedAt", row.get("updatedat"));
                
                // 🎯 ĐÃ VÁ LỖI KHÔNG ĐƯA CUSTOM_NAME VÀO MAP TRẢ VỀ:
                String actualNameVal = (String) row.get("actualname");
                finalMap.put("actualname", actualNameVal);
                finalMap.put("actualName", actualNameVal);
                
                String gName = (String) row.get("generalname");
                finalMap.put("generalname", gName);
                finalMap.put("generalName", gName);
                
                finalMap.put("submittedby", row.get("submittedby"));
                finalMap.put("submittedBy", row.get("submittedby"));
                
                Object subAt = row.get("submittedat");
                String subAtStr = subAt != null ? subAt.toString() : "—";
                finalMap.put("submittedat", subAtStr);
                finalMap.put("submittedAt", subAtStr);

                if (gName != null && (gName.toLowerCase().contains("thịt") || gName.toLowerCase().contains("hải sản"))) {
                    finalMap.put("type", "meat");
                } else {
                    finalMap.put("type", "ingredient");
                }

                formattedItems.add(finalMap);
            }

            return ResponseEntity.ok(new ApiResponse<>(true, "Success", formattedItems));
            
        } catch (Exception e) {
            System.err.println("❌ LỖI TRUY VẤN SQL ĐỊNH DANH: " + e.getMessage());
            return ResponseEntity.status(500).body(new ApiResponse<>(false, "Lỗi hệ thống: " + e.getMessage(), null));
        }
    }

    @DeleteMapping("/unidentified-items/{id}")
    public ResponseEntity<ApiResponse<String>> deleteUnidentifiedItem(@PathVariable Long id) {
        // Đảm bảo KỆ NÓ, giữ nguyên dữ liệu gốc không xóa theo ý bạn
        return ResponseEntity.ok(new ApiResponse<>(true, "Đã ghi nhận xử lý (Dữ liệu tủ lạnh được giữ nguyên)!", null));
    }
}