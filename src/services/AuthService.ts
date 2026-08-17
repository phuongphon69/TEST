import { User } from '../types';
import { getCurrentUser, setCurrentUser, setLoggedInStatus, getUsers } from '../utils/storage';
import { FirebaseAuthService } from './FirebaseAuthService';
import { UserAccountSeedService } from './UserAccountSeedService';
import { AuditLogService } from './AuditLogService';

export class AuthService {
  /**
   * Check if system is using Firebase Auth vs Local Mock Auth
   */
  public static isFirebaseConfigured(): boolean {
    return FirebaseAuthService.isFirebaseConfigured();
  }

  /**
   * Get current authenticated user session
   */
  public static getCurrentUser(): User | null {
    const user = getCurrentUser();
    if (!user) {
      // Auto-init seed if first run
      const fixed = UserAccountSeedService.getFixedAccounts();
      if (fixed.length > 0) return fixed[0]; // Admin default fallback
    }
    return user;
  }

  /**
   * Log in user by email or username
   */
  public static login(emailOrUsername: string, passwordAttempt?: string): User {
    UserAccountSeedService.runSeed();
    const cleanInput = emailOrUsername.trim().toLowerCase();
    const users = getUsers();

    const matched = users.find(
      u => u.email.toLowerCase() === cleanInput || u.id.toLowerCase() === cleanInput
    );

    if (!matched) {
      AuditLogService.log({
        module: 'Cổng Đăng nhập',
        actionDetails: `Đăng nhập thất bại: Không tìm thấy tài khoản (${emailOrUsername})`,
        actionType: 'dang_nhap_that_bai',
        result: 'failure'
      });
      throw new Error('Thông tin đăng nhập không chính xác');
    }

    if (matched.isLocked || matched.status === 'locked') {
      AuditLogService.log({
        module: 'Cổng Đăng nhập',
        actionDetails: `Truy cập bị từ chối: Tài khoản ${matched.name} (${matched.email}) đã bị khóa`,
        actionType: 'bi_khoa',
        result: 'failure'
      });
      throw new Error('Tài khoản đã bị khóa. Vui lòng liên hệ Quản trị viên');
    }

    // Set active session
    setCurrentUser(matched);
    setLoggedInStatus(true);

    AuditLogService.log({
      module: 'Cổng Đăng nhập',
      actionDetails: `Đăng nhập thành công tài khoản [${matched.name}] (${matched.email})`,
      actionType: 'dang_nhap_thanh_cong',
      targetObject: 'User',
      targetObjectId: matched.id,
      result: 'success'
    });

    return matched;
  }

  /**
   * Log out user session
   */
  public static logout(): void {
    const user = getCurrentUser();
    if (user) {
      AuditLogService.log({
        module: 'Cổng Đăng nhập',
        actionDetails: `Đăng xuất khỏi hệ thống: [${user.name}] (${user.email})`,
        actionType: 'he_thong',
        result: 'success'
      });
    }
    setCurrentUser(null as any);
    setLoggedInStatus(false);
  }
}
