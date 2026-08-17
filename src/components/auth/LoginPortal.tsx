import React, { useState } from 'react';
import { LoginPage } from './LoginPage';
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  UserCheck,
  AlertTriangle,
  KeyRound,
  Sparkles,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  Building,
  Smartphone,
  Info,
  Globe,
  FileText,
  Clock,
  ExternalLink
} from 'lucide-react';
import { User, UserRole } from '../../types';
import {
  getUsers,
  getCurrentUser,
  setCurrentUser,
  setLoggedInStatus,
  createNewSession,
  getAuthSecurityConfig,
  saveUsers,
  addAuditLog
} from '../../utils/storage';

interface LoginPortalProps {
  onLoginSuccess: (user: User) => void;
  initialView?: 'login' | 'activate' | 'forgot' | 'reset' | 'verify2fa' | 'locked' | 'expired';
}

export const LoginPortal: React.FC<LoginPortalProps> = ({
  onLoginSuccess,
  initialView = 'login'
}) => {
  const users = getUsers();
  const securityConfig = getAuthSecurityConfig();

  const [view, setView] = useState<'login' | 'activate' | 'forgot' | 'reset' | 'verify2fa' | 'locked' | 'expired'>(initialView);

  if (view === 'login') {
    return <LoginPage onSuccess={onLoginSuccess} />;
  }

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loginError, setLoginError] = useState('');
  const [loginSuccessMsg, setLoginSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // Activation & Reset states
  const [activationCode, setActivationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 2FA state
  const [otpCode, setOtpCode] = useState('');
  const [pendingUser2FA, setPendingUser2FA] = useState<User | null>(null);

  // Password validation rules
  const validatePassword = (pwd: string) => {
    return {
      minLength: pwd.length >= 10,
      hasUpper: /[A-Z]/.test(pwd),
      hasLower: /[a-z]/.test(pwd),
      hasDigit: /[0-9]/.test(pwd),
      hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)
    };
  };

  const pwdChecks = validatePassword(newPassword);
  const isPwdValid = pwdChecks.minLength && pwdChecks.hasUpper && pwdChecks.hasLower && pwdChecks.hasDigit && pwdChecks.hasSpecial;

  // Handler for standard email/password login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const targetInput = emailOrPhone.trim().toLowerCase();
      // Match user by email or username/phone
      const matchedUser = users.find(
        u => u.email.toLowerCase() === targetInput ||
             u.id.toLowerCase() === targetInput ||
             u.phone === targetInput
      );

      // Security requirement 3.18.5 & 3.18.10: Generic failure message
      if (!matchedUser) {
        setLoginError('Thông tin đăng nhập không hợp lệ hoặc tài khoản không được phép truy cập.');
        addAuditLog('Cổng Đăng nhập', `Đăng nhập thất bại: Không tìm thấy tài khoản (${emailOrPhone})`, 'dang_nhap_that_bai');
        return;
      }

      // Check account status
      if (matchedUser.isLocked || matchedUser.status === 'locked') {
        setView('locked');
        addAuditLog('Cổng Đăng nhập', `Truy cập bị chặn: Tài khoản ${matchedUser.name} (${matchedUser.email}) đang bị khóa`, 'bi_khoa');
        return;
      }

      if (matchedUser.status === 'pending_activation') {
        setLoginError('Tài khoản chưa được kích hoạt. Vui lòng sử dụng liên kết kích hoạt từ quản trị viên.');
        return;
      }

      // If 2FA is required for this user or admin role
      if (matchedUser.twoFactorEnabled || (matchedUser.role === 'quantri' && securityConfig.require2FAForAdmins)) {
        setPendingUser2FA(matchedUser);
        setView('verify2fa');
        return;
      }

      // Complete Login
      completeLoginForUser(matchedUser, 'password');
    }, 600);
  };

  // Quick Demo Login Handler for reviewers
  const handleQuickDemoLogin = (userRole: UserRole) => {
    const demoUser = users.find(u => u.role === userRole) || users[0];
    completeLoginForUser(demoUser, 'sso');
  };

  // Google Login simulation
  const handleGoogleLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);

      // Check allowed domain if configured
      const adminUser = users.find(u => u.role === 'quantri') || users[0];
      completeLoginForUser(adminUser, 'google');
    }, 700);
  };

  const completeLoginForUser = (user: User, method: 'password' | 'google' | 'sso' = 'password') => {
    setCurrentUser(user);
    setLoggedInStatus(true);

    // Update last login details
    const nowStr = new Date().toISOString();
    const updatedUsers = users.map(u => u.id === user.id ? { ...u, lastLoginAt: nowStr, failedLoginAttempts: 0 } : u);
    saveUsers(updatedUsers);

    // Create active session in log
    createNewSession(user, method);

    addAuditLog('Cổng Đăng nhập', `Đăng nhập thành công tài khoản [${user.name}] (${user.email}) qua ${method.toUpperCase()}`, 'dang_nhap_thanh_cong');

    onLoginSuccess(user);
  };

  // Handle Account Activation Submission
  const handleActivationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!isPwdValid) {
      setLoginError('Mật khẩu chưa đáp ứng tiêu chuẩn an toàn bảo mật.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setLoginError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    // Find pending user with code or email
    const pendingUser = users.find(u => u.activationCode === activationCode.trim() || u.email.toLowerCase() === emailOrPhone.trim().toLowerCase());

    if (!pendingUser) {
      setLoginError('Mã kích hoạt không đúng hoặc đã hết hạn.');
      return;
    }

    // Update user status
    const updatedUsers = users.map(u => {
      if (u.id === pendingUser.id) {
        return {
          ...u,
          status: 'active' as const,
          mustChangePassword: false,
          activationCode: undefined
        };
      }
      return u;
    });

    saveUsers(updatedUsers, `Kích hoạt tài khoản thành công cho thành viên ${pendingUser.name}`);
    setLoginSuccessMsg('Kích hoạt tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');

    setTimeout(() => {
      completeLoginForUser({ ...pendingUser, status: 'active' }, 'password');
    }, 1200);
  };

  // Handle 2FA OTP Submission
  const handleVerify2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUser2FA) return;

    if (otpCode.length < 6) {
      setLoginError('Vui lòng nhập đủ 6 chữ số mã OTP xác thực.');
      return;
    }

    // Accept demo OTP '123456' or any valid 6-digit number
    completeLoginForUser(pendingUser2FA, 'password');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-600 selection:text-white relative overflow-hidden">
      {/* Background Military Gradient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4 flex items-center justify-between z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-lg">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Bộ Quốc Phòng • Binh Chủng Công Binh
            </h1>
            <p className="text-xs text-slate-400 font-mono">
              Tiểu đoàn 93 • Bộ phận Nghiệp vụ Rà phá Bom mìn, Vật nổ
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-xs font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-3 py-1.5 rounded-full">
          <Globe className="w-3.5 h-3.5 animate-pulse" />
          <span>HTTPS SSL Secure Portal</span>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 z-10 my-6">
        <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl">
          {/* Top Brand Banner */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 p-6 text-center border-b border-slate-800 relative">
            <div className="mx-auto w-14 h-14 bg-emerald-600/20 border border-emerald-500/40 rounded-2xl flex items-center justify-center mb-3 shadow-inner">
              <Shield className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-emerald-400 uppercase tracking-tight">
              HỆ THỐNG QUẢN LÝ NGHIỆP VỤ RÀ PHÁ BOM MÌN, VẬT NỔ
            </h2>
            <div className="mt-1 inline-flex items-center space-x-2 bg-slate-900/80 px-2.5 py-0.5 rounded border border-slate-700 text-xs text-slate-300 font-mono">
              <span>Tên viết tắt:</span>
              <strong className="text-amber-400">QLRPBM</strong>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* VIEW 1: LOGIN FORM */}
            {view === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div className="space-y-1 text-center">
                  <h3 className="text-base font-semibold text-slate-200">Đăng nhập Cổng Kiểm soát Nội bộ</h3>
                  <p className="text-xs text-slate-400">Vui lòng nhập tài khoản được cấp bởi Quản trị viên</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-start space-x-2.5 animate-shake">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{loginError}</span>
                  </div>
                )}

                {loginSuccessMsg && (
                  <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{loginSuccessMsg}</span>
                  </div>
                )}

                {/* Email or Username Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Email công vụ / Tên đăng nhập <span className="text-red-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      required
                      value={emailOrPhone}
                      onChange={(e) => setEmailOrPhone(e.target.value)}
                      placeholder="admin@binhchungcongbinh.vn"
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-medium text-slate-300">
                      Mật khẩu hệ thống <span className="text-red-400">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      Quên mật khẩu?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-10 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me option */}
                <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>Ghi nhớ phiên đăng nhập</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('activate')}
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium underline underline-offset-2"
                  >
                    Kích hoạt tài khoản lần đầu
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Đang xác thực hệ thống...</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>ĐĂNG NHẬP VÀO HỆ THỐNG</span>
                    </>
                  )}
                </button>

                {/* Google SSO Login */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-slate-900 px-2 text-slate-500">Hoặc xác thực qua Google OAuth</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
                >
                  <Globe className="w-4 h-4 text-blue-400" />
                  <span>Đăng nhập bằng Google Workplace cơ quan</span>
                </button>

                {/* Section 3.18.23 Quick Test Account Selector (For Easy Review) */}
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider mb-2 text-center flex items-center justify-center space-x-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Đăng nhập nhanh theo 4 Vai trò Mẫu (Kiểm thử)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('quantri')}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-emerald-800/40 rounded-lg text-left text-xs transition-all group"
                    >
                      <div className="font-semibold text-emerald-400 group-hover:text-emerald-300">1. Admin / Tiểu đoàn trưởng</div>
                      <div className="text-[10px] text-slate-400 font-mono">admin@binhchung...</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('vanthu')}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-blue-800/40 rounded-lg text-left text-xs transition-all group"
                    >
                      <div className="font-semibold text-blue-400 group-hover:text-blue-300">2. Văn thư & Kho hồ sơ</div>
                      <div className="text-[10px] text-slate-400 font-mono">vanthu@binhchung...</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('kythuat')}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-indigo-800/40 rounded-lg text-left text-xs transition-all group"
                    >
                      <div className="font-semibold text-indigo-400 group-hover:text-indigo-300">3. Chuyên viên Dự án</div>
                      <div className="text-[10px] text-slate-400 font-mono">chuyenvien@binh...</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('thietbi')}
                      className="p-2 bg-slate-950 hover:bg-slate-800 border border-amber-800/40 rounded-lg text-left text-xs transition-all group"
                    >
                      <div className="font-semibold text-amber-400 group-hover:text-amber-300">4. Quản lý Thiết bị & Xe</div>
                      <div className="text-[10px] text-slate-400 font-mono">quanlythietbi@...</div>
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* VIEW 2: ACCOUNT ACTIVATION (/activate-account) */}
            {view === 'activate' && (
              <form onSubmit={handleActivationSubmit} className="space-y-4">
                <div className="space-y-1 text-center">
                  <h3 className="text-base font-semibold text-amber-400">Kích hoạt tài khoản lần đầu</h3>
                  <p className="text-xs text-slate-400">Nhập mã kích hoạt từ email công vụ & tạo mật khẩu mới</p>
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Mã kích hoạt hoặc Email công vụ <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={activationCode || emailOrPhone}
                    onChange={(e) => {
                      setActivationCode(e.target.value);
                      setEmailOrPhone(e.target.value);
                    }}
                    placeholder="Nhập mã ACT-XXXXXX hoặc email"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-mono text-amber-300 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Tạo mật khẩu mới <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mật khẩu tối thiểu 10 ký tự"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Password Policy Indicator */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-[11px]">
                  <p className="font-semibold text-slate-300">Tiêu chuẩn mật khẩu an toàn:</p>
                  <div className="grid grid-cols-2 gap-1 text-slate-400">
                    <span className={pwdChecks.minLength ? 'text-emerald-400 font-medium' : ''}>✓ Tối thiểu 10 ký tự</span>
                    <span className={pwdChecks.hasUpper ? 'text-emerald-400 font-medium' : ''}>✓ Ít nhất 1 chữ hoa (A-Z)</span>
                    <span className={pwdChecks.hasLower ? 'text-emerald-400 font-medium' : ''}>✓ Ít nhất 1 chữ thường (a-z)</span>
                    <span className={pwdChecks.hasDigit ? 'text-emerald-400 font-medium' : ''}>✓ Ít nhất 1 chữ số (0-9)</span>
                    <span className={pwdChecks.hasSpecial ? 'text-emerald-400 font-medium font-bold' : ''}>✓ Ký tự đặc biệt (!@#$)</span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Xác nhận mật khẩu mới <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!isPwdValid}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-medium rounded-lg text-sm shadow-lg flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>KÍCH HOẠT VÀ ĐĂNG NHẬP</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    ← Quay lại màn hình đăng nhập
                  </button>
                </div>
              </form>
            )}

            {/* VIEW 3: FORGOT PASSWORD */}
            {view === 'forgot' && (
              <div className="space-y-4 text-center">
                <h3 className="text-base font-semibold text-slate-200">Quên mật khẩu tài khoản</h3>
                <p className="text-xs text-slate-400">
                  Nhập email công vụ đã đăng ký. Hệ thống sẽ gửi hướng dẫn khôi phục mật khẩu đến email cán bộ.
                </p>
                <div className="text-left">
                  <label className="block text-xs font-medium text-slate-300 mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={emailOrPhone}
                    onChange={(e) => setEmailOrPhone(e.target.value)}
                    placeholder="canbo@binhchungcongbinh.vn"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    alert('Đã gửi liên kết khôi phục mật khẩu tới email công vụ. Vui lòng kiểm tra hộp thư!');
                    setView('login');
                  }}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium"
                >
                  GỬI YÊU CẦU ĐẶT LẠI MẬT KHẨU
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 block mx-auto"
                >
                  ← Quay lại màn hình đăng nhập
                </button>
              </div>
            )}

            {/* VIEW 4: VERIFY 2FA OTP */}
            {view === 'verify2fa' && (
              <form onSubmit={handleVerify2FASubmit} className="space-y-4 text-center">
                <div className="w-12 h-12 bg-emerald-600/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">Xác thực hai bước (2FA)</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Tài khoản yêu cầu mã OTP bảo mật 6 chữ số từ ứng dụng xác thực hoặc tin nhắn SMS
                  </p>
                </div>
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    className="w-48 mx-auto text-center tracking-[0.5em] text-xl font-mono py-2 bg-slate-950 border border-emerald-600 rounded-lg text-emerald-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm"
                >
                  XÁC NHẬN MÃ OTP (Mã thử nghiệm: 123456)
                </button>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="text-xs text-slate-400 hover:text-slate-200 block mx-auto"
                >
                  ← Hủy & Quay lại
                </button>
              </form>
            )}

            {/* VIEW 5: ACCOUNT LOCKED */}
            {view === 'locked' && (
              <div className="space-y-4 text-center">
                <div className="w-12 h-12 bg-red-950 border border-red-800 rounded-full flex items-center justify-center mx-auto text-red-400">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-base font-semibold text-red-400">Tài khoản tạm thời bị khóa</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Vì lý do an toàn bảo mật hoặc do đăng nhập sai quá số lần quy định, tài khoản của bạn đã bị khóa. Vui lòng liên hệ Quản trị viên hệ thống để mở khóa.
                </p>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-left text-xs space-y-1 font-mono text-slate-400">
                  <p>• Hotline An toàn thông tin: 0988.999.000</p>
                  <p>• Email Quản trị viên: admin@binhchungcongbinh.vn</p>
                </div>
                <button
                  type="button"
                  onClick={() => setView('login')}
                  className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
                >
                  Thử đăng nhập tài khoản khác
                </button>
              </div>
            )}
          </div>

          {/* Security Notice Warning Banner (Req 3.18.2) */}
          <div className="bg-slate-950 p-4 border-t border-slate-800/80 text-[11px] text-slate-400 leading-normal flex items-start space-x-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-400 mb-0.5">CẢNH BÁO AN NINH HỆ THỐNG NỘI BỘ</p>
              <p>
                Hệ thống chỉ dành cho người dùng đã được cấp quyền. Mọi hoạt động đăng nhập, truy cập, tải tài liệu và thay đổi dữ liệu đều được ghi nhật ký an ninh.
              </p>
            </div>
          </div>

          {/* Footer App Info & Terms */}
          <div className="bg-slate-900 px-6 py-3 border-t border-slate-800 text-center flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Phiên bản: v3.18.0 (Build 2026)</span>
            <button
              onClick={() => setShowTermsModal(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors underline"
            >
              Điều khoản & Chính sách bảo mật
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-3 text-center text-xs text-slate-600 font-mono z-10">
        <p>HỆ THỐNG QUẢN LÝ NGHIỆP VỤ RÀ PHÁ BOM MÌN, VẬT NỔ (QLRPBM) • ĐƠN VỊ TIỂU ĐOÀN 93</p>
      </footer>

      {/* Terms & Privacy Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>Điều khoản Sử dụng & Quy định Bảo mật QLRPBM</span>
            </h3>
            <div className="text-xs text-slate-300 space-y-2 max-h-80 overflow-y-auto pr-2">
              <p>1. Tất cả dữ liệu dự án, vị trí rà phá bom mìn và tài liệu thuộc danh mục Mật/Tối mật của Bộ Quốc phòng.</p>
              <p>2. Không sao chép, chia sẻ tài liệu hoặc tài khoản cho cá nhân ngoài hệ thống.</p>
              <p>3. Mọi phiên hoạt động đều tự động ghi lại địa chỉ IP, thiết bị và lịch sử thao tác dữ liệu.</p>
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowTermsModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-medium"
              >
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
