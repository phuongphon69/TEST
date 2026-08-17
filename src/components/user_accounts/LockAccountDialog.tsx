import React, { useState } from 'react';
import { X, Lock, Unlock, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { UserAccountRepository } from '../../services/UserAccountRepository';

interface LockAccountDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  actorName?: string;
}

export const LockAccountDialog: React.FC<LockAccountDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSuccess,
  actorName
}) => {
  if (!isOpen || !user) return null;

  const isCurrentlyLocked = user.isLocked || user.status === 'locked';
  const [reason, setReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!reason.trim()) {
      setErrorMsg('Vui lòng nhập lý do thực hiện thao tác này.');
      return;
    }

    try {
      const targetLockState = !isCurrentlyLocked;
      UserAccountRepository.setLockStatus(user.id, targetLockState, reason.trim(), actorName);
      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Thao tác không thành công.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            {isCurrentlyLocked ? <Unlock className="w-5 h-5 text-emerald-400" /> : <Lock className="w-5 h-5 text-amber-400" />}
            <h3 className="text-base font-bold text-slate-100">
              {isCurrentlyLocked ? 'Mở khóa Tài khoản Cán bộ' : 'Khóa Tạm thời Tài khoản Cán bộ'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleConfirmAction} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <p className="text-xs text-slate-300 leading-relaxed">
            Bạn đang yêu cầu {isCurrentlyLocked ? 'mở khóa' : 'khóa tạm thời'} truy cập của cán bộ:
          </p>

          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
            <div className="font-bold text-sm text-slate-100">{user.name}</div>
            <div className="text-xs text-emerald-400 font-mono">{user.email}</div>
            <div className="text-xs text-slate-400 font-sans">{user.title || user.roleLabel}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1">
              Lý do {isCurrentlyLocked ? 'mở khóa' : 'khóa tài khoản'} <span className="text-red-400">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                isCurrentlyLocked
                  ? 'Ví dụ: Đã hoàn tất xác minh tài khoản, khôi phục quyền công tác...'
                  : 'Ví dụ: Cán bộ luân chuyển công tác, vi phạm quy định an toàn hệ thống...'
              }
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5 ${
                isCurrentlyLocked
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-amber-600 hover:bg-amber-500 text-white'
              }`}
            >
              {isCurrentlyLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
              <span>{isCurrentlyLocked ? 'XÁC NHẬN MỞ KHÓA' : 'XÁC NHẬN KHÓA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
