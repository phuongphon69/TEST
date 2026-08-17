import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Check,
  Filter,
  Calendar,
  Building,
  FolderOpen,
  Eye,
  Edit2,
  Trash2,
  X,
  Download,
  Printer,
  ShieldAlert,
  UserCheck,
  Send,
  FileCheck,
  ClipboardList,
  Sparkles,
  FileSpreadsheet,
  History,
  Layers
} from 'lucide-react';
import {
  DocumentRecord,
  DocumentType,
  DocumentStatus,
  AppraisalNotice,
  QuarterlyReport
} from '../types';
import {
  getDocuments,
  saveDocuments,
  getProjects,
  getCurrentUser,
  getAppraisalNotices,
  saveAppraisalNotices,
  getQuarterlyReports,
  saveQuarterlyReports,
  getAndIncrementOutgoingDocNumber,
  formatOutgoingDocumentSymbol
} from '../utils/storage';
import { formatDateVN, formatDateForInput, DOCUMENT_STATUS_MAP } from '../utils/formatters';
import { IncomingDocsTab } from './documents/IncomingDocsTab';
import { OutgoingDocsTab } from './documents/OutgoingDocsTab';
import { InternalDocsTab } from './documents/InternalDocsTab';
import { AppraisalNoticesTab } from './documents/AppraisalNoticesTab';
import { QuarterlyReportsTab } from './documents/QuarterlyReportsTab';
import { WorkflowModal } from './documents/WorkflowModal';

type SubSectionTab = 'vanban_den' | 'vanban_di' | 'thong_bao_tham_dinh' | 'bao_cao_quy';

