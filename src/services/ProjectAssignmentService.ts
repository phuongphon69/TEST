import { User } from '../types';
import { UserAccountRepository } from './UserAccountRepository';

export class ProjectAssignmentService {
  /**
   * Checks whether a system user account is eligible to be assigned as a project manager/responsible user.
   * Requirements:
   * 1. Account exists and is active (not locked, not expired).
   * 2. Has project management, assignment, or participation rights based on roles or permissions.
   */
  public static canBeAssignedAsProjectManager(userAccount?: User | null): boolean {
    if (!userAccount) return false;

    // Check account status
    if (userAccount.isLocked === true) return false;
    if (userAccount.status === 'locked' || userAccount.status === 'expired') return false;

    // Check system role or permissions
    // Roles: 'quantri' (Quản trị viên), 'chihuy' (Tiểu đoàn trưởng/Phó TĐT), or 'nhanvien' (Nhân viên)
    const role = userAccount.role;
    if (role === 'quantri' || role === 'chihuy') {
      return true; // Command & Admin roles always allowed
    }

    // Check permissions list for 'nhanvien' or other roles
    const perms = userAccount.permissions || [];
    const detailed = userAccount.detailedPermissions || {};

    const hasProjectPermission =
      perms.includes('project.manage') ||
      perms.includes('project.assign') ||
      perms.includes('project.participate') ||
      perms.includes('project.edit') ||
      perms.includes('du_an') ||
      detailed.canApproveWork === true ||
      detailed.canEditAllData === true ||
      detailed.canViewAllData === true;

    // If role is staff, check if they have project permissions or if no granular restriction is enforced
    if (role === 'nhanvien') {
      return perms.length === 0 || hasProjectPermission;
    }

    return hasProjectPermission;
  }

  /**
   * Retrieves all eligible system user accounts that can be assigned to manage projects.
   */
  public static getAssignableProjectManagers(customUsersList?: User[]): User[] {
    const allUsers = customUsersList || UserAccountRepository.getAll();
    return allUsers.filter(u => this.canBeAssignedAsProjectManager(u));
  }

  /**
   * Maps legacy text-based responsible person names to system accounts if possible.
   * Does not lose historical data if mapping fails.
   */
  public static mapLegacyResponsiblePerson(
    legacyName?: string | null,
    allUsers?: User[]
  ): {
    user: User | null;
    isUnlinked: boolean;
    warningMessage?: string;
  } {
    if (!legacyName || !legacyName.trim()) {
      return { user: null, isUnlinked: false };
    }

    const users = allUsers || UserAccountRepository.getAll();
    const normalizedQuery = legacyName.trim().toLowerCase();

    // Remove rank prefixes for soft matching (e.g. "Đại tá ", "Đại úy ", "Thượng tá ")
    const cleanName = normalizedQuery
      .replace(/^(đại tá|thượng tá|trung tá|thiếu tá|đại úy|thượng úy|trung úy|thiếu úy|chuẩn úy)\s+/i, '')
      .trim();

    // Exact name or email match first
    const exactMatches = users.filter(
      u => u.name.trim().toLowerCase() === normalizedQuery || u.email.trim().toLowerCase() === normalizedQuery
    );

    if (exactMatches.length === 1) {
      return { user: exactMatches[0], isUnlinked: false };
    }

    // Clean name match
    const cleanMatches = users.filter(u => {
      const uClean = u.name
        .trim()
        .toLowerCase()
        .replace(/^(đại tá|thượng tá|trung tá|thiếu tá|đại úy|thượng úy|trung úy|thiếu úy|chuẩn úy)\s+/i, '')
        .trim();
      return uClean === cleanName;
    });

    if (cleanMatches.length === 1) {
      return { user: cleanMatches[0], isUnlinked: false };
    }

    // Unlinked or ambiguous
    return {
      user: null,
      isUnlinked: true,
      warningMessage: 'Người phụ trách cũ chưa được liên kết với tài khoản hệ thống'
    };
  }
}
