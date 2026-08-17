export type UserRole = 'quantri' | 'chihuy' | 'phochihuy' | 'kythuat' | 'vanthu' | 'thietbi' | 'nhanvien';

export interface UserPermissions {
  canManageAccounts?: boolean;
  canAssignRoles?: boolean;
  canManageCategories?: boolean;
  canViewAllData?: boolean;
  canEditAllData?: boolean;
  canViewSystemLogs?: boolean;
  canRestoreDeletedData?: boolean;
  canSetAlertThresholds?: boolean;
  canApproveWork?: boolean;
  canApproveDocs?: boolean;
  canApproveEquipment?: boolean;
  canApprovePayment?: boolean;
  canDeleteCriticalData?: boolean;
}

export type FeatureAccessLevel = 'none' | 'view' | 'edit' | 'check' | 'approve' | 'full';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  roleLabel: string;
  title: string;
  avatar: string;
  email: string;
  phone: string;
  departmentOrUnit?: string;
  position?: string;
  positionCode?: 'BATTALION_COMMANDER' | 'DEPUTY_BATTALION_COMMANDER' | 'STAFF' | string;
  permissions: string[];
  detailedPermissions?: UserPermissions;
  featurePermissions?: Record<string, FeatureAccessLevel>;
  isLocked?: boolean;
  status?: 'active' | 'pending_activation' | 'locked' | 'expired';
  activationCode?: string;
  activationExpiry?: string;
  accessibleProjects?: string[];
  accessibleModules?: string[];
  secrecyLevel?: 'thuong' | 'mat' | 'toi_mat';
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  mustChangePassword?: boolean;
  lastLoginAt?: string;
  lastLoginIp?: string;
  failedLoginAttempts?: number;
  lockUntil?: string;
  defaultTab?: string;
  expiryDate?: string;
  passwordHash?: string;
}

export interface AuthSession {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  loginTime: string;
  lastActiveTime: string;
  expiresAt: string;
  device: string;
  browser: string;
  os: string;
  ipAddress: string;
  location?: string;
  status: 'active' | 'logged_out' | 'expired' | 'revoked' | 'locked';
  loginMethod: 'password' | 'google' | 'sso';
  is2FAVerified: boolean;
}

export interface AccessPermissionRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requestedModule: string;
  requestedModuleName: string;
  requestedProject?: string;
  requestedProjectName?: string;
  accessType: FeatureAccessLevel;
  reason: string;
  durationDays: number;
  requestedExpiresAt: string;
  approverName?: string;
  status: 'pending' | 'approved' | 'approved_limited' | 'rejected' | 'expired' | 'revoked';
  decisionNote?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthSecurityConfig {
  sessionTimeoutMinutes: number;
  secretDocSessionTimeoutMinutes: number;
  maxFailedAttemptsBeforeTempLock: number;
  tempLockMinutes: number;
  maxFailedAttemptsBeforeAdminLock: number;
  require2FAForAdmins: boolean;
  require2FAForApprovers: boolean;
  require2FAForSecretDocs: boolean;
  allowedEmailDomains: string[];
  allowedIPs: string[];
  enableDeviceControl: boolean;
  restrictToInternalNetwork: boolean;
  enableGoogleLogin: boolean;
  enablePasswordLogin: boolean;
}

export interface BaseDataAudit {
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  departmentOrUnit?: string;
  dataStatus?: 'hoat_dong' | 'da_xoa' | 'luu_tru';
}

export type DocumentType =
  | 'vanban_den'
  | 'vanban_di'
  | 'vanban_noi_bo'
  | 'thong_bao_tham_dinh'
  | 'hoso_duan'
  | 'bienban'
  | 'phuongan'
  | 'phaply';

export type IncomingDocStatus =
  | 'moi_tiep_nhan'
  | 'cho_phan_cong'
  | 'dang_xu_ly'
  | 'cho_phe_duyet'
  | 'da_hoan_thanh'
  | 'qua_han'
  | 'tam_dung';

export type OutgoingDocReleaseStatus =
  | 'ban_du_thao'
  | 'cho_kiem_tra'
  | 'cho_ky'
  | 'da_phat_hanh'
  | 'da_gui';

export type InternalDocCategory =
  | 'thong_bao'
  | 'ke_hoach'
  | 'bao_cao'
  | 'to_trinh'
  | 'bien_ban'
  | 'quyet_dinh'
  | 'phieu_giao_viec'
  | 'lich_cong_tac'
  | 'quy_che_quy_dinh';

export interface WorkflowStep {
  id: string;
  stepName: string; // 'Tiếp nhận' | 'Phân công' | 'Xử lý' | 'Trình duyệt' | 'Phê duyệt' | 'Hoàn thành' | 'Lưu hồ sơ'
  performedBy: string;
  role: string;
  timestamp: string;
  comments?: string;
  assignedTo?: string;
  coAssignedTo?: string[];
  attachedFiles?: { name: string; url: string }[];
}

export interface DocumentLink {
  docId: string;
  docCode: string;
  docTitle: string;
  relationType: 'tra_loi_cho' | 'lien_quan' | 'thay_the' | 'kem_theo';
}

export interface DocumentAttachment {
  id: string;
  fileName: string;
  fileSize: number; // Kích thước tệp (bytes)
  fileType: 'pdf' | 'doc' | 'docx' | string; // Loại tệp
  fileUrl: string; // Đường dẫn/Data URL
  uploadedAt: string; // Thời gian tải lên
}

export type DocumentStatus = IncomingDocStatus | 'dang_thuc_hien' | 'da_hoan_thanh' | 'luu_tru' | 'cho_xuly';

export interface DocumentRecord extends BaseDataAudit {
  id: string;
  code: string; // Số, ký hiệu văn bản
  title: string; // Trích yếu nội dung
  type: DocumentType;
  category: string; // e.g. Công văn, Thông báo, Quyết định...

  // 5.1 Văn bản đến
  stt?: number;
  incomingNumber?: string; // Số đến (legacy text)
  incomingNumberSeq?: number; // Tách dữ liệu: Số đến dạng số
  incomingNumberDisplay?: string; // Tách dữ liệu: Chuỗi hiển thị (ví dụ "153/ĐẾN")
  incomingDate?: string; // Ngày đến
  issueDate: string; // Ngày ban hành
  issuerCode?: string; // Mã cơ quan ban hành ('ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER' | 'BINH_CHUNG_CONG_BINH' | 'BO_QUOC_PHONG')
  issuer: string; // Cơ quan ban hành
  issuingAgencyName?: string; // Tên cơ quan ban hành thực tế
  issuingAgencyCode?: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER' | string; // Mã cơ quan ban hành
  securityLevel?: 'thuong' | 'mat' | 'toi_mat' | 'tuyet_mat'; // Độ mật
  urgencyLevel?: 'thuong' | 'khan' | 'thuong_khan' | 'hoa_toc'; // Độ khẩn (legacy/ngừng hiển thị)
  receiver?: string; // Người tiếp nhận (Tên)
  receiverId?: string; // ID Người tiếp nhận (từ Nhân sự)
  receiverName?: string; // Họ tên người tiếp nhận
  receiverRank?: string; // Cấp bậc người tiếp nhận (snapshot)
  receiverPosition?: string; // Chức vụ người tiếp nhận (snapshot)
  receiverUnit?: string; // Đơn vị người tiếp nhận (snapshot)

  // Người giao xử lý (Tài khoản người dùng Chỉ huy Tiểu đoàn & Snapshot)
  assignerUserId?: string; // ID tài khoản người dùng giao xử lý
  assignerPersonId?: string; // ID hồ sơ nhân sự liên kết (nếu có)
  assignerNameSnapshot?: string; // Snapshot Họ tên người giao xử lý
  assignerRankSnapshot?: string; // Snapshot Cấp bậc người giao xử lý
  assignerPositionSnapshot?: string; // Snapshot Chức vụ người giao xử lý
  assignerRoleSnapshot?: string; // Snapshot Quyền/Vai trò người giao xử lý
  assignerEmailSnapshot?: string; // Snapshot Email người giao xử lý

  leaderId?: string; // ID Người giao xử lý (Lãnh đạo / Tiểu đoàn trưởng - legacy mirror)
  leaderName?: string; // Tên Người giao xử lý
  assigningPersonRank?: string; // Cấp bậc người giao xử lý (snapshot)
  assigningPersonTitle?: string; // Chức vụ người giao xử lý ("Tiểu đoàn trưởng")
  handlerId?: string; // ID Người phụ trách xử lý
  assignedProcessor?: string; // Người phụ trách xử lý (Họ tên hiển thị)
  handlerRank?: string; // Cấp bậc người phụ trách xử lý (snapshot)
  handlerPosition?: string; // Chức vụ người phụ trách xử lý (snapshot)
  handlerUnit?: string; // Đơn vị người phụ trách xử lý (snapshot)
  coProcessors?: string[]; // Người phối hợp xử lý
  assignedDate?: string; // Ngày giao xử lý
  deadline?: string; // Hạn xử lý (legacy/ngừng hiển thị)
  status: DocumentStatus; // Trạng thái xử lý (legacy/ngừng hiển thị)
  directiveOpinion?: string; // Ý kiến chỉ đạo
  processingResult?: string; // Kết quả xử lý
  replyDocCode?: string; // Văn bản trả lời
  scanFileUrl?: string; // File scan đính kèm
  attachments?: DocumentAttachment[]; // Danh sách tệp đính kèm (PDF, DOC, DOCX)
  driveUrl: string; // Link Google Drive
  recipientOrOwner?: string;
  notes?: string;

