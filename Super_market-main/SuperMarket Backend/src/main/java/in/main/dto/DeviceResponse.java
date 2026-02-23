package in.main.dto;

import java.time.LocalDateTime;

import in.main.entities.Device.ConnectionType;
import in.main.entities.Device.DeviceStatus;
import in.main.entities.Device.DeviceType;

public class DeviceResponse {

    private Long id;
    private Long userId;
    private String userName;
    private DeviceType deviceType;
    private String deviceTypeDisplayName;
    private String deviceCategory;
    private String deviceName;
    private String manufacturer;
    private String model;
    private String serialNumber;
    private String firmwareVersion;
    private ConnectionType connectionType;
    private String connectionTypeDisplayName;
    private String ipAddress;
    private Integer port;
    private String macAddress;
    private String bluetoothAddress;
    private String usbPort;
    private DeviceStatus status;
    private String statusDisplayName;
    private Boolean isDefault;
    private Boolean autoConnect;
    private String configuration;
    private LocalDateTime lastConnected;
    private LocalDateTime lastDisconnected;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public DeviceType getDeviceType() { return deviceType; }
    public void setDeviceType(DeviceType deviceType) { this.deviceType = deviceType; }

    public String getDeviceTypeDisplayName() { return deviceTypeDisplayName; }
    public void setDeviceTypeDisplayName(String deviceTypeDisplayName) { this.deviceTypeDisplayName = deviceTypeDisplayName; }

    public String getDeviceCategory() { return deviceCategory; }
    public void setDeviceCategory(String deviceCategory) { this.deviceCategory = deviceCategory; }

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

    public String getConnectionTypeDisplayName() { return connectionTypeDisplayName; }
    public void setConnectionTypeDisplayName(String connectionTypeDisplayName) { this.connectionTypeDisplayName = connectionTypeDisplayName; }

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

    public String getStatusDisplayName() { return statusDisplayName; }
    public void setStatusDisplayName(String statusDisplayName) { this.statusDisplayName = statusDisplayName; }

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