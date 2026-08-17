import React, { useState } from 'react';
import { X, KeyRound, Copy, Check, ShieldAlert, AlertTriangle } from 'lucide-react';
import { User } from '../../types';
import { UserAccountRepository } from '../../services/UserAccountRepository';

interface ResetPasswordDialogProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  actorName?: string;
}

export const ResetPasswordDialog: React.FC<ResetPasswordDialogProps> = ({
  user,
  isOpen,
  onClose,
  actorName
}) => {
  if (!isOpen || !user) return null;

  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleGenerateReset = () => {
    try {
      const result = UserAccountRepository.resetPassword(user.id, actorName);
      setTempPassword(result.tempPassword);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể cấp lại mật khẩu.');
    }
  };

  const handleCopy = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setTempPassword(null);
    setCopied(false);
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-amber-400">
            <KeyRound className="w-5 h-5" />
            <h3 className="text-base font-bold">Cấp lại Mật khẩu Tạm thời</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!tempPassword ? (
            <>
              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn sắp tạo mật khẩu tạm thời mới cho cán bộ:
              </p>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <div className="font-bold text-sm text-slate-100">{user.name}</div>
                <div className="text-xs text-emerald-400 font-mono">{user.email}</div>
                <div className="text-xs text-slate-400 font-sans">{user.title || user.roleLabel}</div>
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/50 rounded-xl text-xs text-amber-300 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400" />
                  <span>Quy định an toàn mật khẩu:</span>
                </p>
                <ul className="list-disc list-inside text-[11px] text-amber-200/90 space-y-0.5">
                  <li>Mật khẩu tạm thời có độ dài 12 ký tự ngẫu nhiên an toàn.</li>
                  <li>Chỉ hiển thị 01 lần duy nhất trên màn hình này.</li>
                  <li>Buộc cán bộ đổi mật khẩu ngay khi đăng nhập lần đầu.</li>
                  <li>Mật khẩu không được lưu plain-text trong Nhật ký Hệ thống.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleGenerateReset}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium shadow-md flex items-center gap-1.5"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>TẠO MẬT KHẨU TẠM THỜI</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="p-4 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-center space-y-3">
                <p className="text-xs font-medium text-emerald-300">
                  Mật khẩu tạm thời mới đã được khởi tạo thành công:
                </p>

                <div className="p-3 bg-slate-950 border border-emerald-600/60 rounded-lg text-lg font-mono font-bold tracking-wider text-emerald-400 flex items-center justify-between">
                  <span>{tempPassword}</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="p-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 rounded-lg transition-colors border border-emerald-500/30 flex items-center gap-1 text-xs font-sans font-normal"
                    title="Sao chép mật khẩu"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Đã chép!' : 'Sao chép'}</span>
                  </button>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  Vui lòng cung cấp mật khẩu này cho cán bộ <strong className="text-slate-200">{user.name}</strong>. Màn hình này sẽ không lưu trữ mật khẩu sau khi đóng.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg text-xs font-medium"
                >
                  Đã hoàn tất & Đóng
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
