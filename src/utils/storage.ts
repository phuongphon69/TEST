import {
  DocumentRecord,
  Project,
  Personnel,
  EquipmentItem,
  LegalDocument,
  AuditLog,
  AlertItem,
  User,
  SystemAlertConfig,
  SharedCategoryItem,
  AppraisalNotice,
  QuarterlyReport,
  TaskItem,
  AuthSession,
  AccessPermissionRequest,
  AuthSecurityConfig,
  FeatureAccessLevel
} from '../types';

import {
  INITIAL_USERS,
  INITIAL_DOCUMENTS,
  INITIAL_PROJECTS,
  INITIAL_PERSONNEL,
  INITIAL_EQUIPMENT,
  INITIAL_LEGAL_DOCS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

import {
  INITIAL_APPRAISAL_NOTICES,
  INITIAL_QUARTERLY_REPORTS
} from '../data/initialAppraisalAndReports';

import { INITIAL_TASKS } from '../data/initialTasks';
import { getVehicles as getVehiclesFromStore } from './vehicleStorage';
import { getUXOEquipmentList as getUXOEquipmentFromStore } from './equipmentStorage';
import { getArchiveDossiers as getArchiveDossiersFromStore, getWarehouseLocations as getWarehouseLocationsFromStore } from './archiveStorage';

import { getDaysRemaining, formatAppraisalNoticeSymbol } from './formatters';

export const STORAGE_KEYS = {
  CURRENT_USER: 'qlrpbm_current_user',
  USERS: 'qlrpbm_users',
  DOCUMENTS: 'qlrpbm_documents',
  PROJECTS: 'qlrpbm_projects',
  PERSONNEL: 'qlrpbm_personnel',
  EQUIPMENT: 'qlrpbm_equipment',
  LEGAL_DOCS: 'qlrpbm_legal_docs',
  AUDIT_LOGS: 'qlrpbm_audit_logs',
  ALERT_CONFIG: 'qlrpbm_alert_config',
  SHARED_CATEGORIES: 'qlrpbm_shared_categories',
  APPRAISAL_NOTICES: 'qlrpbm_appraisal_notices',
  QUARTERLY_REPORTS: 'qlrpbm_quarterly_reports',
  TASKS: 'qlrpbm_tasks',
  AUTH_SESSIONS: 'qlrpbm_auth_sessions',
  SECURITY_CONFIG: 'qlrpbm_security_config',
  PERMISSION_REQUESTS: 'qlrpbm_permission_requests',
  AUTH_IS_LOGGED_IN: 'qlrpbm_is_logged_in'
};

export const DEFAULT_SECURITY_CONFIG: AuthSecurityConfig = {
  sessionTimeoutMinutes: 30,
  secretDocSessionTimeoutMinutes: 15,
  maxFailedAttemptsBeforeTempLock: 5,
  tempLockMinutes: 15,
  maxFailedAttemptsBeforeAdminLock: 10,
  require2FAForAdmins: true,
  require2FAForApprovers: true,
  require2FAForSecretDocs: true,
  allowedEmailDomains: ['binhchungcongbinh.vn', 'bqp.vn', 'qlrpbm.gov.vn'],
  allowedIPs: ['127.0.0.1', '10.93.*', '192.168.1.*'],
  enableDeviceControl: true,
  restrictToInternalNetwork: false,
  enableGoogleLogin: true,
  enablePasswordLogin: true
};

export const INITIAL_AUTH_SESSIONS: AuthSession[] = [
  {
    id: 'sess-001',
    userId: 'user-admin',
    userName: 'Nguyễn Bách Khoa',
    userEmail: 'admin@binhchungcongbinh.vn',
    userRole: 'quantri',
    loginTime: '2026-07-30 08:00:00',
    lastActiveTime: '2026-07-30 08:14:00',
    expiresAt: '2026-07-30 08:30:00',
    device: 'Máy tính Trạm Chỉ huy 01',
    browser: 'Google Chrome 126.0',
    os: 'Linux x86_64',
    ipAddress: '10.93.1.105',
    location: 'Sở Chỉ huy Tiểu đoàn 93 (LAN)',
    status: 'active',
    loginMethod: 'password',
    is2FAVerified: true
  },
  {
    id: 'sess-002',
    userId: 'user-03',
    userName: 'Phạm Thị Mai',
    userEmail: 'vanthu@binhchungcongbinh.vn',
    userRole: 'vanthu',
    loginTime: '2026-07-30 07:45:00',
    lastActiveTime: '2026-07-30 08:10:00',
    expiresAt: '2026-07-30 08:40:00',
    device: 'Máy Văn thư Kho Hồ sơ',
    browser: 'Mozilla Firefox 125.0',
    os: 'Windows 11 Pro',
    ipAddress: '10.93.2.14',
    location: 'Phòng Lưu trữ Văn thư (LAN)',
    status: 'active',
    loginMethod: 'password',
    is2FAVerified: false
  }
];

export const INITIAL_PERMISSION_REQUESTS: AccessPermissionRequest[] = [
  {
    id: 'req-01',
    requesterId: 'user-02',
    requesterName: 'Lê Hoàng Nam',
    requesterEmail: 'chuyenvien@binhchungcongbinh.vn',
    requestedModule: 'documents',
    requestedModuleName: 'Quản lý Văn bản & Tờ trình',
    requestedProject: 'prj-01',
    requestedProjectName: 'RPBM Dự án Cao tốc Bắc - Nam đoạn Quảng Trị',
    accessType: 'edit',
    reason: 'Cần cập nhật bổ sung Phụ lục phương án rà phá mặt bằng bổ sung',
    durationDays: 7,
    requestedExpiresAt: '2026-08-06',
    status: 'pending',
    createdAt: '2026-07-30 07:30:00'
  },
  {
    id: 'req-02',
    requesterId: 'user-04',
    requesterName: 'Trần Quốc Tuấn',
    requesterEmail: 'quanlythietbi@binhchungcongbinh.vn',
    requestedModule: 'reports',
    requestedModuleName: 'Báo cáo Quý & Thẩm định',
    accessType: 'view',
    reason: 'Tham khảo số liệu kiểm định thiết bị phục vụ lập báo cáo tháng',
    durationDays: 30,
    requestedExpiresAt: '2026-08-30',
    approverName: 'Nguyễn Bách Khoa',
    status: 'approved',
    decisionNote: 'Đã phê duyệt quyền xem báo cáo kiểm định 30 ngày',
    createdAt: '2026-07-28 14:20:00'
  }
];

export const DEFAULT_ALERT_CONFIG: SystemAlertConfig = {
  certWarningDays: 60,
  calibrationWarningDays: 30,
  docDeadlineWarningDays: 10,
  projectDelayWarningDays: 30
};

import { seedInitialPersonnelAndUsers, DEFAULT_MANAGING_UNIT } from './userManagementUtils';

export const DEFAULT_SHARED_CATEGORIES: SharedCategoryItem[] = [
  { id: 'cat-01', group: 'doc_type', code: 'hoso_duan', label: 'Hồ sơ Dự án RPBM', description: 'Phương án kỹ thuật, dự toán, quyết định phê duyệt' },
  { id: 'cat-02', group: 'doc_type', code: 'vanban_den', label: 'Công văn Đến', description: 'Chỉ đạo từ Bộ Quốc phòng, Sở Xây dựng, Chủ đầu tư' },
  { id: 'cat-03', group: 'doc_type', code: 'vanban_di', label: 'Công văn Đi / Tờ trình', description: 'Báo cáo, tờ trình kiểm định, công văn trả lời' },
  { id: 'cat-04', group: 'doc_type', code: 'bienban', label: 'Biên bản Nghiệm thu', description: 'Biên bản bàn giao đất sạch, nghiệm thu giai đoạn' },
  { id: 'cat-05', group: 'project_status', code: 'chuan_bi', label: 'Chuẩn bị thi công', description: 'Đang trình duyệt phương án và huy động lực lượng' },
  { id: 'cat-06', group: 'project_status', code: 'dang_thi_cong', label: 'Đang thi công rà phá', description: 'Triển khai dò tìm và xử lý vật nổ tại hiện trường' },
  { id: 'cat-07', group: 'equipment_cat', code: 'may_do_nong', label: 'Máy dò nông (đến 0.3m)', description: 'Thiết bị dò kim loại Vallon, Minelab' },
  { id: 'cat-08', group: 'equipment_cat', code: 'may_do_sau', label: 'Máy dò sâu (đến 3m-5m)', description: 'Thiết bị từ trường Foerster, Vallon EL1302' },
  { id: 'cat-09', group: 'unit', code: 'PB3', label: 'Phòng Nghiệp vụ Rà phá Bom mìn', description: 'Bộ phận chuyên môn quản lý chung' },
  { id: 'cat-unit-d93', group: 'unit', code: 'bp_bm_d93', label: DEFAULT_MANAGING_UNIT, description: 'Đơn vị quản lý bom mìn mặc định Tiểu đoàn 93 - Binh chủng Công binh' },
  { id: 'cat-veh-01', group: 'equipment_cat', code: 'xe_ban_tai', label: 'Bán tải chuyên dụng RPBM', description: 'Xe bán tải Ford Ranger, Toyota Hilux chở máy móc hiện trường' },
  { id: 'cat-veh-02', group: 'equipment_cat', code: 'xe_chi_huy', label: 'Xe chỉ huy (SUV/4WD)', description: 'Xe chỉ huy công trường rà phá bom mìn' },
  { id: 'cat-veh-03', group: 'equipment_cat', code: 'xe_tai_cho_thiet_bi', label: 'Xe tải chở thiết bị nặng', description: 'Xe tải vận chuyển máy rà chuyên dụng và vật tư' }
];

// Helper to safely parse localStorage JSON
export function getStored<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    if (!item) return fallback;
    return JSON.parse(item) as T;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage:`, err);
    return fallback;
  }
}

export function setStored<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage:`, err);
  }
}

