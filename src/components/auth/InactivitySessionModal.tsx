import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, LogOut, RefreshCw, Shield } from 'lucide-react';
import { getAuthSecurityConfig } from '../../utils/storage';

interface InactivitySessionModalProps {
  onExtendSession: () => void;
  onLogout: () => void;
  isSecretDocActive?: boolean;
}

export const InactivitySessionModal: React.FC<InactivitySessionModalProps> = ({
  onExtendSession,
  onLogout,
  isSecretDocActive = false
}) => {
  const securityConfig = getAuthSecurityConfig();
  const timeoutMins = isSecretDocActive
    ? securityConfig.secretDocSessionTimeoutMinutes || 15
    : securityConfig.sessionTimeoutMinutes || 30;

  // Countdown 120 seconds warning
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onLogout]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl max-w-md w-full p-6 text-slate-100 space-y-5 relative overflow-hidden">
        {/* Top Warning Bar */}
        <div className="flex items-center space-x-3 text-amber-400">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">Cảnh báo hết hạn phiên làm việc</h3>
            <p className="text-xs text-amber-400 font-mono">
              Thời gian không hoạt động tối đa: {timeoutMins} phút
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-2">
          <p className="text-sm font-medium text-slate-200">
            “Phiên làm việc sắp hết hạn. Bạn có muốn tiếp tục sử dụng hệ thống không?”
          </p>
          <div className="text-2xl font-mono font-bold text-amber-400 tracking-wider">
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <p className="text-xs text-slate-400">
            Hệ thống sẽ tự động đăng xuất an toàn nếu không nhận được phản hồi.
          </p>
        </div>

        {isSecretDocActive && (
          <div className="p-2.5 bg-red-950/40 border border-red-800/40 rounded-lg text-xs text-red-300 flex items-center space-x-2">
            <Shield className="w-4 h-4 text-red-400 shrink-0" />
            <span>Đang mở tài liệu Mật/Tối mật: Thời hạn tự động đăng xuất rút ngắn xuống 15 phút.</span>
          </div>
        )}

        <div className="flex items-center space-x-3 pt-1">
          <button
            onClick={onLogout}
            className="flex-1 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl flex items-center justify-center space-x-2 transition-colors border border-slate-700"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất ngay</span>
          </button>
          <button
            onClick={onExtendSession}
            className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Tiếp tục phiên</span>
          </button>
        </div>
      </div>
    </div>
  );
};
