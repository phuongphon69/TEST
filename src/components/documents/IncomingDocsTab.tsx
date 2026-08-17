import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Calendar,
  Building,
  Eye,
  Edit2,
  X,
  History,
  Send,
  UserCheck,
  Upload,
  Trash2,
  Check,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  File,
  Shield,
  User,
  Paperclip,
  Download,
  RotateCcw,
  AlertTriangle,
  ShieldAlert,
  Info,
  CheckCircle2,
  FileSpreadsheet,
  BarChart3,
  PieChart,
  Building2,
  Users
} from 'lucide-react';
import { DocumentRecord, Personnel, DocumentAttachment, User as UserAccount } from '../../types';
import { formatDateVN, formatDateForInput } from '../../utils/formatters';
import {
  peekNextIncomingDocNumber,
  getAndIncrementIncomingDocNumber,
  resetIncomingDocCounter,
  getIncomingDocCounterResetHistory
} from '../../utils/storage';
import {
  getMasterEmployeeList,
  getMasterLeaderList
} from '../../services/masterDataService';
import { validateFileForCategory, uploadUnifiedFile } from '../../services/storageService';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import {
  INCOMING_DOCUMENT_ISSUING_AGENCIES,
  INCOMING_DOCUMENT_ASSIGNER_GROUP_LABEL,
  checkUserIsEligibleAssigner,
  extractUserRankAndPosition,
  validateIncomingDocumentSave,
  IssuingAgencyOption
} from '../../constants/incomingDocumentConstants';

interface IncomingDocsTabProps {
  documents: DocumentRecord[];
  currentUser: { name: string; title: string; role?: string };
  onSaveDoc: (doc: DocumentRecord) => void;
  onDeleteDoc: (id: string) => void;
  onOpenWorkflow: (doc: DocumentRecord) => void;
  onCreateReplyDoc: (sourceDoc: DocumentRecord) => void;
}

const ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx'];
const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const IncomingDocsTab: React.FC<IncomingDocsTabProps> = ({
  documents,
  currentUser,
  onSaveDoc,
  onDeleteDoc,
  onOpenWorkflow,
  onCreateReplyDoc
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<{ title: string; url: string } | null>(null);

  // Annual selection & Statistics states
  const currentYearStr = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState<string>(currentYearStr);
  const [showStatsPanel, setShowStatsPanel] = useState<boolean>(true);

  // Extract distinct available years from documents
  const availableYears = Array.from(
    new Set([
      currentYearStr,
      ...documents
        .filter(d => d.dataStatus !== 'da_xoa' && (d.type === 'vanban_den' || d.type === 'thong_bao_tham_dinh'))
        .map(d => {
          const dateStr = d.incomingDate || d.issueDate || d.createdAt || '';
          return dateStr ? dateStr.slice(0, 4) : '';
        })
        .filter(Boolean)
    ])
  ).sort((a, b) => b.localeCompare(a));

  // Counter Reset state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetHistory, setResetHistory] = useState<any[]>([]);
  const [showResetHistoryModal, setShowResetHistoryModal] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // User Accounts & Personnel lists
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [expectedNumberDisplay, setExpectedNumberDisplay] = useState<string>('');

  // Dropdown search states for modal form
  const [showReceiverDropdown, setShowReceiverDropdown] = useState(false);
  const [receiverSearch, setReceiverSearch] = useState('');
  
  const [showLeaderDropdown, setShowLeaderDropdown] = useState(false);
  const [leaderSearch, setLeaderSearch] = useState('');

  const [showIssuerDropdown, setShowIssuerDropdown] = useState(false);

  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Check user role for Admin actions
  const userRole = (currentUser as any)?.role || (currentUser as any)?.userRole || 'vanthu';
  const isAdmin = userRole === 'quantri' || userRole === 'quan_tri_vien' || userRole === 'admin';

  // Form State
  const [formData, setFormData] = useState<{
    incomingNumberSeq?: number;
    incomingNumberDisplay: string;
    incomingNumber: string;
    incomingDate: string;
    code: string;
    issueDate: string;
    issuerCode: string;
    issuer: string;
    title: string;
    category: string;
    securityLevel: 'thuong' | 'mat' | 'toi_mat' | 'tuyet_mat';
    receiverId: string;
    receiverName: string;
    assignerUserId: string;
    assignerPersonId: string;
    assignerNameSnapshot: string;
    assignerRankSnapshot: string;
    assignerPositionSnapshot: string;
    assignerRoleSnapshot: string;
    assignerEmailSnapshot: string;
    leaderId: string;
    leaderName: string;
    directiveOpinion: string;
    driveUrl: string;
    attachments: DocumentAttachment[];
    notes: string;
  }>({
    incomingNumberDisplay: '',
    incomingNumber: '',
    incomingDate: formatDateForInput(new Date()),
    code: '',
    issueDate: formatDateForInput(new Date()),
    issuerCode: 'BINH_CHUNG_CONG_BINH',
    issuer: 'Binh chủng Công binh',
    title: '',
    category: 'Công văn',
    securityLevel: 'thuong',
    receiverId: '',
    receiverName: '',
    assignerUserId: '',
    assignerPersonId: '',
    assignerNameSnapshot: '',
    assignerRankSnapshot: '',
    assignerPositionSnapshot: '',
    assignerRoleSnapshot: '',
    assignerEmailSnapshot: '',
    leaderId: '',
    leaderName: '',
    directiveOpinion: '',
    driveUrl: '',
    attachments: [],
    notes: ''
  });

  // Load personnel and user accounts
  useEffect(() => {
    const allPersonnel = getMasterEmployeeList();
    setPersonnelList(allPersonnel);

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);

    setResetHistory(getIncomingDocCounterResetHistory());
  }, [showAddModal, showResetModal]);

  // Helper to convert Google Drive view/edit URLs to preview iframe embed format
  const getEmbedPdfUrl = (rawUrl: string): string => {
    if (!rawUrl) return '';
    if (rawUrl.includes('drive.google.com')) {
      const driveMatch = rawUrl.match(/\/file\/d\/([^\/]+)/);
      if (driveMatch && driveMatch[1]) {
        return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
      }
      const idMatch = rawUrl.match(/[?&]id=([^&]+)/);
      if (idMatch && idMatch[1]) {
        return `https://drive.google.com/file/d/${idMatch[1]}/preview`;
      }
    }
    return rawUrl;
  };

  // Active Personnel for Receiver
  const activePersonnel = personnelList.filter(p => p.workStatus !== 'tam_nghi');

  // Eligible Assigner User Accounts (Battalion Commander / Deputy Commander)
  const currentAccountsList = userAccounts.length > 0 ? userAccounts : UserAccountRepository.getAll();
  const eligibleAssigners = currentAccountsList.filter(u => checkUserIsEligibleAssigner(u));

  const isSelectedSearch = formData.assignerNameSnapshot && leaderSearch.includes(formData.assignerNameSnapshot);
  const filteredEligibleAssigners = eligibleAssigners.filter(u => {
    if (!leaderSearch.trim() || isSelectedSearch) return true;
    const q = leaderSearch.toLowerCase();
    const details = extractUserRankAndPosition(u);
    return (
      u.name.toLowerCase().includes(q) ||
      details.rank.toLowerCase().includes(q) ||
      details.position.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // Filtered receivers list
  const filteredReceivers = activePersonnel.filter(p =>
    p.fullName.toLowerCase().includes(receiverSearch.toLowerCase()) ||
    (p.position && p.position.toLowerCase().includes(receiverSearch.toLowerCase())) ||
    (p.unit && p.unit.toLowerCase().includes(receiverSearch.toLowerCase()))
  );

  // Get sequence number for numerical sorting
  const getDocSeq = (d: DocumentRecord): number => {
    if (typeof d.incomingNumberSeq === 'number') return d.incomingNumberSeq;
    const numStr = (d.incomingNumberDisplay || d.incomingNumber || '').replace(/\D/g, '');
    return numStr ? parseInt(numStr, 10) : 0;
  };

  // Incoming docs list (excluding deleted, filtered by selected year & search query, sorted numerically by sequence)
  const incomingDocs = documents
    .filter(d => d.dataStatus !== 'da_xoa')
    .filter(d => d.type === 'vanban_den' || d.type === 'thong_bao_tham_dinh')
    .filter(d => {
      if (selectedYear === 'all') return true;
      const docYear = (d.incomingDate || d.issueDate || d.createdAt || '').slice(0, 4);
      return docYear === selectedYear;
    })
    .filter(d => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const incNum = d.incomingNumberDisplay || d.incomingNumber || '';
      const rec = d.receiverName || d.receiver || '';
      const ldr = d.assignerNameSnapshot || d.leaderName || d.assignedProcessor || '';
      return (
        d.code.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        d.issuer.toLowerCase().includes(q) ||
        incNum.toLowerCase().includes(q) ||
        rec.toLowerCase().includes(q) ||
        ldr.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => getDocSeq(b) - getDocSeq(a));

  // Statistics calculation for filtered documents
  const totalDocsCount = incomingDocs.length;
  const processedDocsCount = incomingDocs.filter(d => d.status === 'da_xu_ly' || d.status === 'da_hoan_thanh').length;
  const processingDocsCount = incomingDocs.filter(d => d.status === 'dang_xu_ly' || d.status === 'cho_xuly').length;
  const newDocsCount = incomingDocs.filter(d => d.status === 'moi_tiep_nhan' || !d.status).length;
  const processedPercent = totalDocsCount > 0 ? Math.round((processedDocsCount / totalDocsCount) * 100) : 0;

  // Breakdown by Issuing Agency
  const agencyCountsMap: Record<string, number> = {};
  incomingDocs.forEach(d => {
    const iss = d.issuer || 'Khác / Chưa rõ';
    agencyCountsMap[iss] = (agencyCountsMap[iss] || 0) + 1;
  });
  const agencyStatsList = Object.entries(agencyCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Breakdown by Assignee / Leader
  const leaderCountsMap: Record<string, number> = {};
  incomingDocs.forEach(d => {
    const ldr = d.assignerNameSnapshot || d.leaderName || d.receiverName || d.recipientOrOwner || 'Chưa gán';
    leaderCountsMap[ldr] = (leaderCountsMap[ldr] || 0) + 1;
  });
  const leaderStatsList = Object.entries(leaderCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Excel Export Handler using XLSX
  const handleExportExcel = () => {
    const sortedDocs = [...incomingDocs].sort((a, b) => getDocSeq(a) - getDocSeq(b));

    const yearLabel = selectedYear === 'all' ? 'TẤT CẢ CÁC NĂM' : `NĂM ${selectedYear}`;
    const now = new Date();
    const timeFormatted = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${formatDateVN(now.toISOString())}`;
    const dateStrForFile = `${now.getDate().toString().padStart(2, '0')}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getFullYear()}`;

    const sheetData: any[][] = [
      [`BÁO CÁO TỔNG HỢP VĂN BẢN ĐẾN - ${yearLabel}`],
      [`Thời gian xuất: ${timeFormatted}`],
      [`Người xuất: ${currentUser.name} (${currentUser.title || 'Cán bộ văn thư'})`],
      [`Tổng số bản ghi: ${sortedDocs.length}`],
      [], // blank line separator
      [
        'STT',
        'Số Đến',
        'Ngày Đến',
        'Số / Ký Hiệu Gốc',
        'Ngày Ban Hành',
        'Loại Văn Bản',
        'Cơ Quan Ban Hành',
        'Trích Yếu Nội Dung',
        'Cán Bộ Tiếp Nhận',
        'Người Giao Xử Lý (Chỉ Huy)',
        'Hạn Xử Lý',
        'Trạng Thái'
      ]
    ];

    sortedDocs.forEach((doc, idx) => {
      const numDisplay = doc.incomingNumberDisplay || doc.incomingNumber || `${getDocSeq(doc)}/ĐẾN`;
      const statusText = doc.status === 'da_xu_ly' || doc.status === 'da_hoan_thanh' 
        ? 'Đã xử lý' 
        : doc.status === 'dang_xu_ly' ? 'Đang xử lý' : 'Mới tiếp nhận';

      const assignerStr = doc.assignerNameSnapshot 
        ? `${doc.assignerNameSnapshot} (${doc.assignerPositionSnapshot || doc.assigningPersonTitle || 'Chỉ huy'})`
        : doc.leaderName || doc.leader || '--';

      sheetData.push([
        idx + 1,
        numDisplay,
        formatDateVN(doc.incomingDate || doc.issueDate),
        doc.code || '--',
        formatDateVN(doc.issueDate),
        doc.category || 'Công văn',
        doc.issuer || '--',
        doc.title || '',
        doc.receiverName || doc.receiver || '--',
        assignerStr,
        formatDateVN(doc.deadline),
        statusText
      ]);
    });

    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);

    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 14 }, // Số đến
      { wch: 14 }, // Ngày đến
      { wch: 18 }, // Số/Ký hiệu
      { wch: 14 }, // Ngày ban hành
      { wch: 16 }, // Loại văn bản
      { wch: 28 }, // Cơ quan ban hành
      { wch: 45 }, // Trích yếu
      { wch: 25 }, // Cán bộ tiếp nhận
      { wch: 30 }, // Người giao xử lý
      { wch: 14 }, // Hạn xử lý
      { wch: 14 }  // Trạng thái
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'VanBanDen');

    const filenameYear = selectedYear === 'all' ? 'tat-ca' : selectedYear;
    const fileName = `Tong-hop-van-ban-den-${filenameYear}-${dateStrForFile}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  const handleOpenAdd = () => {
    setEditingDoc(null);
    const nextNum = peekNextIncomingDocNumber();
    setExpectedNumberDisplay(`${nextNum.display} (Dự kiến)`);

    // Default Receiver: current logged in user from active personnel list
    const currentReceiverObj = activePersonnel.find(
      p => p.fullName.toLowerCase() === (currentUser.name || '').toLowerCase()
    );
    const receiverNameVal = currentReceiverObj
      ? `${currentReceiverObj.fullName} (${currentReceiverObj.position || 'Cán bộ tiếp nhận'})`
      : currentUser.name || 'Cán bộ tiếp nhận';
    const receiverIdVal = currentReceiverObj?.id || '';

    // Load user accounts from UserAccountRepository
    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);
    const eligible = accounts.filter(u => checkUserIsEligibleAssigner(u));

    // Prefer Battalion Commander (Tiểu đoàn trưởng)
    let selectedAssigner = eligible.find(u => {
      const details = extractUserRankAndPosition(u);
      return details.position.toLowerCase().includes('tiểu đoàn trưởng');
    }) || eligible[0] || null;

    let assignerIdVal = '';
    let assignerNameVal = '';
    let assignerRankVal = '';
    let assignerPosVal = '';
    let assignerRoleVal = '';
    let assignerEmailVal = '';
    let assignerSearchVal = '';

    if (selectedAssigner) {
      const details = extractUserRankAndPosition(selectedAssigner);
      assignerIdVal = selectedAssigner.id;
      assignerNameVal = selectedAssigner.name;
      assignerRankVal = details.rank;
      assignerPosVal = details.position;
      assignerRoleVal = selectedAssigner.roleLabel || details.position;
      assignerEmailVal = selectedAssigner.email;
      assignerSearchVal = `${selectedAssigner.name} - ${details.rank} (${details.position})`;
    }

    setFormData({
      incomingNumberSeq: undefined,
      incomingNumberDisplay: '',
      incomingNumber: '',
      incomingDate: formatDateForInput(new Date()),
      code: '',
      issueDate: formatDateForInput(new Date()),
      issuerCode: 'ENGINEER_CORPS',
      issuer: 'Binh chủng Công binh',
      title: '',
      category: 'Công văn',
      securityLevel: 'thuong',
      receiverId: receiverIdVal,
      receiverName: receiverNameVal,
      assignerUserId: assignerIdVal,
      assignerPersonId: '',
      assignerNameSnapshot: assignerNameVal,
      assignerRankSnapshot: assignerRankVal,
      assignerPositionSnapshot: assignerPosVal,
      assignerRoleSnapshot: assignerRoleVal,
      assignerEmailSnapshot: assignerEmailVal,
      leaderId: assignerIdVal,
      leaderName: assignerNameVal,
      directiveOpinion: 'Chuyển Phòng/Ban chuyên môn nghiên cứu, xử lý theo thẩm quyền.',
      driveUrl: '',
      attachments: [],
      notes: ''
    });

    setReceiverSearch(receiverNameVal);
    setLeaderSearch(assignerSearchVal);
    setShowIssuerDropdown(false);
    setUploadError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    const currentNumDisplay = doc.incomingNumberDisplay || doc.incomingNumber || '';
    setExpectedNumberDisplay(currentNumDisplay);

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);

    // Identify agency
    const agencyCode = doc.issuingAgencyCode || doc.issuerCode || 'OTHER';
    const agencyLabel = doc.issuingAgencyName || doc.issuer || 'Binh chủng Công binh';

    // Identify assigner
    const assignerId = doc.assignerUserId || doc.leaderId || '';
    const matchedAccount = accounts.find(u => u.id === assignerId);

    let assignerNameVal = doc.assignerNameSnapshot || doc.leaderName || doc.assignedProcessor || '';
    let assignerRankVal = doc.assignerRankSnapshot || doc.assigningPersonRank || '';
    let assignerPosVal = doc.assignerPositionSnapshot || doc.assigningPersonTitle || '';
    let assignerRoleVal = doc.assignerRoleSnapshot || '';
    let assignerEmailVal = doc.assignerEmailSnapshot || '';

    if (matchedAccount) {
      const details = extractUserRankAndPosition(matchedAccount);
      assignerNameVal = matchedAccount.name;
      assignerRankVal = details.rank;
      assignerPosVal = details.position;
      assignerRoleVal = matchedAccount.roleLabel || details.position;
      assignerEmailVal = matchedAccount.email;
    }

    const leaderSearchVal = assignerNameVal
      ? `${assignerNameVal} - ${assignerRankVal} (${assignerPosVal})`
      : '';

    setFormData({
      incomingNumberSeq: doc.incomingNumberSeq,
      incomingNumberDisplay: currentNumDisplay,
      incomingNumber: currentNumDisplay,
      incomingDate: doc.incomingDate || formatDateForInput(new Date()),
      code: doc.code || '',
      issueDate: doc.issueDate || formatDateForInput(new Date()),
      issuerCode: agencyCode,
      issuer: agencyLabel,
      title: doc.title || '',
      category: doc.category || 'Công văn',
      securityLevel: doc.securityLevel || 'thuong',
      receiverId: doc.receiverId || '',
      receiverName: doc.receiverName || doc.receiver || currentUser.name,
      assignerUserId: assignerId,
      assignerPersonId: doc.assignerPersonId || '',
      assignerNameSnapshot: assignerNameVal,
      assignerRankSnapshot: assignerRankVal,
      assignerPositionSnapshot: assignerPosVal,
      assignerRoleSnapshot: assignerRoleVal,
      assignerEmailSnapshot: assignerEmailVal,
      leaderId: assignerId,
      leaderName: assignerNameVal,
      directiveOpinion: doc.directiveOpinion || '',
      driveUrl: doc.driveUrl || '',
      attachments: doc.attachments || [],
      notes: doc.notes || ''
    });

    setReceiverSearch(doc.receiverName || doc.receiver || currentUser.name);
    setLeaderSearch(leaderSearchVal);
    setShowIssuerDropdown(false);
    setUploadError(null);
    setShowAddModal(true);
  };

  // Handle Counter Reset by Admin
  const handleConfirmResetCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetReason.trim()) {
      alert('Vui lòng nhập lý do reset số đến!');
      return;
    }

    const res = resetIncomingDocCounter(resetReason.trim(), currentUser);
    const nextNum = peekNextIncomingDocNumber();
    setExpectedNumberDisplay(`${nextNum.display} (Dự kiến)`);
    setResetSuccessMessage(`Đã reset thành công counter số đến từ ${res.oldValue} về 00. Văn bản tạo tiếp theo sẽ nhận số ${nextNum.display}.`);
    setResetHistory(getIncomingDocCounterResetHistory());
    setShowResetModal(false);
    setResetReason('');

    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 8000);
  };

  // Handle File Upload
  const handleFilesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    setIsUploading(true);

    const newAttachments: DocumentAttachment[] = [];
    let fileError: string | null = null;

    Array.from(files).forEach((file: File) => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(ext)) {
        fileError = `Tệp "${file.name}" không đúng định dạng! Chỉ chấp nhận PDF, DOC, DOCX.`;
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        fileError = `Tệp "${file.name}" vượt quá dung lượng cho phép (tối đa 25MB)!`;
        return;
      }

      const fileUrl = URL.createObjectURL(file);
      newAttachments.push({
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext === '.pdf' ? 'pdf' : ext === '.docx' ? 'docx' : 'doc',
        fileUrl: fileUrl,
        uploadedAt: new Date().toISOString()
      });
    });

    setTimeout(() => {
      setIsUploading(false);
      if (fileError) {
        setUploadError(fileError);
      }
      if (newAttachments.length > 0) {
        setFormData(prev => ({
          ...prev,
          attachments: [...prev.attachments, ...newAttachments],
          driveUrl: prev.driveUrl || newAttachments[0].fileUrl
        }));
      }
    }, 300);
  };

  const handleRemoveAttachment = (attId: string) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(a => a.id !== attId)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.code.trim() || !formData.title.trim()) {
      alert('Vui lòng nhập đầy đủ Số/ký hiệu và Trích yếu văn bản!');
      return;
    }

    if (!formData.receiverName.trim()) {
      alert('Vui lòng chọn hoặc nhập Người tiếp nhận!');
      return;
    }

    // Validate using centralized rules
    const accountsForValidation = userAccounts.length > 0 ? userAccounts : UserAccountRepository.getAll();
    const saveCheck = validateIncomingDocumentSave(
      {
        issuer: formData.issuer,
        issuerCode: formData.issuerCode,
        assignerUserId: formData.assignerUserId,
        leaderId: formData.leaderId
      },
      accountsForValidation
    );

    if (!saveCheck.isValid) {
      alert(saveCheck.errorMsg || 'Dữ liệu lưu không hợp lệ!');
      return;
    }

    const agencyName = saveCheck.validAgencyName || formData.issuer.trim().replace(/\s+/g, ' ');
    const agencyCode = saveCheck.validAgencyCode || 'OTHER';
    const matchedAssigner = saveCheck.validAssignerUser!;
    const assignerDetails = extractUserRankAndPosition(matchedAssigner);

    // Assign / Keep Incoming Number
    let numSeq = formData.incomingNumberSeq;
    let numDisplay = formData.incomingNumberDisplay;

    if (!editingDoc) {
      // Auto assign sequential number N+1
      const generated = getAndIncrementIncomingDocNumber();
      numSeq = generated.num;
      numDisplay = generated.display;
    }

    const firstScanUrl = formData.attachments.length > 0 
      ? formData.attachments[0].fileUrl 
      : (formData.driveUrl || 'https://drive.google.com');

    const selectedReceiver = activePersonnel.find(p => p.id === formData.receiverId);

    const docToSave: DocumentRecord = {
      id: editingDoc ? editingDoc.id : `doc-in-${Date.now()}`,
      type: formData.category === 'Thông báo thẩm định' ? 'thong_bao_tham_dinh' : 'vanban_den',
      code: formData.code.trim(),
      title: formData.title.trim(),
      category: formData.category || 'Công văn',
      incomingNumberSeq: numSeq,
      incomingNumberDisplay: numDisplay,
      incomingNumber: numDisplay,
      incomingDate: formData.incomingDate || formatDateForInput(new Date()),
      issueDate: formData.issueDate || formatDateForInput(new Date()),
      
      // Issuing Agency
      issuingAgencyName: agencyName,
      issuingAgencyCode: agencyCode,
      issuerCode: agencyCode,
      issuer: agencyName,

      securityLevel: formData.securityLevel,
      receiverId: formData.receiverId,
      receiverName: formData.receiverName,
      receiverRank: selectedReceiver?.rankTitle || editingDoc?.receiverRank,
      receiverPosition: selectedReceiver?.position || editingDoc?.receiverPosition,
      receiverUnit: selectedReceiver?.unit || editingDoc?.receiverUnit,
      receiver: formData.receiverName,

      // Assigner user snapshots
      assignerUserId: matchedAssigner.id,
      assignerPersonId: (matchedAssigner as any).personnelId || '',
      assignerNameSnapshot: matchedAssigner.name,
      assignerRankSnapshot: assignerDetails.rank,
      assignerPositionSnapshot: assignerDetails.position,
      assignerRoleSnapshot: matchedAssigner.roleLabel || assignerDetails.position,
      assignerEmailSnapshot: matchedAssigner.email,

      // Backward compatibility fields
      leaderId: matchedAssigner.id,
      leaderName: matchedAssigner.name,
      assigningPersonRank: assignerDetails.rank,
      assigningPersonTitle: assignerDetails.position,
      assignedProcessor: matchedAssigner.name,

      directiveOpinion: formData.directiveOpinion,
      attachments: formData.attachments,
      driveUrl: formData.driveUrl || firstScanUrl,
      scanFileUrl: firstScanUrl,
      notes: formData.notes,
      uploader: currentUser.name,
      uploadDate: formatDateForInput(new Date()),
      status: editingDoc ? editingDoc.status : 'moi_tiep_nhan'
    };

    onSaveDoc(docToSave);
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Toast alert message for reset success */}
      {resetSuccessMessage && (
        <div className="p-4 bg-emerald-950/90 border border-emerald-700/80 rounded-2xl text-emerald-200 text-sm flex items-center justify-between shadow-xl animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{resetSuccessMessage}</span>
          </div>
          <button
            onClick={() => setResetSuccessMessage(null)}
            className="p-1 hover:bg-emerald-900/60 rounded-lg text-emerald-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search, Filter & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-wrap flex-1 items-center gap-3">
          {/* Year Selector */}
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-400">Năm:</span>
            <select
              value={selectedYear}
              onChange={e => setSelectedYear(e.target.value)}
              className="bg-transparent text-xs font-bold text-sky-300 focus:outline-none cursor-pointer"
            >
              {availableYears.map(yr => (
                <option key={yr} value={yr} className="bg-slate-900 text-slate-200">
                  Năm {yr}
                </option>
              ))}
              <option value="all" className="bg-slate-900 text-slate-200">
                Tất cả các năm
              </option>
            </select>
          </div>

          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px] max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo số đến, trích yếu, cơ quan ban hành..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Toggle Stats Panel Button */}
          <button
            type="button"
            onClick={() => setShowStatsPanel(prev => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border ${
              showStatsPanel
                ? 'bg-sky-950/80 border-sky-800 text-sky-300'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-sky-400" />
            <span>{showStatsPanel ? 'Ẩn thống kê' : 'Xem thống kê'}</span>
          </button>

          {/* Export Filtered Data to Excel Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-3 py-2 bg-emerald-950/90 border border-emerald-800 hover:bg-emerald-900/90 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md"
            title="Xuất dữ liệu đã lọc ra file Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Xuất Excel (.xlsx)</span>
          </button>

          {/* Admin Reset Counter Button */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => { setResetReason(''); setShowResetModal(true); }}
                className="px-3 py-2 bg-rose-950/80 border border-rose-800/80 hover:bg-rose-900/90 text-rose-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                title="Reset counter số đến về 00 (Chỉ dành cho Quản trị viên)"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset số đến</span>
              </button>

              {resetHistory.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowResetHistoryModal(true)}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all"
                  title="Xem lịch sử các lần reset số đến"
                >
                  <History className="w-3.5 h-3.5 text-slate-400" />
                  <span>Lịch sử reset</span>
                </button>
              )}
            </div>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-sky-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            Tiếp Nhận Văn Bản Đến Mới
          </button>
        </div>
      </div>

      {/* Annual Statistics Panel */}
      {showStatsPanel && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
          {/* Card 1: Total Docs */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Tổng Số Văn Bản Đến</span>
              <span className="px-2 py-0.5 bg-sky-950 text-sky-400 rounded-full border border-sky-800/80 text-[10px]">
                {selectedYear === 'all' ? 'Tất cả năm' : `Năm ${selectedYear}`}
              </span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-slate-100 font-mono">{totalDocsCount}</span>
              <span className="text-xs text-slate-400">văn bản</span>
            </div>
          </div>

          {/* Card 2: Processed Docs */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
              <span>Số Văn Bản Đã Xử Lý</span>
              <span className="text-emerald-400 font-bold">{processedPercent}%</span>
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-2xl font-bold text-emerald-400 font-mono">{processedDocsCount}</span>
              <span className="text-xs text-slate-400">/ {totalDocsCount} đã xử lý</span>
            </div>
            <div className="mt-2 w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${processedPercent}%` }}
              />
            </div>
          </div>

          {/* Card 3: Top Agencies */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col shadow-lg">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Cơ Quan Ban Hành</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
              {agencyStatsList.length === 0 ? (
                <span className="text-slate-500 italic">Không có dữ liệu</span>
              ) : (
                agencyStatsList.slice(0, 4).map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
                    <span className="text-slate-300 truncate max-w-[130px]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-amber-400 font-bold font-mono">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Card 4: Top Assignees */}
          <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl flex flex-col shadow-lg">
            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold mb-2">
              <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>Cán Bộ / Đơn Vị Phụ Trách</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
              {leaderStatsList.length === 0 ? (
                <span className="text-slate-500 italic">Không có dữ liệu</span>
              ) : (
                leaderStatsList.slice(0, 4).map(item => (
                  <div key={item.name} className="flex items-center justify-between text-[11px] bg-slate-950 px-2 py-1 rounded-lg border border-slate-850">
                    <span className="text-slate-300 truncate max-w-[130px]" title={item.name}>
                      {item.name}
                    </span>
                    <span className="text-indigo-400 font-bold font-mono">{item.count}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Incoming Docs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 w-12 text-center">STT</th>
                <th className="py-4 px-4 w-32">Số Đến / Ngày</th>
                <th className="py-4 px-4 w-36">Số, Ký Hiệu</th>
                <th className="py-4 px-4">Trích Yếu Nội Dung & Cơ Quan Ban Hành</th>
                <th className="py-4 px-4 w-52">Người Tiếp Nhận & Giao Xử Lý</th>
                <th className="py-4 px-4 w-28 text-center">Đính Kèm</th>
                <th className="py-4 px-4 w-36 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incomingDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <p className="text-sm">Chưa có văn bản đến nào phù hợp với bộ lọc tìm kiếm.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                incomingDocs.map((doc, idx) => {
                  const numDisplay = doc.incomingNumberDisplay || doc.incomingNumber || '--';
                  const receiver = doc.receiverName || doc.receiver || '--';
                  const leader = doc.leaderName || doc.assignedProcessor || '--';
                  const attCount = doc.attachments ? doc.attachments.length : (doc.driveUrl ? 1 : 0);

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <div
                          className="inline-block px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 font-mono font-bold text-amber-400 text-xs shadow-sm cursor-help"
                          title="Số đến được hệ thống tự động cấp"
                        >
                          {numDisplay}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {formatDateVN(doc.incomingDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono font-semibold text-slate-100">
                        {doc.code}
                        <div className="text-[11px] text-slate-400 mt-0.5 font-sans font-normal">
                          {doc.category}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs md:max-w-md">
                        <div className="font-medium text-slate-100 leading-snug line-clamp-2">
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span>{doc.issuer}</span>
                          <span className="text-slate-600">•</span>
                          <span>{formatDateVN(doc.issueDate)}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-200">
                          <span className="text-slate-500">Tiếp nhận:</span>{' '}
                          <strong className="text-sky-300 font-medium">{receiver}</strong>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          <span className="text-slate-500">Giao xử lý:</span>{' '}
                          <span className="text-amber-300 font-medium">{leader}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {attCount > 0 ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60">
                            <Paperclip className="w-3 h-3" />
                            {attCount} tệp
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600">Không</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setPdfViewerDoc({ title: `[${doc.code}] ${doc.title}`, url: doc.driveUrl || doc.scanFileUrl || '' })}
                          title="Xem tệp scan đính kèm"
                          className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-400 hover:text-red-300 border border-red-800/60 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onOpenWorkflow(doc)}
                          title="Luồng xử lý & Lịch sử"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onCreateReplyDoc(doc)}
                          title="Tạo văn bản trả lời"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          title="Xem chi tiết"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(doc)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reset Counter Confirmation Modal (Admin Only) */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-rose-950/80 bg-rose-950/40 flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-200 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                Reset Counter Số Đến Văn Bản (Admin)
              </h3>
              <button
                onClick={() => setShowResetModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResetCounter} className="p-5 space-y-4 text-sm">
              <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-200 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-rose-300 font-bold uppercase tracking-wider mb-1">
                      CẢNH BÁO THAO TÁC QUẢN TRỊ
                    </strong>
                    <p className="leading-relaxed">
                      Thao tác này sẽ đặt lại giá trị đếm số đến về <strong>00</strong>. Văn bản đến tạo tiếp theo sẽ nhận <strong>01/ĐẾN</strong>.
                    </p>
                    <p className="text-rose-300/80 mt-1 italic">
                      * Các văn bản đến đã đăng ký trước đó vẫn giữ nguyên số đến đã cấp.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex justify-around text-xs font-mono">
                <div className="text-center">
                  <span className="text-slate-500 block text-[10px]">Số đến dự kiến tiếp theo hiện tại:</span>
                  <span className="text-amber-400 font-bold text-sm">{peekNextIncomingDocNumber().display}</span>
                </div>
                <div className="border-r border-slate-800 h-8 my-auto" />
                <div className="text-center">
                  <span className="text-slate-500 block text-[10px]">Sau khi reset về 00:</span>
                  <span className="text-emerald-400 font-bold text-sm">01/ĐẾN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lý do reset số đến <span className="text-rose-400">* (Bắt buộc)</span>
                </label>
                <textarea
                  rows={3}
                  value={resetReason}
                  onChange={e => setResetReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết (VD: Chuyển giao sổ văn bản năm mới 2027, bắt đầu kỳ theo dõi mới...)"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!resetReason.trim()}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-600/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Xác nhận Reset số đến
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset History Log Modal */}
      {showResetHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Lịch Sử Reset Counter Số Đến
              </h3>
              <button
                onClick={() => setShowResetHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              {resetHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Chưa có lượt reset số đến nào trong hệ thống.
                </div>
              ) : (
                resetHistory.map((item, i) => (
                  <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-slate-300 font-semibold">
                      <span className="text-sky-300">{item.performerName || item.performer}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{formatDateVN(item.timestamp)}</span>
                    </div>
                    <div className="text-slate-400">
                      Giá trị cũ trước reset: <span className="font-mono text-amber-400 font-bold">{item.oldCounterValue}</span> ➔ Mới: <span className="font-mono text-emerald-400 font-bold">00</span>
                    </div>
                    <div className="text-slate-300 italic pt-1 border-t border-slate-900 mt-1">
                      "Lý do: {item.reason}"
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 text-right">
              <button
                onClick={() => setShowResetHistoryModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal: Tiếp nhận / Cập nhật Văn bản Đến */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-sky-400" />
                  {editingDoc ? 'Cập Nhật Hồ Sơ Văn Bản Đến' : 'Tiếp Nhận Văn Bản Đến Mới'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đăng ký văn bản đến, gán số tự động N+1, thiết lập phân công xử lý và lưu tệp hồ sơ đính kèm.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
              {/* Row 1: Số đến (Readonly auto), Ngày đến, Loại văn bản */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 1. Số đến - Auto Assigned Readonly */}
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <span>Số đến</span>
                      <span className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/60 px-1.5 py-0.5 rounded font-mono">
                        Readonly
                      </span>
                    </span>
                    <span className="text-[10px] text-slate-400">Tự động cấp N+1</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      readOnly
                      title="Số đến được hệ thống tự động cấp"
                      value={editingDoc ? (formData.incomingNumberDisplay || formData.incomingNumber) : expectedNumberDisplay}
                      className="w-full bg-slate-900 border border-slate-700/80 text-amber-300 font-mono font-bold text-sm rounded-lg px-3 py-2 cursor-not-allowed opacity-90 shadow-inner"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Số đến được hệ thống tự động cấp. Không được chỉnh sửa số đến khi lưu hoặc cập nhật.</span>
                  </p>
                </div>

                {/* 2. Ngày đến */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ngày đến <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.incomingDate}
                    onChange={e => setFormData({ ...formData, incomingDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                {/* 3. Loại văn bản (Strictly exclude Thông báo thẩm định) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Loại văn bản <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Công văn">Công văn</option>
                    <option value="Quyết định">Quyết định</option>
                    <option value="Chỉ thị">Chỉ thị</option>
                    <option value="Tờ trình">Tờ trình</option>
                    <option value="Báo cáo">Báo cáo</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                    <option value="Kế hoạch">Kế hoạch</option>
                    <option value="Khác">Khác</option>
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    * Thông báo thẩm định thuộc riêng Phân hệ 5.5.
                  </p>
                </div>
              </div>

              {/* Row 2: Số/Ký hiệu, Ngày ban hành, Cơ quan ban hành (Combobox) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Số, ký hiệu */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số, ký hiệu văn bản <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                    placeholder="VD: 158/CV-BQP"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                {/* Ngày ban hành */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ngày ban hành <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.issueDate}
                    onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                {/* Cơ quan ban hành (Combobox: Chọn gợi ý hoặc nhập tự do) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cơ quan ban hành <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.issuer || ''}
                      onChange={e => {
                        const val = e.target.value;
                        let code: 'ENGINEER_CORPS' | 'MINISTRY_OF_NATIONAL_DEFENSE' | 'OTHER' = 'OTHER';
                        const cleanLower = val.trim().toLowerCase();
                        if (cleanLower === 'binh chủng công binh') {
                          code = 'ENGINEER_CORPS';
                        } else if (cleanLower === 'bộ quốc phòng') {
                          code = 'MINISTRY_OF_NATIONAL_DEFENSE';
                        }
                        setFormData(prev => ({
                          ...prev,
                          issuer: val,
                          issuerCode: code
                        }));
                        setShowIssuerDropdown(true);
                      }}
                      onFocus={() => setShowIssuerDropdown(true)}
                      placeholder="Chọn hoặc nhập tên cơ quan ban hành..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-100 font-medium focus:outline-none focus:border-sky-500"
                      maxLength={255}
                      required
                    />
                    <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showIssuerDropdown && (
                    <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-h-48 overflow-y-auto">
                      {INCOMING_DOCUMENT_ISSUING_AGENCIES.filter(agency => {
                        if (!formData.issuer || !formData.issuer.trim()) return true;
                        return agency.label.toLowerCase().includes(formData.issuer.trim().toLowerCase());
                      }).map(agency => (
                        <button
                          key={agency.code}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              issuerCode: agency.code,
                              issuer: agency.label
                            }));
                            setShowIssuerDropdown(false);
                          }}
                          className={`w-full text-left px-3.5 py-2.5 text-xs border-b border-slate-900 last:border-0 flex items-center justify-between transition-colors ${
                            formData.issuerCode === agency.code || formData.issuer === agency.label
                              ? 'bg-sky-900/50 text-sky-200 font-bold'
                              : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                          }`}
                        >
                          <span>{agency.label}</span>
                          {(formData.issuerCode === agency.code || formData.issuer === agency.label) && (
                            <Check className="w-3.5 h-3.5 text-sky-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Row 3: Trích yếu nội dung */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Trích yếu nội dung <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Nhập trích yếu tóm tắt nội dung chính của văn bản đến..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {/* Row 4: Người tiếp nhận & Người giao xử lý & Độ mật */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Người tiếp nhận - Searchable select from Personnel */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Người tiếp nhận <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={receiverSearch}
                      onChange={e => {
                        setReceiverSearch(e.target.value);
                        setFormData({ ...formData, receiverName: e.target.value });
                        setShowReceiverDropdown(true);
                      }}
                      onFocus={() => setShowReceiverDropdown(true)}
                      placeholder="Tìm theo tên cán bộ tiếp nhận..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      required
                    />
                    <User className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showReceiverDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                      {filteredReceivers.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">Không tìm thấy cán bộ</div>
                      ) : (
                        filteredReceivers.map(p => {
                          const nameDisplay = `${p.fullName} (${p.position || 'Cán bộ'})`;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  receiverId: p.id,
                                  receiverName: nameDisplay
                                });
                                setReceiverSearch(nameDisplay);
                                setShowReceiverDropdown(false);
                              }}
                              className="w-full text-left p-2.5 hover:bg-sky-900/40 border-b border-slate-900 last:border-0 transition-colors"
                            >
                              <div className="text-xs font-semibold text-slate-200">{p.fullName}</div>
                              <div className="text-[11px] text-slate-400">
                                {p.position || p.rankTitle || 'Cán bộ'} • {p.unit || 'Tiểu đoàn 93'}
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Người giao xử lý (Chỉ huy Tiểu đoàn) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Người giao xử lý (Lãnh đạo)</span>
                      <span className="text-rose-400">*</span>
                    </span>
                    <span
                      title={`Hệ thống hiển thị danh sách tài khoản thuộc nhóm ${INCOMING_DOCUMENT_ASSIGNER_GROUP_LABEL}`}
                      className="text-[10px] text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded font-medium"
                    >
                      {INCOMING_DOCUMENT_ASSIGNER_GROUP_LABEL}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={leaderSearch}
                      onChange={e => {
                        setLeaderSearch(e.target.value);
                        setShowLeaderDropdown(true);
                      }}
                      onFocus={() => setShowLeaderDropdown(true)}
                      aria-label="Chọn Người giao xử lý thuộc nhóm Chỉ huy Tiểu đoàn"
                      placeholder="Chọn hoặc tìm kiếm Chỉ huy Tiểu đoàn..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-amber-300 font-semibold focus:outline-none focus:border-sky-500"
                      required
                    />
                    <UserCheck className="w-4 h-4 text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showLeaderDropdown && (
                    <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-800/80">
                      {filteredEligibleAssigners.length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 text-center font-medium">
                          Chưa có tài khoản Chỉ huy Tiểu đoàn đủ quyền giao xử lý
                        </div>
                      ) : (
                        filteredEligibleAssigners.map(u => {
                          const details = extractUserRankAndPosition(u);
                          const isSelected = formData.assignerUserId === u.id || formData.leaderId === u.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  assignerUserId: u.id,
                                  assignerPersonId: (u as any).personnelId || '',
                                  assignerNameSnapshot: u.name,
                                  assignerRankSnapshot: details.rank,
                                  assignerPositionSnapshot: details.position,
                                  assignerRoleSnapshot: details.position,
                                  assignerEmailSnapshot: u.email,
                                  leaderId: u.id,
                                  leaderName: u.name
                                });
                                setLeaderSearch(`${u.name} - ${details.rank} (${details.position})`);
                                setShowLeaderDropdown(false);
                              }}
                              className={`w-full text-left p-3 transition-colors flex items-start justify-between ${
                                isSelected
                                  ? 'bg-amber-950/60 text-amber-200'
                                  : 'hover:bg-amber-950/30 text-slate-200'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-amber-300 flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
                                </div>
                                <div className="text-[11px] text-slate-300 font-medium">
                                  {details.rank ? `${details.rank} · ` : ''}{details.position}
                                </div>
                                <div className="text-[10px] text-slate-400">
                                  {details.unit}
                                </div>
                                {u.email && (
                                  <div className="text-[10px] text-slate-500 font-mono">
                                    {u.email}
                                  </div>
                                )}
                              </div>
                              <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 border border-amber-800/80 px-2 py-0.5 rounded shrink-0">
                                {details.position}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Độ mật */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Độ mật</label>
                  <select
                    value={formData.securityLevel}
                    onChange={e => setFormData({ ...formData, securityLevel: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                  >
                    <option value="thuong">Thường</option>
                    <option value="mat">Mật</option>
                    <option value="toi_mat">Tối mật</option>
                    <option value="tuyet_mat">Tuyệt mật</option>
                  </select>
                </div>
              </div>

              {/* Row 5: Ý kiến chỉ đạo */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ý kiến chỉ đạo của Lãnh đạo</label>
                <textarea
                  rows={2}
                  value={formData.directiveOpinion}
                  onChange={e => setFormData({ ...formData, directiveOpinion: e.target.value })}
                  placeholder="Nhập ý kiến chỉ đạo, phân công nhiệm vụ cụ thể..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Row 6: Tệp đính kèm (PDF, DOC, DOCX) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-4 h-4" />
                    Tệp Đính Kèm Văn Bản (PDF, DOC, DOCX)
                  </label>
                  <span className="text-[11px] text-slate-500">Tối đa 25MB mỗi tệp</span>
                </div>

                {/* File Upload Control */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">1. Tải tệp trực tiếp từ máy tính:</label>
                    <label className="flex items-center justify-center gap-2 w-full p-2.5 bg-slate-900 border border-dashed border-slate-700 hover:border-sky-500 rounded-xl cursor-pointer transition-colors text-xs text-slate-300 font-medium">
                      <Upload className="w-4 h-4 text-sky-400" />
                      <span>{isUploading ? 'Đang tải tệp lên...' : 'Chọn tệp PDF, DOC, DOCX'}</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        multiple
                        onChange={handleFilesUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">2. Hoặc Nhập URL Google Drive / Server:</label>
                    <input
                      type="url"
                      value={formData.driveUrl}
                      onChange={e => setFormData({ ...formData, driveUrl: e.target.value })}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Upload Error Banner */}
                {uploadError && (
                  <div className="p-2.5 bg-rose-950/80 border border-rose-800/80 rounded-lg text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {/* List of Attached Files */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-slate-400">
                      Danh sách tệp đính kèm ({formData.attachments.length}):
                    </div>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto">
                      {formData.attachments.map(att => (
                        <div
                          key={att.id}
                          className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <File className={`w-4 h-4 shrink-0 ${att.fileType === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                            <span className="font-medium text-slate-200 truncate">{att.fileName}</span>
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono uppercase text-slate-400">
                              {att.fileType}
                            </span>
                            <span className="text-[11px] text-slate-500 font-mono">
                              ({formatFileSize(att.fileSize)})
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {att.fileType === 'pdf' && (
                              <button
                                type="button"
                                onClick={() => setPdfViewerDoc({ title: att.fileName, url: att.fileUrl })}
                                className="px-2 py-1 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-[11px] font-medium"
                              >
                                Xem
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded transition-colors"
                              title="Xóa tệp đính kèm"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-sky-600/30 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  {editingDoc ? 'Lưu Thay Đổi' : 'Lưu & Cấp Số Đến'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Detail Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                <Eye className="w-5 h-5 text-sky-400" />
                Chi Tiết Văn Bản Đến
              </h3>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-xs text-slate-500 block">Số đến chính thức:</span>
                  <span className="font-mono text-amber-400 font-bold text-base">
                    {previewDoc.incomingNumberDisplay || previewDoc.incomingNumber || '--'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Ngày đến:</span>
                  <span className="font-mono text-slate-200">{formatDateVN(previewDoc.incomingDate)}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Số, Ký hiệu văn bản:</span>
                  <span className="font-mono text-slate-100 font-bold">{previewDoc.code}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Ngày ban hành:</span>
                  <span className="font-mono text-slate-200">{formatDateVN(previewDoc.issueDate)}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-slate-500 block">Trích yếu nội dung:</span>
                <p className="text-slate-100 font-semibold text-base mt-1 leading-normal">{previewDoc.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
                <div>
                  <span className="text-xs text-slate-500 block">Cơ quan ban hành:</span>
                  <span className="text-slate-200 font-medium">{previewDoc.issuer}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Loại văn bản:</span>
                  <span className="text-amber-300 font-medium">{previewDoc.category}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Người tiếp nhận:</span>
                  <span className="text-sky-300 font-medium">{previewDoc.receiverName || previewDoc.receiver || '--'}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Người giao xử lý:</span>
                  <span className="text-emerald-300 font-medium">{previewDoc.leaderName || previewDoc.assignedProcessor || '--'}</span>
                </div>
              </div>

              {previewDoc.directiveOpinion && (
                <div className="bg-amber-950/30 border border-amber-800/40 p-3.5 rounded-xl">
                  <span className="text-xs text-amber-400 font-semibold block mb-1">Ý kiến chỉ đạo:</span>
                  <p className="text-xs text-slate-200 italic leading-relaxed">{previewDoc.directiveOpinion}</p>
                </div>
              )}

              {/* Attachments list in preview */}
              {previewDoc.attachments && previewDoc.attachments.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-slate-800">
                  <span className="text-xs text-slate-400 font-semibold block">Tệp đính kèm:</span>
                  <div className="space-y-1.5">
                    {previewDoc.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <File className={`w-4 h-4 shrink-0 ${att.fileType === 'pdf' ? 'text-red-400' : 'text-blue-400'}`} />
                          <span className="text-slate-200 truncate">{att.fileName}</span>
                          <span className="text-slate-500 font-mono">({formatFileSize(att.fileSize)})</span>
                        </div>
                        {att.fileType === 'pdf' && (
                          <button
                            onClick={() => setPdfViewerDoc({ title: att.fileName, url: att.fileUrl })}
                            className="px-2.5 py-1 bg-red-950 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-xs font-semibold"
                          >
                            Xem PDF
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setPdfViewerDoc({ title: `[${previewDoc.code}] ${previewDoc.title}`, url: previewDoc.driveUrl || previewDoc.scanFileUrl || '' });
                    }}
                    className="px-4 py-2 bg-red-900/80 hover:bg-red-800 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-900/30"
                  >
                    <FileText className="w-4 h-4" /> Xem PDF Trực Tiếp
                  </button>
                  {previewDoc.driveUrl && (
                    <a
                      href={previewDoc.driveUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl text-xs font-medium flex items-center gap-1.5"
                    >
                      <ExternalLink className="w-4 h-4" /> Mở Tab Mới
                    </a>
                  )}
                </div>
                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Direct Viewer Modal */}
      {pdfViewerDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-red-400 shrink-0" />
                <h3 className="font-bold text-slate-100 text-sm md:text-base truncate">
                  {pdfViewerDoc.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {pdfViewerDoc.url && (
                  <a
                    href={pdfViewerDoc.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Mở tab mới
                  </a>
                )}
                <button
                  onClick={() => setPdfViewerDoc(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex flex-col relative overflow-hidden">
              {pdfViewerDoc.url ? (
                <iframe
                  src={getEmbedPdfUrl(pdfViewerDoc.url)}
                  className="w-full h-full rounded-xl border border-slate-800 bg-slate-900"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm">Văn bản này chưa có liên kết tệp scan PDF hoặc tệp tải lên.</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400 px-5">
              <span>📌 Trình xem tệp scan văn bản PDF đính kèm</span>
              <button
                onClick={() => setPdfViewerDoc(null)}
                className="px-4 py-1.5 bg-slate-800 text-slate-200 hover:bg-slate-700 rounded-lg text-xs font-medium"
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
