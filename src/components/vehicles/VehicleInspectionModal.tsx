import React, { useState } from 'react';
import { ShieldCheck, Calendar, FileText, Building2, AlertTriangle, DollarSign, X, CheckCircle2 } from 'lucide-react';
import { Vehicle, VehicleInspectionRecord } from '../../types';
import { formatDateVN } from '../../utils/formatters';

interface Props {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSave: (record: Omit<VehicleInspectionRecord, 'id' | 'vehicleId' | 'roundNumber' | 'createdAt'>) => void;
}

export const VehicleInspectionModal: React.FC<Props> = ({
  vehicle,
  isOpen,
  onClose,
  onSave
}) => {
  const nextRoundNumber = (vehicle.inspectionHistory?.length || 0) + 1;

  const [formData, setFormData] = useState({
    inspectionDate: new Date().toISOString().split('T')[0],
    expiryDate: '',
    certificateNo: '',
    providerUnit: vehicle.inspectionUnit || 'Trung tâm Đăng kiểm Xe Cơ giới Quân sự',
    result: 'dat' as 'dat' | 'can_khac_phuc' | 'khong_dat',
    costVnd: 500000,
    scanFileUrl: '',
    notes: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.expiryDate || !formData.certificateNo) {
      alert('Vui lòng nhập Ngày hết hạn và Số giấy chứng nhận đăng kiểm!');
      return;
    }

    onSave({
      inspectionDate: formData.inspectionDate,
      expiryDate: formData.expiryDate,
      certificateNo: formData.certificateNo,
      providerUnit: formData.providerUnit,
      result: formData.result,
      costVnd: Number(formData.costVnd) || 0,
      scanFileUrl: formData.scanFileUrl,
      notes: formData.notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Cập nhật Đợt Đăng kiểm Mới (Đợt {nextRoundNumber})
              </h3>
              <p className="text-xs text-slate-400">
                Xe: <span className="font-mono font-bold text-amber-400">{vehicle.licensePlate}</span> - {vehicle.brand} {vehicle.model} ({vehicle.code})
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

        {/* Info Banner */}
        <div className="bg-amber-950/20 border-b border-amber-500/20 px-6 py-2.5 text-xs text-amber-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-amber-400" />
          <span>Hệ thống ghi lại lịch sử đăng kiểm theo từng đợt riêng biệt, <strong>không ghi đè</strong> thông tin các đợt kiểm định cũ.</span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Số đợt đăng kiểm
              </label>
              <input
                type="text"
                disabled
                value={`Đợt ${nextRoundNumber} (Tự động tính)`}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-2 text-slate-400 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Kết quả kiểm định <span className="text-rose-400">*</span>
              </label>
              <select
                value={formData.result}
                onChange={e => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
              >
                <option value="dat">✓ ĐẠT - Đủ điều kiện lưu hành</option>
                <option value="can_khac_phuc">⚠ Cần khắc phục / Sửa chữa nhỏ</option>
                <option value="khong_dat">✗ KHÔNG ĐẠT - Yêu cầu kiểm định lại</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ngày thực hiện đăng kiểm <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Ngày hết hạn đăng kiểm đợt này <span className="text-rose-400">*</span>
              </label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono text-amber-400 font-bold"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Số giấy chứng nhận đăng kiểm <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.certificateNo}
                onChange={e => setFormData({ ...formData, certificateNo: e.target.value })}
                placeholder="Ví dụ: KC-8912304/2026"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Đơn vị thực hiện đăng kiểm <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={formData.providerUnit}
                onChange={e => setFormData({ ...formData, providerUnit: e.target.value })}
                placeholder="Tên trung tâm / đơn vị đăng kiểm"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                Chi phí đăng kiểm (VND)
              </label>
              <input
                type="number"
                step="10000"
                value={formData.costVnd}
                onChange={e => setFormData({ ...formData, costVnd: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">
                File scan giấy chứng nhận đăng kiểm (URL/Path)
              </label>
              <input
                type="text"
                value={formData.scanFileUrl}
                onChange={e => setFormData({ ...formData, scanFileUrl: e.target.value })}
                placeholder="https://... hoặc /files/gcn-dang-kiem.pdf"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">
              Ghi chú đợt đăng kiểm
            </label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú về tình trạng kỹ thuật, đề xuất thay thế khí tài / phụ tùng nếu có..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Form Actions */}
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
              <ShieldCheck className="w-4 h-4" /> Lưu Đợt Đăng kiểm Mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
