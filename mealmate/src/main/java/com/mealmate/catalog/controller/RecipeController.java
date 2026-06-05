package com.mealmate.catalog.controller;

import com.mealmate.catalog.model.Recipe;
import com.mealmate.catalog.model.dto.RecipeCatalogResponse;
import com.mealmate.catalog.model.dto.RecipeCreateRequest;
import com.mealmate.catalog.model.dto.RecipeDetailResponse;
import com.mealmate.catalog.service.RecipeService;
import com.mealmate.common.dto.ApiResponse;
import com.mealmate.common.storage.ImageUploadResponse;
import jakarta.validation.Valid;
import com.mealmate.user.model.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/v1/catalogs/recipes")
@RequiredArgsConstructor
public class RecipeController {

    private final RecipeService service;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Recipe>>> getAll() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findAll()));
    }

    @GetMapping("/catalog")
    public ResponseEntity<ApiResponse<List<RecipeCatalogResponse>>> getCatalog(Authentication authentication) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findCatalogRecipes(resolveUserId(authentication))));
    }

    @GetMapping("/{recipeId}/detail")
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> getDetail(
            @PathVariable Long recipeId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Success", service.findDetail(recipeId, resolveUserId(authentication))));
    }

    @PostMapping("/{recipeId}/favorite")
    public ResponseEntity<ApiResponse<Void>> addFavorite(
            @PathVariable Long recipeId,
            Authentication authentication
    ) {
        service.updateFavorite(resolveUserId(authentication), recipeId, true);
        return ResponseEntity.ok(new ApiResponse<>(true, "Added to favorites", null));
    }

    @DeleteMapping("/{recipeId}/favorite")
    public ResponseEntity<ApiResponse<Void>> removeFavorite(
            @PathVariable Long recipeId,
            Authentication authentication
    ) {
        service.updateFavorite(resolveUserId(authentication), recipeId, false);
        return ResponseEntity.ok(new ApiResponse<>(true, "Removed from favorites", null));
    }

    @PostMapping(value = "/{recipeId}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @PathVariable Long recipeId,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Uploaded", service.uploadImage(recipeId, file)));
    }

    @PostMapping(value = "/full", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<RecipeDetailResponse>> createFull(
            @Valid @RequestPart("recipe") RecipeCreateRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image,
            Authentication authentication
    ) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", service.createRecipe(request, image, resolveUserId(authentication))));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Recipe>> create(@RequestBody Recipe entity) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Created", service.save(entity)));
    }

    private Long resolveUserId(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            return null;
        }
        return user.getId();
    }
}
