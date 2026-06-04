package com.mealmate.catalog.model;

import com.mealmate.common.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recipes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Recipe extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name; // Tên món ăn

    @Column(columnDefinition = "TEXT")
    private String instructions; // Hướng dẫn chế biến

    @Column(name = "reference_link")
    private String referenceLink; // Link tham khảo

    @Column(name = "author")
    private String author; // Tác giả công thức

    @Column(name = "preferred_meal_time")
    private String preferredMealTime; // Bữa ưu tiên

    @Column(name = "image_url")
    private String imageUrl; // Ảnh minh họa

    @Column(name = "display_status")
    private String displayStatus = "SYSTEM"; // SYSTEM hoặc CUSTOM

    @Column(name = "cooking_time_minutes")
    private Integer cookingTimeMinutes;

    @Column(name = "difficulty")
    private String difficulty;

    @Column(name = "calories")
    private Integer calories;

    @Column(name = "protein")
    private Double protein;

    @Column(name = "fat")
    private Double fat;

    @Column(name = "carbs")
    private Double carbs;

    @Column(name = "serving_size")
    private Integer servingSize;
}

