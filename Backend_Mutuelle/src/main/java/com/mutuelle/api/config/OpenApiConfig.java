package com.mutuelle.api.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springdoc.core.models.GroupedOpenApi;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API Mutuelle")
                        .version("1.0.0")
                        .description("Documentation interactive des API pour l'application Mutuelle"));
    }

    @Bean
    public GroupedOpenApi allApi() {
        return GroupedOpenApi.builder()
                .group("Tous")
                .pathsToMatch("/api/**")
                .build();
    }

    @Bean
    public GroupedOpenApi secretaireGeneralApi() {
        return GroupedOpenApi.builder()
                .group("Secretaire_General")
                .pathsToMatch("/api/membres/**", "/api/parametres/**")
                .build();
    }

    @Bean
    public GroupedOpenApi authenticationApi() {
        return GroupedOpenApi.builder()
                .group("Authentification")
                .pathsToMatch("/api/auth/**")
                .build();
    }

    @Bean
    public GroupedOpenApi postesApi() {
        return GroupedOpenApi.builder()
                .group("Postes")
                .pathsToMatch("/api/postes/**")
                .build();
    }
}
