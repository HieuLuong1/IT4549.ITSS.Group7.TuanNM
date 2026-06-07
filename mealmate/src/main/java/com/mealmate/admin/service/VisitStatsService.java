package com.mealmate.admin.service;

import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Service
public class VisitStatsService {

    private final Map<LocalDate, AtomicLong> visitsByDate = new ConcurrentHashMap<>();

    public void recordVisit() {
        visitsByDate.computeIfAbsent(LocalDate.now(), ignored -> new AtomicLong()).incrementAndGet();
    }

    public List<Map<String, Object>> getLastSevenDays() {
        List<Map<String, Object>> visits = new ArrayList<>();
        LocalDate today = LocalDate.now();
        Locale vietnamese = new Locale("vi", "VN");

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            String dayName = date.getDayOfWeek().getDisplayName(TextStyle.SHORT, vietnamese);
            long count = visitsByDate.getOrDefault(date, new AtomicLong(0)).get();
            visits.add(Map.of("name", dayName, "users", count));
        }

        return visits;
    }
}
