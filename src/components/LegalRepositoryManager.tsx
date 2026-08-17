import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Plus,
  Upload,
  Bot,
  Scale,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ExternalLink,
  Edit,
  Trash2,
  FileCheck,
  RefreshCw,
  Sparkles,
  BookOpen,
  ArrowRight,
  ShieldAlert,
  Download,
  Tag,
  Eye,
  Layers,
  HelpCircle,
  ListOrdered,
  FileSearch,
  Check,
  Globe,
  Settings,
  Key,
  Lock,
  Shield,
  UserCheck
} from 'lucide-react';
import { LegalDocument, LegalValidityStatus } from '../types';
import {
  getLegalDocs,
  saveLegalDocs,
  addLegalDoc,
  updateLegalDoc,
  deleteLegalDoc,
  searchLegalDocs,
  parseAndExtractFileContent,
  LegalSearchParams
} from '../utils/legalStorage';
import { getProjects, getPersonnel, getEquipment, addAuditLog } from '../utils/storage';
import {
  NotebookIntegrationMode,
  NotebookConfig,
  getNotebookConfig,
  saveNotebookConfig,
  getEffectiveNotebookMode,
  saveConnectedGoogleAccount
} from '../utils/notebookConfig';

// 12 Legal Domain Categories
export const LEGAL_FIELDS_MAP: { id: string; label: string; icon: string }[] = [
  { id: 'quan_ly_du_an', label: 'Quản lý dự án', icon: '📊' },
  { id: 'dau_tu_xay_dung', label: 'Đầu tư xây dựng', icon: '🏗️' },
  { id: 'dau_thau', label: 'Đấu thầu', icon: '📜' },
  { id: 'hop_dong', label: 'Hợp đồng', icon: '✍️' },
  { id: 'quan_ly_chat_luong', label: 'Quản lý chất lượng', icon: '🛡️' },
  { id: 'an_toan_lao_dong', label: 'An toàn lao động', icon: '👷' },
  { id: 'ra_pha_bom_min', label: 'Rà phá bom mìn, vật nổ', icon: '💣' },
  { id: 'quan_ly_thiet_bi', label: 'Quản lý trang thiết bị', icon: '⚡' },
  { id: 'quan_ly_tai_san', label: 'Quản lý tài sản', icon: '🏛️' },
  { id: 'luu_tru_ho_so', label: 'Lưu trữ hồ sơ', icon: '📁' },
  { id: 'thanh_toan_quyet_toan', label: 'Thanh toán và quyết toán', icon: '💰' },
  { id: 'tieu_chuan_quy_chuan', label: 'Tiêu chuẩn, quy chuẩn & HĐKT', icon: '📘' }
];

