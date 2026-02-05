/**
 * Device Manager Utility
 * Handles printer, scanner, and other hardware device connections
 * Version: 1.0.0
 */

export class DeviceManager {
  constructor() {
    this.connectedDevices = [];
    this.printQueue = [];
    this.isScanning = false;
  }

  /**
   * Initialize and detect available devices
   */
  async initializeDevices() {
    try {
      if (navigator.usb) {
        const devices = await navigator.usb.getDevices();
        this.connectedDevices = devices.map(device => ({
          id: device.serialNumber,
          name: device.productName || 'Unknown Device',
          type: this.detectDeviceType(device),
          vendor: device.manufacturerName,
          connected: true,
          lastConnected: new Date()
        }));
        return this.connectedDevices;
      }
      console.warn('WebUSB API not available');
      return [];
    } catch (error) {
      console.error('Error initializing devices:', error);
      return [];
    }
  }

  /**
   * Detect device type based on device info
   */
  detectDeviceType(device) {
    const name = (device.productName || '').toLowerCase();
    const vendor = (device.manufacturerName || '').toLowerCase();

    if (name.includes('printer') || vendor.includes('printer')) return 'printer';
    if (name.includes('scanner') || vendor.includes('scanner')) return 'scanner';
    if (name.includes('barcode')) return 'barcode_scanner';
    if (name.includes('pos') || name.includes('receipt')) return 'pos_terminal';
    if (name.includes('display') || name.includes('customer')) return 'customer_display';
    
    return 'unknown';
  }

  /**
   * Request printer access
   */
  async requestPrinterAccess() {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 7 }, // Printer class
          { vendorId: 0x0fe6 }, // Brother
          { vendorId: 0x04f9 }, // Brother
          { vendorId: 0x0a5f }, // Zebra
          { vendorId: 0x0b48 }, // ZXP Printer
        ]
      });

      if (device) {
        const printer = {
          id: device.serialNumber,
          name: device.productName || 'Thermal Printer',
          type: 'printer',
          vendor: device.manufacturerName,
          connected: true,
          lastConnected: new Date(),
          usbDevice: device
        };
        this.connectedDevices.push(printer);
        return printer;
      }
    } catch (error) {
      console.warn('Printer request cancelled or not available:', error);
      return null;
    }
  }

  /**
   * Request scanner access
   */
  async requestScannerAccess() {
    try {
      const device = await navigator.usb.requestDevice({
        filters: [
          { classCode: 255 }, // Vendor specific
          { vendorId: 0x0a5f }, // Zebra
          { vendorId: 0x1316 }, // Wacom
        ]
      });

      if (device) {
        const scanner = {
          id: device.serialNumber,
          name: device.productName || 'Barcode Scanner',
          type: 'barcode_scanner',
          vendor: device.manufacturerName,
          connected: true,
          lastConnected: new Date(),
          usbDevice: device
        };
        this.connectedDevices.push(scanner);
        return scanner;
      }
    } catch (error) {
      console.warn('Scanner request cancelled or not available:', error);
      return null;
    }
  }

  /**
   * Print to specific printer
   */
  async printToDevice(deviceId, printData) {
    try {
      const device = this.connectedDevices.find(d => d.id === deviceId);
      if (!device || device.type !== 'printer') {
        throw new Error('Printer device not found');
      }

      this.printQueue.push({
        deviceId,
        data: printData,
        timestamp: new Date(),
        status: 'pending'
      });

      // Simulate print (in real scenario, this would send to WebUSB endpoint)
      console.log(`Sending to printer: ${device.name}`);
      return {
        success: true,
        message: `Print job sent to ${device.name}`,
        device: device
      };
    } catch (error) {
      console.error('Print error:', error);
      return {
        success: false,
        message: error.message,
        error
      };
    }
  }

  /**
   * Get printer queue status
   */
  getPrintQueue() {
    return this.printQueue;
  }

  /**
   * Clear print queue
   */
  clearPrintQueue() {
    this.printQueue = [];
  }

  /**
   * Get connected devices by type
   */
  getDevicesByType(type) {
    return this.connectedDevices.filter(d => d.type === type);
  }

  /**
   * Get all connected devices
   */
  getConnectedDevices() {
    return this.connectedDevices;
  }

  /**
   * Remove/disconnect device
   */
  disconnectDevice(deviceId) {
    this.connectedDevices = this.connectedDevices.filter(d => d.id !== deviceId);
    return true;
  }

  /**
   * Check if device is available
   */
  isDeviceAvailable(deviceId) {
    return this.connectedDevices.some(d => d.id === deviceId && d.connected);
  }
}

// Singleton instance
export const deviceManager = new DeviceManager();

export default DeviceManager;
