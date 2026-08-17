import React, { useState } from 'react';
import { UserAccountGrid } from './user_accounts/UserAccountGrid';
import {
  UserCheck,
  Shield,
  UserPlus,
  Lock,
  Unlock,
  Settings,
  FolderTree,
  Trash2,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Key,
  X,
  Plus,
  Sliders,
  FileText,
  ShieldAlert,
  Database,
  Grid,
  Send,
  Smartphone,
  Copy,
  Check,
  Globe,
  RefreshCw,
  LogOut,
  Mail,
  ExternalLink
} from 'lucide-react';
import {
  User,
  UserRole,
  UserPermissions,
  SystemAlertConfig,
  SharedCategoryItem,
  DocumentRecord,
  Project,
  EquipmentItem,
  Personnel,
  FeatureAccessLevel,
  AuthSession,
  AccessPermissionRequest,
  AuthSecurityConfig
} from '../types';
import {
  getUsers,
  saveUsers,
  getCurrentUser,
  getAlertConfig,
  saveAlertConfig,
  getSharedCategories,
  saveSharedCategories,
  getDocuments,
  saveDocuments,
  getProjects,
  saveProjects,
  getPersonnel,
  savePersonnel,
  getEquipment,
  saveEquipment,
  getAuthSecurityConfig,
  saveAuthSecurityConfig,
  getAuthSessions,
  saveAuthSessions,
  getPermissionRequests,
  updatePermissionRequestStatus,
  addAuditLog
} from '../utils/storage';
import { formatDateVN } from '../utils/formatters';
import {
  DEFAULT_MANAGING_UNIT,
  DEFAULT_EMAIL_DOMAIN,
  generateAccountEmail,
  ensureUniqueEmail,
  generateStrongTemporaryPassword,
  hashPassword
} from '../utils/userManagementUtils';

