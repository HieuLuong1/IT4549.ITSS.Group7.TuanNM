package com.mealmate.user.service;

import com.mealmate.user.model.Family;
import com.mealmate.user.repository.FamilyRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FamilyService {

    private final FamilyRepository repository;

    public List<Family> findAll() {
        return repository.findAll();
    }

    public Family save(Family entity) {
        return repository.save(entity);
    }

    // Hàm lấy chi tiết gia đình theo familyId của User
    public Family findByFamilyId(Long familyId) {
        if (familyId == null) {
            throw new IllegalArgumentException("Người dùng chưa tham gia vào bất kỳ nhóm gia đình nào!");
        }
        return repository.findById(familyId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy nhóm gia đình với ID: " + familyId));
    }
}