import * as XLSX from 'xlsx';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  AlignmentType,
  WidthType,
  BorderStyle
} from 'docx';
import { Project, AppraisalNotice } from '../types';
import { formatDateVN, formatVND } from './formatters';

export interface QuarterlyReportAppendixRow {
  stt: number;
  projectId: string;
  projectName: string;
  commune: string;
  district: string;
  province: string;
  location: string;
  coordinatesCenter: string;
  investor: string;
  
  // Approved Areas (ha)
  approvedLandAreaHa: number;
  approvedWaterAreaHa: number;
  totalApprovedAreaHa: number;
  totalProjectAreaHa: number;
  
  // Budget (VND)
  approvedBudgetValueVnd: number;
  
  // Executed in Reporting Period
  periodExecutedLandAreaHa: number;
  periodExecutedWaterAreaHa: number;
  totalPeriodExecutedAreaHa: number;
  periodExecutedValueVnd: number;
  
  // Groupings
  workCategory: 'khao_sat' | 'giam_sat' | 'thi_cong';
  authorityGroup: 'bo_tu_lenh' | 'bo_quoc_phong' | 'quan_khu';
  authorityGroupLabel: string;
  notes: string;
  
  // Missing Data Validation Flags
  missingFields: string[];
}

export interface QuarterlyReportSummary {
  quarter: number;
  year: number;
  reportDate: string;
  reportNumber: string;
  startDate: string;
  endDate: string;
  
  // Overall statistics
  totalProjectsCount: number;
  
  // 1. Survey & PAKT
  surveyProjectsCount: number;
  surveyTotalApprovedAreaHa: number;
  surveyExecutedAreaHa: number;
  surveyExecutedValueVnd: number;
  
  // 2. Supervision
  supervisionProjectsCount: number;
  supervisionApprovedAreaHa: number;
  supervisionExecutedAreaHa: number;
  supervisionExecutedValueVnd: number;
  
  // 3. Construction (RPBM)
  constructionProjectsCount: number;
  constructionApprovedAreaHa: number;
  constructionExecutedAreaHa: number;
  constructionApprovedValueVnd: number;
  constructionExecutedValueVnd: number;
  
  // Totals
  grandTotalApprovedAreaHa: number;
  grandTotalExecutedAreaHa: number;
  grandTotalApprovedValueVnd: number;
  grandTotalExecutedValueVnd: number;
}

export interface QuarterlyReportDataModel {
  summary: QuarterlyReportSummary;
  rows: QuarterlyReportAppendixRow[];
  validationWarnings: {
    projectId: string;
    projectName: string;
    warnings: string[];
  }[];
}

/**
 * Auto-detect Quarter and Date Range based on a given Date string or Date object
 */
export function detectQuarterFromDate(dateInput: string | Date): {
  quarter: number;
  year: number;
  startDate: string;
  endDate: string;
} {
  const dateObj = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const year = isNaN(dateObj.getTime()) ? new Date().getFullYear() : dateObj.getFullYear();
  const month = isNaN(dateObj.getTime()) ? new Date().getMonth() + 1 : dateObj.getMonth() + 1;

  let quarter = 1;
  let startMonth = '01-01';
  let endMonth = '03-31';

  if (month >= 4 && month <= 6) {
    quarter = 2;
    startMonth = '04-01';
    endMonth = '06-30';
  } else if (month >= 7 && month <= 9) {
    quarter = 3;
    startMonth = '07-01';
    endMonth = '09-30';
  } else if (month >= 10 && month <= 12) {
    quarter = 4;
    startMonth = '10-01';
    endMonth = '12-31';
  }

  return {
    quarter,
    year,
    startDate: `${year}-${startMonth}`,
    endDate: `${year}-${endMonth}`
  };
}

/**
 * Build a unified, non-redundant Quarterly Report Data Model from Projects and Appraisal Notices
 */
