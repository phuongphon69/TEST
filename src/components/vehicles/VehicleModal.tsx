import React, { useState, useEffect } from 'react';
import { Truck, X, Save, ShieldCheck, FileText, User, Upload, Eye, Trash2, Paperclip } from 'lucide-react';
import { Vehicle, VehicleScanFile } from '../../types';

interface Props {
  vehicle: Vehicle | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (vehicle: Vehicle) => void;
}

export const VehicleModal: React.FC<Props> = ({
  vehicle,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    code: '',
    licensePlate: '',
    vehicleType: 'Bán tải chuyên dụng',
    brand: '',
    model: '',
    manufactureYear: new Date().getFullYear(),
    chassisNumber: '',
    engineNumber: '',
    color: 'Xanh Quân sự',
    managingUnit: '',
    managerName: '',
    frequentDriverName: '',
    registrationNo: '',
    registrationDate: '',
    registrationFileUrl: '',
    registrationFile: undefined,
    currentInspectionCertNo: '',
    lastInspectionDate: '',
    nextInspectionExpiryDate: '',
    inspectionUnit: '',
    inspectionFileUrl: '',
    inspectionFile: undefined,
    inspectionHistory: []
  });

  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  useEffect(() => {
    if (vehicle) {
      setFormData({
        ...vehicle,
        registrationFile: vehicle.registrationFile || (vehicle.registrationFileUrl ? {
          fileName: 'File scan Đăng ký xe.pdf',
          fileUrl: vehicle.registrationFileUrl,
          fileSize: '1.2 MB',
          uploadedAt: vehicle.registrationDate || 'N/A'
        } : undefined),
        inspectionFile: vehicle.inspectionFile || (vehicle.inspectionFileUrl ? {
          fileName: 'File scan Đăng kiểm xe.pdf',
          fileUrl: vehicle.inspectionFileUrl,
          fileSize: '1.5 MB',
          uploadedAt: vehicle.lastInspectionDate || 'N/A'
        } : undefined)
      });
    } else {
      setFormData({
        code: `XE-RPBM-${Math.floor(10 + Math.random() * 90)}`,
        licensePlate: '80A-',
        vehicleType: 'Bán tải chuyên dụng RPBM',
        brand: 'Toyota',
        model: 'Hilux 4x4',
        manufactureYear: 2023,
        chassisNumber: '',
        engineNumber: '',
        color: 'Xanh Quân sự',
        managingUnit: 'Tiểu đoàn Rà phá Bom mìn 1',
        managerName: '',
        frequentDriverName: '',
        registrationNo: '',
        registrationDate: '',
        registrationFileUrl: '',
        registrationFile: undefined,
        currentInspectionCertNo: '',
        lastInspectionDate: '',
        nextInspectionExpiryDate: '',
        inspectionUnit: 'Trung tâm Đăng kiểm Khí tài Quân sự 83',
        inspectionFileUrl: '',
        inspectionFile: undefined,
        inspectionHistory: []
      });
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldKey: 'registrationFile' | 'inspectionFile',
    urlKey: 'registrationFileUrl' | 'inspectionFileUrl'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
      : `${(file.size / 1024).toFixed(0)} KB`;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const uploadedFileMeta: VehicleScanFile = {
        fileName: file.name,
        fileUrl: dataUrl,
        fileSize: sizeFormatted,
        uploadedAt: new Date().toISOString().split('T')[0] + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setFormData(prev => ({
        ...prev,
        [fieldKey]: uploadedFileMeta,
        [urlKey]: dataUrl
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = (
    fieldKey: 'registrationFile' | 'inspectionFile',
    urlKey: 'registrationFileUrl' | 'inspectionFileUrl'
  ) => {
    setFormData(prev => ({
      ...prev,
      [fieldKey]: undefined,
      [urlKey]: ''
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code || !formData.licensePlate) {
      alert('Vui lòng nhập Mã xe và Biển số đăng ký!');
      return;
    }

    const { checkDuplicateVehiclePlate, validateExpiryAfterIssueDate } = require('../../utils/validationRules');
    if (checkDuplicateVehiclePlate(formData.licensePlate, vehicle?.id)) {
      alert(`❌ Cảnh báo dữ liệu: Biển số xe "${formData.licensePlate}" đã tồn tại trên hệ thống! Không cho phép nhập trùng biển số.`);
      return;
    }

    if (formData.lastInspectionDate && formData.nextInspectionExpiryDate) {
      const checkDate = validateExpiryAfterIssueDate(formData.lastInspectionDate, formData.nextInspectionExpiryDate);
      if (!checkDate.isValid) {
        alert(`❌ Cảnh báo ngày đăng kiểm: ${checkDate.error}`);
        return;
      }
    }

    const payload: Vehicle = {
      id: vehicle?.id || `veh-${Date.now()}`,
      code: formData.code || '',
      licensePlate: formData.licensePlate || '',
      vehicleType: formData.vehicleType || 'Khác',
      brand: formData.brand || '',
      model: formData.model || '',
      manufactureYear: Number(formData.manufactureYear) || new Date().getFullYear(),
      chassisNumber: formData.chassisNumber || '',
      engineNumber: formData.engineNumber || '',
      color: formData.color || '',
      managingUnit: formData.managingUnit || '',
      managerName: formData.managerName || '',
      frequentDriverName: formData.frequentDriverName || '',
      registrationNo: formData.registrationNo || '',
      registrationDate: formData.registrationDate || '',
      registrationFileUrl: formData.registrationFileUrl || formData.registrationFile?.fileUrl || '',
      registrationFile: formData.registrationFile,
      currentInspectionCertNo: formData.currentInspectionCertNo || '',
      lastInspectionDate: formData.lastInspectionDate || '',
      nextInspectionExpiryDate: formData.nextInspectionExpiryDate || '',
      inspectionUnit: formData.inspectionUnit || '',
      inspectionFileUrl: formData.inspectionFileUrl || formData.inspectionFile?.fileUrl || '',
      inspectionFile: formData.inspectionFile,
      // Preserve existing legacy properties if present on vehicle to avoid data loss
      insuranceExpiryDate: vehicle?.insuranceExpiryDate,
      insuranceFileUrl: vehicle?.insuranceFileUrl,
      currentOdometerKm: vehicle?.currentOdometerKm,
      maintenanceIntervalKm: vehicle?.maintenanceIntervalKm,
      lastMaintenanceDate: vehicle?.lastMaintenanceDate,
      nextMaintenanceDate: vehicle?.nextMaintenanceDate,
      status: vehicle?.status || 'hoat_dong',
      notes: vehicle?.notes,
      inspectionHistory: formData.inspectionHistory || []
    };

    onSave(payload);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-6">
          {/* Header */}
          <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">
                  {vehicle ? `Cập nhật Hồ sơ Xe: ${vehicle.licensePlate}` : 'Thêm mới Xe ô tô vào Hệ thống'}
                </h3>
                <p className="text-xs text-slate-400">
                  Nhập thông tin nhận dạng, đơn vị quản lý, giấy đăng ký xe & giấy đăng kiểm (đính kèm file scan PDF)
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
            {/* Section 1: Thông tin chung phương tiện */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <Truck className="w-4 h-4 text-amber-400" /> 1. Thông tin Nhận dạng & Thông số Kỹ thuật
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Mã xe <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="Ví dụ: XE-RPBM-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Biển số đăng ký <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    value={formData.licensePlate}
                    onChange={e => setFormData({ ...formData, licensePlate: e.target.value })}
                    placeholder="Ví dụ: 80A-024.68"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Loại xe</label>
                  <input
                    type="text"
                    value={formData.vehicleType}
                    onChange={e => setFormData({ ...formData, vehicleType: e.target.value })}
                    placeholder="Bán tải / Xe tải / Xe chỉ huy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nhãn hiệu</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Toyota / Ford / Isuzu / Mitsubishi"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Model / Phiên bản</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder="Ranger Wildtrak / Hilux 4x4"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Năm sản xuất</label>
                  <input
                    type="number"
                    value={formData.manufactureYear}
                    onChange={e => setFormData({ ...formData, manufactureYear: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Số khung (VIN)</label>
                  <input
                    type="text"
                    value={formData.chassisNumber}
                    onChange={e => setFormData({ ...formData, chassisNumber: e.target.value })}
                    placeholder="Nhập số khung ghi trên đăng ký"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Số máy</label>
                  <input
                    type="text"
                    value={formData.engineNumber}
                    onChange={e => setFormData({ ...formData, engineNumber: e.target.value })}
                    placeholder="Nhập số máy"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Màu sơn</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={e => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Xanh Quân sự / Cát / Trắng"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Quản lý & Sử dụng */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <User className="w-4 h-4 text-sky-400" /> 2. Đơn vị Quản lý
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div className="sm:col-span-3">
                  <label className="block font-semibold text-slate-300 mb-1">Đơn vị quản lý trực tiếp</label>
                  <input
                    type="text"
                    value={formData.managingUnit}
                    onChange={e => setFormData({ ...formData, managingUnit: e.target.value })}
                    placeholder="Tên tiểu đoàn / Đội thi công"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Giấy Đăng ký xe (Cà vẹt) */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <FileText className="w-4 h-4 text-emerald-400" /> 3. Giấy Đăng ký Xe (Cà vẹt)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Số đăng ký xe</label>
                  <input
                    type="text"
                    value={formData.registrationNo}
                    onChange={e => setFormData({ ...formData, registrationNo: e.target.value })}
                    placeholder="Số chứng nhận cà vẹt xe"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ngày cấp đăng ký</label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={e => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Đính kèm File Scan Đăng ký xe */}
                <div className="sm:col-span-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-semibold text-slate-300">
                    File scan đăng ký xe (PDF / Ảnh)
                  </label>

                  {formData.registrationFile || formData.registrationFileUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 font-mono text-xs">
                            {formData.registrationFile?.fileName || 'Scan_Dang_Ky_Xe.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                            <span>Dung lượng: {formData.registrationFile?.fileSize || 'N/A'}</span>
                            <span>•</span>
                            <span>Tải lên: {formData.registrationFile?.uploadedAt || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = formData.registrationFile?.fileUrl || formData.registrationFileUrl || '';
                            const title = `File scan Đăng ký xe: ${formData.licensePlate || ''}`;
                            setPdfPreviewModal({ isOpen: true, url, title });
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs rounded-lg border border-emerald-500/40 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem PDF / Scan
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile('registrationFile', 'registrationFileUrl')}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors"
                          title="Xóa file scan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors group">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-400 mb-1 transition-colors" />
                      <span className="text-slate-300 font-semibold text-xs">Bấm để chọn file scan đính kèm (PDF, JPG, PNG)</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Hệ thống lưu trữ metadata fileName, fileSize, uploadedAt</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => handleFileUpload(e, 'registrationFile', 'registrationFileUrl')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Section 4: Đăng kiểm Hiện tại */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2 border-b border-slate-800 pb-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> 4. Thông tin Đăng kiểm Hiện tại
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Số GCN đăng kiểm</label>
                  <input
                    type="text"
                    value={formData.currentInspectionCertNo}
                    onChange={e => setFormData({ ...formData, currentInspectionCertNo: e.target.value })}
                    placeholder="Số sổ / GCN"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ngày đăng kiểm gần nhất</label>
                  <input
                    type="date"
                    value={formData.lastInspectionDate}
                    onChange={e => setFormData({ ...formData, lastInspectionDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Ngày hết hạn đăng kiểm</label>
                  <input
                    type="date"
                    value={formData.nextInspectionExpiryDate}
                    onChange={e => setFormData({ ...formData, nextInspectionExpiryDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-bold font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Đơn vị thực hiện đăng kiểm</label>
                  <input
                    type="text"
                    value={formData.inspectionUnit}
                    onChange={e => setFormData({ ...formData, inspectionUnit: e.target.value })}
                    placeholder="Trung tâm đăng kiểm"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Đính kèm File Scan Giấy Đăng Kiểm */}
                <div className="sm:col-span-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                  <label className="block font-semibold text-slate-300">
                    File scan đăng kiểm (PDF / Ảnh)
                  </label>

                  {formData.inspectionFile || formData.inspectionFileUrl ? (
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-200 font-mono text-xs">
                            {formData.inspectionFile?.fileName || 'Scan_Dang_Kiem_Xe.pdf'}
                          </div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-2 font-mono">
                            <span>Dung lượng: {formData.inspectionFile?.fileSize || 'N/A'}</span>
                            <span>•</span>
                            <span>Tải lên: {formData.inspectionFile?.uploadedAt || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const url = formData.inspectionFile?.fileUrl || formData.inspectionFileUrl || '';
                            const title = `File scan Đăng kiểm xe: ${formData.licensePlate || ''}`;
                            setPdfPreviewModal({ isOpen: true, url, title });
                          }}
                          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs rounded-lg border border-amber-500/40 flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem PDF / Scan
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveFile('inspectionFile', 'inspectionFileUrl')}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg border border-rose-500/30 transition-colors"
                          title="Xóa file scan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer bg-slate-900/50 hover:bg-slate-900 transition-colors group">
                      <Upload className="w-6 h-6 text-slate-500 group-hover:text-amber-400 mb-1 transition-colors" />
                      <span className="text-slate-300 font-semibold text-xs">Bấm để chọn file scan đính kèm (PDF, JPG, PNG)</span>
                      <span className="text-[10px] text-slate-500 mt-0.5">Hệ thống lưu trữ metadata fileName, fileSize, uploadedAt</span>
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        onChange={e => handleFileUpload(e, 'inspectionFile', 'inspectionFileUrl')}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
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
                <Save className="w-4 h-4" /> Lưu Hồ sơ Xe
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* PDF / Scan Viewer Modal */}
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
                pdfPreviewModal.url.startsWith('data:application/pdf') || pdfPreviewModal.url.endsWith('.pdf') ? (
                  <iframe
                    src={pdfPreviewModal.url}
                    className="w-full h-full rounded-lg border border-slate-800 bg-white"
                    title="PDF Viewer"
                  />
                ) : pdfPreviewModal.url.startsWith('data:image/') || pdfPreviewModal.url.match(/\.(jpg|jpeg|png|webp|gif)$/i) ? (
                  <img
                    src={pdfPreviewModal.url}
                    alt="Scan Document"
                    className="max-w-full max-h-full object-contain rounded-lg"
                  />
                ) : (
                  <div className="text-center p-8 space-y-3">
                    <FileText className="w-12 h-12 text-slate-500 mx-auto" />
                    <p className="text-slate-300 font-semibold text-xs">Tài liệu đính kèm bên dưới:</p>
                    <a
                      href={pdfPreviewModal.url}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center gap-1.5"
                    >
                      Mở trong cửa sổ mới
                    </a>
                  </div>
                )
              ) : (
                <div className="text-slate-500 text-xs">Không có dữ liệu file scan đính kèm.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
