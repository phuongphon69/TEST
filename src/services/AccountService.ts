import { User } from '../types';
import { getUsers, saveUsers } from '../utils/storage';
import {
  generateAccountEmail,
  ensureUniqueEmail,
  generateStrongTemporaryPassword,
  hashPassword
} from '../utils/userManagementUtils';
import { PermissionService } from './PermissionService';
import { AuditLogService } from './AuditLogService';
import { FirebaseAuthService } from './FirebaseAuthService';
import { MockAuthService } from './MockAuthService';

export class AccountService {
  /**
   * Create a new user account with secure password hashing and auth rollback
   */
  public static createAccount(userData: Partial<User>, rawPassword?: string): { user: User; tempPassword?: string } {
    PermissionService.assertPermission('account.create', 'Tạo tài khoản người dùng mới');

    if (!userData.name) {
      throw new Error('Họ và tên cán bộ không được để trống');
    }

    const users = getUsers();
    const suggestedEmail = userData.email || generateAccountEmail(userData.name);
    const cleanEmail = ensureUniqueEmail(suggestedEmail.trim().toLowerCase(), users);

    // Duplicate check
    const duplicate = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (duplicate) {
      throw new Error(`Email/Tên đăng nhập "${cleanEmail}" đã tồn tại cho cán bộ ${duplicate.name}.`);
    }

    const passwordToUse = rawPassword || generateStrongTemporaryPassword(12);
    const passHash = hashPassword(passwordToUse);

    const newUser: User = {
      id: userData.id || `user-${Date.now()}`,
      name: userData.name,
      email: cleanEmail,
      phone: userData.phone || '0989.93.0000',
      title: userData.title || 'Cán bộ Nghiệp vụ RPBM',
      role: userData.role || 'nhanvien',
      roleLabel: userData.roleLabel || '3.3. Nhân viên / Chuyên viên',
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      departmentOrUnit: userData.departmentOrUnit || 'Tiểu đoàn 93 - Binh chủng Công binh',
      permissions: userData.permissions || ['Xem dữ liệu được phân quyền'],
      detailedPermissions: userData.detailedPermissions,
      isLocked: false,
      status: 'active',
      mustChangePassword: true,
      passwordHash: passHash
    };

    // Rollback handling: Attempt Auth registration first; if database/localStorage profile save fails, rollback auth credentials
    let authCreated = false;
    try {
      // Step 1: Attempt Auth Sync
      if (FirebaseAuthService.isFirebaseConfigured()) {
        FirebaseAuthService.createUserInAuth(newUser.email, passwordToUse);
        authCreated = true;
      } else {
        MockAuthService.registerUser(newUser);
        authCreated = true;
      }

      // Step 2: Save to Storage Repository
      const updatedUsers = [newUser, ...users];
      saveUsers(updatedUsers, `Tạo tài khoản mới: ${newUser.name} (${newUser.email})`);

      AuditLogService.log({
        module: 'Quản trị Tài khoản',
        actionDetails: `Tạo mới tài khoản cán bộ thành công: ${newUser.name} (${newUser.email})`,
        actionType: 'tao',
        targetObject: 'User',
        targetObjectId: newUser.id,
        dataAfter: { id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role },
        result: 'success'
      });

      return { user: newUser, tempPassword: passwordToUse };
    } catch (err: any) {
      // Rollback Auth if storage save failed
      if (authCreated) {
        console.warn('Hồ sơ tài khoản lưu thất bại. Đang khôi phục (Rollback) tài khoản Auth...', err);
        if (FirebaseAuthService.isFirebaseConfigured()) {
          FirebaseAuthService.deleteUserInAuth(newUser.email);
        } else {
          MockAuthService.deleteUser(newUser.id);
        }
      }
      AuditLogService.log({
        module: 'Quản trị Tài khoản',
        actionDetails: `Tạo tài khoản thất bại cho ${newUser.name}: ${err.message}`,
        actionType: 'he_thong',
        result: 'failure'
      });
      throw new Error(`Tạo tài khoản thất bại: ${err.message}. Đã khôi phục trạng thái hệ thống.`);
    }
  }

  /**
   * Update existing user account
   */
  public static updateAccount(userId: string, updates: Partial<User>): User {
    PermissionService.assertPermission('account.update', 'Cập nhật tài khoản người dùng');

    const users = getUsers();
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    const existing = users[idx];

    // Prevent removing admin if it's the last active admin
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
      actionDetails: `Cập nhật thông tin tài khoản: ${updatedUser.name}`,
      actionType: 'chinh_sua',
      targetObject: 'User',
      targetObjectId: userId,
      dataBefore: { name: existing.name, role: existing.role },
      dataAfter: { name: updatedUser.name, role: updatedUser.role },
      result: 'success'
    });

    return updatedUser;
  }

  /**
   * Lock/Disable or unlock account
   */
  public static setAccountDisabledStatus(userId: string, isLocked: boolean): boolean {
    PermissionService.assertPermission('account.disable', 'Khóa/Mở khóa tài khoản');

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    if (isLocked && user.role === 'quantri') {
      const activeAdmins = users.filter(u => u.role === 'quantri' && !u.isLocked);
      if (activeAdmins.length <= 1) {
        throw new Error('Không thể khóa tài khoản Quản trị viên duy nhất!');
      }
    }

    const updated = users.map(u => (u.id === userId ? { ...u, isLocked } : u));
    saveUsers(updated, `${isLocked ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.name}`);

    AuditLogService.log({
      module: 'Quản trị Tài khoản',
      actionDetails: `${isLocked ? 'Khóa' : 'Mở khóa'} tài khoản cán bộ: ${user.name} (${user.email})`,
      actionType: 'thay_doi_trang_thai',
      targetObject: 'User',
      targetObjectId: userId,
      result: 'success'
    });

    return true;
  }

  /**
   * Reset user password
   */
  public static resetPassword(userId: string): { user: User; tempPassword: string } {
    PermissionService.assertPermission('account.resetPassword', 'Cấp lại mật khẩu tạm thời');

    const users = getUsers();
    const user = users.find(u => u.id === userId);
    if (!user) throw new Error(`Không tìm thấy tài khoản ID ${userId}`);

    const newTemp = generateStrongTemporaryPassword(12);
    const newHash = hashPassword(newTemp);

    const updatedUsers = users.map(u => (u.id === userId ? { ...u, passwordHash: newHash, mustChangePassword: true } : u));
    saveUsers(updatedUsers, `Reset mật khẩu tài khoản: ${user.name}`);

    AuditLogService.log({
      module: 'Quản trị Tài khoản',
      actionDetails: `Cấp lại mật khẩu tạm thời mới cho cán bộ: ${user.name} (${user.email})`,
      actionType: 'chinh_sua',
      targetObject: 'User',
      targetObjectId: userId,
      reason: 'Yêu cầu reset mật khẩu từ Quản trị viên',
      result: 'success'
    });

    return { user, tempPassword: newTemp };
  }
}
