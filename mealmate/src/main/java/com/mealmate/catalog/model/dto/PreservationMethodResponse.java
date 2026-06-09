package com.mealmate.catalog.model.dto;

public record PreservationMethodResponse(
        Long id,
        Long foodId,
        String content,
        String referenceSource
) {
}
