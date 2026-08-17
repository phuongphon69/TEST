import React, { useState, useEffect } from 'react';
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
  UserCheck,
  Upload,
  Trash2,
  Check,
  ChevronDown,
  AlertCircle,
  File,
  Paperclip,
  Download,
  Send,
  User,
  AlertTriangle,
  CheckCircle2,
  UserMinus,
  RotateCcw,
  ShieldAlert,
  History,
  Settings,
  Layers
} from 'lucide-react';
import { DocumentRecord, Personnel, DocumentAttachment, User as UserAccount } from '../../types';
import { formatDateVN, formatDateForInput } from '../../utils/formatters';
import {
  peekNextOutgoingDocNumber,
  getAndIncrementOutgoingDocNumber,
  formatOutgoingDocumentSymbol,
  resetOutgoingDocCounter,
  getOutgoingDocCounterResetHistory,
  logOutgoingDocNumberAdjustment,
  getOutgoingDocAdjustmentHistory,
  checkOutgoingNumberDuplicate
} from '../../utils/storage';
import { getMasterLeaderList, getMasterEmployeeList } from '../../services/masterDataService';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import {
  OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL,
  checkUserIsEligibleSigner,
  extractSignerRankAndPosition,
  validateOutgoingDocumentSave
} from '../../constants/outgoingDocumentConstants';

interface OutgoingDocsTabProps {
  documents: DocumentRecord[];
  currentUser: { name: string; title: string; role?: string };
  onSaveDoc: (doc: DocumentRecord) => void;
  onDeleteDoc: (id: string) => void;
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

export const OutgoingDocsTab: React.FC<OutgoingDocsTabProps> = ({
  documents,
  currentUser,
  onSaveDoc,
  onDeleteDoc
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentRecord | null>(null);
  const [previewDoc, setPreviewDoc] = useState<DocumentRecord | null>(null);
  const [pdfViewerDoc, setPdfViewerDoc] = useState<{ title: string; url: string } | null>(null);

  // Admin Check
  const isAdmin = currentUser.role === 'admin' ||
    (currentUser.title || '').toLowerCase().includes('quản trị') ||
    (currentUser.name || '').toLowerCase().includes('admin');

  // Admin Counter Reset & Adjustment Modals
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetReason, setResetReason] = useState('');
  const [resetNewStartVal, setResetNewStartVal] = useState<number>(0);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [showResetHistoryModal, setShowResetHistoryModal] = useState(false);
  const [resetHistory, setResetHistory] = useState<any[]>([]);

  // Admin Manual Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustingDoc, setAdjustingDoc] = useState<DocumentRecord | null>(null);
  const [adjustBaseSeq, setAdjustBaseSeq] = useState<number>(20);
  const [adjustSuffix, setAdjustSuffix] = useState<string>('');
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [showAdjustHistoryModal, setShowAdjustHistoryModal] = useState(false);
  const [adjustHistory, setAdjustHistory] = useState<any[]>([]);

  // Personnel & Accounts List for Drafter / Signers
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [expectedNumberDisplay, setExpectedNumberDisplay] = useState<string>('');

  // Dropdown search states for modal form
  const [showDrafterDropdown, setShowDrafterDropdown] = useState(false);
  const [drafterSearch, setDrafterSearch] = useState('');

  const [showSignerDropdown, setShowSignerDropdown] = useState(false);
  const [signerSearch, setSignerSearch] = useState('');

  // Validation errors
  const [fieldErrors, setFieldErrors] = useState<{
    draftAuthor?: string;
    signerName?: string;
    title?: string;
    issueDate?: string;
    duplicateNumber?: string;
  }>({});

  // File upload states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    outgoingNumberSeq?: number;
    insertSuffix: string;
    outgoingNumberDisplay: string;
    category: string;
    outgoingCodeSymbol: string;
    issueDate: string;
    title: string;
    draftAuthorId?: string;
    draftAuthor: string;
    draftAuthorRank?: string;
    draftAuthorPosition?: string;
    draftAuthorUnit?: string;
    signerId: string;
    signerName: string;
    signerTitle: string;
    signerRank?: string;
    signerUnit?: string;
    recipientLocation: string;
    securityLevel: 'thuong' | 'mat' | 'toi_mat' | 'tuyet_mat';
    driveUrl: string;
    attachments: DocumentAttachment[];
    notes: string;
  }>({
    outgoingNumberDisplay: '',
    insertSuffix: '',
    category: 'Quyết định',
    outgoingCodeSymbol: '',
    issueDate: formatDateForInput(new Date()),
    title: '',
    draftAuthorId: '',
    draftAuthor: currentUser.name,
    draftAuthorRank: '',
    draftAuthorPosition: '',
    draftAuthorUnit: '',
    signerId: '',
    signerName: '',
    signerTitle: '',
    signerRank: '',
    signerUnit: '',
    recipientLocation: '',
    securityLevel: 'thuong',
    driveUrl: '',
    attachments: [],
    notes: ''
  });

