import React from 'react';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Bomb,
  Compass,
  Users,
  Truck,
  Radio,
  Archive,
  BookOpen,
  BarChart3,
  Calendar,
  Bell,
  Shield,
  HardDrive,
  FileSpreadsheet,
  Search,
  ChevronRight,
  Sparkles,
  Layers,
  SlidersHorizontal,
  FolderKanban
} from 'lucide-react';
import { generateAutoAlerts } from '../utils/storage';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode
}) => {
  const alerts = generateAutoAlerts();
  const totalAlerts = alerts.length;

  const mainMenuItems = [
    { id: 'dashboard', number: '1', label: 'Tổng quan', icon: LayoutDashboard, badge: totalAlerts > 0 ? totalAlerts : undefined },
    { id: 'documents', number: '2', label: 'Văn bản', icon: FileText },
    { id: 'tasks', number: '3', label: 'Công việc', icon: CheckSquare },
    { id: 'projects', number: '4', label: 'Dự án', icon: Bomb },
    { id: 'personnel', number: '5', label: 'Nhân sự và chứng chỉ', icon: Users },
    { id: 'vehicles', number: '6', label: 'Xe ô tô', icon: Truck },
    { id: 'uxo_equipment', number: '7', label: 'Trang thiết bị', icon: Radio },
    { id: 'archive_warehouse', number: '8', label: 'Kho hồ sơ', icon: Archive },
    { id: 'legal', number: '9', label: 'Kho pháp lý AI', icon: BookOpen, isAi: true },
    { id: 'reports', number: '10', label: 'Báo cáo', icon: BarChart3 },
    { id: 'calendar', number: '11', label: 'Lịch công tác', icon: Calendar },
    { id: 'notifications', number: '12', label: 'Thông báo', icon: Bell, badge: totalAlerts > 0 ? totalAlerts : undefined, badgeColor: 'bg-rose-500' },
    { id: 'user_role', number: '13', label: 'Quản trị hệ thống', icon: Shield }
  ];

  const utilityMenuItems = [
    { id: 'gdrive', label: 'Google Drive (Mục 19)', icon: HardDrive },
    { id: 'form_templates', label: 'Quản lý Biểu mẫu (14)', icon: FileSpreadsheet },
    { id: 'global_search', label: 'Tìm kiếm Toàn hệ thống', icon: Search },
    { id: 'audit', label: 'Lịch sử Thao tác Audit Log', icon: SlidersHorizontal }
  ];

  return (
    <aside
      className={`w-64 shrink-0 border-r flex flex-col justify-between transition-colors ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-slate-900 border-slate-800 text-slate-100 shadow-lg'
      }`}
    >
      <div className="p-4 space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-gradient-to-br from-emerald-600 to-indigo-700 p-2.5 rounded-xl border border-emerald-400/30 shadow-md flex items-center justify-center">
            <Bomb className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white uppercase font-sans flex items-center gap-1.5">
              QLRPBM <span className="text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.2 rounded font-mono">TĐ 93</span>
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">Bộ phận Bom mìn • Tiểu đoàn 93</p>
          </div>
        </div>

        {/* SECTION 1: Standard 14 Main Menu */}
        <div className="space-y-1">
          <div className="px-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Menu chính (13 Mục)</span>
          </div>

          <nav className="space-y-0.5">
            {mainMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950 font-bold'
                      : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <span className={`text-[10px] font-mono px-1 rounded ${isActive ? 'bg-emerald-700 text-white' : 'text-slate-400'}`}>
                      {item.number}.
                    </span>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : item.isAi ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full text-white font-bold ${item.badgeColor || 'bg-amber-500'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* SECTION 2: Extra Tools & Utilities */}
        <div className="space-y-1 pt-2 border-t border-slate-800">
          <div className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Công cụ & Mở rộng
          </div>
          <nav className="space-y-0.5">
            {utilityMenuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-emerald-300 font-bold border border-emerald-800'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Icon className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[10px] text-slate-500 font-mono text-center">
        Phiên bản QLRPBM v2.4 Enterprise
      </div>
    </aside>
  );
};
