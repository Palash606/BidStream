package com.bidstream.auctionservice.service;

import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ImageStorageService {
    /**
     * Uploads a single image.
     * @param file the image file to upload
     * @return the unique URL/path to the stored image
     */
    String saveImage(MultipartFile file) throws IOException;

    /**
     * Uploads multiple images asynchronously.
     * @param files the list of image files to upload
     * @return a CompletableFuture containing the list of uploaded image URLs
     */
    CompletableFuture<List<String>> saveImagesAsync(List<MultipartFile> files);

    /**
     * Deletes an image by its URL or identifier.
     * @param imageUrl the URL/path of the image to delete
     */
    void deleteImage(String imageUrl);
}
