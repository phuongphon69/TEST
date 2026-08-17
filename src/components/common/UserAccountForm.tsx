import React, { useState } from 'react';
import { User } from '../../types';
import { DEFAULT_MANAGING_UNIT, generateAccountEmail, ensureUniqueEmail, generateStrongTemporaryPassword } from '../../utils/userManagementUtils';
import { getUsers, getSharedCategories, getPersonnel } from '../../utils/storage';
import { RefreshCw, Key, ShieldCheck } from 'lucide-react';

interface UserAccountFormProps {
  initialData?: Partial<User>;
  editingUser?: User | null;
  onSave: (user: Partial<User>, tempPassword?: string) => void;
  onCancel: () => void;
}

export const UserAccountForm: React.FC<UserAccountFormProps> = ({
  initialData,
  editingUser,
  onSave,
  onCancel
}) => {
  const users = getUsers();
  const personnel = getPersonnel();
  const categories = getSharedCategories();

  const [formData, setFormData] = useState<Partial<User>>({
    name: editingUser?.name || initialData?.name || '',
    email: editingUser?.email || initialData?.email || '',
    phone: editingUser?.phone || initialData?.phone || '0989.93.0000',
    title: editingUser?.title || initialData?.title || 'Cán bộ Nghiệp vụ RPBM',
    role: editingUser?.role || initialData?.role || 'nhanvien',
    departmentOrUnit: editingUser?.departmentOrUnit || initialData?.departmentOrUnit || DEFAULT_MANAGING_UNIT,
    permissions: editingUser?.permissions || initialData?.permissions || ['Xem dữ liệu được phân quyền']
  });

  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [tempPassword, setTempPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const handleSelectPersonnel = (pId: string) => {
    setSelectedPersonnelId(pId);
    if (!pId) return;
    const found = personnel.find(p => p.id === pId);
    if (found) {
      const suggested = ensureUniqueEmail(generateAccountEmail(found.fullName), users);
      setFormData(prev => ({
        ...prev,
        name: found.fullName,
        email: suggested,
        title: `${found.rankTitle || ''} ${found.position || found.roleInTeam || ''}`.trim(),
        phone: found.phone || prev.phone || '0989.93.0000',
        departmentOrUnit: found.unit || DEFAULT_MANAGING_UNIT
      }));
    }
  };

  const handleGenerateEmail = () => {
    if (!formData.name) {
      alert('Vui lòng nhập họ tên cán bộ!');
      return;
    }
    const suggested = ensureUniqueEmail(generateAccountEmail(formData.name), users);
    setFormData(prev => ({ ...prev, email: suggested }));
  };

  const handleGenerateTempPassword = () => {
    const pwd = generateStrongTemporaryPassword(12);
    setTempPassword(pwd);
    setConfirmPassword(pwd);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) {
      alert('Họ tên cán bộ không được để trống');
      return;
    }
    if (!formData.email?.trim()) {
      alert('Email đăng nhập không được để trống');
      return;
    }
    if (!editingUser) {
      if (!tempPassword) {
        alert('Vui lòng nhập hoặc bấm "Sinh mật khẩu ngẫu nhiên"');
        return;
      }
      if (tempPassword !== confirmPassword) {
        alert('Mật khẩu xác nhận không khớp');
        return;
      }
    }
    onSave(formData, tempPassword);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {!editingUser && personnel.length > 0 && (
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
          <label className="block text-slate-300 font-bold flex items-center justify-between">
            <span>🔗 Liên kết Hồ sơ Nhân sự (Tùy chọn)</span>
            <span className="text-[10px] text-slate-400">Tự động điền Họ tên, Email, Cấp bậc, Đơn vị</span>
          </label>
          <select
            value={selectedPersonnelId}
            onChange={e => handleSelectPersonnel(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">-- Chọn cán bộ từ Danh mục Nhân sự --</option>
            {personnel.map(p => (
              <option key={p.id} value={p.id}>
                {p.rankTitle} {p.fullName} ({p.roleInTeam || p.position || 'Cán bộ'} - {p.unit || DEFAULT_MANAGING_UNIT})
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-300 font-semibold mb-1">Họ và tên Cán bộ *</label>
          <input
            type="text"
            required
            value={formData.name || ''}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ví dụ: Đỗ Văn Dũng"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-slate-300 font-semibold">Tên đăng nhập / Email *</label>
            <button
              type="button"
              onClick={handleGenerateEmail}
              className="text-[10px] text-emerald-400 hover:underline font-mono"
            >
              + Gợi ý Email
            </button>
          </div>
          <input
            type="email"
            required
            value={formData.email || ''}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            placeholder="canbo@tieudoan93.bccb"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Cấp bậc / Chức danh</label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            placeholder="Thượng tá - Tiểu đoàn trưởng"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-semibold mb-1">Số điện thoại liên hệ</label>
          <input
            type="text"
            value={formData.phone || ''}
            onChange={e => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0989.93.0000"
            className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
          />
        </div>
      </div>

      {!editingUser && (
        <div className="bg-slate-950 border border-emerald-900/40 rounded-xl p-3 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Mật khẩu tạm thời *
            </label>
            <button
              type="button"
              onClick={handleGenerateTempPassword}
              className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-[10px] px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Sinh mật khẩu ngẫu nhiên
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <input
                type="text"
                required
                value={tempPassword}
                onChange={e => setTempPassword(e.target.value)}
                placeholder="Mật khẩu tạm thời..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <input
                type="text"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Xác nhận mật khẩu..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <label className="block text-slate-300 font-semibold mb-1">Đơn vị / Bộ phận Quản lý</label>
        <select
          value={formData.departmentOrUnit || DEFAULT_MANAGING_UNIT}
          onChange={e => setFormData({ ...formData, departmentOrUnit: e.target.value })}
          className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-semibold"
        >
          <option value={DEFAULT_MANAGING_UNIT}>{DEFAULT_MANAGING_UNIT} (Mặc định)</option>
          {categories.filter(c => c.group === 'unit' && c.label !== DEFAULT_MANAGING_UNIT).map(u => (
            <option key={u.id} value={u.label}>{u.label}</option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
        >
          Hủy bỏ
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950"
        >
          <ShieldCheck className="w-4 h-4" />
          {editingUser ? 'Lưu cập nhật' : 'Tạo tài khoản'}
        </button>
      </div>
    </form>
  );
};
