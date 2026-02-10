package com.bidstream.identityservice.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Service
public class CountryCodeService {
    private List<Map<String, String>> countryCodes;

    @PostConstruct
    public void init() throws IOException {
        ObjectMapper mapper = new ObjectMapper();
        InputStream is = getClass().getResourceAsStream("/country-codes.json");
        countryCodes = mapper.readValue(is, new TypeReference<List<Map<String, String>>>() {
        });
    }

    public List<Map<String, String>> getAllCodes() {
        return countryCodes;
    }
}