package com.sistema.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI monitoriaOpenAPI() {
        final String schemeName = "bearerAuth";
        return new OpenAPI()
                .addSecurityItem(new SecurityRequirement().addList(schemeName))
                .components(new Components()
                        .addSecuritySchemes(schemeName, new SecurityScheme()
                                .name(schemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")))
                .info(new Info()
                        .title("API de Monitoria Acadêmica UFPR")
                        .description("API REST para gerenciamento de cursos, matérias, usuários, vagas de monitoria, candidaturas, monitores, horários de atendimento e registros de atividades.")
                        .version("v1")
                        .contact(new Contact()
                                .name("Equipe Monitoria UFPR")
                                .email("suporte@monitoria.ufpr.br"))
                        .license(new License()
                                .name("Uso acadêmico")
                                .url("https://www.ufpr.br/")));
    }
}
