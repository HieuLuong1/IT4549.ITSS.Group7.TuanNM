package com.mealmate.user.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FamilyResponse {
    private Long id;
    private String name;
    private Long housekeeperId;
}