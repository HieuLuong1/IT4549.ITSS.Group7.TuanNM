package com.mealmate.fridge.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolveCustomFoodAsSynonymRequest {

    @NotBlank(message = "customName is required")
    private String customName;

    @NotNull(message = "placeholderFoodId is required")
    private Long placeholderFoodId;

    @NotNull(message = "targetFoodId is required")
    private Long targetFoodId;
}
