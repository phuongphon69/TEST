import React, { useState, useEffect, useMemo } from 'react';
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
  Eye,
  Edit2,
  Trash2,
  X,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  History,
  Send,
  Link as LinkIcon,
  Layers,
  MapPin,
  DollarSign,
  Clock,
  ShieldCheck,
  ArrowRight,
  FileSpreadsheet,
  Upload,
  File,
  Download,
  Lock,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { User, AppraisalNotice, Project, AppraisalType, AppraisalConclusion, AppraisalStatus, DocumentRecord, AppraisalWorkCategories } from '../../types';
import { formatDateVN, formatDateForInput, formatVND, APPRAISAL_CONCLUSION_MAP, APPRAISAL_TYPE_MAP, APPRAISAL_TYPE_OPTIONS, TASK_AUTHORITY_MAP, formatAppraisalNoticeSymbol, APPRAISAL_NOTICE_SYMBOL_SUFFIX } from '../../utils/formatters';
import { peekNextAppraisalNoticeNumber, getAndIncrementAppraisalNoticeNumber, checkAppraisalNoticeCodeSymbolDuplicate } from '../../utils/storage';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import { APPRAISAL_AUTHORITIES, AppraisalAuthorityCode, normalizeAppraisalAuthority } from '../../constants/appraisalNoticeConstants';
import { AppraisalNoticeCounterService } from '../../services/AppraisalNoticeCounterService';
import { AppraisalNoticeSignerService } from '../../services/AppraisalNoticeSignerService';
import { AppraisalNoticeValidation } from '../../services/AppraisalNoticeValidation';
import { AppraisalAuthoritySelect } from '../appraisal/AppraisalAuthoritySelect';
import { AppraisalNoticeSignerInput } from '../appraisal/AppraisalNoticeSignerInput';

export const WORK_CATEGORY_OPTIONS = [
  { id: 'khao_sat_pakt', label: 'Khảo sát lập phương án kỹ thuật / dự toán' },
  { id: 'dieu_tra_khao_sat', label: 'Điều tra khảo sát' },
  { id: 'giam_sat_thi_cong', label: 'Giám sát thi công' },
  { id: 'thi_cong_rpbm', label: 'Thi công rà phá bom mìn, vật nổ' },
  { id: 'khac', label: 'Các công tác khác' }
] as const;

interface AppraisalNoticesTabProps {
  appraisalNotices: AppraisalNotice[];
  projects: Project[];
  documents?: DocumentRecord[];
  currentUser: { name: string; title: string };
  onSaveNotice: (notice: AppraisalNotice) => void;
  onDeleteNotice: (id: string) => void;
  onConfirmProjectDataUpdate: (notice: AppraisalNotice) => void;
}

