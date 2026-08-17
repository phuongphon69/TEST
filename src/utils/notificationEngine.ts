import {
  AppNotificationItem,
  NotificationType,
  EmailNotificationSettings
} from '../types';
import {
  getDocuments,
  getProjects,
  getPersonnel,
  getEquipment,
  getLegalDocs,
  getTasks,
  getStored,
  setStored,
  getCurrentUser
} from './storage';
import { getDaysRemaining } from './formatters';

const NOTIFICATIONS_STORAGE_KEY = 'qlrpbm_app_notifications';
const EMAIL_SETTINGS_STORAGE_KEY = 'qlrpbm_email_settings';

export const DEFAULT_EMAIL_SETTINGS: EmailNotificationSettings = {
  enableEmail: true,
  userEmail: 'huyphuong.d93@gmail.com',
  notifyOnCriticalAlerts: true,
  notifyOnTaskAssigned: true,
  notifyOnExpiryWarnings: true,
  dailySummaryDigest: true
};

export function getStoredNotifications(): AppNotificationItem[] {
  return getStored<AppNotificationItem[]>(NOTIFICATIONS_STORAGE_KEY, []);
}

export function saveStoredNotifications(list: AppNotificationItem[]): void {
  setStored(NOTIFICATIONS_STORAGE_KEY, list);
}

export function getEmailNotificationSettings(): EmailNotificationSettings {
  return getStored<EmailNotificationSettings>(EMAIL_SETTINGS_STORAGE_KEY, DEFAULT_EMAIL_SETTINGS);
}

export function saveEmailNotificationSettings(settings: EmailNotificationSettings): void {
  setStored(EMAIL_SETTINGS_STORAGE_KEY, settings);
}

