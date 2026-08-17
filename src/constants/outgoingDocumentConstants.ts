import { User } from '../types';

/**
 * Centralized group label for Outgoing Document Signers
 */
export const OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL = 'Chỉ huy Tiểu đoàn';

/**
 * Checks if a user account is active and eligible to sign outgoing documents.
 * Eligible roles: Battalion Commander (Tiểu đoàn trưởng), Deputy Commander (Phó Tiểu đoàn trưởng),
 * or users explicitly granted outgoing document signing permission.
 */
export function checkUserIsEligibleSigner(user: User): boolean {
  if (!user) return false;
  if (user.isLocked || user.status === 'locked') return false;

  const roleStr = (user.role || '').toLowerCase();
  const roleLabelStr = (user.roleLabel || '').toLowerCase();
  const titleStr = (user.title || '').toLowerCase();
  const permissions = user.permissions || [];

  // 1. Check if position or title is Battalion Commander or Deputy Commander
  const isCommanderPosition =
    /tiểu đoàn trưởng|phó tiểu đoàn trưởng/i.test(titleStr) ||
    /tiểu đoàn trưởng|phó tiểu đoàn trưởng/i.test(roleLabelStr) ||
    /tiểu đoàn trưởng|phó tiểu đoàn trưởng/i.test(roleStr);

  const isCommanderRoleCode = roleStr === 'chihuy' || roleStr === 'phochihuy';

  // 2. Check for explicit signing permission
  const hasSignPermission =
    permissions.includes('outgoingDocument.sign') ||
    permissions.includes('Phê duyệt & Ký văn bản hồ sơ') ||
    permissions.includes('Ký văn bản') ||
    permissions.includes('Chỉ huy toàn đơn vị') ||
    user.detailedPermissions?.canApproveDocs === true;

  // Pure staff/admin without commander position/permission cannot sign
  if (!isCommanderPosition && !isCommanderRoleCode && !hasSignPermission) {
    return false;
  }

  return true;
}

/**
 * Extracts Rank, Position, and Unit details for snapshot from a User account
 */
export function extractSignerRankAndPosition(user: User): { rank: string; position: string; unit: string } {
  let rank = '';
  let position = user.roleLabel || user.title || '';
  const unit = user.departmentOrUnit || 'Bộ phận bom mìn Tiểu đoàn 93';

  if (user.title) {
    const parts = user.title.split(/[-/]/).map(s => s.trim());
    if (parts.length >= 2) {
      rank = parts[0];
      position = parts.slice(1).join(' - ');
    } else {
      if (/thượng tá|trung tá|thiếu tá|đại úy|thượng úy|trung úy|thiếu úy/i.test(user.title)) {
        rank = user.title;
      }
    }
  }

  // Handle known fixed accounts for precise titles
  if (user.name === 'Đỗ Văn Dũng' || user.email?.includes('dung.dovan')) {
    rank = 'Thượng tá';
    position = 'Tiểu đoàn trưởng';
  } else if (user.name === 'Nguyễn Mạnh Cường' || user.email?.includes('cuong.nguyenmanh')) {
    rank = 'Trung tá';
    position = 'Phó Tiểu đoàn trưởng';
  }

  return { rank, position, unit };
}

/**
 * Validates outgoing document save requirements regarding signer
 */
export function validateOutgoingDocumentSave(
  docData: {
    signerUserId?: string;
    signerId?: string;
    signerName?: string;
  },
  availableUsers: User[]
): { isValid: boolean; errorMsg?: string; validSignerUser?: User } {
  const signerId = docData.signerUserId || docData.signerId;
  if (!signerId) {
    return {
      isValid: false,
      errorMsg: `Chưa chọn Người ký văn bản (${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL})`
    };
  }

  const targetUser = availableUsers.find(u => u.id === signerId);
  if (!targetUser) {
    return {
      isValid: false,
      errorMsg: `Tài khoản được chọn không tồn tại trong hệ thống`
    };
  }

  if (targetUser.isLocked || targetUser.status === 'locked') {
    return {
      isValid: false,
      errorMsg: `Tài khoản "${targetUser.name}" đã bị khóa, không thể chọn làm người ký văn bản`
    };
  }

  if (!checkUserIsEligibleSigner(targetUser)) {
    return {
      isValid: false,
      errorMsg: `Tài khoản "${targetUser.name}" không thuộc nhóm ${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL} đủ quyền ký văn bản`
    };
  }

  return {
    isValid: true,
    validSignerUser: targetUser
  };
}
