import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  ShieldCheck,
  Edit2,
  Trash2,
  Eye,
  History,
  AlertTriangle,
  Clock,
  Paperclip,
  X,
  FileSpreadsheet,
  CheckCircle2,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown
} from 'lucide-react';
import { Vehicle } from '../../types';
import { formatDateVN } from '../../utils/formatters';
import { getSharedCategories } from '../../utils/storage';
import {
  INSPECTION_WARNING_DAYS,
  getVehicleInspectionStatus,
  getVehicleInspectionDaysLeft,
  calculateVehicleInspectionMetrics,
  VehicleInspectionStatus
} from '../../utils/vehicleStorage';

interface Props {
  vehicles: Vehicle[];
  onOpenAddVehicle: () => void;
  onOpenEditVehicle: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onOpenInspectionModal: (vehicle: Vehicle) => void;
  onOpenHistoryModal: (vehicle: Vehicle) => void;
}

export const VehicleListTab: React.FC<Props> = ({
  vehicles,
  onOpenAddVehicle,
  onOpenEditVehicle,
  onDeleteVehicle,
  onOpenInspectionModal,
  onOpenHistoryModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string>('all');
  const [inspectionStatusFilter, setInspectionStatusFilter] = useState<string>('all');
  const [inspectionBatchFilter, setInspectionBatchFilter] = useState<string>('all');
  const [unitFilter, setUnitFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'expiry_asc' | 'license_asc' | 'code_asc'>('expiry_asc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Viewing detail & PDF modals
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [pdfPreviewModal, setPdfPreviewModal] = useState<{ isOpen: boolean; url: string; title: string }>({
    isOpen: false,
    url: '',
    title: ''
  });

  // Calculate Inspection Metrics
  const metrics = calculateVehicleInspectionMetrics(vehicles, INSPECTION_WARNING_DAYS);

  // Extract unique filter options from shared categories & vehicle records
  const categoryVehicleTypes = getSharedCategories()
    .filter(c => (c.group as string) === 'equipment_cat' || (c.group as string) === 'vehicle_type' || (c.group as string) === 'vehicle')
    .map(c => c.label);

  const uniqueVehicleTypes = Array.from(
    new Set([
      ...categoryVehicleTypes,
      ...vehicles.map(v => v.vehicleType).filter(Boolean)
    ])
  );
  const uniqueUnits = Array.from(new Set(vehicles.map(v => v.managingUnit).filter(Boolean)));

  // Filter vehicles
  const filteredVehicles = vehicles.filter(v => {
    // 1. Search Query
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      v.code.toLowerCase().includes(searchLower) ||
      v.licensePlate.toLowerCase().includes(searchLower) ||
      v.brand.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower) ||
      v.vehicleType.toLowerCase().includes(searchLower) ||
      v.managingUnit.toLowerCase().includes(searchLower);

    // 2. Vehicle Type Filter
    const matchesVehicleType = vehicleTypeFilter === 'all' || v.vehicleType === vehicleTypeFilter;

    // 3. Inspection Status Filter
    const vStatus = getVehicleInspectionStatus(v, INSPECTION_WARNING_DAYS);
    const matchesInspectionStatus = inspectionStatusFilter === 'all' || vStatus === inspectionStatusFilter;

    // 4. Inspection Batch / Round Filter
    const roundsCount = v.inspectionHistory?.length || 0;
    let matchesBatch = true;
    if (inspectionBatchFilter === 'no_round') {
      matchesBatch = roundsCount === 0;
    } else if (inspectionBatchFilter === 'round_1') {
      matchesBatch = roundsCount === 1;
    } else if (inspectionBatchFilter === 'round_2') {
      matchesBatch = roundsCount === 2;
    } else if (inspectionBatchFilter === 'round_3_plus') {
      matchesBatch = roundsCount >= 3;
    }

    // 5. Managing Unit Filter
    const matchesUnit = unitFilter === 'all' || v.managingUnit === unitFilter;

    return matchesSearch && matchesVehicleType && matchesInspectionStatus && matchesBatch && matchesUnit;
  });

  // Sort vehicles
  const sortedVehicles = [...filteredVehicles].sort((a, b) => {
    if (sortBy === 'expiry_asc') {
      const daysA = getVehicleInspectionDaysLeft(a.nextInspectionExpiryDate);
      const daysB = getVehicleInspectionDaysLeft(b.nextInspectionExpiryDate);

      if (daysA === null && daysB === null) return 0;
      if (daysA === null) return 1;
      if (daysB === null) return -1;
      return daysA - daysB; // Nearest expiry / overdue first
    } else if (sortBy === 'license_asc') {
      return a.licensePlate.localeCompare(b.licensePlate);
    } else {
      return a.code.localeCompare(b.code);
    }
  });

  // Pagination slice
  const totalItems = sortedVehicles.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);
  const paginatedVehicles = sortedVehicles.slice((safeCurrentPage - 1) * pageSize, safeCurrentPage * pageSize);

  // Expired vehicles for alert banner
  const expiredVehiclesList = vehicles.filter(v => getVehicleInspectionStatus(v, INSPECTION_WARNING_DAYS) === 'expired');

  // Export CSV function
  const handleExportCSV = () => {
    const headers = [
      'STT',
      'Biển số xe',
      'Mã xe',
      'Loại xe',
      'Nhãn hiệu',
      'Model',
      'Năm SX',
      'Đơn vị quản lý',
      'Số đăng ký (Cà vẹt)',
      'Ngày cấp đăng ký',
      'Số GCN Đăng kiểm',
      'Ngày đăng kiểm gần nhất',
      'Ngày hết hạn đăng kiểm',
      'Tình trạng đăng kiểm',
      'Số ngày còn lại',
      'Số đợt đã kiểm định'
    ];

    const rows = sortedVehicles.map((v, idx) => {
      const status = getVehicleInspectionStatus(v, INSPECTION_WARNING_DAYS);
      const daysLeft = getVehicleInspectionDaysLeft(v.nextInspectionExpiryDate);
      let statusLabel = 'Còn hạn';
      if (status === 'expired') statusLabel = 'Đã hết hạn';
      else if (status === 'expiring_soon') statusLabel = `Sắp hết hạn (<= ${INSPECTION_WARNING_DAYS} ngày)`;
      else if (status === 'missing_info') statusLabel = 'Chưa có thông tin';

      return [
        idx + 1,
        `"${v.licensePlate}"`,
        `"${v.code}"`,
        `"${v.vehicleType}"`,
        `"${v.brand}"`,
        `"${v.model}"`,
        v.manufactureYear || '-',
        `"${(v.managingUnit || '-').replace(/"/g, '""')}"`,
        `"${(v.registrationNo || '-').replace(/"/g, '""')}"`,
        formatDateVN(v.registrationDate),
        `"${(v.currentInspectionCertNo || '-').replace(/"/g, '""')}"`,
        formatDateVN(v.lastInspectionDate),
        formatDateVN(v.nextInspectionExpiryDate),
        `"${statusLabel}"`,
        daysLeft !== null ? daysLeft : '-',
        v.inspectionHistory?.length || 0
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Phan_He_Quan_Ly_Xe_Dang_Kiem_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Status Badge Component
  const renderInspectionBadge = (veh: Vehicle) => {
    const status = getVehicleInspectionStatus(veh, INSPECTION_WARNING_DAYS);
    const daysLeft = getVehicleInspectionDaysLeft(veh.nextInspectionExpiryDate);

    if (status === 'expired') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse">
          <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
          ĐÃ HẾT HẠN ({Math.abs(daysLeft || 0)} ngày)
        </span>
      );
    } else if (status === 'expiring_soon') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/50">
          <Clock className="w-3 h-3 text-amber-400 shrink-0" />
          SẮP HẾT HẠN (còn {daysLeft} ngày)
        </span>
      );
    } else if (status === 'valid') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
          Còn hạn ({daysLeft} ngày)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-medium bg-slate-800 text-slate-400 border border-slate-700">
        <HelpCircle className="w-3 h-3 text-slate-400 shrink-0" />
        Chưa có thông tin
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. THỐNG KÊ TÌNH TRẠNG ĐĂNG KIỂM (STATISTICS DASHBOARD CARDS) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Thống kê Tình trạng Đăng kiểm Theo Đợt
          </span>
          <span className="text-[11px] text-slate-500">
            Cấu hình cảnh báo: <strong className="text-amber-400 font-mono">{INSPECTION_WARNING_DAYS} ngày</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Card 1: Tổng số xe */}
          <button
            onClick={() => { setInspectionStatusFilter('all'); setCurrentPage(1); }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              inspectionStatusFilter === 'all'
                ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-slate-400 font-medium">Tổng số xe ô tô</div>
            <div className="text-xl font-bold text-slate-100 font-mono mt-1 flex items-baseline justify-between">
              <span>{metrics.total}</span>
              <span className="text-xs font-normal text-slate-500">xe</span>
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1 font-semibold">Tất cả phương tiện</div>
          </button>

          {/* Card 2: Còn hạn */}
          <button
            onClick={() => { setInspectionStatusFilter('valid'); setCurrentPage(1); }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              inspectionStatusFilter === 'valid'
                ? 'bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20 shadow-lg'
                : 'bg-slate-900/70 border-slate-800 hover:border-emerald-800/60'
            }`}
          >
            <div className="text-[11px] text-slate-400 font-medium">Còn hạn đăng kiểm</div>
            <div className="text-xl font-bold text-emerald-400 font-mono mt-1 flex items-baseline justify-between">
              <span>{metrics.validCount}</span>
              <span className="text-xs font-normal text-emerald-500/70">xe</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> An toàn lưu hành
            </div>
          </button>

          {/* Card 3: Sắp hết hạn */}
          <button
            onClick={() => { setInspectionStatusFilter('expiring_soon'); setCurrentPage(1); }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              inspectionStatusFilter === 'expiring_soon'
                ? 'bg-amber-950/40 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                : 'bg-slate-900/70 border-slate-800 hover:border-amber-800/60'
            }`}
          >
            <div className="text-[11px] text-slate-400 font-medium">Sắp hết hạn (&le; {INSPECTION_WARNING_DAYS}d)</div>
            <div className="text-xl font-bold text-amber-400 font-mono mt-1 flex items-baseline justify-between">
              <span>{metrics.expiringSoonCount}</span>
              <span className="text-xs font-normal text-amber-500/70">xe</span>
            </div>
            <div className="text-[10px] text-amber-400 mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> Cần làm thủ tục
            </div>
          </button>

          {/* Card 4: Đã hết hạn */}
          <button
            onClick={() => { setInspectionStatusFilter('expired'); setCurrentPage(1); }}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              inspectionStatusFilter === 'expired'
                ? 'bg-rose-950/50 border-rose-500 ring-2 ring-rose-500/20 shadow-lg'
                : 'bg-slate-900/70 border-slate-800 hover:border-rose-800/60'
            }`}
          >
            <div className="text-[11px] text-rose-300 font-medium flex items-center gap-1">
              Đã hết hạn đăng kiểm
            </div>
            <div className="text-xl font-bold text-rose-400 font-mono mt-1 flex items-baseline justify-between">
              <span>{metrics.expiredCount}</span>
              <span className="text-xs font-normal text-rose-500/70">xe</span>
            </div>
            <div className="text-[10px] text-rose-400 mt-1 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400 animate-bounce" /> Cảnh báo nghiêm trọng
            </div>
          </button>

          {/* Card 5: Chưa có thông tin */}
          <button
            onClick={() => { setInspectionStatusFilter('missing_info'); setCurrentPage(1); }}
            className={`p-3.5 rounded-2xl border text-left transition-all col-span-2 sm:col-span-1 ${
              inspectionStatusFilter === 'missing_info'
                ? 'bg-slate-800 border-slate-500 ring-2 ring-slate-500/20 shadow-lg'
                : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="text-[11px] text-slate-400 font-medium">Chưa có thông tin</div>
            <div className="text-xl font-bold text-slate-300 font-mono mt-1 flex items-baseline justify-between">
              <span>{metrics.missingInfoCount}</span>
              <span className="text-xs font-normal text-slate-500">xe</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1 font-semibold">Cần cập nhật hồ sơ</div>
          </button>
        </div>
      </div>

      {/* 2. CẢNH BÁO KHẨN CẤP XE ĐÃ HẾT HẠN (EXPIRED VEHICLES WARNING BANNER) */}
      {expiredVehiclesList.length > 0 && (
        <div className="bg-rose-950/40 border-2 border-rose-500/60 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 shrink-0">
              <AlertTriangle className="w-5 h-5 text-rose-400 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-rose-200 flex items-center gap-2">
                CẢNH BÁO: Phát hiện {expiredVehiclesList.length} xe ô tô đã Quá hạn đăng kiểm!
              </h4>
              <p className="text-[11px] text-rose-300/80 mt-0.5">
                Các xe: <strong className="font-mono text-amber-300">{expiredVehiclesList.map(v => v.licensePlate).join(', ')}</strong> đã hết hạn. Yêu cầu ngưng lưu hành để làm thủ tục kiểm định đợt mới.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setInspectionStatusFilter('expired');
              setCurrentPage(1);
            }}
            className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all shrink-0"
          >
            Xem danh sách xe hết hạn
          </button>
        </div>
      )}

      {/* 3. BỘ LỌC VÀ TÌM KIẾM CHI TIẾT (ADVANCED FILTER & SEARCH CONTROL BAR) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
          {/* Search Bar */}
          <div className="relative sm:col-span-2 md:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              placeholder="Tìm Biển số, Mã xe, Hãng, Đơn vị..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* 1. Lọc theo Loại xe (Requirement 1) */}
          <div>
            <select
              value={vehicleTypeFilter}
              onChange={e => { setVehicleTypeFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500 font-medium"
            >
              <option value="all">Tất cả loại xe</option>
              {uniqueVehicleTypes.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* 2. Lọc theo Tình trạng Đăng kiểm */}
          <div>
            <select
              value={inspectionStatusFilter}
              onChange={e => { setInspectionStatusFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-amber-400 font-semibold focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả tình trạng ĐK</option>
              <option value="valid">Còn hạn đăng kiểm</option>
              <option value="expiring_soon">Sắp hết hạn (&le; 30d)</option>
              <option value="expired">Đã hết hạn đăng kiểm</option>
              <option value="missing_info">Chưa có thông tin ĐK</option>
            </select>
          </div>

          {/* 3. Lọc theo Đợt Đăng kiểm */}
          <div>
            <select
              value={inspectionBatchFilter}
              onChange={e => { setInspectionBatchFilter(e.target.value); setCurrentPage(1); }}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả đợt đăng kiểm</option>
              <option value="round_1">Đã kiểm định 1 đợt</option>
              <option value="round_2">Đã kiểm định 2 đợt</option>
              <option value="round_3_plus">Đã kiểm định 3+ đợt</option>
              <option value="no_round">Chưa có đợt kiểm định</option>
            </select>
          </div>

          {/* 4. Sắp xếp */}
          <div>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-2 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="expiry_asc">Gần hết hạn / Hết hạn trước</option>
              <option value="license_asc">Theo biển số xe (A-Z)</option>
              <option value="code_asc">Theo mã xe (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Action controls & Unit filter */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={unitFilter}
              onChange={e => { setUnitFilter(e.target.value); setCurrentPage(1); }}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-slate-300 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Tất cả Đơn vị quản lý</option>
              {uniqueUnits.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>

            {(vehicleTypeFilter !== 'all' || inspectionStatusFilter !== 'all' || inspectionBatchFilter !== 'all' || unitFilter !== 'all' || searchTerm) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setVehicleTypeFilter('all');
                  setInspectionStatusFilter('all');
                  setInspectionBatchFilter('all');
                  setUnitFilter('all');
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-xl border border-rose-500/30 text-[11px] font-semibold transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all text-xs"
              title="Xuất danh sách sau khi lọc ra file Excel/CSV"
            >
              <FileSpreadsheet className="w-4 h-4" /> Xuất Excel / CSV ({sortedVehicles.length})
            </button>

            <button
              onClick={onOpenAddVehicle}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all text-xs shrink-0"
            >
              <Plus className="w-4 h-4" /> Thêm Xe ô tô mới
            </button>
          </div>
        </div>
      </div>

      {/* 4. MAIN VEHICLES TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Biển số & Mã xe</th>
                <th className="py-3.5 px-4">Phương tiện</th>
                <th className="py-3.5 px-4">Đơn vị quản lý</th>
                <th className="py-3.5 px-4">Đăng ký xe (Cà vẹt)</th>
                <th className="py-3.5 px-4">Đăng kiểm & Cảnh báo theo đợt</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {paginatedVehicles.length > 0 ? (
                paginatedVehicles.map(veh => {
                  const inspectionRounds = veh.inspectionHistory?.length || 0;
                  const regUrl = veh.registrationFile?.fileUrl || veh.registrationFileUrl;
                  const inspUrl = veh.inspectionFile?.fileUrl || veh.inspectionFileUrl;
                  const isExpired = getVehicleInspectionStatus(veh, INSPECTION_WARNING_DAYS) === 'expired';

                  return (
                    <tr
                      key={veh.id}
                      className={`hover:bg-slate-800/40 transition-colors ${isExpired ? 'bg-rose-950/20' : ''}`}
                    >
                      {/* License & Code */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-amber-400 text-sm font-mono">{veh.licensePlate}</div>
                        <div className="text-[11px] text-slate-400 font-mono mt-0.5">Mã: {veh.code}</div>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 mt-1">
                          {veh.color}
                        </span>
                      </td>

                      {/* Brand / Model / Type */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-bold text-slate-100">{veh.brand} {veh.model}</div>
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mt-1">
                          {veh.vehicleType}
                        </span>
                        <div className="text-slate-500 text-[10px] mt-0.5">Năm SX: {veh.manufactureYear}</div>
                      </td>

                      {/* Unit (Manager fields removed per Section VI Requirement 2) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-200">{veh.managingUnit}</div>
                        <div className="text-slate-500 text-[10px] mt-1 font-mono">
                          Số khung: {veh.chassisNumber || '-'}
                        </div>
                      </td>

                      {/* Registration (Cà vẹt) */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-semibold text-slate-200 font-mono">
                          Số: {veh.registrationNo || 'Chưa có'}
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono mt-0.5">
                          Ngày cấp: {formatDateVN(veh.registrationDate)}
                        </div>
                        <div className="mt-1.5">
                          {regUrl ? (
                            <button
                              onClick={() => setPdfPreviewModal({
                                isOpen: true,
                                url: regUrl,
                                title: `File scan Đăng ký xe: ${veh.licensePlate}`
                              })}
                              className="px-2 py-0.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30 flex items-center gap-1 transition-colors"
                            >
                              <Paperclip className="w-3 h-3" /> File Scan
                            </button>
                          ) : (
                            <span className="text-[10px] text-slate-500 font-mono">Chưa có file scan</span>
                          )}
                        </div>
                      </td>

                      {/* Inspection & Warning Badges */}
                      <td className="py-3.5 px-4 align-top space-y-1">
                        <div>
                          {renderInspectionBadge(veh)}
                        </div>
                        <div className="text-slate-300 text-[11px] font-mono">
                          GCN: <span className="font-bold text-slate-100">{veh.currentInspectionCertNo || 'Chưa có'}</span>
                        </div>
                        <div className="text-slate-400 text-[11px] font-mono">
                          Hạn: {formatDateVN(veh.nextInspectionExpiryDate)}
                        </div>
                        <div className="flex items-center gap-2 pt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 font-mono font-bold">
                            Đã làm {inspectionRounds} đợt
                          </span>
                          {inspUrl && (
                            <button
                              onClick={() => setPdfPreviewModal({
                                isOpen: true,
                                url: inspUrl,
                                title: `Giấy chứng nhận Đăng kiểm: ${veh.licensePlate}`
                              })}
                              className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-[10px] font-bold rounded border border-amber-500/30 flex items-center gap-1 transition-colors"
                            >
                              <Paperclip className="w-3 h-3" /> Scan ĐK
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Add new inspection round */}
                          <button
                            onClick={() => onOpenInspectionModal(veh)}
                            className="p-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30 transition-colors"
                            title="Cập nhật đợt đăng kiểm mới"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>

                          {/* Inspection history */}
                          <button
                            onClick={() => onOpenHistoryModal(veh)}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition-colors"
                            title="Xem lịch sử các đợt kiểm định"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* View details */}
                          <button
                            onClick={() => setViewingVehicle(veh)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg border border-slate-700 transition-colors"
                            title="Xem chi tiết hồ sơ xe"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => onOpenEditVehicle(veh)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
                            title="Chỉnh sửa hồ sơ xe"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa hồ sơ xe ${veh.licensePlate}?`)) {
                                onDeleteVehicle(veh.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-950 text-rose-400 rounded-lg border border-slate-700 hover:border-rose-800 transition-colors"
                            title="Xóa hồ sơ xe"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-sans">
                    Không tìm thấy xe ô tô nào khớp với điều kiện lọc hiện tại.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 5. PAGINATION FOOTER */}
        {totalPages > 1 && (
          <div className="px-4 py-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Hiển thị <strong className="text-slate-200">{(safeCurrentPage - 1) * pageSize + 1}</strong> -{' '}
              <strong className="text-slate-200">{Math.min(safeCurrentPage * pageSize, totalItems)}</strong> trong tổng số{' '}
              <strong className="text-amber-400">{totalItems}</strong> xe ô tô
            </div>

            <div className="flex items-center gap-1.5">
              <button
                disabled={safeCurrentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-colors ${
                    safeCurrentPage === page
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                disabled={safeCurrentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 6. VEHICLE DETAILED VIEW MODAL */}
      {viewingVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-6">
            <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    Hồ sơ Chi tiết Xe ô tô: <span className="text-amber-400 font-mono">{viewingVehicle.licensePlate}</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mã xe: {viewingVehicle.code} | {viewingVehicle.brand} {viewingVehicle.model} ({viewingVehicle.vehicleType})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const v = viewingVehicle;
                    setViewingVehicle(null);
                    onOpenInspectionModal(v);
                  }}
                  className="px-3 py-1.5 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1 shadow-md"
                >
                  <ShieldCheck className="w-4 h-4" /> Đăng kiểm đợt mới
                </button>
                <button
                  onClick={() => setViewingVehicle(null)}
                  className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Block A */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1.5 text-xs">
                    1. Thông số Nhận dạng & Kỹ thuật
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div><span className="text-slate-400">Mã xe:</span> <strong className="text-slate-200 font-mono">{viewingVehicle.code}</strong></div>
                    <div><span className="text-slate-400">Biển số đăng ký:</span> <strong className="text-amber-400 font-mono">{viewingVehicle.licensePlate}</strong></div>
                    <div><span className="text-slate-400">Loại xe:</span> <span className="text-slate-200">{viewingVehicle.vehicleType}</span></div>
                    <div><span className="text-slate-400">Nhãn hiệu:</span> <span className="text-slate-200">{viewingVehicle.brand}</span></div>
                    <div><span className="text-slate-400">Model:</span> <span className="text-slate-200">{viewingVehicle.model}</span></div>
                    <div><span className="text-slate-400">Năm sản xuất:</span> <span className="text-slate-200">{viewingVehicle.manufactureYear}</span></div>
                    <div><span className="text-slate-400">Số khung:</span> <span className="text-slate-200 font-mono">{viewingVehicle.chassisNumber || '-'}</span></div>
                    <div><span className="text-slate-400">Số máy:</span> <span className="text-slate-200 font-mono">{viewingVehicle.engineNumber || '-'}</span></div>
                    <div><span className="text-slate-400">Màu sơn:</span> <span className="text-slate-200">{viewingVehicle.color}</span></div>
                  </div>
                </div>

                {/* Block B: Managing Unit (Manager fields removed per Section VI Requirement 2) */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-sky-400 border-b border-slate-800 pb-1.5 text-xs">
                    2. Đơn vị Quản lý Trực tiếp
                  </h4>
                  <div className="grid grid-cols-1 gap-2 text-[11px]">
                    <div><span className="text-slate-400">Đơn vị quản lý:</span> <strong className="text-slate-200">{viewingVehicle.managingUnit}</strong></div>
                  </div>
                </div>

                {/* Block C: Registration */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-emerald-400 border-b border-slate-800 pb-1.5 text-xs">
                    3. Giấy Đăng ký Xe (Cà vẹt)
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    <div><span className="text-slate-400">Số đăng ký xe:</span> <strong className="text-slate-200 font-mono">{viewingVehicle.registrationNo || '-'}</strong></div>
                    <div><span className="text-slate-400">Ngày cấp đăng ký:</span> <span className="text-slate-200 font-mono">{formatDateVN(viewingVehicle.registrationDate)}</span></div>
                    <div>
                      <span className="text-slate-400">File scan đính kèm:</span>{' '}
                      {viewingVehicle.registrationFile?.fileUrl || viewingVehicle.registrationFileUrl ? (
                        <button
                          onClick={() => setPdfPreviewModal({
                            isOpen: true,
                            url: viewingVehicle.registrationFile?.fileUrl || viewingVehicle.registrationFileUrl || '',
                            title: `File scan Đăng ký xe: ${viewingVehicle.licensePlate}`
                          })}
                          className="text-amber-400 hover:underline font-semibold ml-1 inline-flex items-center gap-1"
                        >
                          <Paperclip className="w-3 h-3" /> Xem file PDF / Scan
                        </button>
                      ) : (
                        <span className="text-slate-500">Chưa đính kèm</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Block D: Inspection */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 border-b border-slate-800 pb-1.5 text-xs">
                    4. Đăng kiểm & Cảnh báo Theo đợt
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5 text-[11px]">
                    <div><span className="text-slate-400">Trạng thái:</span> <span className="ml-1">{renderInspectionBadge(viewingVehicle)}</span></div>
                    <div><span className="text-slate-400">Số GCN đăng kiểm:</span> <strong className="text-slate-200 font-mono">{viewingVehicle.currentInspectionCertNo || '-'}</strong></div>
                    <div><span className="text-slate-400">Hạn đăng kiểm:</span> <span className="text-slate-200 font-mono">{formatDateVN(viewingVehicle.nextInspectionExpiryDate)}</span></div>
                    <div><span className="text-slate-400">Đơn vị đăng kiểm:</span> <span className="text-slate-200">{viewingVehicle.inspectionUnit || '-'}</span></div>
                    <div><span className="text-slate-400">Tổng số đợt đã làm:</span> <strong className="text-amber-400 font-mono">{viewingVehicle.inspectionHistory?.length || 0} đợt</strong></div>
                  </div>
                </div>
              </div>

              {/* Inspection History Log in Detail Modal */}
              {viewingVehicle.inspectionHistory && viewingVehicle.inspectionHistory.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-slate-200 text-xs flex items-center justify-between border-b border-slate-800 pb-2">
                    <span>Lịch sử các Đợt Kiểm định ({viewingVehicle.inspectionHistory.length} đợt)</span>
                    <button
                      onClick={() => {
                        const v = viewingVehicle;
                        setViewingVehicle(null);
                        onOpenHistoryModal(v);
                      }}
                      className="text-amber-400 hover:underline text-[11px] font-semibold flex items-center gap-1"
                    >
                      <History className="w-3.5 h-3.5" /> Xem chi tiết nhật ký
                    </button>
                  </h4>
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-3 overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead className="text-slate-500 border-b border-slate-800 font-mono">
                        <tr>
                          <th className="pb-2">Đợt #</th>
                          <th className="pb-2">Ngày kiểm định</th>
                          <th className="pb-2">Ngày hết hạn</th>
                          <th className="pb-2">Số GCN</th>
                          <th className="pb-2">Đơn vị kiểm định</th>
                          <th className="pb-2 text-right">Chi phí</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {viewingVehicle.inspectionHistory.map(rec => (
                          <tr key={rec.id}>
                            <td className="py-2 text-amber-400 font-bold">Đợt {rec.roundNumber}</td>
                            <td className="py-2">{formatDateVN(rec.inspectionDate)}</td>
                            <td className="py-2 text-amber-300">{formatDateVN(rec.expiryDate)}</td>
                            <td className="py-2">{rec.certificateNo}</td>
                            <td className="py-2 font-sans">{rec.providerUnit || '-'}</td>
                            <td className="py-2 text-right">{rec.costVnd ? `${rec.costVnd.toLocaleString('vi-VN')} đ` : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* PDF Scan Modal */}
      {pdfPreviewModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl space-y-0">
            <div className="bg-slate-950 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-xs flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-amber-400" /> {pdfPreviewModal.title}
              </h3>
              <button
                onClick={() => setPdfPreviewModal({ isOpen: false, url: '', title: '' })}
                className="text-slate-400 hover:text-slate-200 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6 text-center space-y-4">
              <p className="text-xs text-slate-300">Tệp tài liệu scan PDF đang được liên kết:</p>
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-amber-400 text-xs break-all">
                {pdfPreviewModal.url}
              </div>
              <div className="flex justify-center gap-3">
                <a
                  href={pdfPreviewModal.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md"
                >
                  Tải xuống / Mở trong tab mới
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
