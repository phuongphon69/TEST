import React, { useState } from 'react';
import {
  Shield,
  Eye,
  EyeOff,
  Lock,
  Mail,
  LogIn,
  AlertTriangle,
  UserCheck,
  Building2,
  Check
} from 'lucide-react';
import { User } from '../../types';
import { FIXED_USER_ACCOUNTS, DEFAULT_MANAGING_UNIT } from '../../config/FixedUserAccountConfig';
import { AuthService } from '../../services/AuthService';

interface LoginFormProps {
  onSuccess: (user: User) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [emailOrUsername, setEmailOrUsername] = useState('phuong.nguyenhuy@tieudoan93.bccb');
  const [password, setPassword] = useState('D93@Pass2026');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrUsername.trim()) {
      setErrorMessage('Vui lòng nhập Tên đăng nhập hoặc Email công vụ.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      try {
        const loggedUser = AuthService.login(emailOrUsername.trim(), password);
        setIsSubmitting(false);
        onSuccess(loggedUser);
      } catch (err: any) {
        setIsSubmitting(false);
        setErrorMessage(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại.');
      }
    }, 400);
  };

  const handleSelectQuickAccount = (accountEmail: string) => {
    setEmailOrUsername(accountEmail);
    setPassword('D93@Pass2026');
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 sm:p-8 space-y-6 bg-slate-900/95 border border-slate-800 rounded-3xl shadow-2xl backdrop-blur-xl">
      {/* Brand Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-emerald-900/50 to-slate-950 border border-emerald-500/30 text-emerald-400 shadow-inner">
          <Shield className="w-8 h-8" />
        </div>

        <h2 className="text-lg font-black text-slate-100 tracking-tight uppercase leading-snug">
          HỆ THỐNG QUẢN LÝ NGHIỆP VỤ RÀ PHÁ BOM MÌN
        </h2>

        <div className="flex items-center justify-center gap-1.5 text-xs text-amber-400 font-medium">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>{DEFAULT_MANAGING_UNIT}</span>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="p-3.5 bg-red-950/80 border border-red-800 rounded-2xl text-xs text-red-200 flex items-start gap-2.5 animate-shake shadow-lg">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email or Username Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Tên đăng nhập / Email công vụ <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              required
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              placeholder="VD: phuong.nguyenhuy@tieudoan93.bccb"
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Password Input with Show/Hide Toggle */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Mật khẩu hệ thống <span className="text-red-400">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mật khẩu công vụ..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 p-1 text-slate-500 hover:text-slate-300 transition-colors"
              title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <label className="flex items-center space-x-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
            />
            <span>Ghi nhớ phiên đăng nhập</span>
          </label>
          <span className="text-emerald-400/80 text-[11px]">Bảo mật Binh chủng</span>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-950/50 transition-all active:scale-[0.99] flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>ĐANG XÁC THỰC DỮ LIỆU...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>ĐĂNG NHẬP HỆ THỐNG</span>
            </>
          )}
        </button>
      </form>

      {/* Quick Account Selector Pills for 5 Fixed Accounts */}
      <div className="pt-4 border-t border-slate-800 space-y-2">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Tài khoản cố định (Tiểu đoàn 93):</span>
          <span className="text-amber-400 font-mono text-[10px]">5 Cán bộ</span>
        </p>

        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {FIXED_USER_ACCOUNTS.map((acc) => {
            const isSelected = emailOrUsername.toLowerCase() === acc.email.toLowerCase();
            return (
              <button
                key={acc.id}
                type="button"
                onClick={() => handleSelectQuickAccount(acc.email)}
                className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between ${
                  isSelected
                    ? 'bg-emerald-950/70 border-emerald-500/80 text-emerald-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 font-bold text-[10px] text-amber-400 flex items-center justify-center shrink-0">
                    {acc.fullName.slice(0, 1)}
                  </div>
                  <div className="truncate text-left">
                    <div className="text-xs font-bold truncate text-slate-200">
                      {acc.rankTitle} {acc.fullName}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">
                      {acc.position} • {acc.roleLabel}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