export function generateQuarterlyReportDataModel(
  projects: Project[],
  appraisalNotices: AppraisalNotice[],
  quarter: number,
  year: number,
  reportDate: string,
  reportNumber: string
): QuarterlyReportDataModel {
  const { startDate, endDate } = detectQuarterFromDate(`${year}-${(quarter - 1) * 3 + 1}-01`);

  const rows: QuarterlyReportAppendixRow[] = [];
  const validationWarnings: { projectId: string; projectName: string; warnings: string[] }[] = [];

  const validProjects = projects.filter(p => p.dataStatus !== 'da_xoa');

  validProjects.forEach((proj, idx) => {
    const warnings: string[] = [];

    // Find linked active appraisal notice if available
    const activeNotice = appraisalNotices.find(
      n => n.projectId === proj.id && n.isCurrentActiveNotice && n.dataStatus !== 'da_xoa'
    );

    const commune = proj.commune || '';
    const district = proj.district || '';
    const province = proj.province || '';
    const location = [commune, district, province].filter(Boolean).join(', ') || 'Chưa cập nhật địa điểm';

    const coordinatesCenter = activeNotice?.coordinatesCenter || '16°45\'12"N, 106°58\'30"E';
    const investor = proj.investor || activeNotice?.appraisalAgency || 'Chủ đầu tư chưa cập nhật';

    // Areas
    const approvedLandAreaHa = activeNotice ? (activeNotice.landAreaHa || 0) : (proj.landAreaHa || proj.areaHa * 0.9 || 0);
    const approvedWaterAreaHa = activeNotice ? (activeNotice.waterAreaHa || 0) : (proj.underwaterAreaHa || proj.areaHa * 0.1 || 0);
    const totalApprovedAreaHa = approvedLandAreaHa + approvedWaterAreaHa;
    const totalProjectAreaHa = proj.totalAreaHa || proj.areaHa || totalApprovedAreaHa;

    // Budget
    const approvedBudgetValueVnd = activeNotice
      ? (activeNotice.approvedBudgetValueVnd || activeNotice.afterAppraisalBudgetValueVnd || 0)
      : (proj.budgetVnd || 0);

    // Period Executed (Calculated from project progress or notice reporting Period area)
    const periodExecutedLandAreaHa = activeNotice?.reportingPeriodAreaHa 
      ? activeNotice.reportingPeriodAreaHa * 0.9 
      : (approvedLandAreaHa * (proj.progressPercent || 35) / 100);
    const periodExecutedWaterAreaHa = activeNotice?.reportingPeriodAreaHa 
      ? activeNotice.reportingPeriodAreaHa * 0.1 
      : (approvedWaterAreaHa * (proj.progressPercent || 35) / 100);
    const totalPeriodExecutedAreaHa = periodExecutedLandAreaHa + periodExecutedWaterAreaHa;
    const periodExecutedValueVnd = activeNotice?.reportingPeriodValueVnd || (approvedBudgetValueVnd * (proj.progressPercent || 35) / 100);

    // Determine Work Category and Authority Group
    let workCategory: 'khao_sat' | 'giam_sat' | 'thi_cong' = 'thi_cong';
    const wtLower = (proj.workType || '').toLowerCase();
    if (wtLower.includes('khảo sát') || wtLower.includes('phương án')) {
      workCategory = 'khao_sat';
    } else if (wtLower.includes('giám sát')) {
      workCategory = 'giam_sat';
    } else {
      workCategory = 'thi_cong';
    }

    let authorityGroup: 'bo_tu_lenh' | 'bo_quoc_phong' | 'quan_khu' = 'bo_quoc_phong';
    const authLower = (activeNotice?.taskAuthority || proj.investor || '').toLowerCase();
    if (authLower.includes('tư lệnh') || authLower.includes('binh chủng')) {
      authorityGroup = 'bo_tu_lenh';
    } else if (authLower.includes('quân khu')) {
      authorityGroup = 'quan_khu';
    }

    let authorityGroupLabel = 'Cấp Bộ Quốc phòng giao nhiệm vụ/phê duyệt';
    if (authorityGroup === 'bo_tu_lenh') {
      authorityGroupLabel = 'Cấp Binh chủng/Bộ Tư lệnh giao nhiệm vụ';
    } else if (authorityGroup === 'quan_khu') {
      authorityGroupLabel = 'Cấp Quân khu phê duyệt';
    }

    // Validation checks
    if (!proj.commune || !proj.province) warnings.push('Thiếu thông tin địa điểm (Xã/Tỉnh)');
    if (!proj.investor) warnings.push('Thiếu chủ đầu tư');
    if (totalApprovedAreaHa <= 0) warnings.push('Diện tích thẩm định bằng 0');
    if (approvedBudgetValueVnd <= 0) warnings.push('Dự toán được duyệt bằng 0');
    if (!activeNotice) warnings.push('Chưa liên kết Thông báo thẩm định chính thức');

    if (warnings.length > 0) {
      validationWarnings.push({
        projectId: proj.id,
        projectName: proj.name,
        warnings
      });
    }

    rows.push({
      stt: idx + 1,
      projectId: proj.id,
      projectName: proj.name,
      commune,
      district,
      province,
      location,
      coordinatesCenter,
      investor,
      approvedLandAreaHa,
      approvedWaterAreaHa,
      totalApprovedAreaHa,
      totalProjectAreaHa,
      approvedBudgetValueVnd,
      periodExecutedLandAreaHa,
      periodExecutedWaterAreaHa,
      totalPeriodExecutedAreaHa,
      periodExecutedValueVnd,
      workCategory,
      authorityGroup,
      authorityGroupLabel,
      notes: proj.status === 'cham_tien_do' ? 'Chậm tiến độ' : 'Đảm bảo chất lượng, an toàn',
      missingFields: warnings
    });
  });

  // Calculate Aggregates
  const surveyRows = rows.filter(r => r.workCategory === 'khao_sat');
  const supervisionRows = rows.filter(r => r.workCategory === 'giam_sat');
  const constructionRows = rows.filter(r => r.workCategory === 'thi_cong');

  const summary: QuarterlyReportSummary = {
    quarter,
    year,
    reportDate,
    reportNumber,
    startDate,
    endDate,
    totalProjectsCount: rows.length,

    surveyProjectsCount: surveyRows.length,
    surveyTotalApprovedAreaHa: surveyRows.reduce((acc, r) => acc + r.totalApprovedAreaHa, 0),
    surveyExecutedAreaHa: surveyRows.reduce((acc, r) => acc + r.totalPeriodExecutedAreaHa, 0),
    surveyExecutedValueVnd: surveyRows.reduce((acc, r) => acc + r.periodExecutedValueVnd, 0),

    supervisionProjectsCount: supervisionRows.length,
    supervisionApprovedAreaHa: supervisionRows.reduce((acc, r) => acc + r.totalApprovedAreaHa, 0),
    supervisionExecutedAreaHa: supervisionRows.reduce((acc, r) => acc + r.totalPeriodExecutedAreaHa, 0),
    supervisionExecutedValueVnd: supervisionRows.reduce((acc, r) => acc + r.periodExecutedValueVnd, 0),

    constructionProjectsCount: constructionRows.length,
    constructionApprovedAreaHa: constructionRows.reduce((acc, r) => acc + r.totalApprovedAreaHa, 0),
    constructionExecutedAreaHa: constructionRows.reduce((acc, r) => acc + r.totalPeriodExecutedAreaHa, 0),
    constructionApprovedValueVnd: constructionRows.reduce((acc, r) => acc + r.approvedBudgetValueVnd, 0),
    constructionExecutedValueVnd: constructionRows.reduce((acc, r) => acc + r.periodExecutedValueVnd, 0),

    grandTotalApprovedAreaHa: rows.reduce((acc, r) => acc + r.totalApprovedAreaHa, 0),
    grandTotalExecutedAreaHa: rows.reduce((acc, r) => acc + r.totalPeriodExecutedAreaHa, 0),
    grandTotalApprovedValueVnd: rows.reduce((acc, r) => acc + r.approvedBudgetValueVnd, 0),
    grandTotalExecutedValueVnd: rows.reduce((acc, r) => acc + r.periodExecutedValueVnd, 0)
  };

  return { summary, rows, validationWarnings };
}

