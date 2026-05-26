package com.mealmate.fridge.repository;

import com.mealmate.fridge.model.FridgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FridgeItemRepository extends JpaRepository<FridgeItem, Long> {

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
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.addedDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    """)
    Long countItemsAddedToFridge(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select i.addedDate as date, count(i.id) as count
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.addedDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    group by i.addedDate
	    order by i.addedDate
	    """)
    List<DateCountProjection> countItemsAddedToFridgeByDate(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select c.id as categoryId, c.name as categoryName, count(i.id) as count
	    from FridgeItem i
	    join i.food f
	    left join f.category c
	    where i.family.id = :familyId
	      and i.addedDate between :from and :to
	      and (:categoryId is null or c.id = :categoryId)
	    group by c.id, c.name
	    """)
    List<CategoryCountProjection> countItemsAddedToFridgeByCategory(
	    @Param("familyId") Long familyId,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select c.id as categoryId, c.name as categoryName, count(i.id) as count
	    from FridgeItem i
	    join i.food f
	    left join f.category c
	    where i.family.id = :familyId
	      and i.status = :status
	      and i.updatedAt >= :from
	      and i.updatedAt < :to
	      and (:categoryId is null or c.id = :categoryId)
	    group by c.id, c.name
	    """)
    List<CategoryCountProjection> countByStatusAndUpdatedAtByCategory(
	    @Param("familyId") Long familyId,
	    @Param("status") String status,
	    @Param("from") LocalDateTime from,
	    @Param("to") LocalDateTime to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select count(i.id)
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.status = :status
	      and i.expiryDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    """)
    Long countByStatusAndExpiryDateRange(
	    @Param("familyId") Long familyId,
	    @Param("status") String status,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select i.expiryDate as date, count(i.id) as count
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.status = :status
	      and i.expiryDate between :from and :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    group by i.expiryDate
	    order by i.expiryDate
	    """)
    List<DateCountProjection> countByStatusAndExpiryDateGroup(
	    @Param("familyId") Long familyId,
	    @Param("status") String status,
	    @Param("from") LocalDate from,
	    @Param("to") LocalDate to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select count(i.id)
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.status = :status
	      and i.updatedAt >= :from
	      and i.updatedAt < :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    """)
    Long countByStatusAndUpdatedAtRange(
	    @Param("familyId") Long familyId,
	    @Param("status") String status,
	    @Param("from") LocalDateTime from,
	    @Param("to") LocalDateTime to,
	    @Param("categoryId") Long categoryId
    );

    @Query("""
	    select function('date', i.updatedAt) as date, count(i.id) as count
	    from FridgeItem i
	    where i.family.id = :familyId
	      and i.status = :status
	      and i.updatedAt >= :from
	      and i.updatedAt < :to
	      and (:categoryId is null or i.food.category.id = :categoryId)
	    group by function('date', i.updatedAt)
	    order by function('date', i.updatedAt)
	    """)
    List<DateCountProjection> countByStatusAndUpdatedAtGroup(
	    @Param("familyId") Long familyId,
	    @Param("status") String status,
	    @Param("from") LocalDateTime from,
	    @Param("to") LocalDateTime to,
	    @Param("categoryId") Long categoryId
    );
}
