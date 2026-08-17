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
  Paperclip,
  Check,
  Building
} from 'lucide-react';
import { TaskItem, TaskStatus, TaskPriority, User, Project, DocumentRecord } from '../../types';
import { formatDateForInput } from '../../utils/formatters';

interface TaskFormModalProps {
  initialTask?: TaskItem | null;
  currentUser: User;
  projects: Project[];
  documents: DocumentRecord[];
  allTasks: TaskItem[];
  userList: User[];
  onClose: () => void;
  onSave: (task: TaskItem) => void;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  initialTask,
  currentUser,
  projects,
  documents,
  allTasks,
  userList,
  onClose,
  onSave
}) => {
  const isEditing = !!initialTask;

  const [code, setCode] = useState(initialTask?.code || `CV-2026-${String(allTasks.length + 1).padStart(3, '0')}`);
  const [title, setTitle] = useState(initialTask?.title || '');
  const [description, setDescription] = useState(initialTask?.description || '');
  const [assigner, setAssigner] = useState(initialTask?.assigner || currentUser.name);
  const [leadAssignee, setLeadAssignee] = useState(initialTask?.leadAssignee || userList[0]?.name || 'Lê Hoàng Nam');
  const [collaboratorsInput, setCollaboratorsInput] = useState(
    initialTask?.collaborators ? initialTask.collaborators.join(', ') : ''
  );
  const [startDate, setStartDate] = useState(
    initialTask?.startDate ? formatDateForInput(initialTask.startDate) : formatDateForInput(new Date())
  );
  const [deadline, setDeadline] = useState(
    initialTask?.deadline
      ? formatDateForInput(initialTask.deadline)
      : formatDateForInput(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))
  );
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority || 'thuong');
  const [progressPercent, setProgressPercent] = useState<number>(initialTask?.progressPercent ?? 0);
  const [status, setStatus] = useState<TaskStatus>(initialTask?.status || 'chua_thuc_hien');

  const [relatedTaskId, setRelatedTaskId] = useState(initialTask?.relatedTaskId || '');
  const [projectId, setProjectId] = useState(initialTask?.projectId || '');
  const [docId, setDocId] = useState(initialTask?.docId || '');
  const [driveUrl, setDriveUrl] = useState(initialTask?.driveUrl || '');

  const [executionResult, setExecutionResult] = useState(initialTask?.executionResult || '');
  const [approvalOpinion, setApprovalOpinion] = useState(initialTask?.approvalOpinion || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      alert('Vui lòng nhập Mã công việc!');
      return;
    }
    if (!title.trim()) {
      alert('Vui lòng nhập Tên công việc!');
      return;
    }

    const selectedProj = projects.find((p) => p.id === projectId);
    const selectedDoc = documents.find((d) => d.id === docId);
    const selectedTask = allTasks.find((t) => t.id === relatedTaskId);

    const collaborators = collaboratorsInput
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const taskToSave: TaskItem = {
      id: initialTask?.id || `task-${Date.now()}`,
      code: code.trim(),
      title: title.trim(),
      description: description.trim(),
      assigner,
      leadAssignee,
      collaborators,
      startDate,
      deadline,
      priority,
      progressPercent,
      status,

      relatedTaskId: selectedTask?.id,
      relatedTaskCode: selectedTask?.code,
      relatedTaskTitle: selectedTask?.title,

      projectId: selectedProj?.id,
      projectName: selectedProj?.name,

      docId: selectedDoc?.id,
      docCode: selectedDoc?.code || selectedDoc?.incomingNumber,
      docTitle: selectedDoc?.title,

      driveUrl: driveUrl.trim(),
      executionResult: executionResult.trim(),
      approvalOpinion: approvalOpinion.trim(),
      approvedBy: approvalOpinion.trim() ? currentUser.name : initialTask?.approvedBy,
      approvalDate: approvalOpinion.trim() ? formatDateForInput(new Date()) : initialTask?.approvalDate,

      dataStatus: initialTask?.dataStatus || 'hoat_dong',
      createdBy: initialTask?.createdBy || currentUser.name,
      createdAt: initialTask?.createdAt || formatDateForInput(new Date())
    };

    onSave(taskToSave);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-5 bg-slate-950 border-b border-slate-800 sticky top-0 z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-950 border border-emerald-800 text-emerald-400 rounded-xl">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {isEditing ? `Cập Nhật Công Việc: ${code}` : 'Thêm Công Việc Mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Nhập đầy đủ thông tin giao việc, người chủ trì, dự án & văn bản liên quan.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 flex-1">
          {/* Section 1: Thông tin cơ bản */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <Sparkles className="w-4 h-4" /> 1. Thông Tin Cơ Bản Công Việc
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mã Công Việc <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-bold text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. CV-2026-001"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mức Độ Ưu Tiên
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="thuong">Thường</option>
                  <option value="khan">Khẩn</option>
                  <option value="thuong_khan">Thượng khẩn</option>
                  <option value="hoa_toc">Hỏa tốc (Nhiệm vụ cấp bách)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trạng Thái Hiện Tại
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as TaskStatus)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
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

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Tên Công Việc <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Nhập tên công việc chi tiết..."
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Nội Dung / Yêu Cầu Nhiệm Vụ
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="Mô tả nội dung chi tiết công việc cần thực hiện..."
              />
            </div>
          </div>

          {/* Section 2: Phân công & Thời gian */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <UserIcon className="w-4 h-4" /> 2. Phân Công Nhân Sự & Thời Gian
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Người Giao Nhiệm Vụ
                </label>
                <input
                  type="text"
                  value={assigner}
                  onChange={(e) => setAssigner(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Họ tên người giao"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Người Chủ Trì Xử Lý
                </label>
                <select
                  value={leadAssignee}
                  onChange={(e) => setLeadAssignee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {userList.map((u) => (
                    <option key={u.id} value={u.name}>
                      {u.name} ({u.roleLabel.split('/')[0]})
                    </option>
                  ))}
                  <option value="Lê Hoàng Nam">Lê Hoàng Nam (Kỹ thuật viên)</option>
                  <option value="Phạm Văn Long">Phạm Văn Long (Kiểm định viên)</option>
                  <option value="Trần Văn Tuấn">Trần Văn Tuấn (Kỹ sư dã chiến)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Người / Đơn Vị Phối Hợp
                </label>
                <input
                  type="text"
                  value={collaboratorsInput}
                  onChange={(e) => setCollaboratorsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Nhập tên cách nhau bằng dấu phẩy (e.g. Nam, Tuấn, Đội 1)"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ngày Bắt Đầu
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Hạn Hoàn Thành (Hạn chót)
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tỷ Lệ Hoàn Thành ({progressPercent}%)
                </label>
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
                  <span className="font-mono font-bold text-xs text-emerald-400 w-10 text-right">
                    {progressPercent}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Liên kết Hồ sơ & Dự án */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <FolderOpen className="w-4 h-4" /> 3. Liên Kết Dự Án, Văn Bản & Hồ Sơ
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Dự Án RPBM Liên Quan
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Không chọn / Công việc chung --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Văn Bản Chỉ Đạo / Liên Quan
                </label>
                <select
                  value={docId}
                  onChange={(e) => setDocId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Không chọn --</option>
                  {documents.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code || d.incomingNumber} - {d.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Công Việc Tiền Đề / Liên Quan
                </label>
                <select
                  value={relatedTaskId}
                  onChange={(e) => setRelatedTaskId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Không chọn --</option>
                  {allTasks
                    .filter((t) => t.id !== initialTask?.id)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.code} - {t.title}
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Link Thư Mục Google Drive Hồ Sơ Đính Kèm
              </label>
              <input
                type="url"
                value={driveUrl}
                onChange={(e) => setDriveUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-teal-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="https://drive.google.com/drive/folders/..."
              />
            </div>
          </div>

          {/* Section 4: Kết quả thực hiện & Ý kiến phê duyệt */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2 border-b border-slate-800 pb-2">
              <FileText className="w-4 h-4" /> 4. Báo Cáo Kết Quả Thực Hiện & Phê Duyệt
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Báo Cáo Kết Quả Thực Hiện (Đơn vị chủ trì nhập)
                </label>
                <textarea
                  value={executionResult}
                  onChange={(e) => setExecutionResult(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ghi nhận khối lượng đã thực hiện, kết quả phát hiện vật nổ..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ý Kiến Phê Duyệt / Chỉ Đạo (Người giao / Chỉ huy trưởng)
                </label>
                <textarea
                  value={approvalOpinion}
                  onChange={(e) => setApprovalOpinion(e.target.value)}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ý kiến nhận xét, kết luận phê duyệt..."
                />
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
            >
              <Check className="w-4 h-4" />
              {isEditing ? 'Lưu Cập Nhật Công Việc' : 'Tạo Công Việc Mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
