package com.bidstream.auctionservice.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
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
@Service("fileSystemStorageService")
@Primary
public class FileSystemStorageService implements ImageStorageService {

    /** Absolute path to the directory where product images are stored. */
    private final Path uploadRoot;

    /** Base URL prefix exposed by WebConfig static resource handler. */
    private static final String URL_PREFIX = "/images/products/";

    // Allowed MIME types – reject anything that isn't an image
    private static final List<String> ALLOWED_CONTENT_TYPES = List.of(
            "image/jpeg", "image/png", "image/gif", "image/webp");

    public FileSystemStorageService(
            @Value("${app.upload.dir:uploads/products}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
        initDirectory();
    }

    // ── Public API ─────────────────────────────────────────────────────────────

    /**
     * Saves a single {@link MultipartFile} to disk and returns its accessible URL.
     *
     * @param file the uploaded file (must not be empty)
     * @return URL path that can be served directly by the static resource handler
     * @throws IOException              if the file cannot be written to disk
     * @throws IllegalArgumentException if the file is empty or has a disallowed
     *                                  type
     */
    @Override
    public String saveImage(MultipartFile file) throws IOException {
        validateFile(file);

        String extension = extractExtension(
                StringUtils.cleanPath(file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg"));
        String uniqueFilename = UUID.randomUUID() + extension;

        Path targetPath = uploadRoot.resolve(uniqueFilename).normalize();

        // Guard against path traversal
        if (!targetPath.startsWith(uploadRoot)) {
            throw new SecurityException("Attempted path traversal in filename: " + uniqueFilename);
        }

        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.debug("Saved image {} ({} bytes) to {}", uniqueFilename, file.getSize(), targetPath);

        return URL_PREFIX + uniqueFilename;
    }

    @Async
    @Override
    public CompletableFuture<List<String>> saveImagesAsync(List<MultipartFile> files) {
        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file == null || file.isEmpty())
                continue;
            try {
                urls.add(saveImage(file));
            } catch (IOException e) {
                log.error("Failed to save image: {}", file.getOriginalFilename(), e);
                throw new RuntimeException("Image upload failed for file: " + file.getOriginalFilename(), e);
            }
        }
        return CompletableFuture.completedFuture(urls);
    }

    @Override
    public void deleteImage(String imageUrl) {
        if (imageUrl == null || !imageUrl.startsWith(URL_PREFIX))
            return;
        String filename = imageUrl.substring(URL_PREFIX.length());
        Path filePath = uploadRoot.resolve(filename).normalize();

        if (!filePath.startsWith(uploadRoot)) {
            log.warn("Blocked attempt to delete file outside upload root: {}", filename);
            return;
        }

        try {
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted)
                log.debug("Deleted image: {}", filename);
        } catch (IOException e) {
            log.error("Could not delete image {}: {}", filename, e.getMessage());
        }
    }

    private void initDirectory() {
        try {
            Files.createDirectories(uploadRoot);
            log.info("Image upload directory initialized at: {}", uploadRoot);
        } catch (IOException e) {
            throw new RuntimeException("Cannot initialize image storage directory: " + uploadRoot, e);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Cannot store an empty file");
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "File type not allowed: " + contentType + ". Accepted types: jpeg, png, gif, webp");
        }
        // 10 MB per-file guard (aligned with multipart config in application.yml)
        if (file.getSize() > 10L * 1024 * 1024) {
            throw new IllegalArgumentException("File size exceeds the 10 MB limit");
        }
    }

    private String extractExtension(String filename) {
        int dot = filename.lastIndexOf('.');
        return dot > 0 ? filename.substring(dot).toLowerCase() : ".jpg";
    }
}
