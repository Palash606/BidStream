package com.bidstream.auctionservice.controller;

import com.bidstream.auctionservice.entity.Category;
import com.bidstream.auctionservice.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @PostMapping("/add")
    public ResponseEntity<Category> addCategory(@RequestBody Category category) {
        return categoryRepository.findByName(category.getName())
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok(categoryRepository.save(category)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }
}