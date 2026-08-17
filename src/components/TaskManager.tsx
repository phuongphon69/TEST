import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  List,
  Kanban,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  FileSpreadsheet,
  Download,
  RotateCcw,
  Sparkles,
  FolderOpen,
  UserCheck
} from 'lucide-react';
import { TaskItem, TaskStatus, TaskPriority, User } from '../types';
import {
  getTasks,
  saveTasks,
  getProjects,
  getDocuments,
  getUsers,
  getCurrentUser
} from '../utils/storage';
import { formatDateVN, getDaysRemaining } from '../utils/formatters';
import { TaskListView } from './tasks/TaskListView';
import { TaskKanbanView } from './tasks/TaskKanbanView';
import { TaskCalendarView } from './tasks/TaskCalendarView';
import { TaskFormModal } from './tasks/TaskFormModal';
import { TaskDetailModal } from './tasks/TaskDetailModal';

type TaskViewTab = 'danh_sach' | 'kanban' | 'lich';

export const TaskManager: React.FC = () => {
  const [tasks, setTasksState] = useState<TaskItem[]>(getTasks());
  const projects = getProjects();
  const documents = getDocuments();
  const userList = getUsers();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<TaskViewTab>('danh_sach');

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [leadFilter, setLeadFilter] = useState<string>('all');

  // Modal States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskItem | null>(null);

  // Save Task
  const handleSaveTask = (taskToSave: TaskItem) => {
    const existingIndex = tasks.findIndex((t) => t.id === taskToSave.id);
    let updatedTasks: TaskItem[];

    if (existingIndex >= 0) {
      updatedTasks = [...tasks];
      updatedTasks[existingIndex] = {
        ...taskToSave,
        updatedBy: currentUser.name,
        updatedAt: formatDateVN(new Date())
      };
    } else {
      updatedTasks = [
        {
          ...taskToSave,
          createdBy: currentUser.name,
          createdAt: formatDateVN(new Date()),
          updatedBy: currentUser.name,
          updatedAt: formatDateVN(new Date())
        },
        ...tasks
      ];
    }

    saveTasks(updatedTasks, `Lưu công việc: ${taskToSave.code} - ${taskToSave.title}`);
    setTasksState(updatedTasks);
    setIsFormOpen(false);
    setEditingTask(null);
    setViewingTask(null);
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa công việc này?')) {
      const updated = tasks.filter((t) => t.id !== id);
      saveTasks(updated, 'Xóa công việc khỏi hệ thống');
      setTasksState(updated);
    }
  };

  // Quick Status Change
  const handleUpdateStatus = (task: TaskItem, newStatus: TaskStatus) => {
    const updated = tasks.map((t) => {
      if (t.id === task.id) {
        return {
          ...t,
          status: newStatus,
          progressPercent: newStatus === 'hoan_thanh' ? 100 : t.progressPercent,
          updatedBy: currentUser.name,
          updatedAt: formatDateVN(new Date())
        };
      }
      return t;
    });
    saveTasks(updated, `Cập nhật trạng thái CV ${task.code} thành ${newStatus}`);
    setTasksState(updated);
  };

  // Filter Tasks Logic
  const filteredTasks = tasks.filter((t) => {
    if (t.dataStatus === 'da_xoa') return false;

    // Search text
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = t.code.toLowerCase().includes(q);
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchDesc = t.description?.toLowerCase().includes(q);
      const matchLead = t.leadAssignee.toLowerCase().includes(q);
      const matchAssigner = t.assigner.toLowerCase().includes(q);
      const matchProj = t.projectName?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchDesc && !matchLead && !matchAssigner && !matchProj) {
        return false;
      }
    }

    // Status filter
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;

    // Priority filter
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;

    // Project filter
    if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;

    // Lead filter
    if (leadFilter !== 'all' && t.leadAssignee !== leadFilter) return false;

    return true;
  });

  // Calculate Metrics
  const totalCount = tasks.filter((t) => t.dataStatus !== 'da_xoa').length;
  const inProgressCount = tasks.filter((t) => t.status === 'dang_thuc_hien').length;
  const pendingApprovalCount = tasks.filter((t) => t.status === 'cho_phe_duyet').length;
  const completedCount = tasks.filter((t) => t.status === 'hoan_thanh').length;
  const overdueCount = tasks.filter((t) => {
    const days = getDaysRemaining(t.deadline);
    return days < 0 && t.status !== 'hoan_thanh' && t.status !== 'huy';
  }).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-950 border border-emerald-700/80 text-emerald-400 rounded-xl shadow-lg">
            <CheckSquare className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white uppercase tracking-tight flex items-center gap-2">
              Phân Hệ Quản Lý Công Việc & Nhiệm Vụ (Mục 6)
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Phân công, theo dõi tiến độ, bảng Kanban & lịch giao việc cho 3–4 nhân sự phòng nghiệp vụ RPBM.
            </p>
          </div>
        </div>

        {/* View Switching Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('danh_sach')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'danh_sach'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <List className="w-4 h-4" />
            6.1. Danh Sách Bảng
          </button>

          <button
            onClick={() => setActiveTab('kanban')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'kanban'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4" />
            6.2. Bảng Kanban
          </button>

          <button
            onClick={() => setActiveTab('lich')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'lich'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CalendarIcon className="w-4 h-4" />
            6.3. Giao Diện Lịch
          </button>
        </div>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-slate-800 text-slate-300 rounded-lg">
            <CheckSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Tổng số CV</div>
            <div className="text-lg font-bold font-mono text-white">{totalCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-blue-900/60 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-blue-950 text-blue-400 rounded-lg">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-blue-300 uppercase font-bold">Đang thực hiện</div>
            <div className="text-lg font-bold font-mono text-blue-400">{inProgressCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-purple-900/60 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-purple-950 text-purple-400 rounded-lg">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-purple-300 uppercase font-bold">Chờ phê duyệt</div>
            <div className="text-lg font-bold font-mono text-purple-400">{pendingApprovalCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-emerald-900/60 p-3.5 rounded-xl flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950 text-emerald-400 rounded-lg">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-emerald-300 uppercase font-bold">Đã hoàn thành</div>
            <div className="text-lg font-bold font-mono text-emerald-400">{completedCount}</div>
          </div>
        </div>

        <div className="bg-slate-900 border border-red-900/60 p-3.5 rounded-xl flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="p-2.5 bg-red-950 text-red-400 rounded-lg">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-[10px] text-red-300 uppercase font-bold">Quá hạn xử lý</div>
            <div className="text-lg font-bold font-mono text-red-400">{overdueCount}</div>
          </div>
        </div>
      </div>

      {/* Filter & Action Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search & Select Filters */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Search Input */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm mã, tên công việc, người chủ trì..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">-- Tất cả trạng thái --</option>
            <option value="chua_thuc_hien">Chưa thực hiện</option>
            <option value="dang_thuc_hien">Đang thực hiện</option>
            <option value="cho_phoi_hop">Chờ phối hợp</option>
            <option value="cho_phe_duyet">Chờ phê duyệt</option>
            <option value="hoan_thanh">Hoàn thành</option>
            <option value="qua_han">Quá hạn</option>
            <option value="tam_dung">Tạm dừng</option>
            <option value="huy">Hủy</option>
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">-- Tất cả độ ưu tiên --</option>
            <option value="thuong">Mức Thường</option>
            <option value="khan">Mức Khẩn</option>
            <option value="thuong_khan">Mức Thượng khẩn</option>
            <option value="hoa_toc">Mức Hỏa tốc</option>
          </select>

          {/* Project Filter */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[200px] truncate"
          >
            <option value="all">-- Tất cả dự án --</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} - {p.name}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || leadFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
                setLeadFilter('all');
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Đặt lại bộ lọc"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Button: Create New Task */}
        <button
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          Thêm Công Việc Mới
        </button>
      </div>

      {/* Render Active View Tab */}
      {activeTab === 'danh_sach' && (
        <TaskListView
          tasks={filteredTasks}
          currentUser={currentUser}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsFormOpen(true);
          }}
          onViewTask={(task) => setViewingTask(task)}
          onDeleteTask={handleDeleteTask}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === 'kanban' && (
        <TaskKanbanView
          tasks={filteredTasks}
          currentUser={currentUser}
          onEditTask={(task) => {
            setEditingTask(task);
            setIsFormOpen(true);
          }}
          onViewTask={(task) => setViewingTask(task)}
          onDeleteTask={handleDeleteTask}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {activeTab === 'lich' && (
        <TaskCalendarView
          tasks={filteredTasks}
          onViewTask={(task) => setViewingTask(task)}
        />
      )}

      {/* Task Form Modal (Add/Edit) */}
      {isFormOpen && (
        <TaskFormModal
          initialTask={editingTask}
          currentUser={currentUser}
          projects={projects}
          documents={documents}
          allTasks={tasks}
          userList={userList}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
        />
      )}

      {/* Task Detail Modal */}
      {viewingTask && (
        <TaskDetailModal
          task={viewingTask}
          currentUser={currentUser}
          onClose={() => setViewingTask(null)}
          onEdit={() => {
            setEditingTask(viewingTask);
            setViewingTask(null);
            setIsFormOpen(true);
          }}
          onSaveTask={handleSaveTask}
        />
      )}
    </div>
  );
};
