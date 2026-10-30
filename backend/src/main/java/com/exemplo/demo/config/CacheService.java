package com.exemplo.demo.config;

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

    public void put(String key, Object value) {
        if (!properties.isEnabled()) {
            return;
        }
        try {
            String serialized = objectMapper.writeValueAsString(value);
            Duration ttl = properties.getTtl();
            redis.opsForValue().set(key, serialized, ttl);
            meters.counter("app.cache.requests", "result", "fill").increment();
        } catch (JsonProcessingException exception) {
            meters.counter("app.cache.failures", "operation", "serialize").increment();
            log.error("Could not serialize cache value for key {}", key, exception);
        } catch (Exception exception) {
            meters.counter("app.cache.failures", "operation", "write").increment();
            log.warn("Redis write failed for key {}; PostgreSQL remains the source of truth", key, exception);
        }
    }

    public void evict(String key) {
        if (!properties.isEnabled()) {
            return;
        }
        try {
            redis.delete(key);
            meters.counter("app.cache.requests", "result", "eviction").increment();
        } catch (Exception exception) {
            meters.counter("app.cache.failures", "operation", "evict").increment();
            log.warn("Redis eviction failed for key {}; stale data will expire by TTL", key, exception);
        }
    }
}
