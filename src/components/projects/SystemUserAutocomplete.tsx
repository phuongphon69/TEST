import React, { useState, useEffect, useRef } from 'react';
import { User } from '../../types';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import { ProjectAssignmentService } from '../../services/ProjectAssignmentService';
import { UserCheck, Search, ChevronDown, X, Lock, ShieldAlert, Check } from 'lucide-react';

export interface SystemUserSelectionData {
  responsibleUserId: string;
  responsiblePersonId?: string;
  responsibleName: string;
  responsibleRank?: string;
  responsiblePosition?: string;
  responsibleEmail?: string;
  unit?: string;
}

interface Props {
  selectedUserId?: string;
  selectedName?: string;
  onChange: (data: SystemUserSelectionData) => void;
  required?: boolean;
  disabled?: boolean;
  label?: string;
}

export const SystemUserAutocomplete: React.FC<Props> = ({
  selectedUserId,
  selectedName,
  onChange,
  required = false,
  disabled = false,
  label = 'Người phụ trách dự án (Chủ nhiệm / Quản lý chính)'
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [eligibleUsers, setEligibleUsers] = useState<User[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoading(true);
    const users = UserAccountRepository.getAll();
    setAllUsers(users);

    // Filter active & assignable users
    const assignable = ProjectAssignmentService.getAssignableProjectManagers(users);
    setEligibleUsers(assignable);
    setIsLoading(false);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Selected user account object lookup
  const selectedUserObj = allUsers.find(u => u.id === selectedUserId);
  const isSelectedUserLocked = selectedUserObj?.isLocked === true || selectedUserObj?.status === 'locked';

  // Filter list by search query (Name, Title, Email, Role, Unit)
  const filteredUsers = eligibleUsers.filter(u => {
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    const nameMatch = u.name.toLowerCase().includes(q);
    const titleMatch = (u.title || '').toLowerCase().includes(q);
    const emailMatch = u.email.toLowerCase().includes(q);
    const roleMatch = (u.roleLabel || u.role || '').toLowerCase().includes(q);
    const unitMatch = (u.departmentOrUnit || '').toLowerCase().includes(q);
    return nameMatch || titleMatch || emailMatch || roleMatch || unitMatch;
  });

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'quantri':
        return <span className="bg-purple-950 text-purple-300 border border-purple-700/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">Quản trị viên</span>;
      case 'chihuy':
        return <span className="bg-amber-950 text-amber-300 border border-amber-700/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">Tiểu đoàn trưởng</span>;
      default:
        return <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-1.5 py-0.5 rounded text-[10px] font-semibold">Nhân viên</span>;
    }
  };

  const handleSelect = (u: User) => {
    // Extract title components if available
    const titleParts = (u.title || '').split('·').map(s => s.trim());
    const rank = titleParts[0] || '';
    const position = titleParts[1] || u.title || 'Cán bộ quản lý';

    onChange({
      responsibleUserId: u.id,
      responsiblePersonId: (u as any).personnelId || (u as any).personId || undefined,
      responsibleName: u.name,
      responsibleRank: rank,
      responsiblePosition: position,
      responsibleEmail: u.email,
      unit: u.departmentOrUnit || 'Tiểu đoàn 93'
    });
    setIsOpen(false);
    setQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({
      responsibleUserId: '',
      responsiblePersonId: undefined,
      responsibleName: '',
      responsibleRank: '',
      responsiblePosition: '',
      responsibleEmail: '',
      unit: ''
    });
    setQuery('');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-slate-400 mb-1 text-xs font-medium">
        {label} {required && <span className="text-rose-400">*</span>}
      </label>

      {/* Selected Card View */}
      {selectedUserId || selectedName ? (
        <div
          className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs border ${
            isSelectedUserLocked
              ? 'bg-rose-950/20 border-rose-800/80'
              : 'bg-slate-900 border-amber-500/40 shadow-md'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 ${
                isSelectedUserLocked
                  ? 'bg-rose-900/30 border-rose-700 text-rose-400'
                  : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              }`}
            >
              {isSelectedUserLocked ? <Lock className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </div>

            <div className="min-w-0">
              <div className="font-bold text-slate-100 flex items-center gap-1.5 flex-wrap">
                <span className="truncate">{selectedName || selectedUserObj?.name}</span>
                {isSelectedUserLocked && (
                  <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1 shrink-0">
                    <Lock className="w-2.5 h-2.5" /> Tài khoản đã khóa
                  </span>
                )}
                {selectedUserObj && getRoleBadge(selectedUserObj.role)}
              </div>

              <div className="text-[11px] text-slate-400 truncate flex items-center gap-2 mt-0.5 flex-wrap">
                <span>{selectedUserObj?.title || 'Cán bộ quản lý'}</span>
                {selectedUserObj?.departmentOrUnit && (
                  <span className="text-slate-500">• {selectedUserObj.departmentOrUnit}</span>
                )}
                {(selectedUserObj?.email || selectedName) && (
                  <span className="text-slate-500 font-mono">• {selectedUserObj?.email || ''}</span>
                )}
              </div>
            </div>
          </div>

          {!disabled && (
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg border border-slate-700 font-medium transition-colors"
              >
                Đổi
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                title="Xóa lựa chọn"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Autocomplete Input Search */
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            disabled={disabled}
            required={required}
            placeholder="Tìm chọn tài khoản hệ thống (Họ tên, Cấp bậc, Chức vụ, Email...)"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
        </div>
      )}

      {/* Autocomplete Dropdown Panel */}
      {isOpen && !disabled && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 max-h-64 overflow-y-auto divide-y divide-slate-800/80">
          <div className="p-2.5 bg-slate-950/90 sticky top-0 border-b border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
            <span className="font-medium text-slate-300 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              Danh sách tài khoản hệ thống đủ quyền ({filteredUsers.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">UserAccountRepository</span>
          </div>

          {isLoading ? (
            <div className="p-4 text-center text-xs text-slate-400 space-y-1">
              <div className="animate-spin w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full mx-auto"></div>
              <span>Đang tải danh sách tài khoản hệ thống...</span>
            </div>
          ) : eligibleUsers.length === 0 ? (
            <div className="p-4 text-center text-xs text-amber-400 bg-amber-950/20">
              <ShieldAlert className="w-5 h-5 text-amber-400 mx-auto mb-1" />
              <p className="font-semibold">Chưa có tài khoản hệ thống hợp lệ!</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Vui lòng tạo hoặc mở khóa tài khoản trong Quản trị Tài khoản trước khi giao phụ trách dự án.
              </p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Không tìm thấy tài khoản nào khớp với từ khóa "{query}".
            </div>
          ) : (
            filteredUsers.map(u => {
              const isSelected = u.id === selectedUserId;
              return (
                <div
                  key={u.id}
                  onClick={() => handleSelect(u)}
                  className={`p-3 hover:bg-slate-800/80 cursor-pointer transition-colors flex items-center justify-between gap-3 ${
                    isSelected ? 'bg-amber-500/10 border-l-2 border-amber-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {u.avatar ? (
                      <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover border border-slate-700 shrink-0" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 font-bold text-amber-400 text-xs">
                        {u.name.charAt(0)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span className="truncate">{u.name}</span>
                        {getRoleBadge(u.role)}
                      </div>

                      <div className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                        {u.title || 'Cán bộ hệ thống'}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono truncate flex items-center gap-2 mt-0.5">
                        <span>📧 {u.email}</span>
                        {u.departmentOrUnit && <span>• 🏢 {u.departmentOrUnit}</span>}
                      </div>
                    </div>
                  </div>

                  {isSelected && <Check className="w-4 h-4 text-amber-400 shrink-0" />}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
