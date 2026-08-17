import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Grid,
  FileText,
  Compass,
  Archive,
  ShieldCheck,
  ShieldAlert,
  Layers,
  RotateCcw,
  Sparkles,
  Info
} from 'lucide-react';

import {
  ExecutionArea,
  GridBlock,
  UXODailyExecutionLog,
  UXOSignalRecord,
  UXODiscoveryDossier,
  UXOQualityRecord,
  UXOSafetyRecord,
  Project
} from '../../types';

import {
  getExecutionAreas,
  saveExecutionAreas,
  getGridBlocks,
  saveGridBlocks,
  getUXODailyLogs,
  saveUXODailyLogs,
  getSignalRecords,
  saveSignalRecords,
  getDiscoveryDossiers,
  saveDiscoveryDossiers,
  getQualityRecords,
  saveQualityRecords,
  getSafetyRecords,
  saveSafetyRecords,
  resetUXOOpsData
} from '../../utils/uxoStorage';

import { ExecutionAreaTab } from './tabs/ExecutionAreaTab';
import { GridBlockTab } from './tabs/GridBlockTab';
import { DailyExecutionLogTab } from './tabs/DailyExecutionLogTab';
import { SignalTrackingTab } from './tabs/SignalTrackingTab';
import { DiscoveredUXOTab } from './tabs/DiscoveredUXOTab';
import { QualityManagementTab } from './tabs/QualityManagementTab';
import { SafetyManagementTab } from './tabs/SafetyManagementTab';

interface Props {
  projects: Project[];
}

export type UXOActiveTab =
  | 'areas'
  | 'grid'
  | 'daily_logs'
  | 'signals'
  | 'discovered'
  | 'quality'
  | 'safety';

