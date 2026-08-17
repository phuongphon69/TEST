import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Plus,
  ShieldCheck,
  Building2,
  Info,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { User, UserRole } from '../../types';
import { fixedUserAccountMode, DEFAULT_MANAGING_UNIT } from '../../config/FixedUserAccountConfig';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import { UserAccountCard } from './UserAccountCard';
import { UserAccountEditDialog } from './UserAccountEditDialog';
import { ResetPasswordDialog } from './ResetPasswordDialog';
import { LockAccountDialog } from './LockAccountDialog';
import { UserAccountSeedService } from '../../services/UserAccountSeedService';

interface UserAccountGridProps {
  currentUser?: User | null;
}

export const UserAccountGrid: React.FC<UserAccountGridProps> = ({ currentUser }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);

  // Modal states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [resettingUser, setResettingUser] = useState<User | null>(null);
  const [lockingUser, setLockingUser] = useState<User | null>(null);

  const loadData = () => {
    setIsLoading(true);
    UserAccountSeedService.runSeed();
    const data = UserAccountRepository.getAll();
    setUsers(data);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter users
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.title && u.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.phone && u.phone.includes(searchTerm));

    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;

    return matchesSearch && matchesRole;
  });

  const handleSaveEdit = (updatedUser: User) => {
    try {
      UserAccountRepository.update(updatedUser.id, updatedUser, currentUser?.name);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Lỗi cập nhật tài khoản');
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header & Mode Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-emerald-400 font-mono text-xs tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              <span>Quản trị Hệ thống & Phân quyền Cán bộ</span>
            </div>
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              DANH SÁCH TÀI KHOẢN NGƯỜI DÙNG TRONG HỆ THỐNG
            </h2>
            <div className="flex items-center gap-2 text-xs text-amber-300/90 font-medium pt-1">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Đơn vị quản lý: <strong>{DEFAULT_MANAGING_UNIT}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={isLoading}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors border border-slate-700 flex items-center gap-1.5 text-xs font-medium"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-4 h-4 text-emerald-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Làm mới</span>
            </button>

            {/* Fixed Account Notice Button */}
            {fixedUserAccountMode ? (
              <div className="relative group">
                <button
                  type="button"
                  disabled
                  className="px-4 py-2.5 bg-slate-800/80 text-slate-500 border border-slate-700/60 rounded-xl text-xs font-medium cursor-not-allowed flex items-center gap-2"
                >
                  <Lock className="w-4 h-4 text-amber-500/80" />
                  <span>+ Thêm tài khoản mới</span>
                </button>

                {/* Tooltip explaining fixed 5 accounts mode */}
                <div className="absolute right-0 top-full mt-2 w-72 p-3 bg-slate-950 border border-slate-800 rounded-xl shadow-2xl text-[11px] text-slate-300 hidden group-hover:block z-20 space-y-1">
                  <div className="font-bold text-amber-400 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5" />
                    <span>Chế độ 5 Tài khoản Cố định</span>
                  </div>
                  <p>
                    Danh sách tài khoản đã được cố định theo chuẩn sơ đồ Nhân sự Tiểu đoàn 93. Không thêm mới tài khoản ngoài cấu hình.
                  </p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-medium shadow-md transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm tài khoản mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Fixed Mode Info Banner */}
        {fixedUserAccountMode && (
          <div className="mt-4 p-3 bg-amber-950/40 border border-amber-800/40 rounded-xl text-xs text-amber-300 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                Hệ thống đang sử dụng <strong>danh sách 05 tài khoản cố định</strong> của Tiểu đoàn 93 (Document1.pdf).
              </span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Chuẩn hóa 4 Chức vụ</span>
            </span>
          </div>
        )}
      </div>

      {/* Toolbar: Search & Role Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo họ tên, email, cấp bậc, số điện thoại..."
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Role Filter Tabs */}
        <div className="flex items-center space-x-1 overflow-x-auto p-1 bg-slate-900 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedRoleFilter === 'all'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Tất cả ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('chihuy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedRoleFilter === 'chihuy'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            TĐ Trưởng
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('phochihuy')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedRoleFilter === 'phochihuy'
                ? 'bg-yellow-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Phó TĐ Trưởng
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('nhanvien')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedRoleFilter === 'nhanvien'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Nhân viên
          </button>
          <button
            type="button"
            onClick={() => setSelectedRoleFilter('quantri')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              selectedRoleFilter === 'quantri'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Quản trị viên
          </button>
        </div>
      </div>

      {/* Account Grid Cards */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUsers.map((user) => (
            <UserAccountCard
              key={user.id}
              user={user}
              currentUser={currentUser}
              onEdit={(u) => setEditingUser(u)}
              onResetPassword={(u) => setResettingUser(u)}
              onToggleLock={(u) => setLockingUser(u)}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
          <Users className="w-10 h-10 text-slate-600 mx-auto" />
          <p className="text-sm font-medium text-slate-400">
            Không tìm thấy tài khoản nào khớp với từ khóa "{searchTerm}".
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedRoleFilter('all');
            }}
            className="px-4 py-2 bg-slate-800 text-emerald-400 rounded-xl text-xs font-medium hover:bg-slate-700"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Modals */}
      {editingUser && (
        <UserAccountEditDialog
          user={editingUser}
          isOpen={!!editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleSaveEdit}
        />
      )}

      {resettingUser && (
        <ResetPasswordDialog
          user={resettingUser}
          isOpen={!!resettingUser}
          onClose={() => setResettingUser(null)}
          actorName={currentUser?.name}
        />
      )}

      {lockingUser && (
        <LockAccountDialog
          user={lockingUser}
          isOpen={!!lockingUser}
          onClose={() => setLockingUser(null)}
          onSuccess={loadData}
          actorName={currentUser?.name}
        />
      )}
    </div>
  );
};