  // 5.2 Văn bản đi
  outgoingNumber?: string; // Số văn bản (legacy text)
  outgoingNumberSeq?: number; // Tách dữ liệu: Số văn bản đi dạng số (sequenceNumber)
  insertSuffix?: string; // Hậu tố số chèn (ví dụ "A", "B")
  outgoingNumberDisplay?: string; // Tách dữ liệu: Chuỗi hiển thị (ví dụ "29" hoặc "20A")
  outgoingCodeSymbol?: string; // Ký hiệu văn bản (ví dụ "29/QĐ-TĐ" hoặc "20A/QĐ-BCCB")
  draftAuthorId?: string; // ID Người soạn thảo (từ Nhân sự)
  draftAuthor?: string; // Người soạn thảo (Họ tên hiển thị)
  draftAuthorRank?: string; // Cấp bậc người soạn thảo (snapshot)
  draftAuthorPosition?: string; // Chức vụ người soạn thảo (snapshot)
  draftAuthorUnit?: string; // Đơn vị người soạn thảo (snapshot)
  checker?: string; // Người kiểm tra (legacy/ngừng hiển thị)
  signer?: string; // Người ký (legacy / Họ tên)
  signerUserId?: string; // ID tài khoản người dùng ký văn bản
  signerId?: string; // ID Người ký (Lãnh đạo / Tài khoản)
  signerName?: string; // Tên Người ký
  signerTitle?: string; // Chức vụ người ký
  signerRank?: string; // Cấp bậc người ký (snapshot)
  signerUnit?: string; // Đơn vị người ký (snapshot)
  recipientLocation?: string; // Nơi nhận
  releaseStatus?: OutgoingDocReleaseStatus; // Tình trạng phát hành (legacy/ngừng hiển thị)
  draftFileUrl?: string; // File bản dự thảo
  officialFileUrl?: string; // File bản chính thức
  signedScanFileUrl?: string; // File scan có chữ ký
  relatedDocCodes?: string[]; // Văn bản liên quan

  // Workflow tracking
  workflowHistory?: WorkflowStep[];
  linkedDocs?: DocumentLink[];

  // Project & metadata
  projectId?: string;
  projectName?: string;
  uploader?: string;
  uploadDate?: string;
  version?: string;
  accessPermission?: 'cong_khai' | 'noi_bo' | 'mat' | 'gioi_han';
  approvedBy?: string;
  approvalDate?: string;
}

// Section 5.5: Quản lý Thông báo thẩm định thuộc dự án
export type AppraisalType =
  | 'khao_sat_thi_cong' // Khảo sát – thi công
  | 'khao_sat_giam_sat' // Khảo sát – giám sát
  | 'thi_cong'          // Thi công
  | 'giam_sat'          // Giám sát
  | 'dtks'
  | 'pakt_tc'
  | 'du_toan'
  | 'pakt_vado_du_toan'
  | 'dieu_chinh_bo_sung'
  | 'cong_tac_thi_cong'
  | 'cong_tac_giam_sat'
  | 'khac';

export type AppraisalConclusion =
  | 'du_dieukien_pheduyet'
  | 'du_dieukien_trienkhai'
  | 'du_dieukien_bosung_hoso'
  | 'yeucau_chinhsua'
  | 'yeucau_thamdinh_lai'
  | 'chua_du_dieukien'
  | 'khong_duoc_chapthuan'
  | 'da_duoc_thaythe'
  | 'het_hieuluc';

export type TaskAuthorityLevel =
  | 'bo_tu_lenh'
  | 'bo_quoc_phong'
  | 'quan_khu'
  | 'bqp_phe_duyet'
  | 'chu_dau_tu'
  | 'cap_khac';

export type AssigningAuthorityLevel = 'bo_tu_lenh' | 'bo_quoc_phong';

export interface WorkCategoryDetail {
  taskAuthority: AssigningAuthorityLevel; // Cấp giao nhiệm vụ: Bộ Tư lệnh | Bộ Quốc phòng
  areaHa?: number;
  budgetValueVnd?: number;
  durationDays?: number;
  notes?: string;
}

export interface AppraisalWorkCategories {
  surveyAndPakt?: WorkCategoryDetail; // 1. Công tác khảo sát – lập phương án
  construction?: WorkCategoryDetail;  // 2. Công tác thi công
  supervision?: WorkCategoryDetail;   // 3. Công tác giám sát thi công
}

export type AppraisalStatus =
  | 'moi_tiep_nhan'
  | 'chua_lien_ket_du_an'
  | 'dang_trich_xuat_ai'
  | 'cho_kiem_tra'
  | 'dang_xu_ly'
  | 'cho_bo_sung_ho_so'
  | 'cho_phe_duyet'
  | 'da_xac_nhan'
  | 'da_cap_nhat_du_an'
  | 'da_hoan_thanh'
  | 'duoc_thay_the'
  | 'het_hieuluc';

export interface AppraisalAdditionRequirement {
  id: string;
  content: string; // Nội dung phải chỉnh sửa/bổ sung
  responsibleUnit: string; // Đơn vị/người chịu trách nhiệm
  assignedPerson: string;
  deadline: string;
  actualCompletionDate?: string;
  completionResult?: string;
  fileUrl?: string;
  inspectionComments?: string;
  isCompleted: boolean;
}

export interface AppraisalNotice extends BaseDataAudit {
  id: string;
  noticeCode: string; // Mã thông báo thẩm định (TB-TD-2026-001)
  noticeNumber: string; // Số thông báo (VD: "15")
  noticeNumberSeq?: number; // Số thứ tự số thông báo dạng number để sắp xếp
  codeSymbol: string; // Ký hiệu thông báo (VD: "15/TB-BCCB")
  issueDate: string;
  receiveDate: string;
  appraisalAgency: string; // Cơ quan thẩm định (Legacy & Display)
  appraisalAuthorityCode?: 'BO_QUOC_PHONG' | 'BINH_CHUNG_CONG_BINH' | string;
  appraisalAuthorityNameSnapshot?: string;
  leadUnit: string; // Đơn vị chủ trì thẩm định
  signerName: string; // Người ký
  signerDisplayName?: string; // Tên hiển thị người ký
  signerTitle: string; // Chức vụ người ký
  signerId?: string; // ID nhân sự / tài khoản người ký
  signerUserId?: string; // User ID người ký
  signerPersonId?: string; // Person ID nếu có
  signerRank?: string; // Cấp bậc người ký
  signerUnit?: string; // Đơn vị người ký
  signerNameSnapshot?: string; // Snapshot tên người ký
  signerRankSnapshot?: string; // Snapshot cấp bậc
  signerPositionSnapshot?: string; // Snapshot chức vụ
  signerRoleSnapshot?: string; // Snapshot vai trò/chức danh
  signerEmailSnapshot?: string; // Snapshot email
  appraisalType: AppraisalType;
  appraisalTurn: number; // Lần thẩm định
  contentSummary: string; // Nội dung thẩm định
  conclusion: AppraisalConclusion; // Trạng thái kết luận
  
  effectiveStatus: 'dang_hieu_luc' | 'duoc_thay_the' | 'het_hieuluc';
  effectiveDate: string;
  expiryDate?: string;
  replacedNoticeId?: string;
  replacingNoticeId?: string;
  
  proposalDocCode?: string; // Văn bản đề nghị thẩm định
  approvalDocCode?: string; // Văn bản phê duyệt liên quan
  noticeFileUrl?: string; // File scan
  appendixFileUrl?: string; // Phụ lục kèm
  driveFolderUrl?: string;
  notes?: string;

  // 5.5.3 Project Linking & Incoming Document Linkage
  incomingDocId?: string; // ID văn bản đến liên kết
  incomingDocCode?: string; // Số/Ký hiệu văn bản đến (ví dụ: 354/BQP-VP hoặc 102/ĐEN)
  projectId: string; // ID dự án liên kết
  projectName?: string; // Tên dự án liên kết (tự động lấy qua văn bản đến hoặc dự án)
  isCurrentActiveNotice: boolean; // Thông báo thẩm định hiện hành

