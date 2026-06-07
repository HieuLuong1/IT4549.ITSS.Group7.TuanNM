package com.mealmate.admin.service;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class VisitTrackingFilter extends OncePerRequestFilter {

    private final VisitStatsService visitStatsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        if (shouldTrack(request)) {
            visitStatsService.recordVisit();
        }
        filterChain.doFilter(request, response);
    }

    private boolean shouldTrack(HttpServletRequest request) {
        String method = request.getMethod();
        String path = request.getRequestURI();

        return !"OPTIONS".equalsIgnoreCase(method)
                && path.startsWith("/api")
                && !path.startsWith("/api/v1/admin/stats");
    }
}
