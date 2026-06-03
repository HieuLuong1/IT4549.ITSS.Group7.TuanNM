package com.mealmate.admin.controller;

import com.mealmate.catalog.model.Food;
import com.mealmate.catalog.model.Category;
import com.mealmate.catalog.repository.CategoryRepository;
import com.mealmate.catalog.repository.FoodRepository;
import com.mealmate.catalog.repository.RecipeRepository;
import com.mealmate.user.repository.UserRepository;
import com.mealmate.user.repository.FamilyRepository;
import com.mealmate.auth.tracker.UserActivityTracker;
import com.mealmate.fridge.repository.FridgeItemRepository;
import com.mealmate.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.*;

@RestController
@RequestMapping("/api/v1/admin/stats")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class PerformanceController {

    private final UserRepository userRepository;
    private final FamilyRepository familyRepository;
    private final FoodRepository foodRepository;
    private final RecipeRepository recipeRepository;
    private final CategoryRepository categoryRepository;
    private final UserActivityTracker userActivityTracker;
    private final FridgeItemRepository fridgeItemRepository;

    @GetMapping
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
        
        // Real food stats from catalog foods
        List<Map<String, Object>> foodStatsList = foodRepository.countFoodsByCategory();
        stats.put("foodStats", foodStatsList);
        
        // Real weekly user activity stats
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        List<Map<String, Object>> userActivity = new ArrayList<>();
        String[] days = {"Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"};
        
        for (int i = 0; i < days.length; i++) {
            LocalDate date = monday.plusDays(i);
            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.plusDays(1).atStartOfDay();
            
            long count = userActivityTracker.countVisitsBetween(startOfDay, endOfDay);
            
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("name", days[i]);
            dayMap.put("users", count);
            userActivity.add(dayMap);
        }
        stats.put("userActivity", userActivity);

        return ResponseEntity.ok(new ApiResponse<>(true, "Success", stats));
    }
}
