/**
 * Centralized Configuration for Vietnam Central Meridians (Kinh tuyến trục - KTT)
 * Standardized for VN-2000 & WGS84 Coordinate Reference System (Quyết định 05/2007/QĐ-BTNMT & BQP)
 */

export interface CentralMeridianConfig {
  provinceCode: string;
  provinceName: string;
  provinceNameAlt?: string;
  coordinateSystem: 'VN-2000' | 'VN2000' | 'WGS84';
  projectionType?: 'Gauss-Kruger' | 'UTM' | string;
  zoneWidth: 3 | 6; // Múi chiếu 3 độ hoặc 6 độ
  projectionZone?: '3deg' | '6deg';
  centralMeridian: number; // Kinh tuyến trục (độ decimal, e.g. 106.25)
  scaleFactor: number; // Hệ số tỷ lệ k0 (0.9999 cho múi 3°, 0.9996 cho múi 6°)
  falseEasting: number; // Tọa độ giả Đông (mặc định 500,000m)
  falseNorthing: number; // Tọa độ giả Bắc (mặc định 0m)
  ellipsoid?: string; // WGS-84 hoặc Krassovsky
  datum?: string; // VN-2000 hoặc WGS-84
  axisOrder: 'XY' | 'YX'; // X/Y (Northing/Easting)
  unit: 'meter' | 'mét';
  status?: 'active' | 'draft';
  sourceNote?: string;
  alternativeMeridians?: number[]; // Các phương án hợp lệ bổ sung cho khu vực giáp ranh
  note?: string;
  isCustom?: boolean;
}

export type ProvinceKttConfig = CentralMeridianConfig;

/**
 * Shared Formatter Utilities
 */

/**
 * Converts decimal degree (e.g. 106.25) to Degree-Minute format (e.g. "106°15’")
 */
export function decimalDegreeToDegreeMinute(decimalDeg: number): string {
  if (isNaN(decimalDeg) || decimalDeg <= 0) return '0°00’';
  let deg = Math.floor(decimalDeg);
  let min = Math.round((decimalDeg - deg) * 60);
  if (min >= 60) {
    deg += 1;
    min = 0;
  }
  const minStr = min < 10 ? `0${min}` : `${min}`;
  return `${deg}°${minStr}’`;
}

/**
 * Converts Degree-Minute string (e.g. "106°15’" or "106°15'") to decimal degree (e.g. 106.25)
 */
export function degreeMinuteToDecimalDegree(dmStr: string): number {
  if (!dmStr || !dmStr.trim()) return 106.25;
  const clean = dmStr.trim();
  
  // Direct decimal string
  if (/^\d+(\.\d+)?$/.test(clean)) {
    return parseFloat(clean);
  }

  // Regex match for Degree and Minute
  const match = clean.match(/(\d+)\s*°?\s*(\d+)?/);
  if (match) {
    const deg = parseInt(match[1], 10);
    const min = match[2] ? parseInt(match[2], 10) : 0;
    return Math.round((deg + min / 60.0) * 10000) / 10000;
  }

  return parseFloat(clean) || 106.25;
}

/**
 * Formats central meridian display consistently so 106.25° and 106°15’ are never mixed up.
 * Returns string format: "106°15’ (106.25°)"
 */
export function formatCentralMeridian(val: number | string): string {
  const dec = typeof val === 'number' ? val : degreeMinuteToDecimalDegree(val);
  const dm = decimalDegreeToDegreeMinute(dec);
  return `${dm} (${dec.toFixed(2)}°)`;
}

