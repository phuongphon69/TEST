import {
  User,
  DocumentRecord,
  Project,
  Personnel,
  EquipmentItem,
  LegalDocument,
  AuditLog
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin',
    name: 'Nguyễn Bách Khoa',
    role: 'quantri',
    roleLabel: '3.1. Quản trị viên kiêm Tiểu đoàn trưởng',
    title: 'Thượng tá - Tiểu đoàn trưởng & Quản trị viên An toàn thông tin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'admin@binhchungcongbinh.vn',
    phone: '0988.999.000',
    departmentOrUnit: 'Bộ phận Bom mìn - Tiểu đoàn 93',
    permissions: ['Toàn quyền Quản trị', 'Phân quyền người dùng', 'Cấu hình thời gian cảnh báo', 'Khôi phục dữ liệu đã xóa', 'Phê duyệt báo cáo'],
    detailedPermissions: {
      canManageAccounts: true,
      canAssignRoles: true,
      canManageCategories: true,
      canViewAllData: true,
      canEditAllData: true,
      canViewSystemLogs: true,
      canRestoreDeletedData: true,
      canSetAlertThresholds: true,
      canApproveWork: true,
      canApproveDocs: true,
      canApproveEquipment: true,
      canApprovePayment: true,
      canDeleteCriticalData: true
    },
    status: 'active',
    secrecyLevel: 'toi_mat',
    twoFactorEnabled: true,
    defaultTab: 'dashboard',
    featurePermissions: {
      dashboard: 'full',
      documents: 'full',
      projects: 'full',
      uxo_ops: 'full',
      vehicles: 'full',
      uxo_equipment: 'full',
      archive_warehouse: 'full',
      gdrive: 'full',
      tasks: 'full',
      personnel: 'full',
      equipment: 'full',
      user_role: 'full',
      legal: 'full',
      reports: 'full',
      audit: 'full'
    },
    isLocked: false
  },
  {
    id: 'user-01',
    name: 'Nguyễn Văn Hùng',
    role: 'chihuy',
    roleLabel: '3.2. Tiểu đoàn trưởng / Phụ trách Chỉ huy',
    title: 'Thượng tá - Chỉ huy trưởng nghiệp vụ RPBM',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    email: 'hung.nguyen@binhchungcongbinh.vn',
    phone: '0983.123.456',
    departmentOrUnit: 'Bộ phận Bom mìn - Tiểu đoàn 93',
    permissions: ['Duyệt phương án RPBM', 'Nghiệm thu dự án', 'Giao việc & Phê duyệt', 'Duyệt cấp phát thiết bị'],
    detailedPermissions: {
      canManageAccounts: false,
      canAssignRoles: false,
      canManageCategories: false,
      canViewAllData: true,
      canEditAllData: true,
      canViewSystemLogs: true,
      canRestoreDeletedData: false,
      canSetAlertThresholds: false,
      canApproveWork: true,
      canApproveDocs: true,
      canApproveEquipment: true,
      canApprovePayment: true,
      canDeleteCriticalData: true
    },
    status: 'active',
    secrecyLevel: 'toi_mat',
    twoFactorEnabled: true,
    defaultTab: 'dashboard',
    featurePermissions: {
      dashboard: 'full',
      documents: 'approve',
      projects: 'approve',
      uxo_ops: 'approve',
      vehicles: 'approve',
      uxo_equipment: 'approve',
      archive_warehouse: 'view',
      gdrive: 'view',
      tasks: 'approve',
      personnel: 'approve',
      equipment: 'approve',
      user_role: 'view',
      legal: 'view',
      reports: 'approve',
      audit: 'view'
    },
    isLocked: false
  },
  {
    id: 'user-03',
    name: 'Phạm Thị Mai',
    role: 'vanthu',
    roleLabel: '3.3. Văn thư kiêm Quản lý Kho hồ sơ',
    title: 'Thiếu tá - Phụ trách lưu trữ Google Drive & Văn thư',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'vanthu@binhchungcongbinh.vn',
    phone: '0978.901.234',
    departmentOrUnit: 'Bộ phận Văn thư - Phân xã Hồ sơ',
    permissions: ['Thêm văn bản hồ sơ', 'Tải file Google Drive', 'Cập nhật tài liệu', 'Quản lý kho hồ sơ'],
    detailedPermissions: {
      canManageAccounts: false,
      canAssignRoles: false,
      canManageCategories: false,
      canViewAllData: true,
      canEditAllData: false,
      canViewSystemLogs: false,
      canRestoreDeletedData: false,
      canSetAlertThresholds: false,
      canApproveWork: false,
      canApproveDocs: false,
      canApproveEquipment: false,
      canApprovePayment: false,
      canDeleteCriticalData: false
    },
    status: 'active',
    secrecyLevel: 'mat',
    twoFactorEnabled: false,
    defaultTab: 'documents',
    featurePermissions: {
      dashboard: 'view',
      documents: 'edit',
      projects: 'view',
      uxo_ops: 'view',
      vehicles: 'none',
      uxo_equipment: 'none',
      archive_warehouse: 'edit',
      gdrive: 'edit',
      tasks: 'view',
      personnel: 'view',
      equipment: 'none',
      user_role: 'none',
      legal: 'view',
      reports: 'view',
      audit: 'none'
    },
    isLocked: false
  },
  {
    id: 'user-02',
    name: 'Lê Hoàng Nam',
    role: 'kythuat',
    roleLabel: '3.3. Chuyên viên Quản lý dự án & Lập báo cáo',
    title: 'Kỹ sư - KTV RPBM Cấp 3 (Chuyên gia dự án)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    email: 'chuyenvien@binhchungcongbinh.vn',
    phone: '0912.345.678',
    departmentOrUnit: 'Tổ Kỹ thuật Thi công 1',
    permissions: ['Ghi nhật ký thi công', 'Cập nhật tiến độ dự án', 'Lập báo cáo nghiệm thu'],
    detailedPermissions: {
      canManageAccounts: false,
      canAssignRoles: false,
      canManageCategories: false,
      canViewAllData: true,
      canEditAllData: false,
      canViewSystemLogs: false,
      canRestoreDeletedData: false,
      canSetAlertThresholds: false,
      canApproveWork: false,
      canApproveDocs: false,
      canApproveEquipment: false,
      canApprovePayment: false,
      canDeleteCriticalData: false
    },
    status: 'active',
    secrecyLevel: 'mat',
    twoFactorEnabled: false,
    defaultTab: 'projects',
    featurePermissions: {
      dashboard: 'view',
      documents: 'view',
      projects: 'edit',
      uxo_ops: 'edit',
      vehicles: 'view',
      uxo_equipment: 'view',
      archive_warehouse: 'view',
      gdrive: 'view',
      tasks: 'edit',
      personnel: 'view',
      equipment: 'view',
      user_role: 'none',
      legal: 'view',
      reports: 'check',
      audit: 'none'
    },
    isLocked: false
  },
  {
    id: 'user-04',
    name: 'Trần Quốc Tuấn',
    role: 'thietbi',
    roleLabel: '3.3. Quản lý Phương tiện, Thiết bị & Chứng chỉ',
    title: 'Đại úy - Trưởng kho máy dò & Đăng kiểm xe',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    email: 'quanlythietbi@binhchungcongbinh.vn',
    phone: '0934.567.890',
    departmentOrUnit: 'Kho Trạm Thiết bị RPBM',
    permissions: ['Quản lý kho máy dò', 'Theo dõi hạn Đăng kiểm', 'Quản lý chứng chỉ nhân sự', 'Đề xuất bảo dưỡng'],
    detailedPermissions: {
      canManageAccounts: false,
      canAssignRoles: false,
      canManageCategories: false,
      canViewAllData: true,
      canEditAllData: false,
      canViewSystemLogs: false,
      canRestoreDeletedData: false,
      canSetAlertThresholds: false,
      canApproveWork: false,
      canApproveDocs: false,
      canApproveEquipment: false,
      canApprovePayment: false,
      canDeleteCriticalData: false
    },
    status: 'active',
    secrecyLevel: 'thuong',
    twoFactorEnabled: false,
    defaultTab: 'vehicles',
    featurePermissions: {
      dashboard: 'view',
      documents: 'view',
      projects: 'view',
      uxo_ops: 'view',
      vehicles: 'edit',
      uxo_equipment: 'edit',
      archive_warehouse: 'none',
      gdrive: 'none',
      tasks: 'edit',
      personnel: 'edit',
      equipment: 'edit',
      user_role: 'none',
      legal: 'view',
      reports: 'view',
      audit: 'none'
    },
    isLocked: false
  }
];

