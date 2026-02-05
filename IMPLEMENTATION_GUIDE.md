# Device Management & Paper Tracking Implementation Guide

## Quick Start Guide for Developers

### 1. Understanding the Architecture

#### Three-Layer Architecture:
```
User Interface (Cart.jsx)
    ↓ (Uses)
Utilities (deviceManager.js, paperManager.js)
    ↓ (Manages)
Hardware/Data Layer (USB Devices, Paper Calculations)
```

### 2. Device Manager Usage

#### Basic Usage:
```javascript
import { deviceManager } from "../utils/deviceManager";

// Initialize devices
const devices = await deviceManager.initializeDevices();

// Print to a device
const result = await deviceManager.printToDevice(deviceId, pdfBlob);
if (result.success) {
  console.log(result.message);
}

// Clean up
await deviceManager.cleanup();
```

#### Complete Example:
```javascript
// In a React component
const [devices, setDevices] = useState([]);

useEffect(() => {
  const initDevices = async () => {
    const detectedDevices = await deviceManager.initializeDevices();
    setDevices(detectedDevices);
  };
  initDevices();
}, []);

const handlePrint = async (deviceId) => {
  const result = await deviceManager.printToDevice(deviceId, pdfBlob);
  if (result.success) {
    toast.success("Printed successfully!");
  } else {
    toast.error(result.message);
  }
};
```

### 3. Paper Manager Usage

#### Calculate Paper Consumption:
```javascript
import { PaperConsumptionCalculator, PAPER_CONFIGURATIONS } from "../utils/paperManager";

// Single receipt calculation
const usage = PaperConsumptionCalculator.calculatePaperUsage(
  itemCount,     // number of items
  paperSize      // '58mm', '80mm', 'A4', or 'A5'
);
// Returns: { consumption: number, cost: number, unit: string }

// Get detailed statistics
const stats = PaperConsumptionCalculator.getReceiptStats(
  items,         // array of items
  paperSize,     // paper size
  taxAmount      // tax amount
);
// Returns: { paperSize, paperConsumption, estimatedLines, environmentalImpact, ... }
```

#### Batch Processing:
```javascript
// Calculate for multiple receipts
const batchStats = PaperConsumptionCalculator.calculateBatchStats(
  orders,         // array of order objects
  '80mm'          // paper size
);
// Returns: { totalOrders, totalPaperUsage, averagePaperPerOrder, totalCost, ... }

// Get stock recommendations
const recommendations = PaperConsumptionCalculator.getStockRecommendations(
  dailyOrders,    // estimated daily orders
  paperSize       // paper size
);
// Returns: { dailyRollsNeeded, weeklySuggestion, monthlySuggestion, costPerDay, ... }
```

### 4. Integration in Cart Component

#### Step 1: Add Imports
```javascript
import { deviceManager } from "../utils/deviceManager";
import { PaperConsumptionCalculator, PAPER_CONFIGURATIONS } from "../utils/paperManager";
import { Wifi, WifiOff } from "lucide-react";
```

#### Step 2: Add State Variables
```javascript
const [connectedDevices, setConnectedDevices] = useState([]);
const [selectedPrinter, setSelectedPrinter] = useState(null);
const [paperStats, setPaperStats] = useState(null);
const [totalPaperUsage, setTotalPaperUsage] = useState({ mm: 0, sheets: 0, cost: 0 });
```

#### Step 3: Initialize on Mount
```javascript
useEffect(() => {
  const initializeDeviceManager = async () => {
    try {
      const devices = await deviceManager.initializeDevices();
      setConnectedDevices(devices);
      const printers = devices.filter(d => d.type === 'printer');
      if (printers.length > 0) {
        setSelectedPrinter(printers[0].id);
      }
    } catch (error) {
      console.warn('Device initialization failed:', error);
    }
  };
  
  initializeDeviceManager();
}, []);
```

#### Step 4: Update Paper Tracking
```javascript
const updatePaperTracking = () => {
  if (currentOrder && currentOrder.items) {
    const stats = PaperConsumptionCalculator.getReceiptStats(
      currentOrder.items,
      paperSize,
      currentOrder.tax
    );
    setPaperStats(stats);
    
    const usage = PaperConsumptionCalculator.calculatePaperUsage(
      currentOrder.items.length,
      paperSize
    );
    setTotalPaperUsage(prev => ({
      mm: paperSize.includes('mm') ? prev.mm + usage.consumption : prev.mm,
      sheets: !paperSize.includes('mm') ? prev.sheets + usage.consumption : prev.sheets,
      cost: prev.cost + usage.cost
    }));
  }
};
```

