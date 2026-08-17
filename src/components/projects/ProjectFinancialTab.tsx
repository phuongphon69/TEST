import React, { useState } from 'react';
import { Project, ProjectFinancialInstallment } from '../../types';
import { formatVND, formatDateVN, FINANCIAL_INSTALLMENT_TYPE_MAP } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Receipt,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Clock
} from 'lucide-react';

interface Props {
  project: Project;
  onUpdateFinancials: (updatedFields: Partial<Project>) => void;
}

export const ProjectFinancialTab: React.FC<Props> = ({ project, onUpdateFinancials }) => {
  const [showInstallmentModal, setShowInstallmentModal] = useState<boolean>(false);
  const [editingInstallment, setEditingInstallment] = useState<ProjectFinancialInstallment | null>(null);

  const installments = project.financialInstallments || [];

  const contractVal = project.contractValue || project.budgetVnd || 0;
  const advanceVal = project.advancePaid || 0;
  const executedVal = project.executedValue || 0;
  const acceptedVal = project.acceptedValue || 0;
  const requestedVal = project.requestedPaymentValue || 0;
  const paidVal = project.paidValue || 0;
  const remainingVal = Math.max(0, contractVal - paidVal);
  const debtVal = Math.max(0, acceptedVal - paidVal);
  const disbursementRate = contractVal > 0 ? Math.round((paidVal / contractVal) * 100) : 0;

  const handleSaveInstallment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInstallment) return;

    let updatedInstallments: ProjectFinancialInstallment[];
    const exists = installments.some(i => i.id === editingInstallment.id);

    if (exists) {
      updatedInstallments = installments.map(i => (i.id === editingInstallment.id ? editingInstallment : i));
    } else {
      updatedInstallments = [...installments, editingInstallment];
    }

    // Recalculate totals
    let newPaid = 0;
    let newAdvance = 0;
    let newAccepted = 0;

    updatedInstallments.forEach(inst => {
      if (inst.status === 'da_thuc_hien') {
        if (inst.type === 'thanh_toan' || inst.type === 'tam_ung') newPaid += inst.amount;
        if (inst.type === 'tam_ung') newAdvance += inst.amount;
        if (inst.type === 'nghiem_thu') newAccepted += inst.amount;
      }
    });

    onUpdateFinancials({
      financialInstallments: updatedInstallments,
      paidValue: newPaid > 0 ? newPaid : paidVal,
      advancePaid: newAdvance > 0 ? newAdvance : advanceVal,
      acceptedValue: newAccepted > 0 ? newAccepted : acceptedVal
    });

    setShowInstallmentModal(false);
    setEditingInstallment(null);
  };

  const handleDeleteInstallment = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa đợt thanh toán này?')) {
      const updated = installments.filter(i => i.id !== id);
      onUpdateFinancials({ financialInstallments: updated });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-emerald-400" />
            7.4 Quản lý Giá trị & Đợt Thanh toán Dự án
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi chi tiết giá trị hợp đồng, nghiệm thu, thanh toán, giải ngân, công nợ và bảo hành.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingInstallment({
              id: `inst-${Date.now()}`,
              installmentName: `Thanh toán Đợt ${installments.length + 1}`,
              type: 'thanh_toan',
              amount: 500000000,
              date: new Date().toISOString().split('T')[0],
              documentRef: `CT-TT/${project.code}`,
              status: 'da_thuc_hien',
              notes: 'Thanh toán khối lượng hoàn thành'
            });
            setShowInstallmentModal(true);
          }}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-lg flex items-center gap-2 transition-colors shadow-sm shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm đợt thanh toán
        </button>
      </div>

      {/* Financial Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Giá trị hợp đồng</div>
          <div className="text-lg font-bold text-amber-400 font-mono">{formatVND(contractVal)}</div>
          <div className="text-[11px] text-slate-500">
            Nguồn vốn: <span className="text-slate-300 font-medium">{project.capitalSource || 'NSNN'}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Giá trị nghiệm thu</div>
          <div className="text-lg font-bold text-sky-400 font-mono">{formatVND(acceptedVal)}</div>
          <div className="text-[11px] text-slate-500">
            KL thực hiện: <span className="text-slate-300 font-medium">{formatVND(executedVal)}</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Đã thanh toán (Giải ngân)</div>
          <div className="text-lg font-bold text-emerald-400 font-mono">{formatVND(paidVal)}</div>
          <div className="text-[11px] text-slate-500">
            Tỷ lệ giải ngân: <span className="text-emerald-400 font-bold">{disbursementRate}%</span>
          </div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Còn lại / Công nợ</div>
          <div className="text-lg font-bold text-rose-400 font-mono">{formatVND(remainingVal)}</div>
          <div className="text-[11px] text-slate-500">
            Công nợ chủ đầu tư: <span className="text-rose-300 font-bold">{formatVND(debtVal)}</span>
          </div>
        </div>
      </div>

      {/* Progress & Breakdown Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Chi tiết các chỉ số tài chính dự án
          </h4>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Giá trị tạm ứng:</span>
              <span className="font-mono font-bold text-indigo-300">{formatVND(advanceVal)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Giá trị đề nghị thanh toán:</span>
              <span className="font-mono font-bold text-amber-300">{formatVND(requestedVal)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Giá trị phát sinh:</span>
              <span className="font-mono font-medium text-slate-300">{formatVND(project.incurredValue || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Giá trị điều chỉnh HĐ:</span>
              <span className="font-mono font-medium text-slate-300">{formatVND(project.adjustedValue || 0)}</span>
            </div>
            <div className="flex justify-between items-center p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-slate-400">Thời hạn bảo hành:</span>
              <span className="font-medium text-emerald-400">{project.warrantyPeriod || '12 tháng'}</span>
            </div>
          </div>
        </div>

        {/* Disbursement Chart / Progress bar */}
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
          <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
            <Receipt className="w-4 h-4 text-amber-400" />
            Tiến độ giải ngân dòng tiền
          </h4>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between text-slate-300 mb-1 font-mono">
                <span>Tỷ lệ đã giải ngân</span>
                <span className="font-bold text-emerald-400">{disbursementRate}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                <div
                  className="bg-emerald-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, disbursementRate)}%` }}
                ></div>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2 text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng hợp đồng:</span>
                <span className="font-mono font-bold text-slate-200">{formatVND(contractVal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Đã thanh toán thực tế:</span>
                <span className="font-mono font-bold text-emerald-400">{formatVND(paidVal)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                <span className="text-slate-400">Kế hoạch thu hồi vốn còn lại:</span>
                <span className="font-mono text-rose-400">{formatVND(remainingVal)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Installments Table */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 overflow-x-auto">
        <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-slate-800 pb-3">
          <CreditCard className="w-4 h-4 text-sky-400" />
          Bảng chi tiết các đợt tạm ứng, nghiệm thu & thanh toán
        </h4>

        {installments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            Chưa có đợt thanh toán nào được ghi nhận. Bấm "Thêm đợt thanh toán" để khởi tạo.
          </div>
        ) : (
          <table className="w-full text-left text-xs text-slate-300 min-w-[700px]">
            <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Tên đợt thanh toán</th>
                <th className="p-3">Loại giao dịch</th>
                <th className="p-3">Số tiền (VNĐ)</th>
                <th className="p-3">Ngày thực hiện</th>
                <th className="p-3">Chứng từ / Căn cứ</th>
                <th className="p-3">Trạng thái</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {installments.map((inst, idx) => (
                <tr key={inst.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-200">{inst.installmentName}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {FINANCIAL_INSTALLMENT_TYPE_MAP[inst.type] || inst.type}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{formatVND(inst.amount)}</td>
                  <td className="p-3 font-mono text-slate-400">{formatDateVN(inst.date)}</td>
                  <td className="p-3 font-mono text-slate-300">{inst.documentRef || '--'}</td>
                  <td className="p-3">
                    {inst.status === 'da_thuc_hien' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                        Đã thực hiện
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        Chờ duyệt
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingInstallment(inst);
                        setShowInstallmentModal(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteInstallment(inst.id)} className="text-rose-400 hover:text-rose-300 p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Installment Form Modal */}
      {showInstallmentModal && editingInstallment && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4">
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Cập nhật đợt thanh toán tài chính
            </h4>

            <form onSubmit={handleSaveInstallment} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tên đợt thanh toán (*)</label>
                <input
                  type="text"
                  required
                  value={editingInstallment.installmentName}
                  onChange={e => setEditingInstallment({ ...editingInstallment, installmentName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Loại giao dịch (*)</label>
                  <select
                    value={editingInstallment.type}
                    onChange={e => setEditingInstallment({ ...editingInstallment, type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="tam_ung">Tạm ứng</option>
                    <option value="nghiem_thu">Nghiệm thu khối lượng</option>
                    <option value="thanh_toan">Thanh toán</option>
                    <option value="thu_hoi_tam_ung">Thu hồi tạm ứng</option>
                    <option value="quyet_toan">Quyết toán</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Số tiền (VNĐ) (*)</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000000"
                    value={editingInstallment.amount}
                    onChange={e => setEditingInstallment({ ...editingInstallment, amount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ngày thực hiện (*)</label>
                  <input
                    type="date"
                    required
                    value={editingInstallment.date}
                    onChange={e => setEditingInstallment({ ...editingInstallment, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Trạng thái (*)</label>
                  <select
                    value={editingInstallment.status}
                    onChange={e => setEditingInstallment({ ...editingInstallment, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="da_thuc_hien">Đã thực hiện</option>
                    <option value="cho_duyet">Chờ duyệt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chứng từ / Căn cứ pháp lý</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Phụ lục HĐ số 01, Biên bản NT khối lượng đợt 1..."
                  value={editingInstallment.documentRef || ''}
                  onChange={e => setEditingInstallment({ ...editingInstallment, documentRef: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowInstallmentModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                >
                  Lưu giao dịch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
