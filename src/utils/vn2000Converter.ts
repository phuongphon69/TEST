/**
 * Utility for converting WGS84 Geographic Coordinates (Lat/Lng) 
 * to VN-2000 Transverse Mercator Plane Coordinates (X - Northing, Y - Easting in meters)
 * 
 * VN-2000 standard parameters:
 * - Ellipsoid WGS84: a = 6378137.0, f = 1/298.257223563
 * - Zone 3° scale factor k0 = 0.9999 (dùng phổ biến trong thi công rà phá bom mìn, đo đạc địa chính)
 * - Zone 6° scale factor k0 = 0.9996
 * - False Easting Y0 = 500,000m
 * - False Northing X0 = 0m
 */

export interface Vn2000Coordinate {
  x: number; // Northing (m) - Hướng Bắc (thường từ 1,000,000m - 2,500,000m)
  y: number; // Easting (m) - Hướng Đông (thường xung quanh 500,000m)
  alt?: number; // Altitude (m) - Độ cao
  ktt: number; // Kinh tuyến trục (độ)
  zone: '3deg' | '6deg';
}

/**
 * Converts Lat/Lng (WGS84) to VN-2000 (X, Y in meters)
 * @param lat Latitude in decimal degrees
 * @param lng Longitude in decimal degrees
 * @param alt Altitude in meters (optional)
 * @param ktt Central Meridian in degrees (default calculated or 106.0)
 * @param zone '3deg' or '6deg' (default '3deg')
 */
export function convertWgs84ToVn2000(
  lat: number,
  lng: number,
  alt?: number,
  ktt?: number,
  zone: '3deg' | '6deg' = '3deg'
): Vn2000Coordinate {
  // Determine central meridian if not supplied
  // Standard KTT for Central/Vietnam is around 106° for Quảng Trị / Thừa Thiên Huế / Đà Nẵng
  // Or round longitude to nearest 0.5 or 0.25 degree
  const centralMeridian = ktt !== undefined ? ktt : Math.round(lng * 4) / 4;

  const k0 = zone === '3deg' ? 0.9999 : 0.9996;
  const a = 6378137.0; // WGS84 semi-major axis
  const f = 1 / 298.257223563;
  const b = a * (1 - f);
  const e2 = (a * a - b * b) / (a * a);
  const ePrime2 = (a * a - b * b) / (b * b);

  const phi = (lat * Math.PI) / 180;
  const lambda = (lng * Math.PI) / 180;
  const lambda0 = (centralMeridian * Math.PI) / 180;

  // Arc length M
  const M =
    a *
    ((1 - e2 / 4 - (3 * e2 * e2) / 64 - (5 * e2 * e2 * e2) / 256) * phi -
      ((3 * e2) / 8 + (3 * e2 * e2) / 32 + (45 * e2 * e2 * e2) / 1024) * Math.sin(2 * phi) +
      ((15 * e2 * e2) / 256 + (45 * e2 * e2 * e2) / 1024) * Math.sin(4 * phi) -
      ((35 * e2 * e2 * e2) / 3072) * Math.sin(6 * phi));

  const N = a / Math.sqrt(1 - e2 * Math.sin(phi) * Math.sin(phi));
  const T = Math.tan(phi) * Math.tan(phi);
  const C = ePrime2 * Math.cos(phi) * Math.cos(phi);
  const A = (lambda - lambda0) * Math.cos(phi);

  // X (Northing)
  const X =
    k0 *
    (M +
      N *
        Math.tan(phi) *
        ((A * A) / 2 +
          ((5 - T + 9 * C + 4 * C * C) * Math.pow(A, 4)) / 24 +
          ((61 - 58 * T + T * T + 270 * C - 330 * ePrime2) * Math.pow(A, 6)) / 720));

  // Y (Easting)
  const Y =
    500000 +
    k0 *
      N *
      (A +
        ((1 - T + C) * Math.pow(A, 3)) / 6 +
        ((5 - 18 * T + T * T + 14 * C - 58 * T * C) * Math.pow(A, 5)) / 120);

  return {
    x: Number(X.toFixed(3)),
    y: Number(Y.toFixed(3)),
    alt: alt !== undefined ? Number(alt.toFixed(2)) : undefined,
    ktt: centralMeridian,
    zone
  };
}

import { findKttConfigForProvince, getAllKttConfigs } from './centralMeridianConfig';

/**
 * Dynamic Central Meridian (KTT) lookup object for provinces in Vietnam
 */
export const VIETNAM_PROVINCE_KTT: Record<string, number> = new Proxy({}, {
  get: (_, prop: string) => {
    const config = findKttConfigForProvince(prop);
    if (config) return config.centralMeridian;
    return 106.25; // Default fallback for Central Vietnam RPBM
  }
});

