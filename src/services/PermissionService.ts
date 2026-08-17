import { User, UserRole } from '../types';
import { getCurrentUser } from '../utils/storage';

export type PermissionKey =
  | 'account.create'
  | 'account.update'
  | 'account.disable'
  | 'account.resetPassword'
  | 'outgoingDocument.number.reset'
  | 'outgoingDocument.number.override'
  | 'outgoingDocument.number.insert'
  | 'incomingDocument.assign'
  | 'appraisalNotice.create'
  | 'personnel.export'
  | 'vehicle.viewStatistics'
  | 'system.seed';

export class PermissionService {
  /**
   * Check if user (or current user if null) has specific permission
   */
  public static hasPermission(userOrRole?: User | UserRole | string | null, permission?: PermissionKey): boolean {
    let user: User | null = null;
    let roleStr = 'nhanvien';

    if (typeof userOrRole === 'object' && userOrRole !== null) {
      user = userOrRole;
      roleStr = user.role || 'nhanvien';
    } else if (typeof userOrRole === 'string') {
      roleStr = userOrRole;
      user = getCurrentUser();
    } else {
      user = getCurrentUser();
      roleStr = user?.role || 'nhanvien';
    }

    const normRole = roleStr.toLowerCase();

    // System Admin (quantri) has full permission
    if (normRole === 'quantri' || normRole === 'quan_tri_vien') {
      return true;
    }

    if (!permission) return true;

    // Check specific permission matrix by role
    switch (permission) {
      case 'account.create':
      case 'account.update':
      case 'account.disable':
      case 'account.resetPassword':
      case 'outgoingDocument.number.reset':
      case 'outgoingDocument.number.override':
      case 'outgoingDocument.number.insert':
      case 'system.seed':
        // Only Admin (quantri) can manage accounts & reset document number rules
        return normRole === 'quantri';

      case 'incomingDocument.assign':
      case 'appraisalNotice.create':
        // Commander (chihuy) or Admin (quantri) or Clerk (vanthu)
        return normRole === 'chihuy' || normRole === 'quantri' || normRole === 'vanthu';

      case 'personnel.export':
      case 'vehicle.viewStatistics':
        // Commander, Admin, Tech staff, Equipment staff, Clerk
        return normRole !== 'nhanvien' || (user ? !user.isLocked : true);

      default:
        return false;
    }
  }

  /**
   * Enforce permission in services/repositories. Throws error if unauthorized.
   */
  public static assertPermission(permission: PermissionKey, actionDescription?: string): void {
    const user = getCurrentUser();
    if (!this.hasPermission(user, permission)) {
      const msg = `Truy cập bị từ chối: Cán bộ ${user?.name || 'Vô danh'} (${user?.role || 'nhanvien'}) không có quyền [${permission}] để thực hiện "${actionDescription || 'thao tác này'}".`;
      throw new Error(msg);
    }
  }
}
