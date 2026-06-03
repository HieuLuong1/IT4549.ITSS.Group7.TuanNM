package com.mealmate.fridge.model.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CustomFoodRequestResponse {

    private String customName;

    private Long categoryId;

    private String categoryName;

    private String unit;

    private Long placeholderFoodId;

    private String placeholderFoodName;

    private Long requestCount;

    private LocalDateTime firstRequestedAt;

    private LocalDateTime lastRequestedAt;
}
