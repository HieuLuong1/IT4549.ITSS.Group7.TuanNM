package com.mealmate.user.mapper;

import com.mealmate.user.model.Family;
import com.mealmate.user.model.dto.FamilyResponse;
import org.springframework.stereotype.Component;

@Component
public class FamilyMapper {
    // 🎯 Manual implementation thay thế MapStruct để tránh issue null fields
    public FamilyResponse toResponse(Family family) {
        if (family == null) {
            return null;
        }
        
        FamilyResponse response = new FamilyResponse();
        response.setId(family.getId());
        response.setName(family.getName());
        response.setHousekeeperId(family.getHousekeeperId());
        
        System.out.println("🔍 [DEBUG] FamilyMapper.toResponse() - id: " + response.getId() + ", name: " + response.getName() + ", housekeeperId: " + response.getHousekeeperId());
        
        return response;
    }
}