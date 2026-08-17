import * as XLSX from 'xlsx';
import { Personnel } from '../types';
import { formatDateVN } from '../utils/formatters';
import { PermissionService } from './PermissionService';
import { AuditLogService } from './AuditLogService';

export class PersonnelExportService {
  /**
   * Export Personnel list to Excel workbook following Page 2 official template structure
   */
  public static exportToExcel(personnelList: Personnel[], fileNamePrefix = 'DanhSach_NhanSu_BaoCao_Trang2'): boolean {
    // 1. Enforce permission
    PermissionService.assertPermission('personnel.export', 'Xuất danh sách nhân sự ra file Excel');

    const headers = [
      'STT',
      'Mã Nhân sự',
      'Họ và Tên Cán bộ',
      'Ngày tháng năm sinh',
      'Quê quán / Thường trú',
      'Cấp bậc / Chức danh',
      'Chức vụ đảm nhiệm',
      'Chuyên môn Nghiệp vụ',
      'Đơn vị Quản lý / Bộ phận',
      'Số điện thoại',
      'Email công vụ',
      'Tình trạng công tác',
      'Dự án hiện tại',
      'Số chứng chỉ RPBM',
      'Danh sách Chứng chỉ (Loại | Số hiệu | Ngày cấp | Hạn dùng | Trạng thái)'
    ];

    const statusMap: Record<string, string> = {
      dang_cong_tac: 'Đang công tác',
      tam_nghi: 'Tạm nghỉ',
      chuyen_cong_tac: 'Chuyển công tác',
      nghi_huu: 'Nghỉ hưu'
    };

    const rows = personnelList.map((p, idx) => {
      const certDetails = (p.certificates || [])
        .map(
          c =>
            `${c.certTypeLabel || c.name} (Số: ${c.certificateNo || 'N/A'}, Cấp: ${formatDateVN(c.issueDate)}, Hạn: ${formatDateVN(c.expiryDate)})`
        )
        .join('; ');

      return [
        idx + 1,
        p.code || `NS-${p.id}`,
        p.fullName,
        p.dob ? formatDateVN(p.dob) : '',
        p.hometown || '',
        p.rankTitle || p.jobTitle || '',
        p.position || p.roleInTeam || '',
        p.specialization || '',
        p.unit || 'Tiểu đoàn 93 - Binh chủng Công binh',
        p.phone || '',
        p.email || '',
        statusMap[p.workStatus || 'dang_cong_tac'] || 'Đang công tác',
        p.currentProjectName || 'Chưa phân công',
        (p.certificates || []).length,
        certDetails
      ];
    });

    try {
      // Build XLSX Worksheet
      const wsData = [headers, ...rows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths
      ws['!cols'] = [
        { wch: 5 },  // STT
        { wch: 12 }, // Mã NS
        { wch: 25 }, // Họ tên
        { wch: 15 }, // Ngày sinh
        { wch: 25 }, // Quê quán
        { wch: 20 }, // Cấp bậc
        { wch: 22 }, // Chức vụ
        { wch: 22 }, // Chuyên môn
        { wch: 30 }, // Đơn vị
        { wch: 14 }, // SĐT
        { wch: 25 }, // Email
        { wch: 18 }, // Tình trạng
        { wch: 28 }, // Dự án
        { wch: 12 }, // Số chứng chỉ
        { wch: 50 }  // Chi tiết chứng chỉ
      ];

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Trang2_NhanSu_RPBM');

      const fileName = `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);

      AuditLogService.log({
        module: 'Nhân sự & Chứng chỉ',
        actionDetails: `Xuất thành công danh sách ${personnelList.length} nhân sự ra tệp Excel (${fileName}) theo Mẫu trang 2.`,
        actionType: 'tai_xuong',
        result: 'success'
      });

      return true;
    } catch (err: any) {
      console.error('Lỗi xuất Excel nhân sự:', err);

      // Fallback CSV with UTF-8 BOM if binary XLSX write fails
      const bom = '\uFEFF';
      const escapeCSV = (val: any) => `"${String(val ?? '').replace(/"/g, '""')}"`;
      const csvStr = [
        headers.map(escapeCSV).join(','),
        ...rows.map(r => r.map(escapeCSV).join(','))
      ].join('\n');

      const blob = new Blob([bom + csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${fileNamePrefix}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      AuditLogService.log({
        module: 'Nhân sự & Chứng chỉ',
        actionDetails: `Xuất danh sách nhân sự CSV/Excel fallback (${personnelList.length} bản ghi).`,
        actionType: 'tai_xuong',
        result: 'success'
      });
      return true;
    }
  }
}