  // 5.5.4 Numbers & 3 Work Categories
  workCategories?: AppraisalWorkCategories; // 3 loại công việc: Khảo sát-PAKT, Thi công, Giám sát thi công
  totalProjectAreaHa: number;
  landAreaHa: number;
  waterAreaHa: number;
  approvedClearanceAreaHa: number; // Tổng diện tích RPBM được duyệt = land + water
  approvedSurveyAreaHa: number;
  approvedConstructionAreaHa: number;
  approvedSupervisionAreaHa: number;
  coordinatesCenter?: string;
  mapDiagramFileUrl?: string;

  // Budget
  submittedBudgetValueVnd: number;
  afterAppraisalBudgetValueVnd: number;
  approvedBudgetValueVnd: number;
  landBudgetValueVnd: number;
  waterBudgetValueVnd: number;
  surveyAndPaktBudgetValueVnd: number;
  constructionBudgetValueVnd: number;
  supervisionBudgetValueVnd: number;
  incurredValueVnd: number;
  adjustedDecreaseValueVnd: number;
  adjustedIncreaseValueVnd: number;
  totalAfterAdjustVnd: number;

  // Time
  startDate: string;
  endDate: string;
  totalDays: number;
  surveyDays?: number;
  constructionDays?: number;
  supervisionDays?: number;

  // Requirements
  requirements: AppraisalAdditionRequirement[];

  // Section 5.5.4 & Sync
  taskAuthority?: 'bo_tu_lenh' | 'bo_quoc_phong'; // Cấp giao nhiệm vụ
  decisionDocCode?: string; // Số, ký hiệu Quyết định giao nhiệm vụ từ VB đến
  reportingPeriodAreaHa?: number; // Diện tích thực hiện trong kỳ báo cáo
  reportingPeriodValueVnd?: number; // Giá trị thực hiện trong kỳ báo cáo
  attachments?: {
    id: string;
    name: string;
    size: number;
    url: string;
    uploadDate: string;
    status: 'uploading' | 'uploaded' | 'error';
  }[];
  projectSnapshot?: {
    projectName: string;
    location: string;
    investor: string;
    totalAreaHa: number;
    landAreaHa: number;
    waterAreaHa: number;
    approvedBudgetValueVnd: number;
    workType?: string;
    taskAuthority?: string;
    decisionDocCode?: string;
    snapshotDate: string;
  };

  // Status
  status: AppraisalStatus;
  
  // AI extraction state
  isAiExtracted?: boolean;
  aiSuggestedData?: Partial<AppraisalNotice>;
  isConfirmedByAuthority?: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
}

// Section 5.6: Lập báo cáo quý từ Thông báo thẩm định và dự án
export type QuarterlyReportType =
  | 'phu_luc_1_giam_sat' // Phụ lục I - Kết quả thực hiện công tác giám sát thi công
  | 'phu_luc_2_khao_sat' // Phụ lục II - Kết quả thực hiện công tác điều tra khảo sát, lập PAKTTC & dự toán
  | 'phu_luc_3_thi_cong'; // Phụ lục III - Kết quả thực hiện công tác thi công rà phá bom mìn

export type QuarterlyReportStatus =
  | 'ban_nhap'
  | 'dang_tong_hop'
  | 'cho_kiem_tra'
  | 'cho_phe_duyet'
  | 'da_phe_duyet'
  | 'da_phat_hanh'
  | 'da_thay_the';

export interface QuarterlyReportLineItem {
  id: string;
  stt: number;
  projectId: string;
  projectName: string;
  district: string;
  province: string;
  commune?: string;
  coordinatesCenter?: string;
  investor: string;
  
  // Approved numbers
  approvedLandAreaHa: number;
  approvedWaterAreaHa: number;
  totalApprovedAreaHa: number; // = land + water
  approvedBudgetVnd: number;
  totalProjectAreaHa?: number;

  // Executed in reporting period
  periodExecutedLandAreaHa: number;
  periodExecutedWaterAreaHa: number;
  totalPeriodExecutedAreaHa: number; // = land + water
  periodExecutedValueVnd: number;

  // UXO Collection
  uxoQuantityCount: number;
  uxoWeightKg: number;
  disposalLocation?: string;
  coordinatingUnit?: string;
  
  groupType: 'QUAN_KHU' | 'BO_QUOC_PHONG' | 'KHAC';
  notes?: string;
  sourceAppraisalNoticeId?: string;
}

export interface QuarterlyReport extends BaseDataAudit {
  id: string;
  reportCode: string;
  reportNumber: string;
  reportType: QuarterlyReportType;
  quarter: 1 | 2 | 3 | 4;
  year: number;
  reportDate: string;
  issuingUnit: string; // e.g. "Tiểu đoàn 93/Binh chủng Công binh"
  taskAuthorityLevel: TaskAuthorityLevel;
  
  title: string;
  subtitle: string;
  
  creatorName: string;
  checkerName?: string;
  approverName?: string;
  
  version: string;
  status: QuarterlyReportStatus;
  
  excelExportUrl?: string;
  pdfExportUrl?: string;
  driveUrl?: string;
  
  dataLockTimestamp?: string;
  items: QuarterlyReportLineItem[];
  uploader?: string;
  uploadDate?: string;
}

export type FullProjectStatus =
  | 'chuan_bi_dau_tu'
  | 'dang_trinh_tham_dinh'
  | 'chuan_bi_trien_khai'
  | 'dang_khao_sat'
  | 'dang_thi_cong'
  | 'tam_dung'
  | 'cham_tien_do'
  | 'dang_nghiem_thu'
  | 'dang_hoan_thien_ho_so'
  | 'dang_thanh_quyet_toan'
  | 'da_hoan_thanh'
  | 'da_ban_giao'
  | 'da_quyet_toan'
  | 'huy'
  | 'chuan_bi'
  | 'cho_nghiem_thu'
  | 'hoan_thanh';

export type ProjectStatus = FullProjectStatus;
export type SignalDensity = 'thap' | 'trung_binh' | 'cao' | 'rat_cao';

export interface UXOFoundItem {
  id: string;
  name: string; // e.g. "Bom MK-82 500 lbs", "Mìn cá nhân M14", "Đạn pháo 105mm"
  type: string;
  quantity: number;
  depth: string; // e.g. "0.8m"
  status: 'da_huy' | 'da_thu_gom' | 'cho_xuly';
}

export interface DailyLog extends BaseDataAudit {
  id: string;
  projectId: string;
  date: string;
  areaClearedHa: number;
  uxoItemsFound: UXOFoundItem[];
  weatherCondition: string;
  safetyStatus: 'an_toan' | 'co_su_co';
  recordedBy: string;
  approvedBy?: string;
  approvalStatus?: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  notes?: string;
}

// 7.3 Tiến độ mốc công việc & Biểu đồ Gantt
export interface ProjectMilestone {
  id: string;
  name: string; // e.g. "Khảo sát hiện trường", "Lập phương án kỹ thuật"...
  planStartDate: string;
  planEndDate: string;
  actualStartDate?: string;
  actualEndDate?: string;
  inCharge: string;
  progressPercent: number; // 0 - 100
  plannedQuantity?: string;
  actualQuantity?: string;
  delayReason?: string;
  correctiveAction?: string;
  evidenceFiles?: string[];
}

// 7.4 Giá trị tài chính & Đợt thanh toán
export type FinancialInstallmentType = 'tam_ung' | 'nghiem_thu' | 'thanh_toan' | 'thu_hoi_tam_ung' | 'quyet_toan';

export interface ProjectFinancialInstallment {
  id: string;
  installmentName: string; // e.g. "Tạm ứng đợt 1", "Nghiệm thu đợt 1"
  type: FinancialInstallmentType;
  amount: number;
  date: string;
  documentRef?: string; // Số hợp đồng / Biên bản nghiệm thu
  status: 'da_thuc_hien' | 'cho_duyet' | 'da_huy';
  notes?: string;
}

// 7.5 Hồ sơ dự án (Checklist)
export type DossierStatus =
  | 'chua_co'
  | 'da_co'
  | 'dang_bo_sung'
  | 'khong_ap_dung'
  | 'dang_chuan_bi'
  | 'cho_ky'
  | 'da_ky'
  | 'can_bo_sung'
  | 'da_hoan_thien'
  | 'het_hieu_luc';

export interface ProjectDossierItem {
  id: string;
  category: string; // 13 main categories
  status: DossierStatus;
  documentCode?: string;
  issueDate?: string;
  note?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface ProjectFileAttachment {
  name: string;
  url: string;
  uploadDate: string;
}

export interface KmlCoordinate {
  lat: number;
  lng: number;
  alt?: number;
}

export interface KmlBoundaryFeature {
  name: string;
  type: 'Polygon' | 'LineString' | 'Point';
  coordinates: KmlCoordinate[];
  description?: string;
  styleColor?: string;
}

export interface ProjectKmlFile {
  id: string;
  fileName: string;
  fileType: 'kml' | 'kmz';
  fileSize: number;
  uploadedAt: string;
  uploadedBy?: string;
  fileDataUrl?: string;
  kmlContentXml?: string;
  boundaryFeatures: KmlBoundaryFeature[];
  centerCoordinate?: KmlCoordinate;
  totalAreaHa?: number;
}

export interface Project extends BaseDataAudit {
  id: string;
  code: string; // Mã dự án
  name: string; // Tên dự án
  workType?: string; // Công tác (Khảo sát, Giám sát, Thi công, Khảo sát và giám sát)
  projectType?: string; // Loại dự án (legacy)
  investor: string; // Chủ đầu tư
  investorRepresentative?: string; // Đại diện chủ đầu tư
  consultantUnit?: string; // Đơn vị tư vấn
  contractorUnit?: string; // Đơn vị thi công
  supervisorUnit?: string; // Đơn vị giám sát
  coordinatingUnit?: string; // Đơn vị phối hợp

