package com.mealmate.shopping.repository;

import com.mealmate.shopping.model.ShoppingListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface ShoppingListItemRepository extends JpaRepository<ShoppingListItem, Long> {

    interface DateCountProjection {
	LocalDate getDate();

	Long getCount();
    }

    interface CategoryCountProjection {
	Long getCategoryId();

	String getCategoryName();

	Long getCount();
    }

    @Query("""
	    select count(i.id)
	    from ShoppingListItem i
	    join i.shoppingList s
	    where s.family.id = :familyId
	      and i.isPurchased = true
	      and s.createdDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    """)
    Long countPurchasedItems(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select s.createdDate as date, count(i.id) as count
	    from ShoppingListItem i
	    join i.shoppingList s
	    where s.family.id = :familyId
	      and i.isPurchased = true
	      and s.createdDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    group by s.createdDate
	    order by s.createdDate
	    """)
    List<DateCountProjection> countPurchasedItemsByDate(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select c.id as categoryId, c.name as categoryName, count(i.id) as count
	    from ShoppingListItem i
	    join i.shoppingList s
	    join i.food f
	    left join f.category c
	    where s.family.id = :familyId
	      and i.isPurchased = true
	      and s.createdDate between :from and :to
	      and (:categoryId is null or c.id = :categoryId)
	    group by c.id, c.name
	    """)
    List<CategoryCountProjection> countPurchasedItemsByCategory(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );
}
