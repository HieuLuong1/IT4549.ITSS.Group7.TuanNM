package com.mealmate.fridge.model.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResolveCustomFoodAsNewRequest {

    @NotBlank(message = "customName is required")
    private String customName;

    @NotNull(message = "placeholderFoodId is required")
    private Long placeholderFoodId;

    @NotNull(message = "categoryId is required")
    private Long categoryId;

    @NotBlank(message = "name is required")
    private String name;

    private String unit;

    private String synonyms;

    private String imageUrl;
}
