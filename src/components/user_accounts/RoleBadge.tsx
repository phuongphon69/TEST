import React from 'react';
import { Shield, Award, UserCheck, Star } from 'lucide-react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  roleLabel?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, roleLabel, size = 'md' }) => {
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';
  let Icon = UserCheck;
  let text = roleLabel || 'Nhân viên';

  switch (role) {
    case 'quantri':
      badgeStyle = 'bg-purple-950/80 text-purple-300 border-purple-700/60 shadow-purple-950/50';
      Icon = Shield;
      text = roleLabel || 'Quản trị viên';
      break;

    case 'chihuy':
      badgeStyle = 'bg-amber-950/80 text-amber-300 border-amber-600/60 shadow-amber-950/50';
      Icon = Award;
      text = roleLabel || 'Tiểu đoàn trưởng';
      break;

    case 'phochihuy':
      badgeStyle = 'bg-yellow-950/70 text-yellow-300 border-yellow-600/50 shadow-yellow-950/50';
      Icon = Star;
      text = roleLabel || 'Phó Tiểu đoàn trưởng';
      break;

    case 'nhanvien':
    case 'kythuat':
    case 'vanthu':
    case 'thietbi':
    default:
      badgeStyle = 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60 shadow-emerald-950/50';
      Icon = UserCheck;
      text = roleLabel || 'Nhân viên';
      break;
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  }[size];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shadow-sm ${badgeStyle} ${sizeClasses}`}
    >
      <Icon className={`${iconSizes} shrink-0`} />
      <span>{text}</span>
    </span>
  );
};
