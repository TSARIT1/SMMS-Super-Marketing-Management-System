package in.main.service;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String save(MultipartFile file);

    // Save file scoped to a ticket, return stored path (ticketId/storedName)
    String saveForTicket(MultipartFile file, Long ticketId) throws Exception;

    // Load a file stored under uploads (path returned by saveForTicket)
    Resource loadAsResource(String storedPath) throws Exception;
}
