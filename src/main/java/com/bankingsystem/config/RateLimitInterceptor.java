package com.bankingsystem.config;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class RateLimitInterceptor implements HandlerInterceptor {
    private static final int MAX_REQUESTS = 100;
    // AtomicInteger for thread-safe increments; window resets every minute
    private final Map<String, AtomicInteger> requestCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {

        String ip = request.getRemoteAddr();
        AtomicInteger count = requestCounts.computeIfAbsent(ip, k -> new AtomicInteger(0));

        if (count.get() >= MAX_REQUESTS) {
            response.setStatus(429);
            return false;
        }

        count.incrementAndGet();
        return true;
    }

    // Reset all counters every 60 seconds so clients are never permanently locked out
    @Scheduled(fixedRate = 60_000)
    public void resetCounts() {
        requestCounts.clear();
    }

}
