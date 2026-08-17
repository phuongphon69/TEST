// Remove Vietnamese Tones for accent-insensitive search
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  let result = String(str);
  result = result.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  result = result.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  result = result.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  result = result.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  result = result.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  result = result.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  result = result.replace(/đ/g, 'd');
  result = result.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  result = result.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  result = result.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  result = result.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  result = result.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  result = result.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  result = result.replace(/Đ/g, 'D');
  // Combine accents removal
  result = result.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, '');
  result = result.replace(/\u02C6|\u0306|\u031B/g, '');
  return result;
}

// Vietnamese Currency Formatter (e.g., 1.500.000.000 đồng)
export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0 đồng';
  const formattedNumber = new Intl.NumberFormat('vi-VN').format(amount);
  return `${formattedNumber} đồng`;
}

// Compact currency formatter for badges (e.g. 1,5 tỷ đồng, 450 triệu đồng)
export function formatVNDShort(amount: number): string {
  if (!amount) return '0 đồng';
  if (amount >= 1_000_000_000) {
    const ty = (amount / 1_000_000_000).toFixed(2).replace(/\.00$/, '');
    return `${ty} tỷ đồng`;
  }
  if (amount >= 1_000_000) {
    const trieu = (amount / 1_000_000).toFixed(0);
    return `${trieu} triệu đồng`;
  }
  return formatVND(amount);
}

// Convert YYYY-MM-DD or ISO string to DD/MM/YYYY
export function formatDateVN(dateInput?: string | Date | null): string {
  if (!dateInput) return '--/--/----';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) {
      // If string is already DD/MM/YYYY
      if (typeof dateInput === 'string' && dateInput.includes('/')) return dateInput;
      return '--/--/----';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return '--/--/----';
  }
}

