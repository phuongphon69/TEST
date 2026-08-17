import React, { useState } from 'react';
import { UXOEquipment, UXOMaintenanceRecord } from '../../../types';
import { Wrench, Plus, Search, Clock, DollarSign, FileText, ExternalLink, CheckCircle2, AlertTriangle } from 'lucide-react';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  equipmentList: UXOEquipment[];
  onOpenMaintenanceModal: (equipment: UXOEquipment) => void;
}

export const MaintenanceTab: React.FC<Props> = ({
  equipmentList,
  onOpenMaintenanceModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [resultFilter, setResultFilter] = useState<string>('all');

  const allMaintenances: Array<{
    equipment: UXOEquipment;
    record: UXOMaintenanceRecord;
  }> = [];

  equipmentList.forEach(eq => {
    (eq.maintenanceHistory || []).forEach(record => {
      allMaintenances.push({ equipment: eq, record });
    });
  });

  allMaintenances.sort((a, b) => new Date(b.record.maintenanceDate).getTime() - new Date(a.record.maintenanceDate).getTime());

  const filtered = allMaintenances.filter(item => {
    const matchesSearch =
      item.equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.equipment.assetCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.record.providerUnit.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.record.replacedParts && item.record.replacedParts.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesResult = resultFilter === 'all' || item.record.result === resultFilter;
    return matchesSearch && matchesResult;
  });

  const totalCost = allMaintenances.reduce((acc, curr) => acc + (curr.record.costVnd || 0), 0);
  const totalDowntime = allMaintenances.reduce((acc, curr) => acc + (curr.record.downtimeHours || 0), 0);

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-900 border border-amber-500/20 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Nhật ký Bảo trì & Sửa chữa Thiết bị RPBM (Mục 10.2)
            </h3>
            <p className="text-xs text-slate-300">
              Theo dõi chi tiết nội dung sửa chữa, linh kiện thay thế, chi phí tài chính và thời gian dừng hoạt động công trường.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800 shrink-0 text-xs">
          <div>
            <span className="text-slate-400 block text-[10px]">TỔNG GIỜ DỪNG HĐ:</span>
            <strong className="text-amber-400 text-sm font-mono font-bold">{totalDowntime} giờ</strong>
          </div>
          <div className="w-px h-8 bg-slate-800" />
          <div>
            <span className="text-slate-400 block text-[10px]">TỔNG CHI PHÍ SỬA CHỮA:</span>
            <strong className="text-emerald-400 text-sm font-mono font-bold">{totalCost.toLocaleString('vi-VN')} VND</strong>
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
            placeholder="Tìm theo Nội dung sửa chữa, Linh kiện thay thế, Tên thiết bị, Mã tài sản, Đơn vị..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={resultFilter}
            onChange={e => setResultFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả Trạng thái</option>
            <option value="hoan_thanh">✓ Hoàn thành</option>
            <option value="cho_linh_kien">⏳ Chờ linh kiện</option>
            <option value="khong_dat">✗ Không khôi phục</option>
          </select>

          {equipmentList.length > 0 && (
            <button
              onClick={() => onOpenMaintenanceModal(equipmentList[0])}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all shrink-0"
            >
              <Plus className="w-4 h-4" /> Ghi Nhật ký Bảo trì
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Ngày Thực hiện</th>
                <th className="py-3.5 px-4">Thiết bị RPBM</th>
                <th className="py-3.5 px-4">Nội dung Bảo trì / Sửa chữa</th>
                <th className="py-3.5 px-4">Linh kiện Thay thế</th>
                <th className="py-3.5 px-4">Đơn vị Thực hiện</th>
                <th className="py-3.5 px-4">Chi phí (VND)</th>
                <th className="py-3.5 px-4 text-center">Downtime (Giờ)</th>
                <th className="py-3.5 px-4 text-right">Kết quả</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filtered.length > 0 ? (
                filtered.map(({ equipment, record }) => (
                  <tr key={record.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Date */}
                    <td className="py-3.5 px-4 align-top font-mono text-amber-400 font-bold">
                      {formatDateVN(record.maintenanceDate)}
                    </td>

                    {/* Equipment */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-bold text-slate-100">[{equipment.assetCode}] {equipment.name}</div>
                      <div className="text-[11px] text-slate-400">{equipment.brand} {equipment.model}</div>
                    </td>

                    {/* Content */}
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-200">{record.content}</div>
                      {record.nextMaintenanceDate && (
                        <div className="text-[10px] text-slate-400 mt-1">
                          Lần tiếp: <span className="font-mono text-amber-300">{formatDateVN(record.nextMaintenanceDate)}</span>
                        </div>
                      )}
                    </td>

                    {/* Replaced Parts */}
                    <td className="py-3.5 px-4 align-top text-slate-300">
                      {record.replacedParts || <span className="text-slate-500 italic">Không có</span>}
                    </td>

                    {/* Unit */}
                    <td className="py-3.5 px-4 align-top text-slate-300 font-medium">
                      {record.providerUnit}
                    </td>

                    {/* Cost */}
                    <td className="py-3.5 px-4 align-top font-mono font-bold text-slate-100">
                      {record.costVnd ? `${record.costVnd.toLocaleString('vi-VN')}` : '0'}
                    </td>

                    {/* Downtime Hours */}
                    <td className="py-3.5 px-4 align-top text-center font-mono font-bold text-amber-300">
                      {record.downtimeHours || 0}h
                    </td>

                    {/* Result */}
                    <td className="py-3.5 px-4 align-top text-right">
                      <span className={`inline-block px-2.5 py-1 rounded-md text-[10px] font-extrabold border ${
                        record.result === 'hoan_thanh' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                        record.result === 'cho_linh_kien' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {record.result === 'hoan_thanh' ? '✓ HOÀN THÀNH' : record.result === 'cho_linh_kien' ? '⏳ CHỜ LINH KIỆN' : '✗ KHÔNG ĐẠT'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    Chưa có nhật ký bảo trì hoặc sửa chữa nào được tạo.
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
