package com.mealmate.user.repository;

import com.mealmate.user.model.Family;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FamilyRepository extends JpaRepository<Family, Long> {
    // Hàm findById đã được kế thừa sẵn từ JpaRepository, không cần khai báo lại
}