package in.main.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import in.main.dto.DeviceResponse;
import in.main.entities.Device;
import in.main.entities.Device.DeviceType;
import in.main.entities.Order;
import in.main.entities.OrderItem;
import in.main.entities.Profile;
import in.main.repository.DeviceRepository;
import in.main.repository.OrderRepository;
import in.main.repository.ProfileRepository;

@Service
public class PrinterService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProfileRepository profileRepository;

    /**
     * Get the default printer for a user
     */
    public DeviceResponse getDefaultPrinter(String email) {
        // Try thermal printer first, then label printer
        try {
            return getDeviceService().getDefaultDevice(email, DeviceType.PRINTER_THERMAL);
        } catch (Exception e) {
            // Try other printer types
            for (DeviceType type : new DeviceType[]{
                DeviceType.PRINTER_LABEL, DeviceType.PRINTER_INKJET, 
                DeviceType.PRINTER_LASER, DeviceType.PRINTER_DOT_MATRIX
            }) {
                try {
                    return getDeviceService().getDefaultDevice(email, type);
                } catch (Exception ignored) {}
            }
        }
        return null;
    }

    /**
     * Generate ESC/POS commands for thermal printer receipt
     */
    public String generateReceiptContent(Long orderId, String email) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        Profile profile = profileRepository.findByUser_Email(email)
                .orElse(null);

        StringBuilder receipt = new StringBuilder();
        
        // ESC/POS Commands
        String ESC = "\u001B";  // Escape character
        String GS = "\u001D";   // GS character
        String INIT = ESC + "@";  // Initialize printer
        String CENTER = ESC + "a" + "\u0001";  // Center align
        String LEFT = ESC + "a" + "\u0000";  // Left align
        String BOLD_ON = ESC + "E" + "\u0001";  // Bold on
        String BOLD_OFF = ESC + "E" + "\u0000";  // Bold off
        String DOUBLE_HEIGHT = GS + "!" + "\u0010";  // Double height
        String NORMAL_SIZE = GS + "!" + "\u0000";  // Normal size
        String CUT = GS + "V" + "\u0000";  // Cut paper
        String LINE_FEED = "\n";

        // Initialize
        receipt.append(INIT);
        
        // Header - Store Name
        receipt.append(CENTER);
        receipt.append(BOLD_ON);
        receipt.append(DOUBLE_HEIGHT);
        if (profile != null && profile.getShopName() != null) {
            receipt.append(profile.getShopName());
        } else {
            receipt.append("SUPERMARKET");
        }
        receipt.append(LINE_FEED);
        receipt.append(NORMAL_SIZE);
        receipt.append(BOLD_OFF);
        
        // Store Address
        if (profile != null && profile.getShopAddress() != null) {
            receipt.append(profile.getShopAddress());
            receipt.append(LINE_FEED);
        }
        if (profile != null && profile.getPhoneNumber() != null) {
            receipt.append("Tel: ").append(profile.getPhoneNumber());
            receipt.append(LINE_FEED);
        }
        
        // Separator
        receipt.append(LEFT);
        receipt.append("----------------------------------------");
        receipt.append(LINE_FEED);
        
        // Receipt Header
        receipt.append(CENTER);
        receipt.append(BOLD_ON);
        receipt.append("RECEIPT");
        receipt.append(BOLD_OFF);
        receipt.append(LINE_FEED);
        receipt.append(LEFT);
        
        // Order Details
        receipt.append("Order No: ").append(order.getId());
        receipt.append(LINE_FEED);
        receipt.append("Date: ").append(LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));
        receipt.append(LINE_FEED);
        
        // Separator
        receipt.append("----------------------------------------");
        receipt.append(LINE_FEED);
        
        // Column Headers
        receipt.append(String.format("%-20s %5s %10s", "Item", "Qty", "Price"));
        receipt.append(LINE_FEED);
        receipt.append("----------------------------------------");
        receipt.append(LINE_FEED);
        
        // Order Items
        List<OrderItem> items = order.getOrderItems();
        if (items != null) {
            for (OrderItem item : items) {
                String itemName = item.getProductName();
                if (itemName != null && itemName.length() > 18) {
                    itemName = itemName.substring(0, 18) + "..";
                }
                int qty = item.getQuantity();
                double price = item.getPrice();
                receipt.append(String.format("%-20s %5d %10.2f", 
                    itemName != null ? itemName : "Item", qty, price * qty));
                receipt.append(LINE_FEED);
            }
        }
        
        // Separator
        receipt.append("----------------------------------------");
        receipt.append(LINE_FEED);
        
        // Totals
        double subtotal = order.getTotal();
        Double taxAmount = order.getTaxAmount();
        Double discountAmount = order.getDiscount();
        double tax = taxAmount != null ? taxAmount : 0.0;
        double discount = discountAmount != null ? discountAmount : 0.0;
        double total = subtotal + tax - discount;
        
        receipt.append(String.format("%-26s %10.2f", "Subtotal:", subtotal));
        receipt.append(LINE_FEED);
        
        if (tax > 0) {
            receipt.append(String.format("%-26s %10.2f", "Tax:", tax));
            receipt.append(LINE_FEED);
        }
        
        if (discount > 0) {
            receipt.append(String.format("%-26s %10.2f", "Discount:", discount));
            receipt.append(LINE_FEED);
        }
        
        receipt.append(BOLD_ON);
        receipt.append(String.format("%-26s %10.2f", "TOTAL:", total));
        receipt.append(BOLD_OFF);
        receipt.append(LINE_FEED);
        
        // Footer
        receipt.append(LINE_FEED);
        receipt.append(CENTER);
        receipt.append("Thank you for your purchase!");
        receipt.append(LINE_FEED);
        
        if (profile != null && profile.getTagline() != null) {
            receipt.append(profile.getTagline());
            receipt.append(LINE_FEED);
        }
        
        // GST Number
        if (profile != null && profile.getGstNumber() != null) {
            receipt.append(LEFT);
            receipt.append("GSTIN: ").append(profile.getGstNumber());
            receipt.append(LINE_FEED);
        }
        
        // Cut paper
        receipt.append(LINE_FEED);
        receipt.append(LINE_FEED);
        receipt.append(LINE_FEED);
        receipt.append(CUT);
        
        return receipt.toString();
    }

    /**
     * Generate label content for a product
     */
    public String generateLabelContent(String productName, String barcode, double price, String currency) {
        StringBuilder label = new StringBuilder();
        
        // ZPL (Zebra Programming Language) for label printers
        label.append("^XA");  // Start label
        label.append("^FO50,50^A0N,30,30^FD").append(productName).append("^FS");  // Product name
        label.append("^FO50,100^BCN,100,Y,N,N^FD").append(barcode).append("^FS");  // Barcode
        label.append("^FO50,250^A0N,40,40^FD").append(currency).append(String.format("%.2f", price)).append("^FS");  // Price
        label.append("^XZ");  // End label
        
        return label.toString();
    }

    /**
     * Print receipt to specified printer
     */
    public boolean printReceipt(Long printerId, Long orderId, String email) {
        Device printer = deviceRepository.findById(printerId)
                .orElseThrow(() -> new RuntimeException("Printer not found"));
        
        // Check if device is a printer
        if (!isPrinterType(printer.getDeviceType())) {
            throw new RuntimeException("Device is not a printer");
        }
        
        // Generate receipt content
        String content = generateReceiptContent(orderId, email);
        
        // In a real implementation, this would send the content to the printer
        // based on the connection type (USB, Network, Bluetooth, etc.)
        return sendToPrinter(printer, content);
    }

    /**
     * Print label to specified printer
     */
    public boolean printLabel(Long printerId, String productName, String barcode, double price, String email) {
        Device printer = deviceRepository.findById(printerId)
                .orElseThrow(() -> new RuntimeException("Printer not found"));
        
        // Check if device is a label printer
        if (printer.getDeviceType() != DeviceType.PRINTER_LABEL) {
            throw new RuntimeException("Device is not a label printer");
        }
        
        // Generate label content
        String content = generateLabelContent(productName, barcode, price, "₹");
        
        return sendToPrinter(printer, content);
    }

    /**
     * Send content to printer based on connection type
     */
    private boolean sendToPrinter(Device printer, String content) {
        // In a real implementation, this would handle different connection types
        // For now, we'll simulate a successful print
        
        switch (printer.getConnectionType()) {
            case USB:
                // Send to USB port
                return sendToUSB(printer.getUsbPort(), content);
            case ETHERNET:
                // Send to network printer
                return sendToNetwork(printer.getIpAddress(), printer.getPort(), content);
            case BLUETOOTH:
                // Send to Bluetooth printer
                return sendToBluetooth(printer.getBluetoothAddress(), content);
            case CLOUD:
                // Send to cloud printer service
                return sendToCloud(printer.getConfiguration(), content);
            default:
                return false;
        }
    }

    private boolean sendToUSB(String port, String content) {
        // Simulate USB printing
        // In production, use libraries like jSerialComm or javax.comm
        System.out.println("Printing to USB port: " + port);
        System.out.println("Content length: " + content.length());
        return true;
    }

    private boolean sendToNetwork(String ipAddress, Integer port, String content) {
        // Simulate network printing
        // In production, use Java Socket to connect to printer
        System.out.println("Printing to network: " + ipAddress + ":" + port);
        System.out.println("Content length: " + content.length());
        return true;
    }

    private boolean sendToBluetooth(String address, String content) {
        // Simulate Bluetooth printing
        // In production, use Bluetooth libraries
        System.out.println("Printing to Bluetooth: " + address);
        System.out.println("Content length: " + content.length());
        return true;
    }

    private boolean sendToCloud(String config, String content) {
        // Simulate cloud printing
        // In production, use cloud print APIs (Google Cloud Print, etc.)
        System.out.println("Printing to cloud");
        System.out.println("Content length: " + content.length());
        return true;
    }

    private boolean isPrinterType(DeviceType type) {
        return type == DeviceType.PRINTER_THERMAL ||
               type == DeviceType.PRINTER_INKJET ||
               type == DeviceType.PRINTER_LASER ||
               type == DeviceType.PRINTER_DOT_MATRIX ||
               type == DeviceType.PRINTER_LABEL;
    }

    // Helper method to get DeviceService (to avoid circular dependency)
    private DeviceService deviceService;
    
    @Autowired
    public void setDeviceService(DeviceService deviceService) {
        this.deviceService = deviceService;
    }
    
    private DeviceService getDeviceService() {
        return deviceService;
    }
}