export const INITIAL_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'doc-101',
    code: '158/QĐ-BQP',
    title: 'Quyết định Phê duyệt Phương án thi công Rà phá bom mìn Dự án Cao tốc Bắc - Nam đoạn Quảng Trị - Thừa Thiên Huế',
    type: 'hoso_duan',
    category: 'Phương án kỹ thuật',
    issueDate: '2026-05-10',
    deadline: '2026-08-15',
    issuer: 'Bộ Quốc phòng / Bộ Lệnh Công binh',
    recipientOrOwner: 'Ban QLDA Đường hộ Bắc Nam',
    status: 'dang_thuc_hien',
    driveUrl: 'https://drive.google.com/file/d/1A2B3C4D5E_QDBQP_QUANGTRI_SCAN/view',
    projectId: 'proj-01',
    projectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Huế',
    notes: 'Yêu cầu rà phá độ sâu 5m khu vực thi công hầm chui.'
  },
  {
    id: 'doc-102',
    code: '45/CV-SXD-HGI',
    title: 'Công văn Yêu cầu Bổ sung Báo cáo Giám sát Chất lượng RPBM Khu đô thị mới Vị Xuyên, Hà Giang',
    type: 'vanban_den',
    category: 'Công văn chỉ đạo',
    issueDate: '2026-07-20',
    deadline: '2026-08-05',
    issuer: 'Sở Xây dựng tỉnh Hà Giang',
    recipientOrOwner: 'Phòng Nghiệp vụ QLRPBM',
    status: 'cho_xuly',
    driveUrl: 'https://drive.google.com/file/d/2X3Y4Z_CONGVAN_HAGIANG_SCAN/view',
    projectId: 'proj-02',
    projectName: 'Rà phá bom mìn Khu công nghiệp Vị Xuyên - Hà Giang',
    notes: 'Cần gửi bản scan chứng chỉ KTV cấp 3 kèm biên bản rà độ sâu 3m.'
  },
  {
    id: 'doc-103',
    code: '88/BB-NT-2026',
    title: 'Biên bản Nghiệm thu Bàn giao Đất sạch Bom mìn Giai đoạn 1 - Dự án Hồ chứa nước Krông Pách, Đắk Lắk',
    type: 'bienban',
    category: 'Biên bản nghiệm thu',
    issueDate: '2026-06-12',
    deadline: '2026-06-30',
    issuer: 'Hội đồng Nghiệm thu Bộ Lệnh Công binh',
    recipientOrOwner: 'Sở Nông nghiệp & PTNT Đắk Lắk',
    status: 'da_hoan_thanh',
    driveUrl: 'https://drive.google.com/file/d/3M4N5O_BIENBAN_KRONGPACH_SCAN/view',
    projectId: 'proj-03',
    projectName: 'Rà phá bom mìn Hồ chứa nước Krông Pách - Đắk Lắk',
    notes: 'Đã hoàn thành rà phá 45 ha đạt chỉ tiêu đất sạch an toàn.'
  },
  {
    id: 'doc-104',
    code: '12/TTr-QLRPBM',
    title: 'Tờ trình Đề nghị Kiểm định & Đăng kiểm Định kỳ Lô 10 Máy dò kim loại Vallon VMR3 và Xe tải dã chiến',
    type: 'vanban_di',
    category: 'Tờ trình nội bộ',
    issueDate: '2026-07-15',
    deadline: '2026-08-01',
    issuer: 'Phòng Nghiệp vụ QLRPBM',
    recipientOrOwner: 'Trung tâm Kiểm định TB BQP',
    status: 'dang_thuc_hien',
    driveUrl: 'https://drive.google.com/file/d/4P5Q6R_TOTRINH_KIEMDINH_SCAN/view',
    notes: 'Ưu tiên kiểm định trước ngày 05/08 để kịp phục vụ công trường Hà Tĩnh.'
  },
  {
    id: 'doc-105',
    code: '01/QCVN-2019-BQP',
    title: 'Quy chuẩn Kỹ thuật Quốc gia QCVN 01:2019/BQP về Rà phá Bom mìn Vật nổ',
    type: 'phaply',
    category: 'Quy chuẩn quốc gia',
    issueDate: '2019-11-15',
    deadline: '2030-12-31',
    issuer: 'Bộ Quốc phòng',
    recipientOrOwner: 'Toàn quốc',
    status: 'luu_tru',
    driveUrl: 'https://drive.google.com/file/d/5Q6R7S_QCVN_01_2019_BQP_PDF/view',
    notes: 'Quy chuẩn gốc bắt buộc áp dụng cho toàn bộ hoạt động rà phá.'
  }
];

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-01',
    code: 'DA-RPBM-2026-01',
    name: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế (Km 12+000 - Km 35+500)',
    investor: 'Ban Quản lý Dự án Đường Hồ Chí Minh - Bộ GTVT',
    province: 'Quảng Trị',
    district: 'Gio Linh',
    commune: 'Linh Trường',
    areaHa: 120.5,
    depthM: 5.0,
    signalDensity: 'rat_cao',
    budgetVnd: 4850000000, // 4,85 tỷ đồng
    status: 'dang_thi_cong',
    progressPercent: 68,
    startDate: '2026-02-01',
    endDate: '2026-09-30',
    commanderName: 'Thượng tá Nguyễn Văn Hùng',
    teamSize: 24,
    uxoFoundCount: 142,
    driveFolderUrl: 'https://drive.google.com/drive/folders/1PROJ_QUANGTRI_HUAN_SCAN',
    notes: 'Mật độ tín hiệu rất cao do nằm trong dải đường 9 Khe Sanh cũ. Đã hủy nổ an toàn 12 quả bom MK-82.',
    dailyLogs: [
      {
        id: 'log-01',
        projectId: 'proj-01',
        date: '2026-07-27',
        areaClearedHa: 1.8,
        uxoItemsFound: [
          { id: 'uxo-1', name: 'Đạn pháo 105mm M107', type: 'Đạn pháo', quantity: 2, depth: '0.6m', status: 'da_thu_gom' },
          { id: 'uxo-2', name: 'Mìn cá nhân M14', type: 'Mìn', quantity: 4, depth: '0.2m', status: 'da_huy' }
        ],
        weatherCondition: 'Nắng nóng 38°C',
        safetyStatus: 'an_toan',
        recordedBy: 'KTS. Lê Hoàng Nam',
        notes: 'Đã khoanh vùng hủy nổ tại bãi hủy nổ tập trung số 2.'
      }
    ]
  },
  {
    id: 'proj-02',
    code: 'DA-RPBM-2026-02',
    name: 'Rà phá bom mìn Mặt bằng Khu công nghiệp Vị Xuyên - Hà Giang (Giai đoạn 2)',
    investor: 'Ban Quản lý Các Khu Công nghiệp Tỉnh Hà Giang',
    province: 'Hà Giang',
    district: 'Vị Xuyên',
    commune: 'Thanh Thủy',
    areaHa: 85.0,
    depthM: 3.0,
    signalDensity: 'cao',
    budgetVnd: 2750000000, // 2,75 tỷ đồng
    status: 'dang_thi_cong',
    progressPercent: 42,
    startDate: '2026-04-15',
    endDate: '2026-10-15',
    commanderName: 'KTS. Lê Hoàng Nam',
    teamSize: 18,
    uxoFoundCount: 86,
    driveFolderUrl: 'https://drive.google.com/drive/folders/2PROJ_HAGIANG_VIXUYEN',
    notes: 'Địa hình đồi núi dốc, máy dò từ Foerster phải di chuyển bằng tay.',
    dailyLogs: []
  },
  {
    id: 'proj-03',
    code: 'DA-RPBM-2026-03',
    name: 'Rà phá bom mìn Lòng hồ và Vùng phụ cận Hồ chứa nước Krông Pách - Đắk Lắk',
    investor: 'Sở Nông nghiệp và Phát triển Nông thôn Tỉnh Đắk Lắk',
    province: 'Đắk Lắk',
    district: 'Krông Pách',
    commune: 'Ea Yông',
    areaHa: 45.0,
    depthM: 0.3,
    signalDensity: 'trung_binh',
    budgetVnd: 1350000000, // 1,35 tỷ đồng
    status: 'hoan_thanh',
    progressPercent: 100,
    startDate: '2026-01-10',
    endDate: '2026-06-10',
    commanderName: 'Thượng tá Nguyễn Văn Hùng',
    teamSize: 12,
    uxoFoundCount: 38,
    driveFolderUrl: 'https://drive.google.com/drive/folders/3PROJ_KRONGPACH_DAKLAK',
    notes: 'Đã hoàn thành rà phá và bàn giao đất sạch cho chủ đầu tư ngày 12/06/2026.',
    dailyLogs: []
  },
  {
    id: 'proj-04',
    code: 'DA-RPBM-2026-04',
    name: 'Rà phá bom mìn Dưới nước Khu vực Cảng biển Chân Mây - Thừa Thiên Huế',
    investor: 'Công ty Cổ phần Cảng Chân Mây',
    province: 'Thừa Thiên Huế',
    district: 'Phú Lộc',
    commune: 'Lộc Vĩnh',
    areaHa: 30.0,
    depthM: 5.0, // Rà phá dưới nước
    signalDensity: 'cao',
    budgetVnd: 3200000000, // 3,2 tỷ đồng
    status: 'chuan_bi',
    progressPercent: 10,
    startDate: '2026-08-10',
    endDate: '2026-12-20',
    commanderName: 'Thượng tá Nguyễn Văn Hùng',
    teamSize: 16,
    uxoFoundCount: 0,
    driveFolderUrl: 'https://drive.google.com/drive/folders/4PROJ_CHANMAY_WATER',
    notes: 'Sử dụng thiết bị rà phá sonar dã chiến và thợ lặn chuyên dùng.',
    dailyLogs: []
  }
];