// Initialize default storage if empty
export function initStorage(): void {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    setStored(STORAGE_KEYS.USERS, INITIAL_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.DOCUMENTS)) {
    setStored(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    setStored(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERSONNEL)) {
    setStored(STORAGE_KEYS.PERSONNEL, INITIAL_PERSONNEL);
  }
  if (!localStorage.getItem(STORAGE_KEYS.EQUIPMENT)) {
    setStored(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEGAL_DOCS)) {
    setStored(STORAGE_KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    setStored(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    setStored(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ALERT_CONFIG)) {
    setStored(STORAGE_KEYS.ALERT_CONFIG, DEFAULT_ALERT_CONFIG);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SHARED_CATEGORIES)) {
    setStored(STORAGE_KEYS.SHARED_CATEGORIES, DEFAULT_SHARED_CATEGORIES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.APPRAISAL_NOTICES)) {
    setStored(STORAGE_KEYS.APPRAISAL_NOTICES, INITIAL_APPRAISAL_NOTICES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.QUARTERLY_REPORTS)) {
    setStored(STORAGE_KEYS.QUARTERLY_REPORTS, INITIAL_QUARTERLY_REPORTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.TASKS)) {
    setStored(STORAGE_KEYS.TASKS, INITIAL_TASKS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SECURITY_CONFIG)) {
    setStored(STORAGE_KEYS.SECURITY_CONFIG, DEFAULT_SECURITY_CONFIG);
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUTH_SESSIONS)) {
    setStored(STORAGE_KEYS.AUTH_SESSIONS, INITIAL_AUTH_SESSIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PERMISSION_REQUESTS)) {
    setStored(STORAGE_KEYS.PERMISSION_REQUESTS, INITIAL_PERMISSION_REQUESTS);
  }
  if (localStorage.getItem(STORAGE_KEYS.AUTH_IS_LOGGED_IN) === null) {
    setStored(STORAGE_KEYS.AUTH_IS_LOGGED_IN, true);
  }
  // Idempotently seed default personnel and users for Section VIII Requirement 4
  seedInitialPersonnelAndUsers();
}

export function getAuthSecurityConfig(): AuthSecurityConfig {
  return getStored<AuthSecurityConfig>(STORAGE_KEYS.SECURITY_CONFIG, DEFAULT_SECURITY_CONFIG);
}

export function saveAuthSecurityConfig(config: AuthSecurityConfig, logAction?: string): void {
  setStored(STORAGE_KEYS.SECURITY_CONFIG, config);
  if (logAction) addAuditLog('Cổng Truy cập & Bảo mật', logAction);
}

export function getAuthSessions(): AuthSession[] {
  return getStored<AuthSession[]>(STORAGE_KEYS.AUTH_SESSIONS, INITIAL_AUTH_SESSIONS);
}

export function saveAuthSessions(sessions: AuthSession[]): void {
  setStored(STORAGE_KEYS.AUTH_SESSIONS, sessions);
}