  // 1.1 Linkage to Incoming Document
  sourceIncomingDocumentId?: string;
  sourceIncomingDocumentNumber?: string;
  sourceIncomingDocumentSymbol?: string;

  location?: string; // Địa điểm thực hiện / Mô tả
  province: string; // Tỉnh, thành phố
  provinceCode?: string; // Mã tỉnh (ví dụ "QT", "HN")
  centralMeridian?: number; // Kinh tuyến trục KTT (ví dụ 106.25)
  projectionZone?: '3deg' | '6deg'; // Múi chiếu 3° hoặc 6°
  coordinateSystem?: string; // Hệ tọa độ (ví dụ "VN-2000")
  district?: string; // Quận, huyện (legacy)
  commune: string; // Xã, phường
  coordinatesBoundary?: string; // Mô tả tọa độ hoặc phạm vi ranh giới
  coordinateFiles?: DocumentAttachment[]; // Tệp đính kèm chứa tọa độ (.txt, .doc, .docx, .xls, .xlsx)

  // 2.2 Areas
  landAreaHa?: number; // Diện tích trên cạn (ha)
  underwaterAreaHa?: number; // Diện tích dưới nước (ha)
  totalAreaHa?: number; // Tổng diện tích (ha)
  areaHa: number; // Diện tích dự án tổng (ha)
  depthM?: number; // Độ sâu rà phá (m) - legacy
  signalDensity?: SignalDensity; // Mật độ tín hiệu - legacy

  capitalSource?: string; // Nguồn vốn
  totalInvestment?: number; // Tổng mức đầu tư - legacy
  contractValue?: number; // Giá trị hợp đồng (đồng)
  rpbmValue?: number; // Giá trị phần việc rà phá bom mìn
  budgetVnd: number; // Ngân sách dự án (tương thích)

  contractNumber?: string; // Số hợp đồng
  contractSigningDate?: string; // Ngày ký hợp đồng
  startDate: string; // Ngày khởi công
  endDate: string; // Thời gian kết thúc / hạn hợp đồng
  contractDurationDays?: number; // Thời gian thực hiện theo hợp đồng (ngày)
  expectedCompletionDate?: string; // Ngày dự kiến hoàn thành
  actualCompletionDate?: string; // Ngày hoàn thành thực tế

  // Standard Responsible User (Tài khoản người dùng phụ trách dự án)
  responsibleUserId?: string; // ID tài khoản người dùng hệ thống (User.id)
  responsiblePersonId?: string; // ID hồ sơ nhân sự (nếu có liên kết)
  responsibleName?: string; // Snapshot Họ tên người phụ trách
  responsibleRank?: string; // Snapshot Cấp bậc
  responsiblePosition?: string; // Snapshot Chức vụ
  responsibleEmail?: string; // Snapshot Email
  projectYear?: number | null; // Năm dự án (xác định chuẩn)

  projectManager?: string; // Tên hiển thị người phụ trách dự án (legacy mirror)
  projectManagerId?: string; // ID nhân sự/tài khoản người phụ trách (legacy mirror)
  projectManagerRank?: string; // Cấp bậc người phụ trách
  projectManagerPosition?: string; // Chức vụ người phụ trách
  projectManagerUnit?: string; // Đơn vị/Bộ phận người phụ trách
  projectManagerEmail?: string; // Email người phụ trách
  commanderName: string; // Chỉ huy trưởng công trường
  technicalStaff?: string; // Cán bộ kỹ thuật - legacy
  safetyStaff?: string; // Cán bộ an toàn - legacy
  teamSize: number; // Số lượng cán bộ/chiến sĩ

  status: ProjectStatus; // Trạng thái dự án
  progressPercent: number; // Tỷ lệ hoàn thành (%)
  completionRate?: number;

  driveFolderUrl: string; // Link thư mục Google Drive
  files?: ProjectFileAttachment[]; // File hồ sơ dự án
  scanFiles?: DocumentAttachment[]; // Hồ sơ scan của dự án (PDF preferred)
  notes?: string; // Ghi chú

  // 7.3 Tiến độ mốc & Biểu đồ Gantt
  milestones?: ProjectMilestone[];

  // 7.4 Giá trị tài chính & Đợt thanh toán
  advancePaid?: number; // Giá trị tạm ứng
  executedValue?: number; // Giá trị khối lượng thực hiện
  acceptedValue?: number; // Giá trị nghiệm thu
  requestedPaymentValue?: number; // Giá trị đề nghị thanh toán
  paidValue?: number; // Giá trị đã thanh toán
  remainingValue?: number; // Giá trị còn lại
  incurredValue?: number; // Giá trị phát sinh
  adjustedValue?: number; // Giá trị điều chỉnh
  disbursementRate?: number; // Tỷ lệ giải ngân (%)
  debt?: number; // Công nợ
  warrantyPeriod?: string; // Thời hạn bảo hành
  financialInstallments?: ProjectFinancialInstallment[]; // Các đợt tạm ứng, nghiệm thu, thanh toán

  // 7.5 Hồ sơ checklist
  dossiers?: ProjectDossierItem[];

  // 7.1 KML/KMZ Ranh vị trí địa điểm
  kmlFiles?: ProjectKmlFile[];

  // Nhật ký & UXO
  dailyLogs: DailyLog[];
  uxoFoundCount: number;
  approvalStatus?: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  acceptanceApprovedBy?: string;
}

export interface ProjectFilters {
  search: string;
  year: number | 'all' | 'unspecified';
  responsibleUserId: string; // 'all' | 'unassigned' | 'unlinked' | userId
  status: string; // 'all' or specific ProjectStatus
  projectType?: string;
  provinceCode?: string;
}

export type CertCategoryType =
  | 'chuyen_mon'
  | 'chi_huy_truong'
  | 'can_bo_ky_thuat'
  | 'giam_sat'
  | 'an_toan_lao_dong'
  | 'nghiep_vu_rpbm'
  | 'huan_luyen'
  | 'van_hanh_thiet_bi'
  | 'giay_phep_lai_xe'
  | 'so_cap_cuu'
  | 'khac';

export type PersonnelWorkStatus = 'dang_cong_tac' | 'tam_nghi' | 'chuyen_cong_tac' | 'nghi_huu';

export interface PersonnelCertificateRelatedDocument {
  id: string;
  docType: string; // Loại tài liệu (Bằng đại học, Bằng tốt nghiệp, Chứng nhận đào tạo...)
  docTitle: string; // Tên tài liệu
  fileUrl: string; // File đính kèm
  fileName?: string;
  fileSize?: number;
  notes?: string;
  uploadDate: string; // Ngày tải lên
}

export interface PersonnelCertificate {
  id: string;
  certType?: CertCategoryType | string;
  certTypeLabel?: string;
  name: string; // Tên chứng chỉ / Tiêu đề
  certificateNo: string; // Số chứng chỉ
  issuedBy: string; // Cơ quan cấp
  issueDate: string; // Ngày cấp
  effectiveDate?: string; // Ngày có hiệu lực
  isLifetime?: boolean; // Không thời hạn
  expiryDate?: string | null; // Ngày hết hạn (null nếu isLifetime)
  scopeOfPractice?: string; // Phạm vi hành nghề
  scanFileUrl?: string; // File scan
  status: 'con_han' | 'sap_het_han' | 'qua_han';
  notes?: string;
  driveUrl?: string;
  relatedDocuments?: PersonnelCertificateRelatedDocument[]; // Tài liệu liên quan
}

export interface PersonnelAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  uploadedAt?: string;
  notes?: string;
}

