package com.bidstream.identityservice.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Map;

@Component
public class JsonReaderUtil {

    private final ObjectMapper objectMapper = new ObjectMapper();

    public List<Map<String, String>> readCountryCodes(String fileName) throws IOException {
        try (InputStream inputStream = getClass().getResourceAsStream("/" + fileName)) {
            if (inputStream == null) {
                throw new IOException("File not found: " + fileName);
            }
            return objectMapper.readValue(inputStream, new TypeReference<List<Map<String, String>>>() {
            });
        }
    }
}