import React from 'react';
import {
  FileText,
  Calendar,
  User as UserIcon,
  Clock,
  Eye,
  Edit2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ArrowUpRight,
  ShieldAlert,
  Sliders,
  CheckSquare,
  Sparkles
} from 'lucide-react';
import { TaskItem, TaskStatus, User } from '../../types';
import { formatDateVN, TASK_STATUS_MAP, TASK_PRIORITY_MAP, getDaysRemaining } from '../../utils/formatters';

interface TaskListViewProps {
  tasks: TaskItem[];
  currentUser: User;
  onEditTask: (task: TaskItem) => void;
  onViewTask: (task: TaskItem) => void;
  onDeleteTask: (id: string) => void;
  onUpdateStatus: (task: TaskItem, newStatus: TaskStatus) => void;
}

export const TaskListView: React.FC<TaskListViewProps> = ({
  tasks,
  currentUser,
  onEditTask,
  onViewTask,
  onDeleteTask,
  onUpdateStatus
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
            <tr>
              <th className="p-3.5 w-28">Mã CV</th>
              <th className="p-3.5 min-w-[240px]">Tên & Nội dung Công việc</th>
              <th className="p-3.5 w-40">Chủ trì & Người giao</th>
              <th className="p-3.5 w-32">Thời gian & Hạn</th>
              <th className="p-3.5 w-28 text-center">Ưu tiên</th>
              <th className="p-3.5 w-36">Tiến độ (%)</th>
              <th className="p-3.5 w-36 text-center">Trạng thái</th>
              <th className="p-3.5 w-28 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-medium">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500">
                  <CheckSquare className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  Không tìm thấy công việc nào phù hợp với bộ lọc.
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const statusMeta = TASK_STATUS_MAP[task.status] || {
                  label: task.status,
                  classNames: 'bg-slate-800 text-slate-300 border-slate-700'
                };
                const priorityMeta = TASK_PRIORITY_MAP[task.priority] || {
                  label: task.priority,
                  classNames: 'bg-slate-800 text-slate-300 border-slate-700'
                };
                const daysRemaining = getDaysRemaining(task.deadline);
                const isOverdue = daysRemaining < 0 && task.status !== 'hoan_thanh' && task.status !== 'huy';

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-800/50 transition-colors group"
                  >
                    {/* Code */}
                    <td className="p-3.5 align-top">
                      <span className="font-mono font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-1 rounded-md inline-block">
                        {task.code}
                      </span>
                    </td>

                    {/* Title & Description & Linked Tags */}
                    <td className="p-3.5 align-top space-y-1.5">
                      <div
                        onClick={() => onViewTask(task)}
                        className="font-semibold text-slate-100 hover:text-emerald-400 cursor-pointer transition-colors line-clamp-2 text-sm leading-snug"
                      >
                        {task.title}
                      </div>
                      <p className="text-slate-400 text-[11px] line-clamp-1">
                        {task.description}
                      </p>

                      {/* Linked Metadata Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {task.projectName && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800/90 text-sky-300 border border-sky-800/50 px-2 py-0.5 rounded-full">
                            <FolderOpen className="w-3 h-3 text-sky-400" />
                            <span className="truncate max-w-[160px]">{task.projectName}</span>
                          </span>
                        )}
                        {task.docCode && (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-800/90 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded-full">
                            <FileText className="w-3 h-3 text-amber-400" />
                            <span>VB: {task.docCode}</span>
                          </span>
                        )}
                        {task.driveUrl && (
                          <a
                            href={task.driveUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] bg-slate-800 hover:bg-slate-700 text-teal-300 border border-teal-800/50 px-2 py-0.5 rounded-full transition-colors"
                          >
                            <ExternalLink className="w-3 h-3 text-teal-400" />
                            <span>Tệp Drive</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Personnel */}
                    <td className="p-3.5 align-top space-y-1">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-tight block">Chủ trì:</span>
                        <span className="font-semibold text-slate-200 text-xs">{task.leadAssignee}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase tracking-tight block">Người giao:</span>
                        <span className="text-slate-400 text-xs">{task.assigner}</span>
                      </div>
                      {task.collaborators && task.collaborators.length > 0 && (
                        <div className="text-[10px] text-slate-500 truncate max-w-[140px]" title={task.collaborators.join(', ')}>
                          PH: {task.collaborators.join(', ')}
                        </div>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="p-3.5 align-top space-y-1 font-mono text-[11px]">
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Bắt đầu:</span>
                        <span className="text-slate-300">{formatDateVN(task.startDate)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block font-sans">Hạn chót:</span>
                        <span className={isOverdue ? 'text-red-400 font-bold' : 'text-slate-300'}>
                          {formatDateVN(task.deadline)}
                        </span>
                      </div>
                      {isOverdue && (
                        <span className="bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-400 animate-pulse" />
                          Trễ {Math.abs(daysRemaining)} ngày
                        </span>
                      )}
                    </td>

                    {/* Priority */}
                    <td className="p-3.5 align-top text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border inline-block ${priorityMeta.classNames}`}>
                        {priorityMeta.label}
                      </span>
                    </td>

                    {/* Progress Bar */}
                    <td className="p-3.5 align-top space-y-1.5">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="font-mono font-bold text-slate-200">{task.progressPercent}%</span>
                        <span className="text-[10px] text-slate-500">
                          {task.progressPercent === 100 ? 'Xong' : task.progressPercent > 0 ? 'Đang chạy' : 'Chưa'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                        <div
                          className={`h-full transition-all duration-300 ${
                            task.progressPercent === 100
                              ? 'bg-emerald-500'
                              : task.progressPercent >= 50
                              ? 'bg-sky-500'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(0, task.progressPercent))}%` }}
                        />
                      </div>
                    </td>

                    {/* Status Select Badge */}
                    <td className="p-3.5 align-top text-center">
                      <select
                        value={task.status}
                        onChange={(e) => onUpdateStatus(task, e.target.value as TaskStatus)}
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer ${statusMeta.classNames}`}
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
                    </td>

                    {/* Actions */}
                    <td className="p-3.5 align-top text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onViewTask(task)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 transition-colors"
                          title="Xem chi tiết & phê duyệt"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditTask(task)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          title="Chỉnh sửa công việc"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                          title="Xóa công việc"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