export interface Personnel extends BaseDataAudit {
  id: string;
  code: string; // Mã nhân sự
  fullName: string; // Họ và tên
  dob?: string; // Ngày sinh
  hometown?: string; // Quê quán
  position?: string; // Chức vụ
  jobTitle?: string; // Chức danh nghề nghiệp
  rankTitle: string; // Cấp bậc / Chức danh hiển thị
  specialization?: string; // Chuyên môn
  yearsWorkingForEmployer?: number; // Số năm làm việc cho NSDLĐ hiện tại
  contactPerson?: string; // Người liên lạc (Mặc định: Tiểu đoàn trưởng)
  identityCardNo?: string; // Số CCCD/CMTQN
  employerName?: string; // Tên người sử dụng lao động (Mặc định: Tiểu đoàn 93/Binh chủng Công binh)
  employerAddress?: string; // Địa chỉ của người sử dụng lao động (Mặc định: Xã Hòa Lạc, thành phố Hà Nội)
  unit: string; // Đơn vị
  phone: string; // Số điện thoại
  email: string; // Email
  fax?: string; // Số Fax
  workStatus?: PersonnelWorkStatus; // Tình trạng công tác
  currentProjectId?: string; // Dự án đang tham gia ID
  currentProjectName?: string; // Dự án đang tham gia Tên
  roleInTeam: string; // Nhiệm vụ phân công
  avatar: string; // Ảnh nhân sự
  attachedFiles?: PersonnelAttachment[]; // Hồ sơ đính kèm
  certificates: PersonnelCertificate[]; // Danh sách chứng chỉ & giấy phép
}

export type EquipmentCategory = 'may_do_nong' | 'may_do_sau' | 'may_do_tu' | 'phuong_tien' | 'bao_ho' | 'truyen_thong';
export type EquipmentStatus = 'hoat_dong_tot' | 'can_bao_duong' | 'dang_hong' | 'cho_thanh_ly';

export interface MaintenanceRecord extends BaseDataAudit {
  id: string;
  date: string;
  action: string;
  performedBy: string;
  costVnd: number;
  approvedBy?: string;
  status?: 'cho_duyet' | 'da_duyet' | 'tu_choi';
  notes?: string;
}

export interface EquipmentItem extends BaseDataAudit {
  id: string;
  code: string;
  name: string;
  category: EquipmentCategory;
  brandModel: string;
  serialOrPlate: string; // Số máy hoặc Biển số
  status: EquipmentStatus;
  location: string;
  lastCalibrationDate: string;
  nextCalibrationDate: string; // Hạn đăng kiểm / hiệu chuẩn
  assignedTo?: string;
  loanRequestedBy?: string;
  loanStatus?: 'da_cap' | 'cho_duyet' | 'tu_choi';
  maintenanceLogs: MaintenanceRecord[];
}

export type AlertSeverity = 'critical' | 'warning' | 'info';
export type AlertCategory = 'chung_chi' | 'dang_kiem' | 'van_ban' | 'du_an';

export interface AlertItem {
  id: string;
  title: string;
  category: AlertCategory;
  severity: AlertSeverity;
  targetName: string;
  dueDate: string;
  daysRemaining: number;
  linkModule: 'personnel' | 'equipment' | 'documents' | 'projects';
  linkId: string;
}

export interface SystemAlertConfig {
  certWarningDays: number;
  calibrationWarningDays: number;
  docDeadlineWarningDays: number;
  projectDelayWarningDays: number;
}

export interface SharedCategoryItem {
  id: string;
  group: 'doc_type' | 'project_status' | 'equipment_cat' | 'unit';
  code: string;
  label: string;
  description?: string;
}

export type AuditActionType =
  | 'dang_nhap'
  | 'tao'
  | 'chinh_sua'
  | 'xoa'
  | 'khoi_phuc'
  | 'tai_len'
  | 'tai_xuong'
  | 'phe_duyet'
  | 'tu_choi'
  | 'thay_doi_trang_thai'
  | 'thay_doi_quyen';

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  userDevice?: string;
  module: string;
  actionType?: AuditActionType | string;
  action: string;
  details: string;
  dataBefore?: string;
  dataAfter?: string;
  targetObject?: string;
  targetObjectId?: string;
  reason?: string;
  result?: 'success' | 'failure';
}

export type LegalFieldCategory =
  | 'quan_ly_du_an'
  | 'dau_tu_xay_dung'
  | 'dau_thau'
  | 'hop_dong'
  | 'quan_ly_chat_luong'
  | 'an_toan_lao_dong'
  | 'ra_pha_bom_min'
  | 'quan_ly_thiet_bi'
  | 'quan_ly_tai_san'
  | 'luu_tru_ho_so'
  | 'thanh_toan_quyet_toan'
  | 'tieu_chuan_quy_chuan';

export type LegalValidityStatus =
  | 'con_hieu_luc'
  | 'het_hieu_luc'
  | 'bi_thay_the'
  | 'chua_co_hieu_luc'
  | 'sua_doi_bo_sung';

export interface LegalDocument extends BaseDataAudit {
  id: string;
  code: string; // Mã văn bản hệ thống (VBPL-001)
  docNumberSymbol?: string; // Số, ký hiệu (18/2019/NĐ-CP)
  title: string; // Tên văn bản
  issuingAgency?: string; // Cơ quan ban hành
  docType?: string; // Loại văn bản (Luật, Nghị định, Thông tư, QCVN, TCVN...)
  type?: 'QCVN' | 'Nghị định' | 'Thông tư' | 'TCVN' | 'Quyết định' | string;
  issuedDate?: string; // Ngày ban hành
  effectiveDate?: string; // Ngày có hiệu lực
  expiryDate?: string; // Ngày hết hiệu lực
  fields?: string[]; // Danh sách 12 lĩnh vực
  category?: string; // Lĩnh vực chính (tương thích)
  keywords?: string[]; // Từ khóa
  replacingDoc?: string; // Văn bản thay thế (Số/ký hiệu)
  replacedDoc?: string; // Văn bản bị thay thế (Số/ký hiệu)
  amendingDoc?: string; // Văn bản sửa đổi, bổ sung (Số/ký hiệu)
  validityStatus?: LegalValidityStatus; // Tình trạng hiệu lực
  status?: 'con_hieu_luc' | 'het_hieu_luc' | 'bi_thay_the' | 'chua_co_hieu_luc' | 'sua_doi_bo_sung' | string;
  pdfFileUrl?: string; // File PDF hoặc scan
  pdfFileName?: string; // Tên file PDF
  sourceUrl?: string; // Link nguồn
  driveUrl?: string; // Link Google Drive
  notes?: string; // Ghi chú
  summary: string; // Tóm tắt nội dung
  keyPoints?: string[]; // Các điểm quan trọng
  fullContent?: string; // Nội dung toàn văn / trích xuất OCR dùng cho RAG search
}

// Section 6: Phân hệ Quản lý công việc
export type TaskStatus =
  | 'chua_thuc_hien'
  | 'dang_thuc_hien'
  | 'cho_phoi_hop'
  | 'cho_phe_duyet'
  | 'hoan_thanh'
  | 'qua_han'
  | 'tam_dung'
  | 'huy';

export type TaskPriority = 'thuong' | 'khan' | 'thuong_khan' | 'hoa_toc';

export interface TaskItem extends BaseDataAudit {
  id: string;
  code: string; // Mã công việc (e.g. CV-2026-001)
  title: string; // Tên công việc
  description: string; // Nội dung công việc
  assigner: string; // Người giao
  leadAssignee: string; // Người chủ trì
  collaborators: string[]; // Người phối hợp
  startDate: string; // Ngày bắt đầu
  deadline: string; // Hạn hoàn thành
  priority: TaskPriority; // Mức độ ưu tiên
  progressPercent: number; // Tỷ lệ hoàn thành (0 - 100)
  status: TaskStatus; // Trạng thái công việc
  
  // Liên kết
  relatedTaskId?: string; // Công việc liên quan ID
  relatedTaskCode?: string; // Mã công việc liên quan
  relatedTaskTitle?: string; // Tên CV liên quan
  projectId?: string; // Dự án liên quan ID
  projectName?: string; // Tên dự án liên quan
  docId?: string; // Văn bản liên quan ID
  docCode?: string; // Mã/Số văn bản liên quan
  docTitle?: string; // Tiêu đề văn bản liên quan

  // Đính kèm
  attachments?: { name: string; url: string }[];
  driveUrl?: string; // Google drive folder/file link

  // Kết quả & Phê duyệt
  executionResult?: string; // Kết quả thực hiện
  approvalOpinion?: string; // Ý kiến phê duyệt
  approvedBy?: string; // Người phê duyệt
  approvalDate?: string; // Ngày phê duyệt
}

// ==========================================
// Section 8: Phân hệ nghiệp vụ rà phá bom mìn, vật nổ
// ==========================================

// 8.1. Quản lý khu vực thi công
export type AreaPollutionLevel = 'thap' | 'trung_binh' | 'cao' | 'rat_cao';
export type AreaExecutionStatus = 'chua_thi_cong' | 'dang_thi_cong' | 'cho_kiem_tra' | 'cho_nghiem_thu' | 'da_hoan_thanh' | 'khong_dat';

