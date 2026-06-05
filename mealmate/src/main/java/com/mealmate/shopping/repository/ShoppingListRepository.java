package com.mealmate.shopping.repository;

import com.mealmate.shopping.model.ShoppingList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ShoppingListRepository extends JpaRepository<ShoppingList, Long> {

    Optional<ShoppingList> findTopByFamily_IdOrderByCreatedDateDescCreatedAtDesc(Long familyId);
}
