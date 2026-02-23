package in.main.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.dto.DeviceResponse;
import in.main.entities.Device;
import in.main.entities.Device.DeviceType;
import in.main.entities.Product;
import in.main.repository.DeviceRepository;
import in.main.repository.ProductRepository;

@Service
public class ScannerService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private DeviceService deviceService;

    /**
     * Get the default barcode scanner for a user
     */
    public DeviceResponse getDefaultBarcodeScanner(String email) {
        try {
            return deviceService.getDefaultDevice(email, DeviceType.SCANNER_BARCODE);
        } catch (Exception e) {
            // Try QR scanner as fallback
            try {
                return deviceService.getDefaultDevice(email, DeviceType.SCANNER_QR);
            } catch (Exception ignored) {
                return null;
            }
        }
    }

    /**
     * Process a barcode scan - lookup product by barcode
     */
    public Product lookupProductByBarcode(String barcode, String email) {
        if (barcode == null || barcode.trim().isEmpty()) {
            return null;
        }
        
        // Clean the barcode (remove whitespace, special characters)
        String cleanBarcode = barcode.trim();
        
        // Lookup product by barcode
        Product product = productRepository.findByBarcode(cleanBarcode).orElse(null);
        
        return product;
    }

    /**
     * Process a QR code scan
     */
    public QRScanResult processQRCode(String qrData, String email) {
        QRScanResult result = new QRScanResult();
        
        if (qrData == null || qrData.trim().isEmpty()) {
            result.setValid(false);
            result.setError("Empty QR code data");
            return result;
        }
        
        // Try to determine the type of QR code
        if (qrData.startsWith("http://") || qrData.startsWith("https://")) {
            // URL QR code
            result.setType("URL");
            result.setData(qrData);
            result.setValid(true);
        } else if (qrData.matches("\\d+")) {
            // Numeric - might be a product barcode
            Product product = lookupProductByBarcode(qrData, email);
            if (product != null) {
                result.setType("PRODUCT");
                result.setProduct(product);
                result.setValid(true);
            } else {
                result.setType("BARCODE");
                result.setData(qrData);
                result.setValid(true);
            }
        } else if (qrData.startsWith("upi://")) {
            // UPI payment QR code
            result.setType("UPI");
            result.setData(qrData);
            result.setValid(true);
        } else {
            // Generic QR code
            result.setType("TEXT");
            result.setData(qrData);
            result.setValid(true);
        }
        
        return result;
    }

    /**
     * Validate scanner input (for keyboard wedge scanners)
     * This helps distinguish between manual typing and scanner input
     */
    public boolean isValidScannerInput(String input, long inputDurationMs) {
        // Scanner input is typically very fast (< 50ms for entire string)
        // Manual typing is much slower (> 200ms)
        
        if (input == null || input.isEmpty()) {
            return false;
        }
        
        // Check if input duration suggests scanner input
        if (inputDurationMs < 100 && input.length() > 4) {
            return true;
        }
        
        // Check for common barcode patterns
        // EAN-13: 13 digits
        // EAN-8: 8 digits
        // UPC-A: 12 digits
        // Code128: alphanumeric
        if (input.matches("^\\d{8}$") ||  // EAN-8
            input.matches("^\\d{12}$") || // UPC-A
            input.matches("^\\d{13}$")) { // EAN-13
            return true;
        }
        
        return false;
    }

    /**
     * Record scanner usage for audit/logging
     */
    public void recordScannerUsage(Long scannerId, String scannedData, String email) {
        Device scanner = deviceRepository.findById(scannerId).orElse(null);
        if (scanner != null) {
            // In a real implementation, this would log the scan event
            System.out.println("Scanner: " + scanner.getDeviceName() + 
                             " scanned: " + scannedData + 
                             " by user: " + email);
        }
    }

    /**
     * Inner class for QR scan results
     */
    public static class QRScanResult {
        private boolean valid;
        private String type;  // URL, PRODUCT, BARCODE, UPI, TEXT
        private String data;
        private Product product;
        private String error;

        public boolean isValid() { return valid; }
        public void setValid(boolean valid) { this.valid = valid; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public String getData() { return data; }
        public void setData(String data) { this.data = data; }

        public Product getProduct() { return product; }
        public void setProduct(Product product) { this.product = product; }

        public String getError() { return error; }
        public void setError(String error) { this.error = error; }
    }
}