import { seedInitialPersonnelAndUsers } from '../utils/userManagementUtils';
import { PermissionService } from './PermissionService';
import { AuditLogService } from './AuditLogService';

export class SeedService {
  /**
   * Idempotent seed of default 4 personnel & system user accounts
   */
  public static seedSystemData(): boolean {
    PermissionService.assertPermission('system.seed', 'Khôi phục dữ liệu mẫu hệ thống');

    try {
      seedInitialPersonnelAndUsers();

      AuditLogService.log({
        module: 'Khởi tạo & Dữ liệu Mẫu',
        actionDetails: 'Khởi tạo / Đồng bộ dữ liệu mẫu hệ thống thành công (4 Cán bộ & Tài khoản mặc định).',
        actionType: 'he_thong',
        result: 'success'
      });

      return true;
    } catch (err: any) {
      AuditLogService.log({
        module: 'Khởi tạo & Dữ liệu Mẫu',
        actionDetails: `Khởi tạo dữ liệu mẫu thất bại: ${err.message}`,
        actionType: 'he_thong',
        result: 'failure'
      });
      throw err;
    }
  }
}
