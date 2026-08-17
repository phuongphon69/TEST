import React, { useState } from 'react';
import { UXOEquipment, UXODispatchRecord } from '../../../types';
import { Send, Plus, Search, Calendar, User, MapPin, CheckCircle2, AlertTriangle, ArrowLeftRight } from 'lucide-react';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  equipmentList: UXOEquipment[];
  onOpenDispatchModal: (equipment: UXOEquipment) => void;
  onReturnEquipment: (equipmentId: string, dispatchId: string, actualReturnDate: string, returnCondition: string) => void;
}

export const DispatchReturnTab: React.FC<Props> = ({
  equipmentList,
  onOpenDispatchModal,
  onReturnEquipment
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [returnModalData, setReturnModalData] = useState<{ equipmentId: string; dispatchId: string; equipmentName: string } | null>(null);
  const [actualReturnDate, setActualReturnDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnCondition, setReturnCondition] = useState('Máy nguyên vẹn, đã làm sạch cuộn dây, đầy đủ phụ kiện.');

  const allDispatches: Array<{
    equipment: UXOEquipment;
    record: UXODispatchRecord;
  }> = [];

  equipmentList.forEach(eq => {
    (eq.dispatchHistory || []).forEach(record => {
      allDispatches.push({ equipment: eq, record });
    });
  });

  allDispatches.sort((a, b) => new Date(b.record.issueDate).getTime() - new Date(a.record.issueDate).getTime());

  const filtered = allDispatches.filter(item => {
    const matchesSearch =
      item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.approverName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeLoansCount = allDispatches.filter(d => d.record.status === 'dang_muon').length;

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalData) return;
    onReturnEquipment(returnModalData.equipmentId, returnModalData.dispatchId, actualReturnDate, returnCondition);
    setReturnModalData(null);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900 border border-sky-500/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
            <Send className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Quản lý Cấp phát & Thu hồi Thiết bị RPBM (Mục 10.3)
            </h3>
            <p className="text-xs text-slate-300">
              Điều phối thiết bị dò bom mìn đến từng công trường dự án, theo dõi người nhận, ngày mượn/trả và tình trạng kỹ thuật.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">ĐANG CẤP PHÁT CHO DỰ ÁN:</span>
            <strong className="text-sky-400 text-sm font-mono font-bold">{activeLoansCount} thiết bị</strong>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">LỊCH SỬ BÀN GIAO:</span>
            <strong className="text-slate-200 text-sm font-mono font-bold">{allDispatches.length} lượt</strong>
          </div>
        </div>
      </div>

      {/* Filter & Action */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Người nhận, Dự án, Người phê duyệt, Thiết bị, Mã tài sản..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="dang_muon">⚡ Đang cấp phát</option>
            <option value="da_tra">✓ Đã thu hồi</option>
          </select>

          {equipmentList.length > 0 && (
            <button
              onClick={() => onOpenDispatchModal(equipmentList[0])}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Cấp phát Mới
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Thiết bị RPBM</th>
                <th className="py-3.5 px-4">Người Nhận & Phê Duyệt</th>
                <th className="py-3.5 px-4">Dự án Công trường</th>
                <th className="py-3.5 px-4">Ngày Giao / Dự kiến Trả</th>
                <th className="py-3.5 px-4">Tình trạng Khi Giao</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thu hồi / Xử lý</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.length > 0 ? (
                filtered.map(({ equipment, record }) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Equipment */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-100">[{equipment.assetCode}] {equipment.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">S/N: {equipment.serialNumber}</div>
                    </td>

                    {/* Receiver & Approver */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-sky-400">{record.receiverName}</div>
                      <div className="text-[11px] text-slate-400">Duyệt: {record.approverName}</div>
                    </td>

                    {/* Project */}
                    <td className="py-3.5 px-4 align-top text-slate-200 font-medium">
                      {record.projectName}
                    </td>

                    {/* Issue Date & Expected Return Date */}
                    <td className="py-3.5 px-4 align-top font-mono text-[11px]">
                      <div>Giao: <span className="text-slate-300">{formatDateVN(record.issueDate)}</span></div>
                      <div>Dự kiến trả: <strong className="text-amber-300">{formatDateVN(record.expectedReturnDate)}</strong></div>
                      {record.actualReturnDate && (
                        <div className="text-emerald-400">Trả thực tế: {formatDateVN(record.actualReturnDate)}</div>
                      )}
                    </td>

                    {/* Issue Condition */}
                    <td className="py-3.5 px-4 align-top text-slate-300">
                      <div>{record.issueCondition}</div>
                      {record.returnCondition && (
                        <div className="text-[10px] text-emerald-400 mt-1">
                          Khi trả: {record.returnCondition}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 align-top">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                        record.status === 'dang_muon' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      }`}>
                        {record.status === 'dang_muon' ? '⚡ ĐANG CẤP PHÁT' : '✓ ĐÃ THU HỒI'}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 align-top text-right">
                      {record.status === 'dang_muon' ? (
                        <button
                          onClick={() => setReturnModalData({
                            equipmentId: equipment.id,
                            dispatchId: record.id,
                            equipmentName: `[${equipment.assetCode}] ${equipment.name}`
                          })}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ml-auto"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" /> Thu hồi Thiết bị
                        </button>
                      ) : (
                        <span className="text-slate-500 text-[11px] italic">Đã hoàn tất</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Chưa có hồ sơ cấp phát/thu hồi nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Return Confirmation Dialog Modal */}
      {returnModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-emerald-400" /> Thu hồi Thiết bị về Kho
            </h3>
            <p className="text-xs text-slate-300">
              Xác nhận thu hồi thiết bị <strong className="text-amber-400">{returnModalData.equipmentName}</strong> từ công trường.
            </p>

            <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày thu hồi thực tế</label>
                <input
                  type="date"
                  value={actualReturnDate}
                  onChange={e => setActualReturnDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tình trạng thiết bị khi thu hồi</label>
                <textarea
                  rows={2}
                  value={returnCondition}
                  onChange={e => setReturnCondition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReturnModalData(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Xác nhận Thu hồi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
