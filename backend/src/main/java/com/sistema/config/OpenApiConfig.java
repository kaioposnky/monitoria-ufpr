package com.sistema.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI monitoriaOpenAPI() {
        return new OpenAPI()
                .components(new Components())
                .info(new Info()
                        .title("API de Monitoria Acadêmica UFPR")
                        .description("API para gerenciamento de usuários e vagas de monitoria acadêmica.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Equipe Monitoria UFPR")
                                .email("suporte@monitoria.ufpr.br"))
                        .license(new License()
                                .name("Uso acadêmico")
                                .url("https://www.ufpr.br/")));
    }
}
