import React, { useState, useMemo } from 'react';
import {
  Users,
  Plus,
  Search,
  Award,
  Clock,
  Phone,
  Mail,
  Building,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  FolderOpen,
  X,
  Edit2,
  Trash2,
  Download,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  FileText,
  Filter,
  Briefcase,
  Calendar,
  MapPin,
  UserCheck,
  Paperclip,
  FileCheck,
  Eye,
  RefreshCw,
  SlidersHorizontal,
  Info,
  FileSpreadsheet,
  Check
} from 'lucide-react';
import {
  Personnel,
  PersonnelCertificate,
  PersonnelAttachment,
  CertCategoryType,
  PersonnelWorkStatus
} from '../types';
import { getPersonnel, savePersonnel, getCurrentUser, getProjects } from '../utils/storage';
import { formatDateVN, formatDateForInput, getDaysRemaining } from '../utils/formatters';
import { exportPersonnelExcel, exportPersonnelKeyProfileOfficialExcel } from '../utils/exportUtils';
import {
  checkPersonnelDuplicates,
  PersonnelDuplicateCheckResult,
  maskCCCD,
  maskEmail,
  maskPhone
} from '../utils/validationRules';

// Dictionary for Certificate Category Types
export const CERT_TYPES: { id: CertCategoryType | string; label: string; defaultTitle?: string; iconBg: string }[] = [
  { id: 'doi_truong', label: 'Đội trưởng', defaultTitle: 'Đội trưởng điều tra, khảo sát, rà phá bom mìn, vật nổ', iconBg: 'bg-purple-950 text-purple-400 border-purple-800' },
  { id: 'ky_thuat_vien', label: 'Kỹ thuật viên', defaultTitle: 'Kỹ thuật viên RPBM cấp I', iconBg: 'bg-blue-950 text-blue-400 border-blue-800' },
  { id: 'giam_sat_vien', label: 'Giám sát viên', defaultTitle: 'Giám sát viên về điều tra, khảo sát, rà phá bom mìn vật nổ', iconBg: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
  { id: 'quan_ly_chat_luong', label: 'Quản lý chất lượng', defaultTitle: 'Quản lý chất lượng về điều tra, khảo sát, rà phá bom mìn vật nổ', iconBg: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  { id: 'tho_lan', label: 'Thợ lặn', defaultTitle: 'Chứng chỉ Thợ lặn thi công RPBM', iconBg: 'bg-teal-950 text-teal-400 border-teal-800' },
  { id: 'chi_huy_truong', label: 'Chứng chỉ Chỉ huy trưởng', defaultTitle: 'Chứng chỉ Chỉ huy trưởng công trường RPBM', iconBg: 'bg-purple-950 text-purple-400 border-purple-800' },
  { id: 'an_toan_lao_dong', label: 'An toàn lao động', defaultTitle: 'Chứng chỉ An toàn lao động RPBM', iconBg: 'bg-amber-950 text-amber-400 border-amber-800' },
  { id: 'nghiep_vu_rpbm', label: 'Nghiệp vụ RPBM', defaultTitle: 'Chứng chỉ Nghiệp vụ Rà phá Bom mìn', iconBg: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  { id: 'khac', label: 'Khác', defaultTitle: 'Giấy tờ chuyên ngành khác', iconBg: 'bg-slate-800 text-slate-300 border-slate-700' }
];

export const SPECIALIZATION_SUGGESTIONS = [
  'Kỹ thuật viên điều tra, khảo sát, rà phá bom mìn vật nổ.',
  'Đội trưởng điều tra, khảo sát, rà phá bom mìn, vật nổ.',
  'Giám sát viên về điều tra, khảo sát, rà phá bom mìn vật nổ.',
  'Quản lý chất lượng về điều tra, khảo sát, rà phá bom mìn vật nổ.'
];

export const KTV_LEVEL_OPTIONS = [
  'Kỹ thuật viên RPBM cấp I',
  'Kỹ thuật viên RPBM cấp II',
  'Kỹ thuật viên RPBM cấp III',
  'Kỹ thuật viên RPBM cấp IV'
];

export const WORK_STATUS_MAP: Record<PersonnelWorkStatus, { label: string; badge: string }> = {
  dang_cong_tac: { label: 'Đang công tác', badge: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  tam_nghi: { label: 'Tạm nghỉ', badge: 'bg-amber-950 text-amber-400 border-amber-800' },
  chuyen_cong_tac: { label: 'Chuyển công tác', badge: 'bg-blue-950 text-blue-400 border-blue-800' },
  nghi_huu: { label: 'Nghỉ hưu', badge: 'bg-slate-800 text-slate-400 border-slate-700' }
};

export const WARNING_THRESHOLDS = [180, 90, 60, 30, 15, 7];

export const PersonnelManager: React.FC = () => {
  const [personnelList, setPersonnelState] = useState<Personnel[]>(getPersonnel());
  const projects = useMemo(() => getProjects(), []);

  // Main navigation tab
  const [activeSubTab, setActiveSubTab] = useState<'profiles' | 'certificates' | 'alerts' | 'reports'>('profiles');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [certTypeFilter, setCertTypeFilter] = useState<string>('all');
  const [certStatusFilter, setCertStatusFilter] = useState<string>('all');
  const [thresholdFilter, setThresholdFilter] = useState<number | 'all'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');

  // Detail Drawer / Modal state
  const [selectedPerson, setSelectedPerson] = useState<Personnel | null>(null);
  const [showAddPersonModal, setShowAddPersonModal] = useState<boolean>(false);
  const [editingPerson, setEditingPerson] = useState<Personnel | null>(null);
  const [showAddCertModal, setShowAddCertModal] = useState<Personnel | null>(null);
  const [showAttachFileModal, setShowAttachFileModal] = useState<Personnel | null>(null);

  // Official Excel Export Modal State (Document5 Page 2)
  const [showOfficialExportModal, setShowOfficialExportModal] = useState<boolean>(false);
  const [exportScopeOption, setExportScopeOption] = useState<'all' | 'filtered'>('all');
  const [showMissingFieldsAnalysis, setShowMissingFieldsAnalysis] = useState<boolean>(false);

  // Anti-duplicate check State
  const [duplicateWarningState, setDuplicateWarningState] = useState<{
    isOpen: boolean;
    result: PersonnelDuplicateCheckResult | null;
  }>({
    isOpen: false,
    result: null
  });
  const [definiteDuplicateError, setDefiniteDuplicateError] = useState<string | null>(null);

  // Person form state
  const [personForm, setPersonForm] = useState<Partial<Personnel>>({
    code: '',
    fullName: '',
    dob: '1988-06-15',
    hometown: 'Hà Nội',
    position: 'Cán bộ Kỹ thuật',
    jobTitle: 'Kỹ sư RPBM',
    rankTitle: 'Đại úy',
    specialization: 'Rà phá Bom mìn & Vật nổ',
    unit: 'Phòng Nghiệp vụ Rà phá Bom mìn',
    phone: '',
    email: '',
    workStatus: 'dang_cong_tac',
    currentProjectId: '',
    currentProjectName: '',
    roleInTeam: 'Cán bộ Kỹ thuật RPBM',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  });

  // Certificate form state
  const [certForm, setCertForm] = useState<Partial<PersonnelCertificate>>({
    certType: 'nghiep_vu_rpbm',
    name: 'Chứng chỉ Kỹ thuật viên Rà phá Bom mìn Cấp 2',
    certificateNo: `KTV2-2026-${Math.floor(100 + Math.random() * 900)}`,
    issuedBy: 'Trung tâm Công nghệ Xử lý Bom mìn Môi trường (BMTT) / BQP',
    issueDate: formatDateForInput(new Date()),
    effectiveDate: formatDateForInput(new Date()),
    expiryDate: formatDateForInput(new Date(Date.now() + 365 * 3 * 24 * 3600 * 1000)),
    scopeOfPractice: 'Thi công rà phá bom mìn mặt bằng đến độ sâu 3m',
    scanFileUrl: 'https://drive.google.com/file/d/sample-cert/view',
    notes: 'Bản chính lưu tại phòng tổ chức cán bộ'
  });

  // Attachment form state
  const [attachmentForm, setAttachmentForm] = useState<{ fileName: string; fileUrl: string; notes: string }>({
    fileName: '',
    fileUrl: '',
    notes: ''
  });

  // Filtered personnel list
  const filteredPersonnel = useMemo(() => {
    return personnelList
      .filter(p => p.dataStatus !== 'da_xoa')
      .filter(p => {
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = p.fullName.toLowerCase().includes(q);
          const matchCode = p.code.toLowerCase().includes(q);
          const matchTitle = (p.rankTitle || '').toLowerCase().includes(q) || (p.jobTitle || '').toLowerCase().includes(q);
          const matchPos = (p.position || '').toLowerCase().includes(q) || (p.roleInTeam || '').toLowerCase().includes(q);
          const matchTown = (p.hometown || '').toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchTitle && !matchPos && !matchTown) return false;
        }
        if (statusFilter !== 'all' && (p.workStatus || 'dang_cong_tac') !== statusFilter) return false;
        if (projectFilter !== 'all' && p.currentProjectId !== projectFilter) return false;
        return true;
      });
  }, [personnelList, searchQuery, statusFilter, projectFilter]);

  // All certificates flattened
  const allCertificates = useMemo(() => {
    const list: { person: Personnel; cert: PersonnelCertificate }[] = [];
    personnelList
      .filter(p => p.dataStatus !== 'da_xoa')
      .forEach(person => {
        person.certificates.forEach(cert => {
          list.push({ person, cert });
        });
      });
    return list;
  }, [personnelList]);

  // Filtered certificates
  const filteredCertificates = useMemo(() => {
    return allCertificates.filter(({ person, cert }) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchPerson = person.fullName.toLowerCase().includes(q) || person.code.toLowerCase().includes(q);
        const matchCertName = cert.name.toLowerCase().includes(q) || cert.certificateNo.toLowerCase().includes(q);
        const matchIssuer = cert.issuedBy.toLowerCase().includes(q);
        if (!matchPerson && !matchCertName && !matchIssuer) return false;
      }

      if (certTypeFilter !== 'all' && cert.certType !== certTypeFilter) return false;

      const days = getDaysRemaining(cert.expiryDate);
      if (certStatusFilter === 'con_han' && (days <= 0 || days <= 60)) return false;
      if (certStatusFilter === 'sap_het_han' && (days <= 0 || days > 60)) return false;
      if (certStatusFilter === 'qua_han' && days > 0) return false;

      if (thresholdFilter !== 'all') {
        if (days < 0 || days > Number(thresholdFilter)) return false;
      }

      return true;
    });
  }, [allCertificates, searchQuery, certTypeFilter, certStatusFilter, thresholdFilter]);

  // Expiry alerts summary
  const alertsByThreshold = useMemo(() => {
    const map: Record<number | 'expired', { person: Personnel; cert: PersonnelCertificate; days: number }[]> = {
      expired: [],
      7: [],
      15: [],
      30: [],
      60: [],
      90: [],
      180: []
    };

    allCertificates.forEach(({ person, cert }) => {
      if (cert.isLifetime) return; // Skip lifetime certificates for expiration alerts
      const days = getDaysRemaining(cert.expiryDate);
      if (days <= 0) {
        map.expired.push({ person, cert, days });
      } else {
        if (days <= 7) map[7].push({ person, cert, days });
        if (days <= 15) map[15].push({ person, cert, days });
        if (days <= 30) map[30].push({ person, cert, days });
        if (days <= 60) map[60].push({ person, cert, days });
        if (days <= 90) map[90].push({ person, cert, days });
        if (days <= 180) map[180].push({ person, cert, days });
      }
    });

    return map;
  }, [allCertificates]);

  // Compliance check: Unqualified personnel (missing mandatory certs or expired)
  const unqualifiedPersonnelReport = useMemo(() => {
    const items: {
      person: Personnel;
      missingRoleCerts: string[];
      expiredCerts: PersonnelCertificate[];
      isCritical: boolean;
      recommendation: string;
    }[] = [];

    personnelList
      .filter(p => p.dataStatus !== 'da_xoa')
      .forEach(p => {
        const missing: string[] = [];
        const roleLower = ((p.position || '') + ' ' + (p.roleInTeam || '')).toLowerCase();
        const activeCertTypes = p.certificates
          .filter(c => c.isLifetime || getDaysRemaining(c.expiryDate) > 0)
          .map(c => c.certType || 'khac');

        const expiredCerts = p.certificates.filter(c => !c.isLifetime && getDaysRemaining(c.expiryDate) <= 0);

        // Rule checking
        if (roleLower.includes('chỉ huy trưởng') || roleLower.includes('trưởng phòng')) {
          if (!activeCertTypes.includes('chi_huy_truong')) {
            missing.push('Chứng chỉ Chỉ huy trưởng RPBM (Còn hạn)');
          }
          if (!activeCertTypes.includes('nghiep_vu_rpbm')) {
            missing.push('Chứng chỉ Nghiệp vụ RPBM (KTV Cấp 3)');
          }
        }

        if (roleLower.includes('kỹ thuật') || roleLower.includes('cán bộ kỹ thuật')) {
          if (!activeCertTypes.includes('can_bo_ky_thuat') && !activeCertTypes.includes('nghiep_vu_rpbm')) {
            missing.push('Chứng chỉ Cán bộ kỹ thuật / KTV RPBM');
          }
        }

        if (roleLower.includes('giám sát')) {
          if (!activeCertTypes.includes('giam_sat')) {
            missing.push('Chứng chỉ Giám sát Chất lượng & An toàn RPBM');
          }
        }

        if (roleLower.includes('an toàn')) {
          if (!activeCertTypes.includes('an_toan_lao_dong')) {
            missing.push('Chứng nhận Huấn luyện An toàn Vệ sinh Lao động');
          }
        }

        if (roleLower.includes('y tế') || roleLower.includes('cứu thương')) {
          if (!activeCertTypes.includes('so_cap_cuu')) {
            missing.push('Chứng chỉ Cấp cứu Dã chiến RPBM');
          }
        }

        if (roleLower.includes('lái xe')) {
          if (!activeCertTypes.includes('giay_phep_lai_xe')) {
            missing.push('Giấy phép Lái xe Hạng C/Quân sự');
          }
        }

        if (missing.length > 0 || expiredCerts.length > 0) {
          items.push({
            person: p,
            missingRoleCerts: missing,
            expiredCerts,
            isCritical: missing.length > 0 || expiredCerts.some(c => c.certType === 'chi_huy_truong' || c.certType === 'nghiep_vu_rpbm'),
            recommendation: missing.length > 0
              ? `Yêu cầu cử đi đào tạo/bổ sung: ${missing.join(', ')}`
              : `Yêu cầu gia hạn khẩn cấp ${expiredCerts.length} chứng chỉ đã quá hạn.`
          });
        }
      });

    return items;
  }, [personnelList]);

  // Project Compliance Report
  const projectComplianceReport = useMemo(() => {
    const selectedProj = projects.find(p => p.id === selectedProjectId) || projects[0];
    if (!selectedProj) return null;

    const assignedPeople = personnelList
      .filter(p => p.dataStatus !== 'da_xoa')
      .filter(p => p.currentProjectId === selectedProj.id || p.fullName === selectedProj.commanderName);

    const evaluation = assignedPeople.map(p => {
      const activeCerts = p.certificates.filter(c => getDaysRemaining(c.expiryDate) > 0);
      const expiredCerts = p.certificates.filter(c => getDaysRemaining(c.expiryDate) <= 0);

      const hasCommanderCert = activeCerts.some(c => c.certType === 'chi_huy_truong');
      const hasTechCert = activeCerts.some(c => c.certType === 'can_bo_ky_thuat' || c.certType === 'nghiep_vu_rpbm');
      const hasSafetyCert = activeCerts.some(c => c.certType === 'an_toan_lao_dong');

      let isQualified = true;
      const issues: string[] = [];

      if (p.fullName === selectedProj.commanderName && !hasCommanderCert) {
        isQualified = false;
        issues.push('Thiếu Chứng chỉ Chỉ huy trưởng RPBM hợp lệ');
      }

      if (expiredCerts.length > 0) {
        isQualified = false;
        issues.push(`Có ${expiredCerts.length} chứng chỉ đã hết hạn`);
      }

      return {
        person: p,
        isQualified,
        issues,
        activeCertsCount: activeCerts.length
      };
    });

    const qualifiedCount = evaluation.filter(e => e.isQualified).length;
    const score = evaluation.length > 0 ? Math.round((qualifiedCount / evaluation.length) * 100) : 100;

    return {
      project: selectedProj,
      assignedPeople: evaluation,
      qualifiedCount,
      totalAssigned: evaluation.length,
      complianceScore: score
    };
  }, [selectedProjectId, projects, personnelList]);

  // Handlers
  const handleOpenAddPerson = () => {
    setPersonForm({
      code: `NS-00${personnelList.length + 1}`,
      fullName: '',
      dob: '1990-01-01',
      hometown: '',
      position: 'Cán bộ Kỹ thuật',
      jobTitle: 'Kỹ sư RPBM',
      rankTitle: 'Đại úy',
      specialization: 'Kỹ thuật viên điều tra, khảo sát, rà phá bom mìn vật nổ.',
      yearsWorkingForEmployer: 5,
      contactPerson: 'Tiểu đoàn trưởng',
      identityCardNo: '',
      employerName: 'Tiểu đoàn 93/Binh chủng Công binh',
      employerAddress: 'Xã Hòa Lạc, thành phố Hà Nội',
      unit: 'Tiểu đoàn 93/Binh chủng Công binh',
      phone: '',
      email: '',
      workStatus: 'dang_cong_tac',
      currentProjectId: projects[0]?.id || '',
      currentProjectName: projects[0]?.name || '',
      roleInTeam: 'Kỹ thuật viên RPBM',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });
    setEditingPerson(null);
    setShowAddPersonModal(true);
  };

  const handleEditPerson = (p: Personnel) => {
    setEditingPerson(p);
    setPersonForm({
      code: p.code,
      fullName: p.fullName,
      dob: p.dob || '1990-01-01',
      hometown: p.hometown || '',
      position: p.position || p.roleInTeam,
      jobTitle: p.jobTitle || p.rankTitle,
      rankTitle: p.rankTitle,
      specialization: p.specialization || '',
      yearsWorkingForEmployer: p.yearsWorkingForEmployer ?? 0,
      contactPerson: p.contactPerson || 'Tiểu đoàn trưởng',
      identityCardNo: p.identityCardNo || '',
      employerName: p.employerName || 'Tiểu đoàn 93/Binh chủng Công binh',
      employerAddress: p.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội',
      unit: p.unit,
      phone: p.phone,
      email: p.email,
      workStatus: p.workStatus || 'dang_cong_tac',
      currentProjectId: p.currentProjectId || '',
      currentProjectName: p.currentProjectName || '',
      roleInTeam: p.roleInTeam,
      avatar: p.avatar
    });
    setShowAddPersonModal(true);
  };

  const handleSavePerson = (e: React.FormEvent, skipDuplicateCheck: boolean = false) => {
    e.preventDefault();
    if (!personForm.fullName) return;

    setDefiniteDuplicateError(null);

    // 1. Service/repository level anti-duplicate check
    if (!skipDuplicateCheck) {
      const dupCheck = checkPersonnelDuplicates(personForm, editingPerson?.id);

      // Hard-block if definite match (CCCD or Email match completely)
      if (dupCheck.hasDefiniteDuplicate) {
        const firstDef = dupCheck.definiteMatches[0];
        setDefiniteDuplicateError(firstDef.message);
        return;
      }

      // Show warning modal if potential match (Name+DOB, Name+Phone, Name+Rank/Unit)
      if (dupCheck.hasPotentialDuplicate) {
        setDuplicateWarningState({
          isOpen: true,
          result: dupCheck
        });
        return;
      }
    }

    executeActualSavePerson();
  };

  const executeActualSavePerson = () => {
    // Check warning if assigning person with expired certificate to a project (Requirement 21)
    if (personForm.currentProjectId && editingPerson) {
      const { checkPersonnelExpiredCertificate } = require('../utils/validationRules');
      const certCheck = checkPersonnelExpiredCertificate(editingPerson.id);
      if (certCheck.hasExpired) {
        if (!confirm(`${certCheck.message}\nBạn có chắc chắn muốn phân công cán bộ này vào dự án không?`)) {
          return;
        }
      }
    }

    const user = getCurrentUser();
    const nowStr = formatDateVN(new Date());

    const selectedProj = projects.find(pr => pr.id === personForm.currentProjectId);

    if (editingPerson) {
      const updated: Personnel = {
        ...editingPerson,
        code: personForm.code || editingPerson.code,
        fullName: personForm.fullName || editingPerson.fullName,
        dob: personForm.dob,
        hometown: personForm.hometown,
        position: personForm.position,
        jobTitle: personForm.jobTitle,
        rankTitle: personForm.rankTitle || editingPerson.rankTitle,
        specialization: personForm.specialization,
        yearsWorkingForEmployer: Math.max(0, Number(personForm.yearsWorkingForEmployer) || 0),
        contactPerson: personForm.contactPerson || 'Tiểu đoàn trưởng',
        identityCardNo: personForm.identityCardNo || '', // If empty string, keep empty string
        employerName: personForm.employerName || 'Tiểu đoàn 93/Binh chủng Công binh',
        employerAddress: personForm.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội',
        unit: personForm.unit || editingPerson.unit,
        phone: personForm.phone || editingPerson.phone,
        email: personForm.email || editingPerson.email,
        workStatus: (personForm.workStatus as PersonnelWorkStatus) || 'dang_cong_tac',
        currentProjectId: personForm.currentProjectId,
        currentProjectName: selectedProj ? selectedProj.name : personForm.currentProjectName,
        roleInTeam: personForm.roleInTeam || editingPerson.roleInTeam,
        avatar: personForm.avatar || editingPerson.avatar,
        updatedBy: user.name,
        updatedAt: nowStr
      };

      const newList = personnelList.map(item => (item.id === editingPerson.id ? updated : item));
      savePersonnel(newList, `Cập nhật thông tin cán bộ: ${updated.fullName}`);
      setPersonnelState(newList);
      if (selectedPerson?.id === editingPerson.id) setSelectedPerson(updated);
    } else {
      const newPerson: Personnel = {
        id: `per-${Date.now()}`,
        code: personForm.code || `NS-00${personnelList.length + 1}`,
        fullName: personForm.fullName,
        dob: personForm.dob,
        hometown: personForm.hometown,
        position: personForm.position || 'Cán bộ',
        jobTitle: personForm.jobTitle || 'Kỹ sư',
        rankTitle: personForm.rankTitle || 'Cán bộ',
        specialization: personForm.specialization || 'Kỹ thuật viên điều tra, khảo sát, rà phá bom mìn vật nổ.',
        yearsWorkingForEmployer: Math.max(0, Number(personForm.yearsWorkingForEmployer) || 0),
        contactPerson: personForm.contactPerson || 'Tiểu đoàn trưởng',
        identityCardNo: personForm.identityCardNo || '', // If empty string, keep empty string
        employerName: personForm.employerName || 'Tiểu đoàn 93/Binh chủng Công binh',
        employerAddress: personForm.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội',
        unit: personForm.unit || 'Tiểu đoàn 93/Binh chủng Công binh',
        phone: personForm.phone || '0900.000.000',
        email: personForm.email || 'canbo@qlrpbm.bqp.vn',
        workStatus: (personForm.workStatus as PersonnelWorkStatus) || 'dang_cong_tac',
        currentProjectId: personForm.currentProjectId,
        currentProjectName: selectedProj ? selectedProj.name : '',
        roleInTeam: personForm.roleInTeam || 'Kỹ thuật viên RPBM',
        avatar: personForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        attachedFiles: [],
        certificates: [],
        createdBy: user.name,
        createdAt: nowStr,
        updatedBy: user.name,
        updatedAt: nowStr,
        departmentOrUnit: user.departmentOrUnit || 'Phòng Nghiệp vụ RPBM',
        dataStatus: 'hoat_dong'
      };

      const newList = [newPerson, ...personnelList];
      savePersonnel(newList, `Thêm cán bộ nhân sự mới: ${newPerson.fullName}`);
      setPersonnelState(newList);
    }

    setShowAddPersonModal(false);
    setEditingPerson(null);
    setDuplicateWarningState({ isOpen: false, result: null });
    setDefiniteDuplicateError(null);
  };

  const handleDeletePerson = (p: Personnel) => {
    if (confirm(`Bạn có chắc muốn chuyển hồ sơ cán bộ "${p.fullName}" vào Thùng rác?`)) {
      const user = getCurrentUser();
      const updated = personnelList.map(item =>
        item.id === p.id
          ? {
              ...item,
              dataStatus: 'da_xoa' as const,
              updatedBy: user.name,
              updatedAt: formatDateVN(new Date())
            }
          : item
      );
      savePersonnel(updated, `Chuyển hồ sơ cán bộ ${p.fullName} vào Thùng rác`);
      setPersonnelState(updated);
      if (selectedPerson?.id === p.id) setSelectedPerson(null);
    }
  };

  const handleOpenAddCert = (p: Personnel) => {
    setShowAddCertModal(p);
    setCertForm({
      certType: 'ky_thuat_vien',
      name: 'Kỹ thuật viên RPBM cấp I',
      certificateNo: `KTV-2026-${Math.floor(100 + Math.random() * 900)}`,
      issuedBy: 'Bộ Quốc phòng / BTTM',
      issueDate: formatDateForInput(new Date()),
      effectiveDate: formatDateForInput(new Date()),
      isLifetime: false,
      expiryDate: formatDateForInput(new Date(Date.now() + 365 * 3 * 24 * 3600 * 1000)),
      scopeOfPractice: 'Thi công rà phá bom mìn mặt bằng đến độ sâu 3m',
      scanFileUrl: '',
      notes: '',
      relatedDocuments: []
    });
  };

  const handleSaveCertificate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAddCertModal || !certForm.name) return;

    const certTypeObj = CERT_TYPES.find(ct => ct.id === certForm.certType);
    const isLifetime = !!certForm.isLifetime;
    const expiryDateStr = isLifetime ? '' : (certForm.expiryDate || formatDateForInput(new Date()));

    let status: 'con_han' | 'sap_het_han' | 'qua_han' = 'con_han';
    if (!isLifetime && expiryDateStr) {
      const days = getDaysRemaining(expiryDateStr);
      if (days <= 0) status = 'qua_han';
      else if (days <= 60) status = 'sap_het_han';
    }

    const newCert: PersonnelCertificate = {
      id: `cert-${Date.now()}`,
      certType: (certForm.certType as any) || 'ky_thuat_vien',
      certTypeLabel: certTypeObj ? certTypeObj.label : certForm.name,
      name: certForm.name,
      certificateNo: certForm.certificateNo || 'CERT-2026',
      issuedBy: certForm.issuedBy || 'Bộ Quốc phòng',
      issueDate: certForm.issueDate || formatDateForInput(new Date()),
      effectiveDate: certForm.effectiveDate || certForm.issueDate || formatDateForInput(new Date()),
      isLifetime,
      expiryDate: isLifetime ? null as any : expiryDateStr,
      scopeOfPractice: certForm.scopeOfPractice || '',
      scanFileUrl: certForm.scanFileUrl || '',
      driveUrl: certForm.scanFileUrl || '',
      status,
      notes: certForm.notes || '',
      relatedDocuments: certForm.relatedDocuments || []
    };

    const updatedPerson: Personnel = {
      ...showAddCertModal,
      certificates: [...showAddCertModal.certificates, newCert]
    };

    const updatedList = personnelList.map(p => (p.id === showAddCertModal.id ? updatedPerson : p));
    savePersonnel(updatedList, `Cấp mới/Gia hạn chứng chỉ cho cán bộ: ${showAddCertModal.fullName}`);
    setPersonnelState(updatedList);
    if (selectedPerson?.id === showAddCertModal.id) setSelectedPerson(updatedPerson);
    setShowAddCertModal(null);
  };

  const handleRenewCertificateQuick = (person: Personnel, cert: PersonnelCertificate) => {
    const newExpiryDate = prompt(
      `Gia hạn chứng chỉ "${cert.name}" cho ${person.fullName}.\nNhập ngày hết hạn mới (YYYY-MM-DD):`,
      formatDateForInput(new Date(Date.now() + 365 * 3 * 24 * 3600 * 1000))
    );

    if (newExpiryDate) {
      const days = getDaysRemaining(newExpiryDate);
      let status: 'con_han' | 'sap_het_han' | 'qua_han' = 'con_han';
      if (days <= 0) status = 'qua_han';
      else if (days <= 60) status = 'sap_het_han';

      const updatedCerts = person.certificates.map(c =>
        c.id === cert.id
          ? {
              ...c,
              expiryDate: newExpiryDate,
              status,
              notes: (c.notes || '') + ` (Gia hạn ngày ${formatDateVN(new Date())})`
            }
          : c
      );

      const updatedPerson: Personnel = { ...person, certificates: updatedCerts };
      const updatedList = personnelList.map(p => (p.id === person.id ? updatedPerson : p));
      savePersonnel(updatedList, `Gia hạn chứng chỉ ${cert.name} cho cán bộ: ${person.fullName}`);
      setPersonnelState(updatedList);
      if (selectedPerson?.id === person.id) setSelectedPerson(updatedPerson);
    }
  };

  const handleSaveAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAttachFileModal || !attachmentForm.fileName) return;

    const newFile: PersonnelAttachment = {
      id: `file-${Date.now()}`,
      fileName: attachmentForm.fileName,
      fileUrl: attachmentForm.fileUrl || 'https://drive.google.com/file/d/sample-dossier/view',
      uploadedAt: formatDateVN(new Date()),
      notes: attachmentForm.notes
    };

    const updatedPerson: Personnel = {
      ...showAttachFileModal,
      attachedFiles: [...(showAttachFileModal.attachedFiles || []), newFile]
    };

    const updatedList = personnelList.map(p => (p.id === showAttachFileModal.id ? updatedPerson : p));
    savePersonnel(updatedList, `Thêm tệp hồ sơ đính kèm cho cán bộ: ${showAttachFileModal.fullName}`);
    setPersonnelState(updatedList);
    if (selectedPerson?.id === showAttachFileModal.id) setSelectedPerson(updatedPerson);
    setShowAttachFileModal(null);
    setAttachmentForm({ fileName: '', fileUrl: '', notes: '' });
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-emerald-400" />
            Phân hệ Quản lý Nhân sự & Chứng chỉ Nghiệp vụ RPBM (11)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý chi tiết 11.1 Hồ sơ cán bộ nhân sự và 11.2 Danh mục chứng chỉ chuyên ngành, tự động kiểm tra cảnh báo 180-90-60-30-15-7 ngày và báo cáo đáp ứng yêu cầu dự án.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setShowOfficialExportModal(true)}
            className="bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/80 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            title="Xuất Bảng lý lịch chuyên môn nhân sự chủ chốt theo mẫu trang 2 Document 5 (File Excel .xlsx chuẩn)"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" /> Xuất danh sách nhân sự (.xlsx)
          </button>

          <button
            onClick={() => exportPersonnelExcel(filteredPersonnel)}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            title="Xuất bảng tổng hợp Excel UTF-8"
          >
            <Download className="w-4 h-4 text-slate-400" /> Export CSV
          </button>

          <button
            onClick={handleOpenAddPerson}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm Hồ sơ Nhân sự Mới
          </button>
        </div>
      </div>

      {/* Top Stat Summary Widget */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng Nhân sự</p>
            <h3 className="text-2xl font-black text-white mt-1">{filteredPersonnel.length} <span className="text-xs font-normal text-slate-400">cán bộ</span></h3>
          </div>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Chứng chỉ Còn Hạn</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {allCertificates.filter(c => getDaysRemaining(c.cert.expiryDate) > 60).length}
            </h3>
          </div>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Sắp hết hạn (≤60 ngày)</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {allCertificates.filter(c => { const d = getDaysRemaining(c.cert.expiryDate); return d > 0 && d <= 60; }).length}
            </h3>
          </div>
          <div className="p-3 bg-amber-950/80 border border-amber-800/80 rounded-xl text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Chứng chỉ Đã Hết Hạn</p>
            <h3 className="text-2xl font-black text-rose-400 mt-1">
              {allCertificates.filter(c => getDaysRemaining(c.cert.expiryDate) <= 0).length}
            </h3>
          </div>
          <div className="p-3 bg-rose-950/80 border border-rose-800/80 rounded-xl text-rose-400">
            <AlertOctagon className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Sub-tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto pb-0.5 space-x-1">
        <button
          onClick={() => setActiveSubTab('profiles')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'profiles'
              ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <UserCheck className="w-4 h-4" /> 11.1 Hồ sơ Nhân sự ({filteredPersonnel.length})
        </button>

        <button
          onClick={() => setActiveSubTab('certificates')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'certificates'
              ? 'bg-slate-900 text-amber-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Award className="w-4 h-4" /> 11.2 Chứng chỉ & Giấy phép ({allCertificates.length})
        </button>

        <button
          onClick={() => setActiveSubTab('alerts')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'alerts'
              ? 'bg-slate-900 text-rose-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Clock className="w-4 h-4" /> Cảnh báo Hạn (180d - 7d)
          {alertsByThreshold.expired.length + alertsByThreshold[7].length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {alertsByThreshold.expired.length + alertsByThreshold[7].length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('reports')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeSubTab === 'reports'
              ? 'bg-slate-900 text-cyan-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <FileText className="w-4 h-4" /> Báo cáo Đáp ứng Yêu cầu Dự án
        </button>
      </div>

      {/* SUB-TAB 1: 11.1 HỒ SƠ NHÂN SỰ */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo họ tên, mã NS, quê quán, chuyên môn..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả tình trạng công tác</option>
                  <option value="dang_cong_tac">Đang công tác</option>
                  <option value="tam_nghi">Tạm nghỉ</option>
                  <option value="chuyen_cong_tac">Chuyển công tác</option>
                  <option value="nghi_huu">Nghỉ hưu</option>
                </select>
              </div>

              <div>
                <select
                  value={projectFilter}
                  onChange={e => setProjectFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả dự án đang tham gia</option>
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Personnel Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPersonnel.map(person => {
              const statusInfo = WORK_STATUS_MAP[person.workStatus || 'dang_cong_tac'];
              const expiredCertsCount = person.certificates.filter(c => getDaysRemaining(c.expiryDate) <= 0).length;

              return (
                <div
                  key={person.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-700/80 rounded-2xl p-5 shadow-xl transition-all space-y-4 relative group"
                >
                  {/* Top person info */}
                  <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={person.avatar}
                        alt={person.fullName}
                        className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/60 shadow-lg shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-1.5 py-0.2 rounded font-bold">
                            {person.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${statusInfo.badge}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <h3 className="text-base font-bold text-white mt-0.5">{person.fullName}</h3>
                        <p className="text-xs text-emerald-400 font-semibold">{person.rankTitle} • {person.position || person.roleInTeam}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setSelectedPerson(person)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs flex items-center gap-1 transition-colors"
                        title="Xem chi tiết toàn bộ Hồ sơ"
                      >
                        <Eye className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                      <button
                        onClick={() => handleEditPerson(person)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                        title="Sửa Hồ sơ"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                      <button
                        onClick={() => handleDeletePerson(person)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                        title="Chuyển vào Thùng rác"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Profile Key Info Grid (11.1) */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 text-[11px] block">Ngày sinh & Quê quán:</span>
                      <strong className="text-slate-200">{person.dob ? formatDateVN(person.dob) : 'N/A'}</strong> • {person.hometown || 'Chưa cập nhật'}
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Chuyên môn:</span>
                      <strong className="text-slate-200">{person.specialization || 'Công binh RPBM'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Số điện thoại:</span>
                      <strong className="text-emerald-400 font-mono">{person.phone}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 text-[11px] block">Email:</span>
                      <strong className="text-slate-300 font-mono truncate block">{person.email}</strong>
                    </div>
                  </div>

                  {/* Project Tag */}
                  <div className="text-xs text-slate-400 flex items-center justify-between bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Briefcase className="w-3.5 h-3.5 text-purple-400" /> Dự án:
                    </span>
                    <span className="font-semibold text-purple-300 truncate max-w-[220px]">
                      {person.currentProjectName || 'Chưa phân công dự án'}
                    </span>
                  </div>

                  {/* Certificate Summary */}
                  <div className="space-y-2 pt-1 border-t border-slate-800/80">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        Chứng chỉ & Giấy phép ({person.certificates.length})
                      </h4>
                      <button
                        onClick={() => handleOpenAddCert(person)}
                        className="text-[11px] text-amber-400 hover:underline font-semibold flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Thêm CC
                      </button>
                    </div>

                    {person.certificates.length === 0 ? (
                      <p className="text-xs text-slate-500 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        Chưa đăng ký chứng chỉ nào.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {person.certificates.slice(0, 3).map(cert => {
                          const days = getDaysRemaining(cert.expiryDate);
                          return (
                            <div
                              key={cert.id}
                              className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2"
                            >
                              <div className="truncate">
                                <span className="font-semibold text-slate-200 block truncate">{cert.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">Số: {cert.certificateNo}</span>
                              </div>

                              <div className="text-right shrink-0">
                                <span
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${
                                    days <= 0
                                      ? 'bg-rose-950 text-rose-400 border-rose-800'
                                      : days <= 60
                                      ? 'bg-amber-950 text-amber-400 border-amber-800'
                                      : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  }`}
                                >
                                  {days <= 0 ? 'Đã hết hạn' : `Hạn: ${formatDateVN(cert.expiryDate)}`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                        {person.certificates.length > 3 && (
                          <button
                            onClick={() => setSelectedPerson(person)}
                            className="text-[11px] text-slate-400 hover:text-white underline w-full text-center block pt-1"
                          >
                            + Xem thêm {person.certificates.length - 3} chứng chỉ khác...
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Attached dossiers preview */}
                  {person.attachedFiles && person.attachedFiles.length > 0 && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                      <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                      <span>Hồ sơ đính kèm: {person.attachedFiles.length} tệp file scan</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: 11.2 QUẢN LÝ CHỨNG CHỈ VÀ GIẤY PHÉP */}
      {activeSubTab === 'certificates' && (
        <div className="space-y-4">
          {/* Certificate Filter Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm chứng chỉ, số hiệu, cán bộ sở hữu..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={certTypeFilter}
                  onChange={e => setCertTypeFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả 11 Loại Chứng chỉ</option>
                  {CERT_TYPES.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={certStatusFilter}
                  onChange={e => setCertStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Trạng thái</option>
                  <option value="con_han">Còn hiệu lực</option>
                  <option value="sap_het_han">Sắp hết hạn (≤60 ngày)</option>
                  <option value="qua_han">Đã hết hạn</option>
                </select>
              </div>

              <div>
                <select
                  value={thresholdFilter}
                  onChange={e => setThresholdFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Ngưỡng cảnh báo</option>
                  {WARNING_THRESHOLDS.map(t => (
                    <option key={t} value={t}>Cảnh báo ≤ {t} ngày</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Certificates Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Loại & Tên Chứng chỉ</th>
                    <th className="p-3.5">Số Chứng chỉ</th>
                    <th className="p-3.5">Cán bộ sở hữu</th>
                    <th className="p-3.5">Cơ quan cấp</th>
                    <th className="p-3.5">Ngày cấp / Hiệu lực</th>
                    <th className="p-3.5">Ngày hết hạn</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">File Scan / Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredCertificates.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                        Không tìm thấy chứng chỉ nào phù hợp với bộ lọc.
                      </td>
                    </tr>
                  ) : (
                    filteredCertificates.map(({ person, cert }) => {
                      const days = getDaysRemaining(cert.expiryDate);
                      const certTypeObj = CERT_TYPES.find(ct => ct.id === cert.certType);

                      return (
                        <tr key={cert.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${certTypeObj?.iconBg || 'bg-slate-800 text-slate-300'}`}>
                              {certTypeObj?.label || 'Chứng chỉ chuyên môn'}
                            </span>
                            <div className="font-bold text-white text-xs">{cert.name}</div>
                            {cert.scopeOfPractice && (
                              <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">Phạm vi: {cert.scopeOfPractice}</div>
                            )}
                          </td>
                          <td className="p-3.5 font-mono text-emerald-400 font-bold">{cert.certificateNo}</td>
                          <td className="p-3.5">
                            <div className="flex items-center gap-2">
                              <img src={person.avatar} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                              <div>
                                <strong className="text-slate-200 block text-xs">{person.fullName}</strong>
                                <span className="text-[10px] text-slate-400">{person.rankTitle}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-3.5 text-slate-400">{cert.issuedBy}</td>
                          <td className="p-3.5 font-mono text-slate-400">
                            <div>Cấp: {formatDateVN(cert.issueDate)}</div>
                            {cert.effectiveDate && <div className="text-[10px] text-slate-500">HL: {formatDateVN(cert.effectiveDate)}</div>}
                          </td>
                          <td className="p-3.5 font-mono font-bold text-amber-300">{formatDateVN(cert.expiryDate)}</td>
                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold border font-mono ${
                                days <= 0
                                  ? 'bg-rose-950 text-rose-400 border-rose-800'
                                  : days <= 60
                                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                                  : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                              }`}
                            >
                              {days <= 0 ? `Đã quá hạn (${Math.abs(days)}d)` : days <= 60 ? `Còn ${days} ngày` : 'Còn hiệu lực'}
                            </span>
                          </td>
                          <td className="p-3.5 text-right space-x-2">
                            {cert.scanFileUrl || cert.driveUrl ? (
                              <a
                                href={cert.scanFileUrl || cert.driveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                              >
                                File Scan <ExternalLink className="w-3 h-3" />
                              </a>
                            ) : (
                              <span className="text-slate-600 italic text-[10px]">Chưa đính kèm</span>
                            )}
                            <button
                              onClick={() => handleRenewCertificateQuick(person, cert)}
                              className="inline-flex items-center gap-1 bg-amber-950/80 hover:bg-amber-900 text-amber-300 border border-amber-800 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors"
                              title="Gia hạn ngày hết hạn"
                            >
                              <RefreshCw className="w-3 h-3" /> Gia hạn
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
        </div>
      )}

      {/* SUB-TAB 3: CẢNH BÁO HẠN CHỨNG CHỈ (180D - 7D) */}
      {activeSubTab === 'alerts' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-rose-400" />
              Ma trận Cảnh báo Hạn Chứng chỉ theo Quy chuẩn (180d, 90d, 60d, 30d, 15d, 7d)
            </h3>
            <p className="text-xs text-slate-400">
              Hệ thống tự động tính toán số ngày còn lại của từng chứng chỉ và phân nhóm theo 6 mốc cảnh báo tiêu chuẩn để đơn vị kịp thời tổ chức thi cấp đổi, gia hạn.
            </p>
          </div>

          {/* Alerts cards by thresholds */}
          <div className="space-y-4">
            {/* EXPIRED */}
            {alertsByThreshold.expired.length > 0 && (
              <div className="bg-rose-950/30 border border-rose-800/80 rounded-2xl p-5 shadow-xl space-y-3">
                <h4 className="text-sm font-bold text-rose-400 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <AlertOctagon className="w-4 h-4" /> ĐÃ HẾT HẠN (CẦN XỬ LÝ NGAY)
                  </span>
                  <span className="bg-rose-900 text-rose-200 text-xs px-2.5 py-0.5 rounded-full font-mono">
                    {alertsByThreshold.expired.length} chứng chỉ
                  </span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {alertsByThreshold.expired.map(({ person, cert, days }) => (
                    <div key={cert.id} className="bg-slate-900 border border-rose-900/60 p-3.5 rounded-xl text-xs space-y-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <strong className="text-white text-xs block">{cert.name}</strong>
                          <span className="text-slate-400 text-[11px]">Số: <strong className="font-mono text-emerald-400">{cert.certificateNo}</strong></span>
                        </div>
                        <span className="bg-rose-950 text-rose-400 border border-rose-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                          Quá hạn {Math.abs(days)} ngày
                        </span>
                      </div>
                      <div className="text-slate-400 text-[11px] flex items-center justify-between pt-1 border-t border-slate-800">
                        <span>Cán bộ: <strong className="text-slate-200">{person.fullName}</strong> ({person.rankTitle})</span>
                        <button
                          onClick={() => handleRenewCertificateQuick(person, cert)}
                          className="bg-amber-600 hover:bg-amber-500 text-white px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                        >
                          <RefreshCw className="w-3 h-3" /> Gia hạn ngay
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Threshold Groups */}
            {WARNING_THRESHOLDS.map(t => {
              const list = alertsByThreshold[t as keyof typeof alertsByThreshold] as { person: Personnel; cert: PersonnelCertificate; days: number }[];
              if (!list || list.length === 0) return null;

              return (
                <div key={t} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" /> Ngưỡng cảnh báo ≤ {t} ngày
                    </span>
                    <span className="bg-amber-950 text-amber-300 border border-amber-800 text-xs px-2.5 py-0.5 rounded-full font-mono">
                      {list.length} chứng chỉ
                    </span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {list.map(({ person, cert, days }) => (
                      <div key={cert.id} className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl text-xs space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <strong className="text-white text-xs block">{cert.name}</strong>
                            <span className="text-slate-400 text-[11px]">Số: <strong className="font-mono text-emerald-400">{cert.certificateNo}</strong></span>
                          </div>
                          <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded font-mono font-bold text-[10px]">
                            Còn {days} ngày
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px] flex items-center justify-between pt-1 border-t border-slate-900">
                          <span>Cán bộ: <strong className="text-slate-200">{person.fullName}</strong> ({person.rankTitle})</span>
                          <button
                            onClick={() => handleRenewCertificateQuick(person, cert)}
                            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1"
                          >
                            <RefreshCw className="w-3 h-3" /> Đăng ký gia hạn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BÁO CÁO & ĐÁNH GIÁ YÊU CẦU DỰ ÁN */}
      {activeSubTab === 'reports' && (
        <div className="space-y-6">
          {/* Section 1: Personnel missing required certs for assigned roles */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-rose-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Báo cáo: Cán bộ chưa đủ điều kiện chứng chỉ để bố trí chức danh ({unqualifiedPersonnelReport.length})
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Danh sách cán bộ đang đảm nhận chức danh (Chỉ huy trưởng, Cán bộ kỹ thuật, Giám sát, An toàn, Y tế) nhưng thiếu chứng chỉ bắt buộc hoặc chứng chỉ đã hết hạn.
              </p>
            </div>

            {unqualifiedPersonnelReport.length === 0 ? (
              <div className="bg-emerald-950/40 border border-emerald-800 p-4 rounded-xl text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Tuyệt vời! Tất cả nhân sự trong hệ thống đều đáp ứng đầy đủ chứng chỉ chuyên môn cho chức danh được phân công.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {unqualifiedPersonnelReport.map(({ person, missingRoleCerts, expiredCerts, recommendation }) => (
                  <div key={person.id} className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={person.avatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-bold text-white text-sm">{person.fullName}</h4>
                          <span className="text-emerald-400 text-[11px] font-semibold">{person.rankTitle} • {person.position || person.roleInTeam}</span>
                        </div>
                      </div>
                      <span className="bg-rose-950 text-rose-400 border border-rose-800 px-3 py-1 rounded-full text-xs font-bold font-mono">
                        Cảnh báo Tuân thủ
                      </span>
                    </div>

                    {missingRoleCerts.length > 0 && (
                      <div className="text-rose-300 text-xs bg-rose-950/60 p-2.5 rounded-lg border border-rose-900">
                        <strong>Thiếu chứng chỉ bắt buộc:</strong> {missingRoleCerts.join(' • ')}
                      </div>
                    )}

                    {expiredCerts.length > 0 && (
                      <div className="text-amber-300 text-xs bg-amber-950/60 p-2.5 rounded-lg border border-amber-900">
                        <strong>Chứng chỉ đã hết hạn:</strong> {expiredCerts.map(c => `${c.name} (Hết hạn ${formatDateVN(c.expiryDate)})`).join('; ')}
                      </div>
                    )}

                    <div className="text-slate-400 text-[11px] pt-2 border-t border-slate-900 flex items-center justify-between">
                      <span>💡 <strong>Đề xuất xử lý:</strong> {recommendation}</span>
                      <button
                        onClick={() => handleOpenAddCert(person)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold"
                      >
                        Bổ sung Chứng chỉ
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 2: Project-specific compliance matrix */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-cyan-400 flex items-center gap-2">
                  <FileCheck className="w-5 h-5" />
                  Báo cáo: Đánh giá Nhân sự Đáp ứng Yêu cầu theo Từng Dự án
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Chọn dự án để tự động đối soát chứng chỉ của đội ngũ nhân sự được bố trí thi công tại công trường.
                </p>
              </div>

              <div className="w-full sm:w-72">
                <select
                  value={selectedProjectId}
                  onChange={e => setSelectedProjectId(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-800 rounded-xl p-2.5 text-xs text-cyan-300 font-bold focus:outline-none"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {projectComplianceReport && (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Dự án đang kiểm tra:</span>
                    <h4 className="text-sm font-bold text-white mt-0.5">{projectComplianceReport.project.name}</h4>
                    <span className="text-xs text-slate-400">Chỉ huy trưởng đăng ký: <strong className="text-emerald-400">{projectComplianceReport.project.commanderName}</strong></span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Tỷ lệ Đáp ứng (Compliance):</span>
                    <span className={`text-2xl font-black font-mono ${projectComplianceReport.complianceScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {projectComplianceReport.complianceScore}%
                    </span>
                    <span className="text-[11px] text-slate-400 block font-mono">
                      ({projectComplianceReport.qualifiedCount}/{projectComplianceReport.totalAssigned} nhân sự đạt chuẩn)
                    </span>
                  </div>
                </div>

                {/* Person evaluation list */}
                <div className="space-y-2">
                  {projectComplianceReport.assignedPeople.length === 0 ? (
                    <p className="text-xs text-slate-500 italic p-4 text-center bg-slate-950 rounded-xl border border-slate-800">
                      Chưa có cán bộ nhân sự được gán vào dự án này.
                    </p>
                  ) : (
                    projectComplianceReport.assignedPeople.map(({ person, isQualified, issues, activeCertsCount }) => (
                      <div
                        key={person.id}
                        className={`p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isQualified ? 'bg-slate-950 border-slate-800' : 'bg-rose-950/30 border-rose-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img src={person.avatar} alt="" className="w-10 h-10 rounded-xl object-cover shrink-0" />
                          <div>
                            <div className="flex items-center gap-2">
                              <strong className="text-white text-sm">{person.fullName}</strong>
                              <span className="text-[10px] font-mono text-slate-400">({person.code})</span>
                            </div>
                            <span className="text-slate-400 text-[11px]">{person.rankTitle} • Nhiệm vụ: <strong className="text-purple-300">{person.roleInTeam}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-400 font-mono">
                            CC Hiệu lực: <strong className="text-emerald-400">{activeCertsCount}</strong>
                          </span>

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border font-mono flex items-center gap-1 ${
                              isQualified
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border-rose-800'
                            }`}
                          >
                            {isQualified ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {isQualified ? 'Đủ điều kiện' : 'Cần bổ sung'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* DETAIL MODAL / PROFILE DRAWER */}
      {selectedPerson && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <img src={selectedPerson.avatar} alt="" className="w-12 h-12 rounded-xl object-cover border border-emerald-500" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800">
                      {selectedPerson.code}
                    </span>
                    <span className="text-xs text-slate-400">{selectedPerson.rankTitle}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{selectedPerson.fullName}</h3>
                </div>
              </div>

              <button onClick={() => setSelectedPerson(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Profile Detail Fields */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[11px]">CCCD / CMTQN:</span>
                <strong className="text-emerald-400 font-mono">{selectedPerson.identityCardNo || 'Chưa cập nhật'}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Ngày sinh & Quê quán:</span>
                <strong className="text-slate-200">{selectedPerson.dob ? formatDateVN(selectedPerson.dob) : 'N/A'}</strong> • {selectedPerson.hometown || 'Chưa cập nhật'}
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Tình trạng công tác:</span>
                <strong className="text-emerald-400">{WORK_STATUS_MAP[selectedPerson.workStatus || 'dang_cong_tac']?.label}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Cấp bậc / Chức vụ:</span>
                <strong className="text-slate-200">{selectedPerson.rankTitle} • {selectedPerson.position || selectedPerson.roleInTeam}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Chức danh nghề nghiệp:</span>
                <strong className="text-slate-200">{selectedPerson.jobTitle || selectedPerson.rankTitle}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Chuyên môn:</span>
                <strong className="text-emerald-300 font-semibold">{selectedPerson.specialization || 'Nghiệp vụ RPBM'}</strong>
              </div>

              {/* Employer info */}
              <div className="col-span-3 bg-slate-900/80 p-3 rounded-lg border border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Đơn vị NSDLĐ:</span>
                  <strong className="text-slate-200 block">{selectedPerson.employerName || selectedPerson.unit}</strong>
                  <span className="text-slate-400 block text-[10px]">{selectedPerson.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Số năm làm việc / Liên lạc:</span>
                  <strong className="text-amber-300 font-bold block">{selectedPerson.yearsWorkingForEmployer ?? 0} năm làm việc</strong>
                  <span className="text-slate-300 block text-[10px]">Đại diện: {selectedPerson.contactPerson || 'Tiểu đoàn trưởng'}</span>
                </div>
              </div>

              <div className="col-span-2">
                <span className="text-slate-500 block text-[11px]">SĐT & Email:</span>
                <strong className="text-emerald-400 font-mono inline-block mr-3">{selectedPerson.phone}</strong>
                <span className="text-slate-400 font-mono text-[11px] inline-block">{selectedPerson.email}</span>
              </div>
            </div>

            {/* Current Project */}
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between">
              <div>
                <span className="text-slate-500 text-[11px] block">Dự án đang tham gia:</span>
                <strong className="text-purple-300 font-bold">{selectedPerson.currentProjectName || 'Chưa phân công dự án'}</strong>
              </div>
              <span className="text-slate-400 text-[11px]">Nhiệm vụ: <strong className="text-slate-200">{selectedPerson.roleInTeam}</strong></span>
            </div>

            {/* Attached Dossiers Files */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Paperclip className="w-4 h-4 text-blue-400" />
                  Hồ sơ đính kèm ({selectedPerson.attachedFiles?.length || 0})
                </h4>
                <button
                  onClick={() => setShowAttachFileModal(selectedPerson)}
                  className="text-xs text-blue-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm File Hồ sơ
                </button>
              </div>

              {(!selectedPerson.attachedFiles || selectedPerson.attachedFiles.length === 0) ? (
                <p className="text-xs text-slate-500 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                  Chưa có tệp hồ sơ đính kèm.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedPerson.attachedFiles.map(file => (
                    <div key={file.id} className="bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-xs flex items-center justify-between">
                      <span className="font-semibold text-slate-200 font-mono">{file.fileName}</span>
                      <a
                        href={file.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold"
                      >
                        File Drive <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Certificates List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider">
                  <Award className="w-4 h-4 text-amber-400" />
                  Danh sách Chứng chỉ & Giấy phép ({selectedPerson.certificates.length})
                </h4>
                <button
                  onClick={() => handleOpenAddCert(selectedPerson)}
                  className="text-xs text-amber-400 hover:underline font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm/Gia hạn CC
                </button>
              </div>

              {selectedPerson.certificates.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-950 p-3 rounded-xl border border-slate-800">
                  Chưa đăng ký chứng chỉ nào.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedPerson.certificates.map(c => {
                    const days = c.isLifetime ? 99999 : getDaysRemaining(c.expiryDate);
                    return (
                      <div key={c.id} className="bg-slate-950 border border-slate-800 p-3 rounded-xl text-xs space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <strong className="text-white font-bold block">{c.name}</strong>
                            <span className="text-slate-400 text-[10px]">Loại: {CERT_TYPES.find(ct => ct.id === c.certType)?.label || c.certType}</span>
                          </div>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono shrink-0 ${
                              c.isLifetime
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                                : days <= 0
                                ? 'bg-rose-950 text-rose-400 border-rose-800'
                                : days <= 60
                                ? 'bg-amber-950 text-amber-400 border-amber-800'
                                : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                            }`}
                          >
                            {c.isLifetime ? 'Không thời hạn' : days <= 0 ? 'Đã hết hạn' : `Hạn: ${formatDateVN(c.expiryDate)}`}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 font-mono">
                          <div>Số hiệu: <strong className="text-slate-200">{c.certificateNo}</strong></div>
                          <div>Cơ quan cấp: <strong className="text-slate-200">{c.issuedBy}</strong></div>
                        </div>

                        {c.scanFileUrl && (
                          <div className="text-right">
                            <a href={c.scanFileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-[11px] font-semibold flex items-center gap-1 justify-end">
                              <ExternalLink className="w-3 h-3 inline" /> Xem bản Scan chính
                            </a>
                          </div>
                        )}

                        {c.relatedDocuments && c.relatedDocuments.length > 0 && (
                          <div className="pt-2 border-t border-slate-900 space-y-1">
                            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Văn bằng & Giấy tờ liên quan ({c.relatedDocuments.length}):</span>
                            <div className="space-y-1">
                              {c.relatedDocuments.map((rd, idx) => (
                                <div key={rd.id || idx} className="flex items-center justify-between text-[11px] bg-slate-900 p-1.5 rounded border border-slate-800">
                                  <span className="text-slate-300 font-medium truncate max-w-[200px]">{rd.docType}: {rd.docTitle}</span>
                                  {rd.fileUrl ? (
                                    <a href={rd.fileUrl} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline text-[10px] font-mono shrink-0">
                                      Xem file <ExternalLink className="w-2.5 h-2.5 inline" />
                                    </a>
                                  ) : (
                                    <span className="text-slate-500 text-[10px]">Chưa có link</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedPerson(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD / EDIT PERSON (11.1) */}
      {showAddPersonModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Users className="w-5 h-5" />
                {editingPerson ? `Chỉnh sửa Hồ sơ: ${editingPerson.fullName}` : 'Thêm mới Hồ sơ Nhân sự RPBM'}
              </h3>
              <button onClick={() => setShowAddPersonModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePerson} className="space-y-4 text-xs">
              {/* Avatar section */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 flex items-center gap-4">
                <img
                  src={personForm.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                  alt="Avatar preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
                />
                <div className="space-y-2 flex-1">
                  <label className="block text-slate-300 font-semibold text-xs">Ảnh đại diện cán bộ (.jpg, .jpeg, .png, .webp, &le; 5MB)</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="cursor-pointer bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                      <Paperclip className="w-3.5 h-3.5" /> Tải ảnh lên
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) {
                            alert('Tệp quá lớn. Vui lòng chọn ảnh có dung lượng nhỏ hơn 5MB.');
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = () => setPersonForm(prev => ({ ...prev, avatar: reader.result as string }));
                          reader.readAsDataURL(file);
                          e.target.value = '';
                        }}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setPersonForm(prev => ({ ...prev, avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80' }))}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              </div>

              {/* Definite Duplicate Error Banner */}
              {definiteDuplicateError && (
                <div className="p-3 bg-red-950/90 border border-red-700/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 shadow-lg">
                  <AlertOctagon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-red-200">Không thể lưu - Phát hiện thông tin trùng chắc chắn!</p>
                    <p className="mt-0.5">{definiteDuplicateError}</p>
                  </div>
                </div>
              )}

              {/* Personal Basic Info */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã Nhân sự *</label>
                  <input
                    type="text"
                    required
                    value={personForm.code || ''}
                    onChange={e => setPersonForm({ ...personForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Họ và Tên *</label>
                  <input
                    type="text"
                    required
                    value={personForm.fullName || ''}
                    onChange={e => setPersonForm({ ...personForm, fullName: e.target.value })}
                    placeholder="Nhập họ và tên cán bộ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Số CCCD / CMTQN <span className="text-slate-500 text-[10px] font-normal">(Không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    value={personForm.identityCardNo || ''}
                    onChange={e => setPersonForm({ ...personForm, identityCardNo: e.target.value })}
                    placeholder="VD: 001088012345 (Có thể để trống)..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    value={personForm.dob || ''}
                    onChange={e => setPersonForm({ ...personForm, dob: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quê quán</label>
                  <input
                    type="text"
                    value={personForm.hometown || ''}
                    onChange={e => setPersonForm({ ...personForm, hometown: e.target.value })}
                    placeholder="VD: Nam Định, Hà Nội..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Specialization with dropdown suggestions */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Chuyên môn *</label>
                <div className="space-y-1.5">
                  <select
                    value={SPECIALIZATION_SUGGESTIONS.includes(personForm.specialization || '') ? personForm.specialization : 'custom'}
                    onChange={e => {
                      if (e.target.value !== 'custom') {
                        setPersonForm({ ...personForm, specialization: e.target.value });
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-semibold"
                  >
                    <option value="custom">-- Chọn chuyên môn chuẩn hoặc Tự nhập bên dưới --</option>
                    {SPECIALIZATION_SUGGESTIONS.map((spec, idx) => (
                      <option key={idx} value={spec}>{spec}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    required
                    value={personForm.specialization || ''}
                    onChange={e => setPersonForm({ ...personForm, specialization: e.target.value })}
                    placeholder="Nhập chuyên môn cụ thể..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Employer / Unit information */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-blue-400" />
                  Thông tin Đơn vị NSDLĐ & Người liên lạc
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Tên Người sử dụng lao động (NSDLĐ)</label>
                    <input
                      type="text"
                      value={personForm.employerName || 'Tiểu đoàn 93/Binh chủng Công binh'}
                      onChange={e => setPersonForm({ ...personForm, employerName: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Địa chỉ NSDLĐ</label>
                    <input
                      type="text"
                      value={personForm.employerAddress || 'Xã Hòa Lạc, thành phố Hà Nội'}
                      onChange={e => setPersonForm({ ...personForm, employerAddress: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Số năm làm việc cho NSDLĐ</label>
                    <input
                      type="number"
                      min={0}
                      value={personForm.yearsWorkingForEmployer ?? 0}
                      onChange={e => setPersonForm({ ...personForm, yearsWorkingForEmployer: Math.max(0, parseInt(e.target.value) || 0) })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Người liên lạc (Đại diện/Chỉ huy)</label>
                    <input
                      type="text"
                      value={personForm.contactPerson || 'Tiểu đoàn trưởng'}
                      onChange={e => setPersonForm({ ...personForm, contactPerson: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cấp bậc / Chức vụ</label>
                  <input
                    type="text"
                    value={personForm.rankTitle || ''}
                    onChange={e => setPersonForm({ ...personForm, rankTitle: e.target.value })}
                    placeholder="Đại úy, Thiếu tá..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chức danh nghề nghiệp</label>
                  <input
                    type="text"
                    value={personForm.jobTitle || ''}
                    onChange={e => setPersonForm({ ...personForm, jobTitle: e.target.value })}
                    placeholder="Kỹ sư RPBM, Y sĩ..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Tình trạng công tác</label>
                  <select
                    value={personForm.workStatus || 'dang_cong_tac'}
                    onChange={e => setPersonForm({ ...personForm, workStatus: e.target.value as PersonnelWorkStatus })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="dang_cong_tac">Đang công tác</option>
                    <option value="tam_nghi">Tạm nghỉ</option>
                    <option value="chuyen_cong_tac">Chuyển công tác</option>
                    <option value="nghi_huu">Nghỉ hưu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={personForm.phone || ''}
                    onChange={e => setPersonForm({ ...personForm, phone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={personForm.email || ''}
                    onChange={e => setPersonForm({ ...personForm, email: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Dự án đang tham gia</label>
                  <select
                    value={personForm.currentProjectId || ''}
                    onChange={e => setPersonForm({ ...personForm, currentProjectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="">-- Chưa phân công --</option>
                    {projects.map(pr => (
                      <option key={pr.id} value={pr.id}>{pr.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Nhiệm vụ tại công trường</label>
                  <input
                    type="text"
                    value={personForm.roleInTeam || ''}
                    onChange={e => setPersonForm({ ...personForm, roleInTeam: e.target.value })}
                    placeholder="Chỉ huy trưởng, Cán bộ kỹ thuật..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddPersonModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Lưu Hồ sơ Nhân sự
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD / EDIT CERTIFICATE (11.2) */}
      {showAddCertModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Thêm / Cấp đổi Chứng chỉ cho: {showAddCertModal.fullName}
              </h3>
              <button onClick={() => setShowAddCertModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCertificate} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Loại Chứng chỉ & Giấy phép *</label>
                <select
                  value={certForm.certType || 'ky_thuat_vien'}
                  onChange={e => {
                    const ct = e.target.value;
                    const ctObj = CERT_TYPES.find(c => c.id === ct);
                    setCertForm(prev => ({
                      ...prev,
                      certType: ct as any,
                      name: ctObj?.defaultTitle || prev.name
                    }));
                  }}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-bold"
                >
                  {CERT_TYPES.map(ct => (
                    <option key={ct.id} value={ct.id}>{ct.label}</option>
                  ))}
                </select>
              </div>

              {certForm.certType === 'ky_thuat_vien' && (
                <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-900/60 space-y-2">
                  <label className="block text-blue-300 font-semibold text-xs">Chọn Cấp bậc Kỹ thuật viên RPBM:</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {KTV_LEVEL_OPTIONS.map((lvl, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCertForm(prev => ({ ...prev, name: lvl }))}
                        className={`px-2.5 py-1 rounded-lg font-semibold border text-xs transition-colors ${
                          certForm.name === lvl
                            ? 'bg-blue-600 border-blue-400 text-white'
                            : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Tệp / Tiêu đề Chứng chỉ *</label>
                <input
                  type="text"
                  required
                  value={certForm.name || ''}
                  onChange={e => setCertForm({ ...certForm, name: e.target.value })}
                  placeholder="VD: Kỹ thuật viên RPBM cấp I, Đội trưởng điều tra..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số hiệu Chứng chỉ *</label>
                  <input
                    type="text"
                    required
                    value={certForm.certificateNo || ''}
                    onChange={e => setCertForm({ ...certForm, certificateNo: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Cơ quan / Đơn vị cấp *</label>
                  <input
                    type="text"
                    required
                    value={certForm.issuedBy || ''}
                    onChange={e => setCertForm({ ...certForm, issuedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-slate-200 font-bold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />Thời hạn hiệu lực Chứng chỉ
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-900 px-3 py-1 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      checked={!!certForm.isLifetime}
                      onChange={e => setCertForm(prev => ({ ...prev, isLifetime: e.target.checked }))}
                      className="accent-emerald-500 rounded"
                    />
                    <span className="text-emerald-400 font-bold text-xs">Không thời hạn</span>
                  </label>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Ngày Cấp</label>
                    <input
                      type="date"
                      value={certForm.issueDate || ''}
                      onChange={e => setCertForm({ ...certForm, issueDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Ngày Có hiệu lực</label>
                    <input
                      type="date"
                      value={certForm.effectiveDate || ''}
                      onChange={e => setCertForm({ ...certForm, effectiveDate: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>

                  {!certForm.isLifetime && (
                    <div>
                      <label className="block text-amber-400 font-semibold mb-1">Ngày Hết Hạn *</label>
                      <input
                        type="date"
                        required={!certForm.isLifetime}
                        value={certForm.expiryDate || ''}
                        onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-amber-300 font-mono font-bold"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phạm vi Hành nghề</label>
                <input
                  type="text"
                  value={certForm.scopeOfPractice || ''}
                  onChange={e => setCertForm({ ...certForm, scopeOfPractice: e.target.value })}
                  placeholder="VD: Chỉ huy thi công RPBM trên toàn quốc..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Link File Scan (Google Drive / Upload)</label>
                <input
                  type="url"
                  value={certForm.scanFileUrl || ''}
                  onChange={e => setCertForm({ ...certForm, scanFileUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono"
                />
              </div>

              {/* Related Scan Documents Section */}
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-emerald-400" />
                    Tài liệu & Giấy tờ liên quan ({certForm.relatedDocuments?.length || 0})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newDoc = {
                        id: `reldoc-${Date.now()}`,
                        docType: 'Bằng đại học/tốt nghiệp',
                        docTitle: 'Bản scan Bằng chuyên môn',
                        fileUrl: '',
                        notes: '',
                        uploadDate: formatDateVN(new Date())
                      };
                      setCertForm(prev => ({
                        ...prev,
                        relatedDocuments: [...(prev.relatedDocuments || []), newDoc]
                      }));
                    }}
                    className="text-xs text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" /> Thêm văn bằng / giấy tờ
                  </button>
                </div>

                {certForm.relatedDocuments && certForm.relatedDocuments.length > 0 ? (
                  <div className="space-y-2">
                    {certForm.relatedDocuments.map((rd, idx) => (
                      <div key={rd.id || idx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg grid grid-cols-12 gap-2 items-center text-xs">
                        <div className="col-span-3">
                          <select
                            value={rd.docType}
                            onChange={e => {
                              const val = e.target.value;
                              setCertForm(prev => ({
                                ...prev,
                                relatedDocuments: (prev.relatedDocuments || []).map((d, i) => i === idx ? { ...d, docType: val } : d)
                              }));
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200"
                          >
                            <option value="Bằng đại học">Bằng đại học</option>
                            <option value="Bằng tốt nghiệp">Bằng tốt nghiệp</option>
                            <option value="Chứng nhận đào tạo">Chứng nhận đào tạo</option>
                            <option value="Giấy tờ khác">Giấy tờ khác</option>
                          </select>
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={rd.docTitle}
                            onChange={e => {
                              const val = e.target.value;
                              setCertForm(prev => ({
                                ...prev,
                                relatedDocuments: (prev.relatedDocuments || []).map((d, i) => i === idx ? { ...d, docTitle: val } : d)
                              }));
                            }}
                            placeholder="Tên văn bằng / giấy tờ..."
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-slate-200"
                          />
                        </div>
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={rd.fileUrl}
                            onChange={e => {
                              const val = e.target.value;
                              setCertForm(prev => ({
                                ...prev,
                                relatedDocuments: (prev.relatedDocuments || []).map((d, i) => i === idx ? { ...d, fileUrl: val } : d)
                              }));
                            }}
                            placeholder="Link file scan..."
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1 text-emerald-400 font-mono text-[10px]"
                          />
                        </div>
                        <div className="col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setCertForm(prev => ({
                                ...prev,
                                relatedDocuments: (prev.relatedDocuments || []).filter((_, i) => i !== idx)
                              }));
                            }}
                            className="text-rose-400 hover:text-rose-300 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-xs">Chưa có văn bằng, giấy tờ đính kèm.</p>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú</label>
                <textarea
                  rows={2}
                  value={certForm.notes || ''}
                  onChange={e => setCertForm({ ...certForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddCertModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold"
                >
                  Lưu Chứng chỉ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ATTACH DOSSIER FILE */}
      {showAttachFileModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-blue-400 flex items-center gap-2">
                <Paperclip className="w-5 h-5" />
                Thêm File Hồ sơ Đính kèm: {showAttachFileModal.fullName}
              </h3>
              <button onClick={() => setShowAttachFileModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAttachment} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên Tệp Hồ sơ *</label>
                <input
                  type="text"
                  required
                  value={attachmentForm.fileName}
                  onChange={e => setAttachmentForm({ ...attachmentForm, fileName: e.target.value })}
                  placeholder="VD: Quyet_dinh_bo_tri_nhan_su.pdf"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Link Google Drive / URL File Scan *</label>
                <input
                  type="url"
                  required
                  value={attachmentForm.fileUrl}
                  onChange={e => setAttachmentForm({ ...attachmentForm, fileUrl: e.target.value })}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ghi chú</label>
                <input
                  type="text"
                  value={attachmentForm.notes}
                  onChange={e => setAttachmentForm({ ...attachmentForm, notes: e.target.value })}
                  placeholder="Lưu trữ tại Văn thư..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAttachFileModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold"
                >
                  Tải Lên Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: POTENTIAL DUPLICATE PERSONNEL WARNING */}
      {duplicateWarningState.isOpen && duplicateWarningState.result && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Cảnh báo phát hiện bản ghi có khả năng trùng lặp
              </h3>
              <button
                onClick={() => setDuplicateWarningState({ isOpen: false, result: null })}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-3">
              <p className="text-slate-300 leading-relaxed">
                Hệ thống kiểm tra thấy thông tin nhân sự bạn đang nhập có điểm tương đồng với các cán bộ đã tồn tại trong danh sách. Vui lòng xem xét chi tiết dưới đây trước khi quyết định lưu:
              </p>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {duplicateWarningState.result.potentialMatches.map((match, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 border border-amber-900/50 rounded-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300 font-mono text-[11px]">{match.person.code}</span>
                      <div className="flex flex-wrap gap-1">
                        {match.reasons.map((reason, rIdx) => (
                          <span key={rIdx} className="bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-md">
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-slate-300">
                      <div>
                        <span className="text-slate-500">Họ và Tên:</span> <strong className="text-white">{match.person.fullName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Ngày sinh:</span> <strong className="text-white">{match.person.dob ? formatDateVN(match.person.dob) : 'Chưa cập nhật'}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500">Cấp bậc / Vị trí:</span> <span>{match.person.rankTitle || 'Cán bộ'} - {match.person.position || 'RPBM'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Đơn vị:</span> <span>{match.person.unit || 'Tiểu đoàn 93'}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Số CCCD (đã che):</span> <span className="font-mono text-amber-200">{match.maskedCCCD}</span>
                      </div>
                      <div>
                        <span className="text-slate-500">Liên hệ (đã che):</span> <span className="font-mono text-amber-200">{match.maskedPhone || match.maskedEmail || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-amber-950/40 border border-amber-800/60 rounded-xl text-amber-200/90 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Hệ thống <strong>không tự động chặn</strong> trường hợp nghi trùng. Bạn có thể chọn quay lại sửa hoặc tiếp tục lưu bản ghi này.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDuplicateWarningState({ isOpen: false, result: null })}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Quay lại kiểm tra
              </button>
              <button
                type="button"
                onClick={() => executeActualSavePerson()}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-950 flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" /> Vẫn xác nhận lưu bản ghi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: OFFICIAL EXCEL EXPORT DIALOG (DOCUMENT5 PAGE 2) */}
      {showOfficialExportModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl text-slate-100 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-400" />
                  Xuất Lý Lịch Chuyên Môn Nhân Sự Chủ Chốt (.xlsx)
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Bảng biểu chuẩn 12 cột mẫu Trang 2 Document5.pdf với Header 2 tầng (Thông tin nhân sự & Công việc hiện tại)
                </p>
              </div>
              <button onClick={() => setShowOfficialExportModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Select Scope */}
              <div className="space-y-2">
                <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                  1. Chọn phạm vi dữ liệu xuất file:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    onClick={() => setExportScopeOption('all')}
                    className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      exportScopeOption === 'all'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-white">Toàn bộ nhân sự</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {personnelList.filter(p => p.dataStatus !== 'da_xoa').length} bản ghi
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportScopeOption === 'all' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'}`}>
                      {exportScopeOption === 'all' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </label>

                  <label
                    onClick={() => setExportScopeOption('filtered')}
                    className={`cursor-pointer p-3.5 rounded-xl border flex items-center justify-between transition-all ${
                      exportScopeOption === 'filtered'
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-white">Theo danh sách đã lọc</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {filteredPersonnel.length} bản ghi
                      </p>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportScopeOption === 'filtered' ? 'border-emerald-400 bg-emerald-500' : 'border-slate-600'}`}>
                      {exportScopeOption === 'filtered' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </label>
                </div>
              </div>

              {/* Data quality check & Missing fields notice */}
              {(() => {
                const targetList = exportScopeOption === 'filtered' ? filteredPersonnel : personnelList.filter(p => p.dataStatus !== 'da_xoa');
                const missingAnalysis = targetList.map(p => {
                  const missing: string[] = [];
                  if (!p.employerName || !p.employerName.trim()) missing.push('Tên NSDLĐ');
                  if (!p.employerAddress || !p.employerAddress.trim()) missing.push('Địa chỉ NSDLĐ');
                  if (!p.jobTitle || !p.jobTitle.trim()) missing.push('Chức danh');
                  if (p.yearsWorkingForEmployer === undefined || p.yearsWorkingForEmployer === null || p.yearsWorkingForEmployer === 0) missing.push('Số năm làm việc');
                  if (!p.contactPerson || !p.contactPerson.trim()) missing.push('Người liên lạc');
                  if (!p.phone && !p.email) missing.push('SĐT/Email');
                  return { person: p, missing };
                }).filter(i => i.missing.length > 0);

                return (
                  <div className="space-y-2">
                    <label className="block text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                      2. Thống kê thông tin Công việc hiện tại (Group 2):
                    </label>

                    {missingAnalysis.length === 0 ? (
                      <div className="p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-xl text-emerald-300 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>100% bản ghi đã điền đầy đủ thông tin Tên NSDLĐ, Địa chỉ, Chức danh & Người liên lạc.</span>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-950 border border-amber-900/60 rounded-xl space-y-2">
                        <div className="flex items-center justify-between text-amber-300">
                          <span className="flex items-center gap-1.5 font-semibold">
                            <Info className="w-4 h-4 text-amber-400" />
                            Có {missingAnalysis.length}/{targetList.length} hồ sơ chưa hoàn thiện đủ các trường Công việc hiện tại.
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowMissingFieldsAnalysis(!showMissingFieldsAnalysis)}
                            className="text-amber-400 underline hover:text-amber-300 font-semibold text-[11px]"
                          >
                            {showMissingFieldsAnalysis ? 'Ẩn chi tiết' : 'Xem danh sách khuyết'}
                          </button>
                        </div>

                        {showMissingFieldsAnalysis && (
                          <div className="max-h-36 overflow-y-auto space-y-1.5 pt-2 border-t border-slate-800 text-[11px]">
                            {missingAnalysis.map((item, idx) => (
                              <div key={idx} className="flex items-center justify-between bg-slate-900 p-2 rounded-lg">
                                <span className="font-semibold text-white">{item.person.fullName} ({item.person.code})</span>
                                <span className="text-amber-300/90 italic">Thiếu: {item.missing.join(', ')}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 italic">
                          * Lưu ý: Các trường để trống sẽ được xuất ô trống tương ứng trên Excel, không tự tạo dữ liệu giả.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowOfficialExportModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetList = exportScopeOption === 'filtered' ? filteredPersonnel : personnelList.filter(p => p.dataStatus !== 'da_xoa');
                  exportPersonnelKeyProfileOfficialExcel(targetList, exportScopeOption);
                  setShowOfficialExportModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-950 flex items-center gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" /> Xuất File Excel (.xlsx) Ngay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
