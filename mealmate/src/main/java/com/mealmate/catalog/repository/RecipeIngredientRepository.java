package com.mealmate.catalog.repository;

import com.mealmate.catalog.model.RecipeIngredient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecipeIngredientRepository extends JpaRepository<RecipeIngredient, Long> {

    @Query("""
            select ri.recipe.id as recipeId, ri.food.name as foodName
            from RecipeIngredient ri
            where ri.recipe.id in :recipeIds
            order by ri.recipe.id, ri.id
            """)
    List<RecipeIngredientSummaryProjection> findIngredientNamesByRecipeIds(@Param("recipeIds") List<Long> recipeIds);

    @Query("""
            select ri.food.id as foodId,
                   ri.food.name as foodName,
                   ri.quantity as quantity,
                   ri.unit as unit
            from RecipeIngredient ri
            where ri.recipe.id = :recipeId
            order by ri.id
            """)
    List<RecipeIngredientDetailProjection> findIngredientDetailsByRecipeId(@Param("recipeId") Long recipeId);
}