export const INITIAL_PERSONNEL: Personnel[] = [
  {
    id: 'per-00',
    code: 'NS-000',
    fullName: 'Hà Huy Khánh',
    dob: '1972-04-12',
    hometown: 'Thái Bình',
    position: 'Phó Giám đốc / Thủ trưởng Cơ quan Thẩm định',
    jobTitle: 'Đại tá / Phó Giám đốc',
    rankTitle: 'Đại tá',
    specialization: 'Thẩm định Kỹ thuật & Quản lý RPBM',
    unit: 'Cục Báo cáo - Binh chủng Công binh',
    phone: '0988.999.888',
    email: 'khanh.hahuy@binhchungcongbinh.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-01',
    currentProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    roleInTeam: 'Thủ trưởng phê duyệt / Người ký thông báo thẩm định',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [],
    certificates: [
      {
        id: 'cert-000',
        certType: 'chi_huy_truong',
        certTypeLabel: 'Chứng chỉ Thẩm định & Chỉ huy',
        name: 'Chứng chỉ Thẩm định Kỹ thuật & Quản lý RPBM Cấp Cao',
        issuedBy: 'Bộ Quốc phòng',
        issueDate: '2020-01-15',
        effectiveDate: '2020-01-15',
        expiryDate: '2030-01-15',
        scopeOfPractice: 'Ký duyệt & Thẩm định Phương án Kỹ thuật RPBM Toàn quốc',
        certificateNo: 'TD-2020-001',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_TD_KHANH/view'
      }
    ]
  },
  {
    id: 'per-01',
    code: 'NS-001',
    fullName: 'Nguyễn Văn Hùng',
    dob: '1978-05-14',
    hometown: 'Thạch Thất, Hà Nội',
    position: 'Chỉ huy trưởng Nghiệp vụ RPBM',
    jobTitle: 'Thượng tá / Kỹ sư Công binh',
    rankTitle: 'Thượng tá',
    specialization: 'Kỹ thuật Rà phá Bom mìn & Vật nổ',
    unit: 'Phòng Nghiệp vụ Rà phá Bom mìn - Binh chủng Công binh',
    phone: '0983.123.456',
    email: 'hung.nguyen@qlrpbm.bqp.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-01',
    currentProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    roleInTeam: 'Chỉ huy trưởng công trường',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [
      { id: 'f-101', fileName: 'Ho_so_nhan_su_NguyenVanHung.pdf', fileUrl: 'https://drive.google.com/file/d/hoso-hung/view', uploadedAt: '2026-01-10' },
      { id: 'f-102', fileName: 'Quyet_dinh_bo_tri_Chihuytruong.pdf', fileUrl: 'https://drive.google.com/file/d/quyetdinh-hung/view', uploadedAt: '2026-02-01' }
    ],
    certificates: [
      {
        id: 'cert-101',
        certType: 'chi_huy_truong',
        certTypeLabel: 'Chứng chỉ Chỉ huy trưởng',
        name: 'Chứng chỉ Chỉ huy trưởng Rà phá Bom mìn',
        issuedBy: 'Bộ Lệnh Công binh - Bộ Quốc phòng',
        issueDate: '2021-08-10',
        effectiveDate: '2021-08-10',
        expiryDate: '2026-08-10', // Còn 13 ngày (sắp hết hạn)
        scopeOfPractice: 'Chỉ huy thi công RPBM trên toàn quốc cho các dự án nhóm A, B, C',
        certificateNo: 'CH-2021-0089',
        status: 'sap_het_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_CH_HUNG_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_CH_HUNG_SCAN/view',
        notes: 'Cần nộp hồ sơ gia hạn trước 10/08/2026'
      },
      {
        id: 'cert-102',
        certType: 'nghiep_vu_rpbm',
        certTypeLabel: 'Chứng chỉ Nghiệp vụ RPBM',
        name: 'Chứng chỉ Kỹ thuật viên Rà phá Bom mìn Cấp 3 (Tối cao)',
        issuedBy: 'Trung tâm Công nghệ Xử lý Bom mìn Môi trường (BMTT) - BQP',
        issueDate: '2021-08-10',
        effectiveDate: '2021-08-10',
        expiryDate: '2026-08-10',
        scopeOfPractice: 'Xử lý bom đạn lớn, điều hành bãi hủy nổ tập trung',
        certificateNo: 'KTV3-2021-0089',
        status: 'sap_het_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_KTV3_HUNG_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_KTV3_HUNG_SCAN/view'
      },
      {
        id: 'cert-103',
        certType: 'giam_sat',
        certTypeLabel: 'Chứng chỉ Giám sát',
        name: 'Chứng chỉ Giám sát Chất lượng & An toàn RPBM',
        issuedBy: 'Bộ Lệnh Công binh',
        issueDate: '2022-03-15',
        effectiveDate: '2022-03-15',
        expiryDate: '2027-03-15',
        scopeOfPractice: 'Giám sát kỹ thuật và chất lượng thi công RPBM',
        certificateNo: 'GS-2022-014',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_GIAMSAT_HUNG_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_GIAMSAT_HUNG_SCAN/view'
      }
    ]
  },
  {
    id: 'per-02',
    code: 'NS-002',
    fullName: 'Lê Hoàng Nam',
    dob: '1986-11-22',
    hometown: 'Đông Sơn, Thanh Hóa',
    position: 'Cán bộ Kỹ thuật Thi công',
    jobTitle: 'Đại úy / Kỹ sư Xây dựng & Kỹ thuật Công binh',
    rankTitle: 'Đại úy / Kỹ sư',
    specialization: 'Kỹ thuật Khảo sát & Hủy nổ Vật nổ',
    unit: 'Phòng Nghiệp vụ Rà phá Bom mìn',
    phone: '0912.345.678',
    email: 'nam.le@qlrpbm.bqp.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-02',
    currentProjectName: 'Rà phá bom mìn Khu công nghiệp Vị Xuyên - Hà Giang',
    roleInTeam: 'Cán bộ Kỹ thuật & Chỉ huy hủy nổ',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [
      { id: 'f-201', fileName: 'Ly_lich_chuyen_mon_LeHoangNam.pdf', fileUrl: 'https://drive.google.com/file/d/hoso-nam/view', uploadedAt: '2026-02-15' }
    ],
    certificates: [
      {
        id: 'cert-104',
        certType: 'can_bo_ky_thuat',
        certTypeLabel: 'Chứng chỉ Cán bộ kỹ thuật',
        name: 'Chứng chỉ Cán bộ Kỹ thuật RPBM Công trình',
        issuedBy: 'Trung tâm BMTT / BQP',
        issueDate: '2022-09-01',
        effectiveDate: '2022-09-01',
        expiryDate: '2027-09-01',
        scopeOfPractice: 'Lập phương án kỹ thuật thi công, trực tiếp chỉ đạo kỹ thuật tại hiện trường',
        certificateNo: 'CBKT-2022-0211',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_CBKT_NAM_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_CBKT_NAM_SCAN/view'
      },
      {
        id: 'cert-105',
        certType: 'an_toan_lao_dong',
        certTypeLabel: 'Chứng chỉ An toàn lao động',
        name: 'Chứng nhận Huấn luyện An toàn Vệ sinh Lao động Nhóm 2 (Chuyên ngành RPBM)',
        issuedBy: 'Cục An toàn Lao động - Bộ LĐTB&XH',
        issueDate: '2024-07-01',
        effectiveDate: '2024-07-01',
        expiryDate: '2026-07-01', // Đã quá hạn!
        scopeOfPractice: 'An toàn thi công rà phá bom mìn và vật nổ nguy hiểm',
        certificateNo: 'ATLD-2024-882',
        status: 'qua_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_ATLD_NAM_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_ATLD_NAM_SCAN/view',
        notes: 'Yêu cầu đăng ký lớp học lại an toàn vệ sinh lao động'
      },
      {
        id: 'cert-106',
        certType: 'giay_phep_lai_xe',
        certTypeLabel: 'Giấy phép lái xe',
        name: 'Giấy phép Lái xe Ô tô Hạng C (Quân sự & Dân sự)',
        issuedBy: 'Cục Xe - Máy / Bộ Quốc phòng',
        issueDate: '2021-04-10',
        effectiveDate: '2021-04-10',
        expiryDate: '2026-10-10', // Còn 74 ngày (sắp hết hạn 90d)
        scopeOfPractice: 'Điều khiển xe ô tô tải chuyên dùng RPBM đến 9 chổ và trọng tải >3.500kg',
        certificateNo: 'GPLX-C-2021-992',
        status: 'sap_het_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_GPLX_NAM/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_GPLX_NAM/view'
      }
    ]
  },
  {
    id: 'per-03',
    code: 'NS-003',
    fullName: 'Phạm Quốc Việt',
    dob: '1992-03-18',
    hometown: 'Kim Sơn, Ninh Bình',
    position: 'Nhân viên Y tế công trường',
    jobTitle: 'Trung úy / Y sĩ Đa khoa',
    rankTitle: 'Trung úy / Y sĩ',
    specialization: 'Cấp cứu Thượng đạn & Y học Quân sự',
    unit: 'Đội Y tế Dã chiến Rà phá Bom mìn',
    phone: '0978.111.222',
    email: 'viet.pham@qlrpbm.bqp.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-01',
    currentProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    roleInTeam: 'Nhân viên Y tế dã chiến & Cứu thương công trường',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [],
    certificates: [
      {
        id: 'cert-107',
        certType: 'so_cap_cuu',
        certTypeLabel: 'Chứng chỉ Sơ cấp cứu',
        name: 'Chứng chỉ Cấp cứu Thượng đạn & Cấp cứu Dã chiến RPBM',
        issuedBy: 'Học viện Quân y - Bộ Quốc phòng',
        issueDate: '2023-05-10',
        effectiveDate: '2023-05-10',
        expiryDate: '2028-05-10',
        scopeOfPractice: 'Sơ cứu thương tại chỗ, chuyển thương cấp cứu sự cố bom mìn',
        certificateNo: 'YTE-2023-055',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_YTE_VIET_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_YTE_VIET_SCAN/view'
      },
      {
        id: 'cert-108',
        certType: 'nghiep_vu_rpbm',
        certTypeLabel: 'Chứng chỉ Nghiệp vụ RPBM',
        name: 'Chứng chỉ Kỹ thuật viên Rà phá Bom mìn Cấp 1',
        issuedBy: 'Trung tâm BMTT / BQP',
        issueDate: '2023-10-15',
        effectiveDate: '2023-10-15',
        expiryDate: '2026-08-20', // Còn 23 ngày (sắp hết hạn 30d)
        scopeOfPractice: 'Dò tìm kim loại đến độ sâu 0.3m dưới sự giám sát',
        certificateNo: 'KTV1-2023-049',
        status: 'sap_het_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_KTV1_VIET_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_KTV1_VIET_SCAN/view'
      }
    ]
  },
  {
    id: 'per-04',
    code: 'NS-004',
    fullName: 'Trần Văn Mạnh',
    dob: '1995-08-05',
    hometown: 'Ý Yên, Nam Định',
    position: 'Kỹ thuật viên Dò tìm Kim loại',
    jobTitle: 'Thượng sĩ / Kỹ thuật viên',
    rankTitle: 'Thượng sĩ',
    specialization: 'Vận hành Máy dò Nông & Dò Sâu',
    unit: 'Đội Thi công số 1',
    phone: '0966.333.444',
    email: 'manh.tran@qlrpbm.bqp.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-01',
    currentProjectName: 'Rà phá bom mìn Dự án Cao tốc Quảng Trị - Thừa Thiên Huế',
    roleInTeam: 'Đội viên Dò tìm Kim loại & Đào bới tín hiệu',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [],
    certificates: [
      {
        id: 'cert-109',
        certType: 'nghiep_vu_rpbm',
        certTypeLabel: 'Chứng chỉ Nghiệp vụ RPBM',
        name: 'Chứng chỉ Kỹ thuật viên Rà phá Bom mìn Cấp 2',
        issuedBy: 'Trung tâm BMTT / BQP',
        issueDate: '2022-11-20',
        effectiveDate: '2022-11-20',
        expiryDate: '2027-11-20',
        scopeOfPractice: 'Dò tìm tín hiệu bom mìn đến độ sâu 3.0m, đào bới vật nổ an toàn',
        certificateNo: 'KTV2-2022-091',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_KTV2_MANH_SCAN/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_KTV2_MANH_SCAN/view'
      },
      {
        id: 'cert-110',
        certType: 'van_hanh_thiet_bi',
        certTypeLabel: 'Chứng chỉ Vận hành thiết bị',
        name: 'Chứng chỉ Vận hành Thiết bị Dò từ Foerster & Vallon EL1302',
        issuedBy: 'Trung tâm Kiểm định TB BQP',
        issueDate: '2023-01-15',
        effectiveDate: '2023-01-15',
        expiryDate: '2026-08-15', // Còn 18 ngày (sắp hết hạn)
        scopeOfPractice: 'Vận hành thiết bị dò từ trường và phân tích dữ liệu tín hiệu sâu',
        certificateNo: 'VHTB-2023-012',
        status: 'sap_het_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_VHTB_MANH/view',
        driveUrl: 'https://drive.google.com/file/d/CERT_VHTB_MANH/view'
      }
    ]
  },
  {
    id: 'per-05',
    code: 'NS-005',
    fullName: 'Hoàng Văn Thái',
    dob: '1989-12-01',
    hometown: 'Triệu Phong, Quảng Trị',
    position: 'Chỉ huy phó Thi công',
    jobTitle: 'Thiếu tá / Kỹ sư Xây dựng Cầu đường',
    rankTitle: 'Thiếu tá',
    specialization: 'Tổ chức Thi công & Quản lý Chất lượng RPBM',
    unit: 'Đội Thi công số 2',
    phone: '0935.888.999',
    email: 'thai.hoang@qlrpbm.bqp.vn',
    workStatus: 'dang_cong_tac',
    currentProjectId: 'proj-04',
    currentProjectName: 'Rà phá bom mìn Dưới nước Khu vực Cảng biển Chân Mây',
    roleInTeam: 'Chỉ huy phó công trường & Trưởng nhóm Lặn sâu',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    attachedFiles: [],
    certificates: [
      {
        id: 'cert-111',
        certType: 'chi_huy_truong',
        certTypeLabel: 'Chứng chỉ Chỉ huy trưởng',
        name: 'Chứng chỉ Chỉ huy trưởng RPBM Công trình Dưới nước',
        issuedBy: 'Bộ Lệnh Công binh',
        issueDate: '2023-06-10',
        effectiveDate: '2023-06-10',
        expiryDate: '2028-06-10',
        scopeOfPractice: 'Chỉ huy rà phá bom mìn mặt bằng đất khô và vùng sông biển dưới nước',
        certificateNo: 'CH-2023-044',
        status: 'con_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_CH_THAI/view'
      },
      {
        id: 'cert-112',
        certType: 'huan_luyen',
        certTypeLabel: 'Chứng nhận Huấn luyện',
        name: 'Chứng nhận Huấn luyện Thợ lặn Kỹ thuật Rà phá Dưới nước Cấp II',
        issuedBy: 'Trường Sĩ quan Công binh',
        issueDate: '2021-03-20',
        effectiveDate: '2021-03-20',
        expiryDate: '2026-03-20', // Đã hết hạn!
        scopeOfPractice: 'Lặn dò tìm và buộc cáp trục vớt tín hiệu bom đạn dưới nước sâu đến 20m',
        certificateNo: 'LAN-2021-019',
        status: 'qua_han',
        scanFileUrl: 'https://drive.google.com/file/d/CERT_LAN_THAI/view',
        notes: 'Cần kiểm tra lại sức khỏe thợ lặn và cấp đổi chứng nhận mới'
      }
    ]
  }
];

