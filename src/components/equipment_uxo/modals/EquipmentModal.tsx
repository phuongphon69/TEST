import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, Save, Box, Layers, Calendar, MapPin, FileText, Upload, Eye, Download, Trash2, Paperclip, CheckCircle2, AlertCircle } from 'lucide-react';
import { UXOEquipment, UXOEquipmentCategory, UXOEquipmentScanFile } from '../../../types';
import {
  OFFICIAL_EQUIPMENT_GROUPS,
  isOtherEquipmentGroup,
  getEquipmentGroupLabel
} from '../../../utils/equipmentConstants';

interface Props {
  equipment: UXOEquipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipment: UXOEquipment) => void;
}

export const EquipmentModal: React.FC<Props> = ({
  equipment,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<UXOEquipment>>({
    assetCode: '',
    qrCode: '',
    name: '',
    category: 'may_do_bom',
    specificCategoryDescription: '',
    brand: '',
    model: '',
    power: '',
    manufactureYear: new Date().getFullYear(),
    features: '',
    origin: 'Việt Nam',
    registrationNo: '',
    currentLocation: 'Hà Nội',
    deploymentStatus: 'Sẵn sàng huy động khi thi công',
    equipmentSource: 'Sở hữu của nhà thầu',
    scanFile: undefined,
    notes: ''
  });

  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  const [uploadStatus, setUploadStatus] = useState<string>('');

  useEffect(() => {
    if (equipment) {
      setFormData({
        ...equipment,
        category: equipment.category || 'may_do_bom',
        specificCategoryDescription: equipment.specificCategoryDescription || '',
        currentLocation: equipment.currentLocation || 'Hà Nội',
        deploymentStatus: equipment.deploymentStatus || 'Sẵn sàng huy động khi thi công',
        equipmentSource: equipment.equipmentSource || 'Sở hữu của nhà thầu',
        scanFile: equipment.scanFile || (equipment.scanFileUrl ? {
          fileUrl: equipment.scanFileUrl,
          fileName: equipment.scanFileName || 'File_Scan_Thiet_Bi.pdf',
          fileSize: equipment.scanFileSize || '1.2 MB',
          uploadedAt: equipment.scanFileUploadedAt || new Date().toISOString().split('T')[0]
        } : undefined)
      });
    } else {
      const randomNum = Math.floor(100 + Math.random() * 900);
      setFormData({
        assetCode: `TB-${randomNum}`,
        qrCode: `QR-TB-${randomNum}`,
        name: '',
        category: 'may_do_bom',
        specificCategoryDescription: '',
        brand: '',
        model: '',
        power: '',
        manufactureYear: new Date().getFullYear(),
        features: '',
        origin: 'Việt Nam',
        registrationNo: '',
        currentLocation: 'Hà Nội',
        deploymentStatus: 'Sẵn sàng huy động khi thi công',
        equipmentSource: 'Sở hữu của nhà thầu',
        scanFile: undefined,
        notes: ''
      });
    }
    setUploadStatus('');
  }, [equipment, isOpen]);

  if (!isOpen) return null;

  // Handle PDF scan file attachment
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      alert('Vui lòng chọn file định dạng PDF!');
      return;
    }

    setUploadStatus('Đang tải file...');
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
      const newScanFile: UXOEquipmentScanFile = {
        fileName: file.name,
        fileUrl: result,
        fileSize: `${sizeMb} MB`,
        uploadedAt: new Date().toISOString().split('T')[0]
      };

      setFormData(prev => ({
        ...prev,
        scanFile: newScanFile,
        scanFileUrl: result,
        scanFileName: file.name,
        scanFileSize: `${sizeMb} MB`,
        scanFileUploadedAt: newScanFile.uploadedAt
      }));
      setUploadStatus('Tải file thành công!');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    if (confirm('Bạn có chắc chắn muốn xóa file scan đính kèm này?')) {
      setFormData(prev => ({
        ...prev,
        scanFile: undefined,
        scanFileUrl: undefined,
        scanFileName: undefined,
        scanFileSize: undefined,
        scanFileUploadedAt: undefined
      }));
      setUploadStatus('Đã xóa file đính kèm.');
    }
  };

  const handleDownloadFile = () => {
    if (!formData.scanFile?.fileUrl) return;
    const a = document.createElement('a');
    a.href = formData.scanFile.fileUrl;
    a.download = formData.scanFile.fileName || 'Scan_Thiet_Bi.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Vui lòng nhập Tên thiết bị!');
      return;
    }

    if (isOtherEquipmentGroup(formData.category) && !formData.specificCategoryDescription?.trim()) {
      alert('❌ Yêu cầu nhập Mô tả loại cụ thể khi lựa chọn nhóm "Dụng cụ chuyên dụng khác"!');
      return;
    }

    const payload: UXOEquipment = {
      id: equipment?.id || `eq-${Date.now()}`,
      assetCode: formData.assetCode || `TB-${Math.floor(Math.random() * 1000)}`,
      qrCode: formData.qrCode || `QR-${formData.assetCode}`,
      name: formData.name || '',
      category: (formData.category as UXOEquipmentCategory) || 'dung_cu_khac',
      specificCategoryDescription: isOtherEquipmentGroup(formData.category)
        ? formData.specificCategoryDescription?.trim()
        : undefined,
      brand: formData.brand || '',
      model: formData.model || '',
      power: formData.power || '',
      manufactureYear: Number(formData.manufactureYear) || new Date().getFullYear(),
      features: formData.features || '',
      origin: formData.origin || '',
      registrationNo: formData.registrationNo || '',
      
      // B. Hiện trạng
      currentLocation: formData.currentLocation || 'Hà Nội',
      deploymentStatus: formData.deploymentStatus || 'Sẵn sàng huy động khi thi công',
      equipmentSource: formData.equipmentSource || 'Sở hữu của nhà thầu',

      // D. File Scan PDF
      scanFile: formData.scanFile,
      scanFileUrl: formData.scanFile?.fileUrl,
      scanFileName: formData.scanFile?.fileName,
      scanFileSize: formData.scanFile?.fileSize,
      scanFileUploadedAt: formData.scanFile?.uploadedAt,

      // Kế thừa các lịch sử sẵn có nếu có
      serialNumber: formData.serialNumber || '',
      calibrationHistory: formData.calibrationHistory || [],
      maintenanceHistory: formData.maintenanceHistory || [],
      dispatchHistory: formData.dispatchHistory || [],
      createdAt: formData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Box className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {equipment ? `Cập nhật Trang thiết bị: ${equipment.name}` : 'Thêm Trang thiết bị mới'}
              </h3>
              <p className="text-xs text-slate-400">
                Nhập đầy đủ Thông tin thiết bị, Hiện trạng và đính kèm File scan PDF
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* SECTION A: THÔNG TIN THIẾT BỊ */}
          <div className="space-y-3">
            <h4 className="font-bold text-amber-400 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <Layers className="w-4 h-4" /> A. THÔNG TIN THIẾT BỊ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {/* 1. Nhóm thiết bị */}
              <div className="sm:col-span-2 md:col-span-1">
                <label className="block font-semibold text-slate-300 mb-1">
                  1. Nhóm thiết bị <span className="text-rose-400">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({
                    ...formData,
                    category: e.target.value as UXOEquipmentCategory
                  })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  {OFFICIAL_EQUIPMENT_GROUPS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                  {/* Preserve existing legacy category value if present */}
                  {formData.category && !OFFICIAL_EQUIPMENT_GROUPS.some(g => g.value === formData.category) && (
                    <option value={formData.category}>
                      {getEquipmentGroupLabel(formData.category)}
                    </option>
                  )}
                </select>
              </div>

              {/* Mô tả loại cụ thể (Required only if "Dụng cụ chuyên dụng khác" is selected) */}
              {isOtherEquipmentGroup(formData.category) && (
                <div className="sm:col-span-2 md:col-span-2">
                  <label className="block font-semibold text-amber-300 mb-1 flex items-center gap-1">
                    Mô tả loại cụ thể <span className="text-rose-400">*</span>
                    <span className="text-[10px] text-slate-400 font-normal">(Bắt buộc cho Dụng cụ chuyên dụng khác)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.specificCategoryDescription || ''}
                    onChange={e => setFormData({ ...formData, specificCategoryDescription: e.target.value })}
                    placeholder="Nhập mô tả cụ thể về loại dụng cụ chuyên dụng này..."
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-lg px-3 py-2 text-slate-100 font-medium focus:outline-none focus:border-amber-400 placeholder-slate-600"
                    required
                  />
                </div>
              )}

              {/* Tên thiết bị */}
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">
                  2.1. Tên thiết bị <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nhập tên thiết bị (Ví dụ: Máy dò mìn rà phá Vallon F3)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              {/* Tên nhà sản xuất */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.2. Tên nhà sản xuất</label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={e => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Nhập hãng / nhà sản xuất..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Đời máy / model */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.3. Đời máy / Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={e => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Nhập model / phiên bản..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Công suất */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.4. Công suất</label>
                <input
                  type="text"
                  value={formData.power}
                  onChange={e => setFormData({ ...formData, power: e.target.value })}
                  placeholder="Ví dụ: 12V - 50W, 2.5 kW..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Năm sản xuất */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.5. Năm sản xuất</label>
                <input
                  type="number"
                  value={formData.manufactureYear}
                  onChange={e => setFormData({ ...formData, manufactureYear: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Xuất xứ */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.7. Xuất xứ</label>
                <input
                  type="text"
                  value={formData.origin}
                  onChange={e => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Việt Nam / Đức / Nhật / Mỹ..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Số đăng ký / đăng kiểm, nếu có */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">2.8. Số đăng ký / đăng kiểm (nếu có)</label>
                <input
                  type="text"
                  value={formData.registrationNo}
                  onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                  placeholder="Nhập số đăng ký hoặc GCN đăng kiểm..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tính năng */}
              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-300 mb-1">2.6. Tính năng thiết bị</label>
                <textarea
                  rows={2}
                  value={formData.features}
                  onChange={e => setFormData({ ...formData, features: e.target.value })}
                  placeholder="Mô tả tính năng chuyên dụng (Ví dụ: Dò từ trường phát hiện bom sâu 6m, định vị GPS RTK độ chính xác milimet...)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* SECTION B: HIỆN TRẠNG */}
          <div className="space-y-3">
            <h4 className="font-bold text-sky-400 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <MapPin className="w-4 h-4" /> B. HIỆN TRẠNG THIẾT BỊ
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 1. Địa điểm hiện tại */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  1. Địa điểm hiện tại của thiết bị
                </label>
                <input
                  type="text"
                  value={formData.currentLocation}
                  onChange={e => setFormData({ ...formData, currentLocation: e.target.value })}
                  placeholder="Mặc định: Hà Nội"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Mặc định: Hà Nội (cho phép chỉnh sửa)</p>
              </div>

              {/* 2. Tình hình huy động, sử dụng */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  2. Tình hình huy động, sử dụng hiện tại
                </label>
                <input
                  type="text"
                  value={formData.deploymentStatus}
                  onChange={e => setFormData({ ...formData, deploymentStatus: e.target.value })}
                  placeholder="Mặc định: Sẵn sàng huy động khi thi công"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Mặc định: Sẵn sàng huy động khi thi công</p>
              </div>

              {/* 3. Nguồn thiết bị */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  3. Nguồn thiết bị
                </label>
                <input
                  type="text"
                  value={formData.equipmentSource}
                  onChange={e => setFormData({ ...formData, equipmentSource: e.target.value })}
                  placeholder="Mặc định: Sở hữu của nhà thầu"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-sky-500"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Mặc định: Sở hữu của nhà thầu</p>
              </div>
            </div>
          </div>

          {/* SECTION D: FILE SCAN */}
          <div className="space-y-3">
            <h4 className="font-bold text-emerald-400 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" /> D. ĐÍNH KÈM FILE SCAN PDF
            </h4>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              {formData.scanFile ? (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-slate-900 rounded-lg border border-emerald-500/30 gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-100 text-xs flex items-center gap-2">
                        {formData.scanFile.fileName}
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded">
                          PDF Scan
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                        Dung lượng: {formData.scanFile.fileSize || 'N/A'} | Ngày tải: {formData.scanFile.uploadedAt || 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Actions for uploaded file */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPdfPreviewModal({
                        isOpen: true,
                        url: formData.scanFile?.fileUrl || '',
                        title: `File Scan: ${formData.scanFile?.fileName}`
                      })}
                      className="px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem
                    </button>

                    <button
                      type="button"
                      onClick={handleDownloadFile}
                      className="px-2.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" /> Tải xuống
                    </button>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-lg border border-rose-500/30 flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Xóa
                    </button>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl p-6 text-center transition-colors">
                  <Upload className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">
                    Tải lên file scan tài liệu/đăng kiểm PDF cho thiết bị
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Chấp nhận định dạng file .PDF (Dung lượng tối đa 25MB)
                  </p>

                  <label className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 cursor-pointer transition-colors">
                    <Paperclip className="w-4 h-4 text-amber-400" /> Chọn file PDF từ máy tính
                    <input
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {uploadStatus && (
                <div className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {uploadStatus}
                </div>
              )}
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" /> Lưu Thiết bị
            </button>
          </div>
        </form>
      </div>

      {/* PDF View Modal */}
      {pdfPreviewModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 backdrop-blur-md p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="bg-slate-950 px-5 py-3 border-b border-slate-800 flex justify-between items-center shrink-0">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> {pdfPreviewModal.title}
              </h4>
              <button
                onClick={() => setPdfPreviewModal({ isOpen: false, url: '', title: '' })}
                className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 bg-slate-950 p-2 overflow-hidden flex flex-col items-center justify-center">
              {pdfPreviewModal.url ? (
                <iframe
                  src={pdfPreviewModal.url}
                  className="w-full h-full rounded-lg border border-slate-800 bg-white"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-slate-500 text-xs">Không có dữ liệu file scan đính kèm.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
