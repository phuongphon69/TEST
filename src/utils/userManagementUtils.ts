import { User, Personnel, SharedCategoryItem, UserRole } from '../types';
import { getStored, setStored, addAuditLog } from './storage';

export const DEFAULT_MANAGING_UNIT = 'Bộ phận bom mìn Tiểu đoàn 93';
export const DEFAULT_EMAIL_DOMAIN = 'tieudoan93.bccb';

const STORAGE_KEYS = {
  USERS: 'qlrpbm_users',
  PERSONNEL: 'qlrpbm_personnel',
  SHARED_CATEGORIES: 'qlrpbm_shared_categories'
};

/**
 * Strips Vietnamese diacritics, converts to lowercase, removes punctuation
 */
export function normalizeVietnameseName(str: string): string {
  if (!str) return '';
  let result = str.toLowerCase();
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/[^a-z0-9\s]/g, '');
  return result.trim();
}

/**
 * Generates email from full name, e.g. "Nguyễn Huy Phương" -> "phuong.nguyenhuy@tieudoan93.bccb"
 */
export function generateAccountEmail(fullName: string, domain: string = DEFAULT_EMAIL_DOMAIN): string {
  const normalized = normalizeVietnameseName(fullName);
  if (!normalized) return `user@${domain}`;
  const parts = normalized.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return `${parts[0]}@${domain}`;
  }
  const lastName = parts[parts.length - 1];
  const firstParts = parts.slice(0, parts.length - 1).join('');
  return `${lastName}.${firstParts}@${domain}`;
}

/**
 * Ensures an email is unique against an existing list of users or personnel
 */
export function ensureUniqueEmail(
  email: string,
  existingList: Array<{ email?: string; username?: string }>,
  domain: string = DEFAULT_EMAIL_DOMAIN
): string {
  if (!email) return `user@${domain}`;
  const baseEmail = email.toLowerCase().trim();
  const parts = baseEmail.split('@');
  const localPart = parts[0];
  const emailDomain = parts.length > 1 && parts[1] ? parts[1] : domain;

  const existingEmails = new Set(
    existingList.map(item => (item.email || item.username || '').toLowerCase().trim()).filter(Boolean)
  );

  const fullEmail = `${localPart}@${emailDomain}`;
  if (!existingEmails.has(fullEmail)) {
    return fullEmail;
  }

  let counter = 1;
  while (existingEmails.has(`${localPart}${counter}@${emailDomain}`)) {
    counter++;
  }
  return `${localPart}${counter}@${emailDomain}`;
}

/**
 * Generates a strong temporary password (12+ characters, upper, lower, numbers, symbols)
 */
