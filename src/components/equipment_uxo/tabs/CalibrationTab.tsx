import React, { useState } from 'react';
import { UXOEquipment, UXOCalibrationRecord } from '../../../types';
import { ShieldCheck, Plus, Search, Calendar, AlertTriangle, FileText, ExternalLink, CheckCircle2, Clock } from 'lucide-react';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  equipmentList: UXOEquipment[];
  onOpenCalibrationModal: (equipment: UXOEquipment) => void;
}

export const CalibrationTab: React.FC<Props> = ({
  equipmentList,
  onOpenCalibrationModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');

  // Flatten all calibration rounds with their parent equipment info
  const allRounds: Array<{
    equipment: UXOEquipment;
    record: UXOCalibrationRecord;
  }> = [];

  equipmentList.forEach(eq => {
    (eq.calibrationHistory || []).forEach(record => {
      allRounds.push({ equipment: eq, record });
    });
  });

  // Sort by expiry date ascending
  allRounds.sort((a, b) => new Date(a.record.expiryDate).getTime() - new Date(b.record.expiryDate).getTime());

  const filteredRounds = allRounds.filter(item => {
    const matchesSearch =
      item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.roundCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.certificateNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.providerUnit.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesResult = resultFilter === 'all' || item.record.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const totalCost = allRounds.reduce((acc, curr) => acc + (curr.record.costVnd || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner & Expiry Notice */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Quản lý Đợt Kiểm định / Hiệu chuẩn Thiết bị RPBM (Mục 10.1)
            </h3>
            <p className="text-xs text-slate-300">
              Lưu trữ từng đợt kiểm định theo đúng quy chuẩn BQP & VNMAC. Hệ thống tự động ghi lại lịch sử không ghi đè dữ liệu cũ.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TỔNG SỐ ĐỢT KĐ:</span>
            <strong className="text-slate-100 text-sm font-mono font-bold">{allRounds.length} đợt</strong>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">TỔNG CHI PHÍ KĐ:</span>
            <strong className="text-emerald-400 text-sm font-mono font-bold">{totalCost.toLocaleString('vi-VN')} VND</strong>
          </div>
        </div>
      </div>

      {/* Filter & Selector */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo Mã đợt, Số chứng nhận, Tên thiết bị, Mã tài sản, Đơn vị KĐ..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">Tất cả Kết quả</option>
            <option value="dat">✓ Đạt chuẩn kỹ thuật</option>
            <option value="can_hieu_chinh">⚠️ Cần hiệu chỉnh lại</option>
            <option value="khong_dat">✗ Không đạt</option>
          </select>

          {equipmentList.length > 0 && (
            <button
              onClick={() => onOpenCalibrationModal(equipmentList[0])}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Thêm Đợt KĐ
            </button>
          )}
        </div>
      </div>

      {/* Calibration Rounds Data Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Mã Đợt & GCN</th>
                <th className="py-3.5 px-4">Thiết bị RPBM</th>
                <th className="py-3.5 px-4">Đơn vị Thực hiện</th>
                <th className="py-3.5 px-4">Ngày KĐ / Ngày Hiệu chuẩn</th>
                <th className="py-3.5 px-4">Hạn Hiệu lực KĐ</th>
                <th className="py-3.5 px-4">Chi phí (VND)</th>
                <th className="py-3.5 px-4 text-center">Kết quả</th>
                <th className="py-3.5 px-4 text-right">File scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredRounds.length > 0 ? (
                filteredRounds.map(({ equipment, record }) => {
                  const isExpiringSoon = new Date(record.expiryDate).getTime() - new Date().getTime() < 60 * 86400 * 1000;

                  return (
                    <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Round Code & Cert No */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-emerald-400 text-xs">{record.roundCode}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{record.certificateNo || 'Chưa cấp số'}</div>
                      </td>

                      {/* Equipment */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-100">[{equipment.assetCode}] {equipment.name}</div>
                        <div className="text-[11px] text-slate-400">{equipment.brand} {equipment.model} (S/N: {equipment.serialNumber})</div>
                      </td>

                      {/* Provider Unit */}
                      <td className="py-3.5 px-4 align-top font-medium text-slate-200">
                        {record.providerUnit}
                      </td>

                      {/* Inspection & Calibration Dates */}
                      <td className="py-3.5 px-4 align-top font-mono text-[11px] text-slate-300">
                        <div>KĐ: {formatDateVN(record.inspectionDate)}</div>
                        <div>HC: {formatDateVN(record.calibrationDate)}</div>
                      </td>

                      {/* Expiry Date */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono font-bold text-slate-100 text-xs">
                          {formatDateVN(record.expiryDate)}
                        </div>
                        {isExpiringSoon && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold mt-0.5">
                            <AlertTriangle className="w-3 h-3" /> Sắp hết hạn
                          </span>
                        )}
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 align-top font-mono font-bold text-slate-200">
                        {record.costVnd ? `${record.costVnd.toLocaleString('vi-VN')}` : '0'}
                      </td>

                      {/* Result */}
                      <td className="py-3.5 px-4 align-top text-center">
                        <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                          record.result === 'dat' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          record.result === 'can_hieu_chinh' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-rose-500/10 text-rose-400'
                        }`}>
                          {record.result === 'dat' ? '✓ ĐẠT CHUẨN' : record.result === 'can_hieu_chinh' ? '⚠️ HIỆU CHỈNH' : '✗ KHÔNG ĐẠT'}
                        </span>
                      </td>

                      {/* File Scan Link */}
                      <td className="py-3.5 px-4 align-top text-right">
                        {record.certificateFileUrl ? (
                          <a
                            href={record.certificateFileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg border border-slate-700 font-mono text-[11px] transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" /> Scan PDF <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[11px] italic">Chưa có file</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Chưa có đợt kiểm định/hiệu chuẩn nào được cập nhật.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
