package in.main.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    // Folder where files are stored
    private static final String UPLOAD_DIR = "uploads";

    @Override
    public String save(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            // Ensure uploads directory exists
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Clean filename
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());

            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + "_" + originalFileName;

            // Save file
            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            // ✅ RETURN ONLY FILENAME (IMPORTANT)
            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Failed to store file", e);
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

            Path ticketDir = Paths.get(UPLOAD_DIR).resolve("tickets").resolve(String.valueOf(ticketId));
            if (!Files.exists(ticketDir)) Files.createDirectories(ticketDir);

            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String stored = UUID.randomUUID().toString() + "_" + originalFileName;
            Path target = ticketDir.resolve(stored);
            Files.copy(file.getInputStream(), target);

            // Return relative path: tickets/{ticketId}/{stored}
            return "tickets/" + ticketId + "/" + stored;
        } catch (IOException e) {
            throw new RuntimeException("Failed to store ticket file: " + e.getMessage(), e);
        }
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String storedPath) throws Exception {
        if (storedPath == null) return null;
        Path full = Paths.get(UPLOAD_DIR).resolve(storedPath).normalize();
        org.springframework.core.io.Resource res = new org.springframework.core.io.UrlResource(full.toUri());
        if (res.exists()) return res;
        return null;
    }
}