export const INITIAL_EQUIPMENT: EquipmentItem[] = [
  {
    id: 'eq-01',
    code: 'MD-VAL-01',
    name: 'Máy dò kim loại Vallon VMR3 Minehound (Đức)',
    category: 'may_do_nong',
    brandModel: 'Vallon VMR3 (Dual Sensor GPR & EMI)',
    serialOrPlate: 'SN-VAL-2022-9981',
    status: 'hoat_dong_tot',
    location: 'Công trường Cao tốc Quảng Trị (Đội 1)',
    lastCalibrationDate: '2025-08-10',
    nextCalibrationDate: '2026-08-10', // Còn 13 ngày
    assignedTo: 'KTS. Lê Hoàng Nam',
    maintenanceLogs: [
      { id: 'm-1', date: '2026-02-10', action: 'Thay dây cáp nối anten dò EMI và cân chỉnh dải đo', performedBy: 'Trung tâm TB BQP', costVnd: 4500000 }
    ]
  },
  {
    id: 'eq-02',
    code: 'MD-FOE-02',
    name: 'Máy đo từ từ trường Rà sâu Foerster FEREX 4.034 (Đức)',
    category: 'may_do_sau',
    brandModel: 'Foerster FEREX 4.034 DLG',
    serialOrPlate: 'SN-FOE-2021-3342',
    status: 'can_bao_duong',
    location: 'Kho Trạm Thiết bị Hà Nội',
    lastCalibrationDate: '2025-06-01',
    nextCalibrationDate: '2026-06-01', // Quá hạn!
    assignedTo: 'Đại úy Trần Quốc Tuấn',
    maintenanceLogs: [
      { id: 'm-2', date: '2025-06-01', action: 'Hiệu chuẩn định kỳ từ trường địa phương', performedBy: 'Viện Đo lường BQP', costVnd: 8200000 }
    ]
  },
  {
    id: 'eq-03',
    code: 'XE-BOI-01',
    name: 'Xe Bán tải Chỉ huy 2 Cầu Ford Ranger Wildtrak (Phục vụ Công trường)',
    category: 'phuong_tien',
    brandModel: 'Ford Ranger 2.0 Bi-Turbo',
    serialOrPlate: '29A-882.39 (Xe Chỉ huy)',
    status: 'hoat_dong_tot',
    location: 'Công trường Hà Giang',
    lastCalibrationDate: '2025-08-20',
    nextCalibrationDate: '2026-08-20', // Còn 23 ngày
    assignedTo: 'Thượng tá Nguyễn Văn Hùng',
    maintenanceLogs: [
      { id: 'm-3', date: '2026-03-15', action: 'Bảo dưỡng 40.000km, thay 4 lốp dã chiến bám đường', performedBy: 'Ford Hà Nội', costVnd: 18500000 }
    ]
  },
  {
    id: 'eq-04',
    code: 'XE-TAI-02',
    name: 'Xe Tải Chuyên dùng Chở Thiết bị & Vật tư Hủy nổ Hino 5 Tấn',
    category: 'phuong_tien',
    brandModel: 'Hino FC9JJTC 5 Tấn',
    serialOrPlate: '29C-124.88 (Xe Chuyên dùng)',
    status: 'hoat_dong_tot',
    location: 'Kho Trạm Thiết bị Hà Nội',
    lastCalibrationDate: '2025-07-15',
    nextCalibrationDate: '2026-07-15', // Đã quá hạn Đăng kiểm 13 ngày!
    assignedTo: 'Đại úy Trần Quốc Tuấn',
    maintenanceLogs: [
      { id: 'm-4', date: '2026-01-20', action: 'Sửa chữa hệ thống phanh và kiểm tra thùng chở thuốc nổ', performedBy: 'Gara BQP', costVnd: 12000000 }
    ]
  },
  {
    id: 'eq-05',
    code: 'BH-GIAP-08',
    name: 'Bộ Áo giáp & Mũ bảo hộ chống mảnh văng chuyên dụng RPBM (Sản xuất tại Israel)',
    category: 'bao_ho',
    brandModel: 'Safariland EOD Bomb Suit V9',
    serialOrPlate: 'SN-SAF-2023-088',
    status: 'hoat_dong_tot',
    location: 'Công trường Quảng Trị',
    lastCalibrationDate: '2026-01-05',
    nextCalibrationDate: '2027-01-05',
    assignedTo: 'KTS. Lê Hoàng Nam',
    maintenanceLogs: []
  }
];

