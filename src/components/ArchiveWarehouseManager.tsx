import React, { useState, useMemo } from 'react';
import {
  Archive,
  Search,
  Plus,
  Filter,
  Download,
  QrCode,
  Barcode,
  Printer,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Building,
  UserCheck,
  MapPin,
  FolderOpen,
  Edit2,
  Trash2,
  Eye,
  ExternalLink,
  ShieldAlert,
  Layers,
  Box,
  Tag,
  ArrowRightLeft,
  FileCheck,
  Lock,
  HelpCircle,
  RefreshCw,
  X,
  Share2
} from 'lucide-react';
import {
  ArchiveDossier,
  ArchiveBorrowRecord,
  WarehouseLocation,
  WarehouseSlip,
  ArchiveCategory,
  ArchiveRetentionPeriod,
  ArchiveSecrecyLevel,
  ArchivePhysicalCondition,
  LocationStatus,
  BorrowStatus
} from '../types';
import {
  getArchiveDossiers,
  saveArchiveDossiers,
  getArchiveBorrows,
  saveArchiveBorrows,
  getWarehouseLocations,
  saveWarehouseLocations,
  getWarehouseSlips,
  saveWarehouseSlips
} from '../utils/archiveStorage';
import { getCurrentUser, getProjects } from '../utils/storage';
import { formatDateVN, formatDateForInput, getDaysRemaining } from '../utils/formatters';
import { exportArchiveDossiersExcel } from '../utils/exportUtils';

// Dictionary mapping
export const CATEGORY_MAP: Record<ArchiveCategory, { label: string; bg: string }> = {
  du_an_rpbm: { label: 'Dự án RPBM', bg: 'bg-emerald-950 text-emerald-400 border-emerald-800' },
  nghiep_vu_ky_thuat: { label: 'Nghiệp vụ Kỹ thuật', bg: 'bg-blue-950 text-blue-400 border-blue-800' },
  phap_ly_hop_dong: { label: 'Pháp lý & Hợp đồng', bg: 'bg-purple-950 text-purple-400 border-purple-800' },
  nhan_su_chung_chi: { label: 'Nhân sự & Chứng chỉ', bg: 'bg-amber-950 text-amber-400 border-amber-800' },
  tai_chinh_ke_toan: { label: 'Tài chính Kế toán', bg: 'bg-cyan-950 text-cyan-400 border-cyan-800' },
  tai_lieu_khac: { label: 'Tài liệu Khác', bg: 'bg-slate-800 text-slate-300 border-slate-700' }
};

export const SECRECY_MAP: Record<ArchiveSecrecyLevel, { label: string; badge: string }> = {
  thuong: { label: 'Thường', badge: 'bg-slate-800 text-slate-300 border-slate-700' },
  mat: { label: 'Mật', badge: 'bg-blue-950 text-blue-400 border-blue-800' },
  toi_mat: { label: 'Tối mật', badge: 'bg-amber-950 text-amber-400 border-amber-800' },
  tuyet_mat: { label: 'Tuyệt mật', badge: 'bg-rose-950 text-rose-400 border-rose-800' }
};

export const CONDITION_MAP: Record<ArchivePhysicalCondition, { label: string; color: string }> = {
  tot: { label: 'Tốt (Nguyên vẹn)', color: 'text-emerald-400' },
  binh_thuong: { label: 'Bình thường', color: 'text-blue-400' },
  hu_hong_nhe: { label: 'Hư hỏng nhẹ', color: 'text-amber-400' },
  can_bao_quan_dac_biet: { label: 'Cần bảo quản đặc biệt', color: 'text-rose-400' }
};

export const LOCATION_STATUS_MAP: Record<LocationStatus, { label: string; bg: string; border: string; icon: any }> = {
  trong: { label: 'Vị trí Trống', bg: 'bg-emerald-950/60 text-emerald-400', border: 'border-emerald-800', icon: Box },
  dang_luu: { label: 'Đang Lưu hồ sơ', bg: 'bg-blue-950/60 text-blue-400', border: 'border-blue-800', icon: FolderOpen },
  day: { label: 'Vị trí Đầy', bg: 'bg-indigo-950/60 text-indigo-400', border: 'border-indigo-800', icon: Layers },
  bi_khoa: { label: 'Vị trí Bị khóa', bg: 'bg-slate-800 text-slate-400', border: 'border-slate-700', icon: Lock },
  can_kiem_tra: { label: 'Cần Kiểm tra', bg: 'bg-amber-950/60 text-amber-400', border: 'border-amber-800', icon: AlertTriangle }
};

