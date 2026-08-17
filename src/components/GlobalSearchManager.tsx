import React, { useState, useEffect } from 'react';
import {
  Search,
  Bookmark,
  FileText,
  CheckSquare,
  Bomb,
  Users,
  Award,
  Truck,
  Radio,
  Archive,
  BookOpen,
  Cloud,
  ChevronRight,
  Sparkles,
  ExternalLink,
  Calendar,
  X,
  Check,
  RefreshCw
} from 'lucide-react';
import {
  getDocuments,
  getTasks,
  getProjects,
  getPersonnel,
  getVehicles,
  getEquipment,
  getArchiveWarehouses,
  getLegalDocs,
  getStored,
  setStored,
  addAuditLog
} from '../utils/storage';
import { getGeneratedForms } from '../utils/formTemplateEngine';
import { removeVietnameseTones } from '../utils/formatters';

interface GlobalSearchManagerProps {
  onNavigateTab: (tab: string, itemId?: string) => void;
}

export interface SavedSearchPreset {
  id: string;
  name: string;
  query: string;
  category: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

const SAVED_SEARCHES_KEY = 'qlrpbm_saved_searches';

export const GlobalSearchManager: React.FC<GlobalSearchManagerProps> = ({ onNavigateTab }) => {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExactMatch, setIsExactMatch] = useState(false);

  // Saved presets state
  const [savedPresets, setSavedPresets] = useState<SavedSearchPreset[]>([]);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // System Data
  const documents = getDocuments();
  const tasks = getTasks();
  const projects = getProjects();
  const personnel = getPersonnel();
  const vehicles = getVehicles();
  const equipment = getEquipment();
  const warehouses = getArchiveWarehouses();
  const legalDocs = getLegalDocs();
  const generatedForms = getGeneratedForms();

