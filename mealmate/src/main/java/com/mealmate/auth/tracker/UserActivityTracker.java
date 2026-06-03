package com.mealmate.auth.tracker;

import org.springframework.stereotype.Component;
import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.DayOfWeek;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

@Component
public class UserActivityTracker {

    private final List<LocalDateTime> loginTimestamps = new CopyOnWriteArrayList<>();

    @PostConstruct
    public void init() {
        // Seed some logins for the current week so that when the server starts/restarts,
        // the admin stats dashboard looks realistic with past data.
        LocalDate today = LocalDate.now();
        LocalDate monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        
        // Monday: 10 logins
        LocalDate monDate = monday;
        for (int i = 0; i < 10; i++) {
            loginTimestamps.add(monDate.atTime(8 + i, 15 + i * 3));
        }
        
        // Tuesday: 12 logins
        LocalDate tueDate = monday.plusDays(1);
        for (int i = 0; i < 12; i++) {
            loginTimestamps.add(tueDate.atTime(7 + i, 10 + i * 4));
        }
        
        // Wednesday: 9 logins
        LocalDate wedDate = monday.plusDays(2);
        for (int i = 0; i < 9; i++) {
            loginTimestamps.add(wedDate.atTime(9 + i, 5 + i * 5));
        }
    }

    public void recordVisit() {
        loginTimestamps.add(LocalDateTime.now());
    }

    public long countVisitsBetween(LocalDateTime start, LocalDateTime end) {
        return loginTimestamps.stream()
                .filter(dt -> !dt.isBefore(start) && dt.isBefore(end))
                .count();
    }
}