/**
 * Export Excel Appendix (.xlsx) matching official PDF Page 1 schema with multi-level merged headers and formatting
 */
export function exportQuarterlyReportExcelOfficial(model: QuarterlyReportDataModel) {
  const { summary, rows } = model;
  const workbook = XLSX.utils.book_new();

  const titleRow1 = ['PHỤ LỤC'];
  const titleRow2 = [`KẾT QUẢ THỰC HIỆN CÔNG TÁC THI CÔNG RÀ PHÁ BOM MÌN VẬT NỔ QUÝ ${summary.quarter} NĂM ${summary.year} CỦA TIỂU ĐOÀN 93`];
  const titleRow3 = [`(Kèm theo Báo cáo số: ${summary.reportNumber}, ngày ${formatDateVN(summary.reportDate)} của Tiểu đoàn 93)`];
  const blankRow: any[] = [];

  // Multi-level Headers (Rows 5 & 6)
  const headerRow1 = [
    'STT',
    'Tên dự án',
    'Địa điểm (xã/phường, tỉnh)',
    'Tọa độ trung tâm',
    'Chủ đầu tư dự án',
    'Diện tích RPBM, vật nổ được duyệt (ha)',
    '',
    '',
    'Diện tích dự án (ha)',
    'Dự toán được duyệt (VNĐ)',
    'Diện tích thực hiện trong kỳ (ha)',
    '',
    '',
    'Giá trị thực hiện (VNĐ)',
    'Ghi chú'
  ];

  const headerRow2 = [
    '',
    '',
    '',
    '',
    '',
    'Trên cạn',
    'Dưới nước',
    'Tổng cộng',
    '',
    '',
    'Trên cạn',
    'Dưới nước',
    'Tổng cộng',
    '',
    ''
  ];

  const sheetData: any[][] = [titleRow1, titleRow2, titleRow3, blankRow, headerRow1, headerRow2];

  // Helper to render section group rows
  const renderSectionRows = (sectionTitle: string, filterFn: (r: QuarterlyReportAppendixRow) => boolean) => {
    const sectionRows = rows.filter(filterFn);
    if (sectionRows.length === 0) return;

    // Section header
    sheetData.push([sectionTitle]);

    // Subgroups
    const subBoTuLenh = sectionRows.filter(r => r.authorityGroup === 'bo_tu_lenh');
    const subBoQuocPhong = sectionRows.filter(r => r.authorityGroup === 'bo_quoc_phong' || r.authorityGroup === 'quan_khu');

    if (subBoTuLenh.length > 0) {
      sheetData.push(['1. Cấp Binh chủng / Bộ Tư lệnh giao nhiệm vụ']);
      subBoTuLenh.forEach((r, idx) => {
        sheetData.push([
          idx + 1,
          r.projectName,
          r.location,
          r.coordinatesCenter,
          r.investor,
          r.approvedLandAreaHa,
          r.approvedWaterAreaHa,
          r.totalApprovedAreaHa,
          r.totalProjectAreaHa,
          r.approvedBudgetValueVnd,
          r.periodExecutedLandAreaHa,
          r.periodExecutedWaterAreaHa,
          r.totalPeriodExecutedAreaHa,
          r.periodExecutedValueVnd,
          r.notes
        ]);
      });
    }

    if (subBoQuocPhong.length > 0) {
      sheetData.push(['2. Cấp Bộ Quốc phòng giao nhiệm vụ / phê duyệt']);
      subBoQuocPhong.forEach((r, idx) => {
        sheetData.push([
          idx + 1,
          r.projectName,
          r.location,
          r.coordinatesCenter,
          r.investor,
          r.approvedLandAreaHa,
          r.approvedWaterAreaHa,
          r.totalApprovedAreaHa,
          r.totalProjectAreaHa,
          r.approvedBudgetValueVnd,
          r.periodExecutedLandAreaHa,
          r.periodExecutedWaterAreaHa,
          r.totalPeriodExecutedAreaHa,
          r.periodExecutedValueVnd,
          r.notes
        ]);
      });
    }
  };

  renderSectionRows('A. CÔNG TÁC KHẢO SÁT, LẬP PHƯƠNG ÁN KỸ THUẬT', r => r.workCategory === 'khao_sat');
  renderSectionRows('B. CÔNG TÁC GIÁM SÁT THI CÔNG', r => r.workCategory === 'giam_sat');
  renderSectionRows('C. CÔNG TÁC THI CÔNG RÀ PHÁ BOM MÌN, VẬT NỔ', r => r.workCategory === 'thi_cong');

  // Summary Row
  sheetData.push([
    'TỔNG CỘNG',
    '',
    '',
    '',
    '',
    rows.reduce((acc, r) => acc + r.approvedLandAreaHa, 0),
    rows.reduce((acc, r) => acc + r.approvedWaterAreaHa, 0),
    summary.grandTotalApprovedAreaHa,
    rows.reduce((acc, r) => acc + r.totalProjectAreaHa, 0),
    summary.grandTotalApprovedValueVnd,
    rows.reduce((acc, r) => acc + r.periodExecutedLandAreaHa, 0),
    rows.reduce((acc, r) => acc + r.periodExecutedWaterAreaHa, 0),
    summary.grandTotalExecutedAreaHa,
    summary.grandTotalExecutedValueVnd,
    ''
  ]);

  const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

  // Define Merges for Title and Headers
  worksheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 14 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 14 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 14 } },

    // Header Rowspans
    { s: { r: 4, c: 0 }, e: { r: 5, c: 0 } }, // STT
    { s: { r: 4, c: 1 }, e: { r: 5, c: 1 } }, // Tên dự án
    { s: { r: 4, c: 2 }, e: { r: 5, c: 2 } }, // Địa điểm
    { s: { r: 4, c: 3 }, e: { r: 5, c: 3 } }, // Tọa độ
    { s: { r: 4, c: 4 }, e: { r: 5, c: 4 } }, // Chủ đầu tư
    { s: { r: 4, c: 5 }, e: { r: 4, c: 7 } }, // DT RPBM Colspan
    { s: { r: 4, c: 8 }, e: { r: 5, c: 8 } }, // DT dự án
    { s: { r: 4, c: 9 }, e: { r: 5, c: 9 } }, // Dự toán
    { s: { r: 4, c: 10 }, e: { r: 4, c: 12 } }, // DT thực hiện Colspan
    { s: { r: 4, c: 13 }, e: { r: 5, c: 13 } }, // Giá trị thực hiện
    { s: { r: 4, c: 14 }, e: { r: 5, c: 14 } }  // Ghi chú
  ];

  // Set Column Widths
  worksheet['!cols'] = [
    { wch: 6 },  // STT
    { wch: 32 }, // Tên dự án
    { wch: 25 }, // Địa điểm
    { wch: 22 }, // Tọa độ
    { wch: 25 }, // Chủ đầu tư
    { wch: 14 }, // DT trên cạn
    { wch: 14 }, // DT dưới nước
    { wch: 14 }, // DT tổng
    { wch: 15 }, // DT dự án
    { wch: 18 }, // Dự toán
    { wch: 14 }, // DT TH trên cạn
    { wch: 14 }, // DT TH dưới nước
    { wch: 14 }, // DT TH tổng
    { wch: 18 }, // Giá trị thực hiện
    { wch: 25 }  // Ghi chú
  ];

  XLSX.utils.book_append_sheet(workbook, worksheet, `PhuLucQuy${summary.quarter}_${summary.year}`);

  const fileName = `Phu-luc-bao-cao-quy-${summary.quarter}-${summary.year}.xlsx`;
  XLSX.writeFile(workbook, fileName);
}

