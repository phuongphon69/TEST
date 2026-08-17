import React, { useState } from 'react';
import { ShieldCheck, X, Save, FileText, Calendar, DollarSign, Building } from 'lucide-react';
import { UXOEquipment, UXOCalibrationRecord } from '../../../types';

interface Props {
  equipment: UXOEquipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipmentId: string, record: Omit<UXOCalibrationRecord, 'id' | 'equipmentId' | 'createdAt'>) => void;
}

export const CalibrationModal: React.FC<Props> = ({
  equipment,
  isOpen,
  onClose,
  onSave
}) => {
  const nextYear = new Date();
  nextYear.setFullYear(nextYear.getFullYear() + 1);

  const [formData, setFormData] = useState({
    roundCode: `HC-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`,
    inspectionDate: new Date().toISOString().split('T')[0],
    calibrationDate: new Date().toISOString().split('T')[0],
    expiryDate: nextYear.toISOString().split('T')[0],
    providerUnit: 'Trung tâm Kiểm định Chuẩn đo lường Quân sự BQP',
    certificateNo: `GCN-KĐ-${Math.floor(1000 + Math.random() * 9000)}/${new Date().getFullYear()}`,
    result: 'dat' as 'dat' | 'can_hieu_chinh' | 'khong_dat',
    certificateFileUrl: '',
    costVnd: 1500000,
    notes: ''
  });

  if (!isOpen || !equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.roundCode || !formData.expiryDate) {
      alert('Vui lòng nhập Mã đợt kiểm định và Ngày hết hạn!');
      return;
    }

    onSave(equipment.id, {
      roundCode: formData.roundCode,
      inspectionDate: formData.inspectionDate,
      calibrationDate: formData.calibrationDate,
      expiryDate: formData.expiryDate,
      providerUnit: formData.providerUnit,
      certificateNo: formData.certificateNo,
      result: formData.result,
      certificateFileUrl: formData.certificateFileUrl,
      costVnd: Number(formData.costVnd) || 0,
      notes: formData.notes
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0 my-6">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Tạo Đợt Kiểm định / Hiệu chuẩn mới (Mục 10.1)
              </h3>
              <p className="text-xs text-slate-400">
                Cập nhật kiểm định theo từng đợt cho thiết bị <strong className="text-amber-400">[{equipment.assetCode}] {equipment.name}</strong> (Lưu lịch sử, không ghi đè)
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-300 mb-1">Mã đợt kiểm định <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={formData.roundCode}
                onChange={e => setFormData({ ...formData, roundCode: e.target.value })}
                placeholder="HC-2025-01"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Số giấy chứng nhận</label>
              <input
                type="text"
                value={formData.certificateNo}
                onChange={e => setFormData({ ...formData, certificateNo: e.target.value })}
                placeholder="GCN-KĐ-8821/2025"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày kiểm định</label>
              <input
                type="date"
                value={formData.inspectionDate}
                onChange={e => setFormData({ ...formData, inspectionDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày hiệu chuẩn</label>
              <input
                type="date"
                value={formData.calibrationDate}
                onChange={e => setFormData({ ...formData, calibrationDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày hết hạn kiểm định <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={formData.expiryDate}
                onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kết quả kiểm định</label>
              <select
                value={formData.result}
                onChange={e => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-emerald-500"
              >
                <option value="dat">✓ Đạt chuẩn kỹ thuật</option>
                <option value="can_hieu_chinh">⚠️ Cần hiệu chỉnh lại</option>
                <option value="khong_dat">✗ Không đạt chuẩn</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Đơn vị thực hiện kiểm định / hiệu chuẩn</label>
              <input
                type="text"
                value={formData.providerUnit}
                onChange={e => setFormData({ ...formData, providerUnit: e.target.value })}
                placeholder="Trung tâm Kiểm định Chuẩn đo lường Quân sự BQP"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Chi phí kiểm định (VND)</label>
              <input
                type="number"
                value={formData.costVnd}
                onChange={e => setFormData({ ...formData, costVnd: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Link File scan chứng nhận (URL)</label>
              <input
                type="text"
                value={formData.certificateFileUrl}
                onChange={e => setFormData({ ...formData, certificateFileUrl: e.target.value })}
                placeholder="https://... PDF chứng nhận"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Ghi chú kiểm định</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú sai số đo đạc, điều kiện thử nghiệm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl border border-slate-700 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Save className="w-4 h-4" /> Lưu Đợt Kiểm Định
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
