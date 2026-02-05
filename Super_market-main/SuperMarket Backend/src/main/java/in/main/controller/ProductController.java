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

import in.main.entities.Product;
import in.main.service.ProductService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class ProductController {

    @Autowired
    private ProductService service;

    /* =========================
       INVENTORY (ADMIN)
       ========================= */

    @GetMapping("/admin/inventory")
    public List<Product> getProducts(@RequestParam Long userId) {
        return service.getAllProducts(userId);
    }

    @PostMapping("/admin/inventory")
    public Product addProduct(
            @RequestParam Long userId,
            @RequestBody Product product) {
        return service.addProduct(product, userId);
    }

    @PutMapping("/admin/inventory/{id}")
    public Product updateProduct(
            @PathVariable Long id,
            @RequestBody Product product) {
        return service.updateProduct(id, product);
    }

    @DeleteMapping("/admin/inventory/{id}")
    public void deleteProduct(@PathVariable Long id) {
        service.deleteProduct(id);
    }

    @PutMapping("/admin/inventory/{id}/publish")
    public Product togglePublish(@PathVariable Long id) {
        return service.togglePublish(id);
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
        // Compatibility endpoint for frontend calling /api/products
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
        return service.bulkUploadProducts(file, userId);
    }

}
