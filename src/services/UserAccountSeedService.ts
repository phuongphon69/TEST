import {
  FIXED_USER_ACCOUNTS,
  DEFAULT_MANAGING_UNIT,
  fixedUserAccountMode
} from '../config/FixedUserAccountConfig';
import { User, Personnel, SharedCategoryItem } from '../types';
import { getStored, setStored } from '../utils/storage';
import { hashPassword } from '../utils/userManagementUtils';
import { AuditLogService } from './AuditLogService';

const STORAGE_KEYS = {
  USERS: 'qlrpbm_users',
  PERSONNEL: 'qlrpbm_personnel',
  SHARED_CATEGORIES: 'qlrpbm_shared_categories'
};

export class UserAccountSeedService {
  /**
   * Run idempotent seed for the 5 fixed accounts of Tiểu đoàn 93
   */
  public static runSeed(): { success: boolean; usersCount: number; updated: boolean } {
    try {
      const existingPersonnel = getStored<Personnel[]>(STORAGE_KEYS.PERSONNEL, []);
      const existingUsers = getStored<User[]>(STORAGE_KEYS.USERS, []);
      const existingCategories = getStored<SharedCategoryItem[]>(STORAGE_KEYS.SHARED_CATEGORIES, []);

      let personnelChanged = false;
      let usersChanged = false;
      let categoriesChanged = false;

      const personnelList = [...existingPersonnel];
      const userList = [...existingUsers];
      const categoryList = [...existingCategories];

      // 1. Ensure Managing Unit category exists and is standardized
      const hasUnit = categoryList.some(
        c => c.group === 'unit' && (c.label === DEFAULT_MANAGING_UNIT || c.code === 'bp_bm_d93')
      );
      if (!hasUnit) {
        categoryList.push({
          id: 'cat-unit-d93',
          group: 'unit',
          code: 'bp_bm_d93',
          label: DEFAULT_MANAGING_UNIT,
          description: 'Đơn vị quản lý bom mìn mặc định Tiểu đoàn 93 - Binh chủng Công binh'
        });
        categoriesChanged = true;
      }

      // 2. Iterate through the 5 FIXED ACCOUNTS definitions
      for (const fixedAcc of FIXED_USER_ACCOUNTS) {
        const cleanEmail = fixedAcc.email.toLowerCase().trim();

        // --- A. Sync Personnel Record ---
        let pIndex = personnelList.findIndex(
          p => (p.email && p.email.toLowerCase().trim() === cleanEmail) ||
               p.fullName === fixedAcc.fullName ||
               p.code === fixedAcc.code
        );

        let linkedPersonnel: Personnel;
        if (pIndex >= 0) {
          // Idempotently update mandatory fields
          const existingP = personnelList[pIndex];
          let pUpdated = false;
          if (existingP.unit !== DEFAULT_MANAGING_UNIT) {
            existingP.unit = DEFAULT_MANAGING_UNIT;
            pUpdated = true;
          }
          if (existingP.email.toLowerCase().trim() !== cleanEmail) {
            existingP.email = cleanEmail;
            pUpdated = true;
          }
          if (existingP.rankTitle !== fixedAcc.rankTitle) {
            existingP.rankTitle = fixedAcc.rankTitle;
            pUpdated = true;
          }
          if (existingP.position !== fixedAcc.position) {
            existingP.position = fixedAcc.position;
            pUpdated = true;
          }
          if (!existingP.code) {
            existingP.code = fixedAcc.code;
            pUpdated = true;
          }
          if (pUpdated) personnelChanged = true;
          linkedPersonnel = existingP;
        } else {
          // Create new personnel record
          linkedPersonnel = {
            id: `per-${fixedAcc.code.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
            code: fixedAcc.code,
            fullName: fixedAcc.fullName,
            rankTitle: fixedAcc.rankTitle,
            position: fixedAcc.position,
            jobTitle: `${fixedAcc.rankTitle} / ${fixedAcc.position}`,
            unit: DEFAULT_MANAGING_UNIT,
            email: cleanEmail,
            phone: fixedAcc.phone,
            workStatus: 'dang_cong_tac',
            roleInTeam: `${fixedAcc.position} - ${DEFAULT_MANAGING_UNIT}`,
            specialization: fixedAcc.position === 'Tiểu đoàn trưởng' ? 'Chỉ huy & Thẩm định Kỹ thuật RPBM' : 'Kỹ thuật Rà phá Bom mìn',
            avatar: fixedAcc.avatar,
            certificates: [],
            attachedFiles: [],
            dataStatus: 'hoat_dong'
          };
          personnelList.push(linkedPersonnel);
          personnelChanged = true;
        }

        // --- B. Sync User Account Record ---
        let uIndex = userList.findIndex(
          u => (u.email && u.email.toLowerCase().trim() === cleanEmail) ||
               u.name === fixedAcc.fullName ||
               u.id === fixedAcc.id
        );

        if (uIndex >= 0) {
          const existingU = userList[uIndex];
          let uUpdated = false;

          if (existingU.departmentOrUnit !== DEFAULT_MANAGING_UNIT) {
            existingU.departmentOrUnit = DEFAULT_MANAGING_UNIT;
            uUpdated = true;
          }
          if (existingU.role !== fixedAcc.systemRole) {
            existingU.role = fixedAcc.systemRole;
            existingU.roleLabel = fixedAcc.roleLabel;
            uUpdated = true;
          }
          if (existingU.email.toLowerCase().trim() !== cleanEmail) {
            existingU.email = cleanEmail;
            uUpdated = true;
          }
          if (existingU.phone !== fixedAcc.phone && fixedAcc.phone) {
            existingU.phone = fixedAcc.phone;
            uUpdated = true;
          }
          if (existingU.position !== fixedAcc.position) {
            existingU.position = fixedAcc.position;
            uUpdated = true;
          }
          if (existingU.positionCode !== fixedAcc.positionCode) {
            existingU.positionCode = fixedAcc.positionCode;
            uUpdated = true;
          }
          if (!existingU.permissions || existingU.permissions.length === 0) {
            existingU.permissions = fixedAcc.permissions;
            uUpdated = true;
          }

          if (uUpdated) usersChanged = true;
        } else {
          // Create user account record
          const newU: User = {
            id: fixedAcc.id,
            name: fixedAcc.fullName,
            role: fixedAcc.systemRole,
            roleLabel: fixedAcc.roleLabel,
            title: `${fixedAcc.rankTitle} - ${fixedAcc.position}`,
            position: fixedAcc.position,
            positionCode: fixedAcc.positionCode,
            avatar: fixedAcc.avatar,
            email: cleanEmail,
            phone: fixedAcc.phone,
            departmentOrUnit: DEFAULT_MANAGING_UNIT,
            permissions: fixedAcc.permissions,
            detailedPermissions: {
              canManageAccounts: fixedAcc.systemRole === 'quantri',
              canAssignRoles: fixedAcc.systemRole === 'quantri',
              canManageCategories: fixedAcc.systemRole === 'quantri',
              canViewAllData: true,
              canEditAllData: fixedAcc.systemRole === 'quantri' || fixedAcc.systemRole === 'chihuy' || fixedAcc.systemRole === 'phochihuy',
              canViewSystemLogs: fixedAcc.systemRole === 'quantri',
              canRestoreDeletedData: fixedAcc.systemRole === 'quantri',
              canSetAlertThresholds: fixedAcc.systemRole === 'quantri',
              canApproveWork: fixedAcc.systemRole === 'chihuy' || fixedAcc.systemRole === 'phochihuy',
              canApproveDocs: fixedAcc.systemRole === 'chihuy',
              canApproveEquipment: fixedAcc.systemRole === 'chihuy',
              canApprovePayment: fixedAcc.systemRole === 'chihuy',
              canDeleteCriticalData: fixedAcc.systemRole === 'quantri'
            },
            status: 'active',
            isLocked: false,
            mustChangePassword: false,
            passwordHash: hashPassword('D93@Pass2026')
          };
          userList.push(newU);
          usersChanged = true;
        }
      }

      // Save changes if any
      if (categoriesChanged) setStored(STORAGE_KEYS.SHARED_CATEGORIES, categoryList);
      if (personnelChanged) setStored(STORAGE_KEYS.PERSONNEL, personnelList);
      if (usersChanged) setStored(STORAGE_KEYS.USERS, userList);

      if (usersChanged || personnelChanged) {
        AuditLogService.log({
          module: 'Khởi tạo Tài khoản',
          actionDetails: `Chạy seed/migration danh sách 5 tài khoản cố định của Tiểu đoàn 93 thành công.`,
          actionType: 'he_thong',
          result: 'success'
        });
      }

      return {
        success: true,
        usersCount: userList.length,
        updated: usersChanged || personnelChanged
      };
    } catch (err: any) {
      console.error('UserAccountSeedService error:', err);
      return { success: false, usersCount: 0, updated: false };
    }
  }

  /**
   * Retrieves the 5 fixed accounts guaranteed
   */
  public static getFixedAccounts(): User[] {
    this.runSeed();
    const allUsers = getStored<User[]>(STORAGE_KEYS.USERS, []);
    if (fixedUserAccountMode) {
      const fixedEmails = new Set(FIXED_USER_ACCOUNTS.map(a => a.email.toLowerCase()));
      const fixedNames = new Set(FIXED_USER_ACCOUNTS.map(a => a.fullName));
      return allUsers.filter(
        u => fixedEmails.has(u.email.toLowerCase()) || fixedNames.has(u.name)
      );
    }
    return allUsers;
  }
}
