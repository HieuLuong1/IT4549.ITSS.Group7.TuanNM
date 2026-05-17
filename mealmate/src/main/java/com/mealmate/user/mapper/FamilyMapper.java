package com.mealmate.user.mapper;

import com.mealmate.user.model.Family;
import com.mealmate.user.model.dto.FamilyResponse;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface FamilyMapper {
    // Tự động map tất cả các thuộc tính trùng tên: id -> id, name -> name, housekeeperId -> housekeeperId
    FamilyResponse toResponse(Family family);
}