export const AppraisalNoticesTab: React.FC<AppraisalNoticesTabProps> = ({
  appraisalNotices,
  projects,
  documents = [],
  currentUser,
  onSaveNotice,
  onDeleteNotice,
  onConfirmProjectDataUpdate
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedNotice, setSelectedNotice] = useState<AppraisalNotice | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<AppraisalNotice | null>(null);
  const [showAiModal, setShowAiModal] = useState(false);
  const [isExtractingAi, setIsExtractingAi] = useState(false);
  const [activeTabInModal, setActiveTabInModal] = useState<'general' | 'project' | 'numbers'>('general');

  // PDF Viewer Modal State
  const [pdfViewerFile, setPdfViewerFile] = useState<{ title: string; url: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<AppraisalNotice>>({
    noticeCode: '',
    noticeNumber: '',
    codeSymbol: '',
    issueDate: formatDateForInput(new Date()),
    receiveDate: formatDateForInput(new Date()),
    appraisalAgency: 'Binh chủng Công binh',
    leadUnit: 'Phòng Thẩm định & Giám sát Kỹ thuật RPBM',
    signerName: 'Đại tá Trần Minh Đức',
    signerTitle: 'Trưởng phòng Thẩm định',
    appraisalType: 'pakt_vado_du_toan',
    appraisalTurn: 1,
    contentSummary: '',
    effectiveStatus: 'dang_hieu_luc',
    effectiveDate: formatDateForInput(new Date()),
    projectId: '',
    projectName: '',
    incomingDocId: '',
    incomingDocCode: '',
    decisionDocCode: '',
    taskAuthority: 'bo_quoc_phong',
    isCurrentActiveNotice: true,
    totalProjectAreaHa: 0,
    landAreaHa: 0,
    waterAreaHa: 0,
    approvedClearanceAreaHa: 0,
    approvedBudgetValueVnd: 0,
    submittedBudgetValueVnd: 0,
    afterAppraisalBudgetValueVnd: 0,
    reportingPeriodAreaHa: 0,
    reportingPeriodValueVnd: 0,
    startDate: formatDateForInput(new Date()),
    endDate: formatDateForInput(new Date(Date.now() + 180 * 24 * 3600 * 1000)),
    totalDays: 180,
    requirements: [],
    status: 'da_hoan_thanh',
    attachments: []
  });

  // User Accounts & Form Errors State
  const [userAccounts, setUserAccounts] = useState<User[]>([]);
  const [formErrors, setFormErrors] = useState<{ appraisalAuthority?: string; signer?: string }>({});

  useEffect(() => {
    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);
  }, []);

  // Track if user manually modified content summary
  const [isSummaryCustomized, setIsSummaryCustomized] = useState(false);

  // Project Combobox Search Query
  const [projectSearchInput, setProjectSearchInput] = useState('');
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  // File Upload State
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Filtered Notices List
  const filteredNotices = appraisalNotices
    .filter(n => n.dataStatus !== 'da_xoa')
    .filter(n => {
      if (typeFilter !== 'all' && n.appraisalType !== typeFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          n.noticeCode.toLowerCase().includes(q) ||
          n.codeSymbol.toLowerCase().includes(q) ||
          n.contentSummary.toLowerCase().includes(q) ||
          n.appraisalAgency.toLowerCase().includes(q) ||
          (n.projectName || '').toLowerCase().includes(q)
        );
      }
      return true;
    });

  // Default summary template generator
  const getDefaultSummary = (projectName: string) => {
    if (!projectName) return 'Kết quả thẩm định phương án kỹ thuật thi công và dự toán rà phá bom mìn vật nổ dự án';
    return `Kết quả thẩm định phương án kỹ thuật thi công và dự toán rà phá bom mìn vật nổ dự án ${projectName}`;
  };

  // Rule-based task authority matching from Incoming Docs
  const findDecisionDocForProject = (proj: Project | null) => {
    if (!documents || documents.length === 0) return null;
    if (!proj) return null;

    const projNameLower = proj.name.toLowerCase();
    const projCodeLower = proj.code.toLowerCase();

    // Priority 1: Incoming doc explicitly linked to project or having project ID
    const directDoc = documents.find(d =>
      d.projectId === proj.id ||
      d.id === proj.sourceIncomingDocumentId ||
      d.code === proj.sourceIncomingDocumentSymbol
    );
    if (directDoc) return directDoc;

    // Priority 2: Decision category doc with matching project text in title/content
    const decisionDocs = documents.filter(d =>
      d.category === 'Quyết định' ||
      d.type === 'vanban_den' ||
      d.title.toLowerCase().includes('quyết định') ||
      d.title.toLowerCase().includes('giao nhiệm vụ') ||
      d.title.toLowerCase().includes('phê duyệt')
    );

    const matchedDoc = decisionDocs.find(d => {
      const text = `${d.title} ${d.notes || ''} ${d.code}`.toLowerCase();
      return text.includes(projNameLower) || text.includes(projCodeLower);
    });

    if (matchedDoc) return matchedDoc;

    // Priority 3: Any decision doc from Ministry of Defense or Engineering Corps
    const govDecisionDoc = decisionDocs.find(d =>
      (d.issuer || '').includes('Bộ Quốc phòng') ||
      (d.issuer || '').includes('Binh chủng Công binh') ||
      (d.issuer || '').includes('Bộ Tư lệnh')
    );

    return govDecisionDoc || null;
  };

  // Filter projects for combobox suggestions
  const filteredProjectSuggestions = useMemo(() => {
    if (!projectSearchInput.trim()) return projects;
    const q = projectSearchInput.toLowerCase();
    return projects.filter(p => {
      const nameMatch = p.name.toLowerCase().includes(q);
      const codeMatch = p.code.toLowerCase().includes(q);
      const docMatch = (p.sourceIncomingDocumentNumber || '').toLowerCase().includes(q) ||
                       (p.sourceIncomingDocumentSymbol || '').toLowerCase().includes(q);
      
      // Also match incoming docs linked
      const linkedDocs = documents.filter(d => d.projectId === p.id);
      const docCodeMatch = linkedDocs.some(d => d.code.toLowerCase().includes(q) || (d.incomingNumber || '').toLowerCase().includes(q));

      return nameMatch || codeMatch || docMatch || docCodeMatch;
    });
  }, [projects, documents, projectSearchInput]);

  // Handle Open Add Modal
  const handleOpenAdd = () => {
    setEditingNotice(null);
    setIsSummaryCustomized(false);
    setFormErrors({});

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);

    const counterResult = AppraisalNoticeCounterService.peekNextNumber(appraisalNotices);
    const signerRes = AppraisalNoticeSignerService.resolveAutoSigner(accounts);
    const defaultAuth = normalizeAppraisalAuthority('BINH_CHUNG_CONG_BINH');

    const firstProj = projects[0] || null;
    const initialSummary = getDefaultSummary(firstProj ? firstProj.name : '');
    const matchedDoc = findDecisionDocForProject(firstProj);
    const initialAuthority = matchedDoc && (matchedDoc.issuer || '').includes('Bộ Quốc phòng') ? 'bo_quoc_phong' : 'bo_tu_lenh';

    const defaultSignerName = signerRes.details?.fullLineDisplay || 'Thượng tá Đỗ Văn Dũng';

    setFormData({
      noticeCode: `TB-TD-2026-${String(counterResult.numberSeq).padStart(3, '0')}`,
      noticeNumber: counterResult.numberDisplay,
      noticeNumberSeq: counterResult.numberSeq,
      codeSymbol: counterResult.codeSymbol,
      issueDate: formatDateForInput(new Date()),
      receiveDate: formatDateForInput(new Date()),
      appraisalAuthorityCode: defaultAuth.code,
      appraisalAgency: defaultAuth.label,
      appraisalAuthorityNameSnapshot: defaultAuth.label,
      leadUnit: 'Phòng Thẩm định & Giám sát Kỹ thuật RPBM',
      signerUserId: signerRes.details?.userId || '',
      signerId: signerRes.details?.userId || '',
      signerName: defaultSignerName,
      signerDisplayName: defaultSignerName,
      signerNameSnapshot: defaultSignerName,
      signerRank: signerRes.details?.rank || '',
      signerRankSnapshot: signerRes.details?.rank || '',
      signerTitle: signerRes.details?.position || '',
      signerPositionSnapshot: signerRes.details?.position || '',
      signerRoleSnapshot: signerRes.details?.roleLabel || '',
      signerEmailSnapshot: signerRes.details?.email || '',
      signerUnit: signerRes.details?.unit || '',
      appraisalType: 'khao_sat_thi_cong',
      appraisalTurn: 1,
      contentSummary: initialSummary,
      effectiveStatus: 'dang_hieu_luc',
      effectiveDate: formatDateForInput(new Date()),
      projectId: firstProj ? firstProj.id : '',
      projectName: firstProj ? firstProj.name : '',
      incomingDocId: matchedDoc ? matchedDoc.id : '',
      incomingDocCode: matchedDoc ? matchedDoc.code : '',
      decisionDocCode: matchedDoc ? matchedDoc.code : '',
      taskAuthority: initialAuthority,
      isCurrentActiveNotice: true,
      totalProjectAreaHa: firstProj ? (firstProj.totalAreaHa || firstProj.areaHa) : 100,
      landAreaHa: firstProj ? (firstProj.landAreaHa || firstProj.areaHa * 0.9) : 90,
      waterAreaHa: firstProj ? (firstProj.underwaterAreaHa || firstProj.areaHa * 0.1) : 10,
      approvedClearanceAreaHa: firstProj ? (firstProj.totalAreaHa || firstProj.areaHa) : 100,
      approvedBudgetValueVnd: firstProj ? firstProj.budgetVnd : 12000000000,
      submittedBudgetValueVnd: firstProj ? Math.round(firstProj.budgetVnd * 1.05) : 12500000000,
      afterAppraisalBudgetValueVnd: firstProj ? firstProj.budgetVnd : 12000000000,
      reportingPeriodAreaHa: 0,
      reportingPeriodValueVnd: 0,
      startDate: firstProj ? firstProj.startDate : formatDateForInput(new Date()),
      endDate: firstProj ? firstProj.endDate : formatDateForInput(new Date(Date.now() + 180 * 24 * 3600 * 1000)),
      totalDays: 180,
      requirements: [],
      status: 'da_hoan_thanh',
      attachments: []
    });

    setProjectSearchInput(firstProj ? `[${firstProj.code}] ${firstProj.name}` : '');
    setShowFormModal(true);
  };

  // Handle Open Edit Modal
  const handleOpenEdit = (notice: AppraisalNotice) => {
    setEditingNotice(notice);
    setIsSummaryCustomized(true);
    setFormErrors({});

    const accounts = UserAccountRepository.getAll();
    setUserAccounts(accounts);

    const linkedProj = projects.find(p => p.id === notice.projectId) || null;
    const numSeq = notice.noticeNumberSeq || parseInt(notice.noticeNumber || notice.codeSymbol.split('/')[0] || '1', 10);
    const noticeNum = notice.noticeNumber || String(numSeq);
    const codeSym = notice.codeSymbol || AppraisalNoticeCounterService.formatSymbol(noticeNum);

    const authNorm = normalizeAppraisalAuthority(notice.appraisalAuthorityCode || notice.appraisalAgency);
    const signerUser = accounts.find(u => u.id === (notice.signerUserId || notice.signerId));
    const signerDetails = AppraisalNoticeSignerService.extractSignerDetails(signerUser);

    const existingSignerName = notice.signerName || notice.signerDisplayName || signerDetails.fullLineDisplay || notice.signerNameSnapshot || '';

    setFormData({
      ...notice,
      noticeNumber: noticeNum,
      noticeNumberSeq: numSeq,
      codeSymbol: codeSym,
      issueDate: notice.issueDate || formatDateForInput(new Date()),
      appraisalAuthorityCode: authNorm.code,
      appraisalAgency: authNorm.label,
      appraisalAuthorityNameSnapshot: authNorm.label,
      signerUserId: notice.signerUserId || notice.signerId || '',
      signerId: notice.signerId || '',
      signerName: existingSignerName,
      signerDisplayName: existingSignerName,
      signerNameSnapshot: existingSignerName,
      signerRank: signerDetails.rank || notice.signerRank || '',
      signerRankSnapshot: signerDetails.rank || notice.signerRankSnapshot || '',
      signerTitle: signerDetails.position || notice.signerTitle || '',
      signerPositionSnapshot: signerDetails.position || notice.signerPositionSnapshot || '',
      signerRoleSnapshot: signerDetails.roleLabel || notice.signerRoleSnapshot || '',
      signerEmailSnapshot: signerDetails.email || notice.signerEmailSnapshot || '',
      signerUnit: signerDetails.unit || notice.signerUnit || '',
      appraisalType: notice.appraisalType || 'khao_sat_thi_cong',
      projectName: notice.projectName || (linkedProj ? linkedProj.name : ''),
      landAreaHa: notice.landAreaHa || 0,
      waterAreaHa: notice.waterAreaHa || 0,
      approvedClearanceAreaHa: notice.approvedClearanceAreaHa || (notice.landAreaHa + notice.waterAreaHa),
      taskAuthority: notice.taskAuthority || 'bo_quoc_phong',
      decisionDocCode: notice.decisionDocCode || notice.incomingDocCode || '',
      reportingPeriodAreaHa: notice.reportingPeriodAreaHa || 0,
      reportingPeriodValueVnd: notice.reportingPeriodValueVnd || 0,
      attachments: notice.attachments || []
    });

    setProjectSearchInput(linkedProj ? `[${linkedProj.code}] ${linkedProj.name}` : notice.projectName || '');
    setShowFormModal(true);
  };

  // Handle Project Selection from Combobox
  const handleSelectProject = (proj: Project) => {
    const matchedDoc = findDecisionDocForProject(proj);
    const authority = matchedDoc && (matchedDoc.issuer || '').includes('Bộ Quốc phòng') ? 'bo_quoc_phong' : 'bo_tu_lenh';
    
    const land = proj.landAreaHa || (proj.areaHa * 0.9);
    const water = proj.underwaterAreaHa || (proj.areaHa * 0.1);
    const totalCalc = land + water;

    // Content summary update rule: Update default template if not manually customized
    const newSummary = isSummaryCustomized ? (formData.contentSummary || '') : getDefaultSummary(proj.name);

    setFormData(prev => ({
      ...prev,
      projectId: proj.id,
      projectName: proj.name,
      incomingDocId: matchedDoc ? matchedDoc.id : prev.incomingDocId,
      incomingDocCode: matchedDoc ? matchedDoc.code : prev.incomingDocCode,
      decisionDocCode: matchedDoc ? matchedDoc.code : prev.decisionDocCode,
      taskAuthority: authority,
      contentSummary: newSummary,
      totalProjectAreaHa: proj.totalAreaHa || proj.areaHa,
      landAreaHa: land,
      waterAreaHa: water,
      approvedClearanceAreaHa: totalCalc,
      approvedBudgetValueVnd: proj.budgetVnd,
      afterAppraisalBudgetValueVnd: proj.budgetVnd,
      submittedBudgetValueVnd: Math.round(proj.budgetVnd * 1.05)
    }));

    setProjectSearchInput(`[${proj.code}] ${proj.name}`);
    setIsProjectDropdownOpen(false);
  };

  // Handle Land/Water area change & auto total calculation
  const handleLandAreaChange = (valStr: string) => {
    const land = Math.max(0, parseFloat(valStr) || 0);
    const water = formData.waterAreaHa || 0;
    const total = land + water;
    setFormData(prev => ({
      ...prev,
      landAreaHa: land,
      approvedClearanceAreaHa: total
    }));
  };

  const handleWaterAreaChange = (valStr: string) => {
    const water = Math.max(0, parseFloat(valStr) || 0);
    const land = formData.landAreaHa || 0;
    const total = land + water;
    setFormData(prev => ({
      ...prev,
      waterAreaHa: water,
      approvedClearanceAreaHa: total
    }));
  };

  // File Upload Handler (PDF only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      alert('Chỉ chấp nhận tệp định dạng PDF!');
      return;
    }

    setIsUploadingFile(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploadingFile(false);

          // Add to attachments
          const newAttachment = {
            id: `att-${Date.now()}`,
            name: file.name,
            size: file.size,
            url: URL.createObjectURL(file),
            uploadDate: formatDateVN(new Date().toISOString()),
            status: 'uploaded' as const
          };

          setFormData(prevForm => ({
            ...prevForm,
            attachments: [...(prevForm.attachments || []), newAttachment],
            noticeFileUrl: newAttachment.url
          }));

          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Delete Attachment
  const handleDeleteAttachment = (attId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa file đính kèm này?')) {
      setFormData(prev => ({
        ...prev,
        attachments: (prev.attachments || []).filter(a => a.id !== attId)
      }));
    }
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.projectId) {
      alert('Vui lòng chọn Dự án liên kết!');
      return;
    }

    const linkedProj = projects.find(p => p.id === formData.projectId);

    // Validate Notice
    const validation = AppraisalNoticeValidation.validateNotice(
      formData,
      editingNotice?.id,
      appraisalNotices
    );

    if (!validation.isValid) {
      setFormErrors(validation.errors);
      return;
    }

    const { cleanNoticeNumberSeq, cleanCodeSymbol, cleanSignerName, normalizedAuthority } = validation;

    // Update counter if user entered a higher number
    AppraisalNoticeCounterService.updateCounterIfHigher(cleanNoticeNumberSeq);

    const land = Math.max(0, formData.landAreaHa || 0);
    const water = Math.max(0, formData.waterAreaHa || 0);
    const totalClearance = land + water;

    // Build project snapshot
    const projectSnapshot = linkedProj ? {
      projectName: linkedProj.name,
      location: `${linkedProj.commune || ''}, ${linkedProj.province || ''}`,
      investor: linkedProj.investor,
      totalAreaHa: linkedProj.totalAreaHa || linkedProj.areaHa,
      landAreaHa: linkedProj.landAreaHa || 0,
      waterAreaHa: linkedProj.underwaterAreaHa || 0,
      approvedBudgetValueVnd: formData.approvedBudgetValueVnd || linkedProj.budgetVnd,
      workType: linkedProj.workType || 'Thi công',
      taskAuthority: formData.taskAuthority || 'bo_quoc_phong',
      decisionDocCode: formData.decisionDocCode || '',
      snapshotDate: new Date().toISOString()
    } : undefined;

    const noticeToSave: AppraisalNotice = {
      id: editingNotice ? editingNotice.id : `tbtd-${Date.now()}`,
      noticeCode: editingNotice ? editingNotice.noticeCode : `TB-TD-2026-${String(cleanNoticeNumberSeq).padStart(3, '0')}`,
      noticeNumber: String(cleanNoticeNumberSeq),
      noticeNumberSeq: cleanNoticeNumberSeq,
      codeSymbol: cleanCodeSymbol,
      issueDate: formData.issueDate || formatDateForInput(new Date()),
      receiveDate: formData.receiveDate || formatDateForInput(new Date()),
      appraisalAuthorityCode: normalizedAuthority.code,
      appraisalAgency: normalizedAuthority.label,
      appraisalAuthorityNameSnapshot: normalizedAuthority.label,
      leadUnit: formData.leadUnit || 'Phòng Thẩm định & Giám sát Kỹ thuật RPBM',
      signerName: cleanSignerName,
      signerDisplayName: cleanSignerName,
      signerNameSnapshot: cleanSignerName,
      signerUserId: editingNotice?.signerUserId || null,
      signerId: editingNotice?.signerId || '',
      signerRank: formData.signerRank || '',
      signerRankSnapshot: formData.signerRankSnapshot || '',
      signerTitle: formData.signerTitle || '',
      signerPositionSnapshot: formData.signerPositionSnapshot || '',
      signerRoleSnapshot: formData.signerRoleSnapshot || '',
      signerEmailSnapshot: formData.signerEmailSnapshot || '',
      signerUnit: formData.signerUnit || '',
      appraisalType: (formData.appraisalType as AppraisalType) || 'khao_sat_thi_cong',
      appraisalTurn: Number(formData.appraisalTurn || 1),
      contentSummary: formData.contentSummary || getDefaultSummary(linkedProj ? linkedProj.name : ''),
      conclusion: 'du_dieukien_pheduyet',
      effectiveStatus: (formData.effectiveStatus as any) || 'dang_hieu_luc',
      effectiveDate: formData.effectiveDate || formatDateForInput(new Date()),
      projectId: formData.projectId || '',
      projectName: formData.projectName || (linkedProj ? linkedProj.name : ''),
      incomingDocId: formData.incomingDocId || '',
      incomingDocCode: formData.incomingDocCode || '',
      decisionDocCode: formData.decisionDocCode || '',
      taskAuthority: formData.taskAuthority || 'bo_quoc_phong',
      isCurrentActiveNotice: formData.isCurrentActiveNotice ?? true,
      totalProjectAreaHa: Number(formData.totalProjectAreaHa || (linkedProj ? linkedProj.areaHa : totalClearance)),
      landAreaHa: land,
      waterAreaHa: water,
      approvedClearanceAreaHa: totalClearance,
      approvedSurveyAreaHa: Number(formData.approvedSurveyAreaHa || 0),
      approvedConstructionAreaHa: totalClearance,
      approvedSupervisionAreaHa: totalClearance,
      submittedBudgetValueVnd: Number(formData.submittedBudgetValueVnd || 0),
      afterAppraisalBudgetValueVnd: Number(formData.approvedBudgetValueVnd || 0),
      approvedBudgetValueVnd: Number(formData.approvedBudgetValueVnd || 0),
      reportingPeriodAreaHa: Number(formData.reportingPeriodAreaHa || 0),
      reportingPeriodValueVnd: Number(formData.reportingPeriodValueVnd || 0),
      landBudgetValueVnd: Number(formData.landBudgetValueVnd || 0),
      waterBudgetValueVnd: Number(formData.waterBudgetValueVnd || 0),
      surveyAndPaktBudgetValueVnd: Number(formData.surveyAndPaktBudgetValueVnd || 0),
      constructionBudgetValueVnd: Number(formData.approvedBudgetValueVnd || 0),
      supervisionBudgetValueVnd: Number(formData.supervisionBudgetValueVnd || 0),
      incurredValueVnd: 0,
      adjustedDecreaseValueVnd: 0,
      adjustedIncreaseValueVnd: 0,
      totalAfterAdjustVnd: Number(formData.approvedBudgetValueVnd || 0),
      startDate: formData.startDate || formatDateForInput(new Date()),
      endDate: formData.endDate || formatDateForInput(new Date()),
      totalDays: Number(formData.totalDays || 180),
      requirements: formData.requirements || [],
      status: (formData.status as AppraisalStatus) || 'da_hoan_thanh',
      attachments: formData.attachments || [],
      noticeFileUrl: formData.attachments && formData.attachments.length > 0 ? formData.attachments[0].url : formData.noticeFileUrl,
      projectSnapshot
    };

    onSaveNotice(noticeToSave);
    setShowFormModal(false);
  };

  // Validation Warnings
  const areaWarning = (formData.reportingPeriodAreaHa || 0) > (formData.approvedClearanceAreaHa || 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-amber-950/60 p-5 rounded-2xl border border-sky-800/40 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
              Mục 5.5 - Thông Báo Thẩm Định
            </span>
            <span className="text-xs text-amber-400 font-medium">Ký hiệu {`{số}`}/TB-BCCB</span>
          </div>
          <h2 className="text-lg font-bold text-slate-100">Quản Lý Thông Báo Thẩm Định Dự Án RPBM</h2>
          <p className="text-xs text-slate-300 max-w-2xl">
            Liên kết dữ liệu giữa Văn bản đến, Dự án và Thông báo thẩm định. Lưu giữ snapshot số liệu chính thức tại thời điểm phát hành.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-sky-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Thêm Thông Báo Thẩm Định Mới
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Tìm theo số/ký hiệu, tên dự án, trích yếu, cơ quan..."
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-semibold text-sky-300 focus:outline-none focus:border-sky-500"
          >
            <option value="all">Tất cả loại TB Thẩm định</option>
            {APPRAISAL_TYPE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 w-12 text-center">STT</th>
                <th className="py-3.5 px-4 w-36">Ký Hiệu</th>
                <th className="py-3.5 px-4">Dự Án Liên Kết & Trích Yếu Nội Dung</th>
                <th className="py-3.5 px-4 w-40 text-right">DT Được Duyệt (ha)</th>
                <th className="py-3.5 px-4 w-44 text-right">Dự Toán Được Duyệt</th>
                <th className="py-3.5 px-4 w-36 text-center">Tệp Đính Kèm</th>
                <th className="py-3.5 px-4 w-28 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    Chưa có Thông báo thẩm định nào trong hệ thống.
                  </td>
                </tr>
              ) : (
                filteredNotices.map((item, idx) => {
                  const linkedProj = projects.find(p => p.id === item.projectId);

                  return (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 text-center font-mono text-slate-500">{idx + 1}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-amber-400">{item.codeSymbol}</div>
                        <div className="text-xs text-slate-400">{formatDateVN(item.issueDate)}</div>
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="text-xs font-bold text-sky-300 flex items-center gap-1.5 mb-0.5">
                          <Layers className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          {item.projectName || (linkedProj ? linkedProj.name : 'Chưa chọn dự án')}
                        </div>
                        <div className="text-sm font-medium text-slate-200 line-clamp-2">{item.contentSummary}</div>
                        <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>CQ: {item.appraisalAgency}</span>
                          {item.decisionDocCode && <span>• QĐ: <strong className="text-amber-300 font-mono">{item.decisionDocCode}</strong></span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-semibold text-emerald-400">{item.approvedClearanceAreaHa.toFixed(3)} ha</div>
                        <div className="text-[11px] text-slate-400">
                          Cạn: {item.landAreaHa.toFixed(3)} | Nước: {item.waterAreaHa.toFixed(3)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono">
                        <div className="font-semibold text-amber-300">{formatVND(item.approvedBudgetValueVnd)}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {item.attachments && item.attachments.length > 0 ? (
                          <button
                            onClick={() => setPdfViewerFile({ title: `[${item.codeSymbol}] ${item.projectName}`, url: item.attachments![0].url })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/60 text-red-300 border border-red-800 text-xs font-medium hover:bg-red-900/60 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-400" />
                            Xem Scan PDF
                          </button>
                        ) : item.noticeFileUrl ? (
                          <button
                            onClick={() => setPdfViewerFile({ title: `[${item.codeSymbol}] ${item.projectName}`, url: item.noticeFileUrl! })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-sky-950/60 text-sky-300 border border-sky-800 text-xs font-medium hover:bg-sky-900/60 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-sky-400" />
                            Xem File Scan
                          </button>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Chưa đính kèm</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedNotice(item)}
                          title="Xem chi tiết & Số liệu 5.5.4"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(item)}
                          title="Chỉnh sửa"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
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

      {/* Add / Edit Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-100">
                  {editingNotice ? 'Cập Nhật Thông Báo Thẩm Định' : 'Thêm Thông Báo Thẩm Định Mới'}
                </h3>
                <p className="text-xs text-slate-400">Mục 5.5 & Section 5.5.4 Số Liệu Thẩm Định</p>
              </div>
              <button onClick={() => setShowFormModal(false)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-slate-800 bg-slate-950/60 px-6">
              <button
                type="button"
                onClick={() => setActiveTabInModal('general')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTabInModal === 'general' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                }`}
              >
                1. Thông Tin Chung & Dự Án
              </button>
              <button
                type="button"
                onClick={() => setActiveTabInModal('numbers')}
                className={`px-4 py-2.5 text-xs font-semibold border-b-2 transition-colors ${
                  activeTabInModal === 'numbers' ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400'
                }`}
              >
                2. Số Liệu Thẩm Định (5.5.4)
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
              {activeTabInModal === 'general' && (
                <div className="space-y-4">
                  {/* 1. Liên kết Dự án Combobox */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/60 space-y-3">
                    <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Layers className="w-4 h-4 text-sky-400" />
                      1. Liên Kết Dự Án (Tìm theo Tên, Số VB Đến, Số Quyết Định) <span className="text-rose-400">*</span>
                    </label>

                    <div className="relative">
                      <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={projectSearchInput}
                          onFocus={() => setIsProjectDropdownOpen(true)}
                          onChange={e => {
                            setProjectSearchInput(e.target.value);
                            setIsProjectDropdownOpen(true);
                          }}
                          placeholder="Gõ tên dự án, số văn bản đến (VD: 354/BQP-VP) hoặc mã dự án..."
                          className="w-full bg-slate-900 border border-sky-700/80 rounded-lg pl-9 pr-10 py-2.5 text-xs font-medium text-amber-300 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                        {projectSearchInput && (
                          <button
                            type="button"
                            onClick={() => {
                              setProjectSearchInput('');
                              setFormData(prev => ({ ...prev, projectId: '', projectName: '' }));
                              setIsProjectDropdownOpen(true);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* Dropdown Suggestions */}
                      {isProjectDropdownOpen && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 divide-y divide-slate-800">
                          {filteredProjectSuggestions.length === 0 ? (
                            <div className="p-3 text-xs text-slate-500 text-center">
                              Không tìm thấy dự án phù hợp với từ khóa.
                            </div>
                          ) : (
                            filteredProjectSuggestions.map(p => (
                              <div
                                key={p.id}
                                onClick={() => handleSelectProject(p)}
                                className="p-3 hover:bg-slate-800/80 cursor-pointer transition-colors space-y-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-xs text-sky-300">[{p.code}] {p.name}</span>
                                  <span className="text-[10px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-800">
                                    DT: {p.areaHa} ha
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                                  <span>Chủ đầu tư: <strong className="text-slate-300">{p.investor}</strong></span>
                                  <span>Địa điểm: <strong className="text-slate-300">{p.commune}, {p.province}</strong></span>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Selected Project Info Preview */}
                    {formData.projectId && (
                      <div className="bg-sky-950/30 border border-sky-800/60 p-3 rounded-lg flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="text-emerald-300 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            Dự án đã chọn: {formData.projectName}
                          </div>
                          {(() => {
                            const prj = projects.find(p => p.id === formData.projectId);
                            if (!prj) return null;
                            return (
                              <div className="text-slate-300 text-[11px] grid grid-cols-2 gap-x-4 gap-y-1 pt-1">
                                <div>• Chủ đầu tư: <strong>{prj.investor}</strong></div>
                                <div>• Địa điểm: <strong>{prj.commune}, {prj.province}</strong></div>
                                <div>• Diện tích dự án: <strong>{prj.areaHa} ha</strong></div>
                                <div>• Dự toán gốc: <strong>{formatVND(prj.budgetVnd)}</strong></div>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. Trích yếu nội dung */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-300">
                        2. Trích Yếu Nội Dung <span className="text-rose-400">*</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const pName = projects.find(p => p.id === formData.projectId)?.name || '';
                          setFormData(prev => ({ ...prev, contentSummary: getDefaultSummary(pName) }));
                          setIsSummaryCustomized(false);
                        }}
                        className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" /> Khôi phục mẫu mặc định
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.contentSummary || ''}
                      onChange={e => {
                        setFormData({ ...formData, contentSummary: e.target.value });
                        setIsSummaryCustomized(true);
                      }}
                      placeholder="Mẫu: Kết quả thẩm định phương án kỹ thuật thi công và dự toán rà phá bom mìn vật nổ dự án..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      required
                    />
                  </div>

                  {/* 3. Số thông báo & Ký hiệu thông báo + Loại thông báo */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>Số Thông Báo <span className="text-rose-400">*</span></span>
                      </label>
                      <input
                        type="text"
                        value={formData.noticeNumber || ''}
                        onChange={e => {
                          const cleanVal = e.target.value.replace(/\D/g, '');
                          const parsedSeq = parseInt(cleanVal, 10);
                          const newSymbol = cleanVal ? `${cleanVal}${APPRAISAL_NOTICE_SYMBOL_SUFFIX}` : '';
                          
                          setFormData(prev => ({
                            ...prev,
                            noticeNumber: cleanVal,
                            noticeNumberSeq: isNaN(parsedSeq) ? 0 : parsedSeq,
                            codeSymbol: newSymbol
                          }));

                          if (!cleanVal) {
                            setFormErrors(prev => ({ ...prev, noticeNumber: 'Vui lòng nhập số thông báo hợp lệ' }));
                          } else if (parsedSeq <= 0) {
                            setFormErrors(prev => ({ ...prev, noticeNumber: 'Vui lòng nhập số thông báo hợp lệ' }));
                          } else if (AppraisalNoticeCounterService.isNumberDuplicate(parsedSeq, editingNotice?.id, appraisalNotices)) {
                            setFormErrors(prev => ({ ...prev, noticeNumber: 'Số thông báo này đã tồn tại. Vui lòng chọn số khác' }));
                          } else {
                            setFormErrors(prev => ({ ...prev, noticeNumber: undefined }));
                          }
                        }}
                        placeholder="Nhập số thông báo..."
                        className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-slate-100 font-mono font-bold text-xs focus:outline-none ${
                          formErrors.noticeNumber
                            ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30'
                            : 'border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30'
                        }`}
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Hệ thống tự động đề xuất số tiếp theo; có thể điều chỉnh khi cần
                      </span>
                      {formErrors.noticeNumber && (
                        <p className="text-[11px] text-rose-400 mt-1 font-medium">{formErrors.noticeNumber}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Ký Hiệu Thông Báo
                      </label>
                      <input
                        type="text"
                        readOnly
                        value={formData.codeSymbol || ''}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-lg px-3 py-2 text-amber-300 font-mono font-bold text-xs cursor-not-allowed"
                      />
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Tự động gắn hậu tố {APPRAISAL_NOTICE_SYMBOL_SUFFIX}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Loại Thông Báo Thẩm Định</label>
                      <select
                        value={formData.appraisalType || 'khao_sat_thi_cong'}
                        onChange={e => setFormData({ ...formData, appraisalType: e.target.value as AppraisalType })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 text-xs font-semibold focus:outline-none focus:border-sky-500"
                      >
                        {APPRAISAL_TYPE_OPTIONS.map(opt => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 4. Ngày Ban Hành & Ngày Nhận */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Ngày Ban Hành Thông Báo <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.issueDate || ''}
                        onChange={e => setFormData({ ...formData, issueDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                        required
                      />
                      {formData.issueDate && formData.issueDate > formatDateForInput(new Date()) && (
                        <div className="text-amber-400 text-xs flex items-center gap-1.5 font-medium mt-1 bg-amber-950/60 p-2 rounded-lg border border-amber-800/60">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Cảnh báo: Ngày ban hành chọn ở tương lai ({formatDateVN(formData.issueDate)}). Vui lòng kiểm tra lại.</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Ngày Nhận / Lưu Hệ Thống
                      </label>
                      <input
                        type="date"
                        value={formData.receiveDate || ''}
                        onChange={e => setFormData({ ...formData, receiveDate: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-sky-500"
                      />
                    </div>
                  </div>

                  {/* 5. Cơ quan thẩm định & Người ký thông báo */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <AppraisalAuthoritySelect
                      valueCode={formData.appraisalAuthorityCode}
                      valueName={formData.appraisalAgency}
                      onChange={(code, label) => {
                        setFormData(prev => ({
                          ...prev,
                          appraisalAuthorityCode: code,
                          appraisalAgency: label,
                          appraisalAuthorityNameSnapshot: label
                        }));
                        setFormErrors(prev => ({ ...prev, appraisalAuthority: undefined }));
                      }}
                      error={formErrors.appraisalAuthority}
                    />

                    <AppraisalNoticeSignerInput
                      value={formData.signerName || formData.signerDisplayName || ''}
                      onChange={val => {
                        setFormData(prev => ({
                          ...prev,
                          signerName: val,
                          signerDisplayName: val,
                          signerNameSnapshot: val
                        }));
                        if (val.trim()) {
                          setFormErrors(prev => ({ ...prev, signer: undefined }));
                        }
                      }}
                      error={formErrors.signer}
                    />
                  </div>

                  {/* 5. Tệp đính kèm (PDF Upload, View, Download, Delete) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-sky-400" />
                        Tệp Đính Kèm Thông Báo (Chấp nhận PDF)
                      </span>
                      {isUploadingFile && (
                        <span className="text-amber-400 text-xs font-normal animate-pulse">
                          Đang tải tệp lên ({uploadProgress}%)...
                        </span>
                      )}
                    </label>

                    {/* File Dropzone */}
                    <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 rounded-xl p-4 text-center bg-slate-900/50 transition-colors relative">
                      <input
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileUpload}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <div className="text-xs font-medium text-slate-300">
                        Nhấp hoặc kéo thả tệp PDF vào đây để tải lên
                      </div>
                      <div className="text-[11px] text-slate-500">Định dạng file: .pdf</div>
                    </div>

                    {/* Uploaded Files List */}
                    {formData.attachments && formData.attachments.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <div className="text-xs font-semibold text-slate-400">Tệp đã đính kèm:</div>
                        {formData.attachments.map(att => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-xs"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <FileText className="w-4 h-4 text-red-400 shrink-0" />
                              <span className="font-medium text-slate-200 truncate">{att.name}</span>
                              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">
                                Đã tải lên
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => setPdfViewerFile({ title: att.name, url: att.url })}
                                className="p-1 px-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-sky-400 rounded flex items-center gap-1"
                              >
                                <Eye className="w-3.5 h-3.5" /> Xem
                              </button>
                              <a
                                href={att.url}
                                download={att.name}
                                className="p-1 px-2 text-[11px] bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded flex items-center gap-1"
                              >
                                <Download className="w-3.5 h-3.5" /> Tải về
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteAttachment(att.id)}
                                className="p-1 text-slate-400 hover:text-rose-400 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTabInModal === 'numbers' && (
                <div className="space-y-4">
                  <div className="bg-sky-950/30 border border-sky-800/60 p-3 rounded-xl text-xs text-sky-200 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                    <span><strong>Section 5.5.4 Số Liệu Thẩm Định:</strong> Liên kết trực tiếp giữa Văn bản đến, Dự án và Thông báo thẩm định.</span>
                  </div>

                  {/* 1. Cấp giao nhiệm vụ & Văn bản đến Quyết định */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-amber-400" />
                      1. Cấp Giao Nhiệm Vụ (Nhận diện tự động từ Văn bản đến)
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Cấp Giao Nhiệm Vụ Cho Dự Án</label>
                        <div className="flex gap-4 bg-slate-900 p-2 rounded-lg border border-slate-800">
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-200">
                            <input
                              type="radio"
                              name="task_authority"
                              value="bo_quoc_phong"
                              checked={formData.taskAuthority === 'bo_quoc_phong'}
                              onChange={() => setFormData({ ...formData, taskAuthority: 'bo_quoc_phong' })}
                              className="text-amber-500 focus:ring-0"
                            />
                            Bộ Quốc phòng
                          </label>
                          <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-200">
                            <input
                              type="radio"
                              name="task_authority"
                              value="bo_tu_lenh"
                              checked={formData.taskAuthority === 'bo_tu_lenh'}
                              onChange={() => setFormData({ ...formData, taskAuthority: 'bo_tu_lenh' })}
                              className="text-amber-500 focus:ring-0"
                            />
                            Binh chủng Công binh
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Số / Ký Hiệu Quyết Định Giao Nhiệm Vụ</label>
                        <input
                          type="text"
                          value={formData.decisionDocCode || ''}
                          onChange={e => setFormData({ ...formData, decisionDocCode: e.target.value })}
                          placeholder="Ví dụ: 354/QĐ-BQP"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-amber-300 font-mono font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2. Nhận diện công tác & Thông tin dự án (Section 5.5.4) */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-sky-400 uppercase tracking-wider">
                        2. Nhận Diện Công Tác & Thông Tin Dự Án (Mục 5.5.4)
                      </label>
                      <span className="text-[10px] bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded font-medium">
                        Cho phép chọn nhiều • Không khóa cứng
                      </span>
                    </div>

                    {(() => {
                      const prj = projects.find(p => p.id === formData.projectId);
                      const locationStr = prj ? `${prj.commune || ''}, ${prj.province || ''}` : 'Chưa có';

                      return (
                        <div className="space-y-4 text-xs">
                          {/* Data Source Indicator */}
                          <div className="bg-sky-950/40 border border-sky-800/60 p-3 rounded-xl flex items-center justify-between gap-3 text-sky-300">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-sky-400 shrink-0" />
                              <span>
                                Nguồn dữ liệu nhận diện: <strong>Dự án {prj ? `[${prj.code}] ${prj.name}` : '(Chưa chọn)'}</strong> 
                                {prj?.workType && <span className="text-slate-400 italic font-normal"> — Loại hình: {prj.workType}</span>}
                              </span>
                            </div>
                            {prj && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                                Đã kết nối tự động
                              </span>
                            )}
                          </div>

                          {/* Work Categories Multi-Select Selection */}
                          <div>
                            <span className="text-slate-300 font-bold block mb-2">
                              Danh sách công tác thuộc Thông báo thẩm định (Chọn/bỏ chọn tùy ý):
                            </span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {WORK_CATEGORY_OPTIONS.map(wc => {
                                const isChecked = (formData.workCategoriesArray || ['thi_cong_rpbm', 'khao_sat_pakt']).includes(wc.id);
                                return (
                                  <label
                                    key={wc.id}
                                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                                      isChecked
                                        ? 'bg-sky-950/60 border-sky-500/80 text-sky-200 font-semibold shadow-sm'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800/80'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={e => {
                                        const current = formData.workCategoriesArray || ['thi_cong_rpbm', 'khao_sat_pakt'];
                                        const updated = e.target.checked
                                          ? [...current, wc.id]
                                          : current.filter(id => id !== wc.id);
                                        setFormData({
                                          ...formData,
                                          workCategoriesArray: updated
                                        });
                                      }}
                                      className="rounded text-sky-500 focus:ring-0 bg-slate-950 border-slate-700 w-4 h-4"
                                    />
                                    <span>{wc.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          {/* Linked Project Key Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-800/80">
                            <div>
                              <span className="text-slate-400 block mb-0.5">3.1. Tên dự án:</span>
                              <input
                                type="text"
                                readOnly
                                value={formData.projectName || 'Chưa chọn'}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 font-medium cursor-not-allowed"
                              />
                            </div>

                            <div>
                              <span className="text-slate-400 block mb-0.5">3.2. Chủ đầu tư dự án:</span>
                              <input
                                type="text"
                                readOnly
                                value={prj?.investor || 'Chưa có'}
                                className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 cursor-not-allowed"
                              />
                            </div>

                            <div className="md:col-span-2">
                              <span className="text-slate-400 block mb-0.5">3.3. Địa điểm thực hiện (Xã/Phường, Tỉnh/Thành):</span>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  readOnly
                                  value={locationStr}
                                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-slate-200 cursor-not-allowed"
                                />
                                <button
                                  type="button"
                                  onClick={() => alert('Chức năng điều hướng: Hãy chuyển qua tab "Dự Án" trong menu chính để chỉnh sửa địa điểm nguồn của dự án này.')}
                                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-[11px] font-medium whitespace-nowrap"
                                >
                                  Đi tới Dự án
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. Diện tích RPBM được duyệt & Diện tích dự án */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      3.4. Diện Tích RPBM Được Duyệt (ha) & 3.5. Đối Chiếu Diện Tích Dự Án
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Trên Cạn (ha)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.landAreaHa ?? 0}
                          onChange={e => handleLandAreaChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Dưới Nước (ha)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.waterAreaHa ?? 0}
                          onChange={e => handleWaterAreaChange(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs"
                        />
                      </div>

                      <div>
                        <label className="block text-xs text-emerald-400 font-bold mb-1">Tổng Diện Tích Thẩm Định (ha)</label>
                        <input
                          type="number"
                          readOnly
                          value={formData.approvedClearanceAreaHa ?? 0}
                          className="w-full bg-slate-900/90 border border-emerald-600/80 rounded-lg px-3 py-1.5 text-emerald-400 font-mono font-bold text-xs cursor-not-allowed"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">Tự tính: Trên cạn + Dưới nước</span>
                      </div>
                    </div>

                    {/* Đối chiếu diện tích gốc dự án */}
                    {(() => {
                      const prj = projects.find(p => p.id === formData.projectId);
                      if (!prj) return null;
                      return (
                        <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-center justify-between">
                          <span>3.5. Tổng diện tích gốc dự án: <strong className="text-slate-200">{prj.totalAreaHa || prj.areaHa} ha</strong></span>
                          <span>(Trên cạn: {prj.landAreaHa || (prj.areaHa * 0.9)} ha | Dưới nước: {prj.underwaterAreaHa || (prj.areaHa * 0.1)} ha)</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 4. Dự toán được duyệt, Diện tích thực hiện trong kỳ & Giá trị thực hiện */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                    <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                      3.6, 3.7 & 3.8. Giá Trị Dự Toán & Số Liệu Thực Hiện Trong Kỳ Báo Cáo
                    </label>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-amber-300 font-bold mb-1">3.6. Dự Toán Được Duyệt (VNĐ)</label>
                        <input
                          type="number"
                          value={formData.approvedBudgetValueVnd ?? 0}
                          onChange={e => setFormData({ ...formData, approvedBudgetValueVnd: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full bg-slate-900 border border-amber-500 rounded-lg px-3 py-1.5 text-amber-300 font-mono text-xs font-bold"
                        />
                        <span className="text-[10px] text-amber-400/80 mt-0.5 block font-mono">
                          {formatVND(formData.approvedBudgetValueVnd || 0)}
                        </span>
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">3.7. Diện Tích Thực Hiện Trong Kỳ (ha)</label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={formData.reportingPeriodAreaHa ?? 0}
                          onChange={e => setFormData({ ...formData, reportingPeriodAreaHa: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className={`w-full bg-slate-900 border rounded-lg px-3 py-1.5 font-mono text-xs ${
                            areaWarning ? 'border-rose-500 text-rose-300' : 'border-slate-700 text-slate-100'
                          }`}
                        />
                        {areaWarning && (
                          <span className="text-[10px] text-rose-400 mt-1 block flex items-center gap-1 font-semibold">
                            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                            Cảnh báo: Diện tích trong kỳ lớn hơn diện tích được duyệt ({formData.approvedClearanceAreaHa} ha).
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs text-slate-300 mb-1">3.8. Giá Trị Thực Hiện Trong Kỳ (VNĐ)</label>
                        <input
                          type="number"
                          value={formData.reportingPeriodValueVnd ?? 0}
                          onChange={e => setFormData({ ...formData, reportingPeriodValueVnd: Math.max(0, parseFloat(e.target.value) || 0) })}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 font-mono text-xs"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block font-mono">
                          {formatVND(formData.reportingPeriodValueVnd || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  title="Lưu số liệu thẩm định"
                  aria-label="Lưu số liệu thẩm định"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-lg shadow-sky-600/30 flex items-center gap-1.5"
                >
                  {editingNotice ? 'Lưu Thay Đổi' : 'Lưu Số Liệu Thẩm Định'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Detail Modal */}
      {selectedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl text-slate-100">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
              <div>
                <h3 className="font-bold text-base text-amber-400 font-mono">{selectedNotice.codeSymbol}</h3>
                <p className="text-xs text-slate-400">Hồ sơ Thông báo thẩm định dự án RPBM</p>
              </div>
              <button onClick={() => setSelectedNotice(null)} className="p-1 text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="text-sm font-semibold text-slate-100 border-b border-slate-800 pb-2">
                  {selectedNotice.contentSummary}
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div>Dự án liên kết: <span className="text-emerald-300 font-bold">{selectedNotice.projectName || projects.find(p => p.id === selectedNotice.projectId)?.name}</span></div>
                  <div>Cơ quan thẩm định: <span className="text-slate-200 font-medium">{selectedNotice.appraisalAgency}</span></div>
                  <div>Người ký: <span className="text-slate-200 font-medium">{selectedNotice.signerName}</span></div>
                  <div>Cấp giao nhiệm vụ: <span className="text-amber-300 font-bold">{selectedNotice.taskAuthority === 'bo_quoc_phong' ? 'Bộ Quốc phòng' : 'Binh chủng Công binh'}</span></div>
                  <div>Số quyết định giao nhiệm vụ: <span className="text-slate-200 font-mono font-bold">{selectedNotice.decisionDocCode || 'N/A'}</span></div>
                  <div>Ngày ban hành: <span className="text-slate-200">{formatDateVN(selectedNotice.issueDate)}</span></div>
                </div>
              </div>

              {/* Snapshot Comparison */}
              {selectedNotice.projectSnapshot && (
                <div className="bg-slate-950 p-4 rounded-xl border border-sky-900/60 space-y-2">
                  <div className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                    <History className="w-4 h-4 text-sky-400" />
                    Dữ liệu Snapshot tại ngày lập thông báo ({formatDateVN(selectedNotice.projectSnapshot.snapshotDate)})
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-slate-300 text-[11px]">
                    <div>Tên dự án snapshot: <strong>{selectedNotice.projectSnapshot.projectName}</strong></div>
                    <div>Địa điểm: <strong>{selectedNotice.projectSnapshot.location}</strong></div>
                    <div>Chủ đầu tư: <strong>{selectedNotice.projectSnapshot.investor}</strong></div>
                    <div>Dự toán phê duyệt: <strong className="text-amber-300 font-mono">{formatVND(selectedNotice.projectSnapshot.approvedBudgetValueVnd)}</strong></div>
                  </div>
                </div>
              )}

              {/* Numbers Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-emerald-950/30 border border-emerald-800/50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block mb-1">Diện tích RPBM được duyệt:</span>
                  <span className="text-lg font-mono font-bold text-emerald-400">{selectedNotice.approvedClearanceAreaHa.toFixed(3)} ha</span>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Cạn: {selectedNotice.landAreaHa.toFixed(3)} ha | Nước: {selectedNotice.waterAreaHa.toFixed(3)} ha
                  </div>
                </div>

                <div className="bg-amber-950/30 border border-amber-800/50 p-3 rounded-xl">
                  <span className="text-slate-400 font-semibold block mb-1">Dự toán được duyệt:</span>
                  <span className="text-lg font-mono font-bold text-amber-300">{formatVND(selectedNotice.approvedBudgetValueVnd)}</span>
                  <div className="text-[11px] text-slate-400 mt-1 font-mono">
                    Thực hiện trong kỳ: {formatVND(selectedNotice.reportingPeriodValueVnd || 0)}
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              {selectedNotice.attachments && selectedNotice.attachments.length > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-slate-300">File scan PDF đính kèm:</div>
                  <div className="flex flex-wrap gap-2">
                    {selectedNotice.attachments.map(att => (
                      <button
                        key={att.id}
                        onClick={() => setPdfViewerFile({ title: att.name, url: att.url })}
                        className="px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-sky-500 rounded-lg text-sky-300 text-xs flex items-center gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5 text-red-400" />
                        {att.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-800">
                <button
                  onClick={() => {
                    onConfirmProjectDataUpdate(selectedNotice);
                    alert('Đã cập nhật bộ số liệu thẩm định hiện hành vào thông tin chính thức của Dự án!');
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold flex items-center gap-2 text-xs"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Xác Nhận Đồng Bộ Vào Dự Án
                </button>
                <button
                  onClick={() => setSelectedNotice(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-xs font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Direct Viewer Modal */}
      {pdfViewerFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="w-5 h-5 text-red-400 shrink-0" />
                <h3 className="font-bold text-slate-100 text-sm md:text-base truncate">
                  {pdfViewerFile.title}
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {pdfViewerFile.url && (
                  <a
                    href={pdfViewerFile.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs font-medium flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Mở tab mới
                  </a>
                )}
                <button
                  onClick={() => setPdfViewerFile(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 hover:bg-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 bg-slate-950 p-2 sm:p-4 flex flex-col relative overflow-hidden">
              {pdfViewerFile.url ? (
                <iframe
                  src={pdfViewerFile.url}
                  className="w-full h-full rounded-xl border border-slate-800 bg-slate-900"
                  title="PDF Document Viewer"
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-3">
                  <AlertCircle className="w-10 h-10 text-amber-400" />
                  <p className="text-sm">Tệp đính kèm không khả dụng.</p>
                </div>
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400 px-5">
              <span>📌 Trình xem tệp PDF Thông báo thẩm định</span>
              <button
                onClick={() => setPdfViewerFile(null)}
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
