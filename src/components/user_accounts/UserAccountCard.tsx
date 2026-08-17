import React from 'react';
import {
  Edit3,
  KeyRound,
  Lock,
  Unlock,
  Mail,
  Phone,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  ShieldAlert
} from 'lucide-react';
import { User } from '../../types';
import { RoleBadge } from './RoleBadge';
import { PermissionBadge } from './PermissionBadge';
import { formatDateVN } from '../../utils/formatters';

interface UserAccountCardProps {
  user: User;
  onEdit: (user: User) => void;
  onResetPassword: (user: User) => void;
  onToggleLock: (user: User) => void;
  currentUser?: User | null;
}

export const UserAccountCard: React.FC<UserAccountCardProps> = ({
  user,
  onEdit,
  onResetPassword,
  onToggleLock,
  currentUser
}) => {
  const isLocked = user.isLocked || user.status === 'locked';

  // Get initials for fallback avatar
  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Derive Rank & Position string if available in title or user properties
  const titleParts = (user.title || '').split('-').map(s => s.trim());
  const rankStr = titleParts[0] || (user.role === 'chihuy' ? 'Thượng tá' : user.role === 'quantri' ? 'Đại úy CN' : 'Thiếu tá CN');
  const positionStr = titleParts[1] || user.roleLabel || 'Nhân viên';

  return (
    <div
      className={`bg-slate-900/90 border rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between relative group ${
        isLocked
          ? 'border-red-900/60 bg-red-950/10'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-slate-950/50'
      }`}
    >
      {/* Top Header Row with Status & Role */}
      <div className="p-5 space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-3">
            {/* Avatar or Letter Fallback */}
            <div className="relative">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-12 h-12 rounded-full object-cover border-2 border-slate-700 shadow-md"
                  onError={(e) => {
                    // Fallback to letter avatar if image breaks
                    (e.target as HTMLElement).style.display = 'none';
                    (e.target as HTMLElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div
                className={`w-12 h-12 rounded-full border-2 border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 text-emerald-400 font-bold flex items-center justify-center text-base shadow-md ${
                  user.avatar ? 'hidden' : ''
                }`}
              >
                {getInitials(user.name)}
              </div>
              <span
                className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                  isLocked ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                title={isLocked ? 'Tài khoản đã bị khóa' : 'Tài khoản đang hoạt động'}
              />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{user.name}</span>
              </h3>
              <div className="text-xs text-amber-400/90 font-medium flex items-center gap-1 mt-0.5">
                <span className="bg-amber-950/60 text-amber-300 px-1.5 py-0.5 rounded border border-amber-800/40 text-[11px]">
                  {rankStr}
                </span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-300">{positionStr}</span>
              </div>
            </div>
          </div>

          {/* Role Badge */}
          <RoleBadge role={user.role} roleLabel={user.roleLabel} size="sm" />
        </div>

        {/* Locked Warning Banner if applicable */}
        {isLocked && (
          <div className="p-2.5 bg-red-950/80 border border-red-800/80 rounded-lg text-xs text-red-300 flex items-center gap-2 animate-pulse">
            <Lock className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-medium">Tài khoản này đang bị KHÓA hoạt động</span>
          </div>
        )}

        {/* Contact & Department Details */}
        <div className="space-y-1.5 pt-1 text-xs text-slate-300 font-mono">
          <div className="flex items-center gap-2 text-slate-300">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-emerald-400 font-sans font-medium">{user.email}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{user.phone || '0989.930.000'}</span>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate text-slate-300 font-sans">
              {user.departmentOrUnit || 'Bộ phận bom mìn Tiểu đoàn 93'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-[11px] pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>
              Đăng nhập gần nhất:{' '}
              {user.lastLoginAt ? formatDateVN(user.lastLoginAt) : 'Chưa có thông tin'}
            </span>
          </div>
        </div>

        {/* Main Permission Badges */}
        <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Quyền hạn chính:</p>
          <div className="flex flex-wrap gap-1">
            {(user.permissions || ['Xem dữ liệu']).map((perm, idx) => (
              <PermissionBadge key={idx} label={perm} />
            ))}
          </div>
        </div>
      </div>

      {/* Card Action Buttons Toolbar */}
      <div className="bg-slate-950/80 px-4 py-3 border-t border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3 h-3" />
            <span>Đã liên kết</span>
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(user)}
            aria-label={`Chỉnh sửa tài khoản ${user.name}`}
            title="Chỉnh sửa thông tin tài khoản"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg transition-colors border border-slate-700 flex items-center gap-1 text-xs font-medium"
          >
            <Edit3 className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Sửa</span>
          </button>

          {/* Reset Password Button */}
          <button
            type="button"
            onClick={() => onResetPassword(user)}
            aria-label={`Reset mật khẩu tài khoản ${user.name}`}
            title="Cấp mật khẩu tạm thời mới"
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-amber-300 rounded-lg transition-colors border border-slate-700 flex items-center gap-1 text-xs font-medium"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Reset MK</span>
          </button>

          {/* Lock / Unlock Button */}
          <button
            type="button"
            onClick={() => onToggleLock(user)}
            aria-label={isLocked ? `Mở khóa tài khoản ${user.name}` : `Khóa tài khoản ${user.name}`}
            title={isLocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}
            className={`p-1.5 rounded-lg transition-colors border flex items-center gap-1 text-xs font-medium ${
              isLocked
                ? 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-700 text-emerald-300'
                : 'bg-amber-950/80 hover:bg-amber-900 border-amber-800 text-amber-300'
            }`}
          >
            {isLocked ? (
              <>
                <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Mở khóa</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Khóa</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
