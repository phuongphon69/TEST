import React, { useState, useEffect } from 'react';
import {
  Truck,
  ShieldAlert,
  RotateCcw,
  Sliders,
  CheckCircle2,
  ListFilter,
  AlertTriangle,
  FileText
} from 'lucide-react';

import { Vehicle, VehicleInspectionRecord, VehicleAlertSettings } from '../../types';
import {
  getVehicles,
  saveVehicle,
  deleteVehicle,
  addInspectionRecord,
  getVehicleAlertSettings,
  saveVehicleAlertSettings,
  resetVehicleData,
  calculateVehicleAlerts
} from '../../utils/vehicleStorage';

import { VehicleListTab } from './VehicleListTab';
import { VehicleAlertsTab } from './VehicleAlertsTab';
import { VehicleModal } from './VehicleModal';
import { VehicleInspectionModal } from './VehicleInspectionModal';
import { InspectionHistoryModal } from './InspectionHistoryModal';

export type VehicleSubTab = 'list' | 'alerts';

export const VehicleManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<VehicleSubTab>('list');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [alertSettings, setAlertSettings] = useState<VehicleAlertSettings>({
    thresholdDays: [90, 60, 30, 15, 7],
    enableEmailAlerts: true,
    enableInAppAlerts: true
  });

  // Modal States
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);

  const [inspectionTargetVehicle, setInspectionTargetVehicle] = useState<Vehicle | null>(null);
  const [isInspectionModalOpen, setIsInspectionModalOpen] = useState(false);

  const [historyTargetVehicle, setHistoryTargetVehicle] = useState<Vehicle | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  useEffect(() => {
    setVehicles(getVehicles());
    setAlertSettings(getVehicleAlertSettings());
  }, []);

  const handleSaveVehicle = (vehicle: Vehicle) => {
    const updated = saveVehicle(vehicle);
    setVehicles(updated);
  };

  const handleDeleteVehicle = (id: string) => {
    const updated = deleteVehicle(id);
    setVehicles(updated);
  };

  const handleSaveInspectionRecord = (record: Omit<VehicleInspectionRecord, 'id' | 'vehicleId' | 'roundNumber' | 'createdAt'>) => {
    if (!inspectionTargetVehicle) return;
    const updated = addInspectionRecord(inspectionTargetVehicle.id, record);
    setVehicles(updated);
    setInspectionTargetVehicle(null);
  };

  const handleSaveAlertSettings = (settings: VehicleAlertSettings) => {
    saveVehicleAlertSettings(settings);
    setAlertSettings(settings);
  };

  const handleResetData = () => {
    if (confirm('Khôi phục dữ liệu mẫu phân hệ Quản lý Xe ô tô & Đăng kiểm?')) {
      const updated = resetVehicleData();
      setVehicles(updated);
      setAlertSettings(getVehicleAlertSettings());
    }
  };

  // Alert Metrics
  const activeAlerts = calculateVehicleAlerts(vehicles, alertSettings);
  const overdueCount = activeAlerts.filter(a => a.daysLeft < 0).length;
  const criticalCount = activeAlerts.filter(a => a.daysLeft >= 0 && a.daysLeft <= 7).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded-full border border-amber-500/30 uppercase tracking-widest">
                Phân Hệ 9
              </span>
              <span className="text-xs text-slate-400 font-medium">Quản lý Xe ô tô & Đăng kiểm Phương tiện</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              Phân hệ Quản lý Xe Ô tô & Cảnh báo Đăng kiểm Theo đợt
            </h1>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Quản lý thông tin phương tiện, số khung, số máy, đính kèm file scan PDF cà vẹt & giấy đăng kiểm, lưu nhật ký đợt kiểm định riêng biệt và tự động phát cảnh báo theo các mốc 90, 60, 30, 15, 7 ngày.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Khôi phục dữ liệu xe mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Dữ liệu mẫu
            </button>
          </div>
        </div>

        {/* Operational Stats Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Tổng số phương tiện</div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">
              {vehicles.length} <span className="text-xs font-normal text-slate-400">xe ô tô</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Đã đăng ký xe (Cà vẹt)</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {vehicles.filter(v => Boolean(v.registrationNo)).length} <span className="text-xs font-normal text-slate-400">xe</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Xe đã quá hạn đăng kiểm</div>
            <div className="text-lg font-bold text-rose-400 font-mono mt-0.5">
              {overdueCount} <span className="text-xs font-normal text-slate-400">xe</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Khẩn cấp (≤ 7 ngày)</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {criticalCount} <span className="text-xs font-normal text-slate-400">xe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub Navigation Bar */}
      <div className="flex border-b border-slate-800 text-xs font-bold overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'list'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Truck className="w-4 h-4" /> Danh sách Xe ô tô ({vehicles.length})
        </button>

        <button
          onClick={() => setActiveTab('alerts')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl relative ${
            activeTab === 'alerts'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Cảnh báo Đăng kiểm Phương tiện ({activeAlerts.length})
          {overdueCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500 text-slate-950 ml-1 animate-pulse">
              {overdueCount}
            </span>
          )}
        </button>
      </div>

      {/* Render Active Sub Tab */}
      <div className="pt-2">
        {activeTab === 'list' && (
          <VehicleListTab
            vehicles={vehicles}
            onOpenAddVehicle={() => {
              setEditingVehicle(null);
              setIsVehicleModalOpen(true);
            }}
            onOpenEditVehicle={(veh) => {
              setEditingVehicle(veh);
              setIsVehicleModalOpen(true);
            }}
            onDeleteVehicle={handleDeleteVehicle}
            onOpenInspectionModal={(veh) => {
              setInspectionTargetVehicle(veh);
              setIsInspectionModalOpen(true);
            }}
            onOpenHistoryModal={(veh) => {
              setHistoryTargetVehicle(veh);
              setIsHistoryModalOpen(true);
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <VehicleAlertsTab
            vehicles={vehicles}
            alertSettings={alertSettings}
            onSaveSettings={handleSaveAlertSettings}
            onOpenInspectionModal={(veh) => {
              setInspectionTargetVehicle(veh);
              setIsInspectionModalOpen(true);
            }}
            onOpenVehicleModal={(veh) => {
              setEditingVehicle(veh);
              setIsVehicleModalOpen(true);
            }}
          />
        )}
      </div>

      {/* Modals */}
      <VehicleModal
        vehicle={editingVehicle}
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSave={handleSaveVehicle}
      />

      {inspectionTargetVehicle && (
        <VehicleInspectionModal
          vehicle={inspectionTargetVehicle}
          isOpen={isInspectionModalOpen}
          onClose={() => {
            setIsInspectionModalOpen(false);
            setInspectionTargetVehicle(null);
          }}
          onSave={handleSaveInspectionRecord}
        />
      )}

      {historyTargetVehicle && (
        <InspectionHistoryModal
          vehicle={historyTargetVehicle}
          isOpen={isHistoryModalOpen}
          onClose={() => {
            setIsHistoryModalOpen(false);
            setHistoryTargetVehicle(null);
          }}
          onOpenAddModal={() => {
            setInspectionTargetVehicle(historyTargetVehicle);
            setIsInspectionModalOpen(true);
          }}
        />
      )}
    </div>
  );
};
