// Utility helpers for exporting data to Excel (CSV with UTF-8 BOM for Excel compatibility) and generating printable PDF reports

import * as XLSX from 'xlsx';
import { DocumentRecord, Project, Personnel, EquipmentItem, AuditLog } from '../types';
import { formatDateVN, formatVND, DOCUMENT_STATUS_MAP, formatDateForInput, removeVietnameseTones } from './formatters';
import { getProjectYear } from './projectYearUtils';

// Download a UTF-8 BOM CSV file that opens seamlessly in Microsoft Excel
function downloadExcelCSV(csvContent: string, fileName: string) {
  const bom = '\uFEFF';
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Escape CSV fields
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

export function exportDocumentsExcel(docs: DocumentRecord[]) {
  const headers = [
    'Mã / Số Ký hiệu',
    'Tên / Trích yếu Văn bản',
    'Loại File / Danh mục',
    'Cơ quan Ban hành',
    'Nơi nhận / Đơn vị quản lý',
    'Ngày ban hành',
    'Hạn xử lý',
    'Trạng thái',
    'Người tải lên',
    'Ngày tải lên',
    'Phiên bản',
    'Quyền truy cập',
    'Link Google Drive',
    'Ghi chú'
  ];

  const rows = docs.map(d => [
    escapeCSV(d.code),
    escapeCSV(d.title),
    escapeCSV(d.category || d.type),
    escapeCSV(d.issuer),
    escapeCSV(d.recipientOrOwner),
    escapeCSV(formatDateVN(d.issueDate)),
    escapeCSV(formatDateVN(d.deadline)),
    escapeCSV(DOCUMENT_STATUS_MAP[d.status]?.label || d.status),
    escapeCSV(d.uploader || 'Cán bộ Văn thư'),
    escapeCSV(formatDateVN(d.uploadDate || d.issueDate)),
    escapeCSV(d.version || 'v1.0'),
    escapeCSV(d.accessPermission === 'mat' ? 'Mật / Chỉ huy' : d.accessPermission === 'noi_bo' ? 'Nội bộ' : 'Công khai'),
    escapeCSV(d.driveUrl),
    escapeCSV(d.notes || '')
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadExcelCSV(csv, 'DanhSach_VanBan_HoSo_QLRPBM');
}

export function exportProjectsExcel(
  projects: Project[],
  options?: { yearLabel?: string; responsibleUserLabel?: string }
) {
  const headers = [
    'Mã Dự án',
    'Tên Dự án Rà phá Bom mìn',
    'Năm Dự án',
    'Người phụ trách',
    'Email Người phụ trách',
    'Chủ đầu tư',
    'Địa bàn (Xã, Huyện, Tỉnh)',
    'Diện tích (ha)',
    'Kinh phí (VNĐ)',
    'Trạng thái',
    'Tiến độ (%)',
    'Ngày bắt đầu',
    'Ngày hoàn thành',
    'Chỉ huy trưởng',
    'Số lượng vật nổ phát hiện',
    'Link Google Drive'
  ];

  const rows = projects.map(p => {
    const yr = getProjectYear(p);
    const yrDisplay = yr ? String(yr) : 'Chưa xác định năm';
    const respName = p.responsibleName || p.projectManager || 'Chưa phân công';
    const respEmail = p.responsibleEmail || p.projectManagerEmail || '--';

    return [
      escapeCSV(p.code),
      escapeCSV(p.name),
      escapeCSV(yrDisplay),
      escapeCSV(respName),
      escapeCSV(respEmail),
      escapeCSV(p.investor),
      escapeCSV(`${p.commune || ''}, ${p.district || ''}, ${p.province || ''}`),
      escapeCSV(p.areaHa || p.totalAreaHa || 0),
      escapeCSV(p.contractValue || p.budgetVnd || 0),
      escapeCSV(p.status),
      escapeCSV(`${p.progressPercent || 0}%`),
      escapeCSV(formatDateVN(p.startDate)),
      escapeCSV(formatDateVN(p.endDate)),
      escapeCSV(p.commanderName || '--'),
      escapeCSV(p.uxoFoundCount || 0),
      escapeCSV(p.driveFolderUrl || '')
    ];
  });

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

  const yearSlug = options?.yearLabel && options.yearLabel !== 'all'
    ? removeVietnameseTones(String(options.yearLabel)).replace(/[^a-zA-Z0-9]/g, '-')
    : 'Tat-ca-nam';

  const respSlug = options?.responsibleUserLabel && options.responsibleUserLabel !== 'all'
    ? removeVietnameseTones(options.responsibleUserLabel).replace(/[^a-zA-Z0-9]/g, '-')
    : 'Tat-ca-nguoi-phu-trach';

  const dateSlug = new Date().toISOString().slice(0, 10);
  const fileName = `Danh-sach-du-an-${yearSlug}-${respSlug}-${dateSlug}`;

  downloadExcelCSV(csv, fileName);
}

export function exportPersonnelExcel(personnel: Personnel[]) {
  const headers = [
    'Mã NS',
    'Họ và Tên',
    'Ngày sinh',
    'Quê quán',
    'Chức vụ',
    'Chức danh nghề nghiệp',
    'Chuyên môn',
    'Đơn vị',
    'Số điện thoại',
    'Email',
    'Tình trạng công tác',
    'Dự án đang tham gia',
    'Số lượng chứng chỉ',
    'Chi tiết chứng chỉ (Loại | Số hiệu | Ngày cấp | Hạn dùng | Trạng thái)'
  ];

  const statusMap: Record<string, string> = {
    dang_cong_tac: 'Đang công tác',
    tam_nghi: 'Tạm nghỉ',
    chuyen_cong_tac: 'Chuyển công tác',
    nghi_huu: 'Nghỉ hưu'
  };

  const rows = personnel.map(p => [
    escapeCSV(p.code),
    escapeCSV(p.fullName),
    escapeCSV(p.dob ? formatDateVN(p.dob) : ''),
    escapeCSV(p.hometown || ''),
    escapeCSV(p.position || p.roleInTeam),
    escapeCSV(p.jobTitle || p.rankTitle),
    escapeCSV(p.specialization || ''),
    escapeCSV(p.unit),
    escapeCSV(p.phone),
    escapeCSV(p.email),
    escapeCSV(statusMap[p.workStatus || 'dang_cong_tac'] || 'Đang công tác'),
    escapeCSV(p.currentProjectName || 'Chưa phân công'),
    escapeCSV(p.certificates.length),
    escapeCSV(
      p.certificates
        .map(
          c =>
            `${c.certTypeLabel || c.name} [Số: ${c.certificateNo} | Cấp: ${formatDateVN(c.issueDate)} | Hạn: ${formatDateVN(c.expiryDate)} | TT: ${
              c.status === 'con_han' ? 'Còn hạn' : c.status === 'sap_het_han' ? 'Sắp hết hạn' : 'Hết hạn'
            }]`
        )
        .join('; ')
    )
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadExcelCSV(csv, 'DanhSach_NhanSu_HoSo_ChungChi_RPBM');
}

export function exportEquipmentExcel(equipment: EquipmentItem[]) {
  const headers = [
    'Mã Thiết bị',
    'Tên Phương tiện / Thiết bị',
    'Phân loại',
    'Hãng / Model',
    'Số máy / Biển số',
    'Trạng thái',
    'Vị trí hiện tại',
    'Hạn Đăng kiểm / Hiệu chuẩn',
    'Người chịu trách nhiệm'
  ];

  const rows = equipment.map(e => [
    escapeCSV(e.code),
    escapeCSV(e.name),
    escapeCSV(e.category),
    escapeCSV(e.brandModel),
    escapeCSV(e.serialOrPlate),
    escapeCSV(e.status),
    escapeCSV(e.location),
    escapeCSV(formatDateVN(e.nextCalibrationDate)),
    escapeCSV(e.assignedTo || 'Chưa gán')
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadExcelCSV(csv, 'DanhSach_ThietBi_DangKiem_RPBM');
}

export function exportAuditLogsExcel(logs: AuditLog[]) {
  const headers = ['Thời gian', 'Người thực hiện', 'Chức danh', 'Phân hệ', 'Hành động', 'Chi tiết thao tác'];

  const rows = logs.map(l => [
    escapeCSV(l.timestamp),
    escapeCSV(l.userName),
    escapeCSV(l.userRole),
    escapeCSV(l.module),
    escapeCSV(l.action),
    escapeCSV(l.details)
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadExcelCSV(csv, 'NhatKy_ThaoTac_HeThong_RPBM');
}

export function exportArchiveDossiersExcel(archives: any[]) {
  const headers = [
    'Mã Hồ sơ',
    'STT',
    'Tên Hồ sơ',
    'Loại Hồ sơ',
    'Dự án Liên quan',
    'Năm Hồ sơ',
    'Thời hạn Bảo quản',
    'Mức độ Mật',
    'Số lượng TL',
    'Số tờ',
    'Ngày Nhập kho',
    'Người Nhập kho',
    'Mã Vị trí Lưu kho',
    'Mã Hộp',
    'Tình trạng Vật lý',
    'Trạng thái Hồ sơ',
    'Ghi chú'
  ];

  const categoryMap: Record<string, string> = {
    du_an_rpbm: 'Dự án RPBM',
    nghiep_vu_ky_thuat: 'Nghiệp vụ Kỹ thuật',
    phap_ly_hop_dong: 'Pháp lý & Hợp đồng',
    nhan_su_chung_chi: 'Nhân sự & Chứng chỉ',
    tai_chinh_ke_toan: 'Tài chính Kế toán',
    tai_lieu_khac: 'Tài liệu Khác'
  };

  const secrecyMap: Record<string, string> = {
    thuong: 'Thường',
    mat: 'Mật',
    toi_mat: 'Tối mật',
    tuyet_mat: 'Tuyệt mật'
  };

  const conditionMap: Record<string, string> = {
    tot: 'Tốt',
    binh_thuong: 'Bình thường',
    hu_hong_nhe: 'Hư hỏng nhẹ',
    can_bao_quan_dac_biet: 'Cần bảo quản đặc biệt'
  };

  const rows = archives.map(a => [
    escapeCSV(a.archiveCode),
    escapeCSV(a.stt),
    escapeCSV(a.title),
    escapeCSV(categoryMap[a.category] || a.category),
    escapeCSV(a.relatedProjectName || 'Không có'),
    escapeCSV(a.archiveYear),
    escapeCSV(a.retentionPeriod === 'vinh_vien' ? 'Vĩnh viễn' : `${a.retentionPeriod.replace('_nam', ' năm')}`),
    escapeCSV(secrecyMap[a.secrecyLevel] || a.secrecyLevel),
    escapeCSV(a.documentCount),
    escapeCSV(a.pageCount),
    escapeCSV(formatDateVN(a.entryDate)),
    escapeCSV(a.entryPerson),
    escapeCSV(a.locationCode),
    escapeCSV(a.boxCode),
    escapeCSV(conditionMap[a.physicalCondition] || a.physicalCondition),
    escapeCSV(a.status === 'luu_kho' ? 'Lưu kho' : a.status === 'dang_muon' ? 'Đang mượn' : 'Đã tiêu hủy'),
    escapeCSV(a.notes || '')
  ]);

  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  downloadExcelCSV(csv, 'DanhSach_HoSo_LuuKho_RPBM');
}

export function exportQuarterlyReportExcel(report: any) {
  const isType1 = report.reportType === 'phu_luc_1_giam_sat';
  const isType2 = report.reportType === 'phu_luc_2_khao_sat';
  const isType3 = report.reportType === 'phu_luc_3_thi_cong';

  let csvRows: string[] = [];

  // Title header rows
  csvRows.push(escapeCSV(report.title.toUpperCase()));
  csvRows.push(escapeCSV(report.subtitle));
  csvRows.push(''); // Blank line

  if (isType3) {
    // 17-column header for Phu luc III
    csvRows.push([
      'STT',
      'Tên dự án',
      'Địa điểm - Xã/Phường',
      'Địa điểm - Huyện',
      'Địa điểm - Tỉnh',
      'Tọa độ trọng tâm dự án',
      'Chủ đầu tư dự án',
      'DT RPBM được duyệt trên cạn (ha)',
      'DT RPBM được duyệt dưới nước (ha)',
      'Tổng DT RPBM được duyệt (ha)',
      'Diện tích dự án (ha)',
      'Dự toán được duyệt (đồng)',
      'DT thực hiện trong kỳ - Trên cạn (ha)',
      'DT thực hiện trong kỳ - Dưới nước (ha)',
      'Tổng DT thực hiện trong kỳ (ha)',
      'Giá trị thực hiện (đồng)',
      'Ghi chú'
    ].map(escapeCSV).join(','));
  } else {
    // 16-column header for Phu luc I & II
    const actionLabel = isType1 ? 'giám sát' : 'khảo sát';
    csvRows.push([
      'STT',
      'Tên dự án',
      'Địa điểm - Huyện',
      'Địa điểm - Tỉnh',
      'Chủ đầu tư dự án',
      'DT RPBM được duyệt trên cạn (ha)',
      'DT RPBM được duyệt dưới nước (ha)',
      'Dự toán được duyệt (đồng)',
      `DT ${actionLabel} thực hiện trong kỳ - Trên cạn (ha)`,
      `DT ${actionLabel} thực hiện trong kỳ - Dưới nước (ha)`,
      'Giá trị thực hiện (triệu đồng)',
      'Số lượng bom mìn vật nổ thu gom (quả/viên)',
      'Trọng lượng bom mìn vật nổ thu gom (kg)',
      'Địa điểm xử lý',
      'Đơn vị phối hợp thực hiện',
      'Ghi chú'
    ].map(escapeCSV).join(','));
  }

  // Items grouped
  const group1 = report.items.filter((i: any) => i.groupType === 'QUAN_KHU');
  const group2 = report.items.filter((i: any) => i.groupType === 'BO_QUOC_PHONG');

  const renderGroup = (groupTitle: string, items: any[]) => {
    csvRows.push(escapeCSV(groupTitle));
    items.forEach((item, idx) => {
      if (isType3) {
        const approvedLand = Number(item.approvedLandAreaHa || 0);
        const approvedWater = Number(item.approvedWaterAreaHa || 0);
        const totalApproved = approvedLand + approvedWater;
        const totalProject = Number(item.totalProjectAreaHa || totalApproved);
        const periodLand = Number(item.periodExecutedLandAreaHa || 0);
        const periodWater = Number(item.periodExecutedWaterAreaHa || 0);
        const totalPeriod = periodLand + periodWater;

        csvRows.push([
          idx + 1,
          escapeCSV(item.projectName),
          escapeCSV(item.commune || ''),
          escapeCSV(item.district || ''),
          escapeCSV(item.province || ''),
          escapeCSV(item.coordinatesCenter || ''),
          escapeCSV(item.investor || ''),
          approvedLand.toFixed(3),
          approvedWater.toFixed(3),
          totalApproved.toFixed(3),
          totalProject.toFixed(3),
          item.approvedBudgetVnd || 0,
          periodLand.toFixed(3),
          periodWater.toFixed(3),
          totalPeriod.toFixed(3),
          item.periodExecutedValueVnd || 0,
          escapeCSV(item.notes || '')
        ].join(','));
      } else {
        const approvedLand = Number(item.approvedLandAreaHa || 0);
        const approvedWater = Number(item.approvedWaterAreaHa || 0);
        const periodLand = Number(item.periodExecutedLandAreaHa || 0);
        const periodWater = Number(item.periodExecutedWaterAreaHa || 0);

        csvRows.push([
          idx + 1,
          escapeCSV(item.projectName),
          escapeCSV(item.district || ''),
          escapeCSV(item.province || ''),
          escapeCSV(item.investor || ''),
          approvedLand.toFixed(3),
          approvedWater.toFixed(3),
          item.approvedBudgetVnd || 0,
          periodLand.toFixed(3),
          periodWater.toFixed(3),
          (item.periodExecutedValueVnd / 1000000).toFixed(3),
          item.uxoQuantityCount || 0,
          Number(item.uxoWeightKg || 0).toFixed(3),
          escapeCSV(item.disposalLocation || ''),
          escapeCSV(item.coordinatingUnit || ''),
          escapeCSV(item.notes || '')
        ].join(','));
      }
    });
  };

  if (isType1) {
    csvRows.push(escapeCSV('A. CÔNG TÁC GIÁM SÁT THI CÔNG'));
    renderGroup('I. CẤP QUÂN KHU GIAO NHIỆM VỤ', group1);
    renderGroup('II. CẤP BỘ QUỐC PHÒNG GIAO NHIỆM VỤ', group2);
  } else if (isType2) {
    csvRows.push(escapeCSV('A. CÔNG TÁC KHẢO SÁT, LẬP PHƯƠNG ÁN'));
    renderGroup('I. CẤP QUÂN KHU GIAO NHIỆM VỤ', group1);
    renderGroup('II. CẤP BỘ QUỐC PHÒNG GIAO NHIỆM VỤ', group2);
  } else {
    csvRows.push(escapeCSV('C. CÔNG TÁC THI CÔNG'));
    renderGroup('I. CẤP QUÂN KHU, BỘ TƯ LỆNH GIAO NHIỆM VỤ', group1);
    renderGroup('II. CẤP BỘ QUỐC PHÒNG PHÊ DUYỆT', group2);
  }

  // Add Grand Totals
  csvRows.push(escapeCSV('TỔNG CỘNG'));

  if (isType2) {
    csvRows.push('');
    csvRows.push(escapeCSV('Ghi chú: Diện tích được duyệt là diện tích tổng của dự án; diện tích thực hiện trong kỳ báo cáo là diện tích khảo sát thực tế của dự án, tỷ lệ từ 1% đến 5% tùy theo đặc điểm từng dự án.'));
  }

  downloadExcelCSV(csvRows.join('\n'), `BaoCao_Quy_${report.quarter}_${report.year}_${report.reportCode}`);
}

/**
 * Official Excel export for key personnel profiles (.xlsx) matching Document5.pdf Page 2 template
 * Multi-level header structure: Group 1 (THÔNG TIN NHÂN SỰ) & Group 2 (CÔNG VIỆC HIỆN TẠI)
 */
export function exportPersonnelKeyProfileOfficialExcel(
  personnelList: Personnel[],
  scope: 'all' | 'filtered' = 'all'
) {
  const workbook = XLSX.utils.book_new();
  const dateStr = formatDateForInput(new Date());

  // Title Row
  const titleRow = ['BẢNG LÝ LỊCH CHUYÊN MÔN CỦA NHÂN SỰ CHỦ CHỐT'];

  // Level 1 Group Header (Row 2)
  const headerGroupRow = [
    'THÔNG TIN NHÂN SỰ',
    '',
    '',
    '',
    '',
    '',
    'CÔNG VIỆC HIỆN TẠI',
    '',
    '',
    '',
    '',
    ''
  ];

  // Level 2 Detail Header (Row 3 - 12 Columns)
  const headerColRow = [
    'STT',
    'Họ và Tên',
    'Căn cước công dân',
    'Vị trí',
    'Ngày, tháng, năm sinh',
    'Chứng chỉ/Trình độ chuyên môn',
    'Tên người sử dụng lao động',
    'Địa chỉ của người sử dụng lao động',
    'Chức danh',
    'Số năm làm việc cho người sử dụng lao động hiện tại',
    'Người liên lạc (trưởng phòng/cán bộ phụ trách nhân sự)',
    'Điện thoại/Fax/Email'
  ];

  const sheetData: any[][] = [titleRow, headerGroupRow, headerColRow];

  // Render Data Rows
  personnelList.forEach((p, index) => {
    // Summarize certificates cleanly
    const certsStr = (p.certificates || [])
      .map(c => {
        const title = c.name || c.certTypeLabel || '';
        const no = c.certificateNo ? ` (Số: ${c.certificateNo})` : '';
        return `${title}${no}`;
      })
      .filter(Boolean)
      .join('; ');

    const combinedQualifications = [p.specialization, certsStr].filter(Boolean).join('\n• ');
    const displayQualifications = combinedQualifications ? (p.specialization ? `Chuyên môn: ${combinedQualifications}` : certsStr) : '';

    const contactPerson = p.contactPerson || 'Tiểu đoàn trưởng / Cán bộ nhân sự';
    const contactMethods = [p.phone, p.fax, p.email].filter(Boolean).join(' / ');
    const yearsWorking =
      p.yearsWorkingForEmployer !== undefined && p.yearsWorkingForEmployer !== null && p.yearsWorkingForEmployer > 0
        ? `${p.yearsWorkingForEmployer} năm`
        : '';

    sheetData.push([
      index + 1,
      p.fullName || '',
      p.identityCardNo || '', // If empty, leave blank - do NOT write "Không có"
      p.position || p.roleInTeam || '',
      p.dob ? formatDateVN(p.dob) : '',
      displayQualifications || p.specialization || '',
      p.employerName || 'Tiểu đoàn 93/Binh chủng Công binh',
      p.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội',
      p.jobTitle || p.rankTitle || '',
      yearsWorking,
      contactPerson,
      contactMethods
    ]);
  });

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Define Merges for Title and Multi-level Headers
  worksheet['!merges'] = [
    // Title A1:L1
    { s: { r: 0, c: 0 }, e: { r: 0, c: 11 } },
    // Group 1: THÔNG TIN NHÂN SỰ (A2:F2)
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
    // Group 2: CÔNG VIỆC HIỆN TẠI (G2:L2)
    { s: { r: 1, c: 6 }, e: { r: 1, c: 11 } }
  ];

  // Set Column Widths
  worksheet['!cols'] = [
    { wch: 6 },   // STT
    { wch: 25 },  // Họ và Tên
    { wch: 18 },  // CCCD
    { wch: 24 },  // Vị trí
    { wch: 16 },  // Ngày sinh
    { wch: 42 },  // Chứng chỉ/Trình độ
    { wch: 32 },  // Tên NSDLĐ
    { wch: 35 },  // Địa chỉ NSDLĐ
    { wch: 24 },  // Chức danh
    { wch: 20 },  // Số năm làm việc
    { wch: 28 },  // Người liên lạc
    { wch: 32 }   // Điện thoại/Fax/Email
  ];

  const fileName = `Bang-ly-lich-chuyen-mon-nhan-su-${dateStr}.xlsx`;
  const sheetName = scope === 'filtered' ? 'Bản khai Đã lọc' : 'Lý lịch Nhân sự';

  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, fileName);
}


