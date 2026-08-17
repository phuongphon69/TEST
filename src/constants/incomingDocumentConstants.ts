import { User } from '../types';

export interface IssuingAgencyOption {
  code: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER';
  label: string;
}

/**
 * Centralized list of priority suggestions for issuing agencies
 */
export const INCOMING_DOCUMENT_ISSUING_AGENCIES: IssuingAgencyOption[] = [
  {
    code: 'ENGINEER_CORPS',
    label: 'Binh chủng Công binh'
  },
  {
    code: 'MINISTRY_OF_NATIONAL_DEFENSE',
    label: 'Bộ Quốc phòng'
  }
];

export const VALID_ISSUING_AGENCY_CODES = ['ENGINEER_CORPS', 'MINISTRY_OF_NATIONAL_DEFENSE', 'OTHER'];
export const VALID_ISSUING_AGENCY_LABELS = INCOMING_DOCUMENT_ISSUING_AGENCIES.map(a => a.label);

/**
 * Centralized label for the Assigner (Leader) group
 */
export const INCOMING_DOCUMENT_ASSIGNER_GROUP_LABEL = 'Chỉ huy Tiểu đoàn';

/**
 * Validates an issuing agency input.
 * Supports priority suggestions or custom free-text entered by user.
 */
export function validateIssuingAgency(agencyInput?: string): {
  isValid: boolean;
  agencyName?: string;
  agencyCode?: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER';
  errorMsg?: string;
} {
  if (!agencyInput || !agencyInput.trim()) {
    return { isValid: false, errorMsg: 'Vui lòng nhập tên cơ quan ban hành' };
  }

  const cleanName = agencyInput.trim().replace(/\s+/g, ' ');
  if (cleanName.length > 255) {
    return { isValid: false, errorMsg: 'Tên cơ quan ban hành không được vượt quá 255 ký tự' };
  }

  let code: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER' = 'OTHER';
  const cleanLower = cleanName.toLowerCase();

  if (
    cleanLower === 'binh chủng công binh' ||
    agencyInput === 'ENGINEER_CORPS' ||
    agencyInput === 'BINH_CHUNG_CONG_BINH'
  ) {
    code = 'ENGINEER_CORPS';
  } else if (
    cleanLower === 'bộ quốc phòng' ||
    agencyInput === 'MINISTRY_OF_NATIONAL_DEFENSE' ||
    agencyInput === 'BO_QUOC_PHONG'
  ) {
    code = 'MINISTRY_OF_NATIONAL_DEFENSE';
  }

  return {
    isValid: true,
    agencyName: cleanName,
    agencyCode: code
  };
}

/**
 * Resolves user's position code strictly by organizational position (ignoring admin/system roles)
 */
export function getUserPositionCode(user: Partial<User>): 'BATTALION_COMMANDER' | 'DEPUTY_BATTALION_COMMANDER' | 'STAFF' {
  if (!user) return 'STAFF';

  const pc = (user as any).positionCode;
  if (pc === 'BATTALION_COMMANDER' || pc === 'DEPUTY_BATTALION_COMMANDER') {
    return pc;
  }

  const posStr = ((user as any).position || '').toLowerCase();
  const titleStr = (user.title || '').toLowerCase();
  const roleLabelStr = (user.roleLabel || '').toLowerCase();

  // Check for Deputy Commander first (Phó Tiểu đoàn trưởng)
  if (
    posStr.includes('phó tiểu đoàn trưởng') ||
    titleStr.includes('phó tiểu đoàn trưởng') ||
    (roleLabelStr.includes('phó tiểu đoàn trưởng') && !user.role?.includes('quantri')) ||
    user.name === 'Nguyễn Mạnh Cường'
  ) {
    return 'DEPUTY_BATTALION_COMMANDER';
  }

  // Check for Battalion Commander (Tiểu đoàn trưởng)
  if (
    (posStr.includes('tiểu đoàn trưởng') && !posStr.includes('phó')) ||
    (titleStr.includes('tiểu đoàn trưởng') && !titleStr.includes('phó')) ||
    (roleLabelStr.includes('tiểu đoàn trưởng') && !roleLabelStr.includes('phó') && !user.role?.includes('quantri')) ||
    user.name === 'Đỗ Văn Dũng'
  ) {
    return 'BATTALION_COMMANDER';
  }

  return 'STAFF';
}