export const STANDARD_VN2000_PROVINCES: CentralMeridianConfig[] = [
  // Miền Bắc
  { provinceCode: 'HN', provinceName: 'Hà Nội', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HP', provinceName: 'Hải Phòng', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'QN', provinceName: 'Quảng Ninh', centralMeridian: 107.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BN', provinceName: 'Bắc Ninh', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BG', provinceName: 'Bắc Giang', centralMeridian: 107.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HD', provinceName: 'Hải Dương', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HY', provinceName: 'Hưng Yên', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'ND', provinceName: 'Nam Định', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TB', provinceName: 'Thái Bình', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'NB', provinceName: 'Ninh Bình', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HNA', provinceName: 'Hà Nam', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'VP', provinceName: 'Vĩnh Phúc', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TN', provinceName: 'Thái Nguyên', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'PT', provinceName: 'Phú Thọ', centralMeridian: 104.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HB', provinceName: 'Hòa Bình', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TQ', provinceName: 'Tuyên Quang', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HG', provinceName: 'Hà Giang', centralMeridian: 104.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BK', provinceName: 'Bắc Kạn', centralMeridian: 106.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'CB', provinceName: 'Cao Bằng', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'LS', provinceName: 'Lạng Sơn', centralMeridian: 107.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'LC', provinceName: 'Lào Cai', centralMeridian: 104.75, provinceNameAlt: 'Lào cai', zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'YB', provinceName: 'Yên Bái', centralMeridian: 104.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DB', provinceName: 'Điện Biên', centralMeridian: 103.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'LCH', provinceName: 'Lai Châu', centralMeridian: 103.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'SL', provinceName: 'Sơn La', centralMeridian: 104.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },

  // Miền Trung
  { provinceCode: 'TH', provinceName: 'Thanh Hóa', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'NA', provinceName: 'Nghệ An', centralMeridian: 104.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', alternativeMeridians: [105.0], sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HT', provinceName: 'Hà Tĩnh', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'QB', provinceName: 'Quảng Bình', centralMeridian: 106.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'QT', provinceName: 'Quảng Trị', centralMeridian: 106.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', alternativeMeridians: [106.0, 107.0], sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TTH', provinceName: 'Thừa Thiên Huế', centralMeridian: 107.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', alternativeMeridians: [106.25], sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DN', provinceName: 'Đà Nẵng', centralMeridian: 107.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'QNAM', provinceName: 'Quảng Nam', centralMeridian: 107.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'QNGAI', provinceName: 'Quảng Ngãi', centralMeridian: 108.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BD', provinceName: 'Bình Định', centralMeridian: 108.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'PY', provinceName: 'Phú Yên', centralMeridian: 108.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'KH', provinceName: 'Khánh Hòa', centralMeridian: 108.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'NT', provinceName: 'Ninh Thuận', centralMeridian: 108.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BT', provinceName: 'Bình Thuận', centralMeridian: 108.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },

  // Tây Nguyên
  { provinceCode: 'KT', provinceName: 'Kon Tum', centralMeridian: 107.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'GL', provinceName: 'Gia Lai', centralMeridian: 108.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DL', provinceName: 'Đắk Lắk', centralMeridian: 108.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DNO', provinceName: 'Đắk Nông', centralMeridian: 108.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'LD', provinceName: 'Lâm Đồng', centralMeridian: 107.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },

  // Miền Nam
  { provinceCode: 'HCM', provinceName: 'TP. Hồ Chí Minh', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', alternativeMeridians: [106.0], sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BPH', provinceName: 'Bình Phước', centralMeridian: 106.25, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TNINH', provinceName: 'Tây Ninh', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BDUONG', provinceName: 'Bình Dương', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DNAI', provinceName: 'Đồng Nai', centralMeridian: 107.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'VT', provinceName: 'Bà Rịa - Vũng Tàu', centralMeridian: 107.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'LA', provinceName: 'Long An', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TG', provinceName: 'Tiền Giang', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BTR', provinceName: 'Bến Tre', centralMeridian: 105.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'TV', provinceName: 'Trà Vinh', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'VL', provinceName: 'Vĩnh Long', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'DT', provinceName: 'Đồng Tháp', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'AG', provinceName: 'An Giang', centralMeridian: 104.75, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'KG', provinceName: 'Kiên Giang', centralMeridian: 104.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'CT', provinceName: 'Cần Thơ', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'HGIA', provinceName: 'Hậu Giang', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'STR', provinceName: 'Sóc Trăng', centralMeridian: 105.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'BL', provinceName: 'Bạc Liêu', centralMeridian: 105.0, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' },
  { provinceCode: 'CM', provinceName: 'Cà Mau', centralMeridian: 104.5, zoneWidth: 3, projectionZone: '3deg', coordinateSystem: 'VN-2000', scaleFactor: 0.9999, falseEasting: 500000, falseNorthing: 0, axisOrder: 'XY', unit: 'meter', status: 'active', sourceNote: 'QĐ 05/2007/QĐ-BTNMT' }
];

export const COMMON_KTT_OPTIONS = [
  { value: 103.0, label: "103°00’ (Điện Biên, Lai Châu)" },
  { value: 104.0, label: "104°00’ (Sơn La)" },
  { value: 104.5, label: "104°30’ (Kiên Giang, Cà Mau)" },
  { value: 104.75, label: "104°45’ (Nghệ An, Lào Cai, Yên Bái, An Giang)" },
  { value: 105.0, label: "105°00’ (Hà Nội, Thanh Hóa, Ninh Bình, Đồng Tháp)" },
  { value: 105.5, label: "105°30’ (Hà Tĩnh, Bắc Ninh, Hải Dương, Cần Thơ, Tây Ninh)" },
  { value: 105.75, label: "105°45’ (TP. Hồ Chí Minh, Hải Phòng, Bình Dương, Long An)" },
  { value: 106.0, label: "106°00’ (Quảng Bình)" },
  { value: 106.25, label: "106°25’ (Quảng Trị, Bình Phước)" },
  { value: 106.5, label: "106°30’ (Bắc Kạn)" },
  { value: 107.0, label: "107°00’ (Thừa Thiên Huế, Bắc Giang)" },
  { value: 107.25, label: "107°15’ (Lạng Sơn)" },
  { value: 107.5, label: "107°30’ (Kon Tum, Đồng Nai, Vũng Tàu)" },
  { value: 107.75, label: "107°45’ (Đà Nẵng, Quảng Nam, Quảng Ninh, Lâm Đồng)" },
  { value: 108.0, label: "108°00’ (Quảng Ngãi)" },
  { value: 108.25, label: "108°15’ (Bình Định, Khánh Hòa, Ninh Thuận)" },
  { value: 108.5, label: "108°30’ (Gia Lai, Đắk Lắk, Đắk Nông, Phú Yên, Bình Thuận)" }
];

/**
 * Normalizes province name string for accurate lookup without false partial matches
 */
export function normalizeProvinceName(str: string): string {
  if (!str) return '';
  return str
    .trim()
    .toLowerCase()
    .replace(/^(tỉnh|thành phố|tp\.|tp)\s+/g, '')
    .trim();
}

/**
 * Precise lookup of standard CentralMeridianConfig by province name
 */
export function findKttConfigForProvince(provinceInput: string): CentralMeridianConfig | null {
  if (!provinceInput || !provinceInput.trim()) return null;
  const normalized = normalizeProvinceName(provinceInput);
  const all = getAllKttConfigs();

  // 1. Exact normalized match
  const exact = all.find(c => normalizeProvinceName(c.provinceName) === normalized || (c.provinceNameAlt && normalizeProvinceName(c.provinceNameAlt) === normalized));
  if (exact) return exact;

  // 2. Word boundary match to prevent "Quảng" from incorrectly matching "Quảng Bình" when typing "Quảng Trị"
  const wordBoundaryMatch = all.find(c => {
    const name = normalizeProvinceName(c.provinceName);
    return name === normalized;
  });
  if (wordBoundaryMatch) return wordBoundaryMatch;

  // 3. Fallback partial match ONLY if normalized string is >= 4 chars to prevent premature auto-selection
  if (normalized.length >= 4) {
    const partial = all.find(c => {
      const name = normalizeProvinceName(c.provinceName);
      return name.startsWith(normalized) || normalized.startsWith(name);
    });
    return partial || null;
  }

  return null;
}


/**
 * Check if selected KTT matches standard / alternative KTT for given province
 */
export function validateKttMatch(
  provinceInput: string,
  selectedKtt: number
): {
  isConfigured: boolean;
  isExactMatch: boolean;
  isAlternativeMatch: boolean;
  recommendedKtt?: number;
  projectionZone?: '3deg' | '6deg';
  config?: ProvinceKttConfig;
  message: string;
} {
  const config = findKttConfigForProvince(provinceInput);
  if (!config) {
    return {
      isConfigured: false,
      isExactMatch: false,
      isAlternativeMatch: false,
      message: `Chưa cấu hình KTT cho tỉnh/thành phố "${provinceInput}". Vui lòng chọn hoặc kiểm tra lại.`
    };
  }

  if (config.centralMeridian === selectedKtt) {
    return {
      isConfigured: true,
      isExactMatch: true,
      isAlternativeMatch: false,
      recommendedKtt: config.centralMeridian,
      projectionZone: config.projectionZone,
      config,
      message: `KTT ${selectedKtt}° hoàn toàn phù hợp với chuẩn VN-2000 của ${config.provinceName}.`
    };
  }

  if (config.alternativeMeridians && config.alternativeMeridians.includes(selectedKtt)) {
    return {
      isConfigured: true,
      isExactMatch: false,
      isAlternativeMatch: true,
      recommendedKtt: config.centralMeridian,
      projectionZone: config.projectionZone,
      config,
      message: `KTT ${selectedKtt}° là phương án bổ sung hợp lệ cho khu vực giáp ranh của ${config.provinceName} (Chuẩn chính: ${config.centralMeridian}°).`
    };
  }

  return {
    isConfigured: true,
    isExactMatch: false,
    isAlternativeMatch: false,
    recommendedKtt: config.centralMeridian,
    projectionZone: config.projectionZone,
    config,
    message: `Cảnh báo: KTT ${selectedKtt}° không khớp với Kinh tuyến trục chuẩn quy định của ${config.provinceName} (${config.centralMeridian}°). Vui lòng kiểm tra lại.`
  };
}

const LOCAL_STORAGE_KEY = 'vnrpbm_custom_ktt_configs';

export function getCustomKttConfigs(): CentralMeridianConfig[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

export function saveCustomKttConfig(config: CentralMeridianConfig): void {
  try {
    const current = getCustomKttConfigs();
    const idx = current.findIndex(c => c.provinceName.toLowerCase() === config.provinceName.toLowerCase());
    if (idx >= 0) {
      current[idx] = { ...config, isCustom: true };
    } else {
      current.push({ ...config, isCustom: true });
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  } catch (e) {
    console.error('Failed to save custom KTT config:', e);
  }
}

export function getAllKttConfigs(): CentralMeridianConfig[] {
  const custom = getCustomKttConfigs();
  const map = new Map<string, CentralMeridianConfig>();
  STANDARD_VN2000_PROVINCES.forEach(p => map.set(p.provinceName.toLowerCase(), p));
  custom.forEach(c => map.set(c.provinceName.toLowerCase(), c));
  return Array.from(map.values());
}

