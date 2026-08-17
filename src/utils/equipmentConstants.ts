import { UXOEquipmentCategory } from '../types';

export interface EquipmentGroupOption {
  value: UXOEquipmentCategory;
  label: string;
}

/**
 * Centralized Equipment Groups Constant (Requirement Section VII)
 * Standard groups:
 * - Máy dò bom
 * - Máy dò mìn
 * - Máy định vị GPS
 * - Dụng cụ chuyên dụng khác
 */
export const OFFICIAL_EQUIPMENT_GROUPS: EquipmentGroupOption[] = [
  { value: 'may_do_bom', label: 'Máy dò bom' },
  { value: 'may_do_min', label: 'Máy dò mìn' },
  { value: 'gps', label: 'Máy định vị GPS' },
  { value: 'dung_cu_khac', label: 'Dụng cụ chuyên dụng khác' }
];

// Map for rendering category names, including legacy data protection
export const EQUIPMENT_GROUP_LABEL_MAP: Record<string, string> = {
  may_do_bom: 'Máy dò bom',
  may_do_min: 'Máy dò mìn',
  gps: 'Máy định vị GPS',
  dung_cu_khac: 'Dụng cụ chuyên dụng khác',
  // Legacy values preserved without breaking:
  may_do_bom_min: 'Máy dò bom / Máy dò mìn (Cũ)',
  may_toan_dac: 'Máy toàn đạc (Dữ liệu cũ)',
  bo_dam: 'Bộ đàm (Dữ liệu cũ)',
  thiet_bi_do_dac: 'Thiết bị đo đạc (Dữ liệu cũ)',
  thiet_bi_bao_ho: 'Thiết bị bảo hộ (Dữ liệu cũ)'
};

/**
 * Case-insensitive & whitespace-insensitive check if category is "Dụng cụ chuyên dụng khác"
 */
export function isOtherEquipmentGroup(category?: string): boolean {
  if (!category) return false;
  const clean = category.trim().toLowerCase().replace(/\s+/g, ' ');
  return (
    clean === 'dung_cu_khac' ||
    clean === 'dụng cụ chuyên dụng khác' ||
    clean === 'dung cu chuyen dung khac' ||
    clean.includes('dụng cụ') ||
    clean.includes('khác')
  );
}

/**
 * Safely resolve display label for any equipment group
 */
export function getEquipmentGroupLabel(category?: string, specificDesc?: string): string {
  if (!category) return 'Chưa xếp nhóm';
  const clean = category.trim().toLowerCase();

  if (isOtherEquipmentGroup(clean)) {
    return specificDesc && specificDesc.trim()
      ? `Dụng cụ chuyên dụng khác: ${specificDesc.trim()}`
      : 'Dụng cụ chuyên dụng khác';
  }

  return EQUIPMENT_GROUP_LABEL_MAP[clean] || category;
}
