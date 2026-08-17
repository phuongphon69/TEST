import React, { useState } from 'react';
import {
  Bell,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Sliders,
  CheckCircle2,
  Plus,
  Trash2,
  ExternalLink,
  ShieldAlert,
  FileText,
  RotateCcw
} from 'lucide-react';

import { Vehicle, VehicleAlertSettings } from '../../types';
import { calculateVehicleAlerts, VehicleAlertItem } from '../../utils/vehicleStorage';
import { formatDateVN } from '../../utils/formatters';

interface Props {
  vehicles: Vehicle[];
  alertSettings: VehicleAlertSettings;
  onSaveSettings: (settings: VehicleAlertSettings) => void;
  onOpenInspectionModal: (vehicle: Vehicle) => void;
  onOpenVehicleModal: (vehicle: Vehicle) => void;
}

export const VehicleAlertsTab: React.FC<Props> = ({
  vehicles,
  alertSettings,
  onSaveSettings,
  onOpenInspectionModal,
  onOpenVehicleModal
}) => {
  const [thresholdInput, setThresholdInput] = useState<string>(
    alertSettings.thresholdDays ? alertSettings.thresholdDays.join(', ') : '90, 60, 30, 15, 7'
  );
  const [isEditingSettings, setIsEditingSettings] = useState<boolean>(false);
  const [filterType, setFilterType] = useState<'all' | 'inspection_expiry' | 'insurance_expiry'>('all');

  const alerts = calculateVehicleAlerts(vehicles, alertSettings);
  const filteredAlerts = alerts.filter(a => filterType === 'all' || a.type === filterType);

  const overdueCount = alerts.filter(a => a.daysLeft < 0).length;
  const criticalCount = alerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 7).length;
  const warningCount = alerts.filter(a => a.daysLeft > 7 && a.daysLeft <= 30).length;
  const noticeCount = alerts.filter(a => a.daysLeft > 30).length;

  const handleSaveThresholds = (e: React.FormEvent) => {
    e.preventDefault();
    // Parse comma separated numbers
    const parsed = thresholdInput
      .split(',')
      .map(s => parseInt(s.trim(), 10))
      .filter(n => !isNaN(n) && n > 0)
      .sort((a, b) => b - a);

    if (parsed.length === 0) {
      alert('Vui lòng nhập ít nhất 1 số ngày cảnh báo hợp lệ!');
      return;
    }

    const newSettings: VehicleAlertSettings = {
      ...alertSettings,
      thresholdDays: parsed
    };

    onSaveSettings(newSettings);
    setIsEditingSettings(false);
  };

  const handleResetDefaultThresholds = () => {
    const defaults = [90, 60, 30, 15, 7];
    setThresholdInput(defaults.join(', '));
    onSaveSettings({
      ...alertSettings,
      thresholdDays: defaults
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Custom Threshold Controls */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" /> Trung tâm Cảnh báo Đăng kiểm Phương tiện
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Hệ thống tự động quét và đưa ra cảnh báo trước hạn kiểm định theo quy định & mốc tùy chỉnh của Quản trị viên.
            </p>
          </div>

          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors shrink-0"
          >
            <Sliders className="w-4 h-4" /> Tùy chỉnh Mốc Thời gian Cảnh báo
          </button>
        </div>

        {/* Customization Form */}
        {isEditingSettings && (
          <form onSubmit={handleSaveThresholds} className="bg-slate-950 p-4 rounded-xl border border-amber-500/30 space-y-3 text-xs">
            <div className="flex justify-between items-center">
              <strong className="text-amber-400 font-bold flex items-center gap-1.5 text-sm">
                <Sliders className="w-4 h-4" /> Cấu hình các Mốc ngày Cảnh báo trước khi Hết hạn
              </strong>
              <button
                type="button"
                onClick={handleResetDefaultThresholds}
                className="text-slate-400 hover:text-slate-200 text-[11px] underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Đặt lại mặc định (90, 60, 30, 15, 7 ngày)
              </button>
            </div>

            <p className="text-slate-400">
              Nhập danh sách số ngày trước hạn để hệ thống phát thông báo (cách nhau bằng dấu phẩy). Yêu cầu bài toán: <strong>90 ngày, 60 ngày, 30 ngày, 15 ngày, 7 ngày</strong>.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={thresholdInput}
                onChange={e => setThresholdInput(e.target.value)}
                placeholder="Ví dụ: 90, 60, 30, 15, 7"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg shrink-0 transition-colors"
              >
                Cập nhật Cấu hình
              </button>
            </div>
          </form>
        )}

        {/* Current Config Badges & Stats */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Mốc ngày cảnh báo đang áp dụng:</span>
            <div className="flex items-center gap-1.5 font-mono font-bold">
              {alertSettings.thresholdDays?.map(d => (
                <span key={d} className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[11px]">
                  {d} ngày
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400">Lọc loại cảnh báo:</span>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-slate-200 font-medium focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả cảnh báo ({alerts.length})</option>
              <option value="inspection_expiry">Chỉ Đăng kiểm xe</option>
              <option value="insurance_expiry">Chỉ Hạn Bảo hiểm</option>
            </select>
          </div>
        </div>

        {/* Alert Counter Stat Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="bg-rose-950/30 border border-rose-500/40 p-3 rounded-xl text-xs">
            <div className="text-rose-400 font-semibold flex items-center justify-between">
              Đã Quá hạn kiểm định
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-xl font-mono font-black text-rose-300 mt-1">{overdueCount} xe</div>
          </div>

          <div className="bg-amber-950/30 border border-amber-500/40 p-3 rounded-xl text-xs">
            <div className="text-amber-400 font-semibold flex items-center justify-between">
              Khẩn cấp (≤ 7 ngày)
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-black text-amber-300 mt-1">{criticalCount} xe</div>
          </div>

          <div className="bg-amber-950/20 border border-slate-800 p-3 rounded-xl text-xs">
            <div className="text-amber-300 font-semibold flex items-center justify-between">
              Cảnh báo (8 - 30 ngày)
              <Clock className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-mono font-black text-amber-200 mt-1">{warningCount} xe</div>
          </div>

          <div className="bg-sky-950/30 border border-sky-500/30 p-3 rounded-xl text-xs">
            <div className="text-sky-400 font-semibold flex items-center justify-between">
              Nhắc nhở (31 - 90 ngày)
              <ShieldCheck className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-xl font-mono font-black text-sky-300 mt-1">{noticeCount} xe</div>
          </div>
        </div>
      </div>

      {/* Active Alerts List */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-4">
        <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
          <ShieldAlert className="w-4 h-4 text-rose-400" /> Danh sách Xe Cần Đăng kiểm & Gia hạn Bảo hiểm ({filteredAlerts.length})
        </h4>

        {filteredAlerts.length > 0 ? (
          <div className="space-y-3">
            {filteredAlerts.map((item, idx) => {
              const isInspection = item.type === 'inspection_expiry';
              const isOverdue = item.daysLeft < 0;

              return (
                <div
                  key={`${item.vehicle.id}-${item.type}-${idx}`}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                    isOverdue
                      ? 'bg-rose-950/30 border-rose-500/50 hover:border-rose-500'
                      : item.status === 'critical'
                      ? 'bg-amber-950/30 border-amber-500/50 hover:border-amber-500'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 text-sm">{item.vehicle.licensePlate}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {item.vehicle.code}
                      </span>
                      <span className="text-slate-300 font-semibold">
                        {item.vehicle.brand} {item.vehicle.model}
                      </span>
                      <span className="text-slate-400">({item.vehicle.managingUnit})</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Nội dung:</span>
                        <strong className="text-slate-100 font-medium">
                          {isInspection ? 'Đăng kiểm xe ô tô' : 'Bảo hiểm phương tiện'}
                        </strong>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Hạn chót:</span>
                        <span className="font-mono font-bold text-amber-400">{formatDateVN(item.expiryDate)}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400">Ngưỡng khớp:</span>
                        <span className="font-mono text-slate-300">Mốc ≤ {item.matchedThreshold} ngày</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {/* Expiry Badge */}
                    <div>
                      {isOverdue ? (
                        <span className="px-3 py-1.5 rounded-xl font-mono font-bold text-xs bg-rose-500/20 text-rose-300 border border-rose-500/50 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Quá hạn {Math.abs(item.daysLeft)} ngày!
                        </span>
                      ) : (
                        <span className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs border flex items-center gap-1 ${
                          item.daysLeft <= 7
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                            : 'bg-sky-500/10 text-sky-300 border-sky-500/30'
                        }`}>
                          <Clock className="w-3.5 h-3.5" /> Còn {item.daysLeft} ngày
                        </span>
                      )}
                    </div>

                    {/* Quick action button */}
                    <div className="flex items-center gap-1.5">
                      {isInspection ? (
                        <button
                          onClick={() => onOpenInspectionModal(item.vehicle)}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1 transition-all shadow-md shadow-amber-500/20"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" /> Đăng kiểm ngay
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenVehicleModal(item.vehicle)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1 transition-colors"
                        >
                          <FileText className="w-3.5 h-3.5" /> Sửa bảo hiểm
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">Tất cả phương tiện đều đảm bảo an toàn kỹ thuật!</p>
            <p className="text-xs text-slate-500">
              Không có xe nào nằm trong mốc cảnh báo hết hạn đăng kiểm hoặc bảo hiểm.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
