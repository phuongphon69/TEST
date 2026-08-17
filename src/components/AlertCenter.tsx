import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  Bomb,
  Users,
  Truck,
  ExternalLink,
  ArrowUpRight,
  Send,
  Sparkles,
  DollarSign,
  Calendar,
  PieChart,
  BarChart3,
  ListTodo,
  CheckSquare,
  Plus,
  Search,
  Filter,
  X,
  AlertCircle,
  TrendingUp,
  FolderCheck,
  UserCheck,
  Building2,
  Layers,
  ChevronRight,
  Shield,
  Activity,
  CalendarDays
} from 'lucide-react';
import {
  AlertItem,
  DocumentRecord,
  Project,
  Personnel,
  EquipmentItem,
  PersonnelCertificate
} from '../types';
import {
  getDocuments,
  getProjects,
  getPersonnel,
  getEquipment,
  generateAutoAlerts,
  getCurrentUser
} from '../utils/storage';
import {
  formatVND,
  formatVNDShort,
  formatDateVN,
  formatDateForInput,
  getDaysRemaining,
  getExpiryBadgeInfo
} from '../utils/formatters';

interface AlertCenterProps {
  onNavigateTab: (tab: string, itemId?: string) => void;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  type: 'huy_no' | 'do_tim' | 'nghiem_thu' | 'dang_kiem' | 'hop_hanh';
  assignedTo: string;
  status: 'sap_toi' | 'dang_dien_ra' | 'da_xong';
  description?: string;
}

export interface TodoTask {
  id: string;
  title: string;
  category: 'du_an' | 'van_ban' | 'thiet_bi' | 'nhan_su';
  priority: 'gap' | 'trung_binh' | 'thuong';
  dueDate: string;
  assignedTo: string;
  completed: boolean;
  linkModule?: 'projects' | 'documents' | 'equipment' | 'personnel';
}