  // Load personnel and user accounts on mount/modal open
  useEffect(() => {
    const allPersonnel = getMasterEmployeeList();
    setPersonnelList(allPersonnel);
    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);
  }, [showAddModal]);

  // Master lists
  const activeEmployees = personnelList.filter(p => p.workStatus !== 'tam_nghi');

  // Filtered Drafters (all active employees)
  const filteredDrafters = activeEmployees.filter(p =>
    p.fullName.toLowerCase().includes(drafterSearch.toLowerCase()) ||
    (p.position && p.position.toLowerCase().includes(drafterSearch.toLowerCase())) ||
    (p.unit && p.unit.toLowerCase().includes(drafterSearch.toLowerCase()))
  );

  // Filtered Signers (only active system user accounts belonging to "Chỉ huy Tiểu đoàn" group)
  const availableAccounts = userAccounts.length > 0 ? userAccounts : UserAccountRepository.getAll();
  const eligibleSigners = availableAccounts.filter(u => checkUserIsEligibleSigner(u));

  const isSelectedSignerDisplay = formData.signerName && signerSearch.includes(formData.signerName);
  const filteredEligibleSigners = eligibleSigners.filter(u => {
    if (!signerSearch.trim() || isSelectedSignerDisplay) return true;
    const q = signerSearch.toLowerCase();
    const details = extractSignerRankAndPosition(u);
    return (
      u.name.toLowerCase().includes(q) ||
      details.rank.toLowerCase().includes(q) ||
      details.position.toLowerCase().includes(q) ||
      (u.email && u.email.toLowerCase().includes(q))
    );
  });

  // Filtered outgoing documents sorted by sequence number and suffix
  const outgoingDocs = documents
    .filter(d => d.dataStatus !== 'da_xoa')
    .filter(d => d.type === 'vanban_di')
    .filter(d => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const codeSym = d.outgoingCodeSymbol || d.code || '';
      const numStr = d.outgoingNumberDisplay || d.outgoingNumber || '';
      const signerStr = d.signerName || d.signer || '';
      const drafterStr = d.draftAuthor || '';
      const recip = d.recipientLocation || '';
      return (
        codeSym.toLowerCase().includes(q) ||
        numStr.toLowerCase().includes(q) ||
        d.title.toLowerCase().includes(q) ||
        signerStr.toLowerCase().includes(q) ||
        drafterStr.toLowerCase().includes(q) ||
        recip.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      const seqA = a.outgoingNumberSeq || 0;
      const seqB = b.outgoingNumberSeq || 0;
      if (seqA !== seqB) return seqB - seqA;
      const sufA = a.insertSuffix || '';
      const sufB = b.insertSuffix || '';
      return sufA.localeCompare(sufB);
    });

  // Calculate live dynamic symbol preview
  const currentNumForSymbol = editingDoc
    ? `${formData.outgoingNumberSeq || 29}${formData.insertSuffix ? formData.insertSuffix.toUpperCase() : ''}`
    : `${peekNextOutgoingDocNumber().num}${formData.insertSuffix ? formData.insertSuffix.toUpperCase() : ''}`;

  const liveCodeSymbol = formatOutgoingDocumentSymbol(currentNumForSymbol, formData.category);

  const handleOpenAdd = () => {
    setEditingDoc(null);
    setFieldErrors({});

    const nextNum = peekNextOutgoingDocNumber();
    setExpectedNumberDisplay(`${nextNum.display} (Dự kiến)`);

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);
    const eligible = accounts.filter(u => checkUserIsEligibleSigner(u));

    // Prefer Battalion Commander ("Tiểu đoàn trưởng") if available among eligible signers
    const selectedSigner = eligible.find(u => {
      const details = extractSignerRankAndPosition(u);
      return details.position.toLowerCase().includes('tiểu đoàn trưởng');
    }) || eligible[0] || null;

    let signerUserIdVal = '';
    let signerNameVal = '';
    let signerTitleVal = '';
    let signerRankVal = '';
    let signerUnitVal = '';
    let signerSearchVal = '';

    if (selectedSigner) {
      const details = extractSignerRankAndPosition(selectedSigner);
      signerUserIdVal = selectedSigner.id;
      signerNameVal = selectedSigner.name;
      signerTitleVal = details.position;
      signerRankVal = details.rank;
      signerUnitVal = details.unit;
      signerSearchVal = `${selectedSigner.name} - ${details.rank} (${details.position})`;
    }

    // Find default Drafter (current user or active employee)
    const currentEmp = activeEmployees.find(p => p.fullName.toLowerCase() === (currentUser.name || '').toLowerCase()) || activeEmployees[0];
    const defaultDrafterId = currentEmp?.id || '';
    const defaultDrafterName = currentEmp ? `${currentEmp.fullName} (${currentEmp.position || 'Cán bộ'})` : currentUser.name;
    const defaultDrafterRank = currentEmp?.rankTitle || currentEmp?.rank || '';
    const defaultDrafterPosition = currentEmp?.position || '';
    const defaultDrafterUnit = currentEmp?.unit || '';

    const initialCategory = 'Quyết định';
    const initialSymbol = formatOutgoingDocumentSymbol(nextNum.num, initialCategory);

    setFormData({
      outgoingNumberSeq: undefined,
      insertSuffix: '',
      outgoingNumberDisplay: '',
      category: initialCategory,
      outgoingCodeSymbol: initialSymbol,
      issueDate: formatDateForInput(new Date()),
      title: '',
      draftAuthorId: defaultDrafterId,
      draftAuthor: defaultDrafterName,
      draftAuthorRank: defaultDrafterRank,
      draftAuthorPosition: defaultDrafterPosition,
      draftAuthorUnit: defaultDrafterUnit,
      signerId: signerUserIdVal,
      signerName: signerNameVal,
      signerTitle: signerTitleVal,
      signerRank: signerRankVal,
      signerUnit: signerUnitVal,
      recipientLocation: 'Cục Báo cáo - Bộ Tham mưu / BQP; Ban QLDA',
      securityLevel: 'thuong',
      driveUrl: '',
      attachments: [],
      notes: ''
    });

    setDrafterSearch(defaultDrafterName);
    setSignerSearch(signerSearchVal);
    setUploadError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (doc: DocumentRecord) => {
    setEditingDoc(doc);
    setFieldErrors({});

    const numDisplay = doc.outgoingNumberDisplay || doc.outgoingNumber || '';
    setExpectedNumberDisplay(numDisplay);

    const docCategory = doc.category || 'Quyết định';
    const currentNum = doc.outgoingNumberSeq || doc.outgoingNumberDisplay || doc.outgoingNumber || '29';
    const docSymbol = doc.outgoingCodeSymbol || doc.code || formatOutgoingDocumentSymbol(currentNum, docCategory);

    const drafterName = doc.draftAuthor || currentUser.name;

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);

    const signerUserId = doc.signerUserId || doc.signerId || '';
    const matchedAccount = accounts.find(u => u.id === signerUserId);

    let signerNameVal = doc.signerName || doc.signer || '';
    let signerTitleVal = doc.signerTitle || '';
    let signerRankVal = doc.signerRank || '';
    let signerUnitVal = doc.signerUnit || '';

    if (matchedAccount) {
      const details = extractSignerRankAndPosition(matchedAccount);
      signerNameVal = matchedAccount.name;
      signerTitleVal = details.position;
      signerRankVal = details.rank;
      signerUnitVal = details.unit;
    }

    const signerSearchVal = signerNameVal
      ? (signerRankVal ? `${signerNameVal} - ${signerRankVal} (${signerTitleVal})` : `${signerNameVal} (${signerTitleVal})`)
      : '';

    setFormData({
      outgoingNumberSeq: doc.outgoingNumberSeq,
      insertSuffix: doc.insertSuffix || '',
      outgoingNumberDisplay: numDisplay,
      category: docCategory,
      outgoingCodeSymbol: docSymbol,
      issueDate: doc.issueDate || formatDateForInput(new Date()),
      title: doc.title || '',
      draftAuthorId: doc.draftAuthorId || '',
      draftAuthor: drafterName,
      draftAuthorRank: doc.draftAuthorRank || '',
      draftAuthorPosition: doc.draftAuthorPosition || '',
      draftAuthorUnit: doc.draftAuthorUnit || '',
      signerId: signerUserId,
      signerName: signerNameVal,
      signerTitle: signerTitleVal,
      signerRank: signerRankVal,
      signerUnit: signerUnitVal,
      recipientLocation: doc.recipientLocation || '',
      securityLevel: doc.securityLevel || 'thuong',
      driveUrl: doc.driveUrl || '',
      attachments: doc.attachments || [],
      notes: doc.notes || ''
    });

    setDrafterSearch(drafterName);
    setSignerSearch(signerSearchVal);
    setUploadError(null);
    setShowAddModal(true);
  };

  // Open Admin Adjust Number Modal for specific doc
  const handleOpenAdjustDoc = (doc: DocumentRecord) => {
    setAdjustingDoc(doc);
    setAdjustBaseSeq(doc.outgoingNumberSeq || 20);
    setAdjustSuffix(doc.insertSuffix || '');
    setAdjustReason('');
    setShowAdjustModal(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingDoc) return;
    if (!adjustReason.trim()) {
      alert('Vui lòng nhập lý do điều chỉnh số văn bản!');
      return;
    }

    const cleanSuffix = adjustSuffix.trim().toUpperCase();
    const newNumDisplay = `${adjustBaseSeq}${cleanSuffix}`;
    const newSymbol = formatOutgoingDocumentSymbol(newNumDisplay, adjustingDoc.category);

    if (checkOutgoingNumberDuplicate(newNumDisplay, newSymbol, adjustingDoc.id)) {
      alert(`Số văn bản "${newNumDisplay}" hoặc ký hiệu "${newSymbol}" đã tồn tại! Vui lòng chọn số khác.`);
      return;
    }

    const updatedDoc: DocumentRecord = {
      ...adjustingDoc,
      outgoingNumberSeq: adjustBaseSeq,
      insertSuffix: cleanSuffix,
      outgoingNumberDisplay: newNumDisplay,
      outgoingNumber: newNumDisplay,
      outgoingCodeSymbol: newSymbol,
      code: newSymbol
    };

    onSaveDoc(updatedDoc);
    logOutgoingDocNumberAdjustment(
      currentUser,
      adjustingDoc.id,
      adjustingDoc.title,
      adjustingDoc.outgoingNumberDisplay || adjustingDoc.outgoingNumber || '',
      newNumDisplay,
      adjustReason.trim()
    );

    setShowAdjustModal(false);
    setAdjustingDoc(null);
  };

  // Confirm Reset Counter (Admin)
  const handleConfirmResetCounter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetReason.trim()) {
      alert('Vui lòng nhập lý do reset số văn bản đi!');
      return;
    }

    const res = resetOutgoingDocCounter(resetNewStartVal, resetReason.trim(), currentUser);
    const nextNum = peekNextOutgoingDocNumber();
    setExpectedNumberDisplay(`${nextNum.display} (Dự kiến)`);
    setResetSuccessMessage(`Đã reset thành công counter số văn bản đi từ ${res.oldValue} về ${resetNewStartVal}. Văn bản tạo tiếp theo sẽ nhận số ${nextNum.display}.`);
    setResetHistory(getOutgoingDocCounterResetHistory());
    setShowResetModal(false);
    setResetReason('');

    setTimeout(() => {
      setResetSuccessMessage(null);
    }, 8000);
  };

  // When document category changes, update auto symbol
  const handleCategoryChange = (newCategory: string) => {
    const suf = formData.insertSuffix ? formData.insertSuffix.trim().toUpperCase() : '';
    const numToUse = editingDoc
      ? `${formData.outgoingNumberSeq || 29}${suf}`
      : `${peekNextOutgoingDocNumber().num}${suf}`;

    const newSymbol = formatOutgoingDocumentSymbol(numToUse, newCategory);

    setFormData(prev => ({
      ...prev,
      category: newCategory,
      outgoingCodeSymbol: newSymbol
    }));
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
        id: `att-out-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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

    // Strict validation
    const errors: typeof fieldErrors = {};

    if (!formData.draftAuthor || !formData.draftAuthor.trim()) {
      errors.draftAuthor = 'Vui lòng chọn Người soạn thảo văn bản!';
    }

    // Validate Signer user account using centralized rules
    const accountsForValidation = userAccounts.length > 0 ? userAccounts : UserAccountRepository.getAll();
    const saveCheck = validateOutgoingDocumentSave(
      {
        signerUserId: formData.signerId,
        signerId: formData.signerId,
        signerName: formData.signerName
      },
      accountsForValidation
    );

    if (!saveCheck.isValid) {
      errors.signerName = saveCheck.errorMsg || `Vui lòng chọn Người ký văn bản thuộc nhóm ${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL}!`;
    }

    if (!formData.title || !formData.title.trim()) {
      errors.title = 'Vui lòng nhập Trích yếu nội dung văn bản!';
    }

    if (!formData.issueDate) {
      errors.issueDate = 'Vui lòng chọn Ngày ban hành!';
    }

    // Assign / Keep Outgoing Number
    let numSeq = formData.outgoingNumberSeq;
    const cleanSuffix = (formData.insertSuffix || '').trim().toUpperCase();
    let numDisplay = formData.outgoingNumberDisplay;

    if (!editingDoc) {
      const generated = getAndIncrementOutgoingDocNumber();
      numSeq = generated.num;
      numDisplay = `${generated.num}${cleanSuffix}`;
    } else {
      numDisplay = `${numSeq || 29}${cleanSuffix}`;
    }

    const finalSymbol = formatOutgoingDocumentSymbol(numDisplay, formData.category);

    // Uniqueness validation
    if (checkOutgoingNumberDuplicate(numDisplay, finalSymbol, editingDoc?.id)) {
      errors.duplicateNumber = `Số văn bản "${numDisplay}" hoặc ký hiệu "${finalSymbol}" đã tồn tại!`;
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    const firstScanUrl = formData.attachments.length > 0
      ? formData.attachments[0].fileUrl
      : (formData.driveUrl || 'https://drive.google.com');

    // Save with complete snapshot fields preserved
    const docToSave: DocumentRecord = {
      id: editingDoc ? editingDoc.id : `doc-out-${Date.now()}`,
      type: 'vanban_di',
      code: finalSymbol,
      title: formData.title.trim(),
      category: formData.category || 'Quyết định',
      outgoingNumberSeq: numSeq,
      insertSuffix: cleanSuffix,
      outgoingNumberDisplay: numDisplay,
      outgoingNumber: numDisplay,
      outgoingCodeSymbol: finalSymbol,
      issueDate: formData.issueDate || formatDateForInput(new Date()),
      issuer: 'Tiểu đoàn 93/Binh chủng Công binh',
      
      // Independent Drafter snapshot fields
      draftAuthorId: formData.draftAuthorId,
      draftAuthor: formData.draftAuthor.trim(),
      draftAuthorRank: formData.draftAuthorRank,
      draftAuthorPosition: formData.draftAuthorPosition,
      draftAuthorUnit: formData.draftAuthorUnit,

      // Independent Signer snapshot fields
      signerUserId: formData.signerId,
      signerId: formData.signerId,
      signerName: formData.signerName.trim(),
      signerTitle: formData.signerTitle,
      signerRank: formData.signerRank,
      signerUnit: formData.signerUnit,
      signer: formData.signerName.trim(),

      recipientLocation: formData.recipientLocation.trim(),
      securityLevel: formData.securityLevel,
      attachments: formData.attachments,
      driveUrl: formData.driveUrl || firstScanUrl,
      officialFileUrl: firstScanUrl,
      notes: formData.notes,
      uploader: currentUser.name,
      uploadDate: formatDateForInput(new Date()),
      status: 'da_hoan_thanh'
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

      {/* Search & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-lg">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-lg">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm theo ký hiệu VB đi, trích yếu, nơi nhận, người ký..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {/* Admin Number Control Modal Button */}
          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setResetHistory(getOutgoingDocCounterResetHistory());
                  setShowResetModal(true);
                }}
                className="px-3 py-2.5 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md"
                title="Reset counter số văn bản đi về 00"
              >
                <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                <span>Reset Counter</span>
              </button>
              <button
                onClick={() => {
                  setAdjustHistory(getOutgoingDocAdjustmentHistory());
                  setShowAdjustHistoryModal(true);
                }}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                title="Xem lịch sử điều chỉnh số văn bản đi"
              >
                <History className="w-3.5 h-3.5 text-sky-400" />
                <span>Nhật Ký</span>
              </button>
            </div>
          )}

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Soạn Thảo & Đăng Ký VB Đi
          </button>
        </div>
      </div>

      {/* Outgoing Docs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-4 px-4 w-12 text-center">STT</th>
                <th className="py-4 px-4 w-44">Ký Hiệu / Số VB</th>
                <th className="py-4 px-4">Trích Yếu Nội Dung & Nơi Nhận</th>
                <th className="py-4 px-4 w-56">Người Soạn Thảo & Người Ký</th>
                <th className="py-4 px-4 w-32">Ngày Ban Hành</th>
                <th className="py-4 px-4 w-28 text-center">Đính Kèm</th>
                <th className="py-4 px-4 w-36 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {outgoingDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="w-8 h-8 text-slate-600 stroke-[1.5]" />
                      <p className="text-sm">Chưa có văn bản đi nào trong hệ thống.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                outgoingDocs.map((doc, idx) => {
                  const symbol = doc.outgoingCodeSymbol || doc.code || '--';
                  const signer = doc.signerName || doc.signer || '--';
                  const drafter = doc.draftAuthor || currentUser.name;
                  const attCount = doc.attachments ? doc.attachments.length : (doc.driveUrl ? 1 : 0);
                  const numDisplay = doc.outgoingNumberDisplay || doc.outgoingNumber || '';

                  return (
                    <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-4 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-4 px-4">
                        <div className="font-mono font-bold text-emerald-400 text-sm flex items-center gap-1.5">
                          <span>{symbol}</span>
                          {doc.insertSuffix && (
                            <span className="text-[10px] font-sans bg-amber-950/90 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800">
                              Số chèn {doc.insertSuffix}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-400 font-sans mt-0.5">
                          {doc.category}
                        </div>
                      </td>
                      <td className="py-4 px-4 max-w-xs md:max-w-md">
                        <div className="font-medium text-slate-100 leading-snug line-clamp-2">
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                          <Building className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-[260px]">{doc.recipientLocation || 'Nơi nhận'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-xs text-slate-200">
                          <span className="text-slate-500">Soạn thảo:</span>{' '}
                          <span className="text-sky-300 font-medium">{drafter}</span>
                        </div>
                        <div className="text-xs text-slate-300 mt-0.5">
                          <span className="text-slate-500">Người ký:</span>{' '}
                          <strong className="text-emerald-400 font-semibold">{signer}</strong>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs font-mono text-slate-400">
                        {formatDateVN(doc.issueDate)}
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
                        {isAdmin && (
                          <button
                            onClick={() => handleOpenAdjustDoc(doc)}
                            title="Điều chỉnh số / Cấp số chèn (Admin)"
                            className="p-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 text-amber-400 border border-amber-800/60 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                          </button>
                        )}
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
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa văn bản đi "${doc.outgoingCodeSymbol || doc.code}" không?`)) {
                              onDeleteDoc(doc.id);
                            }
                          }}
                          title="Xóa văn bản"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Admin Reset Counter Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-rose-900/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-rose-950/80 bg-rose-950/40 flex items-center justify-between">
              <h3 className="font-bold text-base text-rose-200 flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-rose-400" />
                Reset Counter Số Văn Bản Đi (Admin)
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
                      CẢNH BÁO QUẢN TRỊ
                    </strong>
                    <p className="leading-relaxed">
                      Đặt lại counter số phát hành tiếp theo. Thao tác này KHÔNG sửa đổi các văn bản đi đã đăng ký trong lịch sử.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Giá trị bắt đầu mới <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={resetNewStartVal}
                    onChange={e => setResetNewStartVal(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-rose-500"
                    required
                  />
                  <p className="text-[10px] text-slate-500 mt-1">VB tiếp theo sẽ nhận số {resetNewStartVal + 1}</p>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs font-mono my-auto">
                  <span className="text-slate-500 block text-[10px]">Dự kiến tiếp theo hiện tại:</span>
                  <span className="text-amber-400 font-bold text-sm">{peekNextOutgoingDocNumber().num}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lý do reset counter <span className="text-rose-400">* (Bắt buộc)</span>
                </label>
                <textarea
                  rows={3}
                  value={resetReason}
                  onChange={e => setResetReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết (VD: Bắt đầu kỳ đăng ký sổ văn bản năm mới 2027...)"
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
                  Xác nhận Reset Counter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Manual Adjustment / Insert Sub-Number Modal */}
      {showAdjustModal && adjustingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-amber-900/60 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-amber-950/80 bg-amber-950/40 flex items-center justify-between">
              <h3 className="font-bold text-base text-amber-200 flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Điều Chỉnh Số & Cấp Số Chèn (Admin)
              </h3>
              <button
                onClick={() => {
                  setShowAdjustModal(false);
                  setAdjustingDoc(null);
                }}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="p-5 space-y-4 text-sm">
              {/* High Severity Legal Warning if doc is signed or released */}
              {(adjustingDoc.signedScanFileUrl || adjustingDoc.officialFileUrl) && (
                <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-200 text-xs space-y-1">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-300 font-bold uppercase tracking-wider">
                        CẢNH BÁO MỨC CAO - TÍNH PHÁP LÝ
                      </strong>
                      <p className="leading-relaxed mt-0.5">
                        Văn bản này đã có chữ ký hoặc đã phát hành chính thức! Việc sửa số văn bản sẽ ảnh hưởng nghiêm trọng đến tính pháp lý.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                <span className="text-slate-400 block text-[11px] mb-1">Văn bản đang chọn:</span>
                <span className="text-slate-100 font-medium block line-clamp-2">{adjustingDoc.title}</span>
                <span className="text-amber-400 font-mono font-bold block mt-1">Ký hiệu hiện tại: {adjustingDoc.outgoingCodeSymbol || adjustingDoc.code}</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Số thứ tự (Sequence Number) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={adjustBaseSeq}
                    onChange={e => setAdjustBaseSeq(parseInt(e.target.value, 10) || 1)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Hậu tố chèn (e.g. A, B)
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="VD: A"
                    value={adjustSuffix}
                    onChange={e => setAdjustSuffix(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Live Preview */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500 block text-[10px]">Xem trước số hiển thị:</span>
                  <span className="text-amber-400 font-mono font-bold text-sm">
                    {adjustBaseSeq}{adjustSuffix.trim().toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Xem trước Ký hiệu đầy đủ:</span>
                  <span className="text-emerald-400 font-mono font-bold text-sm">
                    {formatOutgoingDocumentSymbol(`${adjustBaseSeq}${adjustSuffix.trim().toUpperCase()}`, adjustingDoc.category)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lý do điều chỉnh / chèn số <span className="text-rose-400">* (Bắt buộc)</span>
                </label>
                <textarea
                  rows={2}
                  value={adjustReason}
                  onChange={e => setAdjustReason(e.target.value)}
                  placeholder="Nhập lý do điều chỉnh hoặc chèn số văn bản đi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-100 text-xs focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdjustModal(false);
                    setAdjustingDoc(null);
                  }}
                  className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={!adjustReason.trim()}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-amber-600/30"
                >
                  <Check className="w-4 h-4" />
                  Cập Nhật Số Văn Bản
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* History Modal for Reset & Adjustments */}
      {showAdjustHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <History className="w-5 h-5 text-sky-400" />
                Lịch Sử Reset & Điều Chỉnh Số Văn Bản Đi
              </h3>
              <button
                onClick={() => setShowAdjustHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-[70vh] overflow-y-auto text-xs">
              {adjustHistory.length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  Chưa có lịch sử điều chỉnh số văn bản đi nào trong hệ thống.
                </div>
              ) : (
                adjustHistory.map((item, i) => (
                  <div key={i} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="flex justify-between items-center text-slate-300 font-semibold">
                      <span className="text-sky-300">{item.performerName || 'Admin'}</span>
                      <span className="text-slate-500 font-mono text-[11px]">{formatDateVN(item.timestamp)}</span>
                    </div>
                    <div className="text-slate-300 font-medium">
                      Văn bản: {item.docTitle}
                    </div>
                    <div className="text-slate-400">
                      Số cũ: <span className="font-mono text-amber-400 font-bold">{item.oldNumDisplay}</span> ➔ Số mới: <span className="font-mono text-emerald-400 font-bold">{item.newNumDisplay}</span>
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
                onClick={() => setShowAdjustHistoryModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal: Soạn thảo & Phát hành Văn bản Đi */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  {editingDoc ? 'Cập Nhật Hồ Sơ Văn Bản Đi' : 'Soạn Thảo & Đăng Ký Văn Bản Đi Mới'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Đăng ký phát hành văn bản đi, cấp số tự động N+1 hoặc số chèn, gán Người soạn thảo & Người ký, lưu trữ tệp đính kèm.
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
              {/* Duplicate Number Error Banner */}
              {fieldErrors.duplicateNumber && (
                <div className="p-3 bg-rose-950/80 border border-rose-700 rounded-xl text-rose-200 text-xs flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{fieldErrors.duplicateNumber}</span>
                </div>
              )}

              {/* Row 1: Số văn bản (Auto Readonly), Hậu tố chèn, Loại VB, Ký hiệu live */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {/* 1. Số văn bản - Auto */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Số VB đi</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/60 px-1.5 py-0.5 rounded font-mono">
                      Readonly N+1
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={editingDoc ? (formData.outgoingNumberDisplay || formData.outgoingNumber) : expectedNumberDisplay}
                    className="w-full bg-slate-900 border border-slate-700 text-emerald-300 font-mono font-bold text-sm rounded-lg px-3 py-2 cursor-not-allowed opacity-90 shadow-inner"
                  />
                </div>

                {/* 2. Hậu tố chèn (e.g., A, B) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span>Hậu tố chèn</span>
                    <span className="text-[10px] text-slate-400">VD: A, B</span>
                  </label>
                  <input
                    type="text"
                    maxLength={5}
                    placeholder="VD: A"
                    value={formData.insertSuffix}
                    onChange={e => {
                      const suf = e.target.value.toUpperCase();
                      setFormData(prev => ({ ...prev, insertSuffix: suf }));
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold uppercase focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* 3. Loại văn bản */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Loại văn bản <span className="text-rose-400">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={e => handleCategoryChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-emerald-300 font-semibold focus:outline-none focus:border-sky-500"
                  >
                    <option value="Quyết định">Quyết định</option>
                    <option value="Công văn">Công văn</option>
                    <option value="Tờ trình">Tờ trình</option>
                    <option value="Thông báo">Thông báo</option>
                    <option value="Kế hoạch">Kế hoạch</option>
                    <option value="Chỉ thị">Chỉ thị</option>
                    <option value="Báo cáo">Báo cáo</option>
                    <option value="Hướng dẫn">Hướng dẫn</option>
                  </select>
                </div>

                {/* 4. Xem trước Ký hiệu live */}
                <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ký hiệu VB hiển thị
                  </label>
                  <div className="font-mono font-bold text-sm text-sky-300 truncate py-1.5">
                    {liveCodeSymbol}
                  </div>
                </div>
              </div>

              {/* Row 2: Ngày ban hành, Nơi nhận, Độ mật */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {/* Nơi nhận */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nơi nhận (Đơn vị nhận văn bản) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.recipientLocation}
                    onChange={e => setFormData({ ...formData, recipientLocation: e.target.value })}
                    placeholder="VD: Cục Báo cáo - Bộ Tham mưu; Ban QLDA; Lưu VT..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                    required
                  />
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
                  placeholder="Nhập trích yếu tóm tắt nội dung chính của văn bản đi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-slate-100 focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              {/* Row 4: Người soạn thảo & Người ký & Độ mật */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Người soạn thảo - Searchable select from Personnel */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Người soạn thảo <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={drafterSearch}
                      onChange={e => {
                        setDrafterSearch(e.target.value);
                        setFormData({ ...formData, draftAuthor: e.target.value });
                        setShowDrafterDropdown(true);
                      }}
                      onFocus={() => setShowDrafterDropdown(true)}
                      placeholder="Tìm tên cán bộ soạn thảo..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-slate-100 focus:outline-none focus:border-sky-500"
                      required
                    />
                    <User className="w-4 h-4 text-slate-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {showDrafterDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-52 overflow-y-auto">
                      {filteredDrafters.length === 0 ? (
                        <div className="p-3 text-xs text-slate-500 text-center">Không tìm thấy cán bộ</div>
                      ) : (
                        filteredDrafters.map(p => {
                          const nameDisplay = `${p.fullName} (${p.position || 'Cán bộ'})`;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  draftAuthorId: p.id,
                                  draftAuthor: nameDisplay,
                                  draftAuthorRank: p.rankTitle || '',
                                  draftAuthorPosition: p.position || '',
                                  draftAuthorUnit: p.unit || ''
                                });
                                setDrafterSearch(nameDisplay);
                                setShowDrafterDropdown(false);
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

                {/* Người ký văn bản (Lựa chọn tài khoản thuộc nhóm Chỉ huy Tiểu đoàn) */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <span>Người ký văn bản</span>
                      <span className="text-rose-400">*</span>
                    </span>
                    <span
                      title={`Hệ thống hiển thị danh sách tài khoản thuộc nhóm ${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL}`}
                      className="text-[10px] text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded font-medium"
                    >
                      {OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL}
                    </span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={signerSearch}
                      onChange={e => {
                        setSignerSearch(e.target.value);
                        setShowSignerDropdown(true);
                      }}
                      onFocus={() => setShowSignerDropdown(true)}
                      aria-label={`Chọn Người ký văn bản thuộc nhóm ${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL}`}
                      placeholder={`Chọn hoặc tìm kiếm ${OUTGOING_DOCUMENT_SIGNER_GROUP_LABEL}...`}
                      className={`w-full bg-slate-950 border rounded-lg pl-3 pr-8 py-2 text-emerald-300 font-semibold focus:outline-none ${
                        fieldErrors.signerName ? 'border-rose-500' : 'border-slate-700 focus:border-sky-500'
                      }`}
                      required
                    />
                    <UserCheck className="w-4 h-4 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>

                  {fieldErrors.signerName && (
                    <p className="text-[11px] text-rose-400 mt-1">{fieldErrors.signerName}</p>
                  )}

                  {showSignerDropdown && (
                    <div className="absolute z-[100] top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-64 overflow-y-auto divide-y divide-slate-800/80">
                      {filteredEligibleSigners.length === 0 ? (
                        <div className="p-4 text-xs text-slate-400 text-center font-medium">
                          Chưa có tài khoản Chỉ huy Tiểu đoàn đủ quyền ký văn bản
                        </div>
                      ) : (
                        filteredEligibleSigners.map(u => {
                          const details = extractSignerRankAndPosition(u);
                          const isSelected = formData.signerId === u.id;
                          return (
                            <button
                              key={u.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  signerId: u.id,
                                  signerName: u.name,
                                  signerTitle: details.position,
                                  signerRank: details.rank,
                                  signerUnit: details.unit
                                });
                                setSignerSearch(`${u.name} - ${details.rank} (${details.position})`);
                                setFieldErrors(prev => ({ ...prev, signerName: undefined }));
                                setShowSignerDropdown(false);
                              }}
                              className={`w-full text-left p-3 transition-colors flex items-start justify-between ${
                                isSelected
                                  ? 'bg-emerald-950/60 text-emerald-200'
                                  : 'hover:bg-emerald-950/30 text-slate-200'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-bold text-emerald-300 flex items-center gap-2">
                                  <span>{u.name}</span>
                                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400" />}
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
                              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded shrink-0">
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

              {/* Row 5: Attachments Upload */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Tệp đính kèm văn bản (PDF, DOC, DOCX - Tối đa 25MB/tệp)
                </label>
                <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 transition-colors rounded-xl p-4 bg-slate-950 text-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                    onChange={handleFilesUpload}
                    className="hidden"
                    id="outgoing-file-upload"
                  />
                  <label
                    htmlFor="outgoing-file-upload"
                    className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                  >
                    <Upload className="w-7 h-7 text-emerald-400" />
                    <span className="text-xs text-slate-300 font-medium">
                      Nhấp vào đây hoặc kéo thả tệp đính kèm văn bản đi vào đây
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Định dạng cho phép: PDF, DOC, DOCX (Dung lượng mỗi tệp ≤ 25MB)
                    </span>
                  </label>
                </div>

                {/* Attachment list */}
                {formData.attachments.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <span className="text-xs text-slate-400 font-semibold block">Danh sách tệp đính kèm:</span>
                    {formData.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-2.5 bg-slate-950 rounded-lg border border-slate-800 text-xs">
                        <div className="flex items-center gap-2 truncate">
                          <File className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 truncate">{att.fileName}</span>
                          <span className="text-slate-500 text-[11px]">({formatFileSize(att.fileSize)})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(att.id)}
                          className="p-1 hover:bg-rose-950 text-slate-400 hover:text-rose-400 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Ghi chú thêm</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ghi chú quá trình soạn thảo, ý kiến chỉ đạo hoặc thông tin cần theo dõi..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {editingDoc ? 'Lưu Cập Nhật Văn Bản' : 'Phát Hành & Đăng Ký Văn Bản Đi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Detail Preview Drawer/Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Chi Tiết Hồ Sơ Văn Bản Đi
                </h3>
                <span className="text-xs font-mono text-emerald-400">{previewDoc.outgoingCodeSymbol || previewDoc.code}</span>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Số / Ký hiệu:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">{previewDoc.outgoingCodeSymbol || previewDoc.code}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Ngày ban hành:</span>
                  <span className="text-slate-200 font-semibold">{formatDateVN(previewDoc.issueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Loại văn bản:</span>
                  <span className="text-slate-200 font-semibold">{previewDoc.category}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Cơ quan phát hành:</span>
                  <span className="text-slate-200 font-semibold">{previewDoc.issuer || 'Tiểu đoàn 93/BCCB'}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Trích yếu nội dung:</span>
                <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-100 leading-relaxed font-medium">
                  {previewDoc.title}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">Người soạn thảo:</span>
                  <span className="text-sky-300 font-semibold">{previewDoc.draftAuthor || '--'}</span>
                  {previewDoc.draftAuthorPosition && (
                    <span className="text-slate-400 block text-[11px]">{previewDoc.draftAuthorPosition} • {previewDoc.draftAuthorUnit}</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500 block">Người ký:</span>
                  <span className="text-emerald-300 font-semibold">{previewDoc.signerName || previewDoc.signer || '--'}</span>
                  {previewDoc.signerTitle && (
                    <span className="text-slate-400 block text-[11px]">{previewDoc.signerTitle}</span>
                  )}
                </div>
              </div>

              <div>
                <span className="text-slate-500 block mb-1">Nơi nhận:</span>
                <p className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-200">
                  {previewDoc.recipientLocation || '--'}
                </p>
              </div>

              {previewDoc.attachments && previewDoc.attachments.length > 0 && (
                <div>
                  <span className="text-slate-500 block mb-1.5">Tệp đính kèm ({previewDoc.attachments.length}):</span>
                  <div className="space-y-2">
                    {previewDoc.attachments.map(att => (
                      <div key={att.id} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 truncate">
                          <File className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 truncate">{att.fileName}</span>
                        </div>
                        <a
                          href={att.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/80 rounded-lg text-[11px] font-semibold flex items-center gap-1 shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Tải về
                        </a>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-semibold"
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
