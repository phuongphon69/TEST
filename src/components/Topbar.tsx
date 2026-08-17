import React, { useState } from 'react';
import {
  Search,
  Bell,
  Sun,
  Moon,
  UserCheck,
  ChevronDown,
  RotateCcw,
  Download,
  Shield,
  Home,
  ChevronRight
} from 'lucide-react';
import { User } from '../types';
import { getCurrentUser, setCurrentUser, getUsers, exportBackupJSON, resetToSeedData, generateAutoAlerts } from '../utils/storage';
import { NotificationBellPopover } from './NotificationBellPopover';

interface TopbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isDarkMode: boolean;
  setIsDarkMode: (dark: boolean) => void;
  onUserChanged?: () => void;
}

const TAB_NAME_MAP: Record<string, string> = {
  dashboard: '1. Tổng quan & Cảnh báo',
  documents: '2. Quản lý Văn bản & Hồ sơ',
  tasks: '3. Quản lý Công việc & Tiến độ',
  projects: '4. Quản lý Dự án RPBM',
  personnel: '5. Nhân sự & Chứng chỉ (Mục 11)',
  vehicles: '6. Quản lý Xe ô tô (Mục 9)',
  uxo_equipment: '7. Trang thiết bị & Máy dò (Mục 10)',
  archive_warehouse: '8. Kho Hồ sơ & Vị trí Lưu trữ (Mục 12)',
  legal: '9. Kho Pháp lý & Tra cứu AI',
  reports: '10. Báo cáo & Thống kê Analytics',
  calendar: '11. Lịch Công tác & Kế hoạch Thi công',
  notifications: '12. Trung tâm Cảnh báo & Thông báo',
  user_role: '13. Quản trị Hệ thống & Cấu hình',
  gdrive: 'Google Drive & Thư mục Tự động (Mục 19)',
  form_templates: 'Quản lý Biểu mẫu Tự động (Mục 14)',
  global_search: 'Tìm kiếm Toàn hệ thống',
  audit: 'Lịch sử Thao tác Audit Log'
};

export const Topbar: React.FC<TopbarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onUserChanged
}) => {
  const [currentUser, setUserState] = useState<User>(getCurrentUser());
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [globalQuery, setGlobalQuery] = useState('');
  const userList = getUsers();

  const handleSwitchUser = (user: User) => {
    setCurrentUser(user);
    setUserState(user);
    setShowUserDropdown(false);
    if (onUserChanged) onUserChanged();
  };

  const handleGlobalSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (globalQuery.trim()) {
      setActiveTab('global_search');
    }
  };

  return (
    <header
      className={`border-b sticky top-0 z-40 transition-colors shadow-sm ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 text-slate-100'
          : 'bg-white border-slate-200 text-slate-900'
      }`}
    >
      <div className="px-4 py-3 flex items-center justify-between gap-4">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-1 ${
              isDarkMode ? 'text-slate-400 hover:text-emerald-400' : 'text-slate-500 hover:text-emerald-600'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className={`font-semibold font-mono text-[11px] whitespace-nowrap ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>
            {TAB_NAME_MAP[activeTab] || activeTab}
          </span>
        </div>

        {/* Center: Global Quick Search Input */}
        <form onSubmit={handleGlobalSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
            <input
              type="text"
              placeholder="Tìm kiếm dự án, văn bản, thiết bị, nhân sự..."
              value={globalQuery}
              onChange={e => setGlobalQuery(e.target.value)}
              className={`w-full rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none transition-colors ${
                isDarkMode
                  ? 'bg-slate-950 border border-slate-800 text-white focus:border-emerald-500'
                  : 'bg-slate-100 border border-slate-300 text-slate-900 focus:border-emerald-600'
              }`}
            />
          </div>
        </form>

        {/* Right Controls: Theme Toggle, Notifications, Account Switcher */}
        <div className="flex items-center gap-2">
          {/* Light/Dark Mode Switcher (Requirement 20) */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-colors ${
              isDarkMode
                ? 'bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700'
                : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
            }`}
            title={isDarkMode ? 'Chuyển sang Chế độ Sáng (Light Mode)' : 'Chuyển sang Chế độ Tối (Dark Mode)'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            <span className="hidden sm:inline text-[11px] font-semibold">{isDarkMode ? 'Chế độ Sáng' : 'Chế độ Tối'}</span>
          </button>

          {/* Notifications Popover */}
          <NotificationBellPopover onNavigateTab={setActiveTab} />

          {/* User Account Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                isDarkMode
                  ? 'bg-slate-800 border-slate-700 hover:bg-slate-700 text-white'
                  : 'bg-slate-100 border-slate-300 hover:bg-slate-200 text-slate-900'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-semibold leading-tight text-[11px]">{currentUser.name}</div>
                <div className="text-[9px] text-slate-400 font-mono">{currentUser.roleLabel || currentUser.role}</div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserDropdown && (
              <div
                className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-2xl p-2 z-50 text-xs space-y-2 ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800 text-slate-100'
                    : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                <div className="px-3 py-2 border-b border-slate-800">
                  <p className="font-bold text-white">{currentUser.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{currentUser.email}</p>
                  <p className="text-[10px] text-emerald-400 font-semibold mt-0.5">Vai trò: {currentUser.roleName}</p>
                </div>

                <div>
                  <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Chuyển tài khoản (Bộ phận Bom mìn Tiểu đoàn 93):
                  </div>
                  <div className="space-y-1">
                    {userList.map(u => (
                      <button
                        key={u.id}
                        onClick={() => handleSwitchUser(u)}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-xs flex items-center justify-between ${
                          u.id === currentUser.id
                            ? 'bg-emerald-950 text-emerald-300 font-bold border border-emerald-800'
                            : isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-medium text-[11px]">{u.name}</p>
                          <p className="text-[9px] text-slate-400">{u.roleLabel || u.role}</p>
                        </div>
                        {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t border-slate-800 pt-1 space-y-1">
                  <button
                    onClick={() => {
                      setActiveTab('profile');
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" /> Hồ sơ cá nhân (/profile)
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('user_role');
                      setShowUserDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 ${
                      isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" /> Phân quyền & Quản trị
                  </button>

                  <button
                    onClick={() => {
                      setShowUserDropdown(false);
                      if ((window as any).onLogoutApp) {
                        (window as any).onLogoutApp();
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 text-red-400 hover:bg-red-950/40"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-red-400" /> Đăng xuất Cổng Truy cập
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