  useEffect(() => {
    setSavedPresets(getStored<SavedSearchPreset[]>(SAVED_SEARCHES_KEY, []));
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSaveCurrentFilter = () => {
    if (!presetNameInput) return;
    const newPreset: SavedSearchPreset = {
      id: `preset-${Date.now()}`,
      name: presetNameInput,
      query,
      category: selectedCategory,
      startDate,
      endDate,
      createdAt: new Date().toLocaleDateString('vi-VN')
    };
    const updated = [newPreset, ...savedPresets];
    setSavedPresets(updated);
    setStored(SAVED_SEARCHES_KEY, updated);
    addAuditLog('Tìm kiếm toàn hệ thống', `Lưu điều kiện tìm kiếm: ${presetNameInput}`);
    setPresetNameInput('');
    setShowSaveModal(false);
    showToast(`Đã lưu bộ lọc "${newPreset.name}" thành công!`);
  };

  const handleDeletePreset = (id: string, name: string) => {
    const updated = savedPresets.filter(p => p.id !== id);
    setSavedPresets(updated);
    setStored(SAVED_SEARCHES_KEY, updated);
    showToast(`Đã xóa bộ lọc "${name}"`);
  };

  const handleApplyPreset = (preset: SavedSearchPreset) => {
    setQuery(preset.query);
    setSelectedCategory(preset.category);
    setStartDate(preset.startDate);
    setEndDate(preset.endDate);
    showToast(`Đã áp dụng bộ lọc "${preset.name}"`);
  };

  // Matching helper
  const matchesSearch = (textStr?: string, codeStr?: string) => {
    if (!query || query.trim() === '') return true;
    const rawTarget = `${textStr || ''} ${codeStr || ''}`;

    if (isExactMatch) {
      return rawTarget.toLowerCase().includes(query.toLowerCase());
    }

    // Accent-insensitive search
    const normTarget = removeVietnameseTones(rawTarget.toLowerCase());
    const normQuery = removeVietnameseTones(query.toLowerCase());

    const keywords = normQuery.split(/\s+/).filter(Boolean);
    return keywords.every(kw => normTarget.includes(kw));
  };

  const matchesDateRange = (dateStr?: string) => {
    if (!dateStr) return true;
    if (startDate && dateStr < startDate) return false;
    if (endDate && dateStr > endDate) return false;
    return true;
  };

  // Search results across 10 categories
  const documentResults = documents.filter(d => matchesSearch(d.title + ' ' + (d.category || ''), d.code) && matchesDateRange(d.issueDate));
  const taskResults = tasks.filter(t => matchesSearch(t.title + ' ' + t.description, t.id || t.code) && matchesDateRange(t.deadline));
  const projectResults = projects.filter(p => matchesSearch(p.name + ' ' + p.investor + ' ' + p.commanderName, p.code) && matchesDateRange(p.startDate));
  const personnelResults = personnel.filter(p => matchesSearch(p.fullName + ' ' + p.rankTitle + ' ' + (p.unit || ''), p.id));
  
  // Certificates extracted from personnel
  const certificateResults = personnel.flatMap(p => 
    (p.certificates || []).map(cert => ({
      ...cert,
      ownerName: p.fullName,
      ownerRank: p.rankTitle,
      ownerId: p.id
    }))
  ).filter(c => matchesSearch(c.name + ' ' + c.issuedBy + ' ' + c.ownerName, c.certificateNo) && matchesDateRange(c.issueDate));

  const vehicleResults = vehicles.filter(v => matchesSearch(v.brand + ' ' + v.model + ' ' + v.frequentDriverName, v.licensePlate) && matchesDateRange(v.nextInspectionExpiryDate));
  const equipmentResults = equipment.filter(e => matchesSearch(e.name + ' ' + e.brandModel + ' ' + e.location, e.serialOrPlate) && matchesDateRange(e.nextCalibrationDate));
  
  // Warehouses dossiers
  const warehouseDossierResults = warehouses.flatMap(w => 
    (w.dossiers || []).map(doss => ({ ...doss, warehouseName: w.name, warehouseLocation: w.location }))
  ).filter(d => matchesSearch(d.title + ' ' + d.projectName, d.code) && matchesDateRange(d.archivedDate));

  const legalDocResults = legalDocs.filter(l => matchesSearch(l.title + ' ' + l.summary + ' ' + (l.issuingAgency || ''), l.code || l.docNumberSymbol) && matchesDateRange(l.issuedDate));
  
  // Drive files & generated form records
  const driveFileResults = generatedForms.filter(f => 
    (matchesSearch(f.templateName + ' ' + f.projectName + ' ' + f.createdPerson, f.templateId) || matchesSearch(f.driveSignedUrl)) && matchesDateRange(f.createdDate)
  );

  const totalResultsCount =
    documentResults.length +
    taskResults.length +
    projectResults.length +
    personnelResults.length +
    certificateResults.length +
    vehicleResults.length +
    equipmentResults.length +
    warehouseDossierResults.length +
    legalDocResults.length +
    driveFileResults.length;

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 border border-emerald-500 text-emerald-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-sky-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <Search className="w-4 h-4" />
              <span>Mục 16: Tìm kiếm Toàn hệ thống</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Tra cứu Siêu Từ khóa & Dữ liệu Tập trung</h2>
            <p className="text-slate-400 text-sm mt-1">
              Tìm kiếm đồng thời trên 10 nhóm dữ liệu RPBM: Văn bản, Công việc, Dự án, Nhân sự, Chứng chỉ, Xe, Thiết bị, Kho hồ sơ, Pháp lý & Drive.
            </p>
          </div>

          <button
            onClick={() => setShowSaveModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            <Bookmark className="w-4 h-4" />
            <span>Lưu Bộ Lọc Tìm Kiếm</span>
          </button>
        </div>
      </div>

      {/* Primary Search Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
        {/* Universal Search Input */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-sky-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Nhập từ khóa, mã dự án, biển số xe, tên cán bộ, số văn bản, tên thiết bị (Ví dụ: LT-2026, Vallon, Long Thành)..."
            className="w-full bg-slate-800 border-2 border-slate-700 focus:border-sky-500 rounded-xl pl-12 pr-12 py-3 text-base text-slate-100 placeholder-slate-400 focus:outline-none transition-colors shadow-inner font-medium"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-4 top-3.5 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          <div className="flex flex-wrap items-center gap-3">
            {/* Exact match toggle */}
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-300 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
              <input
                type="checkbox"
                checked={isExactMatch}
                onChange={e => setIsExactMatch(e.target.checked)}
                className="rounded border-slate-700 text-sky-600 focus:ring-sky-500"
              />
              <span>Phân biệt chính xác (Có dấu)</span>
            </label>

            {/* Date Range */}
            <div className="flex items-center gap-2 text-xs bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400">Từ:</span>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none"
              />
              <span className="text-slate-400">Đến:</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-slate-200 text-xs focus:outline-none"
              />
            </div>
          </div>

          {/* Reset Filters */}
          <button
            onClick={() => {
              setQuery('');
              setSelectedCategory('all');
              setStartDate('');
              setEndDate('');
              setIsExactMatch(false);
            }}
            className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Xóa điều kiện tìm</span>
          </button>
        </div>

        {/* Saved Presets Quick List */}
        {savedPresets.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-800 text-xs">
            <span className="text-slate-400 font-semibold shrink-0 flex items-center gap-1">
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span>Bộ lọc đã lưu:</span>
            </span>
            {savedPresets.map(preset => (
              <div
                key={preset.id}
                className="bg-slate-800/90 border border-slate-700 hover:border-emerald-500/50 rounded-lg px-2.5 py-1 text-slate-200 flex items-center gap-2 shrink-0 group"
              >
                <button
                  onClick={() => handleApplyPreset(preset)}
                  className="font-medium hover:text-emerald-300 text-left"
                >
                  {preset.name}
                </button>
                <button
                  onClick={() => handleDeletePreset(preset.id, preset.name)}
                  className="text-slate-400 hover:text-rose-400 opacity-60 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Tabs Header */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {[
          { id: 'all', label: 'Tất cả kết quả', count: totalResultsCount, icon: Sparkles },
          { id: 'documents', label: 'Văn bản', count: documentResults.length, icon: FileText },
          { id: 'tasks', label: 'Công việc', count: taskResults.length, icon: CheckSquare },
          { id: 'projects', label: 'Dự án RPBM', count: projectResults.length, icon: Bomb },
          { id: 'personnel', label: 'Nhân sự', count: personnelResults.length, icon: Users },
          { id: 'certificates', label: 'Chứng chỉ', count: certificateResults.length, icon: Award },
          { id: 'vehicles', label: 'Xe ô tô', count: vehicleResults.length, icon: Truck },
          { id: 'equipment', label: 'Trang thiết bị', count: equipmentResults.length, icon: Radio },
          { id: 'warehouses', label: 'Kho hồ sơ', count: warehouseDossierResults.length, icon: Archive },
          { id: 'legal', label: 'Văn bản pháp lý', count: legalDocResults.length, icon: BookOpen },
          { id: 'drive', label: 'File Drive', count: driveFileResults.length, icon: Cloud },
        ].map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-950/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isActive ? 'bg-sky-800 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Results Listing grouped by category */}
      <div className="space-y-6">
        {/* 1. VĂN BẢN */}
        {(selectedCategory === 'all' || selectedCategory === 'documents') && documentResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-sky-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <span>Văn bản & Hồ sơ ({documentResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('documents')} className="text-xs text-slate-400 hover:text-sky-300 flex items-center gap-1">
                <span>Xem trong Quản lý Văn bản</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {documentResults.slice(0, 6).map(doc => (
                <div key={doc.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-sky-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">
                      {doc.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{doc.title}</h4>
                    <div className="text-[11px] text-slate-400">Cơ quan ban hành: {doc.issuer}</div>
                    <div className="text-[10px] text-slate-500 font-mono pt-1">Ngày ban hành: {doc.issueDate}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('documents', doc.id)}
                    className="self-center bg-slate-700 hover:bg-sky-600 hover:text-white text-slate-300 p-2 rounded-lg text-xs transition-colors shrink-0"
                    title="Truy cập văn bản"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. CÔNG VIỆC */}
        {(selectedCategory === 'all' || selectedCategory === 'tasks') && taskResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2">
                <CheckSquare className="w-4 h-4" />
                <span>Công việc & Nhiệm vụ ({taskResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('tasks')} className="text-xs text-slate-400 hover:text-indigo-300 flex items-center gap-1">
                <span>Xem trên Phân hệ Công việc</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {taskResults.slice(0, 6).map(t => (
                <div key={t.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-indigo-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-100">{t.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{t.description}</p>
                    <div className="text-[10px] text-slate-400 flex gap-3 pt-1">
                      <span>Người chủ trì: <strong className="text-slate-200">{t.leadAssignee}</strong></span>
                      <span>Hạn: <strong className="text-amber-400 font-mono">{t.deadline}</strong></span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('tasks', t.id)}
                    className="self-center bg-slate-700 hover:bg-indigo-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. DỰ ÁN RPBM */}
        {(selectedCategory === 'all' || selectedCategory === 'projects') && projectResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <Bomb className="w-4 h-4" />
                <span>Dự án Rà phá Bom mìn ({projectResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('projects')} className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1">
                <span>Quản lý Dự án</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projectResults.slice(0, 6).map(p => (
                <div key={p.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-amber-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {p.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{p.name}</h4>
                    <div className="text-[11px] text-slate-400">Chủ đầu tư: {p.investor}</div>
                    <div className="text-[11px] text-slate-400">Chỉ huy trưởng: {p.commanderName}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('projects', p.id)}
                    className="self-center bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. NHÂN SỰ */}
        {(selectedCategory === 'all' || selectedCategory === 'personnel') && personnelResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>Nhân sự & Đội ngũ Cán bộ ({personnelResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('personnel')} className="text-xs text-slate-400 hover:text-emerald-300 flex items-center gap-1">
                <span>Quản lý Nhân sự</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {personnelResults.slice(0, 6).map(per => (
                <div key={per.id} className="bg-slate-800/70 p-3 rounded-lg border border-slate-700/80 hover:border-emerald-500/50 transition-colors space-y-1">
                  <div className="text-xs font-bold text-slate-100">{per.rankTitle} {per.fullName}</div>
                  <div className="text-[11px] text-slate-400">{per.roleInTeam} - {per.unit}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Số chứng chỉ: {per.certificates?.length || 0}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. CHỨNG CHỈ */}
        {(selectedCategory === 'all' || selectedCategory === 'certificates') && certificateResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-purple-400 flex items-center gap-2">
                <Award className="w-4 h-4" />
                <span>Chứng chỉ Nghiệp vụ Rà phá Bom mìn ({certificateResults.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {certificateResults.slice(0, 6).map((cert, idx) => (
                <div key={idx} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-purple-500/50 transition-colors space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-purple-300">{cert.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{cert.certificateNo}</span>
                  </div>
                  <div className="text-[11px] text-slate-300">Cán bộ: <strong>{cert.ownerRank} {cert.ownerName}</strong></div>
                  <div className="text-[10px] text-slate-400">Cơ quan cấp: {cert.issuedBy} | Hạn: <span className="text-amber-300">{cert.expiryDate}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. XE Ô TÔ */}
        {(selectedCategory === 'all' || selectedCategory === 'vehicles') && vehicleResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-orange-400 flex items-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Phương tiện & Xe ô tô ({vehicleResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('vehicles')} className="text-xs text-slate-400 hover:text-orange-300 flex items-center gap-1">
                <span>Quản lý Xe</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {vehicleResults.slice(0, 6).map(v => (
                <div key={v.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-orange-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-orange-400 bg-orange-950 px-2 py-0.5 rounded border border-orange-800">
                      {v.licensePlate}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{v.brand} {v.model}</h4>
                    <div className="text-[11px] text-slate-400">Lái xe: {v.frequentDriverName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Hạn đăng kiểm: {v.nextInspectionExpiryDate}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('vehicles', v.id)}
                    className="self-center bg-slate-700 hover:bg-orange-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. TRANG THIẾT BỊ */}
        {(selectedCategory === 'all' || selectedCategory === 'equipment') && equipmentResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <Radio className="w-4 h-4" />
                <span>Khí tài & Máy dò Bom mìn ({equipmentResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('uxo_equipment')} className="text-xs text-slate-400 hover:text-teal-300 flex items-center gap-1">
                <span>Quản lý Thiết bị</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {equipmentResults.slice(0, 6).map(eq => (
                <div key={eq.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-teal-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800">
                      {eq.serialOrPlate}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{eq.name}</h4>
                    <div className="text-[11px] text-slate-400">Model: {eq.brandModel}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Hạn hiệu chuẩn: {eq.nextCalibrationDate}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('uxo_equipment', eq.id)}
                    className="self-center bg-slate-700 hover:bg-teal-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 8. KHO HỒ SƠ */}
        {(selectedCategory === 'all' || selectedCategory === 'warehouses') && warehouseDossierResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-amber-500 flex items-center gap-2">
                <Archive className="w-4 h-4" />
                <span>Hồ sơ trong Kho Lưu trữ ({warehouseDossierResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('archive_warehouse')} className="text-xs text-slate-400 hover:text-amber-300 flex items-center gap-1">
                <span>Kho Hồ sơ</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {warehouseDossierResults.slice(0, 6).map(d => (
                <div key={d.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-amber-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-amber-400 bg-amber-950 px-2 py-0.5 rounded border border-amber-800">
                      {d.code}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{d.title}</h4>
                    <div className="text-[11px] text-slate-400">Kho: {d.warehouseName} | Dự án: {d.projectName}</div>
                    <div className="text-[10px] text-slate-500 font-mono">Ngày lưu: {d.archivedDate}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('archive_warehouse', d.id)}
                    className="self-center bg-slate-700 hover:bg-amber-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 9. VĂN BẢN PHÁP LÝ */}
        {(selectedCategory === 'all' || selectedCategory === 'legal') && legalDocResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-cyan-400 flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Văn bản Quy phạm Pháp lý ({legalDocResults.length})</span>
              </h3>
              <button onClick={() => onNavigateTab('legal')} className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1">
                <span>Kho Pháp lý</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {legalDocResults.slice(0, 6).map(l => (
                <div key={l.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-cyan-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
                      {l.code || l.docNumberSymbol}
                    </span>
                    <h4 className="text-xs font-bold text-slate-100">{l.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{l.summary}</p>
                    <div className="text-[10px] text-slate-500 font-mono">Cơ quan ban hành: {l.issuingAgency}</div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('legal', l.id)}
                    className="self-center bg-slate-700 hover:bg-cyan-600 text-slate-300 hover:text-white p-2 rounded-lg text-xs transition-colors shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. GOOGLE DRIVE FILES */}
        {(selectedCategory === 'all' || selectedCategory === 'drive') && driveFileResults.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <Cloud className="w-4 h-4" />
                <span>Tệp Lưu Trữ Google Drive ({driveFileResults.length})</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {driveFileResults.slice(0, 6).map(f => (
                <div key={f.id} className="bg-slate-800/70 p-3.5 rounded-lg border border-slate-700/80 hover:border-emerald-500/50 transition-colors flex justify-between gap-3">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-slate-100">{f.templateName}</h4>
                    <div className="text-[11px] text-slate-300">Dự án: {f.projectName}</div>
                    <div className="text-[10px] text-slate-400">Người tạo: {f.createdPerson} | Ngày: {f.createdDate}</div>
                  </div>
                  {f.driveSignedUrl ? (
                    <a
                      href={f.driveSignedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="self-center bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg text-xs transition-colors shrink-0 flex items-center gap-1"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="self-center text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-2 py-1 rounded">
                      Chưa gắn Link
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty Search Fallback */}
        {totalResultsCount === 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 space-y-3">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-200">Không tìm thấy kết quả phù hợp</h3>
            <p className="text-xs max-w-md mx-auto text-slate-400">
              Hãy thử thay đổi từ khóa tìm kiếm, kiểm tra lại bộ lọc ngày tháng hoặc chọn danh mục "Tất cả kết quả".
            </p>
          </div>
        )}
      </div>

      {/* Modal Save Preset */}
      {showSaveModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <Bookmark className="w-5 h-5" />
              <span>Lưu Bộ Lọc Điều Kiện Tìm Kiếm</span>
            </h3>

            <p className="text-xs text-slate-300">
              Nhập tên gợi nhớ cho bộ lọc tìm kiếm hiện tại để nhanh chóng gọi lại sau này:
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tên Bộ Lọc (*):</label>
              <input
                type="text"
                placeholder="Ví dụ: Dự án rà phá quá hạn 2026, Xe hết đăng kiểm..."
                value={presetNameInput}
                onChange={e => setPresetNameInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="bg-slate-800/60 p-3 rounded text-[11px] text-slate-400 space-y-1">
              <div>Từ khóa: <strong className="text-slate-200">{query || '(Không)'}</strong></div>
              <div>Danh mục: <strong className="text-slate-200">{selectedCategory}</strong></div>
              <div>Thời gian: <strong className="text-slate-200">{startDate || 'Tất cả'} đến {endDate || 'Tất cả'}</strong></div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveCurrentFilter}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Lưu Bộ Lọc
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