export const ArchiveWarehouseManager: React.FC = () => {
  const [archives, setArchives] = useState<ArchiveDossier[]>(getArchiveDossiers());
  const [borrows, setBorrows] = useState<ArchiveBorrowRecord[]>(getArchiveBorrows());
  const [locations, setLocations] = useState<WarehouseLocation[]>(getWarehouseLocations());
  const [slips, setSlips] = useState<WarehouseSlip[]>(getWarehouseSlips());
  const projects = useMemo(() => getProjects(), []);

  // Main active sub-tab
  const [activeTab, setActiveTab] = useState<'dossiers' | 'borrows' | 'map' | 'labels'>('dossiers');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [secrecyFilter, setSecrecyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [borrowStatusFilter, setBorrowStatusFilter] = useState<string>('all');

  // Selected details & Modals
  const [selectedArchive, setSelectedArchive] = useState<ArchiveDossier | null>(null);
  const [showAddArchiveModal, setShowAddArchiveModal] = useState<boolean>(false);
  const [editingArchive, setEditingArchive] = useState<ArchiveDossier | null>(null);
  
  const [showBorrowModal, setShowBorrowModal] = useState<ArchiveDossier | null>(null);
  const [selectedBorrow, setSelectedBorrow] = useState<ArchiveBorrowRecord | null>(null);
  const [showReturnModal, setShowReturnModal] = useState<ArchiveBorrowRecord | null>(null);

  // Print/Label Generator Modal State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printType, setPrintType] = useState<'qr_barcode' | 'box_label' | 'shelf_label' | 'import_slip' | 'export_slip' | 'borrow_slip'>('box_label');
  const [printArchive, setPrintArchive] = useState<ArchiveDossier | null>(null);
  const [printLocation, setPrintLocation] = useState<WarehouseLocation | null>(null);
  const [printBorrow, setPrintBorrow] = useState<ArchiveBorrowRecord | null>(null);

  // Form States
  const [archiveForm, setArchiveForm] = useState<Partial<ArchiveDossier>>({
    archiveCode: '',
    stt: 1,
    title: '',
    category: 'du_an_rpbm',
    relatedProjectId: '',
    relatedProjectName: '',
    archiveYear: 2026,
    retentionPeriod: 'vinh_vien',
    secrecyLevel: 'thuong',
    documentCount: 5,
    pageCount: 150,
    entryDate: formatDateForInput(new Date()),
    entryPerson: '',
    locationCode: 'KHO01-A-03-G02-T04-H12',
    boxCode: 'H12',
    physicalCondition: 'tot',
    catalogFileUrl: '',
    scanFileUrl: '',
    googleDriveUrl: '',
    notes: ''
  });

  const [borrowForm, setBorrowForm] = useState<{
    borrowerName: string;
    borrowerUnit: string;
    purpose: string;
    borrowDate: string;
    expectedReturnDate: string;
    conditionOnBorrow: string;
    approverName: string;
    notes: string;
  }>({
    borrowerName: '',
    borrowerUnit: 'Phòng Kỹ thuật Thi công',
    purpose: 'Phục vụ thanh quyết toán & kiểm tra dự án',
    borrowDate: formatDateForInput(new Date()),
    expectedReturnDate: formatDateForInput(new Date(Date.now() + 14 * 24 * 3600 * 1000)),
    conditionOnBorrow: 'Hồ sơ đầy đủ các tập, bìa cứng mới không rách',
    approverName: '',
    notes: ''
  });

  const [returnForm, setReturnForm] = useState<{
    actualReturnDate: string;
    conditionOnReturn: string;
    notes: string;
  }>({
    actualReturnDate: formatDateForInput(new Date()),
    conditionOnReturn: 'Hồ sơ nguyên vẹn, trả lại đầy đủ',
    notes: ''
  });

  // Filtered Archive Dossiers
  const filteredArchives = useMemo(() => {
    return archives.filter(a => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = a.archiveCode.toLowerCase().includes(q);
        const matchTitle = a.title.toLowerCase().includes(q);
        const matchLoc = a.locationCode.toLowerCase().includes(q);
        const matchBox = a.boxCode.toLowerCase().includes(q);
        const matchProj = (a.relatedProjectName || '').toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchLoc && !matchBox && !matchProj) return false;
      }

      if (categoryFilter !== 'all' && a.category !== categoryFilter) return false;
      if (secrecyFilter !== 'all' && a.secrecyLevel !== secrecyFilter) return false;
      if (statusFilter !== 'all' && a.status !== statusFilter) return false;

      return true;
    });
  }, [archives, searchQuery, categoryFilter, secrecyFilter, statusFilter]);

  // Filtered Borrow Records
  const filteredBorrows = useMemo(() => {
    return borrows.filter(b => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCode = b.archiveCode.toLowerCase().includes(q);
        const matchTitle = b.archiveTitle.toLowerCase().includes(q);
        const matchBorrower = b.borrowerName.toLowerCase().includes(q);
        const matchUnit = b.borrowerUnit.toLowerCase().includes(q);
        if (!matchCode && !matchTitle && !matchBorrower && !matchUnit) return false;
      }

      if (borrowStatusFilter !== 'all' && b.status !== borrowStatusFilter) return false;

      return true;
    });
  }, [borrows, searchQuery, borrowStatusFilter]);

  // Overdue Borrows Count
  const overdueBorrows = useMemo(() => {
    return borrows.filter(b => {
      if (b.status === 'da_tra') return false;
      const days = getDaysRemaining(b.expectedReturnDate);
      return days < 0;
    });
  }, [borrows]);

  // Visual Map Grid Grouping (Zone -> Row -> Shelf)
  const mapGrid = useMemo(() => {
    const zones: Record<string, Record<string, WarehouseLocation[]>> = {};

    locations.forEach(loc => {
      if (!zones[loc.zone]) zones[loc.zone] = {};
      const rowKey = `${loc.row} (${loc.shelf})`;
      if (!zones[loc.zone][rowKey]) zones[loc.zone][rowKey] = [];
      zones[loc.zone][rowKey].push(loc);
    });

    return zones;
  }, [locations]);

  // Handlers for Dossiers
  const handleOpenAddArchive = () => {
    const user = getCurrentUser();
    const nextStt = archives.length + 1;
    setArchiveForm({
      archiveCode: `HS-2026-RPBM-00${nextStt}`,
      stt: nextStt,
      title: '',
      category: 'du_an_rpbm',
      relatedProjectId: projects[0]?.id || '',
      relatedProjectName: projects[0]?.name || '',
      archiveYear: 2026,
      retentionPeriod: 'vinh_vien',
      secrecyLevel: 'thuong',
      documentCount: 10,
      pageCount: 250,
      entryDate: formatDateForInput(new Date()),
      entryPerson: user.name,
      locationCode: 'KHO01-A-03-G02-T04-H15',
      boxCode: 'H15',
      physicalCondition: 'tot',
      catalogFileUrl: '',
      scanFileUrl: '',
      googleDriveUrl: '',
      notes: ''
    });
    setEditingArchive(null);
    setShowAddArchiveModal(true);
  };

  const handleEditArchive = (a: ArchiveDossier) => {
    setEditingArchive(a);
    setArchiveForm({
      archiveCode: a.archiveCode,
      stt: a.stt,
      title: a.title,
      category: a.category,
      relatedProjectId: a.relatedProjectId || '',
      relatedProjectName: a.relatedProjectName || '',
      archiveYear: a.archiveYear,
      retentionPeriod: a.retentionPeriod,
      secrecyLevel: a.secrecyLevel,
      documentCount: a.documentCount,
      pageCount: a.pageCount,
      entryDate: a.entryDate,
      entryPerson: a.entryPerson,
      locationCode: a.locationCode,
      boxCode: a.boxCode,
      physicalCondition: a.physicalCondition,
      catalogFileUrl: a.catalogFileUrl || '',
      scanFileUrl: a.scanFileUrl || '',
      googleDriveUrl: a.googleDriveUrl || '',
      notes: a.notes || ''
    });
    setShowAddArchiveModal(true);
  };

  const handleSaveArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!archiveForm.title || !archiveForm.archiveCode) return;

    // 1. Anti-duplicate archive dossier code check (Requirement 21)
    const { checkDuplicateDocumentCode, checkWarehouseLocationFull } = require('../utils/validationRules');
    if (checkDuplicateDocumentCode(archiveForm.archiveCode, editingArchive?.id)) {
      alert(`❌ Cảnh báo dữ liệu: Mã hồ sơ "${archiveForm.archiveCode}" đã tồn tại trên hệ thống! Vui lòng kiểm tra lại.`);
      return;
    }

    // 2. Location capacity check warning (Requirement 21)
    if (archiveForm.locationCode) {
      const locObj = locations.find(l => l.locationCode === archiveForm.locationCode || l.id === archiveForm.locationCode);
      if (locObj) {
        const fullCheck = checkWarehouseLocationFull(locObj.id);
        if (fullCheck.isFull) {
          if (!confirm(`${fullCheck.message}\nBạn có vẫn muốn tiếp tục lưu vào vị trí này không?`)) {
            return;
          }
        }
      }
    }

    const user = getCurrentUser();
    const nowStr = formatDateVN(new Date());

    const selectedProj = projects.find(p => p.id === archiveForm.relatedProjectId);

    if (editingArchive) {
      const updated: ArchiveDossier = {
        ...editingArchive,
        archiveCode: archiveForm.archiveCode || editingArchive.archiveCode,
        stt: Number(archiveForm.stt) || editingArchive.stt,
        title: archiveForm.title || editingArchive.title,
        category: (archiveForm.category as ArchiveCategory) || editingArchive.category,
        relatedProjectId: archiveForm.relatedProjectId,
        relatedProjectName: selectedProj ? selectedProj.name : archiveForm.relatedProjectName,
        archiveYear: Number(archiveForm.archiveYear) || editingArchive.archiveYear,
        retentionPeriod: (archiveForm.retentionPeriod as ArchiveRetentionPeriod) || editingArchive.retentionPeriod,
        secrecyLevel: (archiveForm.secrecyLevel as ArchiveSecrecyLevel) || editingArchive.secrecyLevel,
        documentCount: Number(archiveForm.documentCount) || editingArchive.documentCount,
        pageCount: Number(archiveForm.pageCount) || editingArchive.pageCount,
        entryDate: archiveForm.entryDate || editingArchive.entryDate,
        entryPerson: archiveForm.entryPerson || editingArchive.entryPerson,
        locationCode: archiveForm.locationCode || editingArchive.locationCode,
        boxCode: archiveForm.boxCode || editingArchive.boxCode,
        physicalCondition: (archiveForm.physicalCondition as ArchivePhysicalCondition) || editingArchive.physicalCondition,
        catalogFileUrl: archiveForm.catalogFileUrl,
        scanFileUrl: archiveForm.scanFileUrl,
        googleDriveUrl: archiveForm.googleDriveUrl,
        notes: archiveForm.notes,
        updatedAt: nowStr
      };

      const newList = archives.map(item => (item.id === editingArchive.id ? updated : item));
      saveArchiveDossiers(newList, `Cập nhật hồ sơ lưu kho: ${updated.archiveCode}`);
      setArchives(newList);
      if (selectedArchive?.id === editingArchive.id) setSelectedArchive(updated);
    } else {
      const newArchive: ArchiveDossier = {
        id: `arch-${Date.now()}`,
        archiveCode: archiveForm.archiveCode,
        stt: Number(archiveForm.stt) || archives.length + 1,
        title: archiveForm.title,
        category: (archiveForm.category as ArchiveCategory) || 'du_an_rpbm',
        relatedProjectId: archiveForm.relatedProjectId,
        relatedProjectName: selectedProj ? selectedProj.name : archiveForm.relatedProjectName,
        archiveYear: Number(archiveForm.archiveYear) || 2026,
        retentionPeriod: (archiveForm.retentionPeriod as ArchiveRetentionPeriod) || 'vinh_vien',
        secrecyLevel: (archiveForm.secrecyLevel as ArchiveSecrecyLevel) || 'thuong',
        documentCount: Number(archiveForm.documentCount) || 5,
        pageCount: Number(archiveForm.pageCount) || 100,
        entryDate: archiveForm.entryDate || formatDateForInput(new Date()),
        entryPerson: archiveForm.entryPerson || user.name,
        locationCode: archiveForm.locationCode || 'KHO01-A-03-G02-T04-H15',
        boxCode: archiveForm.boxCode || 'H15',
        physicalCondition: (archiveForm.physicalCondition as ArchivePhysicalCondition) || 'tot',
        catalogFileUrl: archiveForm.catalogFileUrl,
        scanFileUrl: archiveForm.scanFileUrl,
        googleDriveUrl: archiveForm.googleDriveUrl,
        notes: archiveForm.notes,
        qrCode: `${archiveForm.locationCode}::${archiveForm.archiveCode}`,
        barcode: `893${Date.now().toString().slice(-10)}`,
        status: 'luu_kho',
        createdAt: nowStr,
        updatedAt: nowStr
      };

      const newList = [newArchive, ...archives];
      saveArchiveDossiers(newList, `Nhập kho hồ sơ mới: ${newArchive.archiveCode}`);
      setArchives(newList);

      // Update location status
      const targetLoc = locations.find(l => l.locationCode === newArchive.locationCode);
      if (targetLoc && targetLoc.status === 'trong') {
        const updatedLocs = locations.map(l =>
          l.id === targetLoc.id ? { ...l, status: 'dang_luu' as const, currentBoxCount: 1 } : l
        );
        saveWarehouseLocations(updatedLocs);
        setLocations(updatedLocs);
      }
    }

    setShowAddArchiveModal(false);
    setEditingArchive(null);
  };

  const handleDeleteArchive = (a: ArchiveDossier) => {
    if (confirm(`Bạn có chắc muốn tiêu hủy / xóa thông tin hồ sơ lưu kho "${a.archiveCode}"?`)) {
      const newList = archives.filter(item => item.id !== a.id);
      saveArchiveDossiers(newList, `Xóa hồ sơ lưu kho: ${a.archiveCode}`);
      setArchives(newList);
      if (selectedArchive?.id === a.id) setSelectedArchive(null);
    }
  };

  // Handlers for Borrowing & Returning
  const handleOpenBorrowModal = (a: ArchiveDossier) => {
    const user = getCurrentUser();
    setShowBorrowModal(a);
    setBorrowForm({
      borrowerName: user.name,
      borrowerUnit: user.departmentOrUnit || 'Phòng Kỹ thuật Thi công',
      purpose: 'Phục vụ kiểm tra & nghiệm thu công trình RPBM',
      borrowDate: formatDateForInput(new Date()),
      expectedReturnDate: formatDateForInput(new Date(Date.now() + 14 * 24 * 3600 * 1000)),
      conditionOnBorrow: 'Hồ sơ đầy đủ, bìa cứng nguyên vẹn',
      approverName: 'Thượng tá Nguyễn Văn Hùng',
      notes: ''
    });
  };

  const handleCreateBorrowRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showBorrowModal || !borrowForm.borrowerName) return;

    const newRecord: ArchiveBorrowRecord = {
      id: `bor-${Date.now()}`,
      archiveId: showBorrowModal.id,
      archiveCode: showBorrowModal.archiveCode,
      archiveTitle: showBorrowModal.title,
      borrowerName: borrowForm.borrowerName,
      borrowerUnit: borrowForm.borrowerUnit,
      purpose: borrowForm.purpose,
      borrowDate: borrowForm.borrowDate,
      expectedReturnDate: borrowForm.expectedReturnDate,
      conditionOnBorrow: borrowForm.conditionOnBorrow,
      approverName: borrowForm.approverName || 'Chỉ huy đơn vị',
      slipFileUrl: 'https://drive.google.com/file/d/sample-borrow-slip/view',
      status: 'dang_muon',
      notes: borrowForm.notes,
      createdAt: formatDateVN(new Date())
    };

    // Save borrow record
    const newBorrowList = [newRecord, ...borrows];
    saveArchiveBorrows(newBorrowList, `Tạo phiếu mượn hồ sơ ${showBorrowModal.archiveCode} cho ${newRecord.borrowerName}`);
    setBorrows(newBorrowList);

    // Update dossier status to dang_muon
    const updatedArchives = archives.map(a =>
      a.id === showBorrowModal.id ? { ...a, status: 'dang_muon' as const } : a
    );
    saveArchiveDossiers(updatedArchives);
    setArchives(updatedArchives);

    if (selectedArchive?.id === showBorrowModal.id) {
      setSelectedArchive({ ...selectedArchive, status: 'dang_muon' });
    }

    setShowBorrowModal(null);
  };

  const handleOpenReturnModal = (record: ArchiveBorrowRecord) => {
    setShowReturnModal(record);
    setReturnForm({
      actualReturnDate: formatDateForInput(new Date()),
      conditionOnReturn: 'Trả lại nguyên vẹn, đầy đủ tài liệu',
      notes: ''
    });
  };

  const handleConfirmReturn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReturnModal) return;

    const updatedBorrows = borrows.map(b =>
      b.id === showReturnModal.id
        ? {
            ...b,
            actualReturnDate: returnForm.actualReturnDate,
            conditionOnReturn: returnForm.conditionOnReturn,
            status: 'da_tra' as const,
            notes: (b.notes || '') + ` (Đã trả ngày ${formatDateVN(returnForm.actualReturnDate)})`
          }
        : b
    );
    saveArchiveBorrows(updatedBorrows, `Xác nhận trả hồ sơ: ${showReturnModal.archiveCode}`);
    setBorrows(updatedBorrows);

    // Restore dossier status to luu_kho
    const updatedArchives = archives.map(a =>
      a.id === showReturnModal.archiveId ? { ...a, status: 'luu_kho' as const } : a
    );
    saveArchiveDossiers(updatedArchives);
    setArchives(updatedArchives);

    if (selectedArchive?.id === showReturnModal.archiveId) {
      setSelectedArchive({ ...selectedArchive, status: 'luu_kho' });
    }

    setShowReturnModal(null);
  };

  // Label / Slip Generator Trigger
  const handleOpenPrintModal = (
    type: 'qr_barcode' | 'box_label' | 'shelf_label' | 'import_slip' | 'export_slip' | 'borrow_slip',
    archive?: ArchiveDossier,
    loc?: WarehouseLocation,
    bor?: ArchiveBorrowRecord
  ) => {
    setPrintType(type);
    setPrintArchive(archive || archives[0] || null);
    setPrintLocation(loc || locations[0] || null);
    setPrintBorrow(bor || borrows[0] || null);
    setShowPrintModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
            <Archive className="w-6 h-6 text-indigo-400" />
            Phân hệ Quản lý Kho Hồ sơ & Lưu trữ (12)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý sơ đồ kho lưu trữ phân cấp (Kho → Khu → Dãy → Giá → Tầng → Hộp → Tập hồ sơ), theo dõi thông tin hồ sơ 12.1, quy trình nhập xuất mượn trả 12.2, sơ đồ kho trực quan 12.3 và in tem QR/Barcode/Nhãn/Phiếu.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => exportArchiveDossiersExcel(filteredArchives)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            title="Xuất danh sách hồ sơ Excel UTF-8"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Xuất Báo cáo Excel
          </button>

          <button
            onClick={() => handleOpenPrintModal('box_label', archives[0])}
            className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
          >
            <Printer className="w-4 h-4 text-amber-400" /> Tạo & In Nhãn / Phiếu
          </button>

          <button
            onClick={handleOpenAddArchive}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-950 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Nhập Kho Hồ sơ Mới
          </button>
        </div>
      </div>

      {/* Overdue Borrow Alert Banner */}
      {overdueBorrows.length > 0 && (
        <div className="bg-rose-950/80 border border-rose-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs shadow-lg animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-900 border border-rose-700 rounded-xl text-rose-300 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-rose-200 text-sm">
                CẢNH BÁO QUÁ HẠN MƯỢN TRẢ: Có {overdueBorrows.length} hồ sơ chưa được hoàn trả đúng hạn!
              </h4>
              <p className="text-rose-300 text-[11px] mt-0.5">
                Các hồ sơ mượn quá hạn bao gồm: {overdueBorrows.map(b => `${b.archiveCode} (${b.borrowerName})`).join(', ')}. Yêu cầu thu hồi ngay.
              </p>
            </div>
          </div>
          <button
            onClick={() => { setActiveTab('borrows'); setBorrowStatusFilter('qua_han'); }}
            className="bg-rose-900 hover:bg-rose-800 text-white px-3.5 py-2 rounded-xl border border-rose-700 font-semibold transition-all shrink-0"
          >
            Xem danh sách quá hạn →
          </button>
        </div>
      )}

      {/* Stat KPI Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tổng Hồ sơ Lưu kho</p>
            <h3 className="text-2xl font-black text-white mt-1">{archives.length} <span className="text-xs font-normal text-slate-400">hồ sơ</span></h3>
          </div>
          <div className="p-3 bg-indigo-950/80 border border-indigo-800/80 rounded-xl text-indigo-400">
            <Archive className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hồ sơ Đang Mượn</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {borrows.filter(b => b.status === 'dang_muon' || b.status === 'qua_han').length}
            </h3>
          </div>
          <div className="p-3 bg-amber-950/80 border border-amber-800/80 rounded-xl text-amber-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Tỷ lệ Vị trí Trống</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {Math.round((locations.filter(l => l.status === 'trong').length / locations.length) * 100)}%
            </h3>
          </div>
          <div className="p-3 bg-emerald-950/80 border border-emerald-800/80 rounded-xl text-emerald-400">
            <Box className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Hồ sơ Mật & Tối Mật</p>
            <h3 className="text-2xl font-black text-purple-400 mt-1">
              {archives.filter(a => a.secrecyLevel === 'mat' || a.secrecyLevel === 'toi_mat' || a.secrecyLevel === 'tuyet_mat').length}
            </h3>
          </div>
          <div className="p-3 bg-purple-950/80 border border-purple-800/80 rounded-xl text-purple-400">
            <Lock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Sub-tabs navigation */}
      <div className="flex border-b border-slate-800 overflow-x-auto pb-0.5 space-x-1">
        <button
          onClick={() => setActiveTab('dossiers')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'dossiers'
              ? 'bg-slate-900 text-indigo-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <FolderOpen className="w-4 h-4" /> 12.1 Danh mục Hồ sơ Lưu kho ({filteredArchives.length})
        </button>

        <button
          onClick={() => setActiveTab('borrows')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'borrows'
              ? 'bg-slate-900 text-amber-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <ArrowRightLeft className="w-4 h-4" /> 12.2 Quản lý Mượn / Trả ({borrows.length})
          {overdueBorrows.length > 0 && (
            <span className="bg-rose-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {overdueBorrows.length} quá hạn
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'map'
              ? 'bg-slate-900 text-emerald-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <MapPin className="w-4 h-4" /> 12.3 Sơ đồ Trực quan Vị trí Kho
        </button>

        <button
          onClick={() => setActiveTab('labels')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 shrink-0 ${
            activeTab === 'labels'
              ? 'bg-slate-900 text-purple-400 border-t border-x border-slate-800 shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
          }`}
        >
          <Tag className="w-4 h-4" /> Tạo & In Mã QR / Barcode / Phiếu
        </button>
      </div>

      {/* SUB-TAB 12.1: THÔNG TIN HỒ SƠ LƯU KHO */}
      {activeTab === 'dossiers' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm theo Mã HS, Tên hồ sơ, Mã vị trí (e.g. KHO01-A-03-G02-T04-H12), Mã hộp..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={categoryFilter}
                  onChange={e => setCategoryFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Loại Hồ sơ</option>
                  {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={secrecyFilter}
                  onChange={e => setSecrecyFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Mức độ Mật</option>
                  {Object.entries(SECRECY_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Archive Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Mã & STT</th>
                    <th className="p-3.5">Tên Hồ sơ & Phân loại</th>
                    <th className="p-3.5">Mã Vị trí Storage Code</th>
                    <th className="p-3.5">Dự án liên quan</th>
                    <th className="p-3.5">Mức độ Mật / Hạn lưu</th>
                    <th className="p-3.5">Số TL / Tờ</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredArchives.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                        Không tìm thấy hồ sơ nào phù hợp với điều kiện tìm kiếm.
                      </td>
                    </tr>
                  ) : (
                    filteredArchives.map(archive => {
                      const catInfo = CATEGORY_MAP[archive.category];
                      const secrecyInfo = SECRECY_MAP[archive.secrecyLevel];
                      const conditionInfo = CONDITION_MAP[archive.physicalCondition];

                      return (
                        <tr key={archive.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5">
                            <span className="font-mono text-indigo-400 font-bold block">{archive.archiveCode}</span>
                            <span className="text-[10px] text-slate-500 font-mono">STT: #{archive.stt}</span>
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${catInfo.bg}`}>
                              {catInfo.label}
                            </span>
                            <h4 className="font-bold text-white text-xs line-clamp-2">{archive.title}</h4>
                            <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-2">
                              <span>Năm: <strong className="text-slate-300">{archive.archiveYear}</strong></span> • 
                              <span className={conditionInfo.color}>{conditionInfo.label}</span>
                            </div>
                          </td>

                          <td className="p-3.5">
                            <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 font-mono text-[11px]">
                              <span className="text-emerald-400 font-bold block">{archive.locationCode}</span>
                              <span className="text-slate-500 text-[10px]">Mã hộp: <strong className="text-amber-400">{archive.boxCode}</strong></span>
                            </div>
                          </td>

                          <td className="p-3.5 max-w-[180px]">
                            <span className="text-slate-300 font-medium line-clamp-2">
                              {archive.relatedProjectName || 'Không trực thuộc dự án'}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mb-1 ${secrecyInfo.badge}`}>
                              {secrecyInfo.label}
                            </span>
                            <div className="text-[10px] text-slate-400">
                              Bảo quản: <strong className="text-slate-200">{archive.retentionPeriod === 'vinh_vien' ? 'Vĩnh viễn' : archive.retentionPeriod.replace('_nam', ' năm')}</strong>
                            </div>
                          </td>

                          <td className="p-3.5 font-mono">
                            <strong className="text-slate-200">{archive.documentCount}</strong> TL / <strong className="text-indigo-400">{archive.pageCount}</strong> tờ
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border font-mono inline-block ${
                                archive.status === 'luu_kho'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : archive.status === 'dang_muon'
                                  ? 'bg-amber-950 text-amber-400 border-amber-800'
                                  : 'bg-rose-950 text-rose-400 border-rose-800'
                              }`}
                            >
                              {archive.status === 'luu_kho' ? 'Đang lưu kho' : archive.status === 'dang_muon' ? 'Đang mượn' : 'Đã tiêu hủy'}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedArchive(archive)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                                title="Xem Chi tiết Hồ sơ"
                              >
                                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                              </button>

                              {archive.status === 'luu_kho' && (
                                <button
                                  onClick={() => handleOpenBorrowModal(archive)}
                                  className="p-1.5 rounded-lg bg-amber-950 hover:bg-amber-900/80 text-amber-300 border border-amber-800 text-xs transition-colors"
                                  title="Tạo Phiếu Mượn Hồ sơ"
                                >
                                  <ArrowRightLeft className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenPrintModal('box_label', archive)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                                title="In Tem QR / Nhãn hộp"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
                              </button>

                              <button
                                onClick={() => handleEditArchive(archive)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                                title="Sửa thông tin"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
                              </button>

                              <button
                                onClick={() => handleDeleteArchive(archive)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                                title="Xóa hồ sơ"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}

      {/* SUB-TAB 12.2: QUẢN LÝ MƯỢN / TRẢ & NHẬP XUẤT */}
      {activeTab === 'borrows' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="relative md:col-span-2">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm phiếu mượn theo tên người mượn, đơn vị, mã hồ sơ..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <select
                  value={borrowStatusFilter}
                  onChange={e => setBorrowStatusFilter(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="all">Tất cả Trạng thái Mượn/Trả</option>
                  <option value="dang_muon">Đang mượn (Trong hạn)</option>
                  <option value="qua_han">Quá hạn chưa trả ⚠️</option>
                  <option value="da_tra">Đã hoàn trả</option>
                </select>
              </div>
            </div>
          </div>

          {/* Borrow List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Mã Hồ sơ</th>
                    <th className="p-3.5">Tên Hồ sơ mượn</th>
                    <th className="p-3.5">Người mượn & Đơn vị</th>
                    <th className="p-3.5">Mục đích mượn</th>
                    <th className="p-3.5">Ngày mượn</th>
                    <th className="p-3.5">Ngày dự kiến trả</th>
                    <th className="p-3.5">Trạng thái</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredBorrows.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-500 italic">
                        Chưa có lịch sử mượn trả nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredBorrows.map(record => {
                      const daysLeft = getDaysRemaining(record.expectedReturnDate);
                      const isOverdue = record.status === 'qua_han' || (record.status === 'dang_muon' && daysLeft < 0);

                      return (
                        <tr
                          key={record.id}
                          className={`hover:bg-slate-800/40 transition-colors ${
                            isOverdue ? 'bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="p-3.5 font-mono text-indigo-400 font-bold">{record.archiveCode}</td>
                          <td className="p-3.5 max-w-xs font-bold text-white line-clamp-2">{record.archiveTitle}</td>

                          <td className="p-3.5">
                            <strong className="text-slate-200 block text-xs">{record.borrowerName}</strong>
                            <span className="text-[10px] text-slate-400">{record.borrowerUnit}</span>
                          </td>

                          <td className="p-3.5 max-w-[200px] text-slate-300 italic line-clamp-2">
                            "{record.purpose}"
                          </td>

                          <td className="p-3.5 font-mono text-slate-300">{formatDateVN(record.borrowDate)}</td>

                          <td className="p-3.5 font-mono">
                            <span className={isOverdue ? 'text-rose-400 font-bold' : 'text-amber-400 font-semibold'}>
                              {formatDateVN(record.expectedReturnDate)}
                            </span>
                            {record.status !== 'da_tra' && (
                              <span className="block text-[10px] text-slate-500">
                                {daysLeft < 0 ? `(Quá hạn ${Math.abs(daysLeft)} ngày)` : `(Còn ${daysLeft} ngày)`}
                              </span>
                            )}
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2.5 py-1 rounded text-[10px] font-bold border font-mono inline-block ${
                                record.status === 'da_tra'
                                  ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                                  : isOverdue
                                  ? 'bg-rose-950 text-rose-400 border-rose-800 animate-pulse'
                                  : 'bg-amber-950 text-amber-400 border-amber-800'
                              }`}
                            >
                              {record.status === 'da_tra'
                                ? 'Đã trả'
                                : isOverdue
                                ? 'QUÁ HẠN MƯỢN'
                                : 'Đang mượn'}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {record.status !== 'da_tra' && (
                                <button
                                  onClick={() => handleOpenReturnModal(record)}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow transition-colors flex items-center gap-1"
                                >
                                  <FileCheck className="w-3.5 h-3.5" /> Trả hồ sơ
                                </button>
                              )}

                              <button
                                onClick={() => handleOpenPrintModal('borrow_slip', undefined, undefined, record)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                                title="In Phiếu Mượn Hồ sơ"
                              >
                                <Printer className="w-3.5 h-3.5 text-amber-400" />
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
        </div>
      )}

      {/* SUB-TAB 12.3: SƠ ĐỒ TRỰC QUAN VỊ TRÍ KHO */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          {/* Storage Legend & Search */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <span className="font-bold text-slate-300 uppercase tracking-wider text-[11px] mr-1">Chú giải Vị trí:</span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800 font-semibold">
                <Box className="w-3.5 h-3.5" /> Vị trí Trống ({locations.filter(l => l.status === 'trong').length})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950 text-blue-400 border border-blue-800 font-semibold">
                <FolderOpen className="w-3.5 h-3.5" /> Đang lưu hồ sơ ({locations.filter(l => l.status === 'dang_luu').length})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950 text-indigo-400 border border-indigo-800 font-semibold">
                <Layers className="w-3.5 h-3.5" /> Vị trí Đầy ({locations.filter(l => l.status === 'day').length})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 font-semibold">
                <Lock className="w-3.5 h-3.5" /> Bị khóa ({locations.filter(l => l.status === 'bi_khoa').length})
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950 text-amber-400 border border-amber-800 font-semibold">
                <AlertTriangle className="w-3.5 h-3.5" /> Cần kiểm tra ({locations.filter(l => l.status === 'can_kiem_tra').length})
              </span>
            </div>

            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm mã vị trí (e.g. KHO01-A-03-G02)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Map Grid by Zones */}
          <div className="space-y-6">
            {Object.entries(mapGrid).map(([zoneName, rowGroup]) => (
              <div key={zoneName} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-indigo-400" />
                    {zoneName} - Kho Hồ sơ RPBM Trung tâm (KHO01)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Số lượng vị trí lưu: {Object.values(rowGroup).flat().length} ô
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {Object.entries(rowGroup).map(([rowShelfTitle, locList]) => (
                    <div key={rowShelfTitle} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono">
                        <Layers className="w-4 h-4 text-emerald-400" /> {rowShelfTitle}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        {locList.map(loc => {
                          const statusConfig = LOCATION_STATUS_MAP[loc.status];
                          const IconComp = statusConfig.icon;
                          const storedArchive = archives.find(a => a.locationCode === loc.locationCode);
                          const isHighlighted = searchQuery.trim() && loc.locationCode.toLowerCase().includes(searchQuery.toLowerCase());

                          return (
                            <div
                              key={loc.id}
                              onClick={() => {
                                if (storedArchive) setSelectedArchive(storedArchive);
                                else handleOpenPrintModal('shelf_label', undefined, loc);
                              }}
                              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group relative ${
                                statusConfig.bg
                              } ${statusConfig.border} ${
                                isHighlighted ? 'ring-2 ring-emerald-400 scale-105 shadow-xl' : 'hover:scale-[1.02]'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-[11px] font-bold text-white truncate">{loc.boxCode}</span>
                                <IconComp className="w-4 h-4 shrink-0" />
                              </div>

                              <div>
                                <span className="text-[10px] font-mono block text-slate-300 truncate" title={loc.locationCode}>
                                  {loc.locationCode.split('-').slice(-2).join('-')}
                                </span>
                                <span className="text-[9px] font-semibold uppercase tracking-wider block mt-0.5 opacity-80">
                                  {statusConfig.label}
                                </span>
                              </div>

                              {storedArchive && (
                                <div className="pt-1.5 border-t border-slate-800/80 text-[10px] text-slate-200 line-clamp-1 font-semibold">
                                  {storedArchive.archiveCode}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB 12.4: TẠO VÀ IN MÃ QR / BARCODE / NHÃN / PHIẾU */}
      {activeTab === 'labels' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-400" />
                Công cụ Khởi tạo & In Ấn Nhãn Hộp, Mã Vạch, QR Code & Biên bản
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hỗ trợ in nhãn hộp dán trực tiếp, mã vạch chuẩn 13 số, tem QR Code định vị và các mẫu phiếu nhập, xuất, mượn hồ sơ.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              onClick={() => handleOpenPrintModal('box_label', archives[0])}
              className="bg-slate-950 border border-slate-800 hover:border-purple-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-purple-950 text-purple-400 border border-purple-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <Tag className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Nhãn Hộp Hồ sơ (Box Label)</h4>
              <p className="text-xs text-slate-400">
                In nhãn hộp kích thước chuẩn dán lên bìa hộp hồ sơ bao gồm Mã HS, Mã Vị trí, Mức độ mật, QR code & Barcode.
              </p>
              <span className="text-xs text-purple-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Tạo nhãn mẫu →
              </span>
            </div>

            <div
              onClick={() => handleOpenPrintModal('shelf_label', undefined, locations[0])}
              className="bg-slate-950 border border-slate-800 hover:border-emerald-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Nhãn Giá / Kệ Kho (Shelf Label)</h4>
              <p className="text-xs text-slate-400">
                In nhãn gắn lên thành giá kệ kho định vị Khu vực, Dãy, Tầng và sức chứa ô kho.
              </p>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Tạo nhãn mẫu →
              </span>
            </div>

            <div
              onClick={() => handleOpenPrintModal('qr_barcode', archives[0])}
              className="bg-slate-950 border border-slate-800 hover:border-amber-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-amber-950 text-amber-400 border border-amber-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Mã QR Code & Barcode Đơn lẻ</h4>
              <p className="text-xs text-slate-400">
                Khởi tạo và xuất ảnh vector SVG / PNG mã QR định vị ô kho và mã vạch Barcode 13 số.
              </p>
              <span className="text-xs text-amber-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Tạo mã mẫu →
              </span>
            </div>

            <div
              onClick={() => handleOpenPrintModal('import_slip', archives[0])}
              className="bg-slate-950 border border-slate-800 hover:border-blue-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-blue-950 text-blue-400 border border-blue-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <FileCheck className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Phiếu Nhập Kho Hồ sơ</h4>
              <p className="text-xs text-slate-400">
                Biên bản bàn giao nhập kho tài liệu chính thức phục vụ nghiệm lưu trữ văn thư.
              </p>
              <span className="text-xs text-blue-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Xem mẫu phiếu →
              </span>
            </div>

            <div
              onClick={() => handleOpenPrintModal('export_slip', archives[0])}
              className="bg-slate-950 border border-slate-800 hover:border-cyan-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Phiếu Xuất Kho Hồ sơ</h4>
              <p className="text-xs text-slate-400">
                Mẫu phiếu xuất kho hồ sơ tài liệu tiêu hủy hoặc bàn giao lưu trữ vĩnh viễn đơn vị khác.
              </p>
              <span className="text-xs text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Xem mẫu phiếu →
              </span>
            </div>

            <div
              onClick={() => handleOpenPrintModal('borrow_slip', undefined, undefined, borrows[0])}
              className="bg-slate-950 border border-slate-800 hover:border-rose-600 p-5 rounded-2xl cursor-pointer transition-all space-y-3 group"
            >
              <div className="p-3 bg-rose-950 text-rose-400 border border-rose-800 rounded-xl w-fit group-hover:scale-110 transition-transform">
                <ArrowRightLeft className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-white text-sm">Phiếu Mượn / Trả Hồ sơ</h4>
              <p className="text-xs text-slate-400">
                Mẫu phiếu theo dõi quy trình mượn trả hồ sơ có chữ ký phê duyệt chỉ huy.
              </p>
              <span className="text-xs text-rose-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Xem mẫu phiếu →
              </span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL / DRAWER: VIEW ARCHIVE DETAILS */}
      {selectedArchive && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold bg-indigo-950 text-indigo-400 border border-indigo-800 px-2 py-0.5 rounded">
                    {selectedArchive.archiveCode}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${CATEGORY_MAP[selectedArchive.category].bg}`}>
                    {CATEGORY_MAP[selectedArchive.category].label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-2">{selectedArchive.title}</h3>
              </div>
              <button onClick={() => setSelectedArchive(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Location & Secrecy summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 text-[11px] block">Mã vị trí lưu kho:</span>
                <strong className="text-emerald-400 font-mono text-xs">{selectedArchive.locationCode}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Mã Hộp:</span>
                <strong className="text-amber-400 font-mono text-xs">{selectedArchive.boxCode}</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Mức độ Mật:</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${SECRECY_MAP[selectedArchive.secrecyLevel].badge}`}>
                  {SECRECY_MAP[selectedArchive.secrecyLevel].label}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Thời hạn bảo quản:</span>
                <strong className="text-slate-200">
                  {selectedArchive.retentionPeriod === 'vinh_vien' ? 'Vĩnh viễn' : selectedArchive.retentionPeriod.replace('_nam', ' năm')}
                </strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Số lượng tài liệu / tờ:</span>
                <strong className="text-indigo-400 font-mono">{selectedArchive.documentCount} TL / {selectedArchive.pageCount} tờ</strong>
              </div>
              <div>
                <span className="text-slate-500 text-[11px] block">Ngày nhập kho:</span>
                <strong className="text-slate-200">{formatDateVN(selectedArchive.entryDate)}</strong> ({selectedArchive.entryPerson})
              </div>
            </div>

            {/* Related project & condition */}
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Dự án liên quan:</span>
                <strong className="text-purple-300">{selectedArchive.relatedProjectName || 'Không trực thuộc dự án'}</strong>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-slate-400">Tình trạng vật lý:</span>
                <strong className={CONDITION_MAP[selectedArchive.physicalCondition].color}>
                  {CONDITION_MAP[selectedArchive.physicalCondition].label}
                </strong>
              </div>
            </div>

            {/* Files & Links */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider text-[11px]">File & Tài liệu Quét</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {selectedArchive.catalogFileUrl && (
                  <a
                    href={selectedArchive.catalogFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-600 text-xs text-blue-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><FileText className="w-4 h-4" /> File Mục lục</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedArchive.scanFileUrl && (
                  <a
                    href={selectedArchive.scanFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-600 text-xs text-emerald-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><FileCheck className="w-4 h-4" /> File Scan 3D/PDF</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                {selectedArchive.googleDriveUrl && (
                  <a
                    href={selectedArchive.googleDriveUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-600 text-xs text-amber-400 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-1.5"><FolderOpen className="w-4 h-4" /> Google Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            {selectedArchive.notes && (
              <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <strong className="text-slate-300 block mb-1">Ghi chú bảo quản:</strong>
                {selectedArchive.notes}
              </div>
            )}

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={() => handleOpenPrintModal('box_label', selectedArchive)}
                className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <Printer className="w-4 h-4" /> In Nhãn Hộp & QR Code
              </button>
              <button
                onClick={() => setSelectedArchive(null)}
                className="bg-slate-800 text-slate-300 text-xs font-semibold px-4 py-2 rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ARCHIVE DOSSIER */}
      {showAddArchiveModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Archive className="w-5 h-5 text-indigo-400" />
                {editingArchive ? 'Cập nhật Thông tin Hồ sơ Lưu kho' : 'Thêm Mới Hồ sơ Nhập Kho'}
              </h3>
              <button onClick={() => setShowAddArchiveModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArchive} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mã Hồ sơ <span className="text-rose-400">*</span></label>
                  <input
                    type="text"
                    required
                    value={archiveForm.archiveCode}
                    onChange={e => setArchiveForm({ ...archiveForm, archiveCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Số thứ tự (STT)</label>
                  <input
                    type="number"
                    value={archiveForm.stt}
                    onChange={e => setArchiveForm({ ...archiveForm, stt: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Loại Hồ sơ</label>
                  <select
                    value={archiveForm.category}
                    onChange={e => setArchiveForm({ ...archiveForm, category: e.target.value as ArchiveCategory })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {Object.entries(CATEGORY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tên Hồ sơ <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hồ sơ Nghiệm thu Hoàn thành Rà phá Bom mìn Dự án X..."
                  value={archiveForm.title}
                  onChange={e => setArchiveForm({ ...archiveForm, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Dự án Liên quan</label>
                  <select
                    value={archiveForm.relatedProjectId}
                    onChange={e => setArchiveForm({ ...archiveForm, relatedProjectId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="">-- Không chọn --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Năm Hồ sơ</label>
                  <input
                    type="number"
                    value={archiveForm.archiveYear}
                    onChange={e => setArchiveForm({ ...archiveForm, archiveYear: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Thời hạn Bảo quản</label>
                  <select
                    value={archiveForm.retentionPeriod}
                    onChange={e => setArchiveForm({ ...archiveForm, retentionPeriod: e.target.value as ArchiveRetentionPeriod })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="vinh_vien">Vĩnh viễn</option>
                    <option value="50_nam">50 năm</option>
                    <option value="30_nam">30 năm</option>
                    <option value="20_nam">20 năm</option>
                    <option value="10_nam">10 năm</option>
                    <option value="5_nam">5 năm</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Mức độ Mật</label>
                  <select
                    value={archiveForm.secrecyLevel}
                    onChange={e => setArchiveForm({ ...archiveForm, secrecyLevel: e.target.value as ArchiveSecrecyLevel })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {Object.entries(SECRECY_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Mã Vị trí Lưu kho (Kho-Khu-Dãy-Giá-Tầng-Hộp)</label>
                  <select
                    value={archiveForm.locationCode}
                    onChange={e => {
                      const loc = locations.find(l => l.locationCode === e.target.value);
                      setArchiveForm({
                        ...archiveForm,
                        locationCode: e.target.value,
                        boxCode: loc ? loc.boxCode : archiveForm.boxCode
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.locationCode}>
                        {l.locationCode} ({l.status === 'trong' ? 'Trống' : 'Đang sử dụng'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Mã Hộp</label>
                  <input
                    type="text"
                    value={archiveForm.boxCode}
                    onChange={e => setArchiveForm({ ...archiveForm, boxCode: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Số lượng Tài liệu</label>
                  <input
                    type="number"
                    value={archiveForm.documentCount}
                    onChange={e => setArchiveForm({ ...archiveForm, documentCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Số tờ</label>
                  <input
                    type="number"
                    value={archiveForm.pageCount}
                    onChange={e => setArchiveForm({ ...archiveForm, pageCount: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Tình trạng Vật lý</label>
                  <select
                    value={archiveForm.physicalCondition}
                    onChange={e => setArchiveForm({ ...archiveForm, physicalCondition: e.target.value as ArchivePhysicalCondition })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  >
                    {Object.entries(CONDITION_MAP).map(([key, val]) => (
                      <option key={key} value={key}>{val.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Link File Mục lục</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={archiveForm.catalogFileUrl}
                    onChange={e => setArchiveForm({ ...archiveForm, catalogFileUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Link File Scan</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={archiveForm.scanFileUrl}
                    onChange={e => setArchiveForm({ ...archiveForm, scanFileUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Link Google Drive</label>
                  <input
                    type="text"
                    placeholder="https://drive.google.com/..."
                    value={archiveForm.googleDriveUrl}
                    onChange={e => setArchiveForm({ ...archiveForm, googleDriveUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ghi chú Bảo quản</label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú đặc thù bảo quản..."
                  value={archiveForm.notes}
                  onChange={e => setArchiveForm({ ...archiveForm, notes: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddArchiveModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2.5 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-indigo-950"
                >
                  Lưu Thông tin Hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE BORROW SLIP */}
      {showBorrowModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-400" />
                Đăng ký Phiếu Mượn Hồ sơ
              </h3>
              <button onClick={() => setShowBorrowModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
              <span className="text-slate-400 block text-[11px]">Hồ sơ đăng ký mượn:</span>
              <strong className="text-indigo-400 font-mono font-bold">{showBorrowModal.archiveCode}</strong>
              <h4 className="font-bold text-white text-xs mt-0.5 line-clamp-1">{showBorrowModal.title}</h4>
            </div>

            <form onSubmit={handleCreateBorrowRecord} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Họ tên Người mượn <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  value={borrowForm.borrowerName}
                  onChange={e => setBorrowForm({ ...borrowForm, borrowerName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Đơn vị / Phòng ban <span className="text-rose-400">*</span></label>
                <input
                  type="text"
                  required
                  value={borrowForm.borrowerUnit}
                  onChange={e => setBorrowForm({ ...borrowForm, borrowerUnit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mục đích mượn hồ sơ <span className="text-rose-400">*</span></label>
                <textarea
                  rows={2}
                  required
                  value={borrowForm.purpose}
                  onChange={e => setBorrowForm({ ...borrowForm, purpose: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Ngày mượn</label>
                  <input
                    type="date"
                    value={borrowForm.borrowDate}
                    onChange={e => setBorrowForm({ ...borrowForm, borrowDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Ngày dự kiến trả <span className="text-rose-400">*</span></label>
                  <input
                    type="date"
                    required
                    value={borrowForm.expectedReturnDate}
                    onChange={e => setBorrowForm({ ...borrowForm, expectedReturnDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tình trạng hồ sơ khi bàn giao mượn</label>
                <input
                  type="text"
                  value={borrowForm.conditionOnBorrow}
                  onChange={e => setBorrowForm({ ...borrowForm, conditionOnBorrow: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Người phê duyệt chỉ huy</label>
                <input
                  type="text"
                  value={borrowForm.approverName}
                  onChange={e => setBorrowForm({ ...borrowForm, approverName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowBorrowModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-amber-950"
                >
                  Tạo Phiếu Mượn & Xuất Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RETURN DOSSIER */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-400" />
                Xác nhận Hoàn trả Hồ sơ Lưu kho
              </h3>
              <button onClick={() => setShowReturnModal(null)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <span className="text-slate-400 block text-[11px]">Hồ sơ mượn:</span>
              <strong className="text-indigo-400 font-mono font-bold">{showReturnModal.archiveCode}</strong>
              <p className="font-bold text-white text-xs">{showReturnModal.archiveTitle}</p>
              <div className="text-slate-400 text-[11px] pt-1">
                Người mượn: <strong className="text-slate-200">{showReturnModal.borrowerName}</strong> ({showReturnModal.borrowerUnit})
              </div>
            </div>

            <form onSubmit={handleConfirmReturn} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Ngày trả thực tế</label>
                <input
                  type="date"
                  required
                  value={returnForm.actualReturnDate}
                  onChange={e => setReturnForm({ ...returnForm, actualReturnDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tình trạng hồ sơ khi hoàn trả</label>
                <input
                  type="text"
                  required
                  value={returnForm.conditionOnReturn}
                  onChange={e => setReturnForm({ ...returnForm, conditionOnReturn: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-semibold shadow-lg shadow-emerald-950"
                >
                  Xác nhận Nhập lại Kho
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT / LABEL GENERATOR PREVIEW */}
      {showPrintModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[95vh] overflow-y-auto p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Xem Trước và In Mẫu Nhãn / Phiếu Kho (Module 12)</h3>
              </div>
              <button onClick={() => setShowPrintModal(false)} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Template Selection Tabs */}
            <div className="flex border-b border-slate-800 overflow-x-auto pb-0.5 space-x-1">
              <button
                onClick={() => setPrintType('box_label')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'box_label' ? 'bg-purple-950 text-purple-300 border-t border-x border-purple-800' : 'text-slate-400'
                }`}
              >
                Nhãn Hộp Hồ sơ
              </button>
              <button
                onClick={() => setPrintType('shelf_label')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'shelf_label' ? 'bg-emerald-950 text-emerald-300 border-t border-x border-emerald-800' : 'text-slate-400'
                }`}
              >
                Nhãn Giá Kệ
              </button>
              <button
                onClick={() => setPrintType('qr_barcode')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'qr_barcode' ? 'bg-amber-950 text-amber-300 border-t border-x border-amber-800' : 'text-slate-400'
                }`}
              >
                Mã QR & Barcode
              </button>
              <button
                onClick={() => setPrintType('import_slip')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'import_slip' ? 'bg-blue-950 text-blue-300 border-t border-x border-blue-800' : 'text-slate-400'
                }`}
              >
                Phiếu Nhập Kho
              </button>
              <button
                onClick={() => setPrintType('export_slip')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'export_slip' ? 'bg-cyan-950 text-cyan-300 border-t border-x border-cyan-800' : 'text-slate-400'
                }`}
              >
                Phiếu Xuất Kho
              </button>
              <button
                onClick={() => setPrintType('borrow_slip')}
                className={`px-3 py-2 text-xs font-bold rounded-t-xl transition-all ${
                  printType === 'borrow_slip' ? 'bg-rose-950 text-rose-300 border-t border-x border-rose-800' : 'text-slate-400'
                }`}
              >
                Phiếu Mượn Hồ sơ
              </button>
            </div>

            {/* PRINT CONTAINER PREVIEW */}
            <div className="bg-white text-slate-900 p-8 rounded-xl border border-slate-300 shadow-inner font-sans space-y-6 min-h-[380px]">
              
              {/* 1. BOX LABEL PREVIEW */}
              {printType === 'box_label' && printArchive && (
                <div className="border-4 border-slate-900 p-5 rounded-lg max-w-lg mx-auto space-y-4 text-center">
                  <div className="border-b-2 border-slate-900 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-700">Bộ Quốc phòng • Trung tâm Rà phá Bom mìn</p>
                    <h2 className="text-xl font-black uppercase text-slate-900 mt-1">NHÃN HỘP HỒ SƠ LƯU KHO</h2>
                    <p className="font-mono text-sm font-bold text-indigo-900 mt-0.5">MÃ VỊ TRÍ: {printArchive.locationCode}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-left text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">MÃ HỒ SƠ:</span>
                      <span className="font-mono font-black text-sm text-slate-900">{printArchive.archiveCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">MÃ HỘP:</span>
                      <span className="font-mono font-black text-sm text-amber-900">{printArchive.boxCode}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">LOẠI HỒ SƠ:</span>
                      <span className="font-bold text-slate-900">{CATEGORY_MAP[printArchive.category].label}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold block">MỨC MẬT:</span>
                      <span className="font-bold text-rose-700 uppercase">{SECRECY_MAP[printArchive.secrecyLevel].label}</span>
                    </div>
                  </div>

                  <div className="text-left text-xs bg-slate-100 p-2.5 rounded border border-slate-300">
                    <span className="text-[10px] text-slate-500 font-bold block">TÊN HỒ SƠ:</span>
                    <strong className="text-slate-900 block mt-0.5">{printArchive.title}</strong>
                  </div>

                  {/* QR & Barcode Section */}
                  <div className="flex items-center justify-between border-t-2 border-slate-900 pt-3">
                    <div className="text-left">
                      <div className="font-mono text-[9px] text-slate-600">Barcode ID:</div>
                      {/* Barcode SVG lines simulation */}
                      <svg className="w-40 h-10 mt-1">
                        <rect x="0" y="0" width="4" height="40" fill="#000" />
                        <rect x="6" y="0" width="2" height="40" fill="#000" />
                        <rect x="10" y="0" width="6" height="40" fill="#000" />
                        <rect x="18" y="0" width="2" height="40" fill="#000" />
                        <rect x="22" y="0" width="4" height="40" fill="#000" />
                        <rect x="28" y="0" width="8" height="40" fill="#000" />
                        <rect x="38" y="0" width="2" height="40" fill="#000" />
                        <rect x="42" y="0" width="6" height="40" fill="#000" />
                        <rect x="50" y="0" width="4" height="40" fill="#000" />
                        <rect x="56" y="0" width="2" height="40" fill="#000" />
                        <rect x="60" y="0" width="6" height="40" fill="#000" />
                        <rect x="68" y="0" width="2" height="40" fill="#000" />
                        <rect x="72" y="0" width="4" height="40" fill="#000" />
                        <rect x="78" y="0" width="8" height="40" fill="#000" />
                        <rect x="88" y="0" width="2" height="40" fill="#000" />
                        <rect x="92" y="0" width="6" height="40" fill="#000" />
                        <rect x="100" y="0" width="4" height="40" fill="#000" />
                        <rect x="106" y="0" width="2" height="40" fill="#000" />
                        <rect x="110" y="0" width="6" height="40" fill="#000" />
                        <rect x="118" y="0" width="4" height="40" fill="#000" />
                      </svg>
                      <span className="font-mono text-[10px] text-slate-800">{printArchive.barcode}</span>
                    </div>

                    <div className="text-center">
                      <div className="p-1.5 bg-slate-100 border border-slate-400 rounded">
                        <QrCode className="w-14 h-14 text-slate-900" />
                      </div>
                      <span className="font-mono text-[9px] text-slate-600 block mt-1">Scan QR Code</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. SHELF LABEL PREVIEW */}
              {printType === 'shelf_label' && printLocation && (
                <div className="border-4 border-slate-900 p-6 rounded-lg max-w-md mx-auto space-y-4 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">SƠ ĐỒ VỊ TRÍ KHO HỒ SƠ</p>
                  <h2 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{printLocation.locationCode}</h2>
                  <div className="grid grid-cols-2 gap-2 text-xs text-left bg-slate-100 p-3 rounded">
                    <div>Khu vực: <strong>{printLocation.zone}</strong></div>
                    <div>Dãy: <strong>{printLocation.row}</strong></div>
                    <div>Giá: <strong>{printLocation.shelf}</strong></div>
                    <div>Tầng: <strong>{printLocation.tier}</strong></div>
                  </div>
                  <div className="pt-2 flex justify-center">
                    <QrCode className="w-20 h-20 text-slate-900" />
                  </div>
                </div>
              )}

              {/* 3. QR & BARCODE PREVIEW */}
              {printType === 'qr_barcode' && printArchive && (
                <div className="flex flex-col items-center justify-center p-6 space-y-6">
                  <div className="p-4 bg-white border-2 border-slate-900 rounded-xl flex flex-col items-center space-y-2">
                    <QrCode className="w-32 h-32 text-slate-900" />
                    <span className="font-mono text-xs font-bold text-slate-900">{printArchive.qrCode}</span>
                  </div>

                  <div className="p-4 bg-white border-2 border-slate-900 rounded-xl flex flex-col items-center space-y-2">
                    <svg className="w-64 h-14">
                      <rect x="0" y="0" width="6" height="56" fill="#000" />
                      <rect x="8" y="0" width="3" height="56" fill="#000" />
                      <rect x="14" y="0" width="8" height="56" fill="#000" />
                      <rect x="25" y="0" width="3" height="56" fill="#000" />
                      <rect x="30" y="0" width="6" height="56" fill="#000" />
                      <rect x="40" y="0" width="12" height="56" fill="#000" />
                      <rect x="55" y="0" width="3" height="56" fill="#000" />
                      <rect x="62" y="0" width="8" height="56" fill="#000" />
                      <rect x="73" y="0" width="6" height="56" fill="#000" />
                      <rect x="82" y="0" width="3" height="56" fill="#000" />
                      <rect x="90" y="0" width="8" height="56" fill="#000" />
                      <rect x="101" y="0" width="3" height="56" fill="#000" />
                      <rect x="108" y="0" width="6" height="56" fill="#000" />
                      <rect x="118" y="0" width="12" height="56" fill="#000" />
                      <rect x="133" y="0" width="3" height="56" fill="#000" />
                      <rect x="140" y="0" width="8" height="56" fill="#000" />
                      <rect x="151" y="0" width="6" height="56" fill="#000" />
                      <rect x="160" y="0" width="3" height="56" fill="#000" />
                      <rect x="168" y="0" width="8" height="56" fill="#000" />
                      <rect x="180" y="0" width="6" height="56" fill="#000" />
                    </svg>
                    <span className="font-mono text-sm font-black text-slate-900">{printArchive.barcode}</span>
                  </div>
                </div>
              )}

              {/* 4. IMPORT / EXPORT SLIP PREVIEW */}
              {(printType === 'import_slip' || printType === 'export_slip') && printArchive && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-900 max-w-xl mx-auto border p-6 rounded-md">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-bold uppercase text-[10px]">CƠ QUAN CHỦ QUẢN BQP</h4>
                      <h3 className="font-black text-sm uppercase">PHÒNG QUẢN LÝ LƯU TRỮ RPBM</h3>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold uppercase text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                      <p className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <h2 className="text-base font-black uppercase text-slate-900">
                      {printType === 'import_slip' ? 'PHIẾU NHẬP KHO HỒ SƠ' : 'PHIẾU XUẤT KHO HỒ SƠ'}
                    </h2>
                    <p className="font-mono text-[11px] text-slate-600">Số: {printType === 'import_slip' ? 'PNK' : 'PXK'}-2026-001</p>
                  </div>

                  <div className="space-y-1">
                    <p>• Người lập phiếu: <strong>{printArchive.entryPerson || 'Nguyễn Văn Hùng'}</strong></p>
                    <p>• Đơn vị giao nhận: <strong>Ban QLDA Rà phá Bom mìn</strong></p>
                    <p>• Lý do {printType === 'import_slip' ? 'nhập' : 'xuất'}: <strong>Lưu trữ tài liệu hoàn công nghiệm thu công trình</strong></p>
                    <p>• Mã vị trí lưu kho: <strong className="font-mono text-emerald-800">{printArchive.locationCode}</strong></p>
                  </div>

                  <table className="w-full border-collapse border border-slate-900 text-[11px] mt-3">
                    <thead>
                      <tr className="bg-slate-200 border-b border-slate-900">
                        <th className="border border-slate-900 p-1.5">Mã HS</th>
                        <th className="border border-slate-900 p-1.5">Tên Hồ sơ</th>
                        <th className="border border-slate-900 p-1.5">Số TL</th>
                        <th className="border border-slate-900 p-1.5">Số tờ</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-slate-900 p-1.5 font-mono">{printArchive.archiveCode}</td>
                        <td className="border border-slate-900 p-1.5">{printArchive.title}</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center">{printArchive.documentCount}</td>
                        <td className="border border-slate-900 p-1.5 font-mono text-center">{printArchive.pageCount}</td>
                      </tr>
                    </tbody>
                  </table>

                  <div className="grid grid-cols-2 text-center pt-8 text-[11px]">
                    <div>
                      <p className="font-bold uppercase">Người lập phiếu</p>
                      <span className="text-[10px] italic">(Ký, ghi rõ họ tên)</span>
                    </div>
                    <div>
                      <p className="font-bold uppercase">Thủ kho phê duyệt</p>
                      <span className="text-[10px] italic">(Ký, đóng dấu)</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. BORROW SLIP PREVIEW */}
              {printType === 'borrow_slip' && printBorrow && (
                <div className="space-y-4 text-xs leading-relaxed text-slate-900 max-w-xl mx-auto border p-6 rounded-md">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-bold uppercase text-[10px]">CƠ QUAN CHỦ QUẢN BQP</h4>
                      <h3 className="font-black text-sm uppercase">PHÒNG QUẢN LÝ LƯU TRỮ RPBM</h3>
                    </div>
                    <div className="text-right">
                      <h4 className="font-bold uppercase text-xs">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</h4>
                      <p className="text-[10px] italic">Độc lập - Tự do - Hạnh phúc</p>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <h2 className="text-base font-black uppercase text-slate-900">PHIẾU MƯỢN HỒ SƠ TÀI LIỆU</h2>
                    <p className="font-mono text-[11px] text-slate-600">Mã phiếu: PM-2026-{printBorrow.id.slice(-4)}</p>
                  </div>

                  <div className="space-y-1.5 bg-slate-50 p-3 rounded border">
                    <p>• Họ tên người mượn: <strong>{printBorrow.borrowerName}</strong></p>
                    <p>• Đơn vị công tác: <strong>{printBorrow.borrowerUnit}</strong></p>
                    <p>• Mục đích mượn: <strong>{printBorrow.purpose}</strong></p>
                    <p>• Hồ sơ mượn: <strong className="font-mono">{printBorrow.archiveCode}</strong> - {printBorrow.archiveTitle}</p>
                    <p>• Ngày mượn: <strong>{formatDateVN(printBorrow.borrowDate)}</strong> | Ngày dự kiến trả: <strong className="text-rose-700">{formatDateVN(printBorrow.expectedReturnDate)}</strong></p>
                    <p>• Tình trạng khi mượn: <em>{printBorrow.conditionOnBorrow}</em></p>
                  </div>

                  <div className="grid grid-cols-2 text-center pt-8 text-[11px]">
                    <div>
                      <p className="font-bold uppercase">Người mượn hồ sơ</p>
                      <span className="text-[10px] italic">(Ký, ghi rõ họ tên)</span>
                    </div>
                    <div>
                      <p className="font-bold uppercase">Người phê duyệt chỉ huy</p>
                      <span className="text-[10px] italic">(Ký, đóng dấu)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Sẵn sàng gửi lệnh in tới máy in nhiệt hoặc xuất file PDF chuẩn kích thước nhãn.
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-2 shadow-lg shadow-amber-950"
                >
                  <Printer className="w-4 h-4" /> In Ngay (Print)
                </button>

                <button
                  onClick={() => setShowPrintModal(false)}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold px-4 py-2 rounded-xl text-xs"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