export const UserRoleManager: React.FC = () => {
  const currentUser = getCurrentUser();
  const [users, setUsersState] = useState<User[]>(getUsers());
  const [alertConfig, setAlertConfigState] = useState<SystemAlertConfig>(getAlertConfig());
  const [categories, setCategoriesState] = useState<SharedCategoryItem[]>(getSharedCategories());
  const [securityConfig, setSecurityConfigState] = useState<AuthSecurityConfig>(getAuthSecurityConfig());
  const [authSessions, setAuthSessionsState] = useState<AuthSession[]>(getAuthSessions());
  const [permRequests, setPermRequestsState] = useState<AccessPermissionRequest[]>(getPermissionRequests());

  const [activeSubTab, setActiveSubTab] = useState<'users' | 'matrix' | 'requests' | 'sessions' | 'security_config' | 'roles' | 'config' | 'categories' | 'trash'>('users');
  const [searchUser, setSearchUser] = useState('');

  // User Edit Modal State
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedPersonnelId, setSelectedPersonnelId] = useState('');
  const [tempPassword, setTempPassword] = useState('');
  const [confirmTempPassword, setConfirmTempPassword] = useState('');
  const [mustChangePasswordOnLogin, setMustChangePasswordOnLogin] = useState(true);

  // Post-Creation / Password Reset Credentials Modal State
  const [createdCredentials, setCreatedCredentials] = useState<{
    title: string;
    userName: string;
    email: string;
    tempPassword: string;
    roleLabel: string;
    unit: string;
    mustChangePassword: boolean;
  } | null>(null);
  const [copiedCredentials, setCopiedCredentials] = useState(false);

  const [userFormData, setUserFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    phone: '',
    title: '',
    role: 'nhanvien',
    roleLabel: '3.3. Nhân viên / Chuyên viên',
    departmentOrUnit: DEFAULT_MANAGING_UNIT,
    permissions: [],
    detailedPermissions: {
      canManageAccounts: false,
      canAssignRoles: false,
      canManageCategories: false,
      canViewAllData: true,
      canEditAllData: false,
      canViewSystemLogs: false,
      canRestoreDeletedData: false,
      canSetAlertThresholds: false,
      canApproveWork: false,
      canApproveDocs: false,
      canApproveEquipment: false,
      canApprovePayment: false,
      canDeleteCriticalData: false
    }
  });

  // Category Edit State
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [catFormData, setCatFormData] = useState<Partial<SharedCategoryItem>>({
    group: 'doc_type',
    code: '',
    label: '',
    description: ''
  });

  // Data sources
  const documents = getDocuments();
  const projects = getProjects();
  const personnel = getPersonnel();
  const equipment = getEquipment();

  const deletedDocs = documents.filter(d => d.dataStatus === 'da_xoa');
  const deletedProjects = projects.filter(p => p.dataStatus === 'da_xoa');
  const deletedPersonnel = personnel.filter(p => p.dataStatus === 'da_xoa');
  const deletedEquipment = equipment.filter(e => e.dataStatus === 'da_xoa');

  const totalDeleted = deletedDocs.length + deletedProjects.length + deletedPersonnel.length + deletedEquipment.length;

  // Auto populate from personnel dropdown
  const handleSelectPersonnel = (pId: string) => {
    setSelectedPersonnelId(pId);
    if (!pId) return;
    const found = personnel.find(p => p.id === pId);
    if (found) {
      const suggestedEmail = ensureUniqueEmail(generateAccountEmail(found.fullName), users);
      setUserFormData(prev => ({
        ...prev,
        name: found.fullName,
        email: suggestedEmail,
        title: `${found.rankTitle || ''} ${found.position || found.roleInTeam || ''}`.trim(),
        phone: found.phone || prev.phone || '0989.93.0000',
        departmentOrUnit: found.unit || DEFAULT_MANAGING_UNIT
      }));
    }
  };

  // Generate Email Suggestion
  const handleGenerateDefaultEmail = () => {
    if (!userFormData.name) {
      alert('Vui lòng nhập Họ và tên cán bộ trước khi sinh email!');
      return;
    }
    const email = ensureUniqueEmail(generateAccountEmail(userFormData.name), users);
    setUserFormData(prev => ({ ...prev, email }));
  };

  // Generate Temp Password
  const handleGenerateTempPassword = () => {
    const pwd = generateStrongTemporaryPassword(12);
    setTempPassword(pwd);
    setConfirmTempPassword(pwd);
  };

  // Save User Action
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFormData.name || !userFormData.email) {
      alert('Vui lòng điền tên và email người dùng!');
      return;
    }

    const cleanEmail = userFormData.email.trim().toLowerCase();

    // Duplicate Email Check
    const duplicate = users.find(u => u.email.toLowerCase() === cleanEmail && (!editingUser || u.id !== editingUser.id));
    if (duplicate) {
      alert(`Tên đăng nhập / Email "${cleanEmail}" đã được sử dụng bởi tài khoản "${duplicate.name}". Vui lòng sử dụng email khác!`);
      return;
    }

    if (!editingUser) {
      if (!tempPassword) {
        alert('Vui lòng nhập hoặc bấm "Sinh mật khẩu tạm thời" cho tài khoản mới!');
        return;
      }
      if (tempPassword !== confirmTempPassword) {
        alert('Mật khẩu tạm thời và xác nhận mật khẩu không trùng khớp!');
        return;
      }
    } else {
      // Prevent changing role of the last active admin
      if (editingUser.role === 'quantri' && userFormData.role !== 'quantri') {
        const activeAdmins = users.filter(u => u.role === 'quantri' && !u.isLocked);
        if (activeAdmins.length <= 1) {
          alert('Không thể thay đổi vai trò của Quản trị viên duy nhất còn lại trong hệ thống!');
          return;
        }
      }
    }

    let roleLabel = '3.3. Nhân viên / Chuyên viên';
    if (userFormData.role === 'quantri') roleLabel = '3.1. Quản trị viên Hệ thống';
    else if (userFormData.role === 'chihuy') roleLabel = '3.2. Tiểu đoàn trưởng / Người phụ trách';

    const finalUnit = userFormData.departmentOrUnit || DEFAULT_MANAGING_UNIT;
    const finalHash = tempPassword ? hashPassword(tempPassword) : (editingUser?.passwordHash || hashPassword('D93@TempPass2026'));

    const fullUser: User = {
      id: editingUser ? editingUser.id : `user-${Date.now()}`,
      name: userFormData.name || '',
      email: cleanEmail,
      phone: userFormData.phone || '0900.000.000',
      title: userFormData.title || 'Cán bộ Nghiệp vụ RPBM',
      role: (userFormData.role as UserRole) || 'nhanvien',
      roleLabel,
      avatar: userFormData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      departmentOrUnit: finalUnit,
      permissions: userFormData.permissions || ['Xem dữ liệu được phân quyền'],
      detailedPermissions: userFormData.detailedPermissions,
      isLocked: editingUser ? editingUser.isLocked : false,
      status: 'active',
      mustChangePassword: mustChangePasswordOnLogin,
      passwordHash: finalHash
    };

    let updatedUsers: User[];
    if (editingUser) {
      updatedUsers = users.map(u => (u.id === editingUser.id ? fullUser : u));
    } else {
      updatedUsers = [...users, fullUser];
    }

    saveUsers(updatedUsers, editingUser ? `Cập nhật tài khoản: ${fullUser.name}` : `Tạo mới tài khoản: ${fullUser.name}`);
    setUsersState(updatedUsers);
    setShowUserModal(false);

    // Show Credentials Modal for copy & distribution if creating new user
    if (!editingUser && tempPassword) {
      setCreatedCredentials({
        title: 'Tài khoản người dùng đã được khởi tạo thành công!',
        userName: fullUser.name,
        email: fullUser.email,
        tempPassword: tempPassword,
        roleLabel: fullUser.roleLabel,
        unit: finalUnit,
        mustChangePassword: mustChangePasswordOnLogin
      });
    }

    setEditingUser(null);
    setTempPassword('');
    setConfirmTempPassword('');
  };

  // Lock / Unlock Action
  const handleToggleLockUser = (user: User) => {
    if (!user.isLocked && user.role === 'quantri') {
      const activeAdmins = users.filter(u => u.role === 'quantri' && !u.isLocked);
      if (activeAdmins.length <= 1) {
        alert('Không thể khóa tài khoản Quản trị viên duy nhất còn lại trong hệ thống!');
        return;
      }
    }
    if (confirm(`Bạn có chắc chắn muốn ${user.isLocked ? 'MỞ KHÓA' : 'KHÓA'} tài khoản "${user.name}" (${user.email})?`)) {
      const updated = users.map(u => (u.id === user.id ? { ...u, isLocked: !u.isLocked } : u));
      saveUsers(updated, `${user.isLocked ? 'Mở khóa' : 'Khóa'} tài khoản: ${user.name}`);
      setUsersState(updated);
    }
  };

  // Reset Password Action
  const handleResetPassword = (user: User) => {
    const newTemp = generateStrongTemporaryPassword(12);
    if (confirm(`Bạn có chắc chắn muốn cấp lại mật khẩu tạm thời cho tài khoản "${user.name}" (${user.email})?`)) {
      const newHash = hashPassword(newTemp);
      const updated = users.map(u => u.id === user.id ? { ...u, passwordHash: newHash, mustChangePassword: true } : u);
      saveUsers(updated, `Reset mật khẩu tài khoản: ${user.name}`);
      setUsersState(updated);
      setCreatedCredentials({
        title: `Đã cấp lại mật khẩu tạm thời cho ${user.name}`,
        userName: user.name,
        email: user.email,
        tempPassword: newTemp,
        roleLabel: user.roleLabel,
        unit: user.departmentOrUnit || DEFAULT_MANAGING_UNIT,
        mustChangePassword: true
      });
    }
  };

  // Copy Credentials Text
  const handleCopyCredentialsText = () => {
    if (!createdCredentials) return;
    const textToCopy = `THÔNG TIN TÀI KHOẢN ĐĂNG NHẬP HỆ THỐNG QLRPBM - BỘ PHẬN BOM MÌN TIỂU ĐOÀN 93
--------------------------------------------------------------------------
Họ và tên Cán bộ: ${createdCredentials.userName}
Tên đăng nhập / Email: ${createdCredentials.email}
Mật khẩu tạm thời: ${createdCredentials.tempPassword}
Nhóm vai trò: ${createdCredentials.roleLabel}
Đơn vị / Bộ phận: ${createdCredentials.unit}
Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên: ${createdCredentials.mustChangePassword ? 'CÓ (Bắt buộc)' : 'Không'}
--------------------------------------------------------------------------
Lưu ý: Mật khẩu tạm thời này chỉ hiển thị một lần. Vui lòng bảo mật thông tin!`;

    navigator.clipboard.writeText(textToCopy);
    setCopiedCredentials(true);
    setTimeout(() => setCopiedCredentials(false), 3000);
  };

  const handleSaveAlertConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveAlertConfig(alertConfig, 'Cập nhật cấu hình thời gian cảnh báo hạn chứng chỉ, đăng kiểm & hồ sơ');
    alert('Đã lưu thiết lập thời gian cảnh báo thành công!');
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catFormData.label || !catFormData.code) {
      alert('Vui lòng điền mã và tên danh mục!');
      return;
    }
    const newCat: SharedCategoryItem = {
      id: `cat-${Date.now()}`,
      group: catFormData.group as any,
      code: catFormData.code.toLowerCase().replace(/\s+/g, '_'),
      label: catFormData.label,
      description: catFormData.description
    };
    const updated = [...categories, newCat];
    saveSharedCategories(updated, `Thêm danh mục dùng chung: ${newCat.label}`);
    setCategoriesState(updated);
    setShowCategoryModal(false);
  };

  const handleDeleteCategory = (id: string, label: string) => {
    if (confirm(`Bạn có chắc muốn xóa danh mục "${label}"?`)) {
      const updated = categories.filter(c => c.id !== id);
      saveSharedCategories(updated, `Xóa danh mục: ${label}`);
      setCategoriesState(updated);
    }
  };

  // Trash bin restore functions
  const handleRestoreDoc = (doc: DocumentRecord) => {
    const updated = documents.map(d => (d.id === doc.id ? { ...d, dataStatus: 'hoat_dong' as const } : d));
    saveDocuments(updated, `Khôi phục văn bản từ Thùng rác: ${doc.code}`);
    alert(`Đã khôi phục văn bản ${doc.code} thành công!`);
  };

  const handleRestoreProject = (pj: Project) => {
    const updated = projects.map(p => (p.id === pj.id ? { ...p, dataStatus: 'hoat_dong' as const } : p));
    saveProjects(updated, `Khôi phục dự án từ Thùng rác: ${pj.code}`);
    alert(`Đã khôi phục dự án ${pj.code} thành công!`);
  };

  const handleRestorePersonnel = (p: Personnel) => {
    const updated = personnel.map(item => (item.id === p.id ? { ...item, dataStatus: 'hoat_dong' as const } : item));
    savePersonnel(updated, `Khôi phục cán bộ nhân sự từ Thùng rác: ${p.fullName}`);
    alert(`Đã khôi phục cán bộ ${p.fullName} thành công!`);
  };

  const handleRestoreEquipment = (e: EquipmentItem) => {
    const updated = equipment.map(item => (item.id === e.id ? { ...item, dataStatus: 'hoat_dong' as const } : item));
    saveEquipment(updated, `Khôi phục thiết bị từ Thùng rác: ${e.name}`);
    alert(`Đã khôi phục thiết bị ${e.name} thành công!`);
  };

  return (
    <div className="space-y-6">
      {/* Module Title Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-emerald-400" />
            <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider">
              Quản trị Hệ thống & Phân quyền Người dùng (Bộ phận Bom mìn Tiểu đoàn 93)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Thiết lập 3 nhóm quyền chính (Quản trị viên, Trưởng phòng, Nhân viên), cấu hình thời gian cảnh báo, quản lý danh mục & khôi phục dữ liệu đã xóa.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(null);
              setUserFormData({
                name: '',
                email: '',
                phone: '',
                title: '',
                role: 'nhanvien',
                roleLabel: '3.3. Nhân viên / Chuyên viên',
                departmentOrUnit: 'Phòng Nghiệp vụ RPBM',
                permissions: [],
                detailedPermissions: {
                  canManageAccounts: false,
                  canAssignRoles: false,
                  canManageCategories: false,
                  canViewAllData: true,
                  canEditAllData: false,
                  canViewSystemLogs: false,
                  canRestoreDeletedData: false,
                  canSetAlertThresholds: false,
                  canApproveWork: false,
                  canApproveDocs: false,
                  canApproveEquipment: false,
                  canApprovePayment: false,
                  canDeleteCriticalData: false
                }
              });
              setShowUserModal(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all shrink-0"
          >
            <UserPlus className="w-4 h-4" /> Thêm Tài khoản Mới
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto no-scrollbar gap-2 pb-1">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'users'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <UserCheck className="w-4 h-4" /> Quản lý Tài khoản ({users.length})
        </button>

        <button
          onClick={() => setActiveSubTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'matrix'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Grid className="w-4 h-4 text-emerald-400" /> Ma trận Phân quyền Dạng Bảng (3.18.15)
        </button>

        <button
          onClick={() => setActiveSubTab('requests')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 relative ${
            activeSubTab === 'requests'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Send className="w-4 h-4 text-amber-400" /> Yêu cầu Cấp quyền ({permRequests.filter(r => r.status === 'pending').length})
          {permRequests.some(r => r.status === 'pending') && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('sessions')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'sessions'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Smartphone className="w-4 h-4 text-blue-400" /> Giám sát Phiên & Thiết bị ({authSessions.filter(s => s.status === 'active').length})
        </button>

        <button
          onClick={() => setActiveSubTab('security_config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'security_config'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-400" /> Cấu hình Cổng Truy cập & Bảo mật
        </button>

        <button
          onClick={() => setActiveSubTab('roles')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'roles'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Key className="w-4 h-4" /> Bảng Ma trận Nhóm Quyền (3.1 - 3.3)
        </button>

        <button
          onClick={() => setActiveSubTab('config')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'config'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Clock className="w-4 h-4" /> Thiết lập Thời gian Cảnh báo
        </button>

        <button
          onClick={() => setActiveSubTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'categories'
              ? 'bg-slate-900 border-t-2 border-emerald-500 text-emerald-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <FolderTree className="w-4 h-4" /> Danh mục Dùng chung ({categories.length})
        </button>

        <button
          onClick={() => setActiveSubTab('trash')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 ${
            activeSubTab === 'trash'
              ? 'bg-slate-900 border-t-2 border-rose-500 text-rose-400 border-x border-slate-800'
              : 'text-slate-400 hover:text-rose-300 hover:bg-slate-900/50'
          }`}
        >
          <Trash2 className="w-4 h-4" /> Khôi phục Dữ liệu Đã xóa {totalDeleted > 0 && <span className="bg-rose-900 text-rose-200 px-1.5 rounded-full text-[10px]">{totalDeleted}</span>}
        </button>
      </div>

      {/* Sub-Tab 1: Quản lý Tài khoản */}
      {activeSubTab === 'users' && (
        <UserAccountGrid currentUser={currentUser} />
      )}

      {/* Sub-Tab 2: Ma trận Phân quyền 3 Nhóm */}
      {activeSubTab === 'roles' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-400" /> Ma trận Phân quyền 3 Nhóm Chức năng (Yêu cầu Mục 3.1 - 3.3)
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Chi tiết quy định quyền hạn cho từng nhóm người dùng trong hệ thống QLRPBM.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* 3.1 Quản trị viên */}
            <div className="bg-slate-950 border border-purple-800/80 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-purple-900/60 pb-2">
                <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">3.1. Quản trị viên</span>
                <Shield className="w-5 h-5 text-purple-400" />
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Quản lý tài khoản:</strong> Tạo, sửa, khóa tài khoản người dùng.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Phân quyền người dùng:</strong> Cài đặt chi tiết permission matrix.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Quản lý danh mục dùng chung:</strong> Loại văn bản, thiết bị, đơn vị.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Xem & chỉnh sửa toàn bộ dữ liệu:</strong> Toàn quyền trên các module.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Xem nhật ký hệ thống:</strong> Đầy đủ Audit logs & lịch sử thao tác.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Khôi phục dữ liệu đã xóa:</strong> Quản lý Thùng rác khôi phục hồ sơ/dự án.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" /> <strong>Thiết lập thời gian cảnh báo:</strong> Cấu hình số ngày cảnh báo hạn chứng chỉ, đăng kiểm.</li>
              </ul>
            </div>

            {/* 3.2 Tiểu đoàn trưởng hoặc người phụ trách */}
            <div className="bg-slate-950 border border-amber-800/80 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">3.2. Tiểu đoàn trưởng / Người phụ trách</span>
                <Building2 className="w-5 h-5 text-amber-400" />
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Xem toàn bộ dữ liệu đơn vị:</strong> Toàn bộ văn bản, dự án & thiết bị.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Giao việc & phê duyệt:</strong> Phê duyệt nhật ký thi công & phương án kỹ thuật.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Quản lý dự án:</strong> Phân công lực lượng, theo dõi ngân sách & tiến độ.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Duyệt văn bản:</strong> Ký duyệt công văn, tờ trình, phương án RPBM.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Xem báo cáo tổng hợp:</strong> Xuất biểu mẫu thống kê Excel & in ấn.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Duyệt cấp phát thiết bị:</strong> Phê duyệt mượn xe, máy dò, kiểm định.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Duyệt nghiệm thu & thanh toán:</strong> Phê duyệt hồ sơ thanh quyết toán dự án.</li>
              </ul>
            </div>

            {/* 3.3 Nhân viên */}
            <div className="bg-slate-950 border border-emerald-800/80 rounded-2xl p-4 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-900/60 pb-2">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">3.3. Nhân viên / Chuyên viên</span>
                <UserCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <strong>Xem dữ liệu được phân quyền:</strong> Văn bản, dự án được giao phụ trách.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <strong>Cập nhật công việc được giao:</strong> Báo cáo tiến độ hằng ngày.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <strong>Thêm văn bản, hồ sơ & nhật ký:</strong> Đăng tải file scan Drive, thông tin thi công.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <strong>Cập nhật tiến độ dự án:</strong> Điền diện tích đã rà, danh mục vật nổ phát hiện.</li>
                <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" /> <strong>Đề nghị mượn / cấp phát thiết bị:</strong> Gửi yêu cầu mượn máy dò, xe máy.</li>
                <li className="flex items-start gap-2 text-amber-300 font-semibold"><AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" /> <strong>Không tự ý xóa dữ liệu quan trọng:</strong> Xóa dữ liệu phải qua phê duyệt của Chỉ huy/Quản trị.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab: Ma trận Phân quyền Dạng Bảng (3.18.15) */}
      {activeSubTab === 'matrix' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Grid className="w-4 h-4 text-emerald-400" /> Bảng Ma trận Phân quyền theo Chức năng & Cán bộ (Mục 3.18.15)
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Hàng là các phân hệ chức năng hệ thống, Cột là từng cán bộ/thành viên. Thay đổi tùy chọn trong từng ô để cập nhật tức thì.
              </p>
            </div>
            <div className="flex items-center space-x-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-lg">
              <span>Mức quyền: <strong>Không | Xem | Sửa | Kiểm tra | Phê duyệt | Toàn quyền</strong></span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-950 border-b border-slate-800">
                  <th className="p-3 text-slate-300 font-semibold sticky left-0 bg-slate-950 z-10 w-64 border-r border-slate-800">
                    Phân hệ / Chức năng Hệ thống
                  </th>
                  {users.map(u => (
                    <th key={u.id} className="p-3 text-center border-r border-slate-800 min-w-[160px]">
                      <div className="font-bold text-slate-200">{u.name}</div>
                      <div className="text-[10px] text-emerald-400 font-mono font-normal">{u.roleLabel}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {[
                  { key: 'dashboard', name: '01. Tổng quan Dashboard' },
                  { key: 'documents', name: '02. Quản lý Văn bản & Tờ trình' },
                  { key: 'projects', name: '03. Quản lý Dự án RPBM' },
                  { key: 'vehicles', name: '04. Phương tiện & Đăng kiểm xe' },
                  { key: 'uxo_equipment', name: '05. Kho Máy dò & Thiết bị RPBM' },
                  { key: 'archive_warehouse', name: '06. Kho Hồ sơ & Archive' },
                  { key: 'gdrive', name: '07. Đồng bộ Google Drive' },
                  { key: 'tasks', name: '08. Giao việc & Tiến độ' },
                  { key: 'personnel', name: '09. Cán bộ & Chứng chỉ' },
                  { key: 'equipment', name: '10. Trang thiết bị & Vật tư' },
                  { key: 'user_role', name: '11. Quản trị & Phân quyền' },
                  { key: 'legal', name: '12. Cơ sở Pháp lý & Tiêu chuẩn' },
                  { key: 'reports', name: '13. Báo cáo Quý & Thẩm định' },
                  { key: 'audit', name: '14. Nhật ký An ninh Audit Logs' }
                ].map(mod => (
                  <tr key={mod.key} className="hover:bg-slate-950/50 transition-colors">
                    <td className="p-3 font-semibold text-slate-200 sticky left-0 bg-slate-900 z-10 border-r border-slate-800">
                      {mod.name}
                    </td>
                    {users.map(u => {
                      const currentLevel: FeatureAccessLevel = u.featurePermissions?.[mod.key] || 'none';
                      return (
                        <td key={u.id} className="p-2 border-r border-slate-800 text-center">
                          <select
                            value={currentLevel}
                            onChange={(e) => {
                              const newLevel = e.target.value as FeatureAccessLevel;
                              const updatedUsers = users.map(userItem => {
                                if (userItem.id === u.id) {
                                  return {
                                    ...userItem,
                                    featurePermissions: {
                                      ...userItem.featurePermissions,
                                      [mod.key]: newLevel
                                    }
                                  };
                                }
                                return userItem;
                              });
                              saveUsers(updatedUsers, `Cập nhật ma trận phân quyền: Phân hệ [${mod.name}] cho thành viên ${u.name} -> ${newLevel.toUpperCase()}`);
                              setUsersState(updatedUsers);
                            }}
                            className={`w-full py-1 px-2 border rounded text-[11px] font-bold transition-colors focus:outline-none ${
                              currentLevel === 'full' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
                              currentLevel === 'approve' ? 'bg-indigo-950 border-indigo-700 text-indigo-300' :
                              currentLevel === 'check' ? 'bg-amber-950 border-amber-700 text-amber-300' :
                              currentLevel === 'edit' ? 'bg-blue-950 border-blue-700 text-blue-300' :
                              currentLevel === 'view' ? 'bg-slate-800 border-slate-700 text-slate-300' :
                              'bg-slate-950 border-slate-800 text-slate-500'
                            }`}
                          >
                            <option value="none">🚫 Không truy cập</option>
                            <option value="view">👁️ Chỉ xem</option>
                            <option value="edit">✏️ Thêm / Sửa</option>
                            <option value="check">🔍 Kiểm tra</option>
                            <option value="approve">✍️ Phê duyệt</option>
                            <option value="full">⭐ Toàn quyền</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab: Yêu cầu Cấp quyền */}
      {activeSubTab === 'requests' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Send className="w-4 h-4 text-amber-400" /> Hàng chờ Yêu cầu Cấp thêm Quyền Truy cập
            </h3>
            <span className="text-xs text-slate-400 font-mono">
              Tổng số yêu cầu: {permRequests.length} | Đang chờ duyệt: {permRequests.filter(r => r.status === 'pending').length}
            </span>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {permRequests.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 font-mono">
                Chưa có yêu cầu cấp quyền nào trong hệ thống.
              </div>
            ) : (
              permRequests.map(req => (
                <div key={req.id} className="p-4 bg-slate-900 hover:bg-slate-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-100">{req.requesterName}</span>
                      <span className="text-slate-400 font-mono">({req.requesterEmail})</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        req.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                        req.status === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                        'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                      }`}>
                        {req.status === 'approved' ? 'Đã phê duyệt' : req.status === 'rejected' ? 'Đã từ chối' : 'Đang chờ duyệt'}
                      </span>
                    </div>
                    <p className="text-slate-300 font-medium">
                      Yêu cầu phân hệ: <strong className="text-emerald-400">{req.requestedModuleName}</strong> ({req.accessType.toUpperCase()})
                    </p>
                    <p className="text-slate-400">
                      Lý do: <span className="italic">“{req.reason}”</span>
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">
                      Thời hạn đề xuất: {req.durationDays} ngày (Đến ngày {req.requestedExpiresAt}) • Gửi lúc: {req.createdAt}
                    </p>
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={() => {
                          updatePermissionRequestStatus(req.id, 'approved', currentUser.name, 'Chỉ huy đã phê duyệt cấp quyền.');
                          setPermRequestsState(getPermissionRequests());
                          setUsersState(getUsers());
                        }}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold transition-colors"
                      >
                        ✓ Phê duyệt
                      </button>
                      <button
                        onClick={() => {
                          updatePermissionRequestStatus(req.id, 'rejected', currentUser.name, 'Từ chối cấp quyền.');
                          setPermRequestsState(getPermissionRequests());
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-red-400 rounded-lg font-semibold transition-colors border border-slate-700"
                      >
                        ✕ Từ chối
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab: Quản lý Phiên & Thiết bị */}
      {activeSubTab === 'sessions' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" /> Quản lý Phiên & Thiết bị Đăng nhập Hoạt động
            </h3>
            <button
              onClick={() => {
                const all = getAuthSessions();
                const revoked = all.map(s => s.userId !== currentUser.id ? { ...s, status: 'logged_out' as const } : s);
                saveAuthSessions(revoked);
                setAuthSessionsState(revoked);
                addAuditLog('Cổng Bảo mật', `Thu hồi phiên và đăng xuất ép buộc tất cả tài khoản khác`, 'thu_hoi_phien');
              }}
              className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 rounded-lg text-xs font-semibold flex items-center space-x-1 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất ép buộc toàn bộ tài khoản khác</span>
            </button>
          </div>

          <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden">
            {authSessions.map(sess => (
              <div key={sess.id} className="p-4 bg-slate-900 hover:bg-slate-950 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-100">{sess.userName}</span>
                    <span className="text-slate-400 font-mono">({sess.userEmail})</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono ${
                      sess.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {sess.status === 'active' ? 'Đang kết nối' : 'Đã đăng xuất'}
                    </span>
                  </div>
                  <p className="text-slate-300 font-mono">
                    Thiết bị: <strong className="text-blue-400">{sess.device}</strong> ({sess.browser} • {sess.os})
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono">
                    IP: {sess.ipAddress} • {sess.location} • Đăng nhập: {sess.loginTime} • Hết hạn: {sess.expiresAt}
                  </p>
                </div>

                {sess.status === 'active' && (
                  <button
                    onClick={() => {
                      const updated = authSessions.map(s => s.id === sess.id ? { ...s, status: 'logged_out' as const } : s);
                      saveAuthSessions(updated);
                      setAuthSessionsState(updated);
                      addAuditLog('Cổng Bảo mật', `Đã thu hồi phiên đăng nhập #${sess.id} của tài khoản ${sess.userName}`, 'thu_hoi_phien');
                    }}
                    className="px-3 py-1.5 bg-red-950 hover:bg-red-900 border border-red-800/60 text-red-300 rounded-lg font-semibold shrink-0"
                  >
                    Thu hồi phiên
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sub-Tab: Cấu hình Cổng Truy cập & Bảo mật */}
      {activeSubTab === 'security_config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> Cấu hình Cổng Đăng nhập & An toàn Thông tin
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Thiết lập thời gian tự động đăng xuất, khóa tài khoản, giới hạn IP mạng LAN/VPN và chính sách xác thực 2FA.
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveAuthSecurityConfig(securityConfig, 'Cập nhật tham số cấu hình an toàn cổng đăng nhập');
              alert('Đã lưu cấu hình an toàn bảo mật hệ thống thành công!');
            }}
            className="max-w-2xl space-y-4 text-xs"
          >
            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Thời gian tự động đăng xuất không hoạt động (Phút) [10 - 120 phút]
              </label>
              <input
                type="number"
                min={10}
                max={120}
                value={securityConfig.sessionTimeoutMinutes}
                onChange={(e) => setSecurityConfigState({ ...securityConfig, sessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
              />
              <p className="text-[11px] text-slate-400 mt-1">Mặc định: 30 phút. Hệ thống sẽ phát cảnh báo trước khi hết hạn.</p>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Thời gian đăng xuất khi mở Tài liệu Mật/Tối mật (Phút)
              </label>
              <input
                type="number"
                min={5}
                max={60}
                value={securityConfig.secretDocSessionTimeoutMinutes}
                onChange={(e) => setSecurityConfigState({ ...securityConfig, secretDocSessionTimeoutMinutes: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Số lần đăng nhập sai tối đa trước khi khóa tài khoản tạm thời
              </label>
              <input
                type="number"
                min={3}
                max={10}
                value={securityConfig.maxFailedAttemptsBeforeTempLock}
                onChange={(e) => setSecurityConfigState({ ...securityConfig, maxFailedAttemptsBeforeTempLock: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securityConfig.require2FAForAdmins}
                  onChange={(e) => setSecurityConfigState({ ...securityConfig, require2FAForAdmins: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <span className="font-semibold text-slate-200">Bắt buộc 2FA đối với Quản trị viên và Cán bộ Phê duyệt</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={securityConfig.enableGoogleLogin}
                  onChange={(e) => setSecurityConfigState({ ...securityConfig, enableGoogleLogin: e.target.checked })}
                  className="rounded bg-slate-950 border-slate-700 text-emerald-500"
                />
                <span className="font-semibold text-slate-200">Cho phép Đăng nhập qua Google Workplace cơ quan</span>
              </label>
            </div>

            <div>
              <label className="block font-bold text-slate-200 mb-1">
                Danh sách Tên miền Email công vụ được phép kích hoạt (Phân cách bởi dấu phẩy)
              </label>
              <input
                type="text"
                value={securityConfig.allowedEmailDomains.join(', ')}
                onChange={(e) => setSecurityConfigState({ ...securityConfig, allowedEmailDomains: e.target.value.split(',').map(s => s.trim()) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-100 font-mono"
              />
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Lưu Cấu hình An toàn Cổng Đăng nhập</span>
            </button>
          </form>
        </div>
      )}
      {activeSubTab === 'config' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" /> Cấu hình Thời gian Cảnh báo Hạn Chứng chỉ, Đăng kiểm & Hồ sơ
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Thiết lập ngưỡng số ngày hệ thống sẽ phát cảnh báo tự động trước khi hết hạn.
            </p>
          </div>

          <form onSubmit={handleSaveAlertConfig} className="max-w-2xl space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ngưỡng cảnh báo Chứng chỉ Nhân sự (ngày)
              </label>
              <input
                type="number"
                value={alertConfig.certWarningDays}
                onChange={e => setAlertConfigState({ ...alertConfig, certWarningDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Phát cảnh báo khi chứng chỉ KTV/Chỉ huy còn dưới số ngày này.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ngưỡng cảnh báo Đăng kiểm / Kiểm định Thiết bị & Phương tiện (ngày)
              </label>
              <input
                type="number"
                value={alertConfig.calibrationWarningDays}
                onChange={e => setAlertConfigState({ ...alertConfig, calibrationWarningDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Cảnh báo máy dò hết hạn hiệu chuẩn hoặc xe đến hạn đăng kiểm.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ngưỡng cảnh báo Hạn xử lý Văn bản & Hồ sơ (ngày)
              </label>
              <input
                type="number"
                value={alertConfig.docDeadlineWarningDays}
                onChange={e => setAlertConfigState({ ...alertConfig, docDeadlineWarningDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Cảnh báo công văn đến/đi chưa hoàn thành sắp đến hạn.</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">
                Ngưỡng cảnh báo Tiến độ Hoàn thành Dự án RPBM (ngày)
              </label>
              <input
                type="number"
                value={alertConfig.projectDelayWarningDays}
                onChange={e => setAlertConfigState({ ...alertConfig, projectDelayWarningDays: Number(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">Cảnh báo dự án sắp hết thời gian thi công theo hợp đồng.</p>
            </div>

            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-emerald-950 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> Lưu Thiết lập Ngưỡng Cảnh báo
            </button>
          </form>
        </div>
      )}

      {/* Sub-Tab 4: Danh mục Dùng chung */}
      {activeSubTab === 'categories' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-emerald-400" /> Quản lý Danh mục Dùng chung Hệ thống
            </h3>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Thêm Danh mục Mới
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <th className="p-3">Nhóm Danh mục</th>
                  <th className="p-3">Mã Code</th>
                  <th className="p-3">Tên Hiển thị</th>
                  <th className="p-3">Mô tả chi tiết</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-emerald-400">
                      {cat.group === 'doc_type'
                        ? '📄 Loại Văn bản'
                        : cat.group === 'project_status'
                        ? '💣 Trạng thái Dự án'
                        : cat.group === 'equipment_cat'
                        ? '🚜 Phân loại Thiết bị'
                        : '🏢 Đơn vị Quản lý'}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{cat.code}</td>
                    <td className="p-3 font-bold text-white">{cat.label}</td>
                    <td className="p-3 text-slate-400">{cat.description || '—'}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleDeleteCategory(cat.id, cat.label)}
                        className="text-rose-400 hover:text-rose-300 font-semibold p-1"
                        title="Xóa danh mục"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 5: Thùng rác & Khôi phục dữ liệu đã xóa */}
      {activeSubTab === 'trash' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-emerald-400" /> Quản lý Thùng rác & Khôi phục Dữ liệu Đã xóa ({totalDeleted})
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Cho phép Quản trị viên phục hồi các văn bản, dự án, cán bộ hoặc thiết bị đã bị đánh dấu xóa trong hệ thống.
            </p>
          </div>

          {totalDeleted === 0 ? (
            <div className="text-center py-12 text-slate-500 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500/60 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">Thùng rác sạch sẽ, không có dữ liệu bị xóa.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Deleted Documents */}
              {deletedDocs.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-400" /> Văn bản đã xóa ({deletedDocs.length})
                  </h4>
                  <div className="divide-y divide-slate-800 text-xs">
                    {deletedDocs.map(doc => (
                      <div key={doc.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{doc.code} - {doc.title}</div>
                          <div className="text-[10px] text-slate-400">Người tạo: {doc.createdBy || 'Văn thư'} • Bộ phận: {doc.departmentOrUnit || 'Nội bộ'}</div>
                        </div>
                        <button
                          onClick={() => handleRestoreDoc(doc)}
                          className="bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Phục hồi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Projects */}
              {deletedProjects.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-400" /> Dự án RPBM đã xóa ({deletedProjects.length})
                  </h4>
                  <div className="divide-y divide-slate-800 text-xs">
                    {deletedProjects.map(pj => (
                      <div key={pj.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{pj.code} - {pj.name}</div>
                          <div className="text-[10px] text-slate-400">Chỉ huy: {pj.commanderName} • Diện tích: {pj.areaHa} ha</div>
                        </div>
                        <button
                          onClick={() => handleRestoreProject(pj)}
                          className="bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Phục hồi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Personnel */}
              {deletedPersonnel.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-sky-400" /> Cán bộ nhân sự đã xóa ({deletedPersonnel.length})
                  </h4>
                  <div className="divide-y divide-slate-800 text-xs">
                    {deletedPersonnel.map(p => (
                      <div key={p.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{p.rankTitle} {p.fullName}</div>
                          <div className="text-[10px] text-slate-400">Chức danh: {p.roleInTeam} • Đơn vị: {p.unit}</div>
                        </div>
                        <button
                          onClick={() => handleRestorePersonnel(p)}
                          className="bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Phục hồi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Equipment */}
              {deletedEquipment.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-purple-400" /> Thiết bị phương tiện đã xóa ({deletedEquipment.length})
                  </h4>
                  <div className="divide-y divide-slate-800 text-xs">
                    {deletedEquipment.map(e => (
                      <div key={e.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-slate-200">{e.name} ({e.serialOrPlate})</div>
                          <div className="text-[10px] text-slate-400">Model: {e.brandModel} • Vị trí: {e.location}</div>
                        </div>
                        <button
                          onClick={() => handleRestoreEquipment(e)}
                          className="bg-emerald-950 border border-emerald-700 text-emerald-300 hover:bg-emerald-900 px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Phục hồi
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal: Thêm / Sửa Tài khoản Người dùng */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                {editingUser ? 'Chỉnh sửa Phân quyền Tài khoản' : 'Tạo mới Tài khoản Cán bộ Đăng nhập'}
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              {/* Select from existing Personnel */}
              {!editingUser && personnel.length > 0 && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <label className="block text-slate-300 font-bold flex items-center justify-between">
                    <span>🔗 Liên kết Hồ sơ Nhân sự (Tùy chọn)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Tự động điền Họ tên, Email, Cấp bậc, Đơn vị</span>
                  </label>
                  <select
                    value={selectedPersonnelId}
                    onChange={e => handleSelectPersonnel(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="">-- Chọn cán bộ từ Danh mục Nhân sự Tiểu đoàn --</option>
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
                    value={userFormData.name || ''}
                    onChange={e => setUserFormData({ ...userFormData, name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-slate-300 font-semibold">Tên đăng nhập / Email *</label>
                    <button
                      type="button"
                      onClick={handleGenerateDefaultEmail}
                      className="text-[10px] text-emerald-400 hover:underline font-mono"
                    >
                      + Gợi ý Email
                    </button>
                  </div>
                  <input
                    type="email"
                    required
                    value={userFormData.email || ''}
                    onChange={e => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="canbo@tieudoan93.bccb"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chức danh / Cấp bậc</label>
                  <input
                    type="text"
                    value={userFormData.title || ''}
                    onChange={e => setUserFormData({ ...userFormData, title: e.target.value })}
                    placeholder="Đại úy - Trưởng nhóm RPBM"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={userFormData.phone || ''}
                    onChange={e => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="0983.xxx.xxx"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Password Section */}
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
                        required={!editingUser}
                        value={tempPassword}
                        onChange={e => setTempPassword(e.target.value)}
                        placeholder="Mật khẩu tạm thời..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-emerald-300 font-mono font-bold focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <input
                        type="text"
                        required={!editingUser}
                        value={confirmTempPassword}
                        onChange={e => setConfirmTempPassword(e.target.value)}
                        placeholder="Xác nhận mật khẩu..."
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 pt-1 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={mustChangePasswordOnLogin}
                      onChange={e => setMustChangePasswordOnLogin(e.target.checked)}
                      className="rounded accent-emerald-500 w-4 h-4"
                    />
                    <span>Yêu cầu đổi mật khẩu ở lần đăng nhập đầu tiên (Bắt buộc bảo mật)</span>
                  </label>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Đơn vị / Bộ phận Quản lý (Mặc định: {DEFAULT_MANAGING_UNIT})</label>
                <div className="flex gap-2">
                  <select
                    value={userFormData.departmentOrUnit || DEFAULT_MANAGING_UNIT}
                    onChange={e => setUserFormData({ ...userFormData, departmentOrUnit: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-semibold"
                  >
                    <option value={DEFAULT_MANAGING_UNIT}>{DEFAULT_MANAGING_UNIT} (Mặc định hệ thống)</option>
                    {categories.filter(c => c.group === 'unit' && c.label !== DEFAULT_MANAGING_UNIT).map(u => (
                      <option key={u.id} value={u.label}>{u.label}</option>
                    ))}
                    <option value="Phòng Nghiệp vụ RPBM">Phòng Nghiệp vụ RPBM</option>
                    <option value="Đội Đô đốc & Khảo sát">Đội Đô đốc & Khảo sát</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nhóm Quyền Hạn Chính (Mục 3)</label>
                <select
                  value={userFormData.role || 'nhanvien'}
                  onChange={e => {
                    const selectedRole = e.target.value as UserRole;
                    let defaultPerms: UserPermissions = {
                      canManageAccounts: false,
                      canAssignRoles: false,
                      canManageCategories: false,
                      canViewAllData: true,
                      canEditAllData: false,
                      canViewSystemLogs: false,
                      canRestoreDeletedData: false,
                      canSetAlertThresholds: false,
                      canApproveWork: false,
                      canApproveDocs: false,
                      canApproveEquipment: false,
                      canApprovePayment: false,
                      canDeleteCriticalData: false
                    };

                    if (selectedRole === 'quantri') {
                      defaultPerms = {
                        canManageAccounts: true,
                        canAssignRoles: true,
                        canManageCategories: true,
                        canViewAllData: true,
                        canEditAllData: true,
                        canViewSystemLogs: true,
                        canRestoreDeletedData: true,
                        canSetAlertThresholds: true,
                        canApproveWork: true,
                        canApproveDocs: true,
                        canApproveEquipment: true,
                        canApprovePayment: true,
                        canDeleteCriticalData: true
                      };
                    } else if (selectedRole === 'chihuy') {
                      defaultPerms = {
                        canManageAccounts: false,
                        canAssignRoles: false,
                        canManageCategories: false,
                        canViewAllData: true,
                        canEditAllData: true,
                        canViewSystemLogs: true,
                        canRestoreDeletedData: false,
                        canSetAlertThresholds: false,
                        canApproveWork: true,
                        canApproveDocs: true,
                        canApproveEquipment: true,
                        canApprovePayment: true,
                        canDeleteCriticalData: true
                      };
                    }

                    setUserFormData({
                      ...userFormData,
                      role: selectedRole,
                      detailedPermissions: defaultPerms
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none font-semibold"
                >
                  <option value="quantri">🛡️ 3.1. Quản trị viên (Toàn quyền hệ thống & Khôi phục dữ liệu)</option>
                  <option value="chihuy">🏢 3.2. Trưởng phòng / Người phụ trách (Giao việc & Duyệt hồ sơ)</option>
                  <option value="nhanvien">👷 3.3. Nhân viên / Chuyên viên (Cập nhật tiến độ & Đề xuất)</option>
                </select>
              </div>

              {/* Detailed Permission Switches */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-2">
                <p className="text-[11px] uppercase font-bold text-emerald-400">Chi tiết Quyền hạn thao tác (Detailed Permissions Matrix):</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canManageAccounts || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canManageAccounts: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Quản lý tài khoản
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canAssignRoles || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canAssignRoles: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Phân quyền người dùng
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canManageCategories || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canManageCategories: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Quản lý danh mục dùng chung
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canRestoreDeletedData || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canRestoreDeletedData: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Khôi phục dữ liệu đã xóa
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canApproveWork || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canApproveWork: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Giao việc & Duyệt công việc
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canApproveDocs || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canApproveDocs: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Ký duyệt văn bản
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canApproveEquipment || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canApproveEquipment: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Duyệt cấp phát thiết bị
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={userFormData.detailedPermissions?.canDeleteCriticalData || false}
                      onChange={e => setUserFormData({
                        ...userFormData,
                        detailedPermissions: { ...userFormData.detailedPermissions, canDeleteCriticalData: e.target.checked }
                      })}
                      className="rounded accent-emerald-500"
                    />
                    Xóa dữ liệu quan trọng
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-950"
                >
                  Lưu Thông tin Tài khoản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thêm Danh mục dùng chung */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-400" /> Thêm Danh mục Dùng chung Mới
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nhóm Danh mục</label>
                <select
                  value={catFormData.group || 'doc_type'}
                  onChange={e => setCatFormData({ ...catFormData, group: e.target.value as any })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="doc_type">📄 Loại Văn bản & Hồ sơ</option>
                  <option value="project_status">💣 Trạng thái Dự án RPBM</option>
                  <option value="equipment_cat">🚜 Phân loại Thiết bị</option>
                  <option value="unit">🏢 Đơn vị / Bộ phận Quản lý</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mã Danh mục (Code)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hoso_nghiemthu"
                  value={catFormData.code || ''}
                  onChange={e => setCatFormData({ ...catFormData, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Hiển thị</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hồ sơ Nghiệm thu Bàn giao"
                  value={catFormData.label || ''}
                  onChange={e => setCatFormData({ ...catFormData, label: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Mô tả Chi tiết</label>
                <textarea
                  rows={2}
                  placeholder="Mô tả phạm vi áp dụng..."
                  value={catFormData.description || ''}
                  onChange={e => setCatFormData({ ...catFormData, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Thêm Danh mục
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Thông tin Mật khẩu Tạm thời & Đăng nhập mới */}
      {createdCredentials && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-500/50 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                {createdCredentials.title}
              </h3>
              <button onClick={() => setCreatedCredentials(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Họ và tên cán bộ:</span>
                <strong className="text-white font-semibold">{createdCredentials.userName}</strong>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Tên đăng nhập / Email:</span>
                <strong className="text-emerald-300 font-mono font-bold">{createdCredentials.email}</strong>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-slate-900">
                <span className="text-slate-400">Mật khẩu tạm thời:</span>
                <code className="bg-emerald-950 border border-emerald-700 text-emerald-300 px-3 py-1 rounded-lg text-sm font-mono font-bold tracking-wider">
                  {createdCredentials.tempPassword}
                </code>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Nhóm vai trò:</span>
                <span className="text-slate-200 font-semibold">{createdCredentials.roleLabel}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-900">
                <span className="text-slate-400">Đơn vị quản lý:</span>
                <span className="text-slate-200">{createdCredentials.unit}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Yêu cầu đổi MK lần đầu:</span>
                <span className="text-amber-400 font-bold">
                  {createdCredentials.mustChangePassword ? 'CÓ (Bắt buộc bảo mật)' : 'Không'}
                </span>
              </div>
            </div>

            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 text-[11px] text-amber-200/90 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý an toàn:</strong> Mật khẩu tạm thời chỉ hiển thị duy nhất tại bước này và đã được mã hóa lưu bảo mật trong hệ thống. Vui lòng sao chép thông tin để bàn giao cho cán bộ.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={handleCopyCredentialsText}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2"
              >
                {copiedCredentials ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4 text-white" />}
                {copiedCredentials ? 'Đã sao chép vào Clipboard!' : 'Sao chép Thông tin Đăng nhập'}
              </button>
              <button
                onClick={() => setCreatedCredentials(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold px-4 py-2.5 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
