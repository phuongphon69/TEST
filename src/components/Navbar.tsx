import React, { useState } from 'react';
import {
  ShieldAlert,
  FileText,
  Bomb,
  Users,
  Truck,
  BookOpen,
  History,
  Bell,
  Download,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Shield,
  CheckSquare,
  Compass,
  Search,
  BarChart3,
  Radio,
  Archive,
  FileSpreadsheet,
  HardDrive
} from 'lucide-react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, getUsers, exportBackupJSON, resetToSeedData, generateAutoAlerts } from '../utils/storage';
import { NotificationBellPopover } from './NotificationBellPopover';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUserChanged?: () => void;
  onDataReset?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onUserChanged,
  onDataReset
}) => {
  const [currentUser, setUserState] = useState<User>(getCurrentUser());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const userList = getUsers();
  const alerts = generateAutoAlerts();
  const criticalCount = alerts.filter(a => a.severity === 'critical').length;
  const warningCount = alerts.filter(a => a.severity === 'warning').length;
  const totalAlerts = alerts.length;

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setUserState(user);
    setShowUserDropdown(false);
    if (onUserChanged) onUserChanged();
  };

  const navItems = [
    { id: 'dashboard', label: 'Tổng quan & Cảnh báo', icon: ShieldAlert, badge: totalAlerts > 0 ? totalAlerts : undefined },
    { id: 'global_search', label: 'Tìm kiếm Toàn hệ thống (16)', icon: Search },
    { id: 'reports', label: 'Báo cáo & Thống kê (17)', icon: BarChart3 },
    { id: 'documents', label: 'Văn bản & Hồ sơ', icon: FileText },
    { id: 'projects', label: 'Dự án RPBM', icon: Bomb },
    { id: 'form_templates', label: 'Quản lý Biểu mẫu (14)', icon: FileSpreadsheet },
    { id: 'vehicles', label: 'Quản lý Xe ô tô (9)', icon: Truck },
    { id: 'uxo_equipment', label: 'Máy dò & Khí tài RPBM (10)', icon: Radio },
    { id: 'archive_warehouse', label: 'Kho Hồ sơ & Lưu trữ (12)', icon: Archive },
    { id: 'gdrive', label: 'Tích hợp Google Drive (19)', icon: HardDrive },
    { id: 'tasks', label: 'Quản lý Công việc', icon: CheckSquare },
    { id: 'personnel', label: 'Nhân sự & Chứng chỉ (11)', icon: Users },
    { id: 'equipment', label: 'Phương tiện & Thiết bị', icon: Truck },
    { id: 'user_role', label: 'Phân quyền & Cấu hình', icon: Shield },
    { id: 'legal', label: 'Pháp lý & AI Tra cứu', icon: BookOpen, isAi: true },
    { id: 'audit', label: 'Lịch sử Thao tác', icon: History }
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo & App Name */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="bg-gradient-to-br from-emerald-600 via-teal-700 to-slate-900 p-2.5 rounded-xl border border-emerald-500/40 shadow-lg shadow-emerald-900/30 flex items-center justify-center">
            <ShieldAlert className="w-7 h-7 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white font-sans uppercase">
                QLRPBM <span className="hidden sm:inline text-xs bg-emerald-950 text-emerald-400 border border-emerald-700/60 px-2 py-0.5 rounded-md font-mono tracking-normal ml-2">Phòng 3-4 Người</span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Hệ thống Quản lý Nghiệp vụ Rà phá Bom mìn, Vật nổ
            </p>
          </div>
        </div>

        {/* Right Tools: Alert Badge, User Switcher, Backup/Restore */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
          {/* Quick Alert Bell Popover */}
          <NotificationBellPopover onNavigateTab={setActiveTab} />

          {/* Backup Button */}
          <button
            onClick={exportBackupJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
            title="Tải tệp JSON sao lưu toàn bộ dữ liệu"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Sao lưu JSON</span>
          </button>

          {/* Reset Seed Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950 border border-slate-700/80 text-xs text-slate-400 hover:text-rose-300 transition-colors"
            title="Khôi phục lại dữ liệu mẫu ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* User Profile Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 px-2.5 py-1.5 rounded-lg transition-all"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-emerald-500/60"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">{currentUser.roleLabel.split('/')[0]}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-2 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Chuyển đổi Tài khoản (3–4 Nhân sự)</p>
                </div>
                {userList.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`w-full text-left px-3 py-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${
                      currentUser.id === u.id ? 'bg-emerald-950/50 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold text-slate-200">{u.name}</div>
                        <div className="text-[10px] text-slate-400">{u.title}</div>
                      </div>
                    </div>
                    {currentUser.id === u.id && <UserCheck className="w-4 h-4 text-emerald-400 shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/80 overflow-x-auto no-scrollbar">
        <nav className="flex space-x-1 sm:space-x-2 py-1.5 min-w-max">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-600/60 shadow-md shadow-emerald-950'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-300' : item.isAi ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.isAi && (
                  <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1.5 py-0.2 rounded font-mono font-bold border border-amber-500/40 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI
                  </span>
                )}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="bg-red-600 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Confirmation Modal for Reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <h3 className="text-lg font-bold text-rose-400 mb-2 flex items-center gap-2">
              <RotateCcw className="w-5 h-5" /> Khôi phục Dữ liệu Mẫu?
            </h3>
            <p className="text-xs text-slate-300 mb-4 leading-relaxed">
              Hành động này sẽ xóa các chỉnh sửa hiện tại và đặt lại dữ liệu mẫu chuẩn về văn bản, dự án, nhân sự và phương tiện. Bạn nên tải bản sao lưu JSON trước nếu cần giữ lại dữ liệu.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  resetToSeedData();
                  setShowResetConfirm(false);
                  onDataReset();
                }}
                className="px-4 py-2 rounded-lg bg-rose-700 hover:bg-rose-600 text-xs font-semibold text-white"
              >
                Xác nhận Đặt lại
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
