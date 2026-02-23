package in.main.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import in.main.entities.Device;
import in.main.entities.Device.DeviceStatus;
import in.main.entities.Device.DeviceType;
import in.main.entities.User;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long> {

    // Find all devices for a user
    List<Device> findByUser(User user);

    // Find all devices for a user by user ID
    List<Device> findByUserId(Long userId);

    // Find devices by user and device type
    List<Device> findByUserAndDeviceType(User user, DeviceType deviceType);

    // Find devices by user ID and device type
    List<Device> findByUserIdAndDeviceType(Long userId, DeviceType deviceType);

    // Find devices by user and status
    List<Device> findByUserAndStatus(User user, DeviceStatus status);

    // Find devices by user ID and status
    List<Device> findByUserIdAndStatus(Long userId, DeviceStatus status);

    // Find default device for a user and type
    Optional<Device> findByUserAndDeviceTypeAndIsDefaultTrue(User user, DeviceType deviceType);

    // Find default device for a user ID and type
    Optional<Device> findByUserIdAndDeviceTypeAndIsDefaultTrue(Long userId, DeviceType deviceType);

    // Find device by serial number
    Optional<Device> findBySerialNumber(String serialNumber);

    // Find device by IP address
    Optional<Device> findByIpAddress(String ipAddress);

    // Find device by MAC address
    Optional<Device> findByMacAddress(String macAddress);

    // Count devices by user and type
    long countByUserAndDeviceType(User user, DeviceType deviceType);

    // Count online devices for a user
    long countByUserAndStatus(User user, DeviceStatus status);

    // Find devices by user and category (enum category is derived from DeviceType)
    default List<Device> findByUserAndCategory(User user, String category) {
        return findByUser(user).stream()
                .filter(d -> d.getDeviceType() != null && category.equals(d.getDeviceType().getCategory()))
                .toList();
    }

    // Find all default devices for a user
    List<Device> findByUserAndIsDefaultTrue(User user);

    // Find all auto-connect devices for a user
    List<Device> findByUserAndAutoConnectTrue(User user);

    // Find devices by user and connection type
    List<Device> findByUserAndConnectionType(User user, Device.ConnectionType connectionType);

    // Check if device name exists for user
    boolean existsByUserAndDeviceName(User user, String deviceName);

    // Find devices with errors
    @Query("SELECT d FROM Device d WHERE d.user = :user AND d.status = 'ERROR'")
    List<Device> findErrorDevices(@Param("user") User user);

    // Get device statistics for a user
    @Query("SELECT d.deviceType as type, COUNT(d) as count, " +
           "SUM(CASE WHEN d.status = 'ONLINE' THEN 1 ELSE 0 END) as onlineCount " +
           "FROM Device d WHERE d.user = :user GROUP BY d.deviceType")
    List<Object[]> getDeviceStatsByUser(@Param("user") User user);
}