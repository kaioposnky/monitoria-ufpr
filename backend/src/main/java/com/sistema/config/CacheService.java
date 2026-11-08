package com.sistema.config;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.micrometer.core.instrument.MeterRegistry;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

@Service
public class CacheService {
    private static final Logger log = LoggerFactory.getLogger(CacheService.class);

    private final StringRedisTemplate redis;
    private final ObjectMapper objectMapper;
    private final CacheProperties properties;
    private final MeterRegistry meters;

    public CacheService(
            StringRedisTemplate redis,
            ObjectMapper objectMapper,
            CacheProperties properties,
            MeterRegistry meters) {
        this.redis = redis;
        this.objectMapper = objectMapper;
        this.properties = properties;
        this.meters = meters;
    }

    public <T> Optional<T> get(String key, Class<T> type) {
        if (!properties.isEnabled()) {
            return Optional.empty();
        }
        try {
            String value = redis.opsForValue().get(key);
            if (value == null) {
                meters.counter("app.cache.requests", "result", "miss").increment();
                return Optional.empty();
            }
            meters.counter("app.cache.requests", "result", "hit").increment();
            return Optional.of(objectMapper.readValue(value, type));
        } catch (Exception exception) {
            meters.counter("app.cache.failures", "operation", "read").increment();
            log.warn("Redis read failed for key {}; falling back to PostgreSQL", key, exception);
            return Optional.empty();
        }
    }

    public void put(String key, Object payload) {
        put(key, payload, properties.getTtl());
    }

    public void put(String key, Object payload, Duration ttl) {
        if (!properties.isEnabled()) {
            return;
        }
        try {
            String json = objectMapper.writeValueAsString(payload);
            redis.opsForValue().set(key, json, ttl);
            meters.counter("app.cache.writes").increment();
        } catch (JsonProcessingException exception) {
            log.warn("Failed to serialize payload for key {}", key, exception);
        } catch (Exception exception) {
            meters.counter("app.cache.failures", "operation", "write").increment();
            log.warn("Redis write failed for key {}", key, exception);
        }
    }

    public void evict(String key) {
        if (!properties.isEnabled()) {
            return;
        }
        try {
            redis.delete(key);
            meters.counter("app.cache.evictions").increment();
        } catch (Exception exception) {
            meters.counter("app.cache.failures", "operation", "evict").increment();
            log.warn("Redis eviction failed for key {}", key, exception);
        }
    }
}
