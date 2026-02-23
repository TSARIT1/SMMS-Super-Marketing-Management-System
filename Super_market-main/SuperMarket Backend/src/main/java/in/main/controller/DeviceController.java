package in.main.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import in.main.dto.DeviceRequest;
import in.main.dto.DeviceResponse;
import in.main.entities.Device;
import in.main.entities.Device.DeviceStatus;
import in.main.entities.Device.DeviceType;
import in.main.service.DeviceService;
import in.main.service.DeviceService.DeviceStatsResponse;

@RestController
@RequestMapping("/api/devices")
@CrossOrigin(origins = "*")
public class DeviceController {

    @Autowired
    private DeviceService deviceService;

    // Get all devices for the authenticated user
    @GetMapping
    public ResponseEntity<List<DeviceResponse>> getAllDevices(@RequestParam String email) {
        List<DeviceResponse> devices = deviceService.getAllDevices(email);
        return ResponseEntity.ok(devices);
    }

    // Get device by ID
    @GetMapping("/{id}")
    public ResponseEntity<DeviceResponse> getDeviceById(
            @PathVariable Long id,
            @RequestParam String email) {
        DeviceResponse device = deviceService.getDeviceById(id, email);
        return ResponseEntity.ok(device);
    }

    // Get devices by type
    @GetMapping("/type/{deviceType}")
    public ResponseEntity<List<DeviceResponse>> getDevicesByType(
            @PathVariable DeviceType deviceType,
            @RequestParam String email) {
        List<DeviceResponse> devices = deviceService.getDevicesByType(email, deviceType);
        return ResponseEntity.ok(devices);
    }

    // Get devices by category
    @GetMapping("/category/{category}")
    public ResponseEntity<List<DeviceResponse>> getDevicesByCategory(
            @PathVariable String category,
            @RequestParam String email) {
        List<DeviceResponse> devices = deviceService.getDevicesByCategory(email, category);
        return ResponseEntity.ok(devices);
    }

    // Get default device for a type
    @GetMapping("/default/{deviceType}")
    public ResponseEntity<DeviceResponse> getDefaultDevice(
            @PathVariable DeviceType deviceType,
            @RequestParam String email) {
        try {
            DeviceResponse device = deviceService.getDefaultDevice(email, deviceType);
            return ResponseEntity.ok(device);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Get device statistics
    @GetMapping("/stats")
    public ResponseEntity<DeviceStatsResponse> getDeviceStats(@RequestParam String email) {
        DeviceStatsResponse stats = deviceService.getDeviceStats(email);
        return ResponseEntity.ok(stats);
    }

    // Create a new device
    @PostMapping
    public ResponseEntity<DeviceResponse> createDevice(
            @RequestBody DeviceRequest request,
            @RequestParam String email) {
        DeviceResponse device = deviceService.createDevice(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(device);
    }

    // Update a device
    @PutMapping("/{id}")
    public ResponseEntity<DeviceResponse> updateDevice(
            @PathVariable Long id,
            @RequestBody DeviceRequest request,
            @RequestParam String email) {
        DeviceResponse device = deviceService.updateDevice(id, request, email);
        return ResponseEntity.ok(device);
    }

    // Delete a device
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(
            @PathVariable Long id,
            @RequestParam String email) {
        deviceService.deleteDevice(id, email);
        return ResponseEntity.noContent().build();
    }

    // Update device status
    @PatchMapping("/{id}/status")
    public ResponseEntity<DeviceResponse> updateDeviceStatus(
            @PathVariable Long id,
            @RequestParam DeviceStatus status,
            @RequestParam(required = false) String errorMessage,
            @RequestParam String email) {
        DeviceResponse device = deviceService.updateDeviceStatus(id, status, errorMessage, email);
        return ResponseEntity.ok(device);
    }

    // Set device as default
    @PatchMapping("/{id}/default")
    public ResponseEntity<DeviceResponse> setDefaultDevice(
            @PathVariable Long id,
            @RequestParam String email) {
        DeviceResponse device = deviceService.setDefaultDevice(id, email);
        return ResponseEntity.ok(device);
    }

    // Test device connection
    @PostMapping("/{id}/test")
    public ResponseEntity<DeviceResponse> testDeviceConnection(
            @PathVariable Long id,
            @RequestParam String email) {
        DeviceResponse device = deviceService.testDeviceConnection(id, email);
        return ResponseEntity.ok(device);
    }

    // Get all supported device types
    @GetMapping("/types")
    public ResponseEntity<DeviceType[]> getDeviceTypes() {
        return ResponseEntity.ok(DeviceType.values());
    }

    // Get all connection types
    @GetMapping("/connection-types")
    public ResponseEntity<Device.ConnectionType[]> getConnectionTypes() {
        return ResponseEntity.ok(Device.ConnectionType.values());
    }

    // Get all device statuses
    @GetMapping("/statuses")
    public ResponseEntity<DeviceStatus[]> getDeviceStatuses() {
        return ResponseEntity.ok(DeviceStatus.values());
    }
}