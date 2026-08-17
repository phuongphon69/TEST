import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  Clock,
  UserPlus,
  Send,
  Paperclip,
  FileText,
  AlertCircle,
  Bell,
  ArrowRight,
  History,
  MessageSquare
} from 'lucide-react';
import { DocumentRecord, WorkflowStep } from '../../types';
import { formatDateVN } from '../../utils/formatters';

interface WorkflowModalProps {
  doc: DocumentRecord;
  currentUser: { name: string; title: string };
  onClose: () => void;
  onSaveWorkflow: (updatedDoc: DocumentRecord) => void;
}

const WORKFLOW_STEPS = [
  'Tiếp nhận',
  'Phân công',
  'Xử lý',
  'Trình duyệt',
  'Phê duyệt',
  'Hoàn thành',
  'Lưu hồ sơ'
];

export const WorkflowModal: React.FC<WorkflowModalProps> = ({
  doc,
  currentUser,
  onClose,
  onSaveWorkflow
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'action' | 'links'>('timeline');
  const [commentText, setCommentText] = useState('');
  const [assignee, setAssignee] = useState(doc.assignedProcessor || '');
  const [coAssignees, setCoAssignees] = useState<string>(doc.coProcessors ? doc.coProcessors.join(', ') : '');
  const [nextStep, setNextStep] = useState<string>('Xử lý');
  const [reminderNote, setReminderNote] = useState('');
  const [reminderDeadline, setReminderDeadline] = useState(doc.deadline || '');
  const [hasReminderCreated, setHasReminderCreated] = useState(false);

  const history: WorkflowStep[] = doc.workflowHistory || [
    {
      id: 'wf-1',
      stepName: 'Tiếp nhận',
      performedBy: doc.receiver || doc.uploader || 'Văn thư đơn vị',
      role: 'Văn thư',
      timestamp: doc.incomingDate || doc.issueDate,
      comments: 'Đã tiếp nhận văn bản vào sổ công văn.'
    }
  ];

  const handleAddWorkflowStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() && !assignee) return;

    const newStepItem: WorkflowStep = {
      id: `wf-${Date.now()}`,
      stepName: nextStep,
      performedBy: currentUser.name,
      role: currentUser.title,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
      comments: commentText,
      assignedTo: assignee,
      coAssignedTo: coAssignees ? coAssignees.split(',').map(s => s.trim()).filter(Boolean) : []
    };

    const updatedHistory = [...history, newStepItem];
    
    // Map next step to doc status
    let newStatus = doc.status;
    if (nextStep === 'Phân công') newStatus = 'cho_phan_cong';
    if (nextStep === 'Xử lý') newStatus = 'dang_xu_ly';
    if (nextStep === 'Trình duyệt' || nextStep === 'Phê duyệt') newStatus = 'cho_phe_duyet';
    if (nextStep === 'Hoàn thành' || nextStep === 'Lưu hồ sơ') newStatus = 'da_hoan_thanh';

    const updatedDoc: DocumentRecord = {
      ...doc,
      status: newStatus,
      assignedProcessor: assignee || doc.assignedProcessor,
      coProcessors: coAssignees ? coAssignees.split(',').map(s => s.trim()).filter(Boolean) : doc.coProcessors,
      workflowHistory: updatedHistory,
      directiveOpinion: commentText ? `${doc.directiveOpinion ? doc.directiveOpinion + '\n' : ''}[${currentUser.name} - ${newStepItem.timestamp}]: ${commentText}` : doc.directiveOpinion
    };

    onSaveWorkflow(updatedDoc);
    setCommentText('');
    alert(`Đã cập nhật luồng xử lý: "${nextStep}" thành công!`);
  };

  const handleCreateReminder = () => {
    if (!reminderNote || !reminderDeadline) return;
    setHasReminderCreated(true);
    setTimeout(() => {
      alert(`Đã tạo nhắc việc cho cán bộ (${assignee || currentUser.name}): "${reminderNote}" - Hạn chót: ${formatDateVN(reminderDeadline)}`);
    }, 100);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-700/80 bg-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-slate-100">Luồng Xử lý Văn bản & Theo dõi Lịch sử</h3>
              <p className="text-xs text-slate-400">
                Mã / Số: <span className="font-mono text-amber-400">{doc.incomingNumber ? `Đến: ${doc.incomingNumber} - ` : ''}{doc.code}</span> | {doc.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Workflow Diagram Bar */}
        <div className="bg-slate-950 p-4 border-b border-slate-800">
          <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Sơ đồ quy trình xử lý:</div>
          <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
            {WORKFLOW_STEPS.map((step, idx) => {
              const isCurrent = doc.status === 'da_hoan_thanh' ? idx === WORKFLOW_STEPS.length - 1 : idx <= 2;
              return (
                <React.Fragment key={step}>
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap font-medium transition-all ${
                      isCurrent
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/50 shadow-sm shadow-sky-500/20'
                        : 'bg-slate-800/60 text-slate-400 border-slate-700/60'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold">
                      {idx + 1}
                    </span>
                    {step}
                  </div>
                  {idx < WORKFLOW_STEPS.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600 flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 bg-slate-900 px-4">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'timeline'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            Lịch sử xử lý ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('action')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'action'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Chuyển xử lý / Ghi ý kiến / Giao phối hợp
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'links'
                ? 'border-sky-500 text-sky-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            Tạo Nhắc Việc / Lịch Hạn
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="relative border-l-2 border-slate-700 ml-4 space-y-6 py-2">
                {history.map((step, index) => (
                  <div key={step.id || index} className="relative pl-6">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-sky-500 border-2 border-slate-900 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                    </div>

                    <div className="bg-slate-800/70 border border-slate-700/80 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span className="font-semibold text-sky-300 text-sm">
                          {step.stepName}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {step.timestamp}
                        </span>
                      </div>

                      <div className="text-sm text-slate-200 font-medium">
                        Thực hiện: <span className="text-amber-300">{step.performedBy}</span> ({step.role})
                      </div>

                      {step.assignedTo && (
                        <div className="text-xs text-sky-300 bg-sky-950/40 border border-sky-800/50 rounded-lg p-2">
                          🎯 Giao cho xử lý chính: <strong>{step.assignedTo}</strong>
                          {step.coAssignedTo && step.coAssignedTo.length > 0 && (
                            <span className="block mt-0.5 text-slate-300">
                              🤝 Phối hợp: {step.coAssignedTo.join(', ')}
                            </span>
                          )}
                        </div>
                      )}

                      {step.comments && (
                        <div className="text-xs text-slate-300 bg-slate-900/80 rounded-lg p-3 border border-slate-800 italic">
                          "{step.comments}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'action' && (
            <form onSubmit={handleAddWorkflowStep} className="space-y-4 bg-slate-800/60 p-5 rounded-xl border border-slate-700/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Bước quy trình kế tiếp <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={nextStep}
                    onChange={e => setNextStep(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    {WORKFLOW_STEPS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Người được giao xử lý chính
                  </label>
                  <input
                    type="text"
                    value={assignee}
                    onChange={e => setAssignee(e.target.value)}
                    placeholder="VD: Thượng tá Nguyễn Văn Hùng"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Đơn vị / Cán bộ phối hợp xử lý (Phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={coAssignees}
                  onChange={e => setCoAssignees(e.target.value)}
                  placeholder="VD: Ban Kỹ thuật, Ban Tài chính, Trợ lý Giám sát"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Ý kiến chỉ đạo / Ghi chú trực tiếp
                </label>
                <textarea
                  rows={3}
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Nhập ý kiến chỉ đạo, yêu cầu nội dung xử lý..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-sm font-medium flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  Cập nhật Luồng Xử Lý
                </button>
              </div>
            </form>
          )}

          {activeTab === 'links' && (
            <div className="space-y-4 bg-slate-800/60 p-5 rounded-xl border border-slate-700/80">
              <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                <Bell className="w-4 h-4" />
                Tạo Nhắc Việc Tự Động & Hạn Xử Lý
              </div>

              <p className="text-xs text-slate-400">
                Tạo nhắc việc gửi cảnh báo tự động cho cán bộ phụ trách khi gần đến hạn hoàn thành xử lý văn bản.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Hạn xử lý văn bản</label>
                  <input
                    type="date"
                    value={reminderDeadline}
                    onChange={e => setReminderDeadline(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Nội dung nhắc nhở</label>
                  <input
                    type="text"
                    value={reminderNote}
                    onChange={e => setReminderNote(e.target.value)}
                    placeholder="VD: Kiểm tra lại hồ sơ thẩm định trước khi trình chỉ huy duyệt"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                {hasReminderCreated ? (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> Đã ghi nhận nhắc việc tự động vào hệ thống!
                  </span>
                ) : (
                  <span className="text-xs text-slate-400">Cảnh báo sẽ xuất hiện trên trang Tổng quan khi còn 5 ngày.</span>
                )}

                <button
                  onClick={handleCreateReminder}
                  disabled={!reminderNote}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
                >
                  <Bell className="w-4 h-4" />
                  Kích Hoạt Nhắc Việc
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
