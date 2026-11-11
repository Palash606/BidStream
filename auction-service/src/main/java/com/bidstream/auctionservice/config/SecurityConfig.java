package com.bidstream.auctionservice.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
        @Autowired
        private JwtAuthenticationFilter jwtAuthFilter;

        @Bean
        public WebSecurityCustomizer webSecurityCustomizer() {
                // This ensures the custom security filter chain does NOT intercept static
                // resources
                return (web) -> web.ignoring()
                                .requestMatchers("/images/**", "/uploads/**", "/images/products/**");
        }

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(org.springframework.security.config.Customizer.withDefaults())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**")
                                                .permitAll()
                                                .requestMatchers("/api/products/search/**", "/api/categories",
                                                                "/api/categories/all",
                                                                "/images/**",
                                                                "/ws-auction",
                                                                "/ws-auction/**")
                                                .permitAll()
                                                // Allow both ADMIN and SELLER to add categories
                                                .requestMatchers("/api/categories/add").hasAnyRole("ADMIN")
                                                .requestMatchers("/api/products/debug-auth").authenticated()
                                                .requestMatchers(org.springframework.http.HttpMethod.POST,
                                                                "/api/products", "/api/products/**")
                                                .hasAuthority("ROLE_SELLER")
                                                .requestMatchers("/api/products/{id}/**").hasAuthority("ROLE_SELLER")
                                                .anyRequest().authenticated())
                                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        public org.springframework.web.cors.CorsConfigurationSource corsConfigurationSource() {
                org.springframework.web.cors.CorsConfiguration configuration = new org.springframework.web.cors.CorsConfiguration();
                configuration.setAllowedOrigins(
                                java.util.List.of("http://localhost:5173", "http://localhost:5174",
                                                "http://localhost:5175"));
                configuration.setAllowedMethods(java.util.List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
                configuration.setAllowedHeaders(java.util.List.of("*"));
                configuration.setAllowCredentials(true);
                org.springframework.web.cors.UrlBasedCorsConfigurationSource source = new org.springframework.web.cors.UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", configuration);
                return source;
        }
}