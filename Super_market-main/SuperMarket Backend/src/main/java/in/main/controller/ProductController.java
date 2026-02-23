package in.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import in.main.entities.AuditLog.ActionType;
import in.main.entities.AuditLog.EntityType;
import in.main.entities.Product;
import in.main.entities.User;
import in.main.repository.UserRepository;
import in.main.service.AuditLogService;
import in.main.service.ProductService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8081", "http://localhost:8082", "https://smms.tsaritservices.com"}, allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductService service;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private UserRepository userRepository;

    private User resolveUser(Long userId) {
        if (userId == null) return null;
        return userRepository.findById(userId).orElse(null);
    }

    /* =========================
       INVENTORY (ADMIN)
       ========================= */

    @GetMapping("/admin/inventory")
    public List<Product> getProducts(@RequestParam Long userId) {
        List<Product> products = service.getAllProducts(userId);
        try {
            User user = resolveUser(userId);
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_VIEW, EntityType.INVENTORY,
                    "Viewed inventory (" + products.size() + " items)"
                );
            }
        } catch (Exception ignored) {}
        return products;
    }

    @PostMapping("/admin/inventory")
    public Product addProduct(
            @RequestParam Long userId,
            @RequestBody Product product) {
        Product saved = service.addProduct(product, userId);
        try {
            User user = resolveUser(userId);
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_CREATE, EntityType.PRODUCT, saved.getId(),
                    "Added product: " + saved.getName() + " | Price: \u20b9" + saved.getPrice()
                        + " | Qty: " + saved.getQuantity() + " | Barcode: " + (saved.getBarcode() != null ? saved.getBarcode() : "N/A")
                );
            }
        } catch (Exception ignored) {}
        return saved;
    }

    @PutMapping("/admin/inventory/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product,
            @RequestParam(required = false) Long userId) {
        Product updated = service.updateProduct(id, product);
        try {
            User user = resolveUser(userId);
            if (user == null && updated.getUser() != null) user = updated.getUser();
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_UPDATE, EntityType.PRODUCT, id,
                    "Updated product: " + updated.getName() + " | Price: \u20b9" + updated.getPrice() + " | Qty: " + updated.getQuantity()
                );
            }
        } catch (Exception ignored) {}
        return updated;
    }

    @DeleteMapping("/admin/inventory/{id}")
    public void deleteProduct(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        try {
            User user = resolveUser(userId);
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_DELETE, EntityType.PRODUCT, id,
                    "Deleted product ID: " + id
                );
            }
        } catch (Exception ignored) {}
        service.deleteProduct(id);
    }

    @PutMapping("/admin/inventory/{id}/publish")
    public Product togglePublish(@PathVariable Long id, @RequestParam(required = false) Long userId) {
        Product toggled = service.togglePublish(id);
        try {
            User user = resolveUser(userId);
            if (user != null) {
        String status = Boolean.TRUE.equals(toggled.getPublished()) ? "Published" : "Unpublished";
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_UPDATE, EntityType.PRODUCT, id,
                    status + " product: " + toggled.getName()
                );
            }
        } catch (Exception ignored) {}
        return toggled;
    }

    @GetMapping("/shop/products")
    public List<Product> getPublishedProducts(
            @RequestParam(required = false) Long userId) {
        Long uid = userId;
        if (uid == null) {
            try {
                var auth = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
                if (auth != null) {
                    Object principal = auth.getPrincipal();
                    if (principal instanceof Long) uid = (Long) principal;
                    if (principal instanceof String) uid = Long.valueOf((String) principal);
                }
            } catch (Exception ignored) {}
        }
        return service.getPublishedProductsByUserId(uid);
    }

    @GetMapping("/products")
    public List<Product> getPublishedProductsCompat() {
        return getPublishedProducts(null);
    }

    @GetMapping("/shop/products/barcode/{barcode}")
    public Product getProductByBarcode(
            @PathVariable String barcode,
            @RequestParam String email) {
        return service.getProductByBarcodeAndEmail(barcode, email);
    }

    @PostMapping("/admin/inventory/bulk-upload")
    public ResponseEntity<?> bulkUploadProducts(
            @RequestParam("file") MultipartFile file,
            @RequestParam Long userId) {
        ResponseEntity<?> result = service.bulkUploadProducts(file, userId);
        try {
            User user = resolveUser(userId);
            if (user != null) {
                auditLogService.log(
                    user.getId(), user.getFullName(), user.getRole().name(),
                    ActionType.PRODUCT_CREATE, EntityType.PRODUCT,
                    "Bulk uploaded products from file: " + file.getOriginalFilename()
                );
            }
        } catch (Exception ignored) {}
        return result;
    }

}
