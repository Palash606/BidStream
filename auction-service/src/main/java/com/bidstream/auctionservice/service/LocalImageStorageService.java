package com.bidstream.auctionservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
public class LocalImageStorageService implements ImageStorageService {

    private final Path uploadLocation;

    public LocalImageStorageService(@Value("${app.upload.dir:uploads/products}") String uploadDir) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.uploadLocation);
        } catch (Exception ex) {
            log.error("Could not create upload directory", ex);
            throw new RuntimeException("Could not create upload directory!", ex);
        }
    }

    @Override
    public String saveImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("Failed to store empty file.");
        }

        String originalFilename = StringUtils
                .cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg");
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }

        String newFilename = UUID.randomUUID().toString() + extension;

        try {
            if (newFilename.contains("..")) {
                throw new RuntimeException(
                        "Cannot store file with relative path outside current directory " + newFilename);
            }
            Path targetLocation = this.uploadLocation.resolve(newFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // Return the path that the WebMvcConfigurer will use to serve it
            return "/images/products/" + newFilename;
        } catch (IOException ex) {
            log.error("Could not store file {}. Please try again!", newFilename, ex);
            throw new RuntimeException("Could not store file " + newFilename + ". Please try again!", ex);
        }
    }

    @Async
    @Override
    public CompletableFuture<List<String>> saveImagesAsync(List<MultipartFile> files) {
        List<String> uploadedUrls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (!file.isEmpty()) {
                try {
                    uploadedUrls.add(saveImage(file));
                } catch (IOException e) {
                    log.error("Async upload failed for file", e);
                    // We throw a runtime exception so that the CompletableFuture fails
                    throw new RuntimeException("Image upload failed", e);
                }
            }
        }
        return CompletableFuture.completedFuture(uploadedUrls);
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith("/images/products/"))
            return;
        String filename = imageUrl.substring("/images/products/".length());
        try {
            Path file = uploadLocation.resolve(filename).normalize();
            Files.deleteIfExists(file);
        } catch (IOException ex) {
            log.error("Could not delete file: {}", filename, ex);
        }
    }
}
