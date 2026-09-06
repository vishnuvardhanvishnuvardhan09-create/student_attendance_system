package com.attendance.system.controller;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

/**
 * Controller handling profile photo uploads for students and faculty.
 * Saves uploaded images to local "uploads/photos/" directory and returns relative URL.
 */
@RestController
@RequestMapping("/api/upload")
public class PhotoUploadController {

    private static final Logger logger = LoggerFactory.getLogger(PhotoUploadController.class);
    private static final String UPLOAD_DIR = "uploads/photos";

    @PostMapping(value = "/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "userType", defaultValue = "student") String userType,
            @RequestParam(value = "userId", defaultValue = "0") String userId) {

        if (file.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("message", "File is empty"));
        }

        String originalFilename = StringUtils.cleanPath(
                file.getOriginalFilename() != null ? file.getOriginalFilename() : "photo.jpg"
        );

        // Basic image extension check
        String ext = "jpg";
        int dotIndex = originalFilename.lastIndexOf(".");
        if (dotIndex > 0) {
            String detectedExt = originalFilename.substring(dotIndex + 1).toLowerCase();
            if (detectedExt.equals("jpg") || detectedExt.equals("jpeg") || detectedExt.equals("png") || detectedExt.equals("webp")) {
                ext = detectedExt;
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Collections.singletonMap("message", "Invalid file extension. Allowed: jpg, jpeg, png, webp"));
            }
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String cleanType = userType.trim().toLowerCase();
            String cleanId = userId.trim().replaceAll("[^a-zA-Z0-9_-]", "");
            String filename = String.format("%s_%s_%d.%s", cleanType, cleanId, System.currentTimeMillis(), ext);

            Path targetPath = uploadPath.resolve(filename);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }

            String relativeUrl = "/uploads/photos/" + filename;
            logger.info("Successfully uploaded photo: {}", relativeUrl);

            Map<String, Object> response = new HashMap<>();
            response.put("photoUrl", relativeUrl);
            response.put("filename", filename);
            response.put("message", "Photo uploaded successfully");
            return ResponseEntity.ok(response);

        } catch (IOException e) {
            logger.error("Failed to upload photo", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Collections.singletonMap("message", "Could not save photo: " + e.getMessage()));
        }
    }
}