// Format Date to YYYY-MM-DD for <input type="date">
export function formatDateForInput(dateInput?: string | Date | null): string {
  if (!dateInput) return '';
  try {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch {
    return '';
  }
}

// Calculate days remaining from today (positive = future, negative = past)
export function getDaysRemaining(targetDateStr: string): number {
  if (!targetDateStr) return 999;
  try {
    const target = new Date(targetDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 999;
  }
}

// Returns badge status color based on days remaining
export function getExpiryBadgeInfo(expiryDateStr: string): { label: string; classNames: string; status: 'qua_han' | 'sap_het_han' | 'con_han' } {
  const days = getDaysRemaining(expiryDateStr);
  if (days < 0) {
    return {
      label: `Đã quá hạn ${Math.abs(days)} ngày`,
      classNames: 'bg-red-900/60 text-red-200 border-red-700/80',
      status: 'qua_han'
    };
  }
  if (days <= 30) {
    return {
      label: `Còn ${days} ngày (Gấp)`,
      classNames: 'bg-rose-900/50 text-rose-200 border-rose-700',
      status: 'sap_het_han'
    };
  }
  if (days <= 60) {
    return {
      label: `Còn ${days} ngày`,
      classNames: 'bg-amber-900/50 text-amber-200 border-amber-700',
      status: 'sap_het_han'
    };
  }
  return {
    label: `Còn ${days} ngày`,
    classNames: 'bg-emerald-900/40 text-emerald-300 border-emerald-700/60',
    status: 'con_han'
  };
}

// Document status labels & colors
export const DOCUMENT_STATUS_MAP: Record<string, { label: string; classNames: string }> = {
  moi_tiep_nhan: { label: 'Mới tiếp nhận', classNames: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  cho_phan_cong: { label: 'Chờ phân công', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  dang_xu_ly: { label: 'Đang xử lý', classNames: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  cho_phe_duyet: { label: 'Chờ phê duyệt', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  da_hoan_thanh: { label: 'Đã hoàn thành', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  qua_han: { label: 'Quá hạn', classNames: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  tam_dung: { label: 'Tạm dừng', classNames: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  // Backwards compatibility
  cho_xuly: { label: 'Chờ xử lý', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  dang_thuc_hien: { label: 'Đang thực hiện', classNames: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  luu_tru: { label: 'Lưu trữ', classNames: 'bg-slate-700/60 text-slate-300 border-slate-600' }
};

export const APPRAISAL_CONCLUSION_MAP: Record<string, { label: string; classNames: string }> = {
  du_dieukien_pheduyet: { label: 'Đủ điều kiện phê duyệt', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  du_dieukien_trienkhai: { label: 'Đủ điều kiện triển khai', classNames: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  du_dieukien_bosung_hoso: { label: 'Đủ điều kiện nhưng phải bổ sung hồ sơ', classNames: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  yeucau_chinhsua: { label: 'Yêu cầu chỉnh sửa', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  yeucau_thamdinh_lai: { label: 'Yêu cầu thẩm định lại', classNames: 'bg-orange-500/20 text-orange-300 border-orange-500/40' },
  chua_du_dieukien: { label: 'Chưa đủ điều kiện', classNames: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  khong_duoc_chapthuan: { label: 'Không được chấp thuận', classNames: 'bg-red-600/30 text-red-200 border-red-500/50' },
  da_duoc_thaythe: { label: 'Đã được thay thế', classNames: 'bg-slate-700/60 text-slate-400 border-slate-600' },
  het_hieuluc: { label: 'Hết hiệu lực', classNames: 'bg-gray-800 text-gray-400 border-gray-700' }
};

export const APPRAISAL_TYPE_OPTIONS = [
  { value: 'khao_sat_thi_cong', label: 'Khảo sát – thi công' },
  { value: 'khao_sat_giam_sat', label: 'Khảo sát – giám sát' },
  { value: 'thi_cong', label: 'Thi công' },
  { value: 'giam_sat', label: 'Giám sát' }
] as const;

export const APPRAISAL_TYPE_MAP: Record<string, string> = {
  khao_sat_thi_cong: 'Khảo sát – thi công',
  khao_sat_giam_sat: 'Khảo sát – giám sát',
  thi_cong: 'Thi công',
  giam_sat: 'Giám sát',
  // Backward compatibility
  dtks: 'Khảo sát – thi công',
  pakt_tc: 'Thi công',
  du_toan: 'Khảo sát – thi công',
  pakt_vado_du_toan: 'Khảo sát – thi công',
  dieu_chinh_bo_sung: 'Khảo sát – thi công',
  cong_tac_thi_cong: 'Thi công',
  cong_tac_giam_sat: 'Giám sát',
  khac: 'Thi công'
};

export const TASK_AUTHORITY_MAP: Record<string, string> = {
  quan_khu: 'Cấp Quân khu giao nhiệm vụ',
  bo_tu_lenh: 'Bộ Tư lệnh giao nhiệm vụ',
  bo_quoc_phong: 'Cấp Bộ Quốc phòng giao nhiệm vụ',
  bqp_phe_duyet: 'Cấp Bộ Quốc phòng phê duyệt',
  chu_dau_tu: 'Chủ đầu tư trực tiếp giao nhiệm vụ',
  cap_khac: 'Cấp khác'
};

export const QUARTERLY_REPORT_STATUS_MAP: Record<string, { label: string; classNames: string }> = {
  ban_nhap: { label: 'Bản nháp', classNames: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  dang_tong_hop: { label: 'Đang tổng hợp', classNames: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  cho_kiem_tra: { label: 'Chờ kiểm tra', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  cho_phe_duyet: { label: 'Chờ phê duyệt', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  da_phe_duyet: { label: 'Đã phê duyệt', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  da_phat_hanh: { label: 'Đã phát hành', classNames: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  da_thay_the: { label: 'Đã thay thế', classNames: 'bg-gray-800 text-gray-400 border-gray-700' }
};

// Project status labels & colors (13 statuses for section 7.2 + backwards compatibility)
export const PROJECT_STATUS_MAP: Record<string, { label: string; classNames: string }> = {
  chuan_bi_dau_tu: { label: 'Chuẩn bị đầu tư', classNames: 'bg-slate-700/60 text-slate-300 border-slate-600' },
  dang_trinh_tham_dinh: { label: 'Đang trình thẩm định', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  chuan_bi_trien_khai: { label: 'Chuẩn bị triển khai', classNames: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  dang_khao_sat: { label: 'Đang khảo sát', classNames: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  dang_thi_cong: { label: 'Đang thi công', classNames: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  tam_dung: { label: 'Tạm dừng', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  cham_tien_do: { label: 'Chậm tiến độ', classNames: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' },
  dang_nghiem_thu: { label: 'Đang nghiệm thu', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  dang_hoan_thien_ho_so: { label: 'Đang hoàn thiện hồ sơ', classNames: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  dang_thanh_quyet_toan: { label: 'Đang thanh quyết toán', classNames: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  da_hoan_thanh: { label: 'Đã hoàn thành', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  da_ban_giao: { label: 'Đã bàn giao', classNames: 'bg-emerald-600/20 text-emerald-200 border-emerald-500/50' },
  da_quyet_toan: { label: 'Đã quyết toán', classNames: 'bg-teal-600/20 text-teal-200 border-teal-500/50' },
  huy: { label: 'Hủy', classNames: 'bg-red-900/40 text-red-400 border-red-800' },
  // Compatibility
  chuan_bi: { label: 'Chuẩn bị thi công', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  cho_nghiem_thu: { label: 'Chờ nghiệm thu', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  hoan_thanh: { label: 'Hoàn thành', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' }
};

// Dossier checklist status labels & colors (Section 7.5)
export const DOSSIER_STATUS_MAP: Record<string, { label: string; classNames: string }> = {
  chua_co: { label: 'Chưa có', classNames: 'bg-slate-800 text-slate-400 border-slate-700' },
  da_co: { label: 'Đã có', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  dang_bo_sung: { label: 'Đang bổ sung', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  khong_ap_dung: { label: 'Không áp dụng', classNames: 'bg-slate-700/60 text-slate-400 border-slate-600' },
  dang_chuan_bi: { label: 'Đang chuẩn bị', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  cho_ky: { label: 'Chờ ký', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  da_ky: { label: 'Đã ký', classNames: 'bg-blue-500/20 text-blue-300 border-blue-500/40' },
  can_bo_sung: { label: 'Cần bổ sung', classNames: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  da_hoan_thien: { label: 'Đã hoàn thiện', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  het_hieu_luc: { label: 'Hết hiệu lực', classNames: 'bg-gray-800 text-gray-400 border-gray-700' }
};

// Financial Installment Type labels (Section 7.4)
export const FINANCIAL_INSTALLMENT_TYPE_MAP: Record<string, string> = {
  tam_ung: 'Tạm ứng',
  nghiem_thu: 'Nghiệm thu khối lượng',
  thanh_toan: 'Thanh toán',
  thu_hoi_tam_ung: 'Thu hồi tạm ứng',
  quyet_toan: 'Quyết toán'
};

// Signal density labels
export const SIGNAL_DENSITY_MAP: Record<string, { label: string; color: string }> = {
  thap: { label: 'Mật độ Thấp (< 5 tín hiệu/ha)', color: 'text-emerald-400' },
  trung_binh: { label: 'Mật độ Trung bình (5–15 tín hiệu/ha)', color: 'text-amber-400' },
  cao: { label: 'Mật độ Cao (15–30 tín hiệu/ha)', color: 'text-orange-400' },
  rat_cao: { label: 'Mật độ Rất cao (> 30 tín hiệu/ha)', color: 'text-rose-400' }
};

// Equipment category labels
export const EQUIPMENT_CAT_MAP: Record<string, string> = {
  may_do_nong: 'Máy dò kim loại nông (<0.3m)',
  may_do_sau: 'Máy dò bom/vật nổ sâu (đến 5m)',
  may_do_tu: 'Máy đo từ từ trường (Foerster)',
  phuong_tien: 'Phương tiện cơ giới & Xe dã chiến',
  bao_ho: 'Trang thiết bị bảo hộ an toàn',
  truyen_thong: 'Thiết bị thông tin liên lạc'
};

// Task Status & Priority Maps (Section 6)
export const TASK_STATUS_MAP: Record<string, { label: string; classNames: string; headerColor: string }> = {
  chua_thuc_hien: { label: 'Chưa thực hiện', classNames: 'bg-slate-700/60 text-slate-300 border-slate-600', headerColor: 'border-slate-500 text-slate-300' },
  dang_thuc_hien: { label: 'Đang thực hiện', classNames: 'bg-blue-500/20 text-blue-300 border-blue-500/40', headerColor: 'border-blue-500 text-blue-400' },
  cho_phoi_hop: { label: 'Chờ phối hợp', classNames: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40', headerColor: 'border-indigo-500 text-indigo-400' },
  cho_phe_duyet: { label: 'Chờ phê duyệt', classNames: 'bg-purple-500/20 text-purple-300 border-purple-500/40', headerColor: 'border-purple-500 text-purple-400' },
  hoan_thanh: { label: 'Hoàn thành', classNames: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', headerColor: 'border-emerald-500 text-emerald-400' },
  qua_han: { label: 'Quá hạn', classNames: 'bg-rose-500/20 text-rose-300 border-rose-500/40', headerColor: 'border-rose-500 text-rose-400' },
  tam_dung: { label: 'Tạm dừng', classNames: 'bg-amber-500/20 text-amber-300 border-amber-500/40', headerColor: 'border-amber-500 text-amber-400' },
  huy: { label: 'Hủy', classNames: 'bg-red-900/40 text-red-400 border-red-800', headerColor: 'border-red-700 text-red-400' }
};

export const TASK_PRIORITY_MAP: Record<string, { label: string; classNames: string }> = {
  thuong: { label: 'Thường', classNames: 'bg-slate-800 text-slate-300 border-slate-700' },
  khan: { label: 'Khẩn', classNames: 'bg-amber-950/80 text-amber-300 border-amber-700' },
  thuong_khan: { label: 'Thượng khẩn', classNames: 'bg-orange-950/90 text-orange-200 border-orange-700' },
  hoa_toc: { label: 'Hỏa tốc', classNames: 'bg-red-950 text-red-200 border-red-700 animate-pulse font-bold' }
};

// Format File Size in bytes to KB/MB/GB
export function formatFileSize(bytes: number): string {
  if (bytes === 0 || !bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Appraisal Notice Centralized Symbol Config & Formatting
export const APPRAISAL_NOTICE_SYMBOL_SUFFIX = '/TB-BCCB';

export function formatAppraisalNoticeSymbol(noticeNum: number | string): string {
  if (!noticeNum) return '';
  const numStr = String(noticeNum).replace(/\D/g, '');
  if (!numStr) return '';
  return `${numStr}${APPRAISAL_NOTICE_SYMBOL_SUFFIX}`;
}