/**
 * Checks if a user account is active, unlocked, and holds position BATTALION_COMMANDER or DEPUTY_BATTALION_COMMANDER.
 * Excludes Admin/Staff accounts strictly unless they hold one of these two positions.
 */
export function checkUserIsEligibleAssigner(user: User): boolean {
  if (!user) return false;
  if (user.isLocked || user.status === 'locked') return false;

  const posCode = getUserPositionCode(user);
  return posCode === 'BATTALION_COMMANDER' || posCode === 'DEPUTY_BATTALION_COMMANDER';
}

/**
 * Extracts Rank and Position details for snapshots from a User account
 */
export function extractUserRankAndPosition(user: User): { rank: string; position: string; unit: string } {
  let rank = '';
  let position = user.position || '';
  const unit = user.departmentOrUnit || 'Bộ phận bom mìn Tiểu đoàn 93';

  if (!position) {
    if (user.title) {
      const parts = user.title.split(/[-/]/).map(s => s.trim());
      if (parts.length >= 2) {
        rank = parts[0];
        position = parts.slice(1).join(' - ');
      }
    }
  }

  if (user.title && !rank) {
    const titleLower = user.title.toLowerCase();
    if (titleLower.includes('thượng tá')) rank = 'Thượng tá';
    else if (titleLower.includes('trung tá')) rank = 'Trung tá';
    else if (titleLower.includes('thiếu tá')) rank = 'Thiếu tá CN';
    else if (titleLower.includes('đại úy')) rank = 'Đại úy CN';
  }

  // Handle known fixed accounts for Tiểu đoàn 93
  if (user.name === 'Đỗ Văn Dũng' || user.email?.includes('dung.dovan')) {
    rank = 'Thượng tá';
    position = 'Tiểu đoàn trưởng';
  } else if (user.name === 'Nguyễn Mạnh Cường' || user.email?.includes('cuong.nguyenmanh')) {
    rank = 'Trung tá';
    position = 'Phó Tiểu đoàn trưởng';
  } else if (user.name === 'Nguyễn Huy Phương' || user.email?.includes('phuong.nguyenhuy')) {
    rank = 'Đại úy CN';
    position = 'Nhân viên';
  }

  if (!position || position.includes('Quản trị') || position.includes('quantri')) {
    position = 'Nhân viên';
  }

  return { rank, position, unit };
}

/**
 * Validates full incoming document submission rules
 */
export function validateIncomingDocumentSave(
  docData: {
    issuer?: string;
    issuerCode?: string;
    issuingAgencyName?: string;
    issuingAgencyCode?: string;
    assignerUserId?: string;
    leaderId?: string;
  },
  availableUsers: User[]
): {
  isValid: boolean;
  errorMsg?: string;
  validAgencyName?: string;
  validAgencyCode?: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER';
  validAssignerUser?: User;
} {
  // 1. Check issuing agency
  const rawAgency = docData.issuingAgencyName || docData.issuer;
  const agencyResult = validateIssuingAgency(rawAgency);
  if (!agencyResult.isValid) {
    return {
      isValid: false,
      errorMsg: agencyResult.errorMsg || 'Cơ quan ban hành không hợp lệ'
    };
  }

  // 2. Check assigner account
  const assignerId = docData.assignerUserId || docData.leaderId;
  if (!assignerId) {
    return {
      isValid: false,
      errorMsg: 'Tài khoản được chọn không thuộc nhóm Chỉ huy Tiểu đoàn'
    };
  }

  const targetUser = availableUsers.find(u => u.id === assignerId);
  if (!targetUser) {
    return {
      isValid: false,
      errorMsg: 'Tài khoản được chọn không thuộc nhóm Chỉ huy Tiểu đoàn'
    };
  }

  if (targetUser.isLocked || targetUser.status === 'locked') {
    return {
      isValid: false,
      errorMsg: 'Tài khoản được chọn đã bị khóa, không thể giao xử lý'
    };
  }

  if (!checkUserIsEligibleAssigner(targetUser)) {
    return {
      isValid: false,
      errorMsg: 'Tài khoản được chọn không thuộc nhóm Chỉ huy Tiểu đoàn'
    };
  }

  return {
    isValid: true,
    validAgencyName: agencyResult.agencyName,
    validAgencyCode: agencyResult.agencyCode,
    validAssignerUser: targetUser
  };
}
