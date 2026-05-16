package com.mealmate.fridge.service;

import com.mealmate.fridge.mapper.FridgeItemMapper;
import com.mealmate.fridge.model.FridgeItem;
import com.mealmate.fridge.model.FridgeItemStatus;
import com.mealmate.fridge.model.RemoveReason;
import com.mealmate.fridge.model.dto.CreateFridgeItemRequest;
import com.mealmate.fridge.model.dto.FridgeItemResponse;
import com.mealmate.fridge.model.dto.RemoveFridgeItemRequest;
import com.mealmate.fridge.model.dto.UpdateFridgeItemRequest;
import com.mealmate.fridge.repository.FridgeItemProjection;
import com.mealmate.fridge.repository.FridgeItemRepository;
import com.mealmate.user.model.User;
import jakarta.transaction.Transactional;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FridgeItemService {

    private final FridgeItemRepository fridgeItemRepository;
    private final FridgeItemMapper fridgeItemMapper;

    public FridgeItemService(
            FridgeItemRepository fridgeItemRepository,
            FridgeItemMapper fridgeItemMapper
    ) {
        this.fridgeItemRepository = fridgeItemRepository;
        this.fridgeItemMapper = fridgeItemMapper;
    }

    public List<FridgeItemResponse> getStoredItems() {
        Long familyId = getCurrentFamilyIdOrThrow();

        return fridgeItemRepository
                .findByFamilyIdAndStatusWithFoodName(familyId, FridgeItemStatus.STORED)
                .stream()
                .map(fridgeItemMapper::toResponse)
                .toList();
    }

    public List<FridgeItemResponse> searchStoredItems(String keyword, Long categoryId) {
        if ((keyword == null || keyword.trim().isEmpty()) && categoryId == null) {
            return getStoredItems();
        }

        Long familyId = getCurrentFamilyIdOrThrow();
        String normalizedKeyword = keyword == null || keyword.trim().isEmpty() ? null : keyword.trim();

        List<FridgeItemProjection> items = fridgeItemRepository.searchStoredItems(
                familyId,
                FridgeItemStatus.STORED,
                normalizedKeyword,
                categoryId
        );

        return items.stream()
                .map(fridgeItemMapper::toResponse)
                .toList();
    }

    @Transactional
    public FridgeItemResponse create(CreateFridgeItemRequest request) {
        validateCreateRequest(request);

        FridgeItem item = fridgeItemMapper.toEntity(request);
        item.setFamilyId(getCurrentFamilyIdOrThrow());
        item.setStatus(FridgeItemStatus.STORED);

        FridgeItem saved = fridgeItemRepository.save(item);
        return toDetailedResponse(saved);
    }

    @Transactional
    public FridgeItemResponse update(Long id, UpdateFridgeItemRequest request) {
        FridgeItem item = fridgeItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fridge item not found"));
        assertCurrentFamilyOwns(item);

        if (FridgeItemStatus.REMOVED.equals(item.getStatus())) {
            throw new IllegalStateException("Removed fridge item cannot be updated");
        }

        if (request.getFoodId() != null) {
            item.setFoodId(request.getFoodId());
        }
        if (request.getCustomName() != null) {
            item.setCustomName(normalizeBlank(request.getCustomName()));
        }
        if (request.getQuantity() != null) {
            item.setQuantity(request.getQuantity());
        }
        if (request.getStorageLocation() != null) {
            item.setStorageLocation(normalizeBlank(request.getStorageLocation()));
        }
        if (request.getSpecificLocation() != null) {
            item.setSpecificLocation(normalizeBlank(request.getSpecificLocation()));
        }
        if (request.getAddedDate() != null) {
            item.setAddedDate(request.getAddedDate());
        }
        if (request.getExpiryDate() != null) {
            item.setExpiryDate(request.getExpiryDate());
        }
        if (request.getImageUrl() != null) {
            item.setImageUrl(normalizeBlank(request.getImageUrl()));
        }
        if (request.getNote() != null) {
            item.setNote(normalizeBlank(request.getNote()));
        }

        FridgeItem saved = fridgeItemRepository.save(item);
        return toDetailedResponse(saved);
    }

    @Transactional
    public FridgeItemResponse remove(Long id, RemoveFridgeItemRequest request) {
        validateRemoveRequest(request);

        User currentUser = getCurrentUserOrThrow();
        FridgeItem item = fridgeItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Fridge item not found"));
        assertCurrentFamilyOwns(item);

        if (FridgeItemStatus.REMOVED.equals(item.getStatus())) {
            return toDetailedResponse(item);
        }

        item.setStatus(FridgeItemStatus.REMOVED);
        item.setRemovedReason(request.getRemovedReason());
        item.setRemovedReasonNote(normalizeBlank(request.getRemovedReasonNote()));
        item.setRemovedBy(currentUser.getId());
        item.setRemovedAt(LocalDateTime.now());

        FridgeItem saved = fridgeItemRepository.save(item);
        return toDetailedResponse(saved);
    }

    public long countStoredItems() {
        return fridgeItemRepository.countStoredByFamilyId(getCurrentFamilyIdOrThrow());
    }

    private void validateCreateRequest(CreateFridgeItemRequest request) {
        if (request.getFoodId() == null) {
            throw new IllegalArgumentException("foodId is required");
        }

        if (request.getQuantity() == null || request.getQuantity().signum() <= 0) {
            throw new IllegalArgumentException("quantity must be greater than 0");
        }
    }

    private void validateRemoveRequest(RemoveFridgeItemRequest request) {
        if (request.getRemovedReason() == null || request.getRemovedReason().trim().isEmpty()) {
            throw new IllegalArgumentException("removedReason is required");
        }

        String removedReason = request.getRemovedReason().trim();

        if (!List.of(
                RemoveReason.USED_UP,
                RemoveReason.EXPIRED_DISCARDED,
                RemoveReason.SPOILED,
                RemoveReason.WRONG_INFO,
                RemoveReason.OTHER
        ).contains(removedReason)) {
            throw new IllegalArgumentException("removedReason is invalid");
        }

        request.setRemovedReason(removedReason);

        if (RemoveReason.OTHER.equals(removedReason)
                && (request.getRemovedReasonNote() == null || request.getRemovedReasonNote().trim().isEmpty())) {
            throw new IllegalArgumentException("removedReasonNote is required when removedReason is OTHER");
        }
    }

    private FridgeItemResponse toDetailedResponse(FridgeItem item) {
        if (item.getId() == null) {
            return fridgeItemMapper.toResponse(item);
        }

        return fridgeItemRepository.findDetailedById(item.getId())
                .map(fridgeItemMapper::toResponse)
                .orElseGet(() -> fridgeItemMapper.toResponse(item));
    }

    private String normalizeBlank(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private User getCurrentUserOrThrow() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User is not authenticated");
        }

        Object principal = authentication.getPrincipal();
        if (principal instanceof User user) {
            return user;
        }

        throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authenticated user is invalid");
    }

    private Long getCurrentFamilyIdOrThrow() {
        Long familyId = getCurrentUserOrThrow().getFamilyId();
        if (familyId == null) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Current user does not belong to a family");
        }
        return familyId;
    }

    private void assertCurrentFamilyOwns(FridgeItem item) {
        Long familyId = getCurrentFamilyIdOrThrow();
        if (!familyId.equals(item.getFamilyId())) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Fridge item not found");
        }
    }
}
