package com.iconstruct.controller;

import com.iconstruct.domain.Category;
import com.iconstruct.domain.ServiceType;
import com.iconstruct.repository.CategoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    public CategoryController(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<List<Category>> getAllCategories() {
        return ResponseEntity.ok(categoryRepository.findByIsActiveTrue());
    }

    @GetMapping("/by-type/{serviceType}")
    public ResponseEntity<List<Category>> getCategoriesByType(@PathVariable ServiceType serviceType) {
        return ResponseEntity.ok(categoryRepository.findByServiceTypeAndIsActiveTrue(serviceType));
    }
}
