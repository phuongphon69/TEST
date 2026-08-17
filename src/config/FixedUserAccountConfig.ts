import { UserRole } from '../types';

/**
 * Global Configuration for Fixed User Account Mode (Tiểu đoàn 93)
 */
export const fixedUserAccountMode = true;

export const DEFAULT_MANAGING_UNIT = 'Bộ phận bom mìn Tiểu đoàn 93';
export const DEFAULT_EMAIL_DOMAIN = 'tieudoan93.bccb';

/**
 * Standard Position & System Role Codes for QLRPBM System
 */
export enum PositionRoleCode {
  BATTALION_COMMANDER = 'chihuy',
  DEPUTY_BATTALION_COMMANDER = 'phochihuy',
  STAFF = 'nhanvien',
  SYSTEM_ADMIN = 'quantri'
}

export interface FixedAccountDefinition {
  id: string;
  code: string;
  fullName: string;
  rankTitle: string; // Cấp bậc (e.g. Thượng tá, Đại úy CN, Thiếu tá CN, Trung tá)
  position: string;  // Chức vụ chuyên môn (Tiểu đoàn trưởng, Phó Tiểu đoàn trưởng, Nhân viên)
  positionCode: 'BATTALION_COMMANDER' | 'DEPUTY_BATTALION_COMMANDER' | 'STAFF';
  systemRole: UserRole; // Role hệ thống (quantri, chihuy, phochihuy, nhanvien)
  roleLabel: string;
  email: string;
  phone: string;
  unit: string;
  avatar: string;
  permissions: string[];
}

/**
 * Exactly 5 Fixed Operational Accounts for Tiểu đoàn 93 (Document1.pdf Page 1)
 */
export const FIXED_USER_ACCOUNTS: FixedAccountDefinition[] = [
  {
    id: 'user-phuong',
    code: 'NS-9301',
    fullName: 'Nguyễn Huy Phương',
    rankTitle: 'Đại úy CN',
    position: 'Nhân viên',
    positionCode: 'STAFF',
    systemRole: 'quantri',
    roleLabel: 'Quản trị viên',
    email: 'phuong.nguyenhuy@tieudoan93.bccb',
    phone: '0989.930.001',
    unit: DEFAULT_MANAGING_UNIT,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'Quản trị hệ thống',
      'Quản lý tài khoản & phân quyền',
      'Reset & Điều chỉnh số văn bản',
      'Quản lý danh mục',
      'Xem audit log'
    ]
  },
  {
    id: 'user-dung',
    code: 'NS-9302',
    fullName: 'Đỗ Văn Dũng',
    rankTitle: 'Thượng tá',
    position: 'Tiểu đoàn trưởng',
    positionCode: 'BATTALION_COMMANDER',
    systemRole: 'chihuy',
    roleLabel: 'Tiểu đoàn trưởng',
    email: 'dung.dovan@tieudoan93.bccb',
    phone: '0989.930.002',
    unit: DEFAULT_MANAGING_UNIT,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'Chỉ huy toàn đơn vị',
      'Phê duyệt & Ký văn bản hồ sơ',
      'Giao xử lý nhiệm vụ',
      'Nghiệm thu dự án'
    ]
  },
  {
    id: 'user-nghia',
    code: 'NS-9303',
    fullName: 'Nguyễn Văn Nghĩa',
    rankTitle: 'Thiếu tá CN',
    position: 'Nhân viên',
    positionCode: 'STAFF',
    systemRole: 'nhanvien',
    roleLabel: 'Nhân viên',
    email: 'nghia.nguyenvan@tieudoan93.bccb',
    phone: '0989.930.003',
    unit: DEFAULT_MANAGING_UNIT,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'Thực hiện nhiệm vụ chuyên môn',
      'Tiếp nhận & Xử lý hồ sơ được giao',
      'Cập nhật tiến độ thi công'
    ]
  },
  {
    id: 'user-cuong',
    code: 'NS-9304',
    fullName: 'Nguyễn Mạnh Cường',
    rankTitle: 'Trung tá',
    position: 'Phó Tiểu đoàn trưởng',
    positionCode: 'DEPUTY_BATTALION_COMMANDER',
    systemRole: 'phochihuy',
    roleLabel: 'Phó Tiểu đoàn trưởng',
    email: 'cuong.nguyenmanh@tieudoan93.bccb',
    phone: '0989.930.004',
    unit: DEFAULT_MANAGING_UNIT,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'Xem & Xử lý hồ sơ theo phạm vi',
      'Ủy quyền giao việc & Phê duyệt',
      'Xem báo cáo nghiệp vụ'
    ]
  },
  {
    id: 'user-khiem',
    code: 'NS-9305',
    fullName: 'Nguyễn Văn Khiêm',
    rankTitle: 'Thiếu tá CN',
    position: 'Nhân viên',
    positionCode: 'STAFF',
    systemRole: 'nhanvien',
    roleLabel: 'Nhân viên',
    email: 'khiem.nguyenvan@tieudoan93.bccb',
    phone: '0989.930.005',
    unit: DEFAULT_MANAGING_UNIT,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    permissions: [
      'Thực hiện nhiệm vụ chuyên môn',
      'Vận hành máy dò & Hủy nổ',
      'Cập nhật nhật ký hiện trường'
    ]
  }
];