#### Step 5: Implement Print Function
```javascript
const printReceipt = async () => {
  if (!currentOrder) return;

  try {
    // Generate PDF blob
    const blob = await pdf(
      <ReceiptPDF order={currentOrder} profile={profile} taxConfig={taxConfig} paperSize={paperSize} />
    ).toBlob();
    
    // Try device printing first
    if (selectedPrinter && deviceManager.isDeviceAvailable(selectedPrinter)) {
      const result = await deviceManager.printToDevice(selectedPrinter, blob);
      if (result.success) {
        toast.success(result.message);
        updatePaperTracking();
        return;
      }
    }
    
    // Fallback to browser printing
    const url = URL.createObjectURL(blob);
    const printWindow = window.open(url);
    printWindow?.addEventListener("load", () => printWindow.print());
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    updatePaperTracking();
    toast.success("Receipt sent to printer!");
  } catch (error) {
    console.error("Print error:", error);
    toast.error("Failed to print receipt");
  }
};
```

### 5. Adding Device Detection UI

#### Device Panel Template:
```jsx
<div className="card p-4">
  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
    {connectedDevices.length > 0 ? (
      <><Wifi className="w-5 h-5 text-green-600" /> Devices Connected</>
    ) : (
      <><WifiOff className="w-5 h-5 text-gray-400" /> No Devices</>
    )}
  </h3>
  
  {connectedDevices.map((device) => (
    <div key={device.id} className="p-3 border rounded mb-2">
      <p className="font-medium">{device.name}</p>
      <p className="text-sm text-gray-600">{device.vendor} • {device.type}</p>
      {device.type === 'printer' && (
        <button
          onClick={() => setSelectedPrinter(device.id)}
          className={`mt-2 px-3 py-1 text-sm rounded ${
            selectedPrinter === device.id
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200'
          }`}
        >
          {selectedPrinter === device.id ? 'Selected' : 'Select'}
        </button>
      )}
    </div>
  ))}
</div>
```

#### Paper Configuration Panel Template:
```jsx
<div className="card p-4">
  <h3 className="text-lg font-semibold mb-3">Paper Configuration</h3>
  
  <div className="grid grid-cols-4 gap-3 mb-4">
    {Object.entries(PAPER_CONFIGURATIONS).map(([key, config]) => (
      <button
        key={key}
        onClick={() => {
          setPaperSize(key);
          updatePaperTracking();
        }}
        className={`p-2 border rounded ${
          paperSize === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
        }`}
      >
        <p className="text-sm font-medium">{config.id}</p>
        <p className="text-xs text-gray-600">{config.category}</p>
      </button>
    ))}
  </div>

  {paperStats && (
    <div className="bg-green-50 border border-green-200 rounded p-3 mb-3 text-sm">
      <p className="font-semibold mb-1">Paper Usage</p>
      <p>Lines: {paperStats.estimatedLines}</p>
      {paperStats.estimiedHeightMm && (
        <p>Height: {paperStats.estimiedHeightMm.toFixed(1)}mm</p>
      )}
      <p>Cost: ₹{paperStats.paperConsumption.cost.toFixed(2)}</p>
    </div>
  )}

  {(totalPaperUsage.mm > 0 || totalPaperUsage.sheets > 0) && (
    <div className="bg-purple-50 border border-purple-200 rounded p-3 text-sm">
      <p className="font-semibold mb-1">Session Total</p>
      {totalPaperUsage.mm > 0 && <p>Thermal: {totalPaperUsage.mm.toFixed(1)}mm</p>}
      {totalPaperUsage.sheets > 0 && <p>Standard: {totalPaperUsage.sheets.toFixed(1)} sheets</p>}
      <p className="font-medium mt-1">Total: ₹{totalPaperUsage.cost.toFixed(2)}</p>
    </div>
  )}
</div>
```

### 6. Common Patterns

#### Pattern 1: Initialize on Component Mount
```javascript
useEffect(() => {
  const init = async () => {
    const devices = await deviceManager.initializeDevices();
    setConnectedDevices(devices);
  };
  init();
}, []);
```

#### Pattern 2: Update on State Change
```javascript
useEffect(() => {
  if (paperSize) {
    updatePaperTracking();
  }
}, [paperSize, currentOrder]);
```

#### Pattern 3: Event-Driven Updates
```javascript
const handlePrintClick = async () => {
  await printReceipt();
  updatePaperTracking();
};
```

### 7. Handling Errors

#### Error Checklist:
```javascript
// 1. Check WebUSB support
if (!navigator.usb) {
  console.warn('WebUSB not supported - using fallback');
  // Use fallback printing
}

// 2. Handle device not found
if (!selectedPrinter) {
  console.warn('No printer selected');
  // Use fallback printing
}

// 3. Handle invalid paper size
const config = PAPER_CONFIGURATIONS[paperSize];
if (!config) {
  console.warn('Invalid paper size');
  setPaperSize('80mm'); // Default
}

// 4. Handle calculation errors
try {
  const stats = PaperConsumptionCalculator.getReceiptStats(items, paperSize);
  if (!stats) throw new Error('Failed to calculate stats');
} catch (error) {
  console.error('Paper calculation failed:', error);
  // Use default values
}
```