// Generate all dynamic notifications for 15 categories
export function generateSystemNotifications(): AppNotificationItem[] {
  const storedList = getStoredNotifications();
  const storedMap = new Map<string, AppNotificationItem>();
  storedList.forEach(item => storedMap.set(item.id, item));

  const generated: AppNotificationItem[] = [];
  const nowStr = new Date().toISOString().slice(0, 10);

  // 1. Văn bản sắp đến hạn xử lý
  const docs = getDocuments();
  docs.forEach(d => {
    if ((d.status === 'cho_xuly' || d.status === 'dang_thuc_hien') && d.deadline) {
      const days = getDaysRemaining(d.deadline);
      if (days < 0) {
        generated.push({
          id: `notif-doc-overdue-${d.id}`,
          title: `Văn bản quá hạn xử lý: ${d.code}`,
          message: `Văn bản "${d.title}" đã quá hạn ${Math.abs(days)} ngày (${d.deadline}). Nơi nhận/giao: ${d.assignedProcessor || 'Chưa giao'}`,
          type: 'van_ban_sap_den_han',
          severity: 'critical',
          createdAt: d.deadline,
          status: 'chua_doc',
          linkModule: 'documents',
          linkId: d.id,
          sourceTargetName: d.title,
          dueDate: d.deadline,
          daysRemaining: days
        });
      } else if (days <= 7) {
        generated.push({
          id: `notif-doc-near-${d.id}`,
          title: `Văn bản sắp đến hạn (${days} ngày): ${d.code}`,
          message: `Văn bản "${d.title}" cần hoàn thành trước ngày ${d.deadline}.`,
          type: 'van_ban_sap_den_han',
          severity: days <= 2 ? 'critical' : 'warning',
          createdAt: nowStr,
          status: 'chua_doc',
          linkModule: 'documents',
          linkId: d.id,
          sourceTargetName: d.title,
          dueDate: d.deadline,
          daysRemaining: days
        });
      }
    }
  });

  // 2. Công việc quá hạn
  const tasks = getTasks();
  tasks.forEach(t => {
    if (t.status !== 'hoan_thanh' && t.status !== 'huy') {
      const days = getDaysRemaining(t.deadline);
      if (days < 0) {
        generated.push({
          id: `notif-task-overdue-${t.id}`,
          title: `Công việc QUÁ HẠN: ${t.title}`,
          message: `Nhiệm vụ "${t.title}" do ${t.leadAssignee} chủ trì đã quá hạn ${Math.abs(days)} ngày.`,
          type: 'cong_viec_qua_han',
          severity: 'critical',
          createdAt: t.deadline,
          status: 'chua_doc',
          linkModule: 'tasks',
          linkId: t.id,
          sourceTargetName: t.title,
          dueDate: t.deadline,
          daysRemaining: days
        });
      }
    }
  });

  // 3 & 4. Dự án chậm tiến độ / sắp hết hạn / hợp đồng hết hạn
  const projects = getProjects();
  projects.forEach(p => {
    if (p.status === 'dang_thi_cong' || p.status === 'cham_tien_do') {
      const days = getDaysRemaining(p.endDate);
      if (days < 0 && p.progressPercent < 100) {
        generated.push({
          id: `notif-proj-delay-${p.id}`,
          title: `Dự án RPBM TRỄ TIẾN ĐỘ: ${p.code}`,
          message: `Dự án "${p.name}" đã trễ hạn thi công ${Math.abs(days)} ngày. Tiến độ đạt ${p.progressPercent}%.`,
          type: 'du_an_cham_tien_do',
          severity: 'critical',
          createdAt: p.endDate,
          status: 'chua_doc',
          linkModule: 'projects',
          linkId: p.id,
          sourceTargetName: p.name,
          dueDate: p.endDate,
          daysRemaining: days
        });
      } else if (days <= 30 && p.progressPercent < 90) {
        generated.push({
          id: `notif-proj-near-${p.id}`,
          title: `Dự án sắp hết hạn thi công (${days} ngày): ${p.code}`,
          message: `Dự án "${p.name}" còn ${days} ngày thực hiện theo hợp đồng.`,
          type: 'du_an_sap_het_han',
          severity: 'warning',
          createdAt: nowStr,
          status: 'chua_doc',
          linkModule: 'projects',
          linkId: p.id,
          sourceTargetName: p.name,
          dueDate: p.endDate,
          daysRemaining: days
        });
      }
    }

    // 5. Hợp đồng sắp hết hạn
    if (p.contractSigningDate || p.endDate) {
      const endD = p.endDate;
      const daysContract = getDaysRemaining(endD);
      if (daysContract >= 0 && daysContract <= 45) {
        generated.push({
          id: `notif-contract-exp-${p.id}`,
          title: `Hợp đồng RPBM sắp hết hiệu lực (${daysContract} ngày): ${p.contractNumber || p.code}`,
          message: `Hợp đồng dự án "${p.name}" hết hạn ngày ${endD}. Cần rà soát gia hạn hoặc quyết toán.`,
          type: 'hop_dong_sap_het_han',
          severity: 'warning',
          createdAt: nowStr,
          status: 'chua_doc',
          linkModule: 'projects',
          linkId: p.id,
          sourceTargetName: p.name,
          dueDate: endD,
          daysRemaining: daysContract
        });
      }
    }

    // 12. Hồ sơ dự án còn thiếu
    if (p.dossiers && p.dossiers.length > 0) {
      const missing = p.dossiers.filter(d => d.status === 'chua_co' || d.status === 'can_bo_sung');
      if (missing.length > 0) {
        generated.push({
          id: `notif-dossier-missing-${p.id}`,
          title: `Dự án ${p.code} còn thiếu ${missing.length} mục hồ sơ`,
          message: `Các danh mục hồ sơ chưa có: ${missing.slice(0, 3).map(m => m.category).join(', ')}...`,
          type: 'ho_so_du_an_con_thieu',
          severity: 'info',
          createdAt: nowStr,
          status: 'chua_doc',
          linkModule: 'projects',
          linkId: p.id,
          sourceTargetName: p.name
        });
      }
    }

    // 13. Công nợ đến hạn
    if (p.debt && p.debt > 0) {
      generated.push({
        id: `notif-debt-due-${p.id}`,
        title: `Công nợ đến hạn dự án ${p.code}`,
        message: `Dự án "${p.name}" có công nợ còn tồn ${p.debt.toLocaleString('vi-VN')} VNĐ chưa thu hồi.`,
        type: 'cong_no_den_han',
        severity: 'warning',
        createdAt: nowStr,
        status: 'chua_doc',
        linkModule: 'projects',
        linkId: p.id,
        sourceTargetName: p.name
      });
    }
  });

  // 6. Chứng chỉ sắp hết hạn
  const personnel = getPersonnel();
  personnel.forEach(p => {
    p.certificates.forEach(c => {
      const days = getDaysRemaining(c.expiryDate);
      if (days < 0) {
        generated.push({
          id: `notif-cert-exp-${c.id}`,
          title: `Chứng chỉ đã QUÁ HẠN: ${c.name}`,
          message: `Chứng chỉ của cán bộ ${p.rankTitle} ${p.fullName} đã hết hạn từ ngày ${c.expiryDate}.`,
          type: 'chung_chi_sap_het_han',
          severity: 'critical',
          createdAt: c.expiryDate,
          status: 'chua_doc',
          linkModule: 'personnel',
          linkId: p.id,
          sourceTargetName: `${p.rankTitle} ${p.fullName}`,
          dueDate: c.expiryDate,
          daysRemaining: days
        });
      } else if (days <= 60) {
        generated.push({
          id: `notif-cert-warning-${c.id}`,
          title: `Chứng chỉ sắp hết hạn (${days} ngày): ${c.name}`,
          message: `Cán bộ ${p.fullName} cần làm thủ tục gia hạn trước ngày ${c.expiryDate}.`,
          type: 'chung_chi_sap_het_han',
          severity: days <= 15 ? 'critical' : 'warning',
          createdAt: nowStr,
          status: 'chua_doc',
          linkModule: 'personnel',
          linkId: p.id,
          sourceTargetName: `${p.rankTitle} ${p.fullName}`,
          dueDate: c.expiryDate,
          daysRemaining: days
        });
      }
    });
  });

  // 7, 8 & 10. Đăng kiểm, bảo hiểm xe & thiết bị bảo trì
  const equipment = getEquipment();
  equipment.forEach(e => {
    const days = getDaysRemaining(e.nextCalibrationDate);
    const isVehicle = e.category === 'phuong_tien' || e.serialOrPlate.includes('-') || e.serialOrPlate.includes('C');
    
    if (days < 0) {
      generated.push({
        id: `notif-eq-exp-${e.id}`,
        title: `${isVehicle ? 'Đăng kiểm xe' : 'Kiểm định máy'} QUÁ HẠN: ${e.name}`,
        message: `Thiết bị ${e.name} (${e.serialOrPlate}) đã hết hạn kiểm định/đăng kiểm (${e.nextCalibrationDate}).`,
        type: isVehicle ? 'dang_kiem_sap_het_han' : 'kiem_dinh_thiet_bi_sap_het_han',
        severity: 'critical',
        createdAt: e.nextCalibrationDate,
        status: 'chua_doc',
        linkModule: 'equipment',
        linkId: e.id,
        sourceTargetName: e.name,
        dueDate: e.nextCalibrationDate,
        daysRemaining: days
      });
    } else if (days <= 30) {
      generated.push({
        id: `notif-eq-warning-${e.id}`,
        title: `${isVehicle ? 'Đăng kiểm xe' : 'Kiểm định thiết bị'} sắp đến hạn (${days} ngày)`,
        message: `${e.name} (${e.serialOrPlate}) cần thực hiện kiểm định trước ngày ${e.nextCalibrationDate}.`,
        type: isVehicle ? 'dang_kiem_sap_het_han' : 'kiem_dinh_thiet_bi_sap_het_han',
        severity: days <= 7 ? 'critical' : 'warning',
        createdAt: nowStr,
        status: 'chua_doc',
        linkModule: 'equipment',
        linkId: e.id,
        sourceTargetName: e.name,
        dueDate: e.nextCalibrationDate,
        daysRemaining: days
      });
    }

    if (e.status === 'can_bao_duong' || e.status === 'dang_hong') {
      generated.push({
        id: `notif-eq-maint-${e.id}`,
        title: `Thiết bị đến hạn bảo trì: ${e.name}`,
        message: `Máy/Phương tiện ${e.name} (${e.serialOrPlate}) báo trạng thái "${e.status === 'can_bao_duong' ? 'Cần bảo dưỡng' : 'Hỏng hóc'}" cần xử lý kỹ thuật.`,
        type: 'thiet_bi_den_han_bao_tri',
        severity: 'warning',
        createdAt: nowStr,
        status: 'chua_doc',
        linkModule: 'equipment',
        linkId: e.id,
        sourceTargetName: e.name
      });
    }
  });

  // Mock 추가 Notifications for Vehicles & Archive borrowed & Legal documents to fulfill all 15 types cleanly
  // 8. Bảo hiểm xe sắp hết hạn (Mock vehicle alert)
  generated.push({
    id: 'notif-veh-insur-01',
    title: 'Bảo hiểm xe chở vật nổ 29C-888.99 sắp hết hạn (12 ngày)',
    message: 'Xe chuyên dùng 29C-888.99 có thời hạn bảo hiểm TNDS hết vào 09/08/2026. Cần gia hạn bảo hiểm.',
    type: 'bao_hiem_xe_sap_het_han',
    severity: 'warning',
    createdAt: nowStr,
    status: 'chua_doc',
    linkModule: 'vehicles',
    linkId: 'veh-01',
    sourceTargetName: 'Xe 29C-888.99',
    dueDate: '2026-08-09',
    daysRemaining: 12
  });

  // 11. Hồ sơ mượn quá hạn
  generated.push({
    id: 'notif-borrow-overdue-01',
    title: 'Hồ sơ mượn kho quá hạn: HS-2024-DA02',
    message: 'Hồ sơ phương án thi công Dự án Sân bay Long Thành do KTS Lê Hoàng Nam mượn đã quá hạn 5 ngày chưa trả lại Kho 12.',
    type: 'ho_so_muon_qua_han',
    severity: 'critical',
    createdAt: '2026-07-23',
    status: 'chua_doc',
    linkModule: 'archive_warehouse',
    linkId: 'brw-01',
    sourceTargetName: 'HS-2024-DA02',
    dueDate: '2026-07-23',
    daysRemaining: -5
  });

  // 14. Hồ sơ / văn bản pháp lý hết hiệu lực
  const legalDocs = getLegalDocs();
  legalDocs.forEach(leg => {
    if (leg.validityStatus === 'het_hieu_luc' || leg.status === 'het_hieu_luc') {
      generated.push({
        id: `notif-legal-expired-${leg.id}`,
        title: `Văn bản pháp lý ĐÃ HẾT HIỆU LỰC: ${leg.docNumberSymbol || leg.code}`,
        message: `Văn bản quy phạm "${leg.title}" đã hết hiệu lực thi hành. Cần rà soát áp dụng văn bản mới.`,
        type: 'ho_so_phap_ly_het_hieuluc',
        severity: 'info',
        createdAt: nowStr,
        status: 'chua_doc',
        linkModule: 'legal',
        linkId: leg.id,
        sourceTargetName: leg.title
      });
    }

    // 15. Văn bản pháp lý được thay thế hoặc sửa đổi
    if (leg.validityStatus === 'bi_thay_the' || leg.validityStatus === 'sua_doi_bo_sung' || leg.replacingDoc || leg.amendingDoc) {
      generated.push({
        id: `notif-legal-replaced-${leg.id}`,
        title: `Văn bản pháp lý được thay thế/sửa đổi: ${leg.docNumberSymbol || leg.code}`,
        message: `Văn bản "${leg.title}" đã có văn bản thay thế/sửa đổi: ${leg.replacingDoc || leg.amendingDoc || 'QCVN/Thông tư mới'}.`,
        type: 'van_ban_phap_ly_thay_the_sua_doi',
        severity: 'warning',
        createdAt: nowStr,
        status: 'chua_doc',
        linkModule: 'legal',
        linkId: leg.id,
        sourceTargetName: leg.title
      });
    }
  });

  // Merge state with stored user modifications (read, resolved, snoozed, assigned)
  const finalResult: AppNotificationItem[] = generated.map(gen => {
    const existing = storedMap.get(gen.id);
    if (existing) {
      return {
        ...gen,
        status: existing.status,
        snoozedUntil: existing.snoozedUntil,
        assignedToUser: existing.assignedToUser,
        assignedNote: existing.assignedNote
      };
    }
    return gen;
  });

  // Add any custom manually created notifications
  storedList.forEach(stored => {
    if (!generated.some(g => g.id === stored.id)) {
      finalResult.push(stored);
    }
  });

  return finalResult;
}
