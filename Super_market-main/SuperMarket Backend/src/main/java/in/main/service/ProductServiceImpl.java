package in.main.service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import in.main.entities.Product;
import in.main.entities.User;
import in.main.repository.ProductRepository;
import in.main.repository.UserRepository;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository repo;

    @Autowired
    private UserRepository userRepo;

    @Override
    public List<Product> getAllProducts(Long userId) {
        if (userId == null) {
            return new ArrayList<>();
        }
        return repo.findByUserId(userId);
    }

    @Override
    public Product addProduct(Product product, Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        product.setUser(user);
        product.setLastUpdated(LocalDate.now());
        product.setSold(0);

        // IMPORTANT: never allow null published flag
        if (product.getPublished() == null) {
            product.setPublished(false);
        }
        product.setProductCode(generateNextProductCode(userId));
        product.setUser(user);
      
        return repo.save(product);
    }

    @Override
    public Product updateProduct(Long id, Product updated) {
        Product existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setQuantity(updated.getQuantity());
        existing.setPrice(updated.getPrice());
        existing.setMinStock(updated.getMinStock());
        existing.setSupplier(updated.getSupplier());
        existing.setExpiryDate(updated.getExpiryDate());

        // Set tax rate if provided
        if (updated.getTaxRate() != null) {
            existing.setTaxRate(updated.getTaxRate());
        }

        // If net rate provided, persist it
        if (updated.getNetRate() != null) {
            existing.setNetRate(updated.getNetRate());
        }

        // FIX: Boolean-safe check (no == with null)
        if (updated.getPublished() != null) {
            existing.setPublished(updated.getPublished());
        }

        existing.setLastUpdated(LocalDate.now());
        return repo.save(existing);
    }

    @Override
    public void deleteProduct(Long id) {
        repo.deleteById(id);
    }

    @Override
    public Product togglePublish(Long id) {
        Product product = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        Boolean published = product.getPublished();
        product.setPublished(published != null && !published ? true : published == null ? true : false);

        return repo.save(product);
    }

    @Override
    public Product getProductByBarcode(String barcode) {
        return repo.findByBarcode(barcode)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }

    @Override
    public List<Product> getPublishedProducts() {
        return repo.findByPublishedTrue();
    }

    @Override
    public List<Product> getPublishedProductsByEmail(String email) {
        return repo.findByUserEmailAndPublishedTrue(email);
    }

    @Override
    public Product getProductByBarcodeAndEmail(String barcode, String email) {
        return repo.findByBarcodeAndUserEmail(barcode, email)
                .orElseThrow(() -> new RuntimeException("Product not found for this user"));
    }

    @Override
    public List<Product> getPublishedProductsByUserId(Long userId) {
        if (userId == null) {
            return new ArrayList<>();
        }
        return repo.findByUserIdAndPublishedTrue(userId);
    }
    @Override
    public String generateNextProductCode(Long userId) {
        Product lastProduct = repo.findTopByUserIdOrderByIdDesc(userId);

        int next = 1;
        if (lastProduct != null && lastProduct.getProductCode() != null) {
            next = Integer.parseInt(lastProduct.getProductCode().substring(2)) + 1;
        }

        return String.format("P-%03d", next);
    }


	@Override
	public Product findTopByUserIdOrderByIdDesc(Long userId) {
		
		return null;
	}

    @Override
    public ResponseEntity<?> bulkUploadProducts(MultipartFile file, Long userId) {
        try {
            User user = userRepo.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Removed unused variable
            int successCount = 0;
            int failCount = 0;
            List<String> errors = new ArrayList<>();

            String filename = file.getOriginalFilename();
            
            // Handle Excel files (.xlsx, .xls)
            if (filename != null && (filename.endsWith(".xlsx") || filename.endsWith(".xls"))) {
                try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
                    Sheet sheet = workbook.getSheetAt(0);
                    
                    // Skip header row, start from row 1
                    for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                        Row row = sheet.getRow(i);
                        if (row == null) continue;

                        try {
                            Product product = new Product();
                            
                            // Read columns: Name, Category, Price, Quantity, MinStock, Supplier, Barcode
                            product.setName(getCellStringValue(row, 0));
                            product.setCategory(getCellStringValue(row, 1));
                            product.setPrice(getCellNumericValue(row, 2));
                            product.setQuantity((int) getCellNumericValue(row, 3));
                            product.setMinStock((int) getCellNumericValue(row, 4));
                            product.setSupplier(getCellStringValue(row, 5));
                            product.setBarcode(getCellStringValue(row, 6));
                            
                            product.setUser(user);
                            product.setLastUpdated(LocalDate.now());
                            product.setSold(0);
                            product.setPublished(false);
                            product.setProductCode(generateNextProductCode(userId));
                            
                            repo.save(product);
                            successCount++;
                        } catch (Exception e) {
                            failCount++;
                            errors.add("Row " + (i + 1) + ": " + e.getMessage());
                        }
                    }
                }
            }
            // Handle CSV files
            else if (filename != null && filename.endsWith(".csv")) {
                try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream()))) {
                    String line;
                    int rowNum = 0;
                    
                    // Skip header
                    reader.readLine();
                    rowNum++;
                    
                    while ((line = reader.readLine()) != null) {
                        rowNum++;
                        try {
                            String[] values = line.split(",");
                            
                            Product product = new Product();
                            product.setName(values[0].trim());
                            product.setCategory(values[1].trim());
                            product.setPrice(Double.parseDouble(values[2].trim()));
                            product.setQuantity(Integer.parseInt(values[3].trim()));
                            product.setMinStock(Integer.parseInt(values[4].trim()));
                            product.setSupplier(values[5].trim());
                            product.setBarcode(values.length > 6 ? values[6].trim() : "");
                            
                            product.setUser(user);
                            product.setLastUpdated(LocalDate.now());
                            product.setSold(0);
                            product.setPublished(false);
                            product.setProductCode(generateNextProductCode(userId));
                            
                            repo.save(product);
                            successCount++;
                        } catch (Exception e) {
                            failCount++;
                            errors.add("Row " + rowNum + ": " + e.getMessage());
                        }
                    }
                }
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Unsupported file format. Please upload .xlsx, .xls, or .csv"));
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Bulk upload completed");
            response.put("successCount", successCount);
            response.put("failCount", failCount);
            if (!errors.isEmpty() && errors.size() <= 10) {
                response.put("errors", errors);
            } else if (!errors.isEmpty()) {
                response.put("errors", errors.subList(0, 10));
                response.put("note", "Showing first 10 errors only");
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to process file: " + e.getMessage()));
        }
    }

    private String getCellStringValue(Row row, int cellIndex) {
        try {
            if (row.getCell(cellIndex) == null) return "";
            return row.getCell(cellIndex).getStringCellValue();
        } catch (Exception e) {
            try {
                return String.valueOf((int) row.getCell(cellIndex).getNumericCellValue());
            } catch (Exception ex) {
                return "";
            }
        }
    }

    private double getCellNumericValue(Row row, int cellIndex) {
        try {
            if (row.getCell(cellIndex) == null) return 0;
            return row.getCell(cellIndex).getNumericCellValue();
        } catch (Exception e) {
            try {
                return Double.parseDouble(row.getCell(cellIndex).getStringCellValue());
            } catch (Exception ex) {
                return 0;
            }
        }
    }

}
