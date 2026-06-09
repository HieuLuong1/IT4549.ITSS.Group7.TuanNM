package com.mealmate.catalog.service;

import com.mealmate.catalog.model.PreservationMethod;
import com.mealmate.catalog.model.dto.PreservationMethodResponse;
import com.mealmate.catalog.repository.PreservationMethodRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PreservationMethodService {

    private final PreservationMethodRepository repository;

    public List<PreservationMethod> findAll() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public List<PreservationMethodResponse> findByFoodId(Long foodId) {
        return repository.findByFood_IdOrderByIdAsc(foodId)
                .stream()
                .map(method -> new PreservationMethodResponse(
                        method.getId(),
                        method.getFood() != null ? method.getFood().getId() : null,
                        method.getContent(),
                        method.getReferenceSource()
                ))
                .toList();
    }

    public PreservationMethod save(PreservationMethod entity) {
        return repository.save(entity);
    }
}
