import React from 'react';
import { UserCheck } from 'lucide-react';
import { User } from '../../types';

interface Props {
  selectedUserId: string; // 'all' | 'unassigned' | 'unlinked' | userId
  usersList: User[];
  hasUnlinkedLegacy?: boolean;
  onChange: (userId: string) => void;
}

export const ProjectResponsibleUserFilter: React.FC<Props> = ({
  selectedUserId,
  usersList,
  hasUnlinkedLegacy = false,
  onChange
}) => {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <select
        value={selectedUserId}
        onChange={e => onChange(e.target.value)}
        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-auto max-w-xs truncate"
        title="Lọc theo người phụ trách"
      >
        <option value="all">Tất cả người phụ trách</option>
        <option value="unassigned">-- Chưa phân công --</option>
        {hasUnlinkedLegacy && (
          <option value="unlinked">-- Chưa liên kết tài khoản --</option>
        )}

        <optgroup label="Tài khoản hệ thống">
          {usersList.map(u => {
            const isLocked = u.isLocked || u.status === 'locked';
            const labelStr = `${u.name}${isLocked ? ' (Đã khóa)' : ''} - ${u.email}`;
            return (
              <option key={u.id} value={u.id}>
                {labelStr}
              </option>
            );
          })}
        </optgroup>
      </select>
    </div>
  );
};