export interface ExecutionArea extends BaseDataAudit {
  id: string;
  code: string; // Mã khu vực (KV-DA01-01)
  name: string; // Tên khu vực
  projectId: string; // Thuộc dự án
  projectName: string;
  location: string; // Vị trí
  coordinates: string; // Tọa độ
  areaHa: number; // Diện tích (ha)
  terrain: string; // Địa hình
  pollutionLevel: AreaPollutionLevel; // Mức độ ô nhiễm dự kiến
  surveyMethod: string; // Phương pháp khảo sát
  handoverDate: string; // Ngày bàn giao
  executionDate: string; // Ngày thi công
  status: AreaExecutionStatus; // Trạng thái
  manager: string; // Người phụ trách
  mapFileUrl?: string; // File bản đồ
  fieldPhotos?: string[]; // Ảnh hiện trường
  digitalMapLink?: string; // Link bản đồ số
  notes?: string;
}

// 8.2. Quản lý lưới dò và phân khu
export type GridCompletionStatus = 'chua_thuc_hien' | 'dang_thuc_hien' | 'da_hoan_thanh' | 'cho_kiem_tra' | 'khong_dat' | 'da_nghiem_thu';

export interface GridBlock extends BaseDataAudit {
  id: string;
  areaId: string; // Thuộc khu vực thi công
  areaName: string;
  projectId: string;
  projectName: string;
  lotCode: string; // Mã lô (Lô A)
  gridCode: string; // Mã ô (Ô A-01)
  areaM2: number; // Diện tích (m2 hoặc ha)
  cornerCoordinates: string; // Tọa độ các điểm góc
  approvedDepthM: number; // Độ sâu dò tìm theo phương án phê duyệt (m)
  executionDate: string; // Ngày thực hiện
  executionTeam: string; // Tổ thi công
  equipmentUsed: string; // Thiết bị sử dụng
  status: GridCompletionStatus; // Tình trạng hoàn thành
  inspector: string; // Người kiểm tra
  acceptanceResult: string; // Kết quả nghiệm thu
  asBuiltMapUrl?: string; // File bản đồ hoàn công
  notes?: string;
}

// 8.3. Nhật ký thi công hằng ngày
export interface UXODailyExecutionLog extends BaseDataAudit {
  id: string;
  projectId: string;
  projectName: string;
  areaId?: string;
  areaName?: string;
  logDate: string; // Ngày thi công
  weatherCondition: string; // Thời tiết
  personnelCount: number; // Số lượng nhân sự
  personnelList?: string; // Danh sách nhân sự
  equipmentUsed: string; // Thiết bị sử dụng
  startTime: string; // Thời gian bắt đầu
  endTime: string; // Thời gian kết thúc
  executedAreaHa: number; // Diện tích thực hiện (ha)
  executedVolume: string; // Khối lượng thực hiện
  signalsDetectedCount: number; // Số lượng tín hiệu phát hiện
  checkedLocationsCount: number; // Số vị trí đã kiểm tra
  incidents: string; // Sự cố phát sinh
  processingContent: string; // Nội dung xử lý
  technicalOpinion: string; // Ý kiến cán bộ kỹ thuật
  supervisorOpinion: string; // Ý kiến giám sát
  fieldPhotos?: string[]; // Ảnh hiện trường
  signedLogFileUrl?: string; // File nhật ký ký xác nhận
}

// 8.4. Sổ theo dõi tín hiệu
export type SignalInspectionStatus = 'chua_kiem_tra' | 'dang_kiem_tra' | 'da_kiem_tra';

export interface UXOSignalRecord extends BaseDataAudit {
  id: string;
  signalCode: string; // Mã tín hiệu (TH-2026-001)
  projectId: string; // Thuộc dự án
  projectName: string;
  lotOrGridCode: string; // Thuộc lô hoặc ô
  coordinates: string; // Tọa độ
  detectionDate: string; // Ngày phát hiện
  detectionEquipment: string; // Thiết bị phát hiện
  detectorPerson: string; // Người phát hiện
  estimatedDepthM: number; // Độ sâu dự kiến
  initialClassification: string; // Phân loại ban đầu
  inspectionStatus: SignalInspectionStatus; // Trạng thái kiểm tra
  inspectionResult: string; // Kết quả kiểm tra
  fieldPhotos?: string[]; // Ảnh hiện trường
  relatedMinutes?: string; // Biên bản liên quan
  approver: string; // Người xác nhận
  notes?: string;
}

// 8.5. Quản lý vật thể và vật nổ phát hiện
export type DiscoveryDossierStatus = 'moi_phat_hien' | 'cho_phe_duyet' | 'da_ban_giao' | 'da_xu_ly' | 'da_luu_ho_so';

export interface UXODiscoveryDossier extends BaseDataAudit {
  id: string;
  dossierCode: string; // Mã hồ sơ phát hiện
  projectId: string;
  projectName: string;
  location: string; // Vị trí
  detectionDate: string; // Ngày phát hiện
  objectType: string; // Loại vật thể theo kết luận của người có thẩm quyền
  quantity: number; // Số lượng
  condition: string; // Tình trạng
  receivingOrDisposalUnit: string; // Đơn vị tiếp nhận hoặc xử lý
  handoverTime: string; // Thời gian bàn giao
  handoverMinutesUrl?: string; // Biên bản bàn giao
  disposalMinutesUrl?: string; // Biên bản xử lý
  fieldPhotos?: string[]; // Ảnh hiện trường
  preparer: string; // Người lập
  inspector: string; // Người kiểm tra
  approver: string; // Người phê duyệt
  status: DiscoveryDossierStatus; // Trạng thái hồ sơ
}

// 8.6. Quản lý chất lượng
export type QualityInspectionType = 'noi_bo' | 'xac_suat' | 'dinh_ky' | 'dot_xuat';
export type QualityInspectionResult = 'dat' | 'khong_dat' | 'can_khac_phuc';

export interface UXOQualityRecord extends BaseDataAudit {
  id: string;
  projectId: string;
  projectName: string;
  inspectionPlan: string; // Kế hoạch kiểm tra
  inspectionType: QualityInspectionType; // Kiểm tra nội bộ / xác suất
  inspectionDate: string;
  inspectionResult: QualityInspectionResult; // Kết quả kiểm tra
  nonConformities: string; // Điểm không phù hợp
  correctiveActions: string; // Biện pháp khắc phục
  responsiblePerson: string; // Người thực hiện khắc phục
  correctionDeadline: string; // Hạn khắc phục
  reInspectionResult?: string; // Kết quả kiểm tra lại
  acceptanceMinutesUrl?: string; // Biên bản nghiệm thu
  asBuiltDossierUrl?: string; // Hồ sơ hoàn công
  inspector: string;
  status: 'cho_khac_phuc' | 'da_khac_phuc' | 'da_nghiem_thu';
}

// 8.7. Quản lý an toàn
export interface UXOSafetyCheckItem {
  date: string;
  ppeChecked: boolean; // Theo dõi trang bị bảo hộ cá nhân
  warningSignageChecked: boolean;
  medicalEquipmentChecked: boolean;
  communicationChecked: boolean;
  inspectorName: string;
  passed: boolean;
  notes?: string;
}

export interface UXOSafetyIncident {
  id: string;
  incidentDate: string;
  description: string; // Tình huống / sự cố
  severity: 'nhe' | 'trung_binh' | 'nghiem_trong';
  correctiveAction: string; // Biện pháp khắc phục
  reportFileUrl?: string; // Báo cáo sự cố
}

export interface UXOEmergencyDrill {
  title: string;
  drillDate: string;
  responsePlan: string;
  participantsCount: number;
}

export interface EmergencyContact {
  title: string;
  phone: string;
  unitName: string;
}

export interface MedicalFacility {
  name: string;
  address: string;
  distanceKm: number;
  phone: string;
}

export interface UXOSafetyRecord extends BaseDataAudit {
  id: string;
  projectId: string;
  projectName: string;
  safetyPlanTitle: string; // Kế hoạch an toàn
  briefedPersonnelList: string; // Danh sách nhân sự được phổ biến an toàn
  trainingMinutesUrl?: string; // Biên bản huấn luyện an toàn
  dailyChecklist: UXOSafetyCheckItem[]; // Phiếu kiểm tra an toàn hằng ngày
  ppeTrackingNotes: string; // Theo dõi trang bị bảo hộ cá nhân
  dangerAndRestrictedZones: string; // Khu vực nguy hiểm và khu vực hạn chế
  incidents: UXOSafetyIncident[]; // Sự cố hoặc tình huống mất an toàn
  emergencyDrills: UXOEmergencyDrill[]; // Theo dõi diễn tập và phương án ứng phó
  emergencyContacts: EmergencyContact[]; // Danh bạ liên hệ khẩn cấp
  nearbyMedicalFacilities: MedicalFacility[]; // Cơ sở y tế gần khu vực dự án
}

// Module 9: Quản lý Xe ô tô & Đăng kiểm
export type VehicleStatus = 'hoat_dong' | 'bao_duong' | 'sua_chua' | 'tam_dung' | 'thanh_ly';

