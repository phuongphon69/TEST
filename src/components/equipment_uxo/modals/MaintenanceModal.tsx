import React, { useState } from 'react';
import { Wrench, X, Save, Clock, DollarSign, FileText } from 'lucide-react';
import { UXOEquipment, UXOMaintenanceRecord } from '../../../types';

interface Props {
  equipment: UXOEquipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipmentId: string, record: Omit<UXOMaintenanceRecord, 'id' | 'equipmentId' | 'createdAt'>) => void;
}

export const MaintenanceModal: React.FC<Props> = ({
  equipment,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    maintenanceDate: new Date().toISOString().split('T')[0],
    content: '',
    providerUnit: 'Xưởng Kỹ thuật Binh chủng Công binh',
    replacedParts: '',
    costVnd: 2000000,
    result: 'hoan_thanh' as 'hoan_thanh' | 'cho_linh_kien' | 'khong_dat',
    downtimeHours: 24,
    nextMaintenanceDate: '',
    protocolFileUrl: '',
    notes: ''
  });

  if (!isOpen || !equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content) {
      alert('Vui lòng nhập Nội dung bảo trì / sửa chữa!');
      return;
    }

    onSave(equipment.id, {
      maintenanceDate: formData.maintenanceDate,
      content: formData.content,
      providerUnit: formData.providerUnit,
      replacedParts: formData.replacedParts,
      costVnd: Number(formData.costVnd) || 0,
      result: formData.result,
      downtimeHours: Number(formData.downtimeHours) || 0,
      nextMaintenanceDate: formData.nextMaintenanceDate,
      protocolFileUrl: formData.protocolFileUrl,
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
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Ghi Nhật ký Bảo trì & Sửa chữa (Mục 10.2)
              </h3>
              <p className="text-xs text-slate-400">
                Thiết bị: <strong className="text-amber-400">[{equipment.assetCode}] {equipment.name}</strong>
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
              <label className="block font-semibold text-slate-300 mb-1">Ngày bảo trì / sửa chữa <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={formData.maintenanceDate}
                onChange={e => setFormData({ ...formData, maintenanceDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Đơn vị thực hiện bảo trì</label>
              <input
                type="text"
                value={formData.providerUnit}
                onChange={e => setFormData({ ...formData, providerUnit: e.target.value })}
                placeholder="Xưởng Kỹ thuật..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Nội dung bảo trì / sửa chữa <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={formData.content}
                onChange={e => setFormData({ ...formData, content: e.target.value })}
                placeholder="Ví dụ: Thay cuộn cáp từ dò bom, hiệu chỉnh độ nhạy mạch khuếch đại..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-amber-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Danh mục linh kiện thay thế</label>
              <input
                type="text"
                value={formData.replacedParts}
                onChange={e => setFormData({ ...formData, replacedParts: e.target.value })}
                placeholder="Ví dụ: Cáp tín hiệu Vallon XC, 02 Pin sạc Lithium 7.4V..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Chi phí bảo trì / linh kiện (VND)</label>
              <input
                type="number"
                value={formData.costVnd}
                onChange={e => setFormData({ ...formData, costVnd: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Thời gian dừng hoạt động (Giờ)</label>
              <input
                type="number"
                value={formData.downtimeHours}
                onChange={e => setFormData({ ...formData, downtimeHours: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Kết quả bảo trì</label>
              <select
                value={formData.result}
                onChange={e => setFormData({ ...formData, result: e.target.value as any })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-bold focus:outline-none focus:border-amber-500"
              >
                <option value="hoan_thanh">✓ Hoàn thành - Hoạt động tốt</option>
                <option value="cho_linh_kien">⏳ Chờ linh kiện thay thế</option>
                <option value="khong_dat">✗ Không khôi phục được - Hỏng</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Lần bảo trì kế tiếp dự kiến</label>
              <input
                type="date"
                value={formData.nextMaintenanceDate}
                onChange={e => setFormData({ ...formData, nextMaintenanceDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">File Biên bản nghiệm thu bảo trì (URL)</label>
              <input
                type="text"
                value={formData.protocolFileUrl}
                onChange={e => setFormData({ ...formData, protocolFileUrl: e.target.value })}
                placeholder="https://... PDF biên bản nghiệm thu"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Ghi chú bổ sung</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú thêm về quy trình bảo dưỡng..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
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
              className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Save className="w-4 h-4" /> Lưu Nhật Ký Bảo Trì
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