export const UXOOperationsManager: React.FC<Props> = ({ projects }) => {
  const [activeTab, setActiveTab] = useState<UXOActiveTab>('areas');

  // Operational State
  const [areas, setAreas] = useState<ExecutionArea[]>([]);
  const [gridBlocks, setGridBlocks] = useState<GridBlock[]>([]);
  const [dailyLogs, setDailyLogs] = useState<UXODailyExecutionLog[]>([]);
  const [signals, setSignals] = useState<UXOSignalRecord[]>([]);
  const [dossiers, setDossiers] = useState<UXODiscoveryDossier[]>([]);
  const [qualityRecords, setQualityRecords] = useState<UXOQualityRecord[]>([]);
  const [safetyRecords, setSafetyRecords] = useState<UXOSafetyRecord[]>([]);

  // Load from Storage
  useEffect(() => {
    setAreas(getExecutionAreas());
    setGridBlocks(getGridBlocks());
    setDailyLogs(getUXODailyLogs());
    setSignals(getSignalRecords());
    setDossiers(getDiscoveryDossiers());
    setQualityRecords(getQualityRecords());
    setSafetyRecords(getSafetyRecords());
  }, []);

  // Handlers for 8.1 Areas
  const handleSaveArea = (area: ExecutionArea) => {
    const idx = areas.findIndex(a => a.id === area.id);
    let next: ExecutionArea[];
    if (idx >= 0) {
      next = [...areas];
      next[idx] = area;
    } else {
      next = [area, ...areas];
    }
    setAreas(next);
    saveExecutionAreas(next);
  };
  const handleDeleteArea = (id: string) => {
    const next = areas.filter(a => a.id !== id);
    setAreas(next);
    saveExecutionAreas(next);
  };

  // Handlers for 8.2 Grid Blocks
  const handleSaveGridBlock = (grid: GridBlock) => {
    const idx = gridBlocks.findIndex(g => g.id === grid.id);
    let next: GridBlock[];
    if (idx >= 0) {
      next = [...gridBlocks];
      next[idx] = grid;
    } else {
      next = [grid, ...gridBlocks];
    }
    setGridBlocks(next);
    saveGridBlocks(next);
  };
  const handleDeleteGridBlock = (id: string) => {
    const next = gridBlocks.filter(g => g.id !== id);
    setGridBlocks(next);
    saveGridBlocks(next);
  };

  // Handlers for 8.3 Daily Logs
  const handleSaveDailyLog = (log: UXODailyExecutionLog) => {
    const idx = dailyLogs.findIndex(l => l.id === log.id);
    let next: UXODailyExecutionLog[];
    if (idx >= 0) {
      next = [...dailyLogs];
      next[idx] = log;
    } else {
      next = [log, ...dailyLogs];
    }
    setDailyLogs(next);
    saveUXODailyLogs(next);
  };
  const handleDeleteDailyLog = (id: string) => {
    const next = dailyLogs.filter(l => l.id !== id);
    setDailyLogs(next);
    saveUXODailyLogs(next);
  };

  // Handlers for 8.4 Signal Records
  const handleSaveSignal = (sig: UXOSignalRecord) => {
    const idx = signals.findIndex(s => s.id === sig.id);
    let next: UXOSignalRecord[];
    if (idx >= 0) {
      next = [...signals];
      next[idx] = sig;
    } else {
      next = [sig, ...signals];
    }
    setSignals(next);
    saveSignalRecords(next);
  };
  const handleDeleteSignal = (id: string) => {
    const next = signals.filter(s => s.id !== id);
    setSignals(next);
    saveSignalRecords(next);
  };

  // Handlers for 8.5 Discovered Dossiers
  const handleSaveDossier = (dos: UXODiscoveryDossier) => {
    const idx = dossiers.findIndex(d => d.id === dos.id);
    let next: UXODiscoveryDossier[];
    if (idx >= 0) {
      next = [...dossiers];
      next[idx] = dos;
    } else {
      next = [dos, ...dossiers];
    }
    setDossiers(next);
    saveDiscoveryDossiers(next);
  };
  const handleDeleteDossier = (id: string) => {
    const next = dossiers.filter(d => d.id !== id);
    setDossiers(next);
    saveDiscoveryDossiers(next);
  };

  // Handlers for 8.6 Quality Records
  const handleSaveQualityRecord = (rec: UXOQualityRecord) => {
    const idx = qualityRecords.findIndex(q => q.id === rec.id);
    let next: UXOQualityRecord[];
    if (idx >= 0) {
      next = [...qualityRecords];
      next[idx] = rec;
    } else {
      next = [rec, ...qualityRecords];
    }
    setQualityRecords(next);
    saveQualityRecords(next);
  };
  const handleDeleteQualityRecord = (id: string) => {
    const next = qualityRecords.filter(q => q.id !== id);
    setQualityRecords(next);
    saveQualityRecords(next);
  };

  // Handlers for 8.7 Safety Records
  const handleSaveSafetyRecord = (rec: UXOSafetyRecord) => {
    const idx = safetyRecords.findIndex(s => s.id === rec.id);
    let next: UXOSafetyRecord[];
    if (idx >= 0) {
      next = [...safetyRecords];
      next[idx] = rec;
    } else {
      next = [rec, ...safetyRecords];
    }
    setSafetyRecords(next);
    saveSafetyRecords(next);
  };
  const handleDeleteSafetyRecord = (id: string) => {
    const next = safetyRecords.filter(s => s.id !== id);
    setSafetyRecords(next);
    saveSafetyRecords(next);
  };

  const handleResetData = () => {
    if (confirm('Khôi phục dữ liệu mẫu phân hệ Nghiệp vụ Rà phá bom mìn?')) {
      resetUXOOpsData();
      setAreas(getExecutionAreas());
      setGridBlocks(getGridBlocks());
      setDailyLogs(getUXODailyLogs());
      setSignals(getSignalRecords());
      setDossiers(getDiscoveryDossiers());
      setQualityRecords(getQualityRecords());
      setSafetyRecords(getSafetyRecords());
    }
  };

  // Metrics summary
  const totalAreaHa = areas.reduce((sum, a) => sum + (a.areaHa || 0), 0);
  const totalGridCells = gridBlocks.length;
  const completedGridCells = gridBlocks.filter(g => g.status === 'da_nghiem_thu' || g.status === 'da_hoan_thanh').length;
  const totalSignals = signals.length;
  const totalUXODiscoveries = dossiers.reduce((sum, d) => sum + (d.quantity || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Module Title Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 p-6 rounded-2xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded-full border border-amber-500/30 uppercase tracking-widest">
                Chuyên Ngành RPBM
              </span>
              <span className="text-xs text-slate-400 font-medium">Theo QCVN 01:2022/BQP</span>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight flex items-center gap-2">
              8. Phân Hệ Nghiệp Vụ Rà Phá Bom Mìn, Vật Nổ
            </h1>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Quản lý toàn diện hồ sơ, tiến độ, lưới dò tìm, nhật ký thi công, tín hiệu kim loại, kết quả kiểm tra chất lượng & an toàn lao động công trường.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={handleResetData}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
              title="Khôi phục dữ liệu nghiệp vụ mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" /> Reset Dữ liệu mẫu
            </button>
          </div>
        </div>

        {/* Operational Stats Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-800/80">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Khu vực thi công</div>
            <div className="text-lg font-bold text-amber-400 font-mono mt-0.5">
              {areas.length} <span className="text-xs font-normal text-slate-400">({totalAreaHa.toFixed(1)} ha)</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Tiến độ Ô lưới dò</div>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
              {completedGridCells} / {totalGridCells} <span className="text-xs font-normal text-slate-400">ô nghiệm thu</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Sổ theo dõi tín hiệu</div>
            <div className="text-lg font-bold text-sky-400 font-mono mt-0.5">
              {totalSignals} <span className="text-xs font-normal text-slate-400">vị trí ghi nhận</span>
            </div>
          </div>

          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <div className="text-[11px] text-slate-400">Vật thể phát hiện (BQP)</div>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">
              {totalUXODiscoveries} <span className="text-xs font-normal text-slate-400">vật / đạn</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Sub-Module Tab Controls */}
      <div className="flex border-b border-slate-800 text-xs font-bold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('areas')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'areas'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <MapPin className="w-4 h-4" /> 8.1. Khu vực thi công ({areas.length})
        </button>

        <button
          onClick={() => setActiveTab('grid')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'grid'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Grid className="w-4 h-4" /> 8.2. Lưới dò & Phân khu ({gridBlocks.length})
        </button>

        <button
          onClick={() => setActiveTab('daily_logs')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'daily_logs'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <FileText className="w-4 h-4" /> 8.3. Nhật ký thi công ({dailyLogs.length})
        </button>

        <button
          onClick={() => setActiveTab('signals')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'signals'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Compass className="w-4 h-4" /> 8.4. Sổ tín hiệu ({signals.length})
        </button>

        <button
          onClick={() => setActiveTab('discovered')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'discovered'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <Archive className="w-4 h-4" /> 8.5. Hồ sơ vật thể phát hiện ({dossiers.length})
        </button>

        <button
          onClick={() => setActiveTab('quality')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'quality'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> 8.6. Quản lý chất lượng ({qualityRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-3 border-b-2 whitespace-nowrap transition-all flex items-center gap-2 rounded-t-xl ${
            activeTab === 'safety'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> 8.7. Quản lý an toàn ({safetyRecords.length})
        </button>
      </div>

      {/* Render Selected Sub-Module */}
      <div className="pt-2">
        {activeTab === 'areas' && (
          <ExecutionAreaTab
            areas={areas}
            projects={projects}
            onSaveArea={handleSaveArea}
            onDeleteArea={handleDeleteArea}
          />
        )}

        {activeTab === 'grid' && (
          <GridBlockTab
            gridBlocks={gridBlocks}
            areas={areas}
            projects={projects}
            onSaveGridBlock={handleSaveGridBlock}
            onDeleteGridBlock={handleDeleteGridBlock}
          />
        )}

        {activeTab === 'daily_logs' && (
          <DailyExecutionLogTab
            logs={dailyLogs}
            projects={projects}
            areas={areas}
            onSaveLog={handleSaveDailyLog}
            onDeleteLog={handleDeleteDailyLog}
          />
        )}

        {activeTab === 'signals' && (
          <SignalTrackingTab
            signals={signals}
            projects={projects}
            onSaveSignal={handleSaveSignal}
            onDeleteSignal={handleDeleteSignal}
          />
        )}

        {activeTab === 'discovered' && (
          <DiscoveredUXOTab
            dossiers={dossiers}
            projects={projects}
            onSaveDossier={handleSaveDossier}
            onDeleteDossier={handleDeleteDossier}
          />
        )}

        {activeTab === 'quality' && (
          <QualityManagementTab
            qualityRecords={qualityRecords}
            projects={projects}
            onSaveQualityRecord={handleSaveQualityRecord}
            onDeleteQualityRecord={handleDeleteQualityRecord}
          />
        )}

        {activeTab === 'safety' && (
          <SafetyManagementTab
            safetyRecords={safetyRecords}
            projects={projects}
            onSaveSafetyRecord={handleSaveSafetyRecord}
            onDeleteSafetyRecord={handleDeleteSafetyRecord}
          />
        )}
      </div>
    </div>
  );
};
