import React from 'react';
import {
  FileText,
  Calendar,
  User as UserIcon,
  Clock,
  Eye,
  Edit2,
  Trash2,
  FolderOpen,
  AlertTriangle,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { TaskItem, TaskStatus, User } from '../../types';
import { formatDateVN, TASK_STATUS_MAP, TASK_PRIORITY_MAP, getDaysRemaining } from '../../utils/formatters';

interface TaskKanbanViewProps {
  tasks: TaskItem[];
  currentUser: User;
  onEditTask: (task: TaskItem) => void;
  onViewTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (task: TaskItem, newStatus: TaskStatus) => void;
}

interface KanbanColumnDef {
  key: string;
  title: string;
  statuses: TaskStatus[];
  borderColor: string;
  badgeBg: string;
}

const KANBAN_COLUMNS: KanbanColumnDef[] = [
  {
    key: 'chua_thuc_hien',
    title: 'Chưa thực hiện',
    statuses: ['chua_thuc_hien'],
    borderColor: 'border-slate-700',
    badgeBg: 'bg-slate-800 text-slate-300'
  },
  {
    key: 'dang_thuc_hien',
    title: 'Đang thực hiện',
    statuses: ['dang_thuc_hien'],
    borderColor: 'border-blue-700',
    badgeBg: 'bg-blue-950 text-blue-300'
  },
  {
    key: 'cho_phoi_hop',
    title: 'Chờ phối hợp',
    statuses: ['cho_phoi_hop'],
    borderColor: 'border-indigo-700',
    badgeBg: 'bg-indigo-950 text-indigo-300'
  },
  {
    key: 'cho_phe_duyet',
    title: 'Chờ phê duyệt',
    statuses: ['cho_phe_duyet'],
    borderColor: 'border-purple-700',
    badgeBg: 'bg-purple-950 text-purple-300'
  },
  {
    key: 'hoan_thanh',
    title: 'Hoàn thành',
    statuses: ['hoan_thanh'],
    borderColor: 'border-emerald-700',
    badgeBg: 'bg-emerald-950 text-emerald-300'
  },
  {
    key: 'qua_han_khac',
    title: 'Quá hạn / Tạm dừng / Hủy',
    statuses: ['qua_han', 'tam_dung', 'huy'],
    borderColor: 'border-rose-800',
    badgeBg: 'bg-rose-950 text-rose-300'
  }
];

export const TaskKanbanView: React.FC<TaskKanbanViewProps> = ({
  tasks,
  currentUser,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onUpdateStatus
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
      {KANBAN_COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => col.statuses.includes(t.status));

        return (
          <div
            key={col.key}
            className={`bg-slate-900/90 border-t-2 ${col.borderColor} border-x border-b border-slate-800 rounded-2xl p-3 flex flex-col min-h-[500px] shadow-lg`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">{col.title}</h3>
                <span className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded-full ${col.badgeBg}`}>
                  {colTasks.length}
                </span>
              </div>
            </div>

            {/* Task Cards Container */}
            <div className="space-y-3 flex-1 overflow-y-auto max-h-[70vh] pr-1">
              {colTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-xl">
                  Không có công việc
                </div>
              ) : (
                colTasks.map((task) => {
                  const priorityMeta = TASK_PRIORITY_MAP[task.priority] || {
                    label: task.priority,
                    classNames: 'bg-slate-800 text-slate-300 border-slate-700'
                  };
                  const daysRemaining = getDaysRemaining(task.deadline);
                  const isOverdue = daysRemaining < 0 && task.status !== 'hoan_thanh' && task.status !== 'huy';

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3 space-y-2.5 shadow-md hover:shadow-xl transition-all group"
                    >
                      {/* Code & Priority */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                          {task.code}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-full border ${priorityMeta.classNames}`}>
                          {priorityMeta.label}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h4
                          onClick={() => onViewTask(task)}
                          className="font-semibold text-xs text-slate-100 hover:text-emerald-400 cursor-pointer line-clamp-2 leading-snug transition-colors"
                        >
                          {task.title}
                        </h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {task.description}
                        </p>
                      </div>

                      {/* Linked Attributes */}
                      {(task.projectName || task.docCode) && (
                        <div className="space-y-1 pt-1 text-[10px]">
                          {task.projectName && (
                            <div className="flex items-center gap-1 text-sky-400 truncate">
                              <FolderOpen className="w-3 h-3 shrink-0" />
                              <span className="truncate">{task.projectName}</span>
                            </div>
                          )}
                          {task.docCode && (
                            <div className="flex items-center gap-1 text-amber-400 truncate">
                              <FileText className="w-3 h-3 shrink-0" />
                              <span>VB: {task.docCode}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Lead Assignee & Dates */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <div className="w-5 h-5 rounded-full bg-emerald-900 border border-emerald-500/60 flex items-center justify-center font-bold text-[9px] text-emerald-200 shrink-0">
                            {task.leadAssignee.charAt(0)}
                          </div>
                          <span className="truncate text-[10px] text-slate-300">{task.leadAssignee}</span>
                        </div>

                        <div className="font-mono text-[10px] text-right shrink-0">
                          <div className={isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}>
                            {formatDateVN(task.deadline)}
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-[10px] text-slate-400">
                          <span>Tiến độ:</span>
                          <span className="font-mono font-bold text-slate-200">{task.progressPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full ${
                              task.progressPercent === 100
                                ? 'bg-emerald-500'
                                : task.progressPercent >= 50
                                ? 'bg-sky-500'
                                : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, task.progressPercent))}%` }}
                          />
                        </div>
                      </div>

                      {/* Status quick switch dropdown */}
                      <div className="pt-2 border-t border-slate-900 flex items-center justify-between gap-1">
                        <select
                          value={task.status}
                          onChange={(e) => onUpdateStatus(task, e.target.value as TaskStatus)}
                          className="text-[10px] bg-slate-900 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
                        >
                          <option value="chua_thuc_hien">Chưa thực hiện</option>
                          <option value="dang_thuc_hien">Đang thực hiện</option>
                          <option value="cho_phoi_hop">Chờ phối hợp</option>
                          <option value="cho_phe_duyet">Chờ phê duyệt</option>
                          <option value="hoan_thanh">Hoàn thành</option>
                          <option value="qua_han">Quá hạn</option>
                          <option value="tam_dung">Tạm dừng</option>
                          <option value="huy">Hủy</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => onViewTask(task)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-sky-400 transition-colors"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTask(task)}
                            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-amber-400 transition-colors"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