export function getPermissionRequests(): AccessPermissionRequest[] {
  return getStored<AccessPermissionRequest[]>(STORAGE_KEYS.PERMISSION_REQUESTS, INITIAL_PERMISSION_REQUESTS);
}

export function savePermissionRequests(reqs: AccessPermissionRequest[]): void {
  setStored(STORAGE_KEYS.PERMISSION_REQUESTS, reqs);
}

export function addPermissionRequest(req: Omit<AccessPermissionRequest, 'id' | 'createdAt' | 'status'>): AccessPermissionRequest {
  const reqs = getPermissionRequests();
  const now = new Date();
  const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const newReq: AccessPermissionRequest = {
    ...req,
    id: `req-${Date.now().toString().slice(-6)}`,
    status: 'pending',
    createdAt: timestampStr
  };
  savePermissionRequests([newReq, ...reqs]);
  addAuditLog('Yêu cầu Cấp quyền', `Thành viên ${req.requesterName} đã gửi yêu cầu cấp quyền ${req.accessType} cho phân hệ ${req.requestedModuleName}`);
  return newReq;
}

export function updatePermissionRequestStatus(id: string, status: 'approved' | 'rejected' | 'revoked', approverName: string, note?: string): void {
  const reqs = getPermissionRequests();
  const updated = reqs.map(r => {
    if (r.id === id) {
      return {
        ...r,
        status,
        approverName,
        decisionNote: note || (status === 'approved' ? 'Đã phê duyệt' : 'Từ chối cấp quyền'),
        updatedAt: new Date().toISOString()
      };
    }
    return r;
  });
  savePermissionRequests(updated);

  // If approved, update user's featurePermissions
  const targetReq = reqs.find(r => r.id === id);
  if (targetReq && status === 'approved') {
    const users = getUsers();
    const updatedUsers = users.map(u => {
      if (u.id === targetReq.requesterId) {
        const featurePerms = u.featurePermissions || {};
        return {
          ...u,
          featurePermissions: {
            ...featurePerms,
            [targetReq.requestedModule]: targetReq.accessType
          }
        };
      }
      return u;
    });
    saveUsers(updatedUsers);
  }
  addAuditLog('Yêu cầu Cấp quyền', `Cán bộ ${approverName} đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} yêu cầu cấp quyền #${id}`);
}

export function isUserLoggedIn(): boolean {
  return getStored<boolean>(STORAGE_KEYS.AUTH_IS_LOGGED_IN, true);
}

export function setLoggedInStatus(status: boolean): void {
  setStored(STORAGE_KEYS.AUTH_IS_LOGGED_IN, status);
}

export function logoutUser(reason?: string): void {
  setLoggedInStatus(false);
  const currentUser = getCurrentUser();
  addAuditLog('Cổng Truy cập', `Thành viên ${currentUser.name} (${currentUser.email}) đã đăng xuất ${reason ? `[Lý do: ${reason}]` : ''}`, 'dang_xuat');
}

export function createNewSession(user: User, method: 'password' | 'google' | 'sso' = 'password'): AuthSession {
  const config = getAuthSecurityConfig();
  const now = new Date();
  const expires = new Date(now.getTime() + config.sessionTimeoutMinutes * 60 * 1000);

  const formatTime = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;

  const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'Chrome Linux';
  let deviceName = 'Máy tính làm việc Standard';
  let browserName = 'Google Chrome';
  let osName = 'Windows / Linux';

  if (userAgent.includes('Firefox')) browserName = 'Mozilla Firefox';
  else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browserName = 'Apple Safari';
  if (userAgent.includes('Macintosh')) osName = 'macOS';
  else if (userAgent.includes('Windows')) osName = 'Windows 11';

  const newSession: AuthSession = {
    id: `sess-${Date.now().toString().slice(-6)}`,
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    userRole: user.role,
    loginTime: formatTime(now),
    lastActiveTime: formatTime(now),
    expiresAt: formatTime(expires),
    device: `${deviceName} (${browserName})`,
    browser: browserName,
    os: osName,
    ipAddress: '10.93.1.' + Math.floor(Math.random() * 200 + 10),
    location: 'Mạng Nội bộ (LAN) Tiểu đoàn 93',
    status: 'active',
    loginMethod: method,
    is2FAVerified: !user.twoFactorEnabled
  };

  const sessions = getAuthSessions();
  saveAuthSessions([newSession, ...sessions.slice(0, 15)]);
  return newSession;
}

export function getUsers(): User[] {
  const users = getStored<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  return users.map(u => ({
    ...u,
    roleLabel: u.roleLabel ? u.roleLabel.replace(/Trưởng phòng/g, 'Tiểu đoàn trưởng') : u.roleLabel,
    title: u.title ? u.title.replace(/Trưởng phòng/g, 'Tiểu đoàn trưởng') : u.title
  }));
}

export function saveUsers(users: User[], logAction?: string): void {
  setStored(STORAGE_KEYS.USERS, users);
  if (logAction) addAuditLog('Quản trị & Phân quyền', logAction);
}

export function getAlertConfig(): SystemAlertConfig {
  return getStored<SystemAlertConfig>(STORAGE_KEYS.ALERT_CONFIG, DEFAULT_ALERT_CONFIG);
}

export function saveAlertConfig(config: SystemAlertConfig, logAction?: string): void {
  setStored(STORAGE_KEYS.ALERT_CONFIG, config);
  if (logAction) addAuditLog('Quản trị & Cấu hình', logAction);
}

export function getSharedCategories(): SharedCategoryItem[] {
  return getStored<SharedCategoryItem[]>(STORAGE_KEYS.SHARED_CATEGORIES, DEFAULT_SHARED_CATEGORIES);
}

export function saveSharedCategories(cats: SharedCategoryItem[], logAction?: string): void {
  setStored(STORAGE_KEYS.SHARED_CATEGORIES, cats);
  if (logAction) addAuditLog('Danh mục Dùng chung', logAction);
}

// Current User Management
export function getCurrentUser(): User {
  const u = getStored<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  return {
    ...u,
    roleLabel: u.roleLabel ? u.roleLabel.replace(/Trưởng phòng/g, 'Tiểu đoàn trưởng') : u.roleLabel,
    title: u.title ? u.title.replace(/Trưởng phòng/g, 'Tiểu đoàn trưởng') : u.title
  };
}

export function setCurrentUser(user: User): void {
  setStored(STORAGE_KEYS.CURRENT_USER, user);
}

// Getters
export function getDocuments(): DocumentRecord[] {
  return getStored<DocumentRecord[]>(STORAGE_KEYS.DOCUMENTS, INITIAL_DOCUMENTS);
}

