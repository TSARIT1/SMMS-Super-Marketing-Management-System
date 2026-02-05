package in.main.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import in.main.entities.Product;

public interface ProductService {

    List<Product> getAllProducts(Long userId);

    Product addProduct(Product product, Long userId);

    Product updateProduct(Long id, Product product);

    void deleteProduct(Long id);

    Product togglePublish(Long id);

	Product getProductByBarcode(String barcode);

	List<Product> getPublishedProducts();

	List<Product> getPublishedProductsByEmail(String email);

	Product getProductByBarcodeAndEmail(String barcode, String email);

	List<Product> getPublishedProductsByUserId(Long userId);
	String generateNextProductCode(Long userId);
	Product findTopByUserIdOrderByIdDesc(Long userId);
	ResponseEntity<?> bulkUploadProducts(MultipartFile file, Long userId);

}

