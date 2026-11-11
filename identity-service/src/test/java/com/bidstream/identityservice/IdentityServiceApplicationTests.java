package com.bidstream.identityservice;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
@Disabled("Requires live PostgreSQL, Redis, and Eureka server")
class IdentityServiceApplicationTests {

    @Test
    void contextLoads() {
    }

}