export const DocumentManager: React.FC = () => {
  const [documents, setDocsState] = useState<DocumentRecord[]>(getDocuments());
  const [appraisalNotices, setAppraisalsState] = useState<AppraisalNotice[]>(getAppraisalNotices());
  const [quarterlyReports, setReportsState] = useState<QuarterlyReport[]>(getQuarterlyReports());

  const projects = getProjects();
  const currentUser = getCurrentUser();

  const [activeTab, setActiveTab] = useState<SubSectionTab>('vanban_den');
  const [workflowDoc, setWorkflowDoc] = useState<DocumentRecord | null>(null);

  // General Document Save handler
  const handleSaveDoc = (docToSave: DocumentRecord) => {
    const existingIndex = documents.findIndex(d => d.id === docToSave.id);
    let updated: DocumentRecord[];
    if (existingIndex >= 0) {
      updated = [...documents];
      updated[existingIndex] = {
        ...docToSave,
        updatedBy: currentUser.name,
        updatedAt: formatDateVN(new Date())
      };
    } else {
      updated = [
        {
          ...docToSave,
          createdBy: currentUser.name,
          createdAt: formatDateVN(new Date()),
          updatedBy: currentUser.name,
          updatedAt: formatDateVN(new Date()),
          dataStatus: 'hoat_dong'
        },
        ...documents
      ];
    }
    saveDocuments(updated, `Lưu thông tin văn bản: ${docToSave.code}`);
    setDocsState(updated);
  };

  const handleDeleteDoc = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa/chuyển văn bản này vào Thùng rác?')) {
      const updated = documents.map(d =>
        d.id === id
          ? {
              ...d,
              dataStatus: 'da_xoa' as const,
              updatedBy: currentUser.name,
              updatedAt: formatDateVN(new Date())
            }
          : d
      );
      saveDocuments(updated, 'Chuyển văn bản vào Thùng rác');
      setDocsState(updated);
    }
  };

  // Reply document creation helper
  const handleCreateReplyDoc = (sourceDoc: DocumentRecord) => {
    const nextNum = getAndIncrementOutgoingDocNumber();
    const replyCategory = 'Công văn';
    const replyDocSymbol = formatOutgoingDocumentSymbol(nextNum.display, replyCategory);

    const replyDoc: DocumentRecord = {
      id: `doc-out-reply-${Date.now()}`,
      type: 'vanban_di',
      code: replyDocSymbol,
      title: `V/v phúc đáp văn bản số ${sourceDoc.incomingNumberDisplay || sourceDoc.code} - ${sourceDoc.title}`,
      category: replyCategory,
      outgoingNumberSeq: nextNum.num,
      outgoingNumberDisplay: nextNum.display,
      outgoingNumber: nextNum.display,
      outgoingCodeSymbol: replyDocSymbol,
      issueDate: formatDateForInput(new Date()),
      issuer: 'Tiểu đoàn 93/Binh chủng Công binh',
      draftAuthor: currentUser.name,
      signerName: 'Thượng tá Nguyễn Văn Hùng',
      signerTitle: 'Chỉ huy trưởng',
      signer: 'Thượng tá Nguyễn Văn Hùng',
      recipientLocation: sourceDoc.issuer,
      securityLevel: sourceDoc.securityLevel || 'thuong',
      driveUrl: 'https://drive.google.com/drive/folders/sample-outgoing',
      notes: `Văn bản trả lời cho VB đến số ${sourceDoc.incomingNumberDisplay || sourceDoc.code}`,
      status: 'da_hoan_thanh',
      uploader: currentUser.name,
      uploadDate: formatDateForInput(new Date())
    };

    // Link source doc
    const updatedSourceDoc: DocumentRecord = {
      ...sourceDoc,
      replyDocCode: replyDocSymbol,
      status: 'da_hoan_thanh'
    };

    handleSaveDoc(replyDoc);
    handleSaveDoc(updatedSourceDoc);
    setActiveTab('vanban_di');
    alert(`Đã tự động khởi tạo Văn bản đi phúc đáp (${replyDocSymbol}) liên kết với VB đến ${sourceDoc.incomingNumberDisplay || sourceDoc.code}!`);
  };

  // Appraisal Notice save
  const handleSaveAppraisalNotice = (notice: AppraisalNotice) => {
    const existingIndex = appraisalNotices.findIndex(a => a.id === notice.id);
    let updated: AppraisalNotice[];
    if (existingIndex >= 0) {
      updated = [...appraisalNotices];
      updated[existingIndex] = notice;
    } else {
      updated = [notice, ...appraisalNotices];
    }
    saveAppraisalNotices(updated);
    setAppraisalsState(updated);
  };

  const handleDeleteAppraisalNotice = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa Thông báo thẩm định này?')) {
      const updated = appraisalNotices.filter(a => a.id !== id);
      saveAppraisalNotices(updated);
      setAppraisalsState(updated);
    }
  };

  // Confirm project data update from active notice
  const handleConfirmProjectDataUpdate = (notice: AppraisalNotice) => {
    const updatedNotices = appraisalNotices.map(n => {
      if (n.projectId === notice.projectId) {
        return { ...n, isCurrentActiveNotice: n.id === notice.id };
      }
      return n;
    });
    saveAppraisalNotices(updatedNotices);
    setAppraisalsState(updatedNotices);
  };

  // Quarterly Report Save
  const handleSaveQuarterlyReport = (report: QuarterlyReport) => {
    const existingIndex = quarterlyReports.findIndex(r => r.id === report.id);
    let updated: QuarterlyReport[];
    if (existingIndex >= 0) {
      updated = [...quarterlyReports];
      updated[existingIndex] = report;
    } else {
      updated = [report, ...quarterlyReports];
    }
    saveQuarterlyReports(updated);
    setReportsState(updated);
  };

  const handleDeleteQuarterlyReport = (id: string) => {
    if (confirm('Bạn có chắc muốn xóa báo cáo quý này?')) {
      const updated = quarterlyReports.filter(r => r.id !== id);
      saveQuarterlyReports(updated);
      setReportsState(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Main Section Banner */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-400" />
            Phân Hệ Quản Lý Văn Bản & Báo Cáo Nội Bộ (Mục 5)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý văn bản đến/đi, văn bản nội bộ, thông báo thẩm định thuộc dự án & lập phụ lục báo cáo quý tự động.
          </p>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('vanban_den')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'vanban_den'
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            5.1. Văn Bản Đến
          </button>

          <button
            onClick={() => setActiveTab('vanban_di')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'vanban_di'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Send className="w-4 h-4" />
            5.2. Văn Bản Đi
          </button>

          <button
            onClick={() => setActiveTab('thong_bao_tham_dinh')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'thong_bao_tham_dinh'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            5.5. TB Thẩm Định
          </button>

          <button
            onClick={() => setActiveTab('bao_cao_quy')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 ${
              activeTab === 'bao_cao_quy'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            5.6. Báo Cáo Quý
          </button>
        </div>
      </div>

      {/* Render Active Sub-section */}
      {activeTab === 'vanban_den' && (
        <IncomingDocsTab
          documents={documents}
          currentUser={currentUser}
          onSaveDoc={handleSaveDoc}
          onDeleteDoc={handleDeleteDoc}
          onOpenWorkflow={doc => setWorkflowDoc(doc)}
          onCreateReplyDoc={handleCreateReplyDoc}
        />
      )}

      {activeTab === 'vanban_di' && (
        <OutgoingDocsTab
          documents={documents}
          currentUser={currentUser}
          onSaveDoc={handleSaveDoc}
          onDeleteDoc={handleDeleteDoc}
        />
      )}

      {activeTab === 'thong_bao_tham_dinh' && (
        <AppraisalNoticesTab
          appraisalNotices={appraisalNotices}
          projects={projects}
          documents={documents}
          currentUser={currentUser}
          onSaveNotice={handleSaveAppraisalNotice}
          onDeleteNotice={handleDeleteAppraisalNotice}
          onConfirmProjectDataUpdate={handleConfirmProjectDataUpdate}
        />
      )}

      {activeTab === 'bao_cao_quy' && (
        <QuarterlyReportsTab
          reports={quarterlyReports}
          projects={projects}
          appraisalNotices={appraisalNotices}
          currentUser={currentUser}
          onSaveReport={handleSaveQuarterlyReport}
          onDeleteReport={handleDeleteQuarterlyReport}
        />
      )}

      {/* Workflow Processing Modal */}
      {workflowDoc && (
        <WorkflowModal
          document={workflowDoc}
          currentUser={currentUser}
          onClose={() => setWorkflowDoc(null)}
          onSaveDocument={handleSaveDoc}
        />
      )}
    </div>
  );
};