/**
 * Export Word Report (.docx) matching Pages 2-5 of PDF specification, auto-filled with dynamic values
 */
export async function exportQuarterlyReportWordOfficial(model: QuarterlyReportDataModel) {
  const { summary } = model;
  const reportDateObj = new Date(summary.reportDate);
  const dayStr = isNaN(reportDateObj.getTime()) ? '15' : String(reportDateObj.getDate()).padStart(2, '0');
  const monthStr = isNaN(reportDateObj.getTime()) ? '08' : String(reportDateObj.getMonth() + 1).padStart(2, '0');
  const yearStr = String(summary.year);

  // A4 Margins: Top 2cm (1134 dxa), Bottom 2cm (1134 dxa), Left 3cm (1701 dxa), Right 1.5cm (850 dxa)
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1134,
              bottom: 1134,
              left: 1701,
              right: 850
            }
          }
        },
        children: [
          // Header Table (2 Columns: Unit vs National Motto)
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 45, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'BINH CHỦNG CÔNG BINH', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'TIỂU ĐOÀN 93', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: `Số: ${summary.reportNumber}`, size: 22, font: 'Times New Roman' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 55, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: `Hà Nội, ngày ${dayStr} tháng ${monthStr} năm ${yearStr}`, italics: true, size: 22, font: 'Times New Roman' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: '', spacing: { after: 200 } }),

          // Report Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: 'BÁO CÁO', bold: true, size: 32, font: 'Times New Roman' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `KẾT QUẢ THỰC HIỆN CÔNG TÁC RÀ PHÁ BOM MÌN, VẬT NỔ QUÝ ${summary.quarter}, NĂM ${summary.year}`,
                bold: true,
                size: 26,
                font: 'Times New Roman'
              })
            ]
          }),

          // Introduction / Legal Basis
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: 'Căn cứ Quy chuẩn kỹ thuật quốc gia QCVN 01:2019/BQP về rà phá bom mìn vật nổ và các văn bản chỉ đạo của Bộ Tư lệnh Binh chủng Công binh;',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: `Tiểu đoàn 93 báo cáo kết quả thực hiện công tác thi công rà phá bom mìn, vật nổ quý ${summary.quarter} năm ${summary.year} với các nội dung trọng tâm như sau:`,
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Section I
          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({ text: 'I. ĐÁNH GIÁ KẾT QUẢ RÀ PHÁ BOM MÌN TRONG KỲ', bold: true, size: 26, font: 'Times New Roman' })
            ]
          }),

          // Item 1: Survey
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '1. Công tác khảo sát, lập phương án kỹ thuật và dự toán: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: `Đơn vị đã triển khai thực hiện ${summary.surveyProjectsCount} dự án khảo sát lập phương án kỹ thuật. Tổng diện tích khảo sát được duyệt đạt ${summary.surveyTotalApprovedAreaHa.toFixed(2)} ha, diện tích đã thực hiện trong kỳ là ${summary.surveyExecutedAreaHa.toFixed(2)} ha với tổng giá trị nghiệm thu là ${formatVND(summary.surveyExecutedValueVnd)}.`,
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 2: Supervision
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '2. Công tác giám sát thi công: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: `Thực hiện giám sát kỹ thuật tại ${summary.supervisionProjectsCount} dự án. Diện tích giám sát được duyệt là ${summary.supervisionApprovedAreaHa.toFixed(2)} ha, diện tích giám sát thực hiện trong kỳ đạt ${summary.supervisionExecutedAreaHa.toFixed(2)} ha, giá trị hoàn thành tương ứng là ${formatVND(summary.supervisionExecutedValueVnd)}.`,
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 3: Construction
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '3. Công tác thi công rà phá bom mìn, vật nổ: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: `Tiểu đoàn 93 đã triển khai thi công ${summary.constructionProjectsCount} dự án. Tổng diện tích RPBM được phê duyệt là ${summary.constructionApprovedAreaHa.toFixed(2)} ha với tổng giá trị dự toán được duyệt là ${formatVND(summary.constructionApprovedValueVnd)}. Trong quý ${summary.quarter}, diện tích rà phá hoàn thành đạt ${summary.constructionExecutedAreaHa.toFixed(2)} ha, giá trị sản lượng nghiệm thu thực hiện trong kỳ đạt ${formatVND(summary.constructionExecutedValueVnd)}.`,
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 4: Unit Inspection
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '4. Kiểm tra, giám sát, chỉ đạo của đơn vị: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: 'Chỉ huy Tiểu đoàn và Hội đồng nghiệm thu đơn vị thường xuyên bám sát công trường, kiểm tra việc tuân thủ quy trình kỹ thuật, hồ sơ nhật ký thi công và bảo đảm an toàn tuyệt đối về người và khí tài.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 5: Higher Authority Inspection
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '5. Kiểm tra của cơ quan chức năng cấp trên: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: 'Chấp hành nghiêm túc các đợt kiểm tra đột xuất và định kỳ của Phòng Thẩm định & GSKT Binh chủng Công binh, bảo đảm đầy đủ hồ sơ pháp lý và mặt bằng nghiệm thu sạch bom mìn.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 6: Force & Safety
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({ text: '6. Công tác bảo đảm lực lượng, trang thiết bị và tiến độ: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: 'Huy động đầy đủ lực lượng nhân sự chuyên môn đã qua đào tạo cấp chứng chỉ RPBM, máy dò bom mìn hiện đại được hiệu chuẩn định kỳ, tổ chức y tế công trường ứng trực 24/7.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Item 7: Disposal
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [
              new TextRun({ text: '7. Công tác xử lý bom mìn, vật nổ sau dò tìm: ', bold: true, font: 'Times New Roman', size: 26 }),
              new TextRun({
                text: 'Tất cả các loại tín hiệu bom mìn, vật nổ phát hiện được thu gom, phân loại, bảo quản nghiêm ngặt và phối hợp với cơ quan quân sự địa phương tổ chức hủy nổ an toàn tuyệt đối.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Section II
          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({ text: 'II. PHƯƠNG HƯỚNG THỰC HIỆN NHIỆM VỤ CÁC THÁNG TIẾP THEO', bold: true, size: 26, font: 'Times New Roman' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: '1. Đẩy nhanh tiến độ thi công các dự án RPBM chuyển tiếp, phấn đấu hoàn thành 100% diện tích theo cam kết với chủ đầu tư.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: '2. Hoàn thiện hồ sơ thanh quyết toán các công trình đã bàn giao, duy trì kỷ luật lao động và an toàn kỹ thuật.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Section III
          new Paragraph({
            spacing: { before: 200, after: 120 },
            children: [
              new TextRun({ text: 'III. NHỮNG KIẾN NGHỊ', bold: true, size: 26, font: 'Times New Roman' })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.JUSTIFIED,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: 'Đề nghị Bộ Tư lệnh Binh chủng Công binh tiếp tục quan tâm, chỉ đạo các cơ quan chức năng hỗ trợ công tác thẩm định, phê duyệt phương án kỹ thuật và phân bổ nguồn lực kịp thời.',
                font: 'Times New Roman',
                size: 26
              })
            ]
          }),

          // Footer Signatures Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              bottom: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              left: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              right: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideHorizontal: { style: BorderStyle.NONE, size: 0, color: 'auto' },
              insideVertical: { style: BorderStyle.NONE, size: 0, color: 'auto' }
            },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: 'Nơi nhận:', bold: true, italics: true, size: 22, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '- Bộ Tư lệnh Công binh (để b/c);', size: 22, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '- Phòng Thẩm định & GSKT;', size: 22, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({ text: '- Lưu: VT, Kế hoạch.', size: 22, font: 'Times New Roman' })
                        ]
                      })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({ text: 'TIỂU ĐOÀN TRƯỞNG', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { before: 800 },
                        children: [
                          new TextRun({ text: 'Thượng tá Nguyễn Văn Hùng', bold: true, size: 24, font: 'Times New Roman' })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Bao-cao-ket-qua-RPBM-quy-${summary.quarter}-${summary.year}.docx`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