export const INITIAL_LEGAL_DOCS: LegalDocument[] = [
  {
    id: 'leg-01',
    code: 'QCVN 01:2022/BQP',
    title: 'Quy chuẩn kỹ thuật quốc gia về rà phá bom mìn vật nổ',
    type: 'QCVN',
    effectiveDate: '2020-05-01',
    status: 'con_hieu_luc',
    summary: 'Quy chuẩn quy định các yêu cầu kỹ thuật, quy trình công nghệ, công tác bảo đảm an toàn và nghiệm thu bàn giao trong hoạt động rà phá bom mìn vật nổ trên lãnh thổ Việt Nam.',
    keyPoints: [
      'Quy định 3 độ sâu rà phá chính: Cạn đến 0,3m; Sâu đến 3m; Sâu đến 5m và Rà phá dưới nước.',
      'Khoảng cách an toàn tối thiểu khi hủy nổ vật nổ theo đương lượng TNT.',
      'Yêu cầu bắt buộc về chứng chỉ kỹ thuật viên (Cấp 1, Cấp 2, Cấp 3).',
      'Quy trình lập phương án kỹ thuật và nghiệm thu bàn giao đất sạch.'
    ],
    driveUrl: 'https://drive.google.com/file/d/QCVN_01_2022_BQP_SCAN/view'
  },
  {
    id: 'leg-02',
    code: 'Nghị định 18/2019/NĐ-CP',
    title: 'Nghị định về quản lý và thực hiện hoạt động khắc phục hậu quả bom mìn vật nổ sau chiến tranh',
    type: 'Nghị định',
    effectiveDate: '2019-03-20',
    status: 'con_hieu_luc',
    summary: 'Nghị định quy định về lập kế hoạch, tài chính, phân công trách nhiệm giữa Bộ Quốc phòng, các Bộ ngành và UBND cấp tỉnh trong khắc phục hậu quả bom mìn.',
    keyPoints: [
      'Bộ Quốc phòng là cơ quan quản lý nhà nước về hoạt động khắc phục hậu quả bom mìn.',
      'Quy định về cấp phép hoạt động đối với các tổ chức, doanh nghiệp tham gia RPBM.',
      'Chính sách hỗ trợ nạn nhân bom mìn và tuyên truyền phòng tránh tai nạn.'
    ],
    driveUrl: 'https://drive.google.com/file/d/NGHIDINH_18_2019_NDCP_SCAN/view'
  },
  {
    id: 'leg-03',
    code: 'Thông tư 195/2019/TT-BQP',
    title: 'Thông tư Quy định chi tiết thi hành Nghị định số 18/2019/NĐ-CP',
    type: 'Thông tư',
    effectiveDate: '2020-02-15',
    status: 'con_hieu_luc',
    summary: 'Chi tiết hóa quy trình thẩm định phương án kỹ thuật, dự toán ngân sách, giám sát chất lượng và cấp chứng chỉ chuyên môn cho nhân sự rà phá bom mìn.',
    keyPoints: [
      'Biểu mẫu hồ sơ trình duyệt dự toán và phương án thi công.',
      'Trình tự kiểm tra, nghiệm thu và lưu trữ hồ sơ công trình RPBM.',
      'Hồ sơ đăng ký cấp chứng chỉ kỹ thuật viên rà phá bom mìn.'
    ],
    driveUrl: 'https://drive.google.com/file/d/THONGTU_195_2019_TTBQP_SCAN/view'
  },
  {
    id: 'leg-04',
    code: 'TCVN 10299-1:2014',
    title: 'Tiêu chuẩn quốc gia TCVN 10299-1:2014 về Khắc phục hậu quả bom mìn vật nổ - Phần 1: Yêu cầu chung',
    type: 'TCVN',
    effectiveDate: '2014-12-30',
    status: 'con_hieu_luc',
    summary: 'Quy định các thuật ngữ, định nghĩa, phân loại vật nổ và tiêu chuẩn chất lượng đầu ra đối với diện tích đất đã rà phá.',
    keyPoints: [
      'Phân loại vật nổ: Bom, mìn, đạn pháo, ngòi nổ, vật nổ tự chế.',
      'Chỉ tiêu đất sạch bom mìn đạt xác suất an toàn 99,9%.'
    ],
    driveUrl: 'https://drive.google.com/file/d/TCVN_10299_1_2014_SCAN/view'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-07-28 08:15:22',
    userName: 'Nguyễn Văn Hùng',
    userRole: 'Tiểu đoàn trưởng / Chỉ huy trưởng',
    module: 'Văn bản & Hồ sơ',
    action: 'Duyệt hồ sơ',
    details: 'Đã ký phê duyệt Biên bản Nghiệm thu Dự án Hồ chứa nước Krông Pách'
  },
  {
    id: 'log-102',
    timestamp: '2026-07-27 16:40:10',
    userName: 'Lê Hoàng Nam',
    userRole: 'Cán bộ Kỹ thuật & An toàn',
    module: 'Dự án RPBM',
    action: 'Cập nhật Nhật ký',
    details: 'Đã nhập nhật ký thi công ngày 27/07/2026 cho Dự án Cao tốc Quảng Trị (Hủy nổ 4 mìn M14)'
  },
  {
    id: 'log-103',
    timestamp: '2026-07-26 10:20:00',
    userName: 'Trần Quốc Tuấn',
    userRole: 'Cán bộ Quản lý Thiết bị',
    module: 'Phương tiện & Thiết bị',
    action: 'Gửi yêu cầu Đăng kiểm',
    details: 'Tạo tờ trình kiểm định cho lô máy dò Vallon VMR3 và xe tải chở vật tư'
  },
  {
    id: 'log-104',
    timestamp: '2026-07-25 09:00:15',
    userName: 'Phạm Thị Mai',
    userRole: 'Cán bộ Văn thư',
    module: 'Văn bản & Hồ sơ',
    action: 'Tải file scan Google Drive',
    details: 'Cập nhật đường dẫn file scan Công văn 45/CV-SXD-HGI lên hệ thống Google Drive'
  }
];