export interface VehicleInspectionRecord {
  id: string;
  vehicleId: string;
  roundNumber: number; // Số đợt
  inspectionDate: string; // Ngày đăng kiểm
  expiryDate: string; // Ngày hết hạn
  certificateNo: string; // Số giấy chứng nhận
  providerUnit: string; // Đơn vị thực hiện
  result: 'dat' | 'can_khac_phuc' | 'khong_dat'; // Kết quả
  costVnd?: number; // Chi phí
  scanFileUrl?: string; // File scan
  notes?: string; // Ghi chú
  createdAt?: string;
}

export interface VehicleScanFile {
  fileName?: string;
  fileUrl?: string; // hoặc driveFileId
  driveFileId?: string;
  fileSize?: string | number;
  uploadedAt?: string;
}

export interface Vehicle {
  id: string;
  code: string; // Mã xe
  licensePlate: string; // Biển số đăng ký
  vehicleType: string; // Loại xe
  brand: string; // Nhãn hiệu
  model: string; // Model
  manufactureYear: number; // Năm sản xuất
  chassisNumber: string; // Số khung
  engineNumber: string; // Số máy
  color: string; // Màu sơn
  managingUnit: string; // Đơn vị quản lý
  /** @deprecated Bị bãi bỏ theo chỉ đạo Mục 6 (Bỏ khỏi form & hiển thị nhưng giữ trong DB) */
  managerName?: string; // Người quản lý (Deprecated)
  /** @deprecated Bị bãi bỏ theo chỉ đạo Mục 6 (Bỏ khỏi form & hiển thị nhưng giữ trong DB) */
  frequentDriverName?: string; // Người thường xuyên sử dụng (Deprecated)
  registrationNo: string; // Số đăng ký xe
  registrationDate: string; // Ngày cấp đăng ký
  registrationFileUrl?: string; // File scan đăng ký xe (legacy URL)
  registrationFile?: VehicleScanFile; // File scan đính kèm đăng ký xe (metadata)
  currentInspectionCertNo?: string; // Số giấy chứng nhận đăng kiểm
  lastInspectionDate?: string; // Ngày đăng kiểm gần nhất
  nextInspectionExpiryDate?: string; // Ngày hết hạn đăng kiểm
  inspectionUnit?: string; // Đơn vị đăng kiểm
  inspectionFileUrl?: string; // File scan đăng kiểm (legacy URL)
  inspectionFile?: VehicleScanFile; // File scan đính kèm đăng kiểm (metadata)
  insuranceExpiryDate?: string; // Thời hạn bảo hiểm (Legacy)
  insuranceFileUrl?: string; // File scan bảo hiểm (Legacy)
  currentOdometerKm?: number; // Số kilomet hiện tại (Legacy)
  maintenanceIntervalKm?: number; // Chu kỳ bảo dưỡng (km) (Legacy)
  lastMaintenanceDate?: string; // Ngày bảo dưỡng gần nhất (Legacy)
  nextMaintenanceDate?: string; // Ngày bảo dưỡng tiếp theo (Legacy)
  status?: VehicleStatus; // Tình trạng hoạt động (Legacy)
  notes?: string; // Ghi chú (Legacy)
  inspectionHistory: VehicleInspectionRecord[]; // Lịch sử các đợt đăng kiểm
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleAlertSettings {
  thresholdDays: number[]; // Ví dụ: [90, 60, 30, 15, 7]
  enableEmailAlerts?: boolean;
  enableInAppAlerts?: boolean;
}

// Module 10: Phân hệ Quản lý Trang thiết bị & Máy dò
export type UXOEquipmentCategory =
  | 'may_do_bom_min'
  | 'gps'
  | 'dung_cu_khac'
  | 'may_do_bom'
  | 'may_do_min'
  | 'may_toan_dac'
  | 'bo_dam'
  | 'thiet_bi_do_dac'
  | 'thiet_bi_bao_ho';

export type UXOEquipmentStatus =
  | 'san_sang'
  | 'dang_su_dung'
  | 'dang_bao_tri'
  | 'dang_hieu_chuan'
  | 'hong_hoc'
  | 'thanh_ly';

export interface UXOEquipmentScanFile {
  fileName: string;
  fileUrl: string;
  fileSize?: string;
  uploadedAt?: string;
}

// 10.1 Đợt Kiểm định / Hiệu chuẩn
export interface UXOCalibrationRecord {
  id: string;
  equipmentId: string;
  roundCode: string; // Mã đợt
  inspectionDate?: string; // Ngày kiểm định
  calibrationDate?: string; // Ngày hiệu chuẩn
  expiryDate: string; // Ngày hết hạn
  providerUnit: string; // Đơn vị thực hiện
  certificateNo: string; // Số chứng nhận
  result: 'dat' | 'can_hieu_chinh' | 'khong_dat'; // Kết quả
  certificateFileUrl?: string; // File chứng nhận
  costVnd?: number; // Chi phí
  notes?: string; // Ghi chú
  createdAt?: string;
}

// 10.2 Nhật ký Bảo trì & Sửa chữa
export interface UXOMaintenanceRecord {
  id: string;
  equipmentId: string;
  maintenanceDate: string; // Ngày bảo trì
  content: string; // Nội dung bảo trì
  providerUnit: string; // Đơn vị thực hiện
  replacedParts?: string; // Linh kiện thay thế
  costVnd?: number; // Chi phí
  result: 'hoan_thanh' | 'cho_linh_kien' | 'khong_dat'; // Kết quả
  downtimeHours?: number; // Thời gian dừng hoạt động (giờ)
  nextMaintenanceDate?: string; // Lần bảo trì tiếp theo
  protocolFileUrl?: string; // File biên bản
  notes?: string;
  createdAt?: string;
}

// 10.3 Cấp phát và Thu hồi thiết bị
export interface UXODispatchRecord {
  id: string;
  equipmentId: string;
  receiverName: string; // Người nhận
  projectName: string; // Dự án sử dụng
  issueDate: string; // Ngày giao
  issueCondition: string; // Tình trạng khi giao
  expectedReturnDate: string; // Ngày dự kiến trả
  actualReturnDate?: string; // Ngày trả thực tế
  returnCondition?: string; // Tình trạng khi trả
  handoverDocUrl?: string; // Biên bản bàn giao
  approverName: string; // Người phê duyệt
  status: 'dang_muon' | 'da_tra' | 'qua_han';
  notes?: string;
  createdAt?: string;
}

// Trang thiết bị (Mục 7)
export interface UXOEquipment {
  id: string;
  assetCode: string; // Mã tài sản
  qrCode: string; // Mã QR / mã vạch
  name: string; // Tên thiết bị
  category: UXOEquipmentCategory; // Nhóm thiết bị (may_do_bom | may_do_min | gps | dung_cu_khac)
  specificCategoryDescription?: string; // Mô tả loại cụ thể khi chọn "Dụng cụ chuyên dụng khác" (Mục 7)
  brand: string; // Tên nhà sản xuất
  model: string; // Đời máy/model
  power?: string; // Công suất
  manufactureYear: number; // Năm sản xuất
  features?: string; // Tính năng
  origin?: string; // Xuất xứ
  registrationNo?: string; // Số đăng ký/đăng kiểm, nếu có

  // B. Hiện trạng
  currentLocation: string; // Địa điểm hiện tại của thiết bị (Mặc định: Hà Nội)
  deploymentStatus?: string; // Thông tin về tình hình huy động, sử dụng hiện tại (Mặc định: Sẵn sàng huy động khi thi công)
  equipmentSource?: string; // Nguồn thiết bị (Mặc định: Sở hữu của nhà thầu)

  // D. File Scan PDF
  scanFileUrl?: string;
  scanFileName?: string;
  scanFileSize?: string;
  scanFileUploadedAt?: string;
  scanFile?: UXOEquipmentScanFile;

  // Trường kế thừa/phụ hỗ trợ
  serialNumber?: string; // Số serial
  commissioningDate?: string;
  originSource?: string;
  managingUnit?: string;
  status?: UXOEquipmentStatus;
  currentProject?: string;
  notes?: string;

  // Deprecated/legacy fields kept optional for backward compat
  managerName?: string;
  technicalDossierUrl?: string;
  userManualUrl?: string;
  photoUrl?: string;

  // Lịch sử liên kết
  calibrationHistory?: UXOCalibrationRecord[];
  maintenanceHistory?: UXOMaintenanceRecord[];
  dispatchHistory?: UXODispatchRecord[];

