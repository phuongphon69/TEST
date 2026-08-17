import React, { useState } from 'react';
import {
  X,
  CheckSquare,
  FileText,
  FolderOpen,
  User as UserIcon,
  Calendar,
  Clock,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Sliders,
  Send,
  Check,
  Edit2,
  ShieldCheck,
  Paperclip
} from 'lucide-react';
import { TaskItem, TaskStatus, User } from '../../types';
import { formatDateVN, TASK_STATUS_MAP, TASK_PRIORITY_MAP, getDaysRemaining } from '../../utils/formatters';

interface TaskDetailModalProps {
  task: TaskItem;
  currentUser: User;
  onClose: () => void;
  onEdit: () => void;
  onSaveTask: (updatedTask: TaskItem) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  currentUser,
  onClose,
  onEdit,
  onSaveTask
}) => {
  const [progressPercent, setProgressPercent] = useState<number>(task.progressPercent);
  const [status, setStatus] = useState<TaskStatus>(task.status);
  const [executionResult, setExecutionResult] = useState<string>(task.executionResult || '');
  const [approvalOpinion, setApprovalOpinion] = useState<string>(task.approvalOpinion || '');

  const statusMeta = TASK_STATUS_MAP[status] || {
    label: status,
    classNames: 'bg-slate-800 text-slate-300'
  };
  const priorityMeta = TASK_PRIORITY_MAP[task.priority] || {
    label: task.priority,
    classNames: 'bg-slate-800 text-slate-300'
  };

  const daysRemaining = getDaysRemaining(task.deadline);
  const isOverdue = daysRemaining < 0 && task.status !== 'hoan_thanh' && task.status !== 'huy';

  const handleUpdateTaskState = (newStatus?: TaskStatus, newProgress?: number) => {
    const updatedStatus = newStatus || status;
    const updatedProgress = newProgress ?? progressPercent;

    const updatedTask: TaskItem = {
      ...task,
      progressPercent: updatedProgress,
      status: updatedStatus,
      executionResult: executionResult.trim(),
      approvalOpinion: approvalOpinion.trim(),
      approvedBy: approvalOpinion.trim() ? currentUser.name : task.approvedBy,
      approvalDate: approvalOpinion.trim() ? formatDateVN(new Date()) : task.approvalDate,
      updatedBy: currentUser.name,
      updatedAt: formatDateVN(new Date())
    };

    onSaveTask(updatedTask);
    alert('Đã cập nhật tiến độ & kết quả công việc thành công!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header Banner */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-lg">
              {task.code}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${priorityMeta.classNames}`}>
              Mức {priorityMeta.label}
            </span>
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${statusMeta.classNames}`}>
              {statusMeta.label}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-4 h-4" /> Sửa
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 flex-1 text-xs text-slate-200">
          {/* Title & Description */}
          <div>
            <h2 className="text-base font-bold text-white mb-2 leading-snug">
              {task.title}
            </h2>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-300 leading-relaxed whitespace-pre-line">
              {task.description || 'Không có mô tả chi tiết.'}
            </div>
          </div>

          {/* Quick Progress & Status Bar */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">Tiến Độ Thực Hiện:</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{progressPercent}%</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-400">Đổi trạng thái:</span>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-lg border bg-slate-900 cursor-pointer ${statusMeta.classNames}`}
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
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={progressPercent}
                onChange={(e) => setProgressPercent(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
              <button
                type="button"
                onClick={() => handleUpdateTaskState()}
                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shrink-0 text-xs shadow-md"
              >
                Cập nhật
              </button>
            </div>
          </div>

          {/* Personnel & Time Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-sky-400" /> Nhân Sự Phụ Trách
              </h4>
              <div className="space-y-1">
                <div>
                  <span className="text-slate-400">Người giao:</span>{' '}
                  <span className="font-semibold text-slate-100">{task.assigner}</span>
                </div>
                <div>
                  <span className="text-slate-400">Chủ trì xử lý:</span>{' '}
                  <span className="font-semibold text-emerald-400">{task.leadAssignee}</span>
                </div>
                {task.collaborators && task.collaborators.length > 0 && (
                  <div>
                    <span className="text-slate-400">Phối hợp:</span>{' '}
                    <span className="text-slate-200">{task.collaborators.join(', ')}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-400 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Khung Thời Gian
              </h4>
              <div className="space-y-1 font-mono">
                <div>
                  <span className="text-slate-400 font-sans">Bắt đầu:</span>{' '}
                  <span className="text-slate-200">{formatDateVN(task.startDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-sans">Hạn chót:</span>{' '}
                  <span className={isOverdue ? 'text-red-400 font-bold' : 'text-slate-200'}>
                    {formatDateVN(task.deadline)}
                  </span>
                </div>
                {isOverdue && (
                  <div className="text-red-400 font-bold font-sans text-[11px] flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 animate-bounce" />
                    Đã trễ {Math.abs(daysRemaining)} ngày so với hạn cam kết!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Linked Objects */}
          <div className="space-y-3">
            <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-slate-800 pb-2">
              <FolderOpen className="w-4 h-4 text-emerald-400" /> Liên Kết Dự Án, Văn Bản & Hồ Sơ
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {task.projectName ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                  <FolderOpen className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Dự án RPBM:</div>
                    <div className="font-semibold text-sky-300">{task.projectName}</div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-slate-500 italic">
                  Chưa liên kết dự án.
                </div>
              )}

              {task.docCode ? (
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase">Văn bản liên quan:</div>
                    <div className="font-semibold text-amber-300">
                      {task.docCode} - {task.docTitle}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-slate-950/40 border border-slate-800/40 rounded-xl text-slate-500 italic">
                  Chưa liên kết văn bản.
                </div>
              )}
            </div>

            {task.driveUrl && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-teal-400" />
                  <span className="text-slate-300">Thư mục hồ sơ đính kèm Google Drive:</span>
                </div>
                <a
                  href={task.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1 bg-teal-950 border border-teal-800 text-teal-300 hover:bg-teal-900 rounded-lg font-mono font-semibold flex items-center gap-1 transition-colors"
                >
                  Mở Thư Mục <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Execution Result Form */}
          <div className="space-y-2 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-sky-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-sky-400" /> Báo Cáo Kết Quả Thực Hiện
            </h4>
            <textarea
              value={executionResult}
              onChange={(e) => setExecutionResult(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Nhập kết quả xử lý, diện tích dò tìm, vật nổ phát hiện được..."
            />
          </div>

          {/* Approval Opinion Form */}
          <div className="space-y-2 p-4 bg-slate-950 border border-slate-800 rounded-xl">
            <h4 className="font-bold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-400" /> Ý Kiến Phê Duyệt Của Chỉ Huy / Người Giao
            </h4>
            <textarea
              value={approvalOpinion}
              onChange={(e) => setApprovalOpinion(e.target.value)}
              rows={3}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nhập ý kiến chỉ đạo, nhận xét phê duyệt..."
            />
            {task.approvedBy && (
              <div className="text-[10px] text-slate-400 pt-1">
                Đã phê duyệt bởi: <span className="text-slate-200 font-semibold">{task.approvedBy}</span> ngày{' '}
                <span className="font-mono">{task.approvalDate}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-[10px] text-slate-500">
              Người tạo: {task.createdBy} ({task.createdAt})
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={() => handleUpdateTaskState()}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <Check className="w-4 h-4" /> Lưu Kết Quả & Phê Duyệt
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
