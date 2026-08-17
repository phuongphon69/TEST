import React, { useState, useEffect } from 'react';
import {
  UXOEquipment,
  UXOCalibrationRecord,
  UXOMaintenanceRecord,
  UXODispatchRecord
} from '../../types';
import {
  getUXOEquipmentList,
  saveSingleEquipment,
  deleteEquipment,
  addCalibrationRound,
  addMaintenanceRecord,
  addDispatchRecord,
  returnEquipmentRecord,
  resetUXOEquipmentData
} from '../../utils/equipmentStorage';

// Sub-components
import { EquipmentListTab } from './tabs/EquipmentListTab';
import { CalibrationTab } from './tabs/CalibrationTab';
import { MaintenanceTab } from './tabs/MaintenanceTab';
import { DispatchReturnTab } from './tabs/DispatchReturnTab';

// Modals
import { EquipmentModal } from './modals/EquipmentModal';
import { QRScannerModal } from './modals/QRScannerModal';
import { CalibrationModal } from './modals/CalibrationModal';
import { MaintenanceModal } from './modals/MaintenanceModal';
import { DispatchReturnModal } from './modals/DispatchReturnModal';

import { ShieldCheck, Wrench, Send, QrCode, Plus, RotateCcw, Box, Radio, Crosshair, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';

export const UXOEquipmentManager: React.FC = () => {
  const [equipmentList, setEquipmentList] = useState<UXOEquipment[]>([]);
  const [activeTab, setActiveTab] = useState<'list' | 'calibration' | 'maintenance' | 'dispatch'>('list');

  // Modal Control States
  const [equipmentModalOpen, setEquipmentModalOpen] = useState(false);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState<UXOEquipment | null>(null);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedEquipmentForQR, setSelectedEquipmentForQR] = useState<UXOEquipment | null>(null);

  const [calibrationModalOpen, setCalibrationModalOpen] = useState(false);
  const [selectedEquipmentForCal, setSelectedEquipmentForCal] = useState<UXOEquipment | null>(null);

  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [selectedEquipmentForMaint, setSelectedEquipmentForMaint] = useState<UXOEquipment | null>(null);

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [selectedEquipmentForDisp, setSelectedEquipmentForDisp] = useState<UXOEquipment | null>(null);

  // Load initial equipment list
  useEffect(() => {
    const data = getUXOEquipmentList();
    setEquipmentList(data);
  }, []);

  // Handlers
  const handleSaveEquipment = (eq: UXOEquipment) => {
    const updated = saveSingleEquipment(eq);
    setEquipmentList(updated);
  };

  const handleDeleteEquipment = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thiết bị chuyên dụng này khỏi hệ thống?')) {
      const updated = deleteEquipment(id);
      setEquipmentList(updated);
    }
  };

  const handleSaveCalibration = (
    equipmentId: string,
    record: Omit<UXOCalibrationRecord, 'id' | 'equipmentId' | 'createdAt'>
  ) => {
    const updated = addCalibrationRound(equipmentId, record);
    setEquipmentList(updated);
  };

  const handleSaveMaintenance = (
    equipmentId: string,
    record: Omit<UXOMaintenanceRecord, 'id' | 'equipmentId' | 'createdAt'>
  ) => {
    const updated = addMaintenanceRecord(equipmentId, record);
    setEquipmentList(updated);
  };

  const handleSaveDispatch = (
    equipmentId: string,
    record: Omit<UXODispatchRecord, 'id' | 'equipmentId' | 'createdAt'>
  ) => {
    const updated = addDispatchRecord(equipmentId, record);
    setEquipmentList(updated);
  };

  const handleReturnEquipment = (
    equipmentId: string,
    dispatchId: string,
    actualReturnDate: string,
    returnCondition: string
  ) => {
    const updated = returnEquipmentRecord(equipmentId, dispatchId, actualReturnDate, returnCondition);
    setEquipmentList(updated);
  };

  const handleResetData = () => {
    if (confirm('Khôi phục danh sách máy dò bom mìn và thiết bị chuyên dụng về dữ liệu mẫu ban đầu?')) {
      const reset = resetUXOEquipmentData();
      setEquipmentList(reset);
    }
  };

  // Stat Counters
  const totalEquipment = equipmentList.length;
  const readyCount = equipmentList.filter(e => e.status === 'san_sang').length;
  const inUseCount = equipmentList.filter(e => e.status === 'dang_su_dung').length;
  const inMaintenanceCount = equipmentList.filter(e => e.status === 'dang_bao_tri' || e.status === 'dang_hieu_chuan').length;

  // Count expiries within 60 days
  const expiringCalibrationsCount = equipmentList.filter(eq => {
    const latest = eq.calibrationHistory?.[0];
    if (!latest?.expiryDate) return false;
    const diffDays = (new Date(latest.expiryDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24);
    return diffDays < 60;
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold font-mono">
                PHÂN HỆ 10 • CHUYÊN NGÀNH RPBM
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-semibold">
                TCVN 10299:2014 & Tiêu chuẩn BQP
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-100 tracking-tight flex items-center gap-3">
              <Radio className="w-7 h-7 text-amber-400" />
              Quản lý Máy Dò Bom, Máy Dò Mìn & Thiết Bị Chuyên Dụng RPBM
            </h1>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Quản lý toàn diện thiết bị chuyên dụng (Máy dò bom, Máy dò mìn, GPS RTK, Máy toàn đạc, Bộ đàm, Thiết bị bảo hộ).
              Theo dõi lịch sử kiểm định/hiệu chuẩn theo đợt (Mục 10.1), Nhật ký bảo trì sửa chữa (Mục 10.2), Cấp phát & Thu hồi theo dự án (Mục 10.3) cùng hệ thống Mã QR tra cứu tức thì.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setSelectedEquipmentForQR(equipmentList[0] || null);
                setQrModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              <QrCode className="w-4 h-4" /> Tra cứu Mã QR
            </button>

            <button
              onClick={() => {
                setSelectedEquipmentForEdit(null);
                setEquipmentModalOpen(true);
              }}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
            >
              <Plus className="w-4 h-4" /> Thêm Thiết bị Mới
            </button>

            <button
              onClick={handleResetData}
              title="Khôi phục dữ liệu mẫu ban đầu"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 rounded-xl border border-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 4 Quick Stat Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-slate-800 text-amber-400 rounded-xl border border-slate-700">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">TỔNG SỐ THIẾT BỊ</div>
              <div className="text-xl font-black text-slate-100 font-mono">{totalEquipment}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">SẴN SÀNG / ĐANG DÙNG</div>
              <div className="text-xl font-black text-emerald-400 font-mono">{readyCount + inUseCount}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">HẠN KĐ SẮP HẾT (60 NĂM)</div>
              <div className="text-xl font-black text-amber-400 font-mono">{expiringCalibrationsCount}</div>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl border border-sky-500/20">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">ĐANG BẢO TRÌ / SỬA</div>
              <div className="text-xl font-black text-sky-400 font-mono">{inMaintenanceCount}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Module Sub-Navigation Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 text-xs font-bold overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('list')}
          className={`px-4 py-2.5 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'list'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Box className="w-4 h-4" /> 10. Danh sách Thiết bị & Mã QR
        </button>

        <button
          onClick={() => setActiveTab('calibration')}
          className={`px-4 py-2.5 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'calibration'
              ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" /> 10.1 Quản lý Kiểm định / Hiệu chuẩn
        </button>

        <button
          onClick={() => setActiveTab('maintenance')}
          className={`px-4 py-2.5 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'maintenance'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Wrench className="w-4 h-4 text-amber-400" /> 10.2 Nhật ký Bảo trì & Sửa chữa
        </button>

        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2.5 border-b-2 rounded-t-xl transition-all flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'dispatch'
              ? 'border-sky-500 text-sky-400 bg-sky-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Send className="w-4 h-4 text-sky-400" /> 10.3 Cấp phát & Thu hồi Thiết bị
        </button>
      </div>

      {/* Render Active Sub Tab View */}
      {activeTab === 'list' && (
        <EquipmentListTab
          equipmentList={equipmentList}
          onOpenEquipmentModal={eq => {
            setSelectedEquipmentForEdit(eq || null);
            setEquipmentModalOpen(true);
          }}
          onOpenQRScannerModal={eq => {
            setSelectedEquipmentForQR(eq || null);
            setQrModalOpen(true);
          }}
          onOpenCalibrationModal={eq => {
            setSelectedEquipmentForCal(eq);
            setCalibrationModalOpen(true);
          }}
          onOpenMaintenanceModal={eq => {
            setSelectedEquipmentForMaint(eq);
            setMaintenanceModalOpen(true);
          }}
          onOpenDispatchModal={eq => {
            setSelectedEquipmentForDisp(eq);
            setDispatchModalOpen(true);
          }}
          onDeleteEquipment={handleDeleteEquipment}
        />
      )}

      {activeTab === 'calibration' && (
        <CalibrationTab
          equipmentList={equipmentList}
          onOpenCalibrationModal={eq => {
            setSelectedEquipmentForCal(eq);
            setCalibrationModalOpen(true);
          }}
        />
      )}

      {activeTab === 'maintenance' && (
        <MaintenanceTab
          equipmentList={equipmentList}
          onOpenMaintenanceModal={eq => {
            setSelectedEquipmentForMaint(eq);
            setMaintenanceModalOpen(true);
          }}
        />
      )}

      {activeTab === 'dispatch' && (
        <DispatchReturnTab
          equipmentList={equipmentList}
          onOpenDispatchModal={eq => {
            setSelectedEquipmentForDisp(eq);
            setDispatchModalOpen(true);
          }}
          onReturnEquipment={handleReturnEquipment}
        />
      )}

      {/* Render Modals */}
      <EquipmentModal
        equipment={selectedEquipmentForEdit}
        isOpen={equipmentModalOpen}
        onClose={() => setEquipmentModalOpen(false)}
        onSave={handleSaveEquipment}
      />

      <QRScannerModal
        equipmentList={equipmentList}
        isOpen={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        selectedEquipment={selectedEquipmentForQR}
      />

      <CalibrationModal
        equipment={selectedEquipmentForCal}
        isOpen={calibrationModalOpen}
        onClose={() => setCalibrationModalOpen(false)}
        onSave={handleSaveCalibration}
      />

      <MaintenanceModal
        equipment={selectedEquipmentForMaint}
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        onSave={handleSaveMaintenance}
      />

      <DispatchReturnModal
        equipment={selectedEquipmentForDisp}
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        onSave={handleSaveDispatch}
      />
    </div>
  );
};