export function LegalRepositoryManager() {
  const [activeTab, setActiveTab] = useState<'library' | 'ai_rag' | 'compare' | 'dossier'>('library');
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [filteredDocs, setFilteredDocs] = useState<LegalDocument[]>([]);

  // NotebookLM & Gemini Notebook Config State
  const [notebookConfig, setNotebookConfig] = useState<NotebookConfig>(getNotebookConfig());
  const [isNotebookModalOpen, setIsNotebookModalOpen] = useState(false);
  const [showGoogleLoginModal, setShowGoogleLoginModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');
  const [testEnterpriseLoading, setTestEnterpriseLoading] = useState(false);
  const [testEnterpriseMessage, setTestEnterpriseMessage] = useState<string | null>(null);

  // Search Filters State
  const [searchParams, setSearchParams] = useState<LegalSearchParams>({
    docNumberSymbol: '',
    title: '',
    content: '',
    issuingAgency: 'all',
    field: 'all',
    validityStatus: 'all',
    issuedDateStart: '',
    issuedDateEnd: '',
    keyword: ''
  });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<LegalDocument | null>(null);
  const [selectedDocDetail, setSelectedDocDetail] = useState<LegalDocument | null>(null);

  // Upload File Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [extractedTextPreview, setExtractedTextPreview] = useState<string>('');
  const [uploadCategory, setUploadCategory] = useState<string>('Rà phá bom mìn, vật nổ');

  // AI Chat & RAG State
  const [aiPrompt, setAiPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'ai'; content: string; citations?: string[]; timestamp: string }>>([
    {
      role: 'ai',
      content: `Xin chào Cán bộ Nghiệp vụ! Tôi là **Trợ lý Tra cứu Pháp lý Rà phá Bom mìn & Dự án RPBM**.
      
Tôi có thể hỗ trợ quý cán bộ:
- Tra cứu điều khoản quy chuẩn **QCVN 01:2022/BQP**, **Nghị định 18/2019/NĐ-CP**, **Luật Đấu thầu 2023**...
- Kiểm tra các mốc thời gian, điều kiện khởi công, quy trình nghiệm thu bàn giao đất sạch.
- Trích xuất trách nhiệm của Chủ đầu tư, Đơn vị thi công, Giám sát.

*Mọi câu trả lời của tôi đều được trích dẫn nguồn cụ thể từ kho dữ liệu.*`,
      citations: ['QCVN 01:2022/BQP', 'Nghị định 18/2019/NĐ-CP'],
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Compare Docs State
  const [docAId, setDocAId] = useState<string>('');
  const [docBId, setDocBId] = useState<string>('');
  const [compareResult, setCompareResult] = useState<string>('');
  const [isComparing, setIsComparing] = useState(false);

  // Dossier Generator State
  const [selectedOperation, setSelectedOperation] = useState<string>('Nghiệm thu và bàn giao đất sạch bom mìn');
  const [dossierResult, setDossierResult] = useState<string>('');
  const [isGeneratingDossier, setIsGeneratingDossier] = useState(false);

  // Form Data for Add/Edit Legal Doc
  const [formData, setFormData] = useState<Partial<LegalDocument>>({
    code: '',
    docNumberSymbol: '',
    title: '',
    issuingAgency: 'Bộ Quốc phòng',
    docType: 'Thông tư',
    issuedDate: new Date().toISOString().slice(0, 10),
    effectiveDate: new Date().toISOString().slice(0, 10),
    expiryDate: '',
    fields: ['Rà phá bom mìn, vật nổ'],
    category: 'Rà phá bom mìn, vật nổ',
    keywords: [],
    replacingDoc: '',
    replacedDoc: '',
    amendingDoc: '',
    validityStatus: 'con_hieu_luc',
    pdfFileUrl: '',
    pdfFileName: '',
    sourceUrl: '',
    driveUrl: '',
    notes: '',
    summary: '',
    keyPoints: [''],
    fullContent: ''
  });

  // Load initial data
  useEffect(() => {
    refreshDocs();
  }, []);

  const refreshDocs = () => {
    const data = getLegalDocs();
    setDocuments(data);
    setFilteredDocs(data);
    if (data.length >= 2) {
      setDocAId(data[0].id);
      setDocBId(data[1].id);
    }
  };

  // NotebookLM & Gemini Notebook Action Handlers
  const effectiveModeInfo = getEffectiveNotebookMode(notebookConfig);

  const handleOpenNotebookLM = () => {
    const mode = effectiveModeInfo.effectiveMode;
    if (mode === 'DISABLED') {
      alert('Tích hợp NotebookLM hiện đang bị tắt bởi Quản trị viên.');
      return;
    }

    const url = notebookConfig.personalNotebookUrl || 'https://notebooklm.google.com/';
    addAuditLog(
      'Kho Pháp lý & AI Tra cứu',
      `Mở liên kết NotebookLM bằng tài khoản Google: ${notebookConfig.connectedGoogleAccount?.email || 'Chưa liên kết'}`
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleConnectGoogleAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!googleEmailInput) {
      alert('Vui lòng nhập Email Google!');
      return;
    }
    const updated = saveConnectedGoogleAccount({
      email: googleEmailInput,
      name: googleNameInput || googleEmailInput.split('@')[0]
    });
    setNotebookConfig(updated);
    setShowGoogleLoginModal(false);
    addAuditLog(
      'Kho Pháp lý & AI Tra cứu',
      `Liên kết tài khoản Google thành công: [${googleNameInput || googleEmailInput}] (${googleEmailInput})`
    );
  };

  const handleDisconnectGoogleAccount = () => {
    const updated = saveConnectedGoogleAccount(null);
    setNotebookConfig(updated);
    addAuditLog('Kho Pháp lý & AI Tra cứu', 'Hủy liên kết tài khoản Google');
  };

  const handleUpdateNotebookSettings = (partial: Partial<NotebookConfig>) => {
    const updated = saveNotebookConfig(partial);
    setNotebookConfig(updated);

    // Sync with server API
    fetch('/api/notebook/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(partial)
    }).catch(err => console.error('Failed to sync notebook config to server:', err));

    addAuditLog('Kho Pháp lý & AI Tra cứu', `Cập nhật chế độ Notebook: ${partial.mode || notebookConfig.mode}`);
  };

  const handleTestEnterpriseApi = async () => {
    setTestEnterpriseLoading(true);
    setTestEnterpriseMessage(null);
    try {
      const res = await fetch('/api/notebook/config');
      const data = await res.json();
      if (data.systemEnvironment?.hasGeminiApiKey && data.config?.isEnterpriseReady) {
        setTestEnterpriseMessage('✅ Kết nối Google Cloud Enterprise API sẵn sàng. Đã xác thực khóa Gemini API và Dự án GCP.');
        handleUpdateNotebookSettings({ isEnterpriseReady: true });
      } else if (data.systemEnvironment?.hasGeminiApiKey) {
        setTestEnterpriseMessage('⚠️ Đã có GEMINI_API_KEY nhưng chưa khai báo Mã dự án GCP (GEMINI_NOTEBOOK_ENTERPRISE_PROJECT_ID). Tự động chuyển về PERSONAL_NOTEBOOK_LINK & RAG Nội bộ.');
        handleUpdateNotebookSettings({ isEnterpriseReady: false });
      } else {
        setTestEnterpriseMessage('❌ Chưa cấu hình GEMINI_API_KEY trên máy chủ backend.');
        handleUpdateNotebookSettings({ isEnterpriseReady: false });
      }
    } catch (err: any) {
      setTestEnterpriseMessage(`❌ Lỗi kiểm tra máy chủ: ${err.message || 'Không thể kết nối'}`);
    } finally {
      setTestEnterpriseLoading(false);
    }
  };

  // Filter effect
  useEffect(() => {
    const results = searchLegalDocs(documents, searchParams);
    setFilteredDocs(results);
  }, [searchParams, documents]);

  const handleSearchChange = (field: keyof LegalSearchParams, value: string) => {
    setSearchParams(prev => ({ ...prev, [field]: value }));
  };

  const resetFilters = () => {
    setSearchParams({
      docNumberSymbol: '',
      title: '',
      content: '',
      issuingAgency: 'all',
      field: 'all',
      validityStatus: 'all',
      issuedDateStart: '',
      issuedDateEnd: '',
      keyword: ''
    });
  };

  // Open modal for Create or Edit
  const handleOpenModal = (doc?: LegalDocument) => {
    if (doc) {
      setEditingDoc(doc);
      setFormData({
        code: doc.code,
        docNumberSymbol: doc.docNumberSymbol || doc.code,
        title: doc.title,
        issuingAgency: doc.issuingAgency || 'Bộ Quốc phòng',
        docType: doc.docType || 'Thông tư',
        issuedDate: doc.issuedDate || '',
        effectiveDate: doc.effectiveDate || '',
        expiryDate: doc.expiryDate || '',
        fields: doc.fields || [doc.category || 'Rà phá bom mìn, vật nổ'],
        category: doc.category || 'Rà phá bom mìn, vật nổ',
        keywords: doc.keywords || [],
        replacingDoc: doc.replacingDoc || '',
        replacedDoc: doc.replacedDoc || '',
        amendingDoc: doc.amendingDoc || '',
        validityStatus: doc.validityStatus || 'con_hieu_luc',
        pdfFileUrl: doc.pdfFileUrl || '',
        pdfFileName: doc.pdfFileName || '',
        sourceUrl: doc.sourceUrl || '',
        driveUrl: doc.driveUrl || '',
        notes: doc.notes || '',
        summary: doc.summary || '',
        keyPoints: doc.keyPoints && doc.keyPoints.length > 0 ? doc.keyPoints : [''],
        fullContent: doc.fullContent || ''
      });
    } else {
      setEditingDoc(null);
      setFormData({
        code: `VBPL-${Date.now().toString().slice(-4)}`,
        docNumberSymbol: '',
        title: '',
        issuingAgency: 'Bộ Quốc phòng',
        docType: 'Thông tư',
        issuedDate: new Date().toISOString().slice(0, 10),
        effectiveDate: new Date().toISOString().slice(0, 10),
        expiryDate: '',
        fields: ['Rà phá bom mìn, vật nổ'],
        category: 'Rà phá bom mìn, vật nổ',
        keywords: [],
        replacingDoc: '',
        replacedDoc: '',
        amendingDoc: '',
        validityStatus: 'con_hieu_luc',
        pdfFileUrl: '',
        pdfFileName: '',
        sourceUrl: '',
        driveUrl: '',
        notes: '',
        summary: '',
        keyPoints: [''],
        fullContent: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.docNumberSymbol) {
      alert('Vui lòng nhập Tên văn bản và Số/Ký hiệu!');
      return;
    }

    if (editingDoc) {
      updateLegalDoc({
        ...editingDoc,
        ...formData,
        docNumberSymbol: formData.docNumberSymbol!,
        title: formData.title!,
        summary: formData.summary || formData.title!,
        keyPoints: formData.keyPoints?.filter(k => k.trim() !== '')
      } as LegalDocument);
    } else {
      addLegalDoc({
        ...formData,
        summary: formData.summary || formData.title,
        keyPoints: formData.keyPoints?.filter(k => k.trim() !== '')
      });
    }

    setIsModalOpen(false);
    refreshDocs();
  };

  const handleDelete = (doc: LegalDocument) => {
    if (confirm(`Bạn có chắc chắn muốn xóa văn bản: "${doc.docNumberSymbol} - ${doc.title}"?`)) {
      deleteLegalDoc(doc.id);
      refreshDocs();
    }
  };

  // Handle PDF/Text Upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingFile(file);
      try {
        const extracted = await parseAndExtractFileContent(file);
        setExtractedTextPreview(extracted.text);
      } catch (err) {
        console.error('File parse error:', err);
      }
    }
  };

  const handleSaveUploadedFile = () => {
    if (!uploadingFile) {
      alert('Vui lòng chọn file PDF hoặc tài liệu!');
      return;
    }

    const docName = uploadingFile.name.replace(/\.[^/.]+$/, "");
    const newDoc: Partial<LegalDocument> = {
      code: `UP-${Date.now().toString().slice(-4)}`,
      docNumberSymbol: `UP-${docName.toUpperCase().slice(0, 15)}`,
      title: docName,
      docType: 'Hướng dẫn kỹ thuật',
      issuingAgency: 'Đơn vị Tải lên',
      issuedDate: new Date().toISOString().slice(0, 10),
      effectiveDate: new Date().toISOString().slice(0, 10),
      fields: [uploadCategory],
      category: uploadCategory,
      keywords: ['File đính kèm', docName],
      validityStatus: 'con_hieu_luc',
      pdfFileName: uploadingFile.name,
      summary: `Tài liệu vừa tải lên từ file: ${uploadingFile.name}. Trích xuất dữ liệu dùng cho tra cứu AI.`,
      fullContent: extractedTextPreview || `Tài liệu tải lên ${uploadingFile.name}`,
      keyPoints: ['Tài liệu tải lên trực tiếp vào kho pháp lý AI']
    };

    addLegalDoc(newDoc);
    setIsUploadModalOpen(false);
    setUploadingFile(null);
    setExtractedTextPreview('');
    refreshDocs();
    alert('Đã tải lên và thêm văn bản vào Kho dữ liệu tra cứu AI thành công!');
  };

  // AI Chat API Handler
  const handleSendAiPrompt = async (promptText?: string, mode: string = 'chat') => {
    const query = promptText || aiPrompt;
    if (!query.trim()) return;

    const userMessage = {
      role: 'user' as const,
      content: query,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMessage]);
    if (!promptText) setAiPrompt('');
    setIsAiLoading(true);

    try {
      // Collect projects context if applicable
      const projects = getProjects();
      const personnel = getPersonnel();
      const equipment = getEquipment();

      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: query,
          mode: mode,
          docsContext: documents,
          systemContext: {
            projectsCount: projects.length,
            personnelCount: personnel.length,
            equipmentCount: equipment.length,
            activeProjects: projects.slice(0, 5).map(p => ({ code: p.code, name: p.name, status: p.status, progress: p.progressPercent }))
          }
        })
      });

      const data = await response.json();

      const aiMessage = {
        role: 'ai' as const,
        content: data.answer || 'Chưa tìm thấy đủ thông tin trong kho dữ liệu',
        citations: data.citations || ['QCVN 01:2019/BQP', 'Nghị định 18/2019/NĐ-CP'],
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error('AI Error:', err);
      setChatHistory(prev => [
        ...prev,
        {
          role: 'ai',
          content: 'Chưa tìm thấy đủ thông tin trong kho dữ liệu (Lỗi kết nối máy chủ AI)',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Compare 2 documents using AI
  const handleCompareDocs = async () => {
    if (!docAId || !docBId) {
      alert('Vui lòng chọn cả Văn bản A và Văn bản B để so sánh!');
      return;
    }

    const docA = documents.find(d => d.id === docAId);
    const docB = documents.find(d => d.id === docBId);

    if (!docA || !docB) return;

    setIsComparing(true);
    setCompareResult('');

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'compare',
          docA,
          docB,
          prompt: 'So sánh sự khác biệt về nội dung, quy định mới, thay đổi điều khoản và xác định văn bản nào sửa đổi/thay thế văn bản nào.'
        })
      });

      const data = await response.json();
      setCompareResult(data.answer || 'Chưa tìm thấy đủ thông tin trong kho dữ liệu để so sánh.');
    } catch (err) {
      console.error('Compare AI Error:', err);
      setCompareResult('Chưa tìm thấy đủ thông tin trong kho dữ liệu (Lỗi kết nối AI)');
    } finally {
      setIsComparing(false);
    }
  };

  // Generate Dossier Checklist
  const handleGenerateDossier = async () => {
    if (!selectedOperation) return;
    setIsGeneratingDossier(true);
    setDossierResult('');

    try {
      const response = await fetch('/api/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'check_dossier',
          prompt: selectedOperation,
          docsContext: documents
        })
      });

      const data = await response.json();
      setDossierResult(data.answer || 'Chưa tìm thấy đủ thông tin trong kho dữ liệu');
    } catch (err) {
      console.error('Dossier AI Error:', err);
      setDossierResult('Chưa tìm thấy đủ thông tin trong kho dữ liệu (Lỗi kết nối AI)');
    } finally {
      setIsGeneratingDossier(false);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'con_hieu_luc':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> Còn hiệu lực</span>;
      case 'het_hieu_luc':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300"><XCircle className="w-3.5 h-3.5" /> Hết hiệu lực</span>;
      case 'bi_thay_the':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300"><AlertTriangle className="w-3.5 h-3.5" /> Bị thay thế</span>;
      case 'sua_doi_bo_sung':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300"><RefreshCw className="w-3.5 h-3.5" /> Sửa đổi, bổ sung</span>;
      case 'chua_co_hieu_luc':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300"><Clock className="w-3.5 h-3.5" /> Chưa có hiệu lực</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300"><CheckCircle2 className="w-3.5 h-3.5" /> Còn hiệu lực</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-900/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none p-6">
          <Scale className="w-64 h-64 text-indigo-300" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-medium mb-3">
              <BookOpen className="w-3.5 h-3.5" /> Phân hệ 13 • Tra cứu Pháp lý & Trợ lý RAG AI
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Scale className="w-8 h-8 text-indigo-400" />
              Kho Văn bản Pháp lý & Tìm kiếm AI
            </h1>
            <p className="mt-2 text-indigo-200 text-sm max-w-3xl leading-relaxed">
              Quản lý toàn bộ hệ thống quy chuẩn kỹ thuật (QCVN 01:2019/BQP, TCVN), Nghị định, Thông tư, Luật Đấu thầu và văn bản an toàn lao động. Tích hợp AI RAG trích dẫn nguồn văn bản chính xác 100%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="btn-add-legal-doc"
              onClick={() => handleOpenModal()}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition"
            >
              <Plus className="w-4 h-4" /> Thêm Văn bản Pháp lý
            </button>
            <button
              id="btn-upload-pdf-ai"
              onClick={() => setIsUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-200 border border-indigo-700/50 text-sm font-semibold transition"
            >
              <Upload className="w-4 h-4 text-indigo-400" /> Up File PDF/Word vào Kho AI
            </button>
          </div>
        </div>

        {/* Legal Disclaimer Banner */}
        <div className="mt-5 pt-4 border-t border-indigo-800/60 flex items-center gap-3 text-amber-300 text-xs bg-amber-950/40 px-4 py-2.5 rounded-xl border border-amber-500/30">
          <ShieldAlert className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>
            <strong>CẢNH BÁO PHÁP LÝ:</strong> Kết quả phân tích và tra cứu từ Trợ lý AI chỉ có tính chất hỗ trợ tra cứu tham khảo. Cán bộ nghiệp vụ cần đối chiếu trực tiếp bản gốc văn bản quy phạm pháp luật được ban hành.
          </span>
        </div>
      </div>

      {/* NotebookLM & Gemini Notebook Integration Control Bar */}
      <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-4 sm:p-5 shadow-lg space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-indigo-700 text-white flex items-center justify-center shrink-0 shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Tích hợp Kho Văn bản với NotebookLM & Gemini Notebook
                </h3>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                  effectiveModeInfo.effectiveMode === 'PERSONAL_NOTEBOOK_LINK'
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-600/60'
                    : effectiveModeInfo.effectiveMode === 'GEMINI_NOTEBOOK_ENTERPRISE'
                    ? 'bg-indigo-950/80 text-indigo-300 border-indigo-600/60'
                    : effectiveModeInfo.effectiveMode === 'INTERNAL_RAG'
                    ? 'bg-sky-950/80 text-sky-300 border-sky-600/60'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  Chế độ: {
                    effectiveModeInfo.effectiveMode === 'PERSONAL_NOTEBOOK_LINK'
                      ? 'PERSONAL_NOTEBOOK_LINK (Liên kết Sổ tay Cá nhân)'
                      : effectiveModeInfo.effectiveMode === 'GEMINI_NOTEBOOK_ENTERPRISE'
                      ? 'GEMINI_NOTEBOOK_ENTERPRISE (Google Cloud API)'
                      : effectiveModeInfo.effectiveMode === 'INTERNAL_RAG'
                      ? 'INTERNAL_RAG (RAG AI Nội bộ)'
                      : 'DISABLED (Đã tắt)'
                  }
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {effectiveModeInfo.effectiveMode === 'PERSONAL_NOTEBOOK_LINK' &&
                  'Mở liên kết NotebookLM bằng tài khoản Google cá nhân/tổ chức. Đồng thời Tra cứu AI bằng RAG nội bộ chính xác 100% có trích dẫn nguồn.'}
                {effectiveModeInfo.effectiveMode === 'GEMINI_NOTEBOOK_ENTERPRISE' &&
                  'Kết nối Google Cloud Enterprise Notebook API chính thức quản lý kho văn bản và phân tích thông minh.'}
                {effectiveModeInfo.effectiveMode === 'INTERNAL_RAG' &&
                  'Sử dụng Trợ lý AI RAG nội bộ trên kho văn bản quy phạm pháp luật đã lưu trữ.'}
                {effectiveModeInfo.effectiveMode === 'DISABLED' &&
                  'Tích hợp Notebook đang tạm dừng.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Open NotebookLM Link Button */}
            <button
              onClick={handleOpenNotebookLM}
              disabled={effectiveModeInfo.effectiveMode === 'DISABLED'}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md transition disabled:opacity-50"
            >
              <ExternalLink className="w-4 h-4" /> Mở NotebookLM bằng TK Google
            </button>

            {/* Account Google Status Button */}
            <button
              onClick={() => setShowGoogleLoginModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 font-semibold text-xs transition"
            >
              <Globe className="w-4 h-4 text-sky-400" />
              {notebookConfig.connectedGoogleAccount
                ? notebookConfig.connectedGoogleAccount.email
                : 'Đăng nhập Google'}
            </button>

            {/* Admin Notebook Config Button */}
            <button
              onClick={() => setIsNotebookModalOpen(true)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs transition flex items-center gap-1.5"
              title="Cấu hình chế độ tích hợp NotebookLM"
            >
              <Settings className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium">Cấu hình Tích hợp</span>
            </button>
          </div>
        </div>

        {/* Fallback Notice */}
        {effectiveModeInfo.fallbackReason && (
          <div className="p-3 rounded-xl bg-amber-950/50 border border-amber-800/60 text-amber-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-400" />
            <span>{effectiveModeInfo.fallbackReason}</span>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar space-x-2">
        <button
          id="tab-legal-library"
          onClick={() => setActiveTab('library')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'library'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <FileText className="w-4 h-4" />
          13.1 & 13.2 Kho Văn bản & Tra cứu ({filteredDocs.length})
        </button>

        <button
          id="tab-legal-ai-rag"
          onClick={() => setActiveTab('ai_rag')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'ai_rag'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <Bot className="w-4 h-4 text-indigo-500" />
          13.3 Trợ lý RAG AI Tra cứu & Hỏi đáp
        </button>

        <button
          id="tab-legal-compare"
          onClick={() => setActiveTab('compare')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'compare'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <FileSearch className="w-4 h-4" />
          So sánh & Phân tích Văn bản bằng AI
        </button>

        <button
          id="tab-legal-dossier"
          onClick={() => setActiveTab('dossier')}
          className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 whitespace-nowrap transition ${
            activeTab === 'dossier'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-semibold'
              : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400'
          }`}
        >
          <ListOrdered className="w-4 h-4" />
          Đề xuất Danh mục Hồ sơ Nghiệp vụ
        </button>
      </div>

      {/* TAB 1: KHO VĂN BẢN & TÌM KIẾM TRUYỀN THỐNG / HYBRID (13.1 & 13.2) */}
      {activeTab === 'library' && (
        <div className="space-y-6">
          {/* Filter Bar */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Filter className="w-4 h-4 text-indigo-600" /> Bộ lọc Tìm kiếm Văn bản Pháp lý (13.2)
              </h3>
              <button
                onClick={resetFilters}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className="w-3 h-3" /> Đặt lại bộ lọc
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {/* Free Text Input */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Số/Ký hiệu hoặc Tên văn bản</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="VD: QCVN 01:2019, 18/2019/NĐ-CP..."
                    value={searchParams.docNumberSymbol}
                    onChange={e => handleSearchChange('docNumberSymbol', e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Content Full-Text Search */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Từ khóa nội dung / Điều khoản</label>
                <input
                  type="text"
                  placeholder="VD: độ sâu rà phá, hủy nổ, an toàn..."
                  value={searchParams.content}
                  onChange={e => handleSearchChange('content', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Filter 12 Fields */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Lĩnh vực (12 lĩnh vực)</label>
                <select
                  value={searchParams.field}
                  onChange={e => handleSearchChange('field', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả 12 Lĩnh vực</option>
                  {LEGAL_FIELDS_MAP.map(f => (
                    <option key={f.id} value={f.label}>{f.icon} {f.label}</option>
                  ))}
                </select>
              </div>

              {/* Validity Status */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-400">Tình trạng hiệu lực</label>
                <select
                  value={searchParams.validityStatus}
                  onChange={e => handleSearchChange('validityStatus', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">Tất cả Tình trạng</option>
                  <option value="con_hieu_luc">Còn hiệu lực</option>
                  <option value="het_hieu_luc">Hết hiệu lực</option>
                  <option value="bi_thay_the">Bị thay thế</option>
                  <option value="sua_doi_bo_sung">Sửa đổi, bổ sung</option>
                  <option value="chua_co_hieu_luc">Chưa có hiệu lực</option>
                </select>
              </div>
            </div>

            {/* Quick Domain Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pt-2 no-scrollbar">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Lĩnh vực nhanh:</span>
              <button
                onClick={() => handleSearchChange('field', 'all')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                  searchParams.field === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                Tất cả
              </button>
              {LEGAL_FIELDS_MAP.slice(0, 6).map(f => (
                <button
                  key={f.id}
                  onClick={() => handleSearchChange('field', f.label)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium whitespace-nowrap transition ${
                    searchParams.field === f.label
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {f.icon} {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Legal Documents Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {filteredDocs.map(doc => (
              <div
                key={doc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block px-2.5 py-0.5 rounded-md text-xs font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 mb-1">
                        {doc.docNumberSymbol || doc.code}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-base leading-snug line-clamp-2">
                        {doc.title}
                      </h4>
                    </div>
                    {getStatusBadge(doc.validityStatus || doc.status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><Building className="w-3.5 h-3.5 text-slate-400" /> {doc.issuingAgency || 'Bộ Quốc phòng'}</span>
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-slate-400" /> {doc.docType || 'Văn bản'}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5 text-slate-400" /> Hiệu lực: {doc.effectiveDate || 'N/A'}</span>
                  </div>

                  {/* Fields list */}
                  <div className="flex flex-wrap gap-1">
                    {doc.fields?.map((field, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px]">
                        {field}
                      </span>
                    ))}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800/80">
                    {doc.summary}
                  </p>

                  {/* Replacements / Amendments relationships if any */}
                  {(doc.replacingDoc || doc.replacedDoc || doc.amendingDoc) && (
                    <div className="text-[11px] space-y-0.5 text-slate-500 bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                      {doc.replacedDoc && <div>• Bị thay thế bởi: <span className="font-semibold text-amber-800 dark:text-amber-300">{doc.replacedDoc}</span></div>}
                      {doc.replacingDoc && <div>• Văn bản thay thế: <span className="font-semibold text-amber-800 dark:text-amber-300">{doc.replacingDoc}</span></div>}
                      {doc.amendingDoc && <div>• Văn bản sửa đổi: <span className="font-semibold text-sky-800 dark:text-sky-300">{doc.amendingDoc}</span></div>}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {doc.driveUrl && (
                      <a
                        href={doc.driveUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> Drive
                      </a>
                    )}
                    {doc.sourceUrl && (
                      <a
                        href={doc.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition"
                      >
                        <ExternalLink className="w-3 h-3" /> Nguồn
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedDocDetail(doc)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Xem chi tiết toàn văn"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenModal(doc)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Chỉnh sửa văn bản"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
                      title="Xóa văn bản"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TRỢ LÝ RAG AI TRA CỨU & HỎI ĐÁP (13.3) */}
      {activeTab === 'ai_rag' && (
        <div className="space-y-4">
          {/* Preset Prompts */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500" /> Mẫu câu hỏi tra cứu nghiệp vụ thường gặp (Click để hỏi AI)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {[
                "Hồ sơ nghiệm thu dự án rà phá bom mìn cần những tài liệu nào?",
                "Văn bản nào quy định về quản lý chất lượng công trình?",
                "Chứng chỉ của cán bộ kỹ thuật sắp hết hạn có ảnh hưởng đến dự án nào?",
                "Dự án nào chưa đủ hồ sơ pháp lý để khởi công?",
                "Những văn bản nào đã hết hiệu lực?",
                "Quy chuẩn độ sâu rà phá 0.3m, 3m, 5m quy định ở đâu?"
              ].map((promptText, i) => (
                <button
                  key={i}
                  onClick={() => handleSendAiPrompt(promptText)}
                  className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 hover:text-indigo-700 dark:hover:text-indigo-300 transition flex items-start gap-2"
                >
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                  <span>{promptText}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col h-[600px]">
            {/* Chat Messages */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-md">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-3xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 text-white rounded-br-none'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>

                    {/* Citations Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-1">
                        <span className="text-[11px] text-slate-500 font-medium">Trích dẫn căn cứ:</span>
                        {msg.citations.map((cit, cIdx) => (
                          <span
                            key={cIdx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                          >
                            <FileCheck className="w-3 h-3" /> {cit}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 px-1">{msg.timestamp}</div>
                  </div>

                  {msg.role === 'user' && (
                    <div className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center flex-shrink-0 font-bold text-xs">
                      CB
                    </div>
                  )}
                </div>
              ))}

              {isAiLoading && (
                <div className="flex items-center gap-3 text-slate-500 text-sm italic">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>
                  Đang truy vấn Kho văn bản pháp lý & phân tích căn cứ RAG...
                </div>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleSendAiPrompt();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  placeholder="Hỏi AI về quy chuẩn Rà phá Bom mìn, Luật đấu thầu, Nghị định 18/2019/NĐ-CP..."
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                  className="flex-1 px-4 py-3 text-sm border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="submit"
                  disabled={isAiLoading || !aiPrompt.trim()}
                  className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-sm disabled:opacity-50 transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Bot className="w-4 h-4" /> Gửi hỏi AI
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SO SÁNH & PHÂN TÍCH VĂN BẢN (AI Compare) */}
      {activeTab === 'compare' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSearch className="w-5 h-5 text-indigo-600" /> So sánh & Phân tích Sự thay đổi giữa Hai Văn bản Pháp lý
            </h3>
            <p className="text-xs text-slate-500">
              Chọn hai văn bản từ Kho dữ liệu để AI phân tích sự khác biệt về quy định, điều khoản mới bổ sung, văn bản thay thế hoặc sửa đổi.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Select Doc A */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">A</span>
                  Văn bản thứ nhất (Văn bản gốc / Cũ)
                </label>
                <select
                  value={docAId}
                  onChange={e => setDocAId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.docNumberSymbol || d.code} - {d.title.slice(0, 60)}...</option>
                  ))}
                </select>
              </div>

              {/* Select Doc B */}
              <div className="space-y-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] flex items-center justify-center">B</span>
                  Văn bản thứ hai (Văn bản mới / Sửa đổi)
                </label>
                <select
                  value={docBId}
                  onChange={e => setDocBId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
                >
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.docNumberSymbol || d.code} - {d.title.slice(0, 60)}...</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCompareDocs}
                disabled={isComparing}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
              >
                {isComparing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {isComparing ? 'Đang phân tích so sánh...' : 'Tiến hành So sánh bằng AI'}
              </button>
            </div>
          </div>

          {/* Comparison Result Box */}
          {compareResult && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-md space-y-3">
              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Kết quả So sánh AI Trích dẫn Nguồn
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {compareResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: ĐỀ XUẤT DANH MỤC HỒ SƠ NGHIỆP VỤ (AI Dossier Generator) */}
      {activeTab === 'dossier' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-indigo-600" /> Đề xuất Danh mục Hồ sơ Pháp lý Cần chuẩn bị cho Nghiệp vụ
            </h3>
            <p className="text-xs text-slate-500">
              Chọn nghiệp vụ để AI tự động đối chiếu các quy định pháp lý hiện hành và trích xuất checklist danh mục tài liệu, bản vẽ, quyết định bắt buộc.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Chọn hoặc nhập nghiệp vụ cần chuẩn bị hồ sơ:</label>
              <select
                value={selectedOperation}
                onChange={e => setSelectedOperation(e.target.value)}
                className="w-full px-3 py-2.5 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800"
              >
                <option value="Nghiệm thu và bàn giao đất sạch bom mìn vật nổ">1. Nghiệm thu & Bàn giao đất sạch bom mìn vật nổ</option>
                <option value="Khởi công dự án rà phá bom mìn vật nổ">2. Khởi công công trình dự án rà phá bom mìn</option>
                <option value="Trình duyệt Phương án kỹ thuật thi công và dự toán rà phá bom mìn">3. Trình duyệt Phương án kỹ thuật thi công & Dự toán RPBM</option>
                <option value="Thanh toán khối lượng hoàn thành và quyết toán dự án">4. Thanh toán khối lượng hoàn thành & Quyết toán dự án RPBM</option>
                <option value="Đăng ký cấp chứng chỉ năng lực kỹ thuật viên rà phá bom mìn">5. Đăng ký cấp chứng chỉ kỹ thuật viên & Chỉ huy trưởng</option>
              </select>
            </div>

            <button
              onClick={handleGenerateDossier}
              disabled={isGeneratingDossier}
              className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              {isGeneratingDossier ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ListOrdered className="w-4 h-4" />}
              {isGeneratingDossier ? 'Đang tổng hợp danh mục hồ sơ...' : 'Đề xuất Danh mục Hồ sơ AI'}
            </button>
          </div>

          {dossierResult && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-indigo-200 dark:border-indigo-900 shadow-md space-y-3">
              <h4 className="text-sm font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                <FileCheck className="w-4 h-4" /> Danh mục Hồ sơ Pháp lý Bắt buộc (AI Tổng hợp từ Quy định hiện hành)
              </h4>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-sm leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                {dossierResult}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD / EDIT LEGAL DOCUMENT (13.1) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Scale className="w-5 h-5 text-indigo-600" />
                {editingDoc ? 'Chỉnh sửa Văn bản Pháp lý (13.1)' : 'Thêm mới Văn bản Pháp lý (13.1)'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Số, Ký hiệu văn bản *</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: 18/2019/NĐ-CP, QCVN 01:2019/BQP..."
                    value={formData.docNumberSymbol}
                    onChange={e => setFormData({ ...formData, docNumberSymbol: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mã văn bản hệ thống</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tên văn bản *</label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên đầy đủ của văn bản quy phạm..."
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Cơ quan ban hành</label>
                  <input
                    type="text"
                    placeholder="Chính phủ, Bộ Quốc phòng..."
                    value={formData.issuingAgency}
                    onChange={e => setFormData({ ...formData, issuingAgency: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Loại văn bản</label>
                  <select
                    value={formData.docType}
                    onChange={e => setFormData({ ...formData, docType: e.target.value, type: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="Luật">Luật</option>
                    <option value="Nghị định">Nghị định</option>
                    <option value="Thông tư">Thông tư</option>
                    <option value="Quy chuẩn (QCVN)">Quy chuẩn (QCVN)</option>
                    <option value="Tiêu chuẩn (TCVN)">Tiêu chuẩn (TCVN)</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Hướng dẫn kỹ thuật">Hướng dẫn kỹ thuật</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tình trạng hiệu lực</label>
                  <select
                    value={formData.validityStatus}
                    onChange={e => setFormData({ ...formData, validityStatus: e.target.value as LegalValidityStatus, status: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="con_hieu_luc">Còn hiệu lực</option>
                    <option value="het_hieu_luc">Hết hiệu lực</option>
                    <option value="bi_thay_the">Bị thay thế</option>
                    <option value="sua_doi_bo_sung">Sửa đổi, bổ sung</option>
                    <option value="chua_co_hieu_luc">Chưa có hiệu lực</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày ban hành</label>
                  <input
                    type="date"
                    value={formData.issuedDate}
                    onChange={e => setFormData({ ...formData, issuedDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày có hiệu lực</label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={e => setFormData({ ...formData, effectiveDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Ngày hết hiệu lực (nếu có)</label>
                  <input
                    type="date"
                    value={formData.expiryDate}
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Văn bản thay thế (Số/Ký hiệu)</label>
                  <input
                    type="text"
                    placeholder="VD: QCVN 01:2019/BQP"
                    value={formData.replacingDoc}
                    onChange={e => setFormData({ ...formData, replacingDoc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Văn bản bị thay thế (Số/Ký hiệu)</label>
                  <input
                    type="text"
                    placeholder="VD: QCVN 01:2012/BQP"
                    value={formData.replacedDoc}
                    onChange={e => setFormData({ ...formData, replacedDoc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Văn bản sửa đổi, bổ sung</label>
                  <input
                    type="text"
                    placeholder="VD: Nghị định 35/2023/NĐ-CP"
                    value={formData.amendingDoc}
                    onChange={e => setFormData({ ...formData, amendingDoc: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Link Google Drive</label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.driveUrl}
                    onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Link nguồn chính thức</label>
                  <input
                    type="url"
                    placeholder="https://vanban.chinhphu.vn/..."
                    value={formData.sourceUrl}
                    onChange={e => setFormData({ ...formData, sourceUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Tóm tắt nội dung chính</label>
                <textarea
                  rows={3}
                  placeholder="Tóm tắt ngắn gọn quy định cốt lõi của văn bản..."
                  value={formData.summary}
                  onChange={e => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Nội dung toàn văn / OCR Text (Dùng cho AI RAG Search)</label>
                <textarea
                  rows={4}
                  placeholder="Dán nội dung toàn văn bản hoặc các điều khoản quan trọng để AI học và trích dẫn..."
                  value={formData.fullContent}
                  onChange={e => setFormData({ ...formData, fullContent: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30"
                >
                  {editingDoc ? 'Cập nhật Văn bản' : 'Lưu Văn bản Pháp lý'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD FILE PDF TO LEGAL REPOSITORY */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-5 h-5 text-indigo-600" /> Upload File PDF/Word/Scan vào Kho Pháp lý AI
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="border-2 border-dashed border-indigo-200 dark:border-indigo-900/60 rounded-2xl p-6 text-center bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 transition">
                <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-2" />
                <p className="text-xs text-slate-700 dark:text-slate-300 font-semibold">Kéo thả file PDF, Word, Scan hoặc Click để chọn file</p>
                <p className="text-[11px] text-slate-400 mt-1">Hệ thống sẽ trích xuất text tự động để Trợ lý AI thực hiện RAG Search</p>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.txt"
                  onChange={handleFileChange}
                  className="mt-3 block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phân loại Lĩnh vực</label>
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                >
                  {LEGAL_FIELDS_MAP.map(f => (
                    <option key={f.id} value={f.label}>{f.icon} {f.label}</option>
                  ))}
                </select>
              </div>

              {extractedTextPreview && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Trích xuất xem trước text:</label>
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs max-h-36 overflow-y-auto whitespace-pre-wrap text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    {extractedTextPreview}
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSaveUploadedFile}
                  disabled={!uploadingFile}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition"
                >
                  Lưu vào Kho dữ liệu AI
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: VIEW DETAIL LEGAL DOCUMENT */}
      {selectedDocDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">
                  {selectedDocDetail.docNumberSymbol || selectedDocDetail.code}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedDocDetail.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDocDetail(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div><strong>Cơ quan ban hành:</strong> {selectedDocDetail.issuingAgency || 'N/A'}</div>
                <div><strong>Loại văn bản:</strong> {selectedDocDetail.docType || 'N/A'}</div>
                <div><strong>Trạng thái:</strong> {getStatusBadge(selectedDocDetail.validityStatus)}</div>
                <div><strong>Ngày ban hành:</strong> {selectedDocDetail.issuedDate || 'N/A'}</div>
                <div><strong>Ngày có hiệu lực:</strong> {selectedDocDetail.effectiveDate || 'N/A'}</div>
                <div><strong>Ngày hết hiệu lực:</strong> {selectedDocDetail.expiryDate || 'Đang hiệu lực'}</div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Lĩnh vực liên quan:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedDocDetail.fields?.map((f, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                      {f}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Tóm tắt nội dung quy định:</h4>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl leading-relaxed text-slate-700 dark:text-slate-300">
                  {selectedDocDetail.summary}
                </div>
              </div>

              {selectedDocDetail.keyPoints && selectedDocDetail.keyPoints.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Các điểm mấu chốt:</h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 bg-indigo-50/30 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                    {selectedDocDetail.keyPoints.map((kp, idx) => (
                      <li key={idx}>{kp}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedDocDetail.fullContent && (
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 mb-1">Nội dung trích xuất toàn văn (dùng cho AI RAG):</h4>
                  <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-xl max-h-48 overflow-y-auto whitespace-pre-wrap">
                    {selectedDocDetail.fullContent}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {selectedDocDetail.driveUrl && (
                    <a
                      href={selectedDocDetail.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-500 transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Mở Google Drive
                    </a>
                  )}
                  {selectedDocDetail.sourceUrl && (
                    <a
                      href={selectedDocDetail.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Link nguồn chính thức
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setSelectedDocDetail(null)}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: GOOGLE ACCOUNT CONNECT MODAL */}
      {showGoogleLoginModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Globe className="w-5 h-5 text-sky-500" /> Liên kết Tài khoản Google cho NotebookLM
              </h3>
              <button
                onClick={() => setShowGoogleLoginModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {notebookConfig.connectedGoogleAccount ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-3">
                  <UserCheck className="w-8 h-8 text-emerald-600 flex-shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200">Đã đăng nhập tài khoản Google</h4>
                    <p className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold">{notebookConfig.connectedGoogleAccount.email}</p>
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Thời gian kết nối: {notebookConfig.connectedGoogleAccount.connectedAt}</p>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleDisconnectGoogleAccount}
                    className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition"
                  >
                    Hủy liên kết tài khoản
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowGoogleLoginModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-semibold"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleConnectGoogleAccount} className="space-y-4">
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Đăng nhập tài khoản Google để mở NotebookLM cá nhân/tổ chức và đồng bộ quyền truy cập kho văn bản pháp lý.
                </p>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Google *</label>
                  <input
                    type="email"
                    required
                    placeholder="VD: cbo.nghiepvu@gmail.com, user@bqp.vn"
                    value={googleEmailInput}
                    onChange={e => setGoogleEmailInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Họ và tên Cán bộ</label>
                  <input
                    type="text"
                    placeholder="VD: Nguyễn Văn A - Cán bộ Nghiệp vụ"
                    value={googleNameInput}
                    onChange={e => setGoogleNameInput(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                {/* Quick Presets */}
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold text-slate-500">Tài khoản mẫu gợi ý:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { email: 'cbo.nghiepvu.bqp@gmail.com', name: 'Cán bộ Nghiệp vụ BQP' },
                      { email: 'quanly.khoaistudio@gmail.com', name: 'Chủ nhiệm Dự án QLRPBM' }
                    ].map((acc, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          setGoogleEmailInput(acc.email);
                          setGoogleNameInput(acc.name);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-700 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-950/40 hover:text-sky-600 transition"
                      >
                        + {acc.email}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleLoginModal(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-600/30"
                  >
                    Xác nhận Đăng nhập Google
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 5: ADMIN NOTEBOOK INTEGRATION CONFIG MODAL */}
      {isNotebookModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Settings className="w-5 h-5 text-indigo-600" /> Cấu hình Tích hợp NotebookLM & Gemini Notebook
              </h3>
              <button
                onClick={() => setIsNotebookModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Select Integration Mode */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-100">Chọn Chế độ Tích hợp (NotebookIntegrationMode):</label>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Mode 1: PERSONAL_NOTEBOOK_LINK */}
                  <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    notebookConfig.mode === 'PERSONAL_NOTEBOOK_LINK'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">1. PERSONAL_NOTEBOOK_LINK</span>
                      <input
                        type="radio"
                        name="notebook_mode"
                        checked={notebookConfig.mode === 'PERSONAL_NOTEBOOK_LINK'}
                        onChange={() => handleUpdateNotebookSettings({ mode: 'PERSONAL_NOTEBOOK_LINK' })}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Mở liên kết NotebookLM cá nhân bằng tài khoản Google. Chatbot trong ứng dụng sử dụng RAG nội bộ trên cùng kho văn bản. Không iframe, không scraping.
                    </p>
                  </label>

                  {/* Mode 2: GEMINI_NOTEBOOK_ENTERPRISE */}
                  <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    notebookConfig.mode === 'GEMINI_NOTEBOOK_ENTERPRISE'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">2. GEMINI_NOTEBOOK_ENTERPRISE</span>
                      <input
                        type="radio"
                        name="notebook_mode"
                        checked={notebookConfig.mode === 'GEMINI_NOTEBOOK_ENTERPRISE'}
                        onChange={() => handleUpdateNotebookSettings({ mode: 'GEMINI_NOTEBOOK_ENTERPRISE' })}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Quản lý qua Google Cloud Enterprise Notebook API. Tự động chuyển về PERSONAL_NOTEBOOK_LINK nếu API chưa sẵn sàng.
                    </p>
                  </label>

                  {/* Mode 3: INTERNAL_RAG */}
                  <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    notebookConfig.mode === 'INTERNAL_RAG'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">3. INTERNAL_RAG</span>
                      <input
                        type="radio"
                        name="notebook_mode"
                        checked={notebookConfig.mode === 'INTERNAL_RAG'}
                        onChange={() => handleUpdateNotebookSettings({ mode: 'INTERNAL_RAG' })}
                      />
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
                      Chỉ sử dụng Trợ lý AI RAG nội bộ trên kho văn bản pháp lý lưu trữ cục bộ.
                    </p>
                  </label>

                  {/* Mode 4: DISABLED */}
                  <label className={`p-4 rounded-xl border cursor-pointer transition flex flex-col justify-between space-y-2 ${
                    notebookConfig.mode === 'DISABLED'
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40'
                  }`}>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600 dark:text-slate-400">4. DISABLED</span>
                      <input
                        type="radio"
                        name="notebook_mode"
                        checked={notebookConfig.mode === 'DISABLED'}
                        onChange={() => handleUpdateNotebookSettings({ mode: 'DISABLED' })}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Tắt hoàn toàn các nút liên kết và tích hợp NotebookLM.
                    </p>
                  </label>
                </div>
              </div>

              {/* Personal Notebook URL Input */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Đường dẫn NotebookLM Cá nhân (Personal Notebook URL)</label>
                <input
                  type="url"
                  placeholder="https://notebooklm.google.com/notebook/..."
                  value={notebookConfig.personalNotebookUrl}
                  onChange={e => handleUpdateNotebookSettings({ personalNotebookUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                />
              </div>

              {/* Enterprise Project Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Mã Google Cloud Enterprise Project ID</label>
                  <input
                    type="text"
                    placeholder="VD: uxo-clearance-legal-cloud"
                    value={notebookConfig.enterpriseProjectId}
                    onChange={e => handleUpdateNotebookSettings({ enterpriseProjectId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Google OAuth Client ID</label>
                  <input
                    type="text"
                    placeholder="VD: 12345678-apps.googleusercontent.com"
                    value={notebookConfig.googleClientId}
                    onChange={e => handleUpdateNotebookSettings({ googleClientId: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800"
                  />
                </div>
              </div>

              {/* Test Enterprise API Connection Button */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">Kiểm tra kết nối Google Cloud Enterprise API</h4>
                    <p className="text-[11px] text-slate-500">Xác thực môi trường máy chủ backend và giấy phép Gemini Notebook Enterprise.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleTestEnterpriseApi}
                    disabled={testEnterpriseLoading}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold disabled:opacity-50 transition shrink-0"
                  >
                    {testEnterpriseLoading ? 'Đang kiểm tra...' : 'Kiểm tra API'}
                  </button>
                </div>

                {testEnterpriseMessage && (
                  <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] leading-relaxed">
                    {testEnterpriseMessage}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsNotebookModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
                >
                  Hoàn tất & Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
