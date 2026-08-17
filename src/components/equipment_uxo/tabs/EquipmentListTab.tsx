import React, { useState } from 'react';
import { UXOEquipment, UXOEquipmentCategory } from '../../../types';
import {
  OFFICIAL_EQUIPMENT_GROUPS,
  isOtherEquipmentGroup,
  getEquipmentGroupLabel
} from '../../../utils/equipmentConstants';
import {
  Search,
  Plus,
  QrCode,
  ShieldCheck,
  Wrench,
  Send,
  Edit,
  Trash2,
  MapPin,
  FileText,
  FileSpreadsheet,
  Printer,
  CheckSquare,
  Square,
  X,
  Paperclip,
  Download
} from 'lucide-react';

interface Props {
  equipmentList: UXOEquipment[];
  onOpenEquipmentModal: (equipment?: UXOEquipment) => void;
  onOpenQRScannerModal: (equipment?: UXOEquipment) => void;
  onOpenCalibrationModal: (equipment: UXOEquipment) => void;
  onOpenMaintenanceModal: (equipment: UXOEquipment) => void;
  onOpenDispatchModal: (equipment: UXOEquipment) => void;
  onDeleteEquipment: (id: string) => void;
}

export const EquipmentListTab: React.FC<Props> = ({
  equipmentList,
  onOpenEquipmentModal,
  onOpenQRScannerModal,
  onOpenCalibrationModal,
  onOpenMaintenanceModal,
  onOpenDispatchModal,
  onDeleteEquipment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [pdfScanPreviewUrl, setPdfScanPreviewUrl] = useState<{ url: string; name: string } | null>(null);

  // Filter equipment
  const filtered = equipmentList.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.registrationNo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.currentLocation || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.specificCategoryDescription || '').toLowerCase().includes(searchTerm.toLowerCase());

    const itemCatClean = (item.category || '').toLowerCase();
    const matchesCategory =
      selectedCategory === 'all' ||
      itemCatClean === selectedCategory ||
      (selectedCategory === 'may_do_bom' && (itemCatClean === 'may_do_bom' || itemCatClean === 'may_do_bom_min')) ||
      (selectedCategory === 'may_do_min' && (itemCatClean === 'may_do_min' || itemCatClean === 'may_do_bom_min')) ||
      (selectedCategory === 'gps' && itemCatClean === 'gps') ||
      (selectedCategory === 'dung_cu_khac' && isOtherEquipmentGroup(itemCatClean));

    return matchesSearch && matchesCategory;
  });

  // Checkbox handlers
  const isAllSelected = filtered.length > 0 && filtered.every(item => selectedIds.includes(item.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(item => item.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
  };

  // Selected Equipment Items for Export
  const selectedEquipmentList = equipmentList.filter(e => selectedIds.includes(e.id));
  const exportItems = selectedEquipmentList.length > 0 ? selectedEquipmentList : filtered;

  // Export to Excel CSV (UTF-8 BOM for Vietnamese compatibility)
  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Nhóm thiết bị',
      'Tên thiết bị',
      'Nhà sản xuất',
      'Model',
      'Công suất',
      'Năm sản xuất',
      'Tính năng',
      'Xuất xứ',
      'Số đăng ký/đăng kiểm',
      'Địa điểm',
      'Tình trạng huy động',
      'Nguồn thiết bị'
    ];

    const rows = exportItems.map((item, index) => [
      index + 1,
      `"${getEquipmentGroupLabel(item.category, item.specificCategoryDescription).replace(/"/g, '""')}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${(item.brand || '-').replace(/"/g, '""')}"`,
      `"${(item.model || '-').replace(/"/g, '""')}"`,
      `"${(item.power || '-').replace(/"/g, '""')}"`,
      item.manufactureYear || '-',
      `"${(item.features || '-').replace(/"/g, '""')}"`,
      `"${(item.origin || 'Việt Nam').replace(/"/g, '""')}"`,
      `"${(item.registrationNo || '-').replace(/"/g, '""')}"`,
      `"${(item.currentLocation || 'Hà Nội').replace(/"/g, '""')}"`,
      `"${(item.deploymentStatus || 'Sẵn sàng huy động khi thi công').replace(/"/g, '""')}"`,
      `"${(item.equipmentSource || 'Sở hữu của nhà thầu').replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Danh_sach_Trang_thiet_bi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Selection Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm theo Tên thiết bị, Nhà sản xuất, Model, Địa điểm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tất cả Nhóm thiết bị</option>
              {OFFICIAL_EQUIPMENT_GROUPS.map(grp => (
                <option key={grp.value} value={grp.value}>{grp.label}</option>
              ))}
            </select>

            <button
              onClick={() => onOpenEquipmentModal()}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/10 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Thêm thiết bị mới
            </button>
          </div>
        </div>

        {/* Multi-Select Action Bar (Requirement E) */}
        <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">Đã chọn:</span>
              <strong className="text-amber-400 font-mono font-bold">{selectedIds.length}</strong>
              <span className="text-slate-500">/ {filtered.length} thiết bị</span>
            </div>

            <button
              onClick={handleSelectAll}
              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 text-[11px] font-semibold transition-colors"
            >
              {isAllSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
            </button>

            {selectedIds.length > 0 && (
              <button
                onClick={handleDeselectAll}
                className="px-2.5 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 text-[11px] font-semibold transition-colors"
              >
                Xóa lựa chọn
              </button>
            )}
          </div>

          <button
            onClick={() => setExportModalOpen(true)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/10 transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" /> Xuất danh sách thiết bị đã chọn ({selectedIds.length > 0 ? selectedIds.length : filtered.length})
          </button>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Nhóm & Tên thiết bị</th>
                <th className="py-3.5 px-4">Nhà sản xuất & Model</th>
                <th className="py-3.5 px-4">Thông số kỹ thuật</th>
                <th className="py-3.5 px-4">Địa điểm & Hiện trạng</th>
                <th className="py-3.5 px-4">Nguồn thiết bị</th>
                <th className="py-3.5 px-4 text-center">File Scan PDF</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const isSelected = selectedIds.includes(item.id);
                  const catLabel = getEquipmentGroupLabel(item.category, item.specificCategoryDescription);
                  const scanFile = item.scanFile || (item.scanFileUrl ? {
                    fileName: item.scanFileName || 'Scan_Thiet_Bi.pdf',
                    fileUrl: item.scanFileUrl,
                    fileSize: item.scanFileSize || '1.2 MB'
                  } : null);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isSelected ? 'bg-amber-500/5' : ''}`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-3 text-center align-middle">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                      </td>

                      {/* Name & Category */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-100 text-xs">{item.name}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 mt-1">
                          {catLabel}
                        </span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">Mã: {item.assetCode}</div>
                      </td>

                      {/* Brand & Model */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-200">{item.brand || '-'}</div>
                        <div className="text-slate-400 text-[11px]">Model: {item.model || '-'}</div>
                        <div className="text-slate-500 text-[10px]">Xuất xứ: {item.origin || 'Việt Nam'}</div>
                      </td>

                      {/* Tech Specifications */}
                      <td className="py-3.5 px-4 align-top space-y-0.5">
                        <div className="text-slate-300 text-[11px]">
                          Công suất: <strong className="text-slate-100 font-mono">{item.power || '-'}</strong>
                        </div>
                        <div className="text-slate-400 text-[11px]">Năm SX: {item.manufactureYear || '-'}</div>
                        <div className="text-slate-400 text-[11px] font-mono">Đăng kiểm: {item.registrationNo || 'Không có'}</div>
                      </td>

                      {/* Location & Mobilization Status */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-200 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          {item.currentLocation || 'Hà Nội'}
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          {item.deploymentStatus || 'Sẵn sàng huy động khi thi công'}
                        </div>
                      </td>

                      {/* Equipment Source */}
                      <td className="py-3.5 px-4 align-top font-semibold text-slate-300 text-[11px]">
                        {item.equipmentSource || 'Sở hữu của nhà thầu'}
                      </td>

                      {/* Scan File Attachment */}
                      <td className="py-3.5 px-4 align-top text-center">
                        {scanFile ? (
                          <button
                            onClick={() => setPdfScanPreviewUrl({ url: scanFile.fileUrl, name: scanFile.fileName })}
                            className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-bold rounded-lg border border-emerald-500/30 inline-flex items-center gap-1 transition-colors"
                          >
                            <Paperclip className="w-3 h-3" /> Xem File PDF
                          </button>
                        ) : (
                          <span className="text-slate-600 italic text-[10px]">Chưa có scan</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onOpenEquipmentModal(item)}
                            title="Sửa trang thiết bị"
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => onDeleteEquipment(item.id)}
                            title="Xóa trang thiết bị"
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    Không tìm thấy trang thiết bị nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Table Modal (Requirement E) */}
      {exportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl my-6 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    Bảng Xuất Danh sách Trang thiết bị ({exportItems.length} thiết bị)
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedIds.length > 0
                      ? `Đã chọn ${selectedIds.length} thiết bị cụ thể từ danh sách`
                      : 'Hiển thị tất cả các thiết bị theo bộ lọc hiện tại'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Download className="w-4 h-4" /> Xuất file Excel (.CSV)
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Printer className="w-4 h-4" /> In / Xuất PDF
                </button>

                <button
                  onClick={() => setExportModalOpen(false)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors ml-2"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Export Printable Table Area */}
            <div className="p-6 overflow-y-auto flex-1 bg-slate-950 space-y-4">
              <div className="text-center space-y-1 mb-4 print:block">
                <h2 className="text-base font-black text-slate-100 uppercase tracking-wide">
                  DANH SÁCH TRANG THIẾT BỊ DỤNG CỤ
                </h2>
                <p className="text-xs text-slate-400 font-mono">
                  Ngày xuất: {new Date().toLocaleDateString('vi-VN')} | Tổng số: {exportItems.length} thiết bị
                </p>
              </div>

              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left text-xs text-slate-200 border-collapse">
                  <thead className="bg-slate-900 text-slate-300 font-bold border-b border-slate-800 text-[11px] uppercase">
                    <tr>
                      <th className="p-2.5 border-r border-slate-800 text-center w-10">STT</th>
                      <th className="p-2.5 border-r border-slate-800">Nhóm thiết bị</th>
                      <th className="p-2.5 border-r border-slate-800">Tên thiết bị</th>
                      <th className="p-2.5 border-r border-slate-800">Nhà sản xuất</th>
                      <th className="p-2.5 border-r border-slate-800">Model</th>
                      <th className="p-2.5 border-r border-slate-800">Công suất</th>
                      <th className="p-2.5 border-r border-slate-800 text-center">Năm SX</th>
                      <th className="p-2.5 border-r border-slate-800">Tính năng</th>
                      <th className="p-2.5 border-r border-slate-800">Xuất xứ</th>
                      <th className="p-2.5 border-r border-slate-800">Số ĐK/Đăng kiểm</th>
                      <th className="p-2.5 border-r border-slate-800">Địa điểm</th>
                      <th className="p-2.5 border-r border-slate-800">Tình trạng huy động</th>
                      <th className="p-2.5">Nguồn thiết bị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-[11px] font-sans">
                    {exportItems.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-900/50">
                        <td className="p-2.5 border-r border-slate-800 text-center font-mono font-bold text-amber-400">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 border-r border-slate-800 font-semibold text-slate-300">
                          {getEquipmentGroupLabel(item.category, item.specificCategoryDescription)}
                        </td>
                        <td className="p-2.5 border-r border-slate-800 font-bold text-slate-100">
                          {item.name}
                        </td>
                        <td className="p-2.5 border-r border-slate-800">{item.brand || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800 font-mono">{item.model || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800 font-mono">{item.power || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800 text-center font-mono">{item.manufactureYear || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800 max-w-[150px] truncate">{item.features || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800">{item.origin || 'Việt Nam'}</td>
                        <td className="p-2.5 border-r border-slate-800 font-mono">{item.registrationNo || '-'}</td>
                        <td className="p-2.5 border-r border-slate-800">{item.currentLocation || 'Hà Nội'}</td>
                        <td className="p-2.5 border-r border-slate-800 text-emerald-400 font-semibold">
                          {item.deploymentStatus || 'Sẵn sàng huy động khi thi công'}
                        </td>
                        <td className="p-2.5 font-semibold text-slate-300">
                          {item.equipmentSource || 'Sở hữu của nhà thầu'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end gap-3 shrink-0">
              <button
                onClick={() => setExportModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF View Modal */}
      {pdfScanPreviewUrl && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> File Scan: {pdfScanPreviewUrl.name}
              </h4>
              <button
                onClick={() => setPdfScanPreviewUrl(null)}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col items-center justify-center">
              <iframe
                src={pdfScanPreviewUrl.url}
                className="w-full h-full rounded-lg border border-slate-800 bg-white"
                title="PDF Scan Viewer"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
