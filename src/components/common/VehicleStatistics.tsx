import React from 'react';
import { ShieldCheck, AlertTriangle, AlertCircle, HelpCircle } from 'lucide-react';
import { VehicleInspectionMetrics } from '../../utils/vehicleStorage';

interface VehicleStatisticsProps {
  metrics: VehicleInspectionMetrics;
  selectedFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export const VehicleStatistics: React.FC<VehicleStatisticsProps> = ({
  metrics,
  selectedFilter = 'all',
  onSelectFilter
}) => {
  const cards = [
    {
      id: 'all',
      label: 'Tổng số xe ô tô',
      count: metrics.total,
      subtext: 'Xe phục vụ công tác RPBM',
      color: 'border-slate-800 bg-slate-900/60 text-slate-200',
      activeColor: 'ring-2 ring-slate-400',
      icon: <ShieldCheck className="w-5 h-5 text-slate-400" />
    },
    {
      id: 'valid',
      label: 'Còn hạn đăng kiểm',
      count: metrics.validCount,
      subtext: 'Đủ điều kiện lưu hành',
      color: 'border-emerald-900/40 bg-emerald-950/30 text-emerald-300',
      activeColor: 'ring-2 ring-emerald-500',
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />
    },
    {
      id: 'warning',
      label: 'Sắp hết hạn (≤ 30 ngày)',
      count: metrics.expiringSoonCount,
      subtext: 'Cần lên lịch kiểm định',
      color: 'border-amber-900/40 bg-amber-950/30 text-amber-300',
      activeColor: 'ring-2 ring-amber-500',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />
    },
    {
      id: 'expired',
      label: 'Đã hết hạn đăng kiểm',
      count: metrics.expiredCount,
      subtext: 'Ngừng vận hành ngay',
      color: 'border-rose-900/40 bg-rose-950/30 text-rose-300',
      activeColor: 'ring-2 ring-rose-500',
      icon: <AlertCircle className="w-5 h-5 text-rose-400" />
    },
    {
      id: 'missing',
      label: 'Thiếu dữ liệu kiểm định',
      count: metrics.missingInfoCount,
      subtext: 'Chưa cập nhật ngày hđ',
      color: 'border-purple-900/40 bg-purple-950/30 text-purple-300',
      activeColor: 'ring-2 ring-purple-500',
      icon: <HelpCircle className="w-5 h-5 text-purple-400" />
    }
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map(c => (
        <div
          key={c.id}
          onClick={() => onSelectFilter && onSelectFilter(c.id)}
          className={`border rounded-xl p-3 flex flex-col justify-between transition-all cursor-pointer ${c.color} ${
            selectedFilter === c.id ? c.activeColor : 'hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold opacity-90">{c.label}</span>
            {c.icon}
          </div>
          <div>
            <div className="text-2xl font-black">{c.count}</div>
            <div className="text-[10px] opacity-75">{c.subtext}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