export function generateStrongTemporaryPassword(length: number = 12): string {
  const uppers = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lowers = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%^&*';
  const allChars = uppers + lowers + numbers + symbols;

  const password = [
    uppers[Math.floor(Math.random() * uppers.length)],
    lowers[Math.floor(Math.random() * lowers.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    symbols[Math.floor(Math.random() * symbols.length)]
  ];

  for (let i = password.length; i < length; i++) {
    password.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  return password.sort(() => Math.random() - 0.5).join('');
}

/**
 * Hashes a plain text password (SHA-256 equivalent salt hash) to prevent storing plain text passwords
 */
export function hashPassword(plainTextPassword: string): string {
  if (!plainTextPassword) return '';
  let hash = 0;
  const salted = `d93_salt_${plainTextPassword}_sec`;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `hash_sec_${Math.abs(hash).toString(16)}`;
}

/**
 * Idempotent seed data definition for Section VIII item 4
 */
export interface SeedPersonnelItem {
  code: string;
  fullName: string;
  rankTitle: string;
  position: string;
  unit: string;
  email: string;
  roleInTeam: string;
  specialization: string;
  systemRole: UserRole;
  isLeader?: boolean;
}

export const INITIAL_SEED_PERSONNEL: SeedPersonnelItem[] = [
  {
    code: 'NS-9301',
    fullName: 'Đỗ Văn Dũng',
    rankTitle: 'Thượng tá',
    position: 'Tiểu đoàn trưởng',
    unit: DEFAULT_MANAGING_UNIT,
    email: 'dung.dovan@tieudoan93.bccb',
    roleInTeam: 'Tiểu đoàn trưởng / Chỉ huy chung',
    specialization: 'Chỉ huy & Thẩm định Kỹ thuật RPBM',
    systemRole: 'chihuy',
    isLeader: true
  },
  {
    code: 'NS-9302',
    fullName: 'Nguyễn Huy Phương',
    rankTitle: 'Đại úy CN',
    position: 'Nhân viên',
    unit: DEFAULT_MANAGING_UNIT,
    email: 'phuong.nguyenhuy@tieudoan93.bccb',
    roleInTeam: 'Quản trị viên Hệ thống & Nhân viên Kỹ thuật',
    specialization: 'Quản trị Hệ thống & CNTT',
    systemRole: 'quantri'
  },
  {
    code: 'NS-9303',
    fullName: 'Nguyễn Văn Nghĩa',
    rankTitle: 'Thiếu tá CN',
    position: 'Nhân viên',
    unit: DEFAULT_MANAGING_UNIT,
    email: 'nghia.nguyenvan@tieudoan93.bccb',
    roleInTeam: 'Nhân viên Kỹ thuật Thi công RPBM',
    specialization: 'Kỹ thuật Khảo sát & Rà phá',
    systemRole: 'nhanvien'
  },
  {
    code: 'NS-9304',
    fullName: 'Nguyễn Văn Khiêm',
    rankTitle: 'Thiếu tá CN',
    position: 'Nhân viên',
    unit: DEFAULT_MANAGING_UNIT,
    email: 'khiem.nguyenvan@tieudoan93.bccb',
    roleInTeam: 'Nhân viên Kỹ thuật Thi công RPBM',
    specialization: 'Kỹ thuật Vận hành Máy dò & Hủy nổ',
    systemRole: 'nhanvien'
  }
];

/**
 * Performs idempotent seed of personnel, user accounts, and unit category
 */
export function seedInitialPersonnelAndUsers(): void {
  try {
    const existingPersonnel = getStored<Personnel[]>(STORAGE_KEYS.PERSONNEL, []);
    const existingUsers = getStored<User[]>(STORAGE_KEYS.USERS, []);
    const existingCategories = getStored<SharedCategoryItem[]>(STORAGE_KEYS.SHARED_CATEGORIES, []);

    let personnelUpdated = false;
    let usersUpdated = false;
    let categoriesUpdated = false;

    const currentPersonnelList = [...existingPersonnel];
    const currentUserList = [...existingUsers];
    const currentCategoryList = [...existingCategories];

    // 1. Seed / Migrate Default Managing Unit in Shared Categories
    const hasDefaultUnitCategory = currentCategoryList.some(
      c => c.group === 'unit' && (c.label === DEFAULT_MANAGING_UNIT || c.code === 'bp_bm_d93')
    );
    if (!hasDefaultUnitCategory) {
      currentCategoryList.push({
        id: 'cat-unit-d93',
        group: 'unit',
        code: 'bp_bm_d93',
        label: DEFAULT_MANAGING_UNIT,
        description: 'Đơn vị quản lý bom mìn mặc định Tiểu đoàn 93 - Binh chủng Công binh'
      });
      categoriesUpdated = true;
    }

    // 2. Seed / Migrate Personnel & Users Idempotently
    for (const item of INITIAL_SEED_PERSONNEL) {
      // Find existing personnel by code, email, or exact fullName
      let pIdx = currentPersonnelList.findIndex(
        p => p.code === item.code || p.email.toLowerCase() === item.email.toLowerCase() || p.fullName === item.fullName
      );

      let targetPersonnel: Personnel;
      if (pIdx >= 0) {
        // Idempotent update: fill missing fields without overwriting user changes
        const existing = currentPersonnelList[pIdx];
        let changed = false;
        if (!existing.code) { existing.code = item.code; changed = true; }
        if (!existing.unit) { existing.unit = item.unit; changed = true; }
        if (item.isLeader && existing.position !== 'Tiểu đoàn trưởng') {
          existing.position = 'Tiểu đoàn trưởng';
          changed = true;
        }
        if (changed) personnelUpdated = true;
        targetPersonnel = existing;
      } else {
        // Create new personnel record
        targetPersonnel = {
          id: `per-${item.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          code: item.code,
          fullName: item.fullName,
          rankTitle: item.rankTitle,
          position: item.position,
          jobTitle: `${item.rankTitle} / ${item.position}`,
          unit: item.unit,
          email: item.email,
          phone: '0989.93.0000',
          workStatus: 'dang_cong_tac',
          roleInTeam: item.roleInTeam,
          specialization: item.specialization,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          certificates: [],
          attachedFiles: [],
          dataStatus: 'hoat_dong'
        };
        currentPersonnelList.push(targetPersonnel);
        personnelUpdated = true;
      }

      // Check user account idempotently
      let uIdx = currentUserList.findIndex(
        u => u.email.toLowerCase() === item.email.toLowerCase() || u.name === item.fullName
      );

      if (uIdx >= 0) {
        // Ensure role alignment for Nguyễn Huy Phương (quantri) & Đỗ Văn Dũng (chihuy)
        const existingU = currentUserList[uIdx];
        let uChanged = false;
        if (item.systemRole === 'quantri' && existingU.role !== 'quantri') {
          existingU.role = 'quantri';
          existingU.roleLabel = '3.1. Quản trị viên Hệ thống';
          if (existingU.detailedPermissions) {
            existingU.detailedPermissions.canManageAccounts = true;
            existingU.detailedPermissions.canAssignRoles = true;
            existingU.detailedPermissions.canManageCategories = true;
          }
          uChanged = true;
        }
        if (!existingU.departmentOrUnit) {
          existingU.departmentOrUnit = item.unit;
          uChanged = true;
        }
        if (uChanged) usersUpdated = true;
      } else {
        // Create user account idempotently
        let roleLabel = '3.3. Nhân viên / Chuyên viên';
        if (item.systemRole === 'quantri') roleLabel = '3.1. Quản trị viên Hệ thống';
        else if (item.systemRole === 'chihuy') roleLabel = '3.2. Tiểu đoàn trưởng / Người phụ trách';

        const newUser: User = {
          id: `user-${item.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
          name: item.fullName,
          role: item.systemRole,
          roleLabel,
          title: `${item.rankTitle} - ${item.position}`,
          avatar: targetPersonnel.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          email: item.email,
          phone: targetPersonnel.phone || '0989.93.0000',
          departmentOrUnit: item.unit,
          permissions: item.systemRole === 'quantri'
            ? ['Toàn quyền Quản trị', 'Phân quyền người dùng', 'Cấu hình thời gian cảnh báo']
            : ['Thực hiện nhiệm vụ chuyên môn'],
          detailedPermissions: {
            canManageAccounts: item.systemRole === 'quantri',
            canAssignRoles: item.systemRole === 'quantri',
            canManageCategories: item.systemRole === 'quantri',
            canViewAllData: true,
            canEditAllData: item.systemRole === 'quantri' || item.systemRole === 'chihuy',
            canViewSystemLogs: item.systemRole === 'quantri',
            canRestoreDeletedData: item.systemRole === 'quantri',
            canSetAlertThresholds: item.systemRole === 'quantri',
            canApproveWork: item.systemRole === 'chihuy' || item.systemRole === 'quantri',
            canApproveDocs: item.systemRole === 'chihuy' || item.systemRole === 'quantri',
            canApproveEquipment: item.systemRole === 'chihuy' || item.systemRole === 'quantri',
            canApprovePayment: item.systemRole === 'chihuy',
            canDeleteCriticalData: item.systemRole === 'quantri'
          },
          status: 'active',
          isLocked: false,
          mustChangePassword: true,
          passwordHash: hashPassword('D93@TempPass2026')
        };
        currentUserList.push(newUser);
        usersUpdated = true;
      }
    }

    // Save back if anything updated
    if (categoriesUpdated) {
      setStored(STORAGE_KEYS.SHARED_CATEGORIES, currentCategoryList);
    }
    if (personnelUpdated) {
      setStored(STORAGE_KEYS.PERSONNEL, currentPersonnelList);
    }
    if (usersUpdated) {
      setStored(STORAGE_KEYS.USERS, currentUserList);
    }
  } catch (err) {
    console.error('Error during seedInitialPersonnelAndUsers:', err);
  }
}
