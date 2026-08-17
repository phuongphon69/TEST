import React, { useState } from 'react';
import { X, Shield, UserCheck, Phone, Mail, Building2, Check, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { User, UserRole } from '../../types';
import { fixedUserAccountMode, DEFAULT_MANAGING_UNIT } from '../../config/FixedUserAccountConfig';
import { RoleBadge } from './RoleBadge';

interface UserAccountEditDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedUser: User, roleChanged: boolean) => void;
}

export const UserAccountEditDialog: React.FC<UserAccountEditDialogProps> = ({
  user,
  isOpen,
  onClose,
  onSave
}) => {
  if (!isOpen) return null;

  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '');
  const [title, setTitle] = useState(user.title || '');
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [role, setRole] = useState<UserRole>(user.role);
  const [roleLabel, setRoleLabel] = useState(user.roleLabel || '');
  const [unit, setUnit] = useState(user.departmentOrUnit || DEFAULT_MANAGING_UNIT);
  const [status, setStatus] = useState(user.status || 'active');

  const [showRoleConfirmModal, setShowRoleConfirmModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isRoleChanged = role !== user.role;

  const handleRoleSelect = (newRole: UserRole) => {
    setRole(newRole);
    switch (newRole) {
      case 'quantri':
        setRoleLabel('Quản trị viên');
        break;
      case 'chihuy':
        setRoleLabel('Tiểu đoàn trưởng');
        break;
      case 'phochihuy':
        setRoleLabel('Phó Tiểu đoàn trưởng');
        break;
      case 'nhanvien':
      default:
        setRoleLabel('Nhân viên');
        break;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg('Họ và tên cán bộ không được để trống.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Vui lòng nhập địa chỉ email hợp lệ.');
      return;
    }

    if (isRoleChanged && !showRoleConfirmModal) {
      setShowRoleConfirmModal(true);
      return;
    }

    executeSave();
  };

  const executeSave = () => {
    const defaultPerms = role === 'quantri'
      ? ['Quản trị hệ thống', 'Phân quyền người dùng', 'Reset & Điều chỉnh số văn bản', 'Quản lý danh mục', 'Xem audit log']
      : role === 'chihuy'
      ? ['Chỉ huy toàn đơn vị', 'Phê duyệt & Ký văn bản hồ sơ', 'Giao xử lý nhiệm vụ', 'Nghiệm thu dự án']
      : role === 'phochihuy'
      ? ['Xem & Xử lý hồ sơ theo phạm vi', 'Ủy quyền giao việc & Phê duyệt', 'Xem báo cáo nghiệp vụ']
      : ['Thực hiện nhiệm vụ chuyên môn', 'Tiếp nhận & Xử lý hồ sơ được giao', 'Cập nhật tiến độ thi công'];

    const updatedUser: User = {
      ...user,
      name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      title: title.trim(),
      avatar: avatar.trim(),
      role,
      roleLabel,
      departmentOrUnit: fixedUserAccountMode ? DEFAULT_MANAGING_UNIT : unit,
      status,
      permissions: defaultPerms,
      detailedPermissions: {
        canManageAccounts: role === 'quantri',
        canAssignRoles: role === 'quantri',
        canManageCategories: role === 'quantri',
        canViewAllData: true,
        canEditAllData: role === 'quantri' || role === 'chihuy' || role === 'phochihuy',
        canViewSystemLogs: role === 'quantri',
        canRestoreDeletedData: role === 'quantri',
        canSetAlertThresholds: role === 'quantri',
        canApproveWork: role === 'chihuy' || role === 'phochihuy',
        canApproveDocs: role === 'chihuy',
        canApproveEquipment: role === 'chihuy',
        canApprovePayment: role === 'chihuy',
        canDeleteCriticalData: role === 'quantri'
      }
    };

    onSave(updatedUser, isRoleChanged);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-slate-100">
            <Shield className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold">Chỉnh sửa Tài khoản Cán bộ</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            aria-label="Đóng hộp thoại"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-red-950/60 border border-red-800/60 rounded-xl text-xs text-red-300 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* User ID Readonly Badge */}
          <div className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-slate-400">
            <span>Mã UID Hệ thống (Readonly):</span>
            <strong className="text-emerald-400">{user.id}</strong>
          </div>

          {/* Full Name & Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Họ và tên cán bộ <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Cấp bậc & Chức danh
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Đại úy CN - Nhân viên"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Email công vụ <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Số điện thoại liên hệ
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0989.930.000"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Avatar URL */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Đường dẫn Ảnh đại diện (Avatar URL)
            </label>
            <div className="relative">
              <ImageIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Unit / Department */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Đơn vị / Bộ phận quản lý {fixedUserAccountMode && '(Cố định theo Tiểu đoàn 93)'}
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                readOnly={fixedUserAccountMode}
                value={fixedUserAccountMode ? DEFAULT_MANAGING_UNIT : unit}
                onChange={(e) => setUnit(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm font-medium ${
                  fixedUserAccountMode ? 'text-amber-300/90 cursor-not-allowed bg-slate-950/60' : 'text-slate-100'
                }`}
              />
            </div>
          </div>

          {/* System Role Selection */}
          <div className="space-y-1.5 pt-2 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-200">
              Chức vụ / Vai trò Hệ thống <span className="text-red-400">*</span>
            </label>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('quantri')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                  role === 'quantri'
                    ? 'bg-purple-950/80 border-purple-500 ring-1 ring-purple-500 text-purple-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-1 rounded bg-purple-900/40 text-purple-300 shrink-0">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">1. Quản trị viên</div>
                  <div className="text-[10px] text-slate-400">Toàn quyền cấu hình, tài khoản & số văn bản</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('chihuy')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                  role === 'chihuy'
                    ? 'bg-amber-950/80 border-amber-500 ring-1 ring-amber-500 text-amber-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-1 rounded bg-amber-900/40 text-amber-300 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">2. Tiểu đoàn trưởng</div>
                  <div className="text-[10px] text-slate-400">Giao việc, phê duyệt & ký nghiệm thu</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('phochihuy')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                  role === 'phochihuy'
                    ? 'bg-yellow-950/80 border-yellow-500 ring-1 ring-yellow-500 text-yellow-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-1 rounded bg-yellow-900/40 text-yellow-300 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">3. Phó Tiểu đoàn trưởng</div>
                  <div className="text-[10px] text-slate-400">Xử lý hồ sơ ủy quyền & xem báo cáo</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('nhanvien')}
                className={`p-3 rounded-xl border text-left flex items-start space-x-2 transition-all ${
                  role === 'nhanvien'
                    ? 'bg-emerald-950/80 border-emerald-500 ring-1 ring-emerald-500 text-emerald-200'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="p-1 rounded bg-emerald-900/40 text-emerald-300 shrink-0">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs">4. Nhân viên</div>
                  <div className="text-[10px] text-slate-400">Tiếp nhận công việc & thực hiện thi công</div>
                </div>
              </button>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium shadow-md transition-colors"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>

        {/* Role Change Confirmation Sub-Modal */}
        {showRoleConfirmModal && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
              <div className="flex items-center space-x-2 text-amber-400">
                <AlertTriangle className="w-6 h-6" />
                <h4 className="text-base font-bold">Xác nhận thay đổi Vai trò & Quyền hạn</h4>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Bạn đang thay đổi vai trò của cán bộ <strong className="text-white">{fullName}</strong>:
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Vai trò trước đây:</span>
                  <RoleBadge role={user.role} roleLabel={user.roleLabel} size="sm" />
                </div>
                <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-slate-200 font-bold">
                  <span>Vai trò mới:</span>
                  <RoleBadge role={role} roleLabel={roleLabel} size="sm" />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 italic">
                * Hành động này sẽ cập nhật Ma trận Phân quyền hệ thống và ghi Nhật ký Audit Log.
              </p>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  onClick={() => setShowRoleConfirmModal(false)}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  onClick={executeSave}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-medium shadow-md"
                >
                  Xác nhận thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
