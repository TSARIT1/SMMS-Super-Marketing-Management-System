package in.main.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;

@Entity
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DeviceType deviceType;

    @Column(nullable = false)
    private String deviceName;

    private String manufacturer;
    private String model;
    private String serialNumber;
    private String firmwareVersion;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ConnectionType connectionType;

    private String ipAddress;
    private Integer port;
    private String macAddress;
    private String bluetoothAddress;
    private String usbPort;

    @Enumerated(EnumType.STRING)
    private DeviceStatus status = DeviceStatus.OFFLINE;

    private Boolean isDefault = false;
    private Boolean autoConnect = true;

    @Column(length = 2000)
    private String configuration; // JSON string for device-specific configuration

    private LocalDateTime lastConnected;
    private LocalDateTime lastDisconnected;

    private String errorMessage;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Device Type Enum
    public enum DeviceType {
        PRINTER_THERMAL("Thermal Printer", "printer"),
        PRINTER_INKJET("Inkjet Printer", "printer"),
        PRINTER_LASER("Laser Printer", "printer"),
        PRINTER_DOT_MATRIX("Dot Matrix Printer", "printer"),
        PRINTER_LABEL("Label Printer", "printer"),
        SCANNER_BARCODE("Barcode Scanner", "scanner"),
        SCANNER_DOCUMENT("Document Scanner", "scanner"),
        SCANNER_QR("QR Code Scanner", "scanner"),
        CAMERA_SECURITY("Security Camera", "camera"),
        CAMERA_WEBCAM("Webcam", "camera"),
        CAMERA_DOCUMENT("Document Camera", "camera"),
        CASH_DRAWER("Cash Drawer", "cash"),
        CUSTOMER_DISPLAY("Customer Display", "display"),
        WEIGHING_SCALE("Weighing Scale", "scale"),
        CARD_READER("Card Reader", "payment"),
        BIOMETRIC("Biometric Device", "security"),
        POS_TERMINAL("POS Terminal", "pos"),
        OTHER("Other Device", "other");

        private final String displayName;
        private final String category;

        DeviceType(String displayName, String category) {
            this.displayName = displayName;
            this.category = category;
        }

        public String getDisplayName() { return displayName; }
        public String getCategory() { return category; }
    }

    // Connection Type Enum
    public enum ConnectionType {
        USB("USB"),
        ETHERNET("Ethernet/WiFi"),
        BLUETOOTH("Bluetooth"),
        SERIAL("Serial Port"),
        PARALLEL("Parallel Port"),
        CLOUD("Cloud/API");

        private final String displayName;

        ConnectionType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    // Device Status Enum
    public enum DeviceStatus {
        ONLINE("Online"),
        OFFLINE("Offline"),
        ERROR("Error"),
        BUSY("Busy"),
        MAINTENANCE("Maintenance");

        private final String displayName;

        DeviceStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() { return displayName; }
    }

    // JPA Lifecycle callbacks
    @jakarta.persistence.PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @jakarta.persistence.PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public DeviceType getDeviceType() { return deviceType; }
    public void setDeviceType(DeviceType deviceType) { this.deviceType = deviceType; }

    public String getDeviceName() { return deviceName; }
    public void setDeviceName(String deviceName) { this.deviceName = deviceName; }

    public String getManufacturer() { return manufacturer; }
    public void setManufacturer(String manufacturer) { this.manufacturer = manufacturer; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getSerialNumber() { return serialNumber; }
    public void setSerialNumber(String serialNumber) { this.serialNumber = serialNumber; }

    public String getFirmwareVersion() { return firmwareVersion; }
    public void setFirmwareVersion(String firmwareVersion) { this.firmwareVersion = firmwareVersion; }

    public ConnectionType getConnectionType() { return connectionType; }
    public void setConnectionType(ConnectionType connectionType) { this.connectionType = connectionType; }

    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }

    public Integer getPort() { return port; }
    public void setPort(Integer port) { this.port = port; }

    public String getMacAddress() { return macAddress; }
    public void setMacAddress(String macAddress) { this.macAddress = macAddress; }

    public String getBluetoothAddress() { return bluetoothAddress; }
    public void setBluetoothAddress(String bluetoothAddress) { this.bluetoothAddress = bluetoothAddress; }

    public String getUsbPort() { return usbPort; }
    public void setUsbPort(String usbPort) { this.usbPort = usbPort; }

    public DeviceStatus getStatus() { return status; }
    public void setStatus(DeviceStatus status) { this.status = status; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getAutoConnect() { return autoConnect; }
    public void setAutoConnect(Boolean autoConnect) { this.autoConnect = autoConnect; }

    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }

    public LocalDateTime getLastConnected() { return lastConnected; }
    public void setLastConnected(LocalDateTime lastConnected) { this.lastConnected = lastConnected; }

    public LocalDateTime getLastDisconnected() { return lastDisconnected; }
    public void setLastDisconnected(LocalDateTime lastDisconnected) { this.lastDisconnected = lastDisconnected; }

    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}