### 8. Testing Recommendations

#### Unit Tests:
```javascript
describe('PaperConsumptionCalculator', () => {
  test('calculatePaperUsage returns correct consumption', () => {
    const usage = PaperConsumptionCalculator.calculatePaperUsage(100, '80mm');
    expect(usage.consumption).toBeGreaterThan(0);
    expect(usage.cost).toBeGreaterThan(0);
  });

  test('getReceiptStats returns all metrics', () => {
    const items = Array(10).fill({ name: 'item' });
    const stats = PaperConsumptionCalculator.getReceiptStats(items, '80mm');
    expect(stats.estimatedLines).toBeGreaterThan(0);
    expect(stats.paperConsumption).toBeDefined();
  });
});
```

#### Integration Tests:
```javascript
describe('DeviceManager', () => {
  test('initializeDevices returns device array', async () => {
    const devices = await deviceManager.initializeDevices();
    expect(Array.isArray(devices)).toBe(true);
  });

  test('printToDevice handles WebUSB not available', async () => {
    const result = await deviceManager.printToDevice('invalid-id', new Blob());
    expect(result.success).toBe(false);
  });
});
```

### 9. Performance Tips

#### Optimization 1: Memoize Calculations
```javascript
const memoizedStats = useMemo(() => {
  return PaperConsumptionCalculator.getReceiptStats(
    currentOrder?.items,
    paperSize,
    currentOrder?.tax
  );
}, [currentOrder?.items, paperSize, currentOrder?.tax]);
```

#### Optimization 2: Debounce Device Detection
```javascript
const debouncedInitialize = useCallback(
  debounce(async () => {
    const devices = await deviceManager.initializeDevices();
    setConnectedDevices(devices);
  }, 500),
  []
);
```

#### Optimization 3: Batch Paper Calculations
```javascript
// Instead of calculating each receipt individually
const batchStats = PaperConsumptionCalculator.calculateBatchStats(
  currentOrders,
  paperSize
);
// Much faster than loop
```

### 10. Deployment Checklist

Before deploying to production:

- [ ] Test WebUSB on target browsers
- [ ] Verify device detection works
- [ ] Test fallback printing mechanism
- [ ] Validate paper calculations
- [ ] Check environmental impact metrics
- [ ] Performance test with 1000+ receipts
- [ ] Cross-browser compatibility check
- [ ] Mobile device testing
- [ ] Network printer testing (if applicable)
- [ ] Documentation updated
- [ ] Error logging configured
- [ ] Analytics integration complete

## Advanced Topics

### Custom Device Integration
```javascript
// Add custom device type detection
const customDeviceType = (device) => {
  if (device.vendorId === 0xCUSTOM) {
    return 'custom_device';
  }
};
```

### Extended Paper Configurations
```javascript
// Add custom paper size
PAPER_CONFIGURATIONS['Custom'] = {
  id: 'custom',
  name: 'Custom Paper',
  category: 'custom',
  width: 100,
  height: 150,
  paperConsumption: 3,
  costPerMeter: 10,
  description: 'Custom paper specification'
};
```

### Analytics Integration
```javascript
// Track paper usage
const trackPaperUsage = (stats) => {
  analytics.track('paper_used', {
    paperSize: stats.paperSize,
    consumption: stats.paperConsumption.consumption,
    cost: stats.paperConsumption.cost,
    timestamp: new Date()
  });
};
```

## Troubleshooting Guide

| Issue | Cause | Solution |
|-------|-------|----------|
| Devices not detected | WebUSB not supported | Check browser version, use fallback |
| Print fails | Invalid device ID | Refresh device list, select printer |
| Wrong calculations | Incorrect item count | Verify cart data structure |
| High memory usage | Too many calculations | Use batch processing, clear old data |
| UI not updating | State not changing | Check useEffect dependencies |

## Resources

- [WebUSB Specification](https://wicg.github.io/webusb/)
- [React Hooks Guide](https://react.dev/reference/react)
- [Paper Standards](https://en.wikipedia.org/wiki/Paper_size)
- [ESC/POS Tutorial](https://www.sparkfun.com/datasheets/Printer/A2_Thermal.pdf)

## Support

For issues or questions:
1. Check the troubleshooting guide above
2. Review the main documentation (DEVICE_AND_PAPER_ENHANCEMENTS.md)
3. Check browser console for error messages
4. Enable verbose logging for debugging
5. Contact development team

---

Last Updated: [Current Session]
Version: 1.0.0