export const AlertCenter: React.FC<AlertCenterProps> = ({ onNavigateTab }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Stat detail modal state
  const [activeStatModal, setActiveStatModal] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState<string>('');

  // Interactive Tasks State
  const [tasks, setTasks] = useState<TodoTask[]>([
    {
      id: 'task-1',
      title: 'Phê duyệt Nhật ký thi công ngày 28/07 - Dự án Cao tốc Bắc Nam',
      category: 'du_an',
      priority: 'gap',
      dueDate: '2026-07-28',
      assignedTo: 'Thượng tá Nguyễn Văn Hùng',
      completed: false,
      linkModule: 'projects'
    },
    {
      id: 'task-2',
      title: 'Xử lý Công văn số 158/QĐ-BQP phê duyệt phương án thi công',
      category: 'van_ban',
      priority: 'gap',
      dueDate: '2026-07-29',
      assignedTo: 'Thiếu tá Phạm Thị Mai',
      completed: false,
      linkModule: 'documents'
    },
    {
      id: 'task-3',
      title: 'Đăng kiểm định kỳ Xe chở vật nổ 29C-888.99',
      category: 'thiet_bi',
      priority: 'gap',
      dueDate: '2026-08-02',
      assignedTo: 'Đại úy Trần Quốc Tuấn',
      completed: false,
      linkModule: 'equipment'
    },
    {
      id: 'task-4',
      title: 'Gia hạn Chứng chỉ KTV RPBM Cấp 3 cho KTS Lê Hoàng Nam',
      category: 'nhan_su',
      priority: 'trung_binh',
      dueDate: '2026-08-10',
      assignedTo: 'Phòng Quản lý Cán bộ',
      completed: false,
      linkModule: 'personnel'
    },
    {
      id: 'task-5',
      title: 'Nghiệm thu khối lượng hoàn thành đợt 2 - Dự án Cảng hàng không',
      category: 'du_an',
      priority: 'trung_binh',
      dueDate: '2026-08-15',
      assignedTo: 'Thượng tá Nguyễn Văn Hùng',
      completed: true,
      linkModule: 'projects'
    }
  ]);

  // Work Schedule State
  const [schedules, setSchedules] = useState<ScheduleEvent[]>([
    {
      id: 'sch-1',
      title: 'Tổ chức Hủy nổ 12 quả bom MK-82 tập trung tại Thừa Thiên Huế',
      date: '2026-07-29',
      time: '07:30',
      location: 'Bãi hủy nổ BTL Quân khu 4, Huế',
      type: 'huy_no',
      assignedTo: 'Lê Hoàng Nam (Chỉ huy bãi hủy)',
      status: 'sap_toi',
      description: 'Đã đảm bảo chốt chặn bán kính an toàn 1.500m theo đúng QCVN 01:2019/BQP.'
    },
    {
      id: 'sch-2',
      title: 'Dò tìm tín hiệu khu vực lòng hồ thủy điện A Lưới (Sâu đến 5m)',
      date: '2026-07-30',
      time: '08:00',
      location: 'Công trường Thủy điện A Lưới',
      type: 'do_tim',
      assignedTo: 'Tổ Kỹ thuật Thi công 1',
      status: 'sap_toi'
    },
    {
      id: 'sch-3',
      title: 'Nghiệm thu bàn giao 45.5 ha mặt bằng sạch cho Cảng hàng không Long Thành',
      date: '2026-08-01',
      time: '09:00',
      location: 'Huyện Long Thành, Đồng Nai',
      type: 'nghiem_thu',
      assignedTo: 'Nguyễn Văn Hùng & CĐT Long Thành',
      status: 'sap_toi'
    },
    {
      id: 'sch-4',
      title: 'Đưa 03 máy dò bom Vallon VXC1 đi kiểm định tại Trung tâm BMTT',
      date: '2026-08-03',
      time: '14:00',
      location: 'Trạm Kiểm định Thiết bị RPBM - Hà Nội',
      type: 'dang_kiem',
      assignedTo: 'Trần Quốc Tuấn',
      status: 'sap_toi'
    },
    {
      id: 'sch-5',
      title: 'Họp Giao ban Đánh giá công tác An toàn RPBM Tháng 07/2026',
      date: '2026-07-31',
      time: '14:30',
      location: 'Phòng họp Tầng 3 - Cục BTM',
      type: 'hop_hanh',
      assignedTo: 'Toàn thể Cán bộ Phòng RPBM',
      status: 'sap_toi'
    }
  ]);

  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false);
  const [newScheduleForm, setNewScheduleForm] = useState({
    title: '',
    date: formatDateForInput(new Date()),
    time: '08:00',
    location: '',
    type: 'do_tim' as ScheduleEvent['type'],
    assignedTo: '',
    description: ''
  });

  const alerts = generateAutoAlerts();
  const documents = getDocuments().filter(d => d.dataStatus !== 'da_xoa');
  const projects = getProjects().filter(p => p.dataStatus !== 'da_xoa');
  const personnel = getPersonnel().filter(p => p.dataStatus !== 'da_xoa');
  const equipment = getEquipment().filter(e => e.dataStatus !== 'da_xoa');

  // ==========================================
  // CALCULATE ALL 19 MANDATORY SECTION 4 METRICS
  // ==========================================

  // 1. Tổng số văn bản đến trong tháng
  const incomingDocsThisMonth = documents.filter(d => d.type === 'vanban_den');

  // 2. Tổng số văn bản đi trong tháng
  const outgoingDocsThisMonth = documents.filter(d => d.type === 'vanban_di');

  // 3. Văn bản chưa xử lý
  const unprocessedDocs = documents.filter(
    d => d.status === 'cho_xuly' || d.status === 'dang_thuc_hien'
  );

  // 4. Văn bản sắp đến hạn
  const expiringDocs = documents.filter(
    d => d.status !== 'da_hoan_thanh' && getDaysRemaining(d.deadline) <= 15
  );

  // 5. Tổng số dự án
  const totalProjects = projects;

  // 6. Dự án đang triển khai
  const activeProjects = projects.filter(p => p.status === 'dang_thi_cong');

  // 7. Dự án chậm tiến độ
  const delayedProjects = projects.filter(
    p => p.status === 'tam_dung' || (p.progressPercent < 50 && getDaysRemaining(p.endDate) <= 60)
  );

  // 8. Dự án sắp hết thời gian thực hiện
  const expiringProjects = projects.filter(
    p => p.status !== 'hoan_thanh' && getDaysRemaining(p.endDate) <= 45
  );

  // 9. Tổng giá trị các dự án
  const totalBudgetVnd = projects.reduce((acc, p) => acc + p.budgetVnd, 0);

  // 10. Giá trị đã thực hiện
  const completedValueVnd = projects.reduce(
    (acc, p) => acc + Math.round((p.budgetVnd * p.progressPercent) / 100),
    0
  );

  // 11. Giá trị đã nghiệm thu (ước tính theo tiến độ nghiệm thu ~ 75% giá trị đã làm hoặc dự án hoàn thành)
  const acceptedValueVnd = projects.reduce((acc, p) => {
    if (p.status === 'hoan_thanh' || p.status === 'cho_nghiem_thu') {
      return acc + Math.round(p.budgetVnd * 0.9);
    }
    return acc + Math.round((p.budgetVnd * p.progressPercent * 0.75) / 100);
  }, 0);

  // 12. Giá trị đã thanh toán (ước tính ~65% ngân sách dự án đang làm/hoàn thành)
  const paidValueVnd = projects.reduce((acc, p) => {
    if (p.status === 'hoan_thanh') return acc + Math.round(p.budgetVnd * 0.95);
    return acc + Math.round((p.budgetVnd * p.progressPercent * 0.65) / 100);
  }, 0);

  // 13. Giá trị còn lại
  const remainingValueVnd = totalBudgetVnd - paidValueVnd;

  // 14. Phương tiện sắp hết hạn đăng kiểm
  const expiringVehicles = equipment.filter(
    e => e.category === 'phuong_tien' && getDaysRemaining(e.nextCalibrationDate) <= 30
  );

  // 15. Trang thiết bị sắp hết hạn kiểm định
  const expiringEquipment = equipment.filter(
    e => e.category !== 'phuong_tien' && getDaysRemaining(e.nextCalibrationDate) <= 30
  );

  // 16. Chứng chỉ nhân sự sắp hết hạn
  const expiringCertificatesList: { person: Personnel; cert: PersonnelCertificate }[] = [];
  personnel.forEach(p => {
    p.certificates.forEach(c => {
      if (getDaysRemaining(c.expiryDate) <= 60) {
        expiringCertificatesList.push({ person: p, cert: c });
      }
    });
  });

  // 17. Hồ sơ chưa hoàn thiện
  const incompleteDocs = documents.filter(
    d => d.status === 'cho_xuly' || !d.driveUrl || !d.approvedBy
  );

  // 18. Nhiệm vụ đang chờ phê duyệt
  const pendingApprovalTasksCount =
    tasks.filter(t => !t.completed && t.priority === 'gap').length +
    unprocessedDocs.length +
    projects.filter(p => p.approvalStatus === 'cho_duyet').length;

  // 19. Cảnh báo mới nhất
  const criticalAlerts = alerts.filter(a => a.severity === 'critical');
  const warningAlerts = alerts.filter(a => a.severity === 'warning');

  // Filtered Alerts List for the Alerts Section
  const filteredAlerts = alerts.filter(a => {
    if (filterSeverity === 'critical' && a.severity !== 'critical') return false;
    if (filterSeverity === 'warning' && a.severity !== 'warning') return false;
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  const handleSendReminder = (alert: AlertItem) => {
    setToastMsg(`Đã gửi thông báo nhắc nhở đến cán bộ phụ trách: "${alert.targetName}"`);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScheduleForm.title) return;
    const item: ScheduleEvent = {
      id: `sch-${Date.now()}`,
      ...newScheduleForm,
      status: 'sap_toi'
    };
    setSchedules([item, ...schedules]);
    setShowAddScheduleModal(false);
    setNewScheduleForm({
      title: '',
      date: formatDateForInput(new Date()),
      time: '08:00',
      location: '',
      type: 'do_tim',
      assignedTo: '',
      description: ''
    });
    setToastMsg('Đã thêm lịch công tác mới vào kế hoạch!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Helper renderer for modal drill-down based on activeStatModal
  const renderStatModalContent = () => {
    if (!activeStatModal) return null;

    const q = modalSearch.toLowerCase().trim();

    let title = '';
    let icon = <Activity className="w-5 h-5 text-emerald-400" />;
    let items: any[] = [];
    let itemType: 'doc' | 'project' | 'financial' | 'equipment' | 'cert' | 'alert' | 'task' = 'doc';

    switch (activeStatModal) {
      case 'incoming_docs':
        title = 'Danh sách Văn bản Đến trong Tháng';
        icon = <FileText className="w-5 h-5 text-sky-400" />;
        itemType = 'doc';
        items = incomingDocsThisMonth;
        break;
      case 'outgoing_docs':
        title = 'Danh sách Văn bản Đi trong Tháng';
        icon = <FileText className="w-5 h-5 text-indigo-400" />;
        itemType = 'doc';
        items = outgoingDocsThisMonth;
        break;
      case 'unprocessed_docs':
        title = 'Văn bản Chưa Xử lý';
        icon = <AlertCircle className="w-5 h-5 text-amber-400" />;
        itemType = 'doc';
        items = unprocessedDocs;
        break;
      case 'expiring_docs':
        title = 'Văn bản Sắp đến Hạn xử lý';
        icon = <Clock className="w-5 h-5 text-rose-400" />;
        itemType = 'doc';
        items = expiringDocs;
        break;
      case 'total_projects':
        title = 'Danh sách Tất cả Dự án Rà phá Bom mìn';
        icon = <Bomb className="w-5 h-5 text-emerald-400" />;
        itemType = 'project';
        items = totalProjects;
        break;
      case 'active_projects':
        title = 'Dự án Đang Triển khai Thi công';
        icon = <Activity className="w-5 h-5 text-sky-400" />;
        itemType = 'project';
        items = activeProjects;
        break;
      case 'delayed_projects':
        title = 'Dự án Chậm Tiến độ / Tạm dừng';
        icon = <AlertTriangle className="w-5 h-5 text-rose-400" />;
        itemType = 'project';
        items = delayedProjects;
        break;
      case 'expiring_projects':
        title = 'Dự án Sắp hết Thời gian Thực hiện';
        icon = <Clock className="w-5 h-5 text-amber-400" />;
        itemType = 'project';
        items = expiringProjects;
        break;
      case 'financial_summary':
      case 'total_budget':
      case 'completed_value':
      case 'accepted_value':
      case 'paid_value':
      case 'remaining_value':
        title = 'Chi tiết Tổng hợp Ngân sách & Giá trị Tài chính Các Dự án';
        icon = <DollarSign className="w-5 h-5 text-emerald-400" />;
        itemType = 'financial';
        items = projects;
        break;
      case 'expiring_vehicles':
        title = 'Phương tiện Sắp Hết hạn Đăng kiểm (Xe chở vật nổ & chỉ huy)';
        icon = <Truck className="w-5 h-5 text-amber-400" />;
        itemType = 'equipment';
        items = expiringVehicles;
        break;
      case 'expiring_equipment':
        title = 'Trang thiết bị / Máy dò Sắp Hết hạn Kiểm định';
        icon = <ShieldAlert className="w-5 h-5 text-amber-400" />;
        itemType = 'equipment';
        items = expiringEquipment;
        break;
      case 'expiring_certs':
        title = 'Chứng chỉ Cán bộ Sắp Hết hạn';
        icon = <UserCheck className="w-5 h-5 text-rose-400" />;
        itemType = 'cert';
        items = expiringCertificatesList;
        break;
      case 'incomplete_docs':
        title = 'Hồ sơ Chưa Hoàn thiện (Thiếu File Scan / Chưa Phê duyệt)';
        icon = <FolderCheck className="w-5 h-5 text-amber-400" />;
        itemType = 'doc';
        items = incompleteDocs;
        break;
      case 'pending_tasks':
        title = 'Nhiệm vụ & Hồ sơ Đang chờ Phê duyệt';
        icon = <CheckSquare className="w-5 h-5 text-amber-400" />;
        itemType = 'task';
        items = tasks.filter(t => !t.completed);
        break;
      case 'latest_alerts':
        title = 'Thông báo và Cảnh báo Mới nhất Hệ thống';
        icon = <ShieldAlert className="w-5 h-5 text-red-400" />;
        itemType = 'alert';
        items = alerts;
        break;
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-slate-800 border border-slate-700">{icon}</div>
              <div>
                <h3 className="text-base font-bold text-white">{title}</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Hiển thị {items.length} mục dữ liệu chi tiết
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setActiveStatModal(null);
                setModalSearch('');
              }}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-900/80 flex items-center gap-3 shrink-0">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm thông tin trong danh sách..."
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Items Content */}
          <div className="p-6 overflow-y-auto space-y-3 flex-1">
            {items.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                Không tìm thấy dữ liệu nào phù hợp với yêu cầu này.
              </div>
            ) : (
              items
                .filter(item => {
                  if (!q) return true;
                  const str = JSON.stringify(item).toLowerCase();
                  return str.includes(q);
                })
                .map((item, idx) => {
                  if (itemType === 'doc') {
                    const doc = item as DocumentRecord;
                    return (
                      <div
                        key={doc.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {doc.code}
                            </span>
                            <span className="text-emerald-400 font-semibold">{doc.category}</span>
                            <span className="text-slate-400">({formatDateVN(doc.issueDate)})</span>
                          </div>
                          <h4 className="font-bold text-white text-sm leading-snug">{doc.title}</h4>
                          <p className="text-slate-400 text-[11px]">
                            Cơ quan ban hành: <strong className="text-slate-200">{doc.issuer}</strong> • Hạn xử lý: <strong className="text-amber-300 font-mono">{formatDateVN(doc.deadline)}</strong>
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            onNavigateTab('documents', doc.id);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Xem chi tiết</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (itemType === 'project') {
                    const pj = item as Project;
                    return (
                      <div
                        key={pj.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {pj.code}
                            </span>
                            <span className="font-bold text-emerald-400 font-mono">{formatVNDShort(pj.budgetVnd)}</span>
                            <span className="text-slate-400">• {pj.areaHa} ha</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{pj.name}</h4>
                          <p className="text-slate-400 text-[11px]">
                            Địa điểm: {pj.commune}, {pj.district}, {pj.province} • Chỉ huy: <strong className="text-slate-200">{pj.commanderName}</strong>
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <div className="w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-full"
                                style={{ width: `${pj.progressPercent}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-400">{pj.progressPercent}% Thi công</span>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            onNavigateTab('projects', pj.id);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Xem dự án</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (itemType === 'financial') {
                    const pj = item as Project;
                    const doneVal = Math.round((pj.budgetVnd * pj.progressPercent) / 100);
                    const paidVal = Math.round(doneVal * 0.7);
                    const remVal = pj.budgetVnd - paidVal;
                    return (
                      <div
                        key={pj.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-white text-sm">{pj.name}</span>
                          <span className="font-mono font-bold text-emerald-400">{pj.code}</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1 border-t border-slate-800/80 font-mono text-[11px]">
                          <div>
                            <span className="text-slate-500 block text-[10px]">Tổng Ngân sách</span>
                            <span className="font-bold text-slate-200">{formatVNDShort(pj.budgetVnd)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Giá trị Đã làm</span>
                            <span className="font-bold text-sky-400">{formatVNDShort(doneVal)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Đã Nghiệm thu</span>
                            <span className="font-bold text-amber-400">{formatVNDShort(Math.round(doneVal * 0.85))}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Đã Thanh toán</span>
                            <span className="font-bold text-emerald-400">{formatVNDShort(paidVal)}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block text-[10px]">Giá trị Còn lại</span>
                            <span className="font-bold text-rose-400">{formatVNDShort(remVal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  if (itemType === 'equipment') {
                    const eq = item as EquipmentItem;
                    const days = getDaysRemaining(eq.nextCalibrationDate);
                    return (
                      <div
                        key={eq.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {eq.code}
                            </span>
                            <span className="text-amber-400 font-semibold">{eq.brandModel}</span>
                            <span className="text-slate-400">({eq.serialOrPlate})</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{eq.name}</h4>
                          <p className="text-slate-400 text-[11px]">
                            Vị trí: <strong className="text-slate-200">{eq.location}</strong> • Hạn đăng kiểm / kiểm định: <strong className="text-amber-300 font-mono">{formatDateVN(eq.nextCalibrationDate)}</strong> ({days < 0 ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`})
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            onNavigateTab('equipment', eq.id);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Quản lý thiết bị</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (itemType === 'cert') {
                    const { person, cert } = item;
                    const days = getDaysRemaining(cert.expiryDate);
                    return (
                      <div
                        key={cert.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] font-bold bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                              {cert.certificateNo}
                            </span>
                            <span className="text-rose-400 font-semibold">{cert.issuedBy}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{cert.name}</h4>
                          <p className="text-slate-400 text-[11px]">
                            Cán bộ sở hữu: <strong className="text-emerald-300">{person.fullName}</strong> ({person.rankTitle} - {person.unit}) • Ngày hết hạn: <strong className="text-amber-300 font-mono">{formatDateVN(cert.expiryDate)}</strong> ({days < 0 ? `Quá hạn ${Math.abs(days)} ngày` : `Còn ${days} ngày`})
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            onNavigateTab('personnel', person.id);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Xem cán bộ</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (itemType === 'task') {
                    const task = item as TodoTask;
                    return (
                      <div
                        key={task.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-950 text-amber-300 border border-amber-700">
                              {task.priority === 'gap' ? 'GẤP' : 'TRUNG BÌNH'}
                            </span>
                            <span className="text-slate-400 font-mono">Hạn: {formatDateVN(task.dueDate)}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{task.title}</h4>
                          <p className="text-slate-400 text-[11px]">Giao cho: <strong className="text-slate-200">{task.assignedTo}</strong></p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            if (task.linkModule) onNavigateTab(task.linkModule);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Xử lý ngay</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  if (itemType === 'alert') {
                    const alert = item as AlertItem;
                    return (
                      <div
                        key={alert.id || idx}
                        className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                alert.severity === 'critical'
                                  ? 'bg-red-950 text-red-300 border border-red-700'
                                  : 'bg-amber-950 text-amber-300 border border-amber-700'
                              }`}
                            >
                              {alert.severity}
                            </span>
                            <span className="text-slate-400 font-mono">Hạn: {formatDateVN(alert.dueDate)}</span>
                          </div>
                          <h4 className="font-bold text-white text-sm">{alert.title}</h4>
                          <p className="text-slate-400 text-[11px]">Đối tượng: <strong className="text-emerald-300">{alert.targetName}</strong></p>
                        </div>
                        <button
                          onClick={() => {
                            setActiveStatModal(null);
                            onNavigateTab(alert.linkModule, alert.linkId);
                          }}
                          className="self-start sm:self-center px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                        >
                          <span>Xem chi tiết</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  }

                  return null;
                })
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notice */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 border border-emerald-600 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in text-xs font-semibold">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Drill-down modal */}
      {renderStatModalContent()}

      {/* Banner Intro */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/60 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 opacity-10 pointer-events-none">
          <Bomb className="w-64 h-64 text-emerald-400" />
        </div>
        <div className="relative z-10 max-w-4xl">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-4 h-4" /> Báo cáo Tổng quan Nghiệp vụ & Điều hành Trung tâm (QLRPBM)
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            Trang Tổng Quan & Giám Sát Cảnh Báo Chuẩn QCVN 01:2019/BQP
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Hệ thống hiển thị tập trung 19 chỉ số chỉ đạo nghiệp vụ: theo dõi tiến độ thi công rà phá bom mìn, văn bản hồ sơ, phân bổ ngân sách - giá trị thanh toán, hạn đăng kiểm máy dò - phương tiện, chứng chỉ cán bộ & lịch công tác hủy nổ hiện trường.
          </p>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION 4 MANDATORY STAT CARDS (19 METRICS) */}
      {/* ========================================== */}

      {/* GROUP 1: VĂN BẢN & HỒ SƠ (4 cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Thống Kê Văn Bản & Hồ Sơ Nghiệp Vụ (Bấm vào thẻ để xem chi tiết)
          </h3>
          <span className="text-[11px] text-slate-500 font-mono">Cập nhật thời gian thực</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 1. Tổng số văn bản đến trong tháng */}
          <div
            onClick={() => setActiveStatModal('incoming_docs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group relative"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Văn bản Đến trong tháng</span>
              <div className="p-2 bg-sky-950 text-sky-400 rounded-lg border border-sky-800 group-hover:bg-sky-900">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {incomingDocsThisMonth.length} <span className="text-xs text-slate-400 font-sans font-normal">văn bản</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Công văn & Chỉ thị BQP</span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 2. Tổng số văn bản đi trong tháng */}
          <div
            onClick={() => setActiveStatModal('outgoing_docs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-indigo-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Văn bản Đi trong tháng</span>
              <div className="p-2 bg-indigo-950 text-indigo-400 rounded-lg border border-indigo-800 group-hover:bg-indigo-900">
                <Send className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {outgoingDocsThisMonth.length} <span className="text-xs text-slate-400 font-sans font-normal">văn bản</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Báo cáo & Tờ trình gửi CĐT</span>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 3. Văn bản chưa xử lý */}
          <div
            onClick={() => setActiveStatModal('unprocessed_docs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Văn bản Chưa Xử Lý</span>
              <div className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800 group-hover:bg-amber-900">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {unprocessedDocs.length} <span className="text-xs text-slate-400 font-sans font-normal">hồ sơ</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Cần giao việc / Phê duyệt</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 4. Văn bản sắp đến hạn */}
          <div
            onClick={() => setActiveStatModal('expiring_docs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Văn bản Sắp Đến Hạn</span>
              <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800 group-hover:bg-rose-900">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-300 font-mono">
              {expiringDocs.length} <span className="text-xs text-slate-400 font-sans font-normal">cần giải quyết</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Hạn xử lý dưới 15 ngày</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* GROUP 2: DỰ ÁN RÀ PHÁ BOM MÌN (4 cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Bomb className="w-4 h-4 text-emerald-400" /> Thống Kê Tiến Độ Thi Công Dự Án RPBM (Bấm vào thẻ để xem chi tiết)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* 5. Tổng số dự án */}
          <div
            onClick={() => setActiveStatModal('total_projects')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Tổng Số Dự Án</span>
              <div className="p-2 bg-emerald-950 text-emerald-400 rounded-lg border border-emerald-800 group-hover:bg-emerald-900">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-white font-mono">
              {totalProjects.length} <span className="text-xs text-slate-400 font-sans font-normal">dự án</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Toàn bộ địa bàn quản lý</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 6. Dự án đang triển khai */}
          <div
            onClick={() => setActiveStatModal('active_projects')}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Dự Án Đang Triển Khai</span>
              <div className="p-2 bg-sky-950 text-sky-400 rounded-lg border border-sky-800 group-hover:bg-sky-900">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-sky-300 font-mono">
              {activeProjects.length} <span className="text-xs text-slate-400 font-sans font-normal">đang thi công</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Đội thi công hiện trường</span>
              <ChevronRight className="w-3.5 h-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 7. Dự án chậm tiến độ */}
          <div
            onClick={() => setActiveStatModal('delayed_projects')}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Dự Án Chậm Tiến Độ</span>
              <div className="p-2 bg-rose-950 text-rose-400 rounded-lg border border-rose-800 group-hover:bg-rose-900">
                <AlertTriangle className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-rose-400 font-mono">
              {delayedProjects.length} <span className="text-xs text-slate-400 font-sans font-normal">cần khắc phục</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Tiến độ dưới 50% chỉ tiêu</span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>

          {/* 8. Dự án sắp hết thời gian thực hiện */}
          <div
            onClick={() => setActiveStatModal('expiring_projects')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Dự Án Sắp Hết Thời Gian</span>
              <div className="p-2 bg-amber-950 text-amber-400 rounded-lg border border-amber-800 group-hover:bg-amber-900">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono">
              {expiringProjects.length} <span className="text-xs text-slate-400 font-sans font-normal">sắp hết hạn</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center justify-between">
              <span>Hạn kết thúc dưới 45 ngày</span>
              <ChevronRight className="w-3.5 h-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
          </div>
        </div>
      </div>

      {/* GROUP 3: TÀI CHÍNH & GIÁ TRỊ DỰ ÁN (5 cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Thống Kê Giá Trị Tài Chính Dự Án (Bấm vào thẻ để xem chi tiết)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* 9. Tổng giá trị các dự án */}
          <div
            onClick={() => setActiveStatModal('total_budget')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">9. Tổng Giá Trị Dự Án</span>
            <div className="text-lg font-black text-emerald-400 font-mono leading-tight">
              {formatVNDShort(totalBudgetVnd)}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Tổng ngân sách phê duyệt</span>
          </div>

          {/* 10. Giá trị đã thực hiện */}
          <div
            onClick={() => setActiveStatModal('completed_value')}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">10. Giá Trị Đã Thực Hiện</span>
            <div className="text-lg font-black text-sky-400 font-mono leading-tight">
              {formatVNDShort(completedValueVnd)}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Khối lượng hoàn thành</span>
          </div>

          {/* 11. Giá trị đã nghiệm thu */}
          <div
            onClick={() => setActiveStatModal('accepted_value')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">11. Giá Trị Đã Nghiệm Thu</span>
            <div className="text-lg font-black text-amber-300 font-mono leading-tight">
              {formatVNDShort(acceptedValueVnd)}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Biên bản nghiệm thu đợt</span>
          </div>

          {/* 12. Giá trị đã thanh toán */}
          <div
            onClick={() => setActiveStatModal('paid_value')}
            className="bg-slate-900/90 border border-slate-800 hover:border-emerald-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">12. Giá Trị Đã Thanh Toán</span>
            <div className="text-lg font-black text-emerald-300 font-mono leading-tight">
              {formatVNDShort(paidValueVnd)}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Đã giải ngân kho bạc</span>
          </div>

          {/* 13. Giá trị còn lại */}
          <div
            onClick={() => setActiveStatModal('remaining_value')}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group"
          >
            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">13. Giá Trị Còn Lại</span>
            <div className="text-lg font-black text-rose-400 font-mono leading-tight">
              {formatVNDShort(remainingValueVnd)}
            </div>
            <span className="text-[10px] text-slate-500 mt-2 block">Chưa thanh toán</span>
          </div>
        </div>
      </div>

      {/* GROUP 4: TRANG THIẾT BỊ, CHỨNG CHỈ & PHÊ DUYỆT (6 cards) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" /> Thống Kê Cảnh Báo Hạn & Nhiệm Vụ Phê Duyệt (Bấm vào thẻ để xem chi tiết)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* 14. Phương tiện sắp hết hạn đăng kiểm */}
          <div
            onClick={() => setActiveStatModal('expiring_vehicles')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">14. Phương tiện Sắp Hạn Đăng Kiểm</span>
              <div className="text-xl font-black text-amber-300 font-mono mt-1">
                {expiringVehicles.length} <span className="text-xs font-normal text-slate-400">xe chở vật nổ</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
              <Truck className="w-5 h-5" />
            </div>
          </div>

          {/* 15. Trang thiết bị sắp hết hạn kiểm định */}
          <div
            onClick={() => setActiveStatModal('expiring_equipment')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">15. Thiết bị Sắp Hạn Kiểm Định</span>
              <div className="text-xl font-black text-amber-300 font-mono mt-1">
                {expiringEquipment.length} <span className="text-xs font-normal text-slate-400">máy dò</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          {/* 16. Chứng chỉ nhân sự sắp hết hạn */}
          <div
            onClick={() => setActiveStatModal('expiring_certs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-rose-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">16. Chứng chỉ Sắp Hết Hạn</span>
              <div className="text-xl font-black text-rose-300 font-mono mt-1">
                {expiringCertificatesList.length} <span className="text-xs font-normal text-slate-400">kỹ thuật viên</span>
              </div>
            </div>
            <div className="p-2.5 bg-rose-950 text-rose-400 rounded-xl border border-rose-800">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>

          {/* 17. Hồ sơ chưa hoàn thiện */}
          <div
            onClick={() => setActiveStatModal('incomplete_docs')}
            className="bg-slate-900/90 border border-slate-800 hover:border-amber-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">17. Hồ sơ Chưa Hoàn Thiện</span>
              <div className="text-xl font-black text-amber-300 font-mono mt-1">
                {incompleteDocs.length} <span className="text-xs font-normal text-slate-400">tài liệu</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-950 text-amber-400 rounded-xl border border-amber-800">
              <FolderCheck className="w-5 h-5" />
            </div>
          </div>

          {/* 18. Nhiệm vụ đang chờ phê duyệt */}
          <div
            onClick={() => setActiveStatModal('pending_tasks')}
            className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">18. Nhiệm vụ Chờ Phê Duyệt</span>
              <div className="text-xl font-black text-sky-300 font-mono mt-1">
                {pendingApprovalTasksCount} <span className="text-xs font-normal text-slate-400">tác vụ</span>
              </div>
            </div>
            <div className="p-2.5 bg-sky-950 text-sky-400 rounded-xl border border-sky-800">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>

          {/* 19. Thông báo và cảnh báo mới nhất */}
          <div
            onClick={() => setActiveStatModal('latest_alerts')}
            className="bg-slate-900/90 border border-slate-800 hover:border-red-500/60 rounded-xl p-4 shadow-lg cursor-pointer transition-all hover:scale-[1.01] group flex items-center justify-between"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase block">19. Cảnh báo Hệ thống</span>
              <div className="text-xl font-black text-red-400 font-mono mt-1">
                {alerts.length} <span className="text-xs font-normal text-red-300">({criticalAlerts.length} khẩn)</span>
              </div>
            </div>
            <div className="p-2.5 bg-red-950 text-red-400 rounded-xl border border-red-800">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SECTION VISUALIZATIONS (CHARTS & SCHEDULE) */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VISUAL 1: BIỂU ĐỒ CỘT (FINANCIAL BAR CHART) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" /> Biểu Đồ Cột: So Sánh Giá Trị Tài Chính Ngân Sách Các Dự Án
            </h3>
            <button
              onClick={() => setActiveStatModal('financial_summary')}
              className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
            >
              Xem chi tiết <ExternalLink className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4 pt-2">
            {/* Visual Bar Comparison for each Project */}
            {projects.slice(0, 4).map(pj => {
              const doneVal = Math.round((pj.budgetVnd * pj.progressPercent) / 100);
              const acceptedVal = Math.round(doneVal * 0.8);
              const paidVal = Math.round(doneVal * 0.65);
              const remainingVal = pj.budgetVnd - paidVal;

              const maxVal = pj.budgetVnd || 1;

              return (
                <div key={pj.id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white truncate max-w-[200px]">{pj.name}</span>
                    <span className="font-mono text-emerald-400 font-bold">{formatVNDShort(pj.budgetVnd)}</span>
                  </div>

                  {/* Stacked / Bar Visualization */}
                  <div className="space-y-1.5 text-[10px] font-mono">
                    {/* Bar 1: Giá trị thực hiện */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-slate-400 shrink-0">Thực hiện:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-sky-500 h-full rounded-full"
                          style={{ width: `${(doneVal / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-sky-300 font-bold">{formatVNDShort(doneVal)}</span>
                    </div>

                    {/* Bar 2: Đã nghiệm thu */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-slate-400 shrink-0">Nghiệm thu:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full"
                          style={{ width: `${(acceptedVal / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-amber-300 font-bold">{formatVNDShort(acceptedVal)}</span>
                    </div>

                    {/* Bar 3: Đã thanh toán */}
                    <div className="flex items-center gap-2">
                      <span className="w-20 text-slate-400 shrink-0">Thanh toán:</span>
                      <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full"
                          style={{ width: `${(paidVal / maxVal) * 100}%` }}
                        />
                      </div>
                      <span className="w-16 text-right text-emerald-300 font-bold">{formatVNDShort(paidVal)}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Legend */}
            <div className="flex flex-wrap items-center justify-around gap-2 pt-2 border-t border-slate-800/80 text-[11px]">
              <span className="flex items-center gap-1 text-sky-400"><span className="w-2.5 h-2.5 rounded bg-sky-500"></span> Thực hiện</span>
              <span className="flex items-center gap-1 text-amber-400"><span className="w-2.5 h-2.5 rounded bg-amber-400"></span> Nghiệm thu</span>
              <span className="flex items-center gap-1 text-emerald-400"><span className="w-2.5 h-2.5 rounded bg-emerald-500"></span> Thanh toán</span>
              <span className="flex items-center gap-1 text-rose-400"><span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Còn lại</span>
            </div>
          </div>
        </div>

        {/* VISUAL 2 & 3: BIỂU ĐỒ TRÒN & BIỂU ĐỒ TIẾN ĐỘ */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-sky-400" /> Biểu Đồ Tròn: Tỷ Lệ Trạng Thái Dự Án & Văn Bản
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {/* Donut Chart 1: Project Status */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between">
              <span className="text-xs font-bold text-slate-300 mb-2">Cơ cấu Trạng thái Dự án</span>
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Background Circle */}
                  <path
                    className="text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 1: Đang thi công (60%) */}
                  <path
                    className="text-emerald-500"
                    strokeDasharray="60, 100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 2: Chuẩn bị / Chờ nghiệm thu (25%) */}
                  <path
                    className="text-sky-400"
                    strokeDasharray="25, 100"
                    strokeDashoffset="-60"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  {/* Segment 3: Chậm tiến độ (15%) */}
                  <path
                    className="text-rose-500"
                    strokeDasharray="15, 100"
                    strokeDashoffset="-85"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-white font-mono">{projects.length}</span>
                  <span className="block text-[9px] text-slate-400">dự án</span>
                </div>
              </div>

              <div className="w-full space-y-1 text-[11px] pt-2 border-t border-slate-800">
                <div className="flex justify-between text-emerald-400">
                  <span>🟢 Đang thi công:</span>
                  <strong className="font-mono">{activeProjects.length}</strong>
                </div>
                <div className="flex justify-between text-sky-400">
                  <span>🔵 Chuẩn bị / Khảo sát:</span>
                  <strong className="font-mono">{projects.length - activeProjects.length - delayedProjects.length}</strong>
                </div>
                <div className="flex justify-between text-rose-400">
                  <span>🔴 Chậm / Tạm dừng:</span>
                  <strong className="font-mono">{delayedProjects.length}</strong>
                </div>
              </div>
            </div>

            {/* Donut Chart 2: Document Types */}
            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-between">
              <span className="text-xs font-bold text-slate-300 mb-2">Phân loại Văn bản Hồ sơ</span>
              {/* SVG Donut Chart */}
              <div className="relative w-28 h-28 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-slate-800"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-indigo-400"
                    strokeDasharray="45, 100"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-amber-400"
                    strokeDasharray="35, 100"
                    strokeDashoffset="-45"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-emerald-400"
                    strokeDasharray="20, 100"
                    strokeDashoffset="-80"
                    strokeWidth="3.8"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-lg font-black text-white font-mono">{documents.length}</span>
                  <span className="block text-[9px] text-slate-400">hồ sơ</span>
                </div>
              </div>

              <div className="w-full space-y-1 text-[11px] pt-2 border-t border-slate-800">
                <div className="flex justify-between text-indigo-400">
                  <span>📄 Văn bản Đến/Đi:</span>
                  <strong className="font-mono">{incomingDocsThisMonth.length + outgoingDocsThisMonth.length}</strong>
                </div>
                <div className="flex justify-between text-amber-400">
                  <span>📂 Phương án kỹ thuật:</span>
                  <strong className="font-mono">{documents.filter(d => d.type === 'hoso_duan' || d.type === 'phuongan').length}</strong>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>📜 Pháp lý & Khác:</span>
                  <strong className="font-mono">{documents.filter(d => d.type === 'phaply' || d.type === 'bienban').length}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* VISUAL 4 & 5: DANH SÁCH VIỆC CẦN XỬ LÝ & LỊCH CÔNG TÁC */}
      {/* ========================================== */}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* VISUAL 5: DANH SÁCH VIỆC CẦN XỬ LÝ (INTERACTIVE ACTIONABLE TO-DO) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-amber-400" /> Danh Sách Việc Cần Xử Lý Khẩn Cấp
            </h3>
            <span className="text-xs font-mono text-amber-400 font-bold bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
              {tasks.filter(t => !t.completed).length} việc đồn tồn
            </span>
          </div>

          <div className="space-y-2.5">
            {tasks.map(task => (
              <div
                key={task.id}
                className={`p-3 rounded-xl border transition-all flex items-start gap-3 ${
                  task.completed
                    ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                    : task.priority === 'gap'
                    ? 'bg-amber-950/20 border-amber-800/80'
                    : 'bg-slate-950/70 border-slate-800'
                }`}
              >
                <button
                  onClick={() => handleToggleTask(task.id)}
                  className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
                >
                  {task.completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <div className="w-4 h-4 rounded border border-slate-600 hover:border-emerald-400" />
                  )}
                </button>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase font-mono ${
                        task.priority === 'gap'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {task.priority === 'gap' ? 'Khẩn' : 'Trung bình'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Hạn: {formatDateVN(task.dueDate)}</span>
                  </div>

                  <p
                    className={`text-xs font-bold leading-snug ${
                      task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>

                  <p className="text-[10px] text-slate-400">
                    Phụ trách: <strong className="text-slate-300">{task.assignedTo}</strong>
                  </p>
                </div>

                {task.linkModule && !task.completed && (
                  <button
                    onClick={() => onNavigateTab(task.linkModule!)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[10px] flex items-center gap-1 shrink-0"
                  >
                    <span>Xử lý</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* VISUAL 6: LỊCH CÔNG TÁC HỆ THỐNG (WORK SCHEDULE CALENDAR) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-emerald-400" /> Lịch Công Tác Kế Hoạch Hiện Trường
            </h3>
            <button
              onClick={() => setShowAddScheduleModal(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm lịch</span>
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map(sch => (
              <div
                key={sch.id}
                className="p-3 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1.5 text-xs hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border ${
                      sch.type === 'huy_no'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : sch.type === 'do_tim'
                        ? 'bg-sky-950 text-sky-300 border-sky-800'
                        : sch.type === 'nghiem_thu'
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : 'bg-amber-950 text-amber-300 border-amber-800'
                    }`}
                  >
                    {sch.type === 'huy_no'
                      ? '💣 HỦY NỔ BOM MÌN'
                      : sch.type === 'do_tim'
                      ? '🔍 DÒ TÌM HIỆN TRƯỜNG'
                      : sch.type === 'nghiem_thu'
                      ? '✅ NGHIỆM THU ĐẤT SẠCH'
                      : sch.type === 'dang_kiem'
                      ? '🚚 KIỂM ĐỊNH THIẾT BỊ'
                      : '🏢 HỌP GIAO BAN'}
                  </span>
                  <span className="font-mono text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {sch.time} - {formatDateVN(sch.date)}
                  </span>
                </div>

                <h4 className="font-bold text-white text-xs sm:text-sm leading-snug">{sch.title}</h4>

                <p className="text-[11px] text-slate-400">
                  Địa điểm: <strong className="text-slate-200">{sch.location}</strong> • Cán bộ: <strong className="text-emerald-300">{sch.assignedTo}</strong>
                </p>

                {sch.description && (
                  <p className="text-[10px] text-slate-500 italic bg-slate-900/80 p-1.5 rounded border border-slate-800/60">
                    {sch.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL THÊM LỊCH CÔNG TÁC MỚI */}
      {showAddScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-400" /> Thêm Lịch Công Tác Hiện Trường Mới
              </h3>
              <button
                onClick={() => setShowAddScheduleModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung công tác (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Dò tìm tín hiệu khu vực lòng hồ..."
                  value={newScheduleForm.title}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày công tác</label>
                  <input
                    type="date"
                    value={newScheduleForm.date}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Giờ bắt đầu</label>
                  <input
                    type="text"
                    value={newScheduleForm.time}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, time: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại công tác</label>
                  <select
                    value={newScheduleForm.type}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, type: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="huy_no">💣 Hủy nổ bom mìn</option>
                    <option value="do_tim">🔍 Dò tìm hiện trường</option>
                    <option value="nghiem_thu">✅ Nghiệm thu đất sạch</option>
                    <option value="dang_kiem">🚚 Kiểm định thiết bị</option>
                    <option value="hop_hanh">🏢 Họp giao ban</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cán bộ / Đội phụ trách</label>
                  <input
                    type="text"
                    placeholder="Tên cán bộ..."
                    value={newScheduleForm.assignedTo}
                    onChange={e => setNewScheduleForm({ ...newScheduleForm, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Địa điểm công tác</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bãi hủy nổ Thừa Thiên Huế..."
                  value={newScheduleForm.location}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú bổ sung</label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu an toàn QCVN..."
                  value={newScheduleForm.description}
                  onChange={e => setNewScheduleForm({ ...newScheduleForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddScheduleModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                >
                  Lưu lịch công tác
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
