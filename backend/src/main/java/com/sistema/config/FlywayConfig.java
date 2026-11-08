package com.sistema.config;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(name = "spring.flyway.enabled", havingValue = "true", matchIfMissing = true)
public class FlywayConfig {
    private final Flyway flyway;

    public FlywayConfig(DataSource dataSource) {
        this.flyway = Flyway.configure()
                .dataSource(dataSource)
                .locations("classpath:db/migration")
                .baselineOnMigrate(true)
                .load();
    }

    @PostConstruct
    public void migrate() {
        flyway.migrate();
    }

    @Bean
    public Flyway flyway() {
        return flyway;
    }

    @Bean
    public static BeanFactoryPostProcessor flywayDependencyConfigurer() {
        return beanFactory -> {
            ConfigurableListableBeanFactory configurableBeanFactory =
                    (ConfigurableListableBeanFactory) beanFactory;
            if (configurableBeanFactory.containsBeanDefinition("entityManagerFactory")) {
                configurableBeanFactory.getBeanDefinition("entityManagerFactory").setDependsOn("flyway");
            }
        };
    }
}
