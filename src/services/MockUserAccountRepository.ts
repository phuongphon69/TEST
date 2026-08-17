import { User } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import { UserAccountSeedService } from './UserAccountSeedService';
import { AuditLogService } from './AuditLogService';
import { generateStrongTemporaryPassword, hashPassword } from '../utils/userManagementUtils';

export class MockUserAccountRepository {
  public static getAll(): User[] {
    return UserAccountSeedService.getFixedAccounts();
  }

  public static getById(userId: string): User | null {
    const users = this.getAll();
    return users.find(u => u.id === userId) || null;
  }

  public static update(userId: string, updates: Partial<User>, actorName?: string): User {
    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    const existing = users[idx];

    // Guard: Prevent demoting the last active System Admin
    if (existing.role === 'quantri' && updates.role && updates.role !== 'quantri') {
      const activeAdmins = users.filter(u => u.role === 'quantri' && !u.isLocked);
      if (activeAdmins.length <= 1) {
        throw new Error('Không thể thay đổi vai trò của Quản trị viên duy nhất còn lại!');
      }
    }

    const updatedUser: User = {
      ...existing,
      ...updates,
      email: updates.email ? updates.email.trim().toLowerCase() : existing.email
    };

    users[idx] = updatedUser;
    saveUsers(users, `Cập nhật tài khoản: ${updatedUser.name}`);

    AuditLogService.log({
      module: 'Quản trị Tài khoản',
      actionDetails: `Cập nhật thông tin tài khoản: ${updatedUser.name} (${updatedUser.email}). Thực hiện bởi: ${actorName || 'Hệ thống'}`,
      actionType: 'chinh_sua',
      targetObject: 'User',
      targetObjectId: userId,
      dataBefore: { name: existing.name, role: existing.role, permissions: existing.permissions },
      dataAfter: { name: updatedUser.name, role: updatedUser.role, permissions: updatedUser.permissions },
      result: 'success'
    });

    return updatedUser;
  }

  public static setLockStatus(userId: string, isLocked: boolean, reason: string, actorName?: string): boolean {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    if (isLocked && user.role === 'quantri') {
      const activeAdmins = users.filter(u => u.role === 'quantri' && !u.isLocked);
      if (activeAdmins.length <= 1) {
        throw new Error('Không thể khóa tài khoản Quản trị viên duy nhất còn lại!');
      }
    }

    const updated = users.map(u => (u.id === userId ? { ...u, isLocked, status: isLocked ? ('locked' as const) : ('active' as const) } : u));
    saveUsers(updated, `${isLocked ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.name}`);

    AuditLogService.log({
      module: 'Quản trị Tài khoản',
      actionDetails: `${isLocked ? 'Khóa' : 'Mở khóa'} tài khoản cán bộ: ${user.name} (${user.email}). Lý do: ${reason || 'Không ghi rõ'}. Người thực hiện: ${actorName || 'Hệ thống'}`,
      actionType: 'thay_doi_trang_thai',
      targetObject: 'User',
      targetObjectId: userId,
      reason,
      result: 'success'
    });

    return true;
  }

  public static resetPassword(userId: string, actorName?: string): { user: User; tempPassword: string } {
    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    const tempPassword = generateStrongTemporaryPassword(12);
    const passHash = hashPassword(tempPassword);

    const updated = users.map(u => (u.id === userId ? { ...u, passwordHash: passHash, mustChangePassword: true } : u));
    saveUsers(updated, `Reset mật khẩu tài khoản: ${user.name}`);

    AuditLogService.log({
      module: 'Quản trị Tài khoản',
      actionDetails: `Cấp lại mật khẩu tạm thời cho cán bộ: ${user.name} (${user.email}). Thực hiện bởi: ${actorName || 'Quản trị viên'}`,
      actionType: 'chinh_sua',
      targetObject: 'User',
      targetObjectId: userId,
      reason: 'Yêu cầu reset mật khẩu',
      result: 'success'
    });

    return { user, tempPassword };
  }
}
