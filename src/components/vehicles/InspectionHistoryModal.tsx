import React from 'react';
import { ShieldCheck, Calendar, FileText, ExternalLink, Plus, DollarSign, X, CheckCircle2, AlertOctagon } from 'lucide-react';
import { Vehicle } from '../../types';
import { formatDateVN } from '../../utils/formatters';

interface Props {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onOpenAddModal: () => void;
}

export const InspectionHistoryModal: React.FC<Props> = ({
  vehicle,
  isOpen,
  onClose,
  onOpenAddModal
}) => {
  if (!isOpen) return null;

  const history = vehicle.inspectionHistory || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-8">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Sổ Nhật ký Lịch sử Đăng kiểm Theo Đợt
              </h3>
              <p className="text-xs text-slate-400">
                Biển số: <span className="font-mono font-bold text-amber-400">{vehicle.licensePlate}</span> | Mã xe: <span className="font-mono text-slate-300">{vehicle.code}</span> | Loại: {vehicle.brand} {vehicle.model}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onOpenAddModal();
              }}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm đợt đăng kiểm
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-slate-400 text-[11px]">Tổng số đợt đăng kiểm:</div>
              <div className="text-base font-bold text-slate-100 font-mono mt-0.5">{history.length} đợt</div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Đợt mới nhất (Hiện tại):</div>
              <div className="text-base font-bold text-amber-400 font-mono mt-0.5">
                {vehicle.currentInspectionCertNo || 'Chưa đăng kiểm'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Ngày đăng kiểm mới nhất:</div>
              <div className="text-base font-bold text-slate-200 font-mono mt-0.5">
                {formatDateVN(vehicle.lastInspectionDate)}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[11px]">Ngày hết hạn tiếp theo:</div>
              <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
                {formatDateVN(vehicle.nextInspectionExpiryDate)}
              </div>
            </div>
          </div>

          {/* History Timeline */}
          {history.length > 0 ? (
            <div className="space-y-4">
              <h4 className="font-bold text-slate-200 text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-400" /> Danh sách Chi tiết Tất cả Các đợt Kiểm định
              </h4>

              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Số Đợt</th>
                      <th className="p-3">Ngày Đăng kiểm</th>
                      <th className="p-3">Ngày Hết hạn</th>
                      <th className="p-3">Số GCN Đăng kiểm</th>
                      <th className="p-3">Đơn vị Thực hiện</th>
                      <th className="p-3">Kết quả</th>
                      <th className="p-3">Chi phí (VND)</th>
                      <th className="p-3">File Scan</th>
                      <th className="p-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {history.map((record) => (
                      <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-3 font-bold text-amber-400">
                          Đợt {record.roundNumber}
                        </td>
                        <td className="p-3 font-bold text-slate-200">
                          {formatDateVN(record.inspectionDate)}
                        </td>
                        <td className="p-3 font-bold text-emerald-400">
                          {formatDateVN(record.expiryDate)}
                        </td>
                        <td className="p-3 font-bold text-slate-100">
                          {record.certificateNo}
                        </td>
                        <td className="p-3 font-sans text-slate-300">
                          {record.providerUnit}
                        </td>
                        <td className="p-3 font-sans">
                          {record.result === 'dat' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              ✓ ĐẠT
                            </span>
                          )}
                          {record.result === 'can_khac_phuc' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                              ⚠ CẦN KHẮC PHỤC
                            </span>
                          )}
                          {record.result === 'khong_dat' && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              ✗ KHÔNG ĐẠT
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-300">
                          {record.costVnd ? record.costVnd.toLocaleString('vi-VN') : '-'}
                        </td>
                        <td className="p-3 font-sans">
                          {record.scanFileUrl ? (
                            <a
                              href={record.scanFileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-amber-400 hover:text-amber-300 underline inline-flex items-center gap-1 font-semibold"
                            >
                              <FileText className="w-3.5 h-3.5" /> File scan
                            </a>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Chưa có file</span>
                          )}
                        </td>
                        <td className="p-3 font-sans text-slate-400 max-w-xs truncate">
                          {record.notes || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 space-y-2">
              <AlertOctagon className="w-8 h-8 text-slate-600 mx-auto" />
              <p>Chưa có dữ liệu lịch sử các đợt kiểm định cho xe này.</p>
              <button
                onClick={() => {
                  onClose();
                  onOpenAddModal();
                }}
                className="px-3.5 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold hover:bg-amber-500/20"
              >
                + Cập nhật đợt đăng kiểm đầu tiên
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
