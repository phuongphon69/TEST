import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Building,
  Eye,
  Edit2,
  Trash2,
  X,
  Download,
  Printer,
  Copy,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ArrowDownToLine,
  Filter,
  FileText,
  Save
} from 'lucide-react';
import {
  QuarterlyReport,
  QuarterlyReportLineItem,
  QuarterlyReportType,
  Project,
  AppraisalNotice
} from '../../types';
import { formatDateVN, formatDateForInput, formatVND, TASK_AUTHORITY_MAP, QUARTERLY_REPORT_STATUS_MAP } from '../../utils/formatters';
import { exportQuarterlyReportExcel } from '../../utils/exportUtils';
import {
  generateQuarterlyReportDataModel,
  exportQuarterlyReportExcelOfficial,
  exportQuarterlyReportWordOfficial,
  detectQuarterFromDate,
  QuarterlyReportDataModel
} from '../../utils/quarterlyReportEngine';

interface QuarterlyReportsTabProps {
  reports: QuarterlyReport[];
  projects: Project[];
  appraisalNotices: AppraisalNotice[];
  currentUser: { name: string; title: string };
  onSaveReport: (report: QuarterlyReport) => void;
  onDeleteReport: (id: string) => void;
}

export const QuarterlyReportsTab: React.FC<QuarterlyReportsTabProps> = ({
  reports,
  projects,
  appraisalNotices,
  currentUser,
  onSaveReport,
  onDeleteReport
}) => {
  const [selectedReport, setSelectedReport] = useState<QuarterlyReport | null>(reports[0] || null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDrillDownItem, setShowDrillDownItem] = useState<QuarterlyReportLineItem | null>(null);
  const [isEditingGrid, setIsEditingGrid] = useState(false);
  const [editableReportItems, setEditableReportItems] = useState<QuarterlyReportLineItem[]>([]);

  // New report form state
  const [reportType, setReportType] = useState<QuarterlyReportType>('phu_luc_3_thi_cong');
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(3);
  const [year, setYear] = useState<number>(2026);
  const [reportNumber, setReportNumber] = useState<string>('45/BC-TĐ');
  const [reportDate, setReportDate] = useState<string>(formatDateForInput(new Date()));
  const [issuingUnit, setIssuingUnit] = useState<string>('Tiểu đoàn 93/Binh chủng Công binh');

  // Sync editable items when selecting a report
  const handleSelectReport = (rep: QuarterlyReport) => {
    setSelectedReport(rep);
    setEditableReportItems(rep.items ? JSON.parse(JSON.stringify(rep.items)) : []);
    setIsEditingGrid(false);
  };

  // Toggle Grid Edit mode
  const handleStartEditGrid = () => {
    if (!selectedReport) return;
    setEditableReportItems(selectedReport.items ? JSON.parse(JSON.stringify(selectedReport.items)) : []);
    setIsEditingGrid(true);
  };

  const handleSaveGridEdits = () => {
    if (!selectedReport) return;
    const updatedReport: QuarterlyReport = {
      ...selectedReport,
      items: editableReportItems
    };
    onSaveReport(updatedReport);
    setSelectedReport(updatedReport);
    setIsEditingGrid(false);
    alert('Đã lưu các thay đổi trên lưới báo cáo thành công!');
  };

  const handleItemFieldChange = (id: string, field: keyof QuarterlyReportLineItem, val: any) => {
    setEditableReportItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: val };
          if (field === 'periodExecutedLandAreaHa' || field === 'periodExecutedWaterAreaHa') {
            const land = Number(field === 'periodExecutedLandAreaHa' ? val : updated.periodExecutedLandAreaHa || 0);
            const water = Number(field === 'periodExecutedWaterAreaHa' ? val : updated.periodExecutedWaterAreaHa || 0);
            updated.totalPeriodExecutedAreaHa = land + water;
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Auto generate report title and items from active projects & appraisal notices
  const handleAutoGenerateReport = () => {
    let title = '';
    let subtitle = `Kèm theo Báo cáo số: ${reportNumber}, ngày ${new Date(reportDate).getDate()} tháng ${new Date(reportDate).getMonth() + 1} năm ${new Date(reportDate).getFullYear()} của ${issuingUnit}`;

    if (reportType === 'phu_luc_1_giam_sat') {
      title = `Phụ lục I – Kết quả thực hiện công tác giám sát thi công rà phá bom mìn, vật nổ quý ${quarter} năm ${year}`;
    } else if (reportType === 'phu_luc_2_khao_sat') {
      title = `Phụ lục II – Kết quả thực hiện công tác điều tra khảo sát, lập PAKTTC – dự toán rà phá bom mìn, vật nổ quý ${quarter} năm ${year}`;
    } else {
      title = `Kết quả thực hiện công tác thi công rà phá bom mìn, vật nổ quý ${quarter} năm ${year} của Tiểu đoàn 93`;
    }

    const autoItems: QuarterlyReportLineItem[] = projects.map((p, index) => {
      const activeNotice = appraisalNotices.find(n => n.projectId === p.id && n.isCurrentActiveNotice);

      const approvedLand = activeNotice ? activeNotice.landAreaHa : p.areaHa * 0.9;
      const approvedWater = activeNotice ? activeNotice.waterAreaHa : p.areaHa * 0.1;
      const totalApprovedArea = approvedLand + approvedWater;
      const approvedBudget = activeNotice ? activeNotice.approvedBudgetValueVnd : p.budgetVnd;

      const periodLand = approvedLand * 0.35;
      const periodWater = approvedWater * 0.35;
      const periodValue = approvedBudget * 0.35;

      return {
        id: `line-${p.id}-${Date.now()}`,
        stt: index + 1,
        projectId: p.id,
        projectName: p.name,
        district: p.district || 'Hướng Hóa',
        province: p.province || 'Quảng Trị',
        commune: p.commune || 'Hướng Phùng',
        coordinatesCenter: activeNotice?.coordinatesCenter || '16°45\'12"N, 106°58\'30"E',
        investor: p.investor,
        approvedLandAreaHa: approvedLand,
        approvedWaterAreaHa: approvedWater,
        totalApprovedAreaHa: totalApprovedArea,
        approvedBudgetVnd: approvedBudget,
        periodExecutedLandAreaHa: periodLand,
        periodExecutedWaterAreaHa: periodWater,
        totalPeriodExecutedAreaHa: periodLand + periodWater,
        periodExecutedValueVnd: periodValue,
        uxoQuantityCount: Math.floor(Math.random() * 150) + 50,
        uxoWeightKg: Math.floor(Math.random() * 200) + 100,
        disposalLocation: 'Thao trường hủy nổ đơn vị',
        coordinatingUnit: 'Bộ CHQS Tỉnh',
        groupType: index % 2 === 0 ? 'QUAN_KHU' : 'BO_QUOC_PHONG',
        notes: 'Tiến độ đảm bảo chất lượng',
        sourceAppraisalNoticeId: activeNotice?.id
      };
    });

    const newReport: QuarterlyReport = {
      id: `qrep-${Date.now()}`,
      reportCode: `BC-Q${quarter}-${year}-${Math.floor(Math.random() * 90 + 10)}`,
      reportNumber: reportNumber,
      reportType: reportType,
      quarter: quarter,
      year: year,
      reportDate: reportDate,
      issuingUnit: issuingUnit,
      taskAuthorityLevel: 'bo_quoc_phong',
      title: title,
      subtitle: subtitle,
      creatorName: currentUser.name,
      checkerName: 'Trung tá Lê Ngọc Minh',
      approverName: 'Thượng tá Nguyễn Văn Hùng',
      version: 'v1.0',
      status: 'ban_nhap',
      items: autoItems,
      uploader: currentUser.name,
      uploadDate: formatDateForInput(new Date())
    };

    onSaveReport(newReport);
    handleSelectReport(newReport);
    setShowCreateModal(false);
  };

  // Export Excel CSV / XLSX Blob via exportUtils
  const handleExportExcel = () => {
    if (!selectedReport) return;
    exportQuarterlyReportExcel(selectedReport);
  };

  // Official Excel Export using quarterlyReportEngine (Multi-level header + calculations)
  const handleExportOfficialExcel = () => {
    const q = selectedReport?.quarter || quarter;
    const y = selectedReport?.year || year;
    const dateStr = selectedReport?.reportDate || reportDate;
    const numStr = selectedReport?.reportNumber || reportNumber;

    const model = generateQuarterlyReportDataModel(
      projects,
      appraisalNotices,
      q,
      y,
      dateStr,
      numStr
    );
    exportQuarterlyReportExcelOfficial(model);
  };

  // Official Word Export using quarterlyReportEngine (A4 font Times New Roman + Official layout)
  const handleExportOfficialWord = () => {
    const q = selectedReport?.quarter || quarter;
    const y = selectedReport?.year || year;
    const dateStr = selectedReport?.reportDate || reportDate;
    const numStr = selectedReport?.reportNumber || reportNumber;

    const model = generateQuarterlyReportDataModel(
      projects,
      appraisalNotices,
      q,
      y,
      dateStr,
      numStr
    );
    exportQuarterlyReportWordOfficial(model);
  };

  // Printable layout handler
  const handlePrintPDF = () => {
    window.print();
  };

  // Toggle report lock
  const handleToggleLock = () => {
    if (!selectedReport) return;
    const newStatus = selectedReport.status === 'da_phat_hanh' ? 'da_phe_duyet' : 'da_phat_hanh';
    const updated = { ...selectedReport, status: newStatus as any };
    onSaveReport(updated);
    setSelectedReport(updated);
  };

  // Group items
  const currentItems = isEditingGrid ? editableReportItems : (selectedReport?.items || []);
  const group1Items = currentItems.filter(i => i.groupType === 'QUAN_KHU');
  const group2Items = currentItems.filter(i => i.groupType === 'BO_QUOC_PHONG');

  // Calculations for display
  const grandTotalApprovedLand = currentItems.reduce((acc, i) => acc + (i.approvedLandAreaHa || 0), 0);
  const grandTotalApprovedWater = currentItems.reduce((acc, i) => acc + (i.approvedWaterAreaHa || 0), 0);
  const grandTotalApprovedArea = grandTotalApprovedLand + grandTotalApprovedWater;
  const grandTotalApprovedBudget = currentItems.reduce((acc, i) => acc + (i.approvedBudgetVnd || 0), 0);

  const grandTotalExecutedLand = currentItems.reduce((acc, i) => acc + (i.periodExecutedLandAreaHa || 0), 0);
  const grandTotalExecutedWater = currentItems.reduce((acc, i) => acc + (i.periodExecutedWaterAreaHa || 0), 0);
  const grandTotalExecutedArea = grandTotalExecutedLand + grandTotalExecutedWater;
  const grandTotalExecutedValue = currentItems.reduce((acc, i) => acc + (i.periodExecutedValueVnd || 0), 0);

  const grandTotalUxoCount = currentItems.reduce((acc, i) => acc + (i.uxoQuantityCount || 0), 0);
  const grandTotalUxoWeight = currentItems.reduce((acc, i) => acc + (i.uxoWeightKg || 0), 0);

  const isType1 = selectedReport?.reportType === 'phu_luc_1_giam_sat';
  const isType2 = selectedReport?.reportType === 'phu_luc_2_khao_sat';
  const isType3 = selectedReport?.reportType === 'phu_luc_3_thi_cong';

  return (
    <div className="space-y-6">
      {/* Top Bar / Selectors */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-6 h-6 text-emerald-400 shrink-0" />
          <div>
            <h3 className="font-bold text-base text-slate-100">Phân Hệ Lập Báo Cáo Quý (Theo Biểu Mẫu Chuẩn 5.6)</h3>
            <p className="text-xs text-slate-400">
              Phụ lục I (Giám sát), Phụ lục II (Khảo sát), Biểu mẫu III (Thi công Tiểu đoàn 93)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedReport?.id || ''}
            onChange={e => {
              const r = reports.find(rep => rep.id === e.target.value);
              if (r) handleSelectReport(r);
            }}
            className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-amber-300"
          >
            {reports.map(rep => (
              <option key={rep.id} value={rep.id}>
                {rep.reportCode} - Quý {rep.quarter}/{rep.year} ({rep.title.slice(0, 35)}...)
              </option>
            ))}
          </select>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" />
            Lập Báo Cáo Mới
          </button>
        </div>
      </div>

      {selectedReport ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Report Header Information */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="text-center md:text-left">
                <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">{selectedReport.issuingUnit}</p>
                <h1 className="text-lg font-black text-slate-100 uppercase mt-1 tracking-wide">{selectedReport.title}</h1>
                <p className="text-xs text-slate-400 italic mt-0.5">{selectedReport.subtitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {isEditingGrid ? (
                <button
                  onClick={handleSaveGridEdits}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Save className="w-4 h-4" />
                  Lưu Bảng
                </button>
              ) : (
                <button
                  onClick={handleStartEditGrid}
                  disabled={selectedReport.status === 'da_phat_hanh'}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 border ${
                    selectedReport.status === 'da_phat_hanh'
                      ? 'bg-slate-800 text-slate-500 border-slate-800 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-slate-700 text-sky-400 border-slate-700'
                  }`}
                >
                  <Edit2 className="w-4 h-4" />
                  Chỉnh Sửa Trực Tiếp
                </button>
              )}

              <button
                onClick={handleToggleLock}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                {selectedReport.status === 'da_phat_hanh' ? (
                  <>
                    <Lock className="w-4 h-4 text-rose-400" />
                    Đã Khóa
                  </>
                ) : (
                  <>
                    <Unlock className="w-4 h-4 text-emerald-400" />
                    Khóa Số Liệu
                  </>
                )}
              </button>

              <button
                onClick={handleExportOfficialExcel}
                className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-emerald-500/40 shadow-sm"
                title="Xuất file Excel có ô gộp (merged cells) và bảng tính toán chuẩn theo Phụ lục 5.6"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                Xuất Excel Chuẩn (.XLSX)
              </button>

              <button
                onClick={handleExportOfficialWord}
                className="px-3.5 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-blue-500/40 shadow-sm"
                title="Xuất file Word (.docx) khổ A4 font Times New Roman lề 1.5 - 2 cm chuẩn hành chính"
              >
                <FileText className="w-4 h-4 text-blue-400" />
                Xuất Word Chuẩn (.DOCX)
              </button>

              <button
                onClick={handlePrintPDF}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
              >
                <Printer className="w-4 h-4" />
                In / PDF Ngang
              </button>
            </div>
          </div>

          {/* Report Editable Spreadsheet Grid */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-900 text-slate-300 font-semibold border-b border-slate-800">
                {isType3 ? (
                  /* 17-column Header for Phụ lục III */
                  <>
                    <tr>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-center w-10">STT</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[180px]">Tên Dự Án</th>
                      <th colSpan={3} className="p-1.5 border-r border-slate-800 text-center bg-slate-900/90">Địa Điểm Thực Hiện</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[140px]">Tọa Độ Trọng Tâm</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[140px]">Chủ Đầu Tư</th>
                      <th colSpan={3} className="p-1.5 border-r border-slate-800 text-center bg-emerald-950/40 text-emerald-300">
                        Diện Tích Duyệt (ha)
                      </th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-right min-w-[110px]">DT Dự Án (ha)</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-right min-w-[120px] bg-amber-950/30 text-amber-300">
                        Dự Toán Duyệt (đồng)
                      </th>
                      <th colSpan={3} className="p-1.5 border-r border-slate-800 text-center bg-sky-950/40 text-sky-300">
                        Thực Hiện Trong Kỳ (ha)
                      </th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-right min-w-[120px]">
                        Giá Trị Thực Hiện (đồng)
                      </th>
                      <th rowSpan={2} className="p-2 text-center w-20">Chi Tiết</th>
                    </tr>
                    <tr className="border-t border-slate-800 text-[11px]">
                      <th className="p-1.5 border-r border-slate-800">Xã</th>
                      <th className="p-1.5 border-r border-slate-800">Huyện</th>
                      <th className="p-1.5 border-r border-slate-800">Tỉnh</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Trên cạn</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Dưới nước</th>
                      <th className="p-1.5 border-r border-slate-800 text-right font-bold text-emerald-400">Tổng cộng</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Trên cạn</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Dưới nước</th>
                      <th className="p-1.5 border-r border-slate-800 text-right font-bold text-sky-400">Tổng cộng</th>
                    </tr>
                  </>
                ) : (
                  /* 16-column Header for Phụ lục I & Phụ lục II */
                  <>
                    <tr>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-center w-10">STT</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[200px]">Tên Dự Án</th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-800 text-center bg-slate-900/90">Địa Điểm</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[150px]">Chủ Đầu Tư</th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-800 text-center bg-emerald-950/40 text-emerald-300">
                        DT Duyệt (ha)
                      </th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-right min-w-[120px] bg-amber-950/30 text-amber-300">
                        Dự Toán Duyệt (đồng)
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-800 text-center bg-sky-950/40 text-sky-300">
                        {isType1 ? 'DT Giám Sát Kỳ (ha)' : 'DT Khảo Sát Kỳ (ha)'}
                      </th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 text-right min-w-[120px]">
                        Giá Trị Thực Hiện (Triệu đồng)
                      </th>
                      <th colSpan={2} className="p-1.5 border-r border-slate-800 text-center bg-purple-950/40 text-purple-300">
                        Bom Mìn Thu Gom
                      </th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[130px]">Địa Điểm Xử Lý</th>
                      <th rowSpan={2} className="p-2 border-r border-slate-800 min-w-[130px]">Đơn Vị Phối Hợp</th>
                      <th rowSpan={2} className="p-2 text-center w-20">Chi Tiết</th>
                    </tr>
                    <tr className="border-t border-slate-800 text-[11px]">
                      <th className="p-1.5 border-r border-slate-800">Huyện</th>
                      <th className="p-1.5 border-r border-slate-800">Tỉnh</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Trên cạn</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Dưới nước</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Trên cạn</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Dưới nước</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Số quả/viên</th>
                      <th className="p-1.5 border-r border-slate-800 text-right">Trọng lượng (kg)</th>
                    </tr>
                  </>
                )}
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono text-slate-200">
                {/* Render Group 1 */}
                <tr className="bg-slate-900/90 font-bold text-sky-300 text-xs">
                  <td colSpan={isType3 ? 17 : 16} className="p-2.5 px-3 uppercase tracking-wider">
                    {isType1
                      ? 'A. CÔNG TÁC GIÁM SÁT THI CÔNG — I. CẤP QUÂN KHU GIAO NHIỆM VỤ'
                      : isType2
                      ? 'A. CÔNG TÁC KHẢO SÁT, LẬP PHƯƠNG ÁN — I. CẤP QUÂN KHU GIAO NHIỆM VỤ'
                      : 'C. CÔNG TÁC THI CÔNG — I. CẤP QUÂN KHU, BỘ TƯ LỆNH GIAO NHIỆM VỤ'}
                  </td>
                </tr>
                {group1Items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2 text-center border-r border-slate-800 text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-sans font-semibold text-slate-100 border-r border-slate-800">
                      {item.projectName}
                    </td>
                    {isType3 && <td className="p-2 font-sans border-r border-slate-800">{item.commune || '--'}</td>}
                    <td className="p-2 font-sans border-r border-slate-800">{item.district}</td>
                    <td className="p-2 font-sans border-r border-slate-800">{item.province}</td>
                    {isType3 && <td className="p-2 font-mono text-[11px] text-slate-400 border-r border-slate-800">{item.coordinatesCenter}</td>}
                    <td className="p-2 font-sans border-r border-slate-800 text-slate-300">{item.investor}</td>
                    
                    <td className="p-2 text-right border-r border-slate-800">{item.approvedLandAreaHa.toFixed(3)}</td>
                    <td className="p-2 text-right border-r border-slate-800">{item.approvedWaterAreaHa.toFixed(3)}</td>
                    {isType3 && (
                      <td className="p-2 text-right font-bold text-emerald-400 border-r border-slate-800">
                        {item.totalApprovedAreaHa.toFixed(3)}
                      </td>
                    )}
                    {isType3 && (
                      <td className="p-2 text-right text-slate-300 border-r border-slate-800">
                        {(item.totalProjectAreaHa || item.totalApprovedAreaHa).toFixed(3)}
                      </td>
                    )}
                    
                    <td className="p-2 text-right text-amber-300 border-r border-slate-800">
                      {formatVND(item.approvedBudgetVnd)}
                    </td>

                    <td className="p-2 text-right border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          step="0.001"
                          value={item.periodExecutedLandAreaHa}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedLandAreaHa', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-right font-mono"
                        />
                      ) : (
                        item.periodExecutedLandAreaHa.toFixed(3)
                      )}
                    </td>
                    <td className="p-2 text-right border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          step="0.001"
                          value={item.periodExecutedWaterAreaHa}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedWaterAreaHa', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-right font-mono"
                        />
                      ) : (
                        item.periodExecutedWaterAreaHa.toFixed(3)
                      )}
                    </td>

                    {isType3 && (
                      <td className="p-2 text-right font-bold text-sky-400 border-r border-slate-800">
                        {item.totalPeriodExecutedAreaHa.toFixed(3)}
                      </td>
                    )}

                    <td className="p-2 text-right text-slate-100 border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          value={item.periodExecutedValueVnd}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedValueVnd', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-900 border border-amber-500 rounded px-1 py-0.5 text-right font-mono text-xs"
                        />
                      ) : (
                        isType3 ? formatVND(item.periodExecutedValueVnd) : (item.periodExecutedValueVnd / 1000000).toFixed(3)
                      )}
                    </td>

                    {!isType3 && (
                      <>
                        <td className="p-2 text-right text-purple-300 border-r border-slate-800">
                          {isEditingGrid ? (
                            <input
                              type="number"
                              value={item.uxoQuantityCount}
                              onChange={e => handleItemFieldChange(item.id, 'uxoQuantityCount', parseInt(e.target.value) || 0)}
                              className="w-14 bg-slate-900 border border-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          ) : (
                            item.uxoQuantityCount
                          )}
                        </td>
                        <td className="p-2 text-right text-purple-300 border-r border-slate-800">
                          {isEditingGrid ? (
                            <input
                              type="number"
                              step="0.1"
                              value={item.uxoWeightKg}
                              onChange={e => handleItemFieldChange(item.id, 'uxoWeightKg', parseFloat(e.target.value) || 0)}
                              className="w-14 bg-slate-900 border border-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          ) : (
                            item.uxoWeightKg.toFixed(1)
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-800 text-slate-300 font-sans">{item.disposalLocation}</td>
                        <td className="p-2 border-r border-slate-800 text-slate-300 font-sans">{item.coordinatingUnit}</td>
                      </>
                    )}

                    <td className="p-2 text-center font-sans">
                      <button
                        onClick={() => setShowDrillDownItem(item)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-[10px] font-semibold"
                      >
                        Truy xuất
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Render Group 2 */}
                <tr className="bg-slate-900/90 font-bold text-amber-300 text-xs">
                  <td colSpan={isType3 ? 17 : 16} className="p-2.5 px-3 uppercase tracking-wider">
                    {isType1
                      ? 'II. CẤP BỘ QUỐC PHÒNG GIAO NHIỆM VỤ'
                      : isType2
                      ? 'II. CẤP BỘ QUỐC PHÒNG GIAO NHIỆM VỤ'
                      : 'II. CẤP BỘ QUỐC PHÒNG PHÊ DUYỆT'}
                  </td>
                </tr>
                {group2Items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="p-2 text-center border-r border-slate-800 text-slate-500">{idx + 1}</td>
                    <td className="p-2 font-sans font-semibold text-slate-100 border-r border-slate-800">
                      {item.projectName}
                    </td>
                    {isType3 && <td className="p-2 font-sans border-r border-slate-800">{item.commune || '--'}</td>}
                    <td className="p-2 font-sans border-r border-slate-800">{item.district}</td>
                    <td className="p-2 font-sans border-r border-slate-800">{item.province}</td>
                    {isType3 && <td className="p-2 font-mono text-[11px] text-slate-400 border-r border-slate-800">{item.coordinatesCenter}</td>}
                    <td className="p-2 font-sans border-r border-slate-800 text-slate-300">{item.investor}</td>
                    
                    <td className="p-2 text-right border-r border-slate-800">{item.approvedLandAreaHa.toFixed(3)}</td>
                    <td className="p-2 text-right border-r border-slate-800">{item.approvedWaterAreaHa.toFixed(3)}</td>
                    {isType3 && (
                      <td className="p-2 text-right font-bold text-emerald-400 border-r border-slate-800">
                        {item.totalApprovedAreaHa.toFixed(3)}
                      </td>
                    )}
                    {isType3 && (
                      <td className="p-2 text-right text-slate-300 border-r border-slate-800">
                        {(item.totalProjectAreaHa || item.totalApprovedAreaHa).toFixed(3)}
                      </td>
                    )}
                    
                    <td className="p-2 text-right text-amber-300 border-r border-slate-800">
                      {formatVND(item.approvedBudgetVnd)}
                    </td>

                    <td className="p-2 text-right border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          step="0.001"
                          value={item.periodExecutedLandAreaHa}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedLandAreaHa', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-right font-mono"
                        />
                      ) : (
                        item.periodExecutedLandAreaHa.toFixed(3)
                      )}
                    </td>
                    <td className="p-2 text-right border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          step="0.001"
                          value={item.periodExecutedWaterAreaHa}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedWaterAreaHa', parseFloat(e.target.value) || 0)}
                          className="w-16 bg-slate-900 border border-sky-500 rounded px-1 py-0.5 text-right font-mono"
                        />
                      ) : (
                        item.periodExecutedWaterAreaHa.toFixed(3)
                      )}
                    </td>

                    {isType3 && (
                      <td className="p-2 text-right font-bold text-sky-400 border-r border-slate-800">
                        {item.totalPeriodExecutedAreaHa.toFixed(3)}
                      </td>
                    )}

                    <td className="p-2 text-right text-slate-100 border-r border-slate-800">
                      {isEditingGrid ? (
                        <input
                          type="number"
                          value={item.periodExecutedValueVnd}
                          onChange={e => handleItemFieldChange(item.id, 'periodExecutedValueVnd', parseFloat(e.target.value) || 0)}
                          className="w-24 bg-slate-900 border border-amber-500 rounded px-1 py-0.5 text-right font-mono text-xs"
                        />
                      ) : (
                        isType3 ? formatVND(item.periodExecutedValueVnd) : (item.periodExecutedValueVnd / 1000000).toFixed(3)
                      )}
                    </td>

                    {!isType3 && (
                      <>
                        <td className="p-2 text-right text-purple-300 border-r border-slate-800">
                          {isEditingGrid ? (
                            <input
                              type="number"
                              value={item.uxoQuantityCount}
                              onChange={e => handleItemFieldChange(item.id, 'uxoQuantityCount', parseInt(e.target.value) || 0)}
                              className="w-14 bg-slate-900 border border-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          ) : (
                            item.uxoQuantityCount
                          )}
                        </td>
                        <td className="p-2 text-right text-purple-300 border-r border-slate-800">
                          {isEditingGrid ? (
                            <input
                              type="number"
                              step="0.1"
                              value={item.uxoWeightKg}
                              onChange={e => handleItemFieldChange(item.id, 'uxoWeightKg', parseFloat(e.target.value) || 0)}
                              className="w-14 bg-slate-900 border border-purple-500 rounded px-1 py-0.5 text-right font-mono"
                            />
                          ) : (
                            item.uxoWeightKg.toFixed(1)
                          )}
                        </td>
                        <td className="p-2 border-r border-slate-800 text-slate-300 font-sans">{item.disposalLocation}</td>
                        <td className="p-2 border-r border-slate-800 text-slate-300 font-sans">{item.coordinatingUnit}</td>
                      </>
                    )}

                    <td className="p-2 text-center font-sans">
                      <button
                        onClick={() => setShowDrillDownItem(item)}
                        className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded text-[10px] font-semibold"
                      >
                        Truy xuất
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Formula Totals Row */}
                <tr className="bg-slate-900 font-bold border-t-2 border-slate-700 text-slate-100">
                  <td colSpan={isType3 ? 7 : 5} className="p-3 text-right uppercase tracking-wider font-sans border-r border-slate-800">
                    TỔNG CỘNG TOÀN BÁO CÁO:
                  </td>
                  <td className="p-3 text-right border-r border-slate-800">{grandTotalApprovedLand.toFixed(3)}</td>
                  <td className="p-3 text-right border-r border-slate-800">{grandTotalApprovedWater.toFixed(3)}</td>
                  {isType3 && (
                    <td className="p-3 text-right text-emerald-400 border-r border-slate-800 font-black">
                      {grandTotalApprovedArea.toFixed(3)} ha
                    </td>
                  )}
                  {isType3 && <td className="p-3 text-right border-r border-slate-800">--</td>}
                  <td className="p-3 text-right text-amber-300 border-r border-slate-800 font-black">
                    {formatVND(grandTotalApprovedBudget)}
                  </td>
                  <td className="p-3 text-right border-r border-slate-800">{grandTotalExecutedLand.toFixed(3)}</td>
                  <td className="p-3 text-right border-r border-slate-800">{grandTotalExecutedWater.toFixed(3)}</td>
                  {isType3 && (
                    <td className="p-3 text-right text-sky-400 border-r border-slate-800 font-black">
                      {grandTotalExecutedArea.toFixed(3)} ha
                    </td>
                  )}
                  <td className="p-3 text-right border-r border-slate-800 font-black">
                    {isType3 ? formatVND(grandTotalExecutedValue) : (grandTotalExecutedValue / 1000000).toFixed(3)}
                  </td>
                  {!isType3 && (
                    <>
                      <td className="p-3 text-right text-purple-300 border-r border-slate-800 font-bold">{grandTotalUxoCount}</td>
                      <td className="p-3 text-right text-purple-300 border-r border-slate-800 font-bold">{grandTotalUxoWeight.toFixed(1)}</td>
                      <td className="p-3 border-r border-slate-800">--</td>
                      <td className="p-3 border-r border-slate-800">--</td>
                    </>
                  )}
                  <td className="p-3"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footnote for Phụ lục II */}
          {isType2 && (
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-400 italic">
              <strong>Ghi chú:</strong> Diện tích được duyệt là diện tích tổng của dự án; diện tích thực hiện trong kỳ báo cáo là diện tích khảo sát thực tế của dự án, tỷ lệ từ 1% đến 5% tùy theo đặc điểm từng dự án.
            </div>
          )}
        </div>
      ) : null}

      {/* Drill Down Modal (5.6.7 Truy xuất ngược từ báo cáo) */}
      {showDrillDownItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-base">Truy Xuất Nguồn Gốc Số Liệu (5.6.7)</h3>
              </div>
              <button onClick={() => setShowDrillDownItem(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-sky-300 text-sm">{showDrillDownItem.projectName}</div>
                <div className="text-slate-400">Chủ đầu tư: <span className="text-slate-200">{showDrillDownItem.investor}</span></div>
                <div className="text-slate-400">Địa điểm: <span className="text-slate-200">{showDrillDownItem.commune}, {showDrillDownItem.district}, {showDrillDownItem.province}</span></div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-400">Nguồn hình thành dữ liệu chính thức:</h4>
                <div className="bg-slate-800/80 p-3 rounded-xl space-y-1 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-amber-400 font-semibold">1. Hồ sơ Thông báo thẩm định hiện hành:</span>
                    <span className="font-mono text-slate-300">
                      {showDrillDownItem.sourceAppraisalNoticeId ? 'TB-TD-158/TB-TĐ' : 'QĐ-88/QĐ-BTL'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Phê duyệt diện tích <strong>{showDrillDownItem.totalApprovedAreaHa.toFixed(3)} ha</strong> & Dự toán <strong>{formatVND(showDrillDownItem.approvedBudgetVnd)}</strong>.
                  </p>
                </div>

                <div className="bg-slate-800/80 p-3 rounded-xl space-y-1 border border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-semibold">2. Nhật ký công trường & Hồ sơ thu gom:</span>
                    <span className="font-mono text-slate-300">Biên bản thu gom nổ hủy v3.2</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Thu gom <strong>{showDrillDownItem.uxoQuantityCount} quả/viên</strong> ({showDrillDownItem.uxoWeightKg} kg) tại {showDrillDownItem.disposalLocation}.
                  </p>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowDrillDownItem(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-base">Khởi Tạo Báo Cáo Quý Mới</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Loại Phụ Lục Báo Cáo</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-medium"
                >
                  <option value="phu_luc_3_thi_cong">Phụ lục III - Báo cáo kết quả thi công RPBM</option>
                  <option value="phu_luc_1_giam_sat">Phụ lục I - Báo cáo kết quả giám sát thi công</option>
                  <option value="phu_luc_2_khao_sat">Phụ lục II - Báo cáo kết quả khảo sát & lập PAKTTC</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Quý Báo Cáo</label>
                  <select
                    value={quarter}
                    onChange={e => setQuarter(Number(e.target.value) as any)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  >
                    <option value={1}>Quý I</option>
                    <option value={2}>Quý II</option>
                    <option value={3}>Quý III</option>
                    <option value={4}>Quý IV</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Năm</label>
                  <input
                    type="number"
                    value={year}
                    onChange={e => setYear(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số Báo Cáo</label>
                <input
                  type="text"
                  value={reportNumber}
                  onChange={e => setReportNumber(e.target.value)}
                  placeholder="VD: 45/BC-TĐ"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  onClick={handleAutoGenerateReport}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  Tổng Hợp Dữ Liệu & Tạo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
