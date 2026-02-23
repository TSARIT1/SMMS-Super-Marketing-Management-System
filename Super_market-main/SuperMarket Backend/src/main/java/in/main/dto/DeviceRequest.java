package in.main.dto;

import in.main.entities.Device.ConnectionType;
import in.main.entities.Device.DeviceType;

public class DeviceRequest {

    private DeviceType deviceType;
    private String deviceName;
    private String manufacturer;
    private String model;
    private String serialNumber;
    private String firmwareVersion;
    private ConnectionType connectionType;
    private String ipAddress;
    private Integer port;
    private String macAddress;
    private String bluetoothAddress;
    private String usbPort;
    private Boolean isDefault;
    private Boolean autoConnect;
    private String configuration;

    // Getters & Setters
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

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Boolean getAutoConnect() { return autoConnect; }
    public void setAutoConnect(Boolean autoConnect) { this.autoConnect = autoConnect; }

    public String getConfiguration() { return configuration; }
    public void setConfiguration(String configuration) { this.configuration = configuration; }
}