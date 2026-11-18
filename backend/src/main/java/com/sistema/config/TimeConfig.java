package com.sistema.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.time.Clock;
import java.time.ZoneId;

@Configuration
public class TimeConfig {

    @Bean
    Clock systemClock() {
        return Clock.system(ZoneId.of("America/Sao_Paulo"));
    }
}
