package in.main.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import in.main.dto.DeviceRequest;
import in.main.dto.DeviceResponse;
import in.main.entities.Device;
import in.main.entities.Device.ConnectionType;
import in.main.entities.Device.DeviceStatus;
import in.main.entities.Device.DeviceType;
import in.main.entities.User;
import in.main.repository.DeviceRepository;
import in.main.repository.UserRepository;

@Service
public class DeviceService {

    @Autowired
    private DeviceRepository deviceRepository;

    @Autowired
    private UserRepository userRepository;

    // Get all devices for a user
    public List<DeviceResponse> getAllDevices(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Device> devices = deviceRepository.findByUser(user);
        return devices.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get device by ID
    public DeviceResponse getDeviceById(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));
        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }
        return convertToResponse(device);
    }

    // Get devices by type
    public List<DeviceResponse> getDevicesByType(String email, DeviceType deviceType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Device> devices = deviceRepository.findByUserAndDeviceType(user, deviceType);
        return devices.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get devices by category
    public List<DeviceResponse> getDevicesByCategory(String email, String category) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        List<Device> devices = deviceRepository.findByUserAndCategory(user, category);
        return devices.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Get default device for a type
    public DeviceResponse getDefaultDevice(String email, DeviceType deviceType) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findByUserAndDeviceTypeAndIsDefaultTrue(user, deviceType)
                .orElseThrow(() -> new RuntimeException("No default device found for type: " + deviceType));
        return convertToResponse(device);
    }

    // Create a new device
    @Transactional
    public DeviceResponse createDevice(DeviceRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if device name already exists for this user
        if (deviceRepository.existsByUserAndDeviceName(user, request.getDeviceName())) {
            throw new RuntimeException("Device with this name already exists");
        }

        Device device = new Device();
        device.setUser(user);
        device.setDeviceType(request.getDeviceType());
        device.setDeviceName(request.getDeviceName());
        device.setManufacturer(request.getManufacturer());
        device.setModel(request.getModel());
        device.setSerialNumber(request.getSerialNumber());
        device.setFirmwareVersion(request.getFirmwareVersion());
        device.setConnectionType(request.getConnectionType());
        device.setIpAddress(request.getIpAddress());
        device.setPort(request.getPort());
        device.setMacAddress(request.getMacAddress());
        device.setBluetoothAddress(request.getBluetoothAddress());
        device.setUsbPort(request.getUsbPort());
        device.setConfiguration(request.getConfiguration());
        device.setAutoConnect(request.getAutoConnect() != null ? request.getAutoConnect() : true);
        device.setStatus(DeviceStatus.OFFLINE);

        // Handle default device setting
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            // Unset other default devices of same type
            List<Device> sameTypeDevices = deviceRepository.findByUserAndDeviceType(user, request.getDeviceType());
            for (Device d : sameTypeDevices) {
                d.setIsDefault(false);
            }
            deviceRepository.saveAll(sameTypeDevices);
            device.setIsDefault(true);
        } else {
            device.setIsDefault(false);
        }

        device = deviceRepository.save(device);
        return convertToResponse(device);
    }

    // Update a device
    @Transactional
    public DeviceResponse updateDevice(Long id, DeviceRequest request, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }

        // Update fields
        if (request.getDeviceName() != null) {
            device.setDeviceName(request.getDeviceName());
        }
        if (request.getManufacturer() != null) {
            device.setManufacturer(request.getManufacturer());
        }
        if (request.getModel() != null) {
            device.setModel(request.getModel());
        }
        if (request.getSerialNumber() != null) {
            device.setSerialNumber(request.getSerialNumber());
        }
        if (request.getFirmwareVersion() != null) {
            device.setFirmwareVersion(request.getFirmwareVersion());
        }
        if (request.getConnectionType() != null) {
            device.setConnectionType(request.getConnectionType());
        }
        if (request.getIpAddress() != null) {
            device.setIpAddress(request.getIpAddress());
        }
        if (request.getPort() != null) {
            device.setPort(request.getPort());
        }
        if (request.getMacAddress() != null) {
            device.setMacAddress(request.getMacAddress());
        }
        if (request.getBluetoothAddress() != null) {
            device.setBluetoothAddress(request.getBluetoothAddress());
        }
        if (request.getUsbPort() != null) {
            device.setUsbPort(request.getUsbPort());
        }
        if (request.getConfiguration() != null) {
            device.setConfiguration(request.getConfiguration());
        }
        if (request.getAutoConnect() != null) {
            device.setAutoConnect(request.getAutoConnect());
        }

        // Handle default device setting
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            List<Device> sameTypeDevices = deviceRepository.findByUserAndDeviceType(user, device.getDeviceType());
            for (Device d : sameTypeDevices) {
                if (!d.getId().equals(id)) {
                    d.setIsDefault(false);
                }
            }
            deviceRepository.saveAll(sameTypeDevices);
            device.setIsDefault(true);
        }

        device = deviceRepository.save(device);
        return convertToResponse(device);
    }

    // Delete a device
    @Transactional
    public void deleteDevice(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }

        deviceRepository.delete(device);
    }

    // Update device status
    @Transactional
    public DeviceResponse updateDeviceStatus(Long id, DeviceStatus status, String errorMessage, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }

        device.setStatus(status);
        device.setErrorMessage(errorMessage);

        if (status == DeviceStatus.ONLINE) {
            device.setLastConnected(LocalDateTime.now());
        } else if (status == DeviceStatus.OFFLINE) {
            device.setLastDisconnected(LocalDateTime.now());
        }

        device = deviceRepository.save(device);
        return convertToResponse(device);
    }

    // Set default device
    @Transactional
    public DeviceResponse setDefaultDevice(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }

        // Unset other default devices of same type
        List<Device> sameTypeDevices = deviceRepository.findByUserAndDeviceType(user, device.getDeviceType());
        for (Device d : sameTypeDevices) {
            d.setIsDefault(false);
        }
        deviceRepository.saveAll(sameTypeDevices);

        device.setIsDefault(true);
        device = deviceRepository.save(device);
        return convertToResponse(device);
    }

    // Test device connection
    public DeviceResponse testDeviceConnection(Long id, String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Device not found"));

        if (!device.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized access to device");
        }

        // Simulate connection test based on connection type
        boolean connectionSuccessful = testConnection(device);

        if (connectionSuccessful) {
            device.setStatus(DeviceStatus.ONLINE);
            device.setLastConnected(LocalDateTime.now());
            device.setErrorMessage(null);
        } else {
            device.setStatus(DeviceStatus.ERROR);
            device.setErrorMessage("Connection test failed");
        }

        device = deviceRepository.save(device);
        return convertToResponse(device);
    }

    // Get device statistics
    public DeviceStatsResponse getDeviceStats(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        List<Device> devices = deviceRepository.findByUser(user);
        
        long totalDevices = devices.size();
        long onlineDevices = devices.stream().filter(d -> d.getStatus() == DeviceStatus.ONLINE).count();
        long offlineDevices = devices.stream().filter(d -> d.getStatus() == DeviceStatus.OFFLINE).count();
        long errorDevices = devices.stream().filter(d -> d.getStatus() == DeviceStatus.ERROR).count();
        
        long printerCount = devices.stream().filter(d -> d.getDeviceType().getCategory().equals("printer")).count();
        long scannerCount = devices.stream().filter(d -> d.getDeviceType().getCategory().equals("scanner")).count();
        long cameraCount = devices.stream().filter(d -> d.getDeviceType().getCategory().equals("camera")).count();
        long otherCount = devices.stream().filter(d -> d.getDeviceType().getCategory().equals("other")).count();

        DeviceStatsResponse stats = new DeviceStatsResponse();
        stats.setTotalDevices(totalDevices);
        stats.setOnlineDevices(onlineDevices);
        stats.setOfflineDevices(offlineDevices);
        stats.setErrorDevices(errorDevices);
        stats.setPrinterCount(printerCount);
        stats.setScannerCount(scannerCount);
        stats.setCameraCount(cameraCount);
        stats.setOtherCount(otherCount);
        
        return stats;
    }

    // Helper method to test device connection
    private boolean testConnection(Device device) {
        // In a real implementation, this would actually test the connection
        // based on the connection type (USB, Network, Bluetooth, etc.)
        // For now, we'll simulate a successful connection for network devices
        // if an IP address is provided
        
        if (device.getConnectionType() == ConnectionType.ETHERNET) {
            return device.getIpAddress() != null && !device.getIpAddress().isEmpty();
        } else if (device.getConnectionType() == ConnectionType.USB) {
            return device.getUsbPort() != null && !device.getUsbPort().isEmpty();
        } else if (device.getConnectionType() == ConnectionType.BLUETOOTH) {
            return device.getBluetoothAddress() != null && !device.getBluetoothAddress().isEmpty();
        }
        
        // Default to true for other connection types
        return true;
    }

    // Convert Device entity to DeviceResponse DTO
    private DeviceResponse convertToResponse(Device device) {
        DeviceResponse response = new DeviceResponse();
        response.setId(device.getId());
        response.setUserId(device.getUser().getId());
        response.setUserName(device.getUser().getFullName());
        response.setDeviceType(device.getDeviceType());
        response.setDeviceTypeDisplayName(device.getDeviceType().getDisplayName());
        response.setDeviceCategory(device.getDeviceType().getCategory());
        response.setDeviceName(device.getDeviceName());
        response.setManufacturer(device.getManufacturer());
        response.setModel(device.getModel());
        response.setSerialNumber(device.getSerialNumber());
        response.setFirmwareVersion(device.getFirmwareVersion());
        response.setConnectionType(device.getConnectionType());
        response.setConnectionTypeDisplayName(device.getConnectionType().getDisplayName());
        response.setIpAddress(device.getIpAddress());
        response.setPort(device.getPort());
        response.setMacAddress(device.getMacAddress());
        response.setBluetoothAddress(device.getBluetoothAddress());
        response.setUsbPort(device.getUsbPort());
        response.setStatus(device.getStatus());
        response.setStatusDisplayName(device.getStatus().getDisplayName());
        response.setIsDefault(device.getIsDefault());
        response.setAutoConnect(device.getAutoConnect());
        response.setConfiguration(device.getConfiguration());
        response.setLastConnected(device.getLastConnected());
        response.setLastDisconnected(device.getLastDisconnected());
        response.setErrorMessage(device.getErrorMessage());
        response.setCreatedAt(device.getCreatedAt());
        response.setUpdatedAt(device.getUpdatedAt());
        return response;
    }

    // Inner class for device statistics
    public static class DeviceStatsResponse {
        private long totalDevices;
        private long onlineDevices;
        private long offlineDevices;
        private long errorDevices;
        private long printerCount;
        private long scannerCount;
        private long cameraCount;
        private long otherCount;

        public long getTotalDevices() { return totalDevices; }
        public void setTotalDevices(long totalDevices) { this.totalDevices = totalDevices; }

        public long getOnlineDevices() { return onlineDevices; }
        public void setOnlineDevices(long onlineDevices) { this.onlineDevices = onlineDevices; }

        public long getOfflineDevices() { return offlineDevices; }
        public void setOfflineDevices(long offlineDevices) { this.offlineDevices = offlineDevices; }

        public long getErrorDevices() { return errorDevices; }
        public void setErrorDevices(long errorDevices) { this.errorDevices = errorDevices; }

        public long getPrinterCount() { return printerCount; }
        public void setPrinterCount(long printerCount) { this.printerCount = printerCount; }

        public long getScannerCount() { return scannerCount; }
        public void setScannerCount(long scannerCount) { this.scannerCount = scannerCount; }

        public long getCameraCount() { return cameraCount; }
        public void setCameraCount(long cameraCount) { this.cameraCount = cameraCount; }

        public long getOtherCount() { return otherCount; }
        public void setOtherCount(long otherCount) { this.otherCount = otherCount; }
    }
}