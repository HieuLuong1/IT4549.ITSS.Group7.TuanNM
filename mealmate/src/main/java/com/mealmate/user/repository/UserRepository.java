package com.mealmate.user.repository;

import com.mealmate.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    // 🎯 CẬP NHẬT HÀM NÀY: Tự động sắp xếp danh sách theo ID tăng dần (Từ nhỏ đến lớn)
    List<User> findByFamilyIdOrderByIdAsc(Long familyId); 
}