  createdAt?: string;
  updatedAt?: string;
}

// Module 12: Phân hệ Quản lý Kho Hồ sơ & Lưu trữ
export type LocationStatus = 'trong' | 'dang_luu' | 'day' | 'bi_khoa' | 'can_kiem_tra';

export interface WarehouseLocation {
  id: string;
  locationCode: string; // KHO01-A-03-G02-T04-H12
  warehouseId: string; // KHO01
  warehouseName: string; // Kho Hồ sơ RPBM Trung tâm
  zone: string; // Khu A
  row: string; // Dãy 03
  shelf: string; // Giá G02
  tier: string; // Tầng T04
  boxCode: string; // Hộp H12
  status: LocationStatus;
  maxCapacityBoxes?: number;
  currentBoxCount?: number;
  notes?: string;
  updatedAt?: string;
}

export type ArchiveCategory =
  | 'du_an_rpbm'
  | 'nghiep_vu_ky_thuat'
  | 'phap_ly_hop_dong'
  | 'nhan_su_chung_chi'
  | 'tai_chinh_ke_toan'
  | 'tai_lieu_khac';

export type ArchiveRetentionPeriod = 'vinh_vien' | '50_nam' | '30_nam' | '20_nam' | '10_nam' | '5_nam';

export type ArchiveSecrecyLevel = 'thuong' | 'mat' | 'toi_mat' | 'tuyet_mat';

export type ArchivePhysicalCondition = 'tot' | 'binh_thuong' | 'hu_hong_nhe' | 'can_bao_quan_dac_biet';

export interface ArchiveDossier {
  id: string;
  archiveCode: string; // Mã hồ sơ
  stt: number; // Số thứ tự
  title: string; // Tên hồ sơ
  category: ArchiveCategory; // Loại hồ sơ
  relatedProjectId?: string; // Dự án liên quan
  relatedProjectName?: string;
  archiveYear: number; // Năm hồ sơ
  retentionPeriod: ArchiveRetentionPeriod; // Thời hạn bảo quản
  secrecyLevel: ArchiveSecrecyLevel; // Mức độ mật
  documentCount: number; // Số lượng tài liệu
  pageCount: number; // Số tờ
  entryDate: string; // Ngày nhập kho
  entryPerson: string; // Người nhập kho
  locationCode: string; // Mã vị trí
  boxCode: string; // Mã hộp
  physicalCondition: ArchivePhysicalCondition; // Tình trạng vật lý
  catalogFileUrl?: string; // File mục lục
  scanFileUrl?: string; // File scan
  googleDriveUrl?: string; // Link Google Drive
  notes?: string; // Ghi chú
  qrCode: string; // Mã QR
  barcode: string; // Mã vạch
  status: 'luu_kho' | 'dang_muon' | 'da_tieu_huy';
  createdAt?: string;
  updatedAt?: string;
}

export type BorrowStatus = 'dang_muon' | 'da_tra' | 'qua_han';

export interface ArchiveBorrowRecord {
  id: string;
  archiveId: string;
  archiveCode: string;
  archiveTitle: string;
  borrowerName: string;
  borrowerUnit: string;
  purpose: string;
  borrowDate: string;
  expectedReturnDate: string;
  actualReturnDate?: string;
  conditionOnBorrow: string;
  conditionOnReturn?: string;
  approverName: string;
  slipFileUrl?: string;
  status: BorrowStatus;
  notes?: string;
  createdAt?: string;
}

export type WarehouseSlipType = 'nhap_kho' | 'xuat_kho' | 'phieu_muon';

export interface WarehouseSlip {
  id: string;
  slipNo: string;
  slipType: WarehouseSlipType;
  date: string;
  handlerName: string;
  personName: string;
  unitName: string;
  reason: string;
  archiveCodes: string[];
  archiveTitles: string[];
  notes?: string;
}

// ==========================================
// Section 14: Quản lý biểu mẫu (Form & Template Library)
// ==========================================
export type FormTemplateCategory =
  | 'phieu_giao_viec'
  | 'phieu_trinh_ky'
  | 'phieu_muon_ho_so'
  | 'phieu_ban_giao_thiet_bi'
  | 'phieu_kiem_tra_thiet_bi'
  | 'bien_ban_nghiem_thu'
  | 'bien_ban_ban_giao_mat_bang'
  | 'nhat_ky_thi_cong'
  | 'bao_cao_ngay'
  | 'bao_cao_tuan'
  | 'bao_cao_thang'
  | 'bao_cao_tien_do'
  | 'bao_cao_an_toan'
  | 'bao_cao_su_co'
  | 'danh_sach_nhan_su'
  | 'danh_sach_thiet_bi'
  | 'ho_so_de_nghi_thanh_toan';

export interface FormTemplateItem extends BaseDataAudit {
  id: string;
  code: string;
  name: string;
  category: FormTemplateCategory;
  description: string;
  format: 'docx' | 'xlsx' | 'pdf';
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  uploadedBy?: string;
  uploadedDate?: string;
  version: string;
  placeholders: string[]; // List of fields that can be auto-filled
  contentTemplateHtml?: string;
  isSystemDefault?: boolean;
}

export interface GeneratedFormRecord extends BaseDataAudit {
  id: string;
  templateId: string;
  templateName: string;
  category: FormTemplateCategory;
  projectId?: string;
  projectName?: string;
  createdDate: string;
  createdPerson: string;
  mappedData: Record<string, any>;
  wordFileUrl?: string;
  excelFileUrl?: string;
  pdfFileUrl?: string;
  driveSignedUrl?: string;
  isSignedAndUploadedToDrive?: boolean;
  signedDate?: string;
  status: 'nhap' | 'da_xuat' | 'da_ky_gdrive';
  versionHistory?: {
    version: number;
    updatedAt: string;
    updatedBy: string;
    driveUrl: string;
    notes?: string;
  }[];
}

// ==========================================
// Section 15: Thông báo và cảnh báo (Notification & Alert Center)
// ==========================================
export type NotificationType =
  | 'van_ban_sap_den_han'
  | 'cong_viec_qua_han'
  | 'du_an_cham_tien_do'
  | 'du_an_sap_het_han'
  | 'hop_dong_sap_het_han'
  | 'chung_chi_sap_het_han'
  | 'dang_kiem_sap_het_han'
  | 'bao_hiem_xe_sap_het_han'
  | 'kiem_dinh_thiet_bi_sap_het_han'
  | 'thiet_bi_den_han_bao_tri'
  | 'ho_so_muon_qua_han'
  | 'ho_so_du_an_con_thieu'
  | 'cong_no_den_han'
  | 'ho_so_phap_ly_het_hieuluc'
  | 'van_ban_phap_ly_thay_the_sua_doi';

export type NotificationStatus = 'chua_doc' | 'da_doc' | 'da_xu_ly' | 'tam_hoan' | 'giao_nguoi_khac';

export interface AppNotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: 'critical' | 'warning' | 'info';
  createdAt: string;
  status: NotificationStatus;
  snoozedUntil?: string; // ISO date string if snoozed
  assignedToUser?: string; // User name/email assigned
  assignedNote?: string;
  linkModule?: 'documents' | 'projects' | 'tasks' | 'personnel' | 'equipment' | 'vehicles' | 'uxo_equipment' | 'archive_warehouse' | 'legal' | 'form_templates' | 'gdrive';
  linkId?: string;
  sourceTargetName?: string;
  dueDate?: string;
  daysRemaining?: number;
}

// ==========================================
// Section 19: Tích hợp Google Drive
// ==========================================
export type DriveFileType = 'pdf' | 'image' | 'docx' | 'xlsx' | 'cad' | 'folder' | 'other';

export type DriveAccessPermission = 'owner' | 'editor' | 'viewer' | 'restricted';

export interface DriveFileVersion {
  id: string;
  versionName: string; // e.g. "V01.0", "V02.0"
  fileName: string;
  fileSize: number; // in bytes
  uploadedAt: string;
  uploadedBy: string;
  driveUrl?: string;
  previewUrl?: string;
  comment?: string;
  isCurrent: boolean;
}

export interface DriveFileItem {
  id: string;
  name: string;
  folderId: string; // Parent folder ID
  path: string; // e.g. "/QLRPBM/04_Du_an/DA001_SanLapVungTau/07_Nghiem_thu"
  fileType: DriveFileType;
  mimeType: string;
  size: number;
  createdAt: string;
  updatedAt: string;
  uploadedBy: string;
  projectId?: string;
  projectCode?: string;
  docCategory?: string; // e.g. "07_Nghiem_thu"
  documentNumber?: string;
  version: string; // e.g. "V01"
  versions: DriveFileVersion[];
  permission: DriveAccessPermission;
  sharedWith: string[]; // List of emails/users
  isProtected?: boolean; // Cannot delete without confirmation
  webPreviewUrl?: string;
  downloadUrl?: string;
  thumbnailUrl?: string;
  contentPdfHtml?: string; // HTML simulation content for PDF preview
}

export interface DriveFolderItem {
  id: string;
  name: string;
  parentId: string | null;
  path: string;
  isProjectRootFolder?: boolean;
  projectCode?: string;
  createdAt: string;
  permission: DriveAccessPermission;
  itemCount?: number;
}


export interface EmailNotificationSettings {
  enableEmail: boolean;
  userEmail: string;
  notifyOnCriticalAlerts: boolean;
  notifyOnTaskAssigned: boolean;
  notifyOnExpiryWarnings: boolean;
  dailySummaryDigest: boolean;
}



