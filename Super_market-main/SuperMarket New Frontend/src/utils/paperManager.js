/**
 * Paper Size Manager & Consumption Calculator
 * Calculates paper usage, dimensions, and receipt specifications
 * Version: 1.0.0
 */

export const PAPER_CONFIGURATIONS = {
  '58mm': {
    id: '58mm',
    name: '58mm Thermal Receipt',
    category: 'thermal',
    width: 58,
    height: 'auto',
    unit: 'mm',
    pixels_width: 164.4,
    pixels_height: 'auto',
    dpi: 203,
    characterWidth: 32,
    lineHeight: 2.5,
    description: 'Compact receipt for small thermal printers',
    commonUse: 'Point of Sales (POS), receipt printers',
    paperConsumption: 2, // mm per 100 items
    costPerMeter: 5,
    printerTypes: ['Brother QL-800', 'Zebra GC420', 'Epson TM-T20']
  },
  '80mm': {
    id: '80mm',
    name: '80mm Thermal Receipt',
    category: 'thermal',
    width: 80,
    height: 'auto',
    unit: 'mm',
    pixels_width: 226.77,
    pixels_height: 'auto',
    dpi: 203,
    characterWidth: 48,
    lineHeight: 2.8,
    description: 'Standard thermal receipt size',
    commonUse: 'Retail stores, restaurants, ticket counters',
    paperConsumption: 2.5, // mm per 100 items
    costPerMeter: 6,
    printerTypes: ['Epson TM-T81II', 'Zebra ZD410', 'Star Micronics']
  },
  'A5': {
    id: 'A5',
    name: 'A5 Standard Paper',
    category: 'standard',
    width: 148,
    height: 210,
    unit: 'mm',
    pixels_width: 419.53,
    pixels_height: 595.28,
    dpi: 72,
    characterWidth: 52,
    lineHeight: 4,
    description: 'Half of standard A4 paper',
    commonUse: 'Professional receipts, invoices',
    paperConsumption: 1, // sheets per 100 items
    costPerReem: 120,
    printerTypes: ['HP LaserJet', 'Brother HL-L8360', 'Canon imageCLASS']
  },
  'A4': {
    id: 'A4',
    name: 'A4 Standard Paper',
    category: 'standard',
    width: 210,
    height: 297,
    unit: 'mm',
    pixels_width: 595.28,
    pixels_height: 841.89,
    dpi: 72,
    characterWidth: 80,
    lineHeight: 5,
    description: 'Standard office paper size',
    commonUse: 'Detailed invoices, reports, documents',
    paperConsumption: 1.5, // sheets per 100 items
    costPerReem: 120,
    printerTypes: ['HP LaserJet', 'Xerox WorkCentre', 'Canon imageCLASS']
  }
};

export class PaperConsumptionCalculator {
  /**
   * Calculate total paper needed for transaction
   */
  static calculatePaperUsage(itemCount, paperSize = '80mm') {
    const config = PAPER_CONFIGURATIONS[paperSize];
    if (!config) return null;

    const consumption = config.paperConsumption;
    const multiplier = Math.ceil(itemCount / 100);
    const totalUsage = consumption * multiplier;

    return {
      size: paperSize,
      itemCount,
      consumption: totalUsage,
      unit: config.category === 'thermal' ? 'mm' : 'sheets',
      cost: this.calculateCost(totalUsage, config),
      paperConfig: config
    };
  }

  /**
   * Calculate cost of paper usage
   */
  static calculateCost(usage, config) {
    if (config.costPerMeter) {
      // For thermal paper (mm per meter)
      return (usage / 1000) * config.costPerMeter;
    } else if (config.costPerReem) {
      // For regular paper (sheets per ream)
      return (usage / 500) * config.costPerReem;
    }
    return 0;
  }

  /**
   * Get detailed paper statistics for a receipt
   */
  static getReceiptStats(items = [], paperSize = '80mm', taxAmount = 0) {
    const config = PAPER_CONFIGURATIONS[paperSize];
    if (!config) return null;

    const lines = this.calculateLines(items, config, taxAmount);
    const heightMm = config.category === 'thermal' 
      ? lines * config.lineHeight 
      : null;

    return {
      paperSize,
      config,
      estimatedLines: lines,
      estimiedHeightMm: heightMm,
      paperConsumption: this.calculatePaperUsage(items.length, paperSize),
      margins: {
        top: 5,
        bottom: 5,
        left: 3,
        right: 3,
        unit: 'mm'
      }
    };
  }

  /**
   * Calculate approximate lines needed
   */
  static calculateLines(items = [], config, taxAmount = 0) {
    let lines = 10; // Header
    lines += 2; // Receipt number and date
    lines += 1; // Separator
    lines += items.length * 2; // Items (2 lines each)
    lines += 1; // Separator
    lines += 5; // Subtotal, tax, total
    lines += 5; // Payment info
    lines += 3; // Footer
    return lines;
  }

  /**
   * Get all available paper sizes
   */
  static getAvailableSizes() {
    return Object.values(PAPER_CONFIGURATIONS);
  }

  /**
   * Get recommended paper size for transaction
   */
  static getRecommendedSize(itemCount) {
    if (itemCount > 30) return 'A4';
    if (itemCount > 20) return 'A5';
    if (itemCount > 10) return '80mm';
    return '58mm';
  }

  /**
   * Compare paper sizes
   */
  static compareSizes(size1, size2) {
    const config1 = PAPER_CONFIGURATIONS[size1];
    const config2 = PAPER_CONFIGURATIONS[size2];

    return {
      size1: config1.name,
      size2: config2.name,
      widthDifference: config2.width - config1.width,
      costRatio: config2.costPerMeter / (config1.costPerMeter || 1)
    };
  }

  /**
   * Calculate total paper consumption for multiple receipts
   */
  static calculateBatchConsumption(receipts = []) {
    let totalMM = 0;
    let totalSheets = 0;
    let totalCost = 0;

    receipts.forEach(receipt => {
      const usage = this.calculatePaperUsage(receipt.itemCount, receipt.paperSize);
      if (usage) {
        if (usage.unit === 'mm') {
          totalMM += usage.consumption;
        } else {
          totalSheets += usage.consumption;
        }
        totalCost += usage.cost;
      }
    });

    return {
      totalMM,
      totalSheets,
      totalCost,
      averageCost: receipts.length > 0 ? totalCost / receipts.length : 0
    };
  }
}

export default PaperConsumptionCalculator;
