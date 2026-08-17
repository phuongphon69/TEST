import React, { useState } from 'react';
import {
  User as UserIcon,
  Shield,
  Key,
  Smartphone,
  Clock,
  LogOut,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  FileText,
  Building,
  History,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Send
} from 'lucide-react';
import { User, AuthSession } from '../../types';
import {
  getCurrentUser,
  getUsers,
  saveUsers,
  getAuthSessions,
  saveAuthSessions,
  addAuditLog,
  getAuditLogs,
  addPermissionRequest
} from '../../utils/storage';
import { formatDateVN } from '../../utils/formatters';

export const ProfileManager: React.FC = () => {
  const [user, setUser] = useState<User>(getCurrentUser());
  const [activeTab, setActiveTab] = useState<'info' | 'sessions' | 'password' | '2fa' | 'history'>('info');

  // Password change form
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdMsg, setPwdMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled || false);
  const [twoFactorMsg, setTwoFactorMsg] = useState('');

  // Permission Request Modal state
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reqModule, setReqModule] = useState('documents');
  const [reqModuleName, setReqModuleName] = useState('Quản lý Văn bản & Tờ trình');
  const [reqReason, setReqReason] = useState('');
  const [reqDays, setReqDays] = useState(30);

  const sessions = getAuthSessions().filter(s => s.userId === user.id);
  const auditLogs = getAuditLogs().filter(l => (l.userName || '').toLowerCase().includes(user.name.toLowerCase()) || (l.userName || '').toLowerCase().includes(user.email.toLowerCase()));

  // Password change handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMsg(null);

    if (newPassword.length < 10) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu mới phải có tối thiểu 10 ký tự.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Mật khẩu xác nhận không trùng khớp.' });
      return;
    }

    setPwdMsg({ type: 'success', text: 'Đã đổi mật khẩu thành công và tự động đăng xuất các thiết bị khác!' });
    addAuditLog('Tài khoản Cá nhân', `Thành viên ${user.name} đã thay đổi mật khẩu tài khoản thành công`, 'doi_mat_khau');

    // Revoke other active sessions
    const allSessions = getAuthSessions();
    const updatedSessions = allSessions.map(s => s.userId === user.id ? { ...s, status: 'logged_out' as const } : s);
    saveAuthSessions(updatedSessions);

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // Toggle 2FA handler
  const handleToggle2FA = () => {
    const nextVal = !twoFactorEnabled;
    setTwoFactorEnabled(nextVal);
    const users = getUsers();
    const updated = users.map(u => u.id === user.id ? { ...u, twoFactorEnabled: nextVal } : u);
    saveUsers(updated);
    setUser({ ...user, twoFactorEnabled: nextVal });
    setTwoFactorMsg(nextVal ? 'Đã bật xác thực hai bước (2FA) thành công!' : 'Đã tắt xác thực hai bước.');
    addAuditLog('Tài khoản Cá nhân', `Thành viên ${user.name} đã ${nextVal ? 'bật' : 'tắt'} xác thực 2FA`, 'thay_doi_baomat');
  };

  // Logout other devices
  const handleLogoutOtherDevices = () => {
    const allSessions = getAuthSessions();
    const updated = allSessions.map(s => {
      if (s.userId === user.id && s.id !== allSessions[0]?.id) {
        return { ...s, status: 'logged_out' as const };
      }
      return s;
    });
    saveAuthSessions(updated);
    addAuditLog('Tài khoản Cá nhân', `Thành viên ${user.name} đã thu hồi phiên đăng xuất khỏi tất cả thiết bị khác`, 'thu_hoi_phien');
    alert('Đã đăng xuất tài khoản khỏi tất cả thiết bị khác!');
  };

  // Submit permission request
  const handleSendRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addPermissionRequest({
      requesterId: user.id,
      requesterName: user.name,
      requesterEmail: user.email,
      requestedModule: reqModule,
      requestedModuleName: reqModuleName,
      accessType: 'edit',
      reason: reqReason,
      durationDays: reqDays,
      requestedExpiresAt: new Date(Date.now() + reqDays * 86400000).toISOString().split('T')[0]
    });
    setShowRequestModal(false);
    setReqReason('');
    alert('Đã gửi yêu cầu cấp quyền tới Quản trị viên hệ thống!');
  };

  return (
    <div className="space-y-6">
      {/* Profile Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-600 text-white rounded-full border border-slate-900">
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-100">{user.name}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {user.roleLabel}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{user.title}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">{user.email} • {user.departmentOrUnit}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowRequestModal(true)}
            className="px-3.5 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Yêu cầu Cấp thêm Quyền</span>
          </button>
        </div>
      </div>

      {/* Tabs bar */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          onClick={() => setActiveTab('info')}
          className={`pb-3 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'info'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Thông tin & Phân quyền</span>
        </button>
        <button
          onClick={() => setActiveTab('sessions')}
          className={`pb-3 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'sessions'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Phiên & Thiết bị Đăng nhập ({sessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-3 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'password'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Đổi Mật khẩu</span>
        </button>
        <button
          onClick={() => setActiveTab('2fa')}
          className={`pb-3 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === '2fa'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>Bảo mật 2FA</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-xs font-medium border-b-2 flex items-center space-x-1.5 transition-colors ${
            activeTab === 'history'
              ? 'border-emerald-500 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch sử Truy cập Bản thân</span>
        </button>
      </div>

      {/* TAB 1: INFO & PERMISSIONS */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              <span>Hồ sơ Cán bộ</span>
            </h3>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Họ và tên:</span>
                <p className="font-semibold text-slate-200">{user.name}</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Số điện thoại:</span>
                <p className="font-semibold text-slate-200">{user.phone}</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Email công vụ:</span>
                <p className="font-semibold text-slate-200 font-mono">{user.email}</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Đơn vị quản lý:</span>
                <p className="font-semibold text-slate-200">{user.departmentOrUnit}</p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Mức độ bảo mật hồ sơ:</span>
                <p className="font-semibold text-amber-400 uppercase">
                  {user.secrecyLevel === 'toi_mat' ? 'Tối mật' : user.secrecyLevel === 'mat' ? 'Mật' : 'Thường'}
                </p>
              </div>
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <span className="text-slate-500">Trạng thái tài khoản:</span>
                <p className="font-semibold text-emerald-400">Đang hoạt động (Active)</p>
              </div>
            </div>

            <div className="p-3 bg-amber-950/20 border border-amber-800/30 rounded-xl text-xs text-amber-300 flex items-center space-x-2">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Lưu ý: Bạn không được tự thay đổi vai trò hoặc cấp quyền cá nhân.</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Danh sách Quyền hạn Được cấp</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {user.permissions.map((perm, idx) => (
                <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-slate-400">Mức truy cập Phân hệ:</span>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {Object.entries(user.featurePermissions || {}).map(([key, val]) => (
                  <span key={key} className="px-2 py-1 bg-slate-950 border border-slate-800 rounded text-[11px] font-mono text-slate-300">
                    {key}: <strong className="text-emerald-400">{val}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE SESSIONS */}
      {activeTab === 'sessions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>Phiên & Thiết bị Đăng nhập Hiện tại</span>
            </h3>
            <button
              onClick={handleLogoutOtherDevices}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất khỏi thiết bị khác</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {sessions.map((sess) => (
              <div key={sess.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-semibold text-slate-200">{sess.device}</p>
                      {sess.status === 'active' && (
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-mono">
                          Đang hoạt động
                        </span>
                      )}
                    </div>
                    <p className="text-slate-400 font-mono mt-0.5">
                      IP: {sess.ipAddress} • {sess.location} • {sess.browser}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Đăng nhập lúc: {sess.loginTime} • Hoạt động gần nhất: {sess.lastActiveTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PASSWORD CHANGE */}
      {activeTab === 'password' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
            <Key className="w-4 h-4 text-emerald-400" />
            <span>Đổi Mật khẩu Tài khoản</span>
          </h3>

          {pwdMsg && (
            <div className={`p-3 rounded-xl text-xs flex items-center space-x-2 ${
              pwdMsg.type === 'success' ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300' : 'bg-red-950/60 border border-red-800 text-red-300'
            }`}>
              {pwdMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{pwdMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu hiện tại</label>
              <input
                type="password"
                required
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mật khẩu mới (Tối thiểu 10 ký tự)</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nhập lại mật khẩu mới</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold"
            >
              CẬP NHẬT MẬT KHẨU MỚI
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: 2FA SETUP */}
      {activeTab === '2fa' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span>Xác thực Hai bước (Two-Factor Authentication)</span>
          </h3>

          {twoFactorMsg && (
            <div className="p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{twoFactorMsg}</span>
            </div>
          )}

          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-100">Bắt buộc nhập mã OTP khi đăng nhập</p>
              <p className="text-xs text-slate-400">Tăng cường bảo mật bằng ứng dụng Google Authenticator hoặc SMS</p>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                twoFactorEnabled ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {twoFactorEnabled ? 'ĐĂNG BẬT (ON)' : 'ĐANG TẮT (OFF)'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: ACCESS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wide flex items-center space-x-2">
            <History className="w-4 h-4 text-emerald-400" />
            <span>Lịch sử Hoạt động & Đăng nhập của Cá nhân</span>
          </h3>

          <div className="divide-y divide-slate-800 max-h-80 overflow-y-auto">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-emerald-400 mr-2">[{log.timestamp}]</span>
                  <span className="font-semibold text-slate-200 mr-2">[{log.module}]</span>
                  <span className="text-slate-300">{log.action}: {log.details}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{log.userDevice || 'Web Portal'}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERMISSION REQUEST MODAL */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Gửi Yêu cầu Cấp thêm Quyền Truy cập</span>
            </h3>

            <form onSubmit={handleSendRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Phân hệ Yêu cầu Truy cập</label>
                <select
                  value={reqModule}
                  onChange={(e) => {
                    setReqModule(e.target.value);
                    const sel = e.target.options[e.target.selectedIndex];
                    setReqModuleName(sel.text);
                  }}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                >
                  <option value="documents">Quản lý Văn bản & Tờ trình</option>
                  <option value="projects">Quản lý Dự án RPBM</option>
                  <option value="uxo_ops">Nhật ký Thi công UXO & Hủy nổ</option>
                  <option value="vehicles">Phương tiện & Đăng kiểm xe</option>
                  <option value="uxo_equipment">Máy dò & Thiết bị RPBM</option>
                  <option value="archive_warehouse">Kho Hồ sơ Archive</option>
                  <option value="reports">Báo cáo Quý & Thẩm định</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Lý do Cấp quyền <span className="text-red-400">*</span></label>
                <textarea
                  required
                  rows={3}
                  value={reqReason}
                  onChange={(e) => setReqReason(e.target.value)}
                  placeholder="Nêu rõ lý do công tác hoặc nhiệm vụ được giao..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Thời hạn Quyền đề nghị (Ngày)</label>
                <input
                  type="number"
                  min={1}
                  max={365}
                  value={reqDays}
                  onChange={(e) => setReqDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowRequestModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                >
                  Gửi Yêu cầu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
