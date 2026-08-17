import React, { useState } from 'react';
import { Send, X, Save, User, Calendar, MapPin, CheckCircle2, FileText } from 'lucide-react';
import { UXOEquipment, UXODispatchRecord } from '../../../types';

interface Props {
  equipment: UXOEquipment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (equipmentId: string, record: Omit<UXODispatchRecord, 'id' | 'equipmentId' | 'createdAt'>) => void;
}

export const DispatchReturnModal: React.FC<Props> = ({
  equipment,
  isOpen,
  onClose,
  onSave
}) => {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 3);

  const [formData, setFormData] = useState({
    receiverName: '',
    projectName: equipment?.currentProject || 'Dự án Rà phá Bom mìn Vật nổ tồn đọng Quảng Trị',
    issueDate: new Date().toISOString().split('T')[0],
    issueCondition: 'Máy hoạt động hoàn hảo, đầy đủ phụ kiện & bộ nạp pin',
    expectedReturnDate: nextMonth.toISOString().split('T')[0],
    actualReturnDate: '',
    returnCondition: '',
    handoverDocUrl: '',
    approverName: 'Thượng tá Trần Quốc Việt',
    status: 'dang_muon' as 'dang_muon' | 'da_tra' | 'qua_han',
    notes: ''
  });

  if (!isOpen || !equipment) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiverName || !formData.projectName || !formData.expectedReturnDate) {
      alert('Vui lòng nhập Người nhận, Dự án và Ngày dự kiến trả!');
      return;
    }

    onSave(equipment.id, {
      receiverName: formData.receiverName,
      projectName: formData.projectName,
      issueDate: formData.issueDate,
      issueCondition: formData.issueCondition,
      expectedReturnDate: formData.expectedReturnDate,
      actualReturnDate: formData.actualReturnDate || undefined,
      returnCondition: formData.returnCondition || undefined,
      handoverDocUrl: formData.handoverDocUrl,
      approverName: formData.approverName,
      status: formData.status,
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
            <div className="p-2 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Send className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Tạo Phiếu Cấp phát Thiết bị (Mục 10.3)
              </h3>
              <p className="text-xs text-slate-400">
                Giao thiết bị cho công trường / dự án: <strong className="text-sky-400">[{equipment.assetCode}] {equipment.name}</strong>
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
              <label className="block font-semibold text-slate-300 mb-1">Họ tên người nhận thiết bị <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={formData.receiverName}
                onChange={e => setFormData({ ...formData, receiverName: e.target.value })}
                placeholder="Đội trưởng Lê Minh Đức..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sky-300 font-bold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Cán bộ phê duyệt bàn giao</label>
              <input
                type="text"
                value={formData.approverName}
                onChange={e => setFormData({ ...formData, approverName: e.target.value })}
                placeholder="Thượng tá Trần Quốc Việt..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Dự án / Công trường nhận thiết bị <span className="text-rose-400">*</span></label>
              <input
                type="text"
                value={formData.projectName}
                onChange={e => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="Dự án Khảo sát & Rà phá mìn Quảng Trị..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày bàn giao <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={formData.issueDate}
                onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-300 mb-1">Ngày dự kiến hoàn trả <span className="text-rose-400">*</span></label>
              <input
                type="date"
                value={formData.expectedReturnDate}
                onChange={e => setFormData({ ...formData, expectedReturnDate: e.target.value })}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">Tình trạng kỹ thuật khi bàn giao</label>
              <input
                type="text"
                value={formData.issueCondition}
                onChange={e => setFormData({ ...formData, issueCondition: e.target.value })}
                placeholder="Mô tả tình trạng cuộn dây, nút bấm, pin sạc..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-300 mb-1">File Biên bản bàn giao (URL)</label>
              <input
                type="text"
                value={formData.handoverDocUrl}
                onChange={e => setFormData({ ...formData, handoverDocUrl: e.target.value })}
                placeholder="https://... PDF biên bản bàn giao"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-300 mb-1">Ghi chú cấp phát</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ghi chú điều kiện vận chuyển, phụ kiện đi kèm..."
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
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
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-lg shadow-sky-500/20 transition-all"
            >
              <Save className="w-4 h-4" /> Xác Nhận Cấp Phát
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