// Sequential Incoming Document Number Counter (N+1)
export function peekNextIncomingDocNumber(): { num: number; display: string } {
  const isExplicit = localStorage.getItem('qlrpbm_incoming_counter_is_explicit') === 'true';
  let currentVal = 0;

  if (isExplicit) {
    const raw = localStorage.getItem('qlrpbm_incoming_doc_counter');
    currentVal = raw ? parseInt(raw, 10) : 0;
  } else {
    const docs = getDocuments();
    let maxNum = 152; // Default baseline seed

    docs.forEach(d => {
      if (d.incomingNumberSeq && typeof d.incomingNumberSeq === 'number') {
        if (d.incomingNumberSeq > maxNum) maxNum = d.incomingNumberSeq;
      } else if (d.incomingNumberDisplay) {
        const parsed = parseInt(d.incomingNumberDisplay.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
      } else if (d.incomingNumber) {
        const parsed = parseInt(d.incomingNumber.replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
      }
    });

    const storedCounter = getStored<number>('qlrpbm_incoming_doc_counter', maxNum);
    currentVal = Math.max(maxNum, storedCounter);
  }

  const nextNum = currentVal + 1;
  const numDisplayStr = nextNum < 10 ? `0${nextNum}` : `${nextNum}`;
  return { num: nextNum, display: `${numDisplayStr}/ĐẾN` };
}

export function getAndIncrementIncomingDocNumber(): { num: number; display: string } {
  const next = peekNextIncomingDocNumber();
  setStored('qlrpbm_incoming_doc_counter', next.num);
  localStorage.setItem('qlrpbm_incoming_counter_is_explicit', 'true');
  return next;
}

export function resetIncomingDocCounter(reason: string, user: { name: string; role?: string }): { success: boolean; oldValue: number } {
  const currentNext = peekNextIncomingDocNumber();
  const oldValue = currentNext.num - 1;

  localStorage.setItem('qlrpbm_incoming_doc_counter', '0');
  localStorage.setItem('qlrpbm_incoming_counter_is_explicit', 'true');

  const resetLog = {
    id: `reset-${Date.now()}`,
    performedBy: user.name,
    timestamp: new Date().toISOString(),
    oldValue: oldValue < 0 ? 0 : oldValue,
    newValue: 0,
    reason: reason
  };

  const history = getStored<any[]>('qlrpbm_incoming_counter_reset_history', []);
  history.unshift(resetLog);
  setStored('qlrpbm_incoming_counter_reset_history', history);

  addAuditLog(
    'Quản trị & Cấu hình',
    `Quản trị viên ${user.name} đã reset số đến về 00. Giá trị trước reset: ${oldValue}. Lý do: ${reason}`,
    'cau_hinh',
    { counter: oldValue },
    { counter: 0 }
  );

  return { success: true, oldValue };
}

export function getIncomingDocCounterResetHistory(): any[] {
  return getStored<any[]>('qlrpbm_incoming_counter_reset_history', []);
}

// Sequential Outgoing Document Number Counter (N+1)
export function peekNextOutgoingDocNumber(): { num: number; display: string } {
  const isExplicit = localStorage.getItem('qlrpbm_outgoing_counter_is_explicit') === 'true';
  let currentVal = 28; // Baseline seed (so next is 29)

  if (isExplicit) {
    const raw = localStorage.getItem('qlrpbm_outgoing_doc_counter');
    currentVal = raw ? parseInt(raw, 10) : 28;
  } else {
    const docs = getDocuments();
    let maxNum = 28;

    docs.forEach(d => {
      if (d.type === 'vanban_di') {
        if (d.outgoingNumberSeq && typeof d.outgoingNumberSeq === 'number') {
          if (d.outgoingNumberSeq > maxNum) maxNum = d.outgoingNumberSeq;
        } else if (d.outgoingNumberDisplay) {
          const parsed = parseInt(d.outgoingNumberDisplay.replace(/\D/g, ''), 10);
          if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
        } else if (d.outgoingNumber) {
          const parsed = parseInt(d.outgoingNumber.replace(/\D/g, ''), 10);
          if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
        }
      }
    });

    const storedCounter = getStored<number>('qlrpbm_outgoing_doc_counter', maxNum);
    currentVal = Math.max(maxNum, storedCounter);
  }

  const nextNum = currentVal + 1;
  return { num: nextNum, display: `${nextNum}` };
}

export function getAndIncrementOutgoingDocNumber(): { num: number; display: string } {
  const next = peekNextOutgoingDocNumber();
  setStored('qlrpbm_outgoing_doc_counter', next.num);
  localStorage.setItem('qlrpbm_outgoing_counter_is_explicit', 'true');
  return next;
}

export function resetOutgoingDocCounter(newStartVal: number, reason: string, user: { name: string; role?: string }): { success: boolean; oldValue: number } {
  const currentNext = peekNextOutgoingDocNumber();
  const oldValue = currentNext.num - 1;

  const targetVal = Math.max(0, newStartVal);
  setStored('qlrpbm_outgoing_doc_counter', targetVal);
  localStorage.setItem('qlrpbm_outgoing_counter_is_explicit', 'true');

  const resetLog = {
    id: `reset-out-${Date.now()}`,
    performerName: user.name,
    performerRole: user.role || 'Admin',
    timestamp: new Date().toISOString(),
    oldValue: oldValue < 0 ? 0 : oldValue,
    newValue: targetVal,
    reason: reason
  };

  const history = getStored<any[]>('qlrpbm_outgoing_counter_reset_history', []);
  history.unshift(resetLog);
  setStored('qlrpbm_outgoing_counter_reset_history', history);

  addAuditLog(
    'Quản trị & Cấu hình',
    `Quản trị viên ${user.name} đã reset counter số văn bản đi từ ${oldValue} thành ${targetVal}. Lý do: ${reason}`,
    'cau_hinh',
    { counter: oldValue },
    { counter: targetVal }
  );

  return { success: true, oldValue };
}

export function getOutgoingDocCounterResetHistory(): any[] {
  return getStored<any[]>('qlrpbm_outgoing_counter_reset_history', []);
}

export function logOutgoingDocNumberAdjustment(
  user: { name: string; role?: string },
  docId: string,
  docTitle: string,
  oldNumDisplay: string,
  newNumDisplay: string,
  reason: string
): void {
  const adjustmentLog = {
    id: `adj-out-${Date.now()}`,
    docId,
    docTitle,
    performerName: user.name,
    performerRole: user.role || 'Admin',
    timestamp: new Date().toISOString(),
    oldNumDisplay,
    newNumDisplay,
    reason
  };

  const history = getStored<any[]>('qlrpbm_outgoing_number_adjustment_history', []);
  history.unshift(adjustmentLog);
  setStored('qlrpbm_outgoing_number_adjustment_history', history);

  addAuditLog(
    'Văn bản & Hồ sơ',
    `Quản trị viên ${user.name} đã điều chỉnh thủ công số văn bản đi từ "${oldNumDisplay}" sang "${newNumDisplay}". Lý do: ${reason}`,
    'chinh_sua',
    { numberDisplay: oldNumDisplay },
    { numberDisplay: newNumDisplay }
  );
}

export function getOutgoingDocAdjustmentHistory(): any[] {
  return getStored<any[]>('qlrpbm_outgoing_number_adjustment_history', []);
}

export function checkOutgoingNumberDuplicate(numDisplay: string, symbolStr?: string, excludeDocId?: string): boolean {
  if (!numDisplay) return false;
  const docs = getDocuments();
  const cleanDisplay = numDisplay.trim().toLowerCase();
  const cleanSymbol = (symbolStr || '').trim().toLowerCase();

  return docs.some(d => {
    if (d.dataStatus === 'da_xoa' || d.type !== 'vanban_di') return false;
    if (excludeDocId && d.id === excludeDocId) return false;

    const dDisplay = (d.outgoingNumberDisplay || d.outgoingNumber || '').trim().toLowerCase();
    const dSymbol = (d.outgoingCodeSymbol || d.code || '').trim().toLowerCase();

    if (cleanDisplay && dDisplay === cleanDisplay) return true;
    if (cleanSymbol && dSymbol && dSymbol === cleanSymbol) return true;
    return false;
  });
}

// Sequential Appraisal Notice Number Counter (N+1)
export function peekNextAppraisalNoticeNumber(): { num: number; display: string; codeSymbol: string } {
  const notices = getAppraisalNotices();
  let maxNum = 14; // Baseline seed so first notice generated is 15 if no higher notice exists

  notices.forEach(n => {
    if (n.noticeNumberSeq && typeof n.noticeNumberSeq === 'number') {
      if (n.noticeNumberSeq > maxNum) maxNum = n.noticeNumberSeq;
    } else if (n.noticeNumber) {
      const parsed = parseInt(String(n.noticeNumber).replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
    } else if (n.codeSymbol) {
      const parsed = parseInt(String(n.codeSymbol.split('/')[0]).replace(/\D/g, ''), 10);
      if (!isNaN(parsed) && parsed > maxNum) maxNum = parsed;
    }
  });

  const storedCounter = getStored<number>('qlrpbm_appraisal_notice_counter', maxNum);
  const nextNum = Math.max(maxNum, storedCounter) + 1;
  const numDisplayStr = `${nextNum}`;
  const codeSymbol = formatAppraisalNoticeSymbol(nextNum);
  return { num: nextNum, display: numDisplayStr, codeSymbol };
}

export function getAndIncrementAppraisalNoticeNumber(): { num: number; display: string; codeSymbol: string } {
  const next = peekNextAppraisalNoticeNumber();
  setStored('qlrpbm_appraisal_notice_counter', next.num);
  return next;
}

export function checkAppraisalNoticeCodeSymbolDuplicate(codeSymbol: string, excludeId?: string): boolean {
  if (!codeSymbol) return false;
  const notices = getAppraisalNotices();
  const clean = codeSymbol.trim().toLowerCase();
  return notices.some(n => {
    if (n.dataStatus === 'da_xoa') return false;
    if (excludeId && n.id === excludeId) return false;
    return (n.codeSymbol || '').trim().toLowerCase() === clean;
  });
}

// Format Outgoing Document Symbol automatically: {số}/{mã loại}
export function formatOutgoingDocumentSymbol(num: number | string, documentType: string): string {
  const numStr = String(num).trim();
  if (!numStr) return '';
  const normalizedType = (documentType || '').toLowerCase().trim();

  if (normalizedType.includes('quyet_dinh') || normalizedType.includes('quuyết định') || normalizedType.includes('quyet dinh')) {
    return `${numStr}/QĐ-TĐ`;
  }
  if (normalizedType.includes('to_trinh') || normalizedType.includes('tờ trình') || normalizedType.includes('to trinh')) {
    return `${numStr}/TTr-TĐ`;
  }
  if (normalizedType.includes('thong_bao') || normalizedType.includes('thông báo') || normalizedType.includes('thong bao')) {
    return `${numStr}/TB-TĐ`;
  }
  if (normalizedType.includes('ke_hoach') || normalizedType.includes('kế hoạch') || normalizedType.includes('ke hoach')) {
    return `${numStr}/KH-TĐ`;
  }
  return `${numStr}/TĐ-BM`;
}

// Stored Issuing Agency Suggestions
const DEFAULT_ISSUERS = [
  'Binh chủng Công binh',
  'Bộ Quốc phòng'
];

export function getStoredIssuers(): string[] {
  return [...DEFAULT_ISSUERS];
}

export function addStoredIssuer(issuer: string): void {
  // Only allow adding if it's one of the two standard agencies
  if (!issuer || !issuer.trim()) return;
  const trimmed = issuer.trim();
  if (DEFAULT_ISSUERS.includes(trimmed)) {
    const current = getStored<string[]>('qlrpbm_stored_issuers', DEFAULT_ISSUERS);
    if (!current.includes(trimmed)) {
      setStored('qlrpbm_stored_issuers', [...current, trimmed]);
    }
  }
}

export function getProjects(): Project[] {
  return getStored<Project[]>(STORAGE_KEYS.PROJECTS, INITIAL_PROJECTS);
}

export function getPersonnel(): Personnel[] {
  return getStored<Personnel[]>(STORAGE_KEYS.PERSONNEL, INITIAL_PERSONNEL);
}

export function getEquipment(): EquipmentItem[] {
  return getStored<EquipmentItem[]>(STORAGE_KEYS.EQUIPMENT, INITIAL_EQUIPMENT);
}

export function getLegalDocs(): LegalDocument[] {
  return getStored<LegalDocument[]>(STORAGE_KEYS.LEGAL_DOCS, INITIAL_LEGAL_DOCS);
}

export function getAuditLogs(): AuditLog[] {
  return getStored<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

// Setters & Loggers
export function saveDocuments(docs: DocumentRecord[], logAction?: string): void {
  setStored(STORAGE_KEYS.DOCUMENTS, docs);
  if (logAction) addAuditLog('Văn bản & Hồ sơ', logAction);
}

export function saveProjects(projects: Project[], logAction?: string): void {
  setStored(STORAGE_KEYS.PROJECTS, projects);
  if (logAction) addAuditLog('Dự án RPBM', logAction);
}

export function savePersonnel(personnelList: Personnel[], logAction?: string): void {
  setStored(STORAGE_KEYS.PERSONNEL, personnelList);
  if (logAction) addAuditLog('Nhân sự & Chứng chỉ', logAction);
}

export function saveEquipment(equipmentList: EquipmentItem[], logAction?: string): void {
  setStored(STORAGE_KEYS.EQUIPMENT, equipmentList);
  if (logAction) addAuditLog('Phương tiện & Thiết bị', logAction);
}

export function saveLegalDocs(docs: LegalDocument[], logAction?: string): void {
  setStored(STORAGE_KEYS.LEGAL_DOCS, docs);
  if (logAction) addAuditLog('Kho Pháp lý AI', logAction);
}

export function addAuditLog(
  module: string,
  actionDetails: string,
  actionType?: string,
  dataBefore?: any,
  dataAfter?: any
): void {
  const user = getCurrentUser();
  const logs = getAuditLogs();
  const now = new Date();
  const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
  
  const userAgentStr = typeof window !== 'undefined' ? window.navigator.userAgent : 'Chrome/Linux (Applet Container)';
  let simpleDevice = 'Trình duyệt Web Standard';
  if (userAgentStr.includes('Chrome')) simpleDevice = 'Google Chrome / Windows-Linux';
  else if (userAgentStr.includes('Firefox')) simpleDevice = 'Mozilla Firefox';
  else if (userAgentStr.includes('Safari')) simpleDevice = 'Apple Safari';

  // Infer actionType if not explicitly passed
  let inferredType = actionType;
  if (!inferredType) {
    const actLower = actionDetails.toLowerCase();
    if (actLower.includes('đăng nhập')) inferredType = 'dang_nhap';
    else if (actLower.includes('tạo') || actLower.includes('thêm')) inferredType = 'tao';
    else if (actLower.includes('xóa') || actLower.includes('xóa mềm')) inferredType = 'xoa';
    else if (actLower.includes('khôi phục')) inferredType = 'khoi_phuc';
    else if (actLower.includes('tải lên') || actLower.includes('upload')) inferredType = 'tai_len';
    else if (actLower.includes('tải') || actLower.includes('xuất')) inferredType = 'tai_xuong';
    else if (actLower.includes('duyệt') || actLower.includes('phê duyệt')) inferredType = 'phe_duyet';
    else if (actLower.includes('từ chối')) inferredType = 'tu_choi';
    else if (actLower.includes('trạng thái')) inferredType = 'thay_doi_trang_thai';
    else if (actLower.includes('quyền') || actLower.includes('giao')) inferredType = 'thay_doi_quyen';
    else inferredType = 'chinh_sua';
  }

  const newLog: AuditLog = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: timestampStr,
    userName: user ? user.name : 'Hệ thống Auto',
    userRole: user ? user.title : 'Chỉ huy / Quản trị',
    userDevice: simpleDevice,
    module,
    actionType: inferredType,
    action: actionDetails.split(':')[0] || 'Thao tác Dữ liệu',
    details: actionDetails,
    dataBefore: dataBefore ? (typeof dataBefore === 'string' ? dataBefore : JSON.stringify(dataBefore, null, 2)) : undefined,
    dataAfter: dataAfter ? (typeof dataAfter === 'string' ? dataAfter : JSON.stringify(dataAfter, null, 2)) : undefined
  };

  const updatedLogs = [newLog, ...logs].slice(0, 300); // Keep last 300 logs
  setStored(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
}

// Soft Delete System Record
export interface SoftDeletedItem {
  id: string;
  originalId: string;
  moduleKey: string;
  moduleName: string;
  title: string;
  code?: string;
  deletedBy: string;
  deletedAt: string;
  data: any;
}

export function softDeleteRecord(moduleKey: string, moduleName: string, id: string, title: string, code?: string): boolean {
  const user = getCurrentUser();
  const existingDeleted = getStored<SoftDeletedItem[]>('qlrpbm_soft_deleted_items', []);
  
  // Get raw items from module
  let targetData: any = null;
  if (moduleKey === 'documents') {
    const docs = getDocuments();
    targetData = docs.find(d => d.id === id);
    saveDocuments(docs.filter(d => d.id !== id));
  } else if (moduleKey === 'projects') {
    const projs = getProjects();
    targetData = projs.find(p => p.id === id);
    saveProjects(projs.filter(p => p.id !== id));
  } else if (moduleKey === 'personnel') {
    const personnel = getPersonnel();
    targetData = personnel.find(p => p.id === id);
    savePersonnel(personnel.filter(p => p.id !== id));
  } else if (moduleKey === 'equipment') {
    const eq = getEquipment();
    targetData = eq.find(e => e.id === id);
    saveEquipment(eq.filter(e => e.id !== id));
  } else if (moduleKey === 'legal') {
    const leg = getLegalDocs();
    targetData = leg.find(l => l.id === id);
    saveLegalDocs(leg.filter(l => l.id !== id));
  } else if (moduleKey === 'tasks') {
    const tasks = getTasks();
    targetData = tasks.find(t => t.id === id);
    saveTasks(tasks.filter(t => t.id !== id));
  }

  const now = new Date();
  const deletedAtStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const deletedRecord: SoftDeletedItem = {
    id: `del-${Date.now()}`,
    originalId: id,
    moduleKey,
    moduleName,
    title,
    code,
    deletedBy: user.name,
    deletedAt: deletedAtStr,
    data: targetData || { id, title, code }
  };

  const updated = [deletedRecord, ...existingDeleted];
  setStored('qlrpbm_soft_deleted_items', updated);

  addAuditLog(
    moduleName,
    `Xóa mềm bản ghi: ${title} (${code || id}) vào Thùng rác hệ thống`,
    'xoa',
    targetData,
    { status: 'da_xoa_mem', deletedBy: user.name }
  );
  return true;
}

export function restoreSoftDeletedRecord(deletedId: string): boolean {
  const user = getCurrentUser();
  const existingDeleted = getStored<SoftDeletedItem[]>('qlrpbm_soft_deleted_items', []);
  const itemToRestore = existingDeleted.find(i => i.id === deletedId);
  if (!itemToRestore) return false;

  const restoredData = itemToRestore.data;
  if (itemToRestore.moduleKey === 'documents') {
    const docs = getDocuments();
    saveDocuments([restoredData, ...docs]);
  } else if (itemToRestore.moduleKey === 'projects') {
    const projs = getProjects();
    saveProjects([restoredData, ...projs]);
  } else if (itemToRestore.moduleKey === 'personnel') {
    const personnel = getPersonnel();
    savePersonnel([restoredData, ...personnel]);
  } else if (itemToRestore.moduleKey === 'equipment') {
    const eq = getEquipment();
    saveEquipment([restoredData, ...eq]);
  } else if (itemToRestore.moduleKey === 'legal') {
    const leg = getLegalDocs();
    saveLegalDocs([restoredData, ...leg]);
  } else if (itemToRestore.moduleKey === 'tasks') {
    const tasks = getTasks();
    saveTasks([restoredData, ...tasks]);
  }

  const updated = existingDeleted.filter(i => i.id !== deletedId);
  setStored('qlrpbm_soft_deleted_items', updated);

  addAuditLog(
    itemToRestore.moduleName,
    `Khôi phục thành công bản ghi xóa mềm: ${itemToRestore.title}`,
    'khoi_phuc',
    { status: 'da_xoa_mem' },
    restoredData
  );

  return true;
}

export function getSoftDeletedItems(): SoftDeletedItem[] {
  return getStored<SoftDeletedItem[]>('qlrpbm_soft_deleted_items', []);
}

export function hardDeleteRecord(deletedId: string): boolean {
  const user = getCurrentUser();
  // Protection: Important data cannot be hard deleted by standard personnel
  if (user.role !== 'chihuy' && user.role !== 'quantri' && !user.permissions.includes('xoa_vinh_vien')) {
    alert('BẢO VỆ DỮ LIỆU CẤP CAO: Dữ liệu quan trọng như Văn bản, Hợp đồng, Chứng chỉ & Hồ sơ không được xóa vĩnh viễn bởi người dùng thông thường!');
    return false;
  }

  const existingDeleted = getStored<SoftDeletedItem[]>('qlrpbm_soft_deleted_items', []);
  const itemToDel = existingDeleted.find(i => i.id === deletedId);
  if (!itemToDel) return false;

  const updated = existingDeleted.filter(i => i.id !== deletedId);
  setStored('qlrpbm_soft_deleted_items', updated);

  addAuditLog(
    itemToDel.moduleName,
    `XÓA VĨNH VIỄN BẢN GHI KHỎI HỆ THỐNG: ${itemToDel.title}`,
    'xoa',
    itemToDel.data,
    undefined
  );

  return true;
}

// Generate Auto Alerts (Cảnh báo Tự động Hệ thống)
export function generateAutoAlerts(): AlertItem[] {
  const alerts: AlertItem[] = [];
  const config = getAlertConfig();

  // 1. Personnel Certificates
  const personnel = getPersonnel();
  personnel.forEach(p => {
    p.certificates.forEach(c => {
      const days = getDaysRemaining(c.expiryDate);
      if (days < 0) {
        alerts.push({
          id: `alt-cert-${c.id}`,
          title: `Chứng chỉ đã QUÁ HẠN: ${c.name}`,
          category: 'chung_chi',
          severity: 'critical',
          targetName: `${p.rankTitle} ${p.fullName}`,
          dueDate: c.expiryDate,
          daysRemaining: days,
          linkModule: 'personnel',
          linkId: p.id
        });
      } else if (days <= config.certWarningDays) {
        alerts.push({
          id: `alt-cert-${c.id}`,
          title: `Chứng chỉ SẮP HẾT HẠN (${days} ngày): ${c.name}`,
          category: 'chung_chi',
          severity: days <= Math.max(10, Math.floor(config.certWarningDays / 3)) ? 'critical' : 'warning',
          targetName: `${p.rankTitle} ${p.fullName}`,
          dueDate: c.expiryDate,
          daysRemaining: days,
          linkModule: 'personnel',
          linkId: p.id
        });
      }
    });
  });

  // 2. Equipment & Vehicles Calibration / Inspection
  const equipment = getEquipment();
  equipment.forEach(e => {
    const days = getDaysRemaining(e.nextCalibrationDate);
    if (days < 0) {
      alerts.push({
        id: `alt-eq-${e.id}`,
        title: `Hạn Đăng kiểm/Kiểm định đã QUÁ HẠN: ${e.name}`,
        category: 'dang_kiem',
        severity: 'critical',
        targetName: `${e.brandModel} (${e.serialOrPlate})`,
        dueDate: e.nextCalibrationDate,
        daysRemaining: days,
        linkModule: 'equipment',
        linkId: e.id
      });
    } else if (days <= config.calibrationWarningDays) {
      alerts.push({
        id: `alt-eq-${e.id}`,
        title: `Đăng kiểm/Kiểm định SẮP ĐẾN HẠN (${days} ngày): ${e.name}`,
        category: 'dang_kiem',
        severity: days <= Math.max(7, Math.floor(config.calibrationWarningDays / 3)) ? 'critical' : 'warning',
        targetName: `${e.brandModel} (${e.serialOrPlate})`,
        dueDate: e.nextCalibrationDate,
        daysRemaining: days,
        linkModule: 'equipment',
        linkId: e.id
      });
    }
  });

  // 3. Document Deadlines
  const documents = getDocuments();
  documents.forEach(d => {
    if (d.status === 'cho_xuly' || d.status === 'dang_thuc_hien') {
      const days = getDaysRemaining(d.deadline);
      if (days < 0) {
        alerts.push({
          id: `alt-doc-${d.id}`,
          title: `Văn bản/Hồ sơ QUÁ HẠN XỬ LÝ: ${d.code}`,
          category: 'van_ban',
          severity: 'critical',
          targetName: d.title,
          dueDate: d.deadline,
          daysRemaining: days,
          linkModule: 'documents',
          linkId: d.id
        });
      } else if (days <= config.docDeadlineWarningDays) {
        alerts.push({
          id: `alt-doc-${d.id}`,
          title: `Hồ sơ SẮP ĐẾN HẠN XỬ LÝ (${days} ngày): ${d.code}`,
          category: 'van_ban',
          severity: days <= Math.max(3, Math.floor(config.docDeadlineWarningDays / 3)) ? 'critical' : 'warning',
          targetName: d.title,
          dueDate: d.deadline,
          daysRemaining: days,
          linkModule: 'documents',
          linkId: d.id
        });
      }
    }
  });

  // 4. Project Delays
  const projects = getProjects();
  projects.forEach(pj => {
    if (pj.status === 'dang_thi_cong') {
      const days = getDaysRemaining(pj.endDate);
      if (days < 0 && pj.progressPercent < 100) {
        alerts.push({
          id: `alt-pj-${pj.id}`,
          title: `Dự án RPBM TRỄ TIẾN ĐỘ hoàn thành: ${pj.code}`,
          category: 'du_an',
          severity: 'critical',
          targetName: pj.name,
          dueDate: pj.endDate,
          daysRemaining: days,
          linkModule: 'projects',
          linkId: pj.id
        });
      } else if (days <= config.projectDelayWarningDays && pj.progressPercent < 80) {
        alerts.push({
          id: `alt-pj-${pj.id}`,
          title: `Dự án cần đẩy nhanh tiến độ (${days} ngày còn lại, tiến độ ${pj.progressPercent}%): ${pj.code}`,
          category: 'du_an',
          severity: 'warning',
          targetName: pj.name,
          dueDate: pj.endDate,
          daysRemaining: days,
          linkModule: 'projects',
          linkId: pj.id
        });
      }
    }
  });

  // Sort alerts by severity (critical first) then daysRemaining
  alerts.sort((a, b) => {
    if (a.severity === 'critical' && b.severity !== 'critical') return -1;
    if (a.severity !== 'critical' && b.severity === 'critical') return 1;
    return a.daysRemaining - b.daysRemaining;
  });

  return alerts;
}

// Backup & Restore
export function exportDataJSON(): void {
  const backupData = {
    exportDate: new Date().toISOString(),
    appName: 'QLRPBM - Hệ thống Quản lý Nghiệp vụ Rà phá Bom mìn',
    documents: getDocuments(),
    projects: getProjects(),
    personnel: getPersonnel(),
    equipment: getEquipment(),
    legalDocs: getLegalDocs(),
    auditLogs: getAuditLogs()
  };

  const jsonString = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SaoLuu_QLRPBM_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  addAuditLog('Sao lưu & Dữ liệu', 'Tải xuống tệp sao lưu dữ liệu JSON toàn hệ thống');
}

export function importDataJSON(jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent);
    if (data.documents && Array.isArray(data.documents)) {
      setStored(STORAGE_KEYS.DOCUMENTS, data.documents);
    }
    if (data.projects && Array.isArray(data.projects)) {
      setStored(STORAGE_KEYS.PROJECTS, data.projects);
    }
    if (data.personnel && Array.isArray(data.personnel)) {
      setStored(STORAGE_KEYS.PERSONNEL, data.personnel);
    }
    if (data.equipment && Array.isArray(data.equipment)) {
      setStored(STORAGE_KEYS.EQUIPMENT, data.equipment);
    }
    if (data.legalDocs && Array.isArray(data.legalDocs)) {
      setStored(STORAGE_KEYS.LEGAL_DOCS, data.legalDocs);
    }
    addAuditLog('Sao lưu & Dữ liệu', 'Phục hồi dữ liệu từ tệp sao lưu JSON');
    return true;
  } catch (err) {
    console.error('Import backup JSON failed:', err);
    return false;
  }
}

export function exportBackupJSON(): void {
  exportDataJSON();
}

export function resetToSeedData(): void {
  localStorage.removeItem(STORAGE_KEYS.DOCUMENTS);
  localStorage.removeItem(STORAGE_KEYS.PROJECTS);
  localStorage.removeItem(STORAGE_KEYS.PERSONNEL);
  localStorage.removeItem(STORAGE_KEYS.EQUIPMENT);
  localStorage.removeItem(STORAGE_KEYS.LEGAL_DOCS);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.APPRAISAL_NOTICES);
  localStorage.removeItem(STORAGE_KEYS.QUARTERLY_REPORTS);
  localStorage.removeItem(STORAGE_KEYS.TASKS);
  initStorage();
  addAuditLog('Sao lưu & Dữ liệu', 'Khôi phục toàn bộ dữ liệu mẫu ban đầu');
}

export function resetToInitialData(): void {
  resetToSeedData();
}

// Appraisal Notices Helpers
export function getAppraisalNotices(): AppraisalNotice[] {
  return getStored<AppraisalNotice[]>(STORAGE_KEYS.APPRAISAL_NOTICES, INITIAL_APPRAISAL_NOTICES);
}

export function saveAppraisalNotices(notices: AppraisalNotice[], logAction?: string): void {
  setStored(STORAGE_KEYS.APPRAISAL_NOTICES, notices);
  if (logAction) addAuditLog('Thông báo Thẩm định', logAction);
}

// Quarterly Reports Helpers
export function getQuarterlyReports(): QuarterlyReport[] {
  return getStored<QuarterlyReport[]>(STORAGE_KEYS.QUARTERLY_REPORTS, INITIAL_QUARTERLY_REPORTS);
}

export function saveQuarterlyReports(reports: QuarterlyReport[], logAction?: string): void {
  setStored(STORAGE_KEYS.QUARTERLY_REPORTS, reports);
  if (logAction) addAuditLog('Lập Báo cáo Quý', logAction);
}

// Task Management Helpers (Section 6)
export function getTasks(): TaskItem[] {
  return getStored<TaskItem[]>(STORAGE_KEYS.TASKS, INITIAL_TASKS);
}

export function saveTasks(tasks: TaskItem[], logAction?: string): void {
  setStored(STORAGE_KEYS.TASKS, tasks);
  if (logAction) addAuditLog('Quản lý Công việc', logAction);
}

// Module 9 & 10 & 12 Storage Wrappers
export function getVehicles() {
  return getVehiclesFromStore();
}

export function getArchiveWarehouses() {
  const dossiers = getArchiveDossiersFromStore();
  const locations = getWarehouseLocationsFromStore();

  return [
    {
      id: 'wh-01',
      name: 'Kho Hồ sơ RPBM Trung tâm (Bộ Tư lệnh Công binh)',
      location: 'Hà Nội',
      capacity: locations.length || 150,
      occupied: dossiers.length || 45,
      dossiers: dossiers.map(d => ({
        id: d.id,
        code: d.archiveCode,
        title: d.title,
        projectName: d.relatedProjectName || 'Dự án RPBM Cảng Hàng Không Long Thành',
        archivedDate: d.entryDate || '2025-01-15',
        retentionYears: d.retentionPeriod === 'vinh_vien' ? 50 : 20,
        status: d.status
      }))
    }
  ];
}


