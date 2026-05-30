package com.mealmate.user.repository;

import com.mealmate.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByFamilyIdOrderByIdAsc(Long familyId); 

    // 🎯 ĐÃ SỬA FULL: Native Query xử lý ép so sánh chuỗi cực kỳ mạnh mẽ, chống crash 500
    @Query(value = "SELECT * FROM users u WHERE u.email = :keyword OR u.phone = :keyword LIMIT 1", nativeQuery = true)
    Optional<User> findByEmailOrPhone(@Param("keyword") String keyword);
}
