package in.main.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    private static final Logger logger = LoggerFactory.getLogger(FileStorageServiceImpl.class);

    // Folder where files are stored - configurable via properties
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Override
    public String save(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            logger.debug("FileStorageService: File is null or empty, skipping save");
            return null;
        }

        try {
            String contentType = file.getContentType();
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            
            logger.debug("FileStorageService: Processing file: {}", originalFileName);
            logger.debug("FileStorageService: Content type: {}", contentType);
            logger.debug("FileStorageService: File size: {} bytes", file.getSize());
            
            // Validate content type for images (only if content type is provided)
            if (contentType != null && !contentType.isEmpty()) {
                String lowerContentType = contentType.toLowerCase();
                // Allow common image types and also accept octet-stream (generic binary) as some browsers send this
                if (!lowerContentType.startsWith("image/") && !lowerContentType.equals("application/octet-stream")) {
                    logger.error("FileStorageService: Invalid content type: {}", contentType);
                    throw new RuntimeException("Invalid file type. Please upload an image file (JPEG, PNG, GIF, WebP)");
                }
                logger.debug("FileStorageService: Content type validation passed");
            }

            // Ensure uploads directory exists with absolute path
            Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            logger.debug("FileStorageService: Upload directory path: {}", uploadPath);
            
            if (!Files.exists(uploadPath)) {
                logger.info("FileStorageService: Creating uploads directory...");
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename - handle null/empty filename
            String safeFileName = (originalFileName != null && !originalFileName.isEmpty()) 
                ? originalFileName 
                : "upload_" + System.currentTimeMillis();
            String fileName = UUID.randomUUID().toString() + "_" + safeFileName;
            logger.debug("FileStorageService: Generated filename: {}", fileName);

            // Save file
            Path filePath = uploadPath.resolve(fileName);
            logger.debug("FileStorageService: Saving to: {}", filePath);
            Files.copy(file.getInputStream(), filePath);
            
            // Verify file was saved
            if (Files.exists(filePath)) {
                logger.info("FileStorageService: File saved successfully! Size: {} bytes", Files.size(filePath));
            } else {
                logger.error("FileStorageService: File save failed - file does not exist after save");
                throw new RuntimeException("Failed to save file - file not created");
            }

            // RETURN ONLY FILENAME (IMPORTANT)
            return fileName;

        } catch (IOException e) {
            logger.error("FileStorageService: Failed to store file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    @Override
    public String saveForTicket(MultipartFile file, Long ticketId) throws Exception {
        if (file == null || file.isEmpty()) return null;

        try {
            String contentType = file.getContentType();
            // Content type whitelist
            String[] allowed = new String[] {"image/png", "image/jpeg", "image/gif", "application/pdf", "text/plain", "application/zip"};
            boolean ok = false;
            if (contentType != null) {
                for (String a : allowed) if (a.equalsIgnoreCase(contentType)) { ok = true; break; }
            }
            if (!ok) {
                throw new IOException("Unsupported file type: " + contentType);
            }

            Path ticketDir = Paths.get(uploadDir).toAbsolutePath().normalize().resolve("tickets").resolve(String.valueOf(ticketId));
            if (!Files.exists(ticketDir)) Files.createDirectories(ticketDir);

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String stored = UUID.randomUUID().toString() + "_" + originalFileName;
            Path target = ticketDir.resolve(stored);
            Files.copy(file.getInputStream(), target);

            logger.info("Ticket file saved: tickets/{}/{}", ticketId, stored);
            // Return relative path: tickets/{ticketId}/{stored}
            return "tickets/" + ticketId + "/" + stored;
        } catch (IOException e) {
            logger.error("Failed to store ticket file: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to store ticket file: " + e.getMessage(), e);
        }
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String storedPath) throws Exception {
        if (storedPath == null) return null;
        Path full = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(storedPath);
        org.springframework.core.io.Resource res = new org.springframework.core.io.UrlResource(full.toUri());
        if (res.exists()) return res;
        return null;
    }
}