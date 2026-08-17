import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  FileType,
  UploadCloud,
  Download,
  Printer,
  Sparkles,
  CloudUpload,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Edit3,
  Eye,
  Trash2,
  Share2,
  FileCheck,
  FolderArchive,
  Layers,
  Building,
  Users,
  Radio,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  FileCode,
  ShieldAlert,
  Save,
  Check
} from 'lucide-react';
import {
  FormTemplateItem,
  FormTemplateCategory,
  GeneratedFormRecord,
  Project,
  Personnel,
  EquipmentItem,
  TaskItem,
  DocumentRecord
} from '../types';
import {
  getFormTemplates,
  saveFormTemplates,
  getGeneratedForms,
  saveGeneratedForms,
  generateDocxBlob,
  downloadDocxFile,
  exportFormToExcel
} from '../utils/formTemplateEngine';
import {
  getProjects,
  getPersonnel,
  getEquipment,
  getTasks,
  getDocuments,
  getCurrentUser,
  addAuditLog
} from '../utils/storage';
import { formatDateVN, formatVND } from '../utils/formatters';

const CATEGORY_LABELS: Record<FormTemplateCategory, { label: string; icon: any; color: string }> = {
  phieu_giao_viec: { label: 'Phiếu giao việc', icon: FileText, color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  phieu_trinh_ky: { label: 'Phiếu trình ký', icon: FileCode, color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  phieu_muon_ho_so: { label: 'Phiếu mượn hồ sơ', icon: FolderArchive, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  phieu_ban_giao_thiet_bi: { label: 'Phiếu bàn giao thiết bị', icon: Radio, color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  phieu_kiem_tra_thiet_bi: { label: 'Phiếu kiểm tra thiết bị', icon: FileCheck, color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  bien_ban_nghiem_thu: { label: 'Biên bản nghiệm thu', icon: CheckCircle2, color: 'bg-green-500/10 text-green-400 border-green-500/30' },
  bien_ban_ban_giao_mat_bang: { label: 'Biên bản bàn giao mặt bằng', icon: Layers, color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  nhat_ky_thi_cong: { label: 'Nhật ký thi công', icon: Clock, color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  bao_cao_ngay: { label: 'Báo cáo ngày', icon: FileText, color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  bao_cao_tuan: { label: 'Báo cáo tuần', icon: FileText, color: 'bg-blue-600/10 text-blue-300 border-blue-600/30' },
  bao_cao_thang: { label: 'Báo cáo tháng', icon: FileSpreadsheet, color: 'bg-indigo-600/10 text-indigo-300 border-indigo-600/30' },
  bao_cao_tien_do: { label: 'Báo cáo tiến độ', icon: RefreshCw, color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  bao_cao_an_toan: { label: 'Báo cáo an toàn', icon: ShieldAlert, color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  bao_cao_su_co: { label: 'Báo cáo sự cố', icon: ShieldAlert, color: 'bg-red-500/10 text-red-400 border-red-500/30' },
  danh_sach_nhan_su: { label: 'Danh sách nhân sự', icon: Users, color: 'bg-emerald-600/10 text-emerald-300 border-emerald-600/30' },
  danh_sach_thiet_bi: { label: 'Danh sách thiết bị', icon: Radio, color: 'bg-teal-600/10 text-teal-300 border-teal-600/30' },
  ho_so_de_nghi_thanh_toan: { label: 'Hồ sơ đề nghị thanh toán', icon: FileSpreadsheet, color: 'bg-amber-600/10 text-amber-300 border-amber-600/30' }
};

export const FormTemplateManager: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'library' | 'fill' | 'history' | 'upload'>('library');
  const [templates, setTemplates] = useState<FormTemplateItem[]>(getFormTemplates());
  const [generatedForms, setGeneratedForms] = useState<GeneratedFormRecord[]>(getGeneratedForms());

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form Auto-fill State
  const [selectedTemplate, setSelectedTemplate] = useState<FormTemplateItem | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [selectedPersonnelId, setSelectedPersonnelId] = useState<string>('');
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('');

  const [formMappedData, setFormMappedData] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);

  // Drive Sign Modal
  const [driveModalForm, setDriveModalForm] = useState<GeneratedFormRecord | null>(null);
  const [driveUrlInput, setDriveUrlInput] = useState('');

  // Upload New Template Form State
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateCat, setNewTemplateCat] = useState<FormTemplateCategory>('phieu_giao_viec');
  const [newTemplateDesc, setNewTemplateDesc] = useState('');
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);

  // System Data
  const projects = getProjects();
  const personnel = getPersonnel();
  const equipment = getEquipment();
  const tasks = getTasks();
  const docs = getDocuments();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Auto fill logic when system objects change
  const handleAutoFillFromSystem = (
    tmpl: FormTemplateItem,
    projId?: string,
    perId?: string,
    eqId?: string,
    taskId?: string,
    docId?: string
  ) => {
    const proj = projects.find(p => p.id === (projId || selectedProjectId));
    const per = personnel.find(p => p.id === (perId || selectedPersonnelId));
    const eq = equipment.find(e => e.id === (eqId || selectedEquipmentId));
    const t = tasks.find(tk => tk.id === (taskId || selectedTaskId));
    const d = docs.find(dc => dc.id === (docId || selectedDocId));

    const initialMap: Record<string, string> = {};

    tmpl.placeholders.forEach(ph => {
      const key = ph.replace(/[{}]/g, '');
      if (key.includes('DU_AN') || key.includes('PROJECT')) {
        if (proj) {
          if (key === 'TEN_DU_AN') initialMap[ph] = proj.name;
          else if (key === 'MA_DU_AN') initialMap[ph] = proj.code;
          else if (key === 'CHU_DAU_TU') initialMap[ph] = proj.investor;
          else if (key === 'CHI_HUY_TRUONG') initialMap[ph] = proj.commanderName;
          else if (key === 'DIEN_TICH_HA' || key === 'DIEN_TICH_NGHIEM_THU') initialMap[ph] = `${proj.areaHa} ha`;
          else if (key === 'NGAN_SACH' || key === 'GIA_TRI_VND') initialMap[ph] = `${proj.budgetVnd.toLocaleString('vi-VN')} VNĐ`;
          else initialMap[ph] = proj.name;
        } else {
          initialMap[ph] = `[Tự động từ Dự án: ${tmpl.name}]`;
        }
      } else if (key.includes('NHAN_SU') || key.includes('CAN_BO') || key.includes('CHU_TRI')) {
        if (per) {
          initialMap[ph] = `${per.rankTitle} ${per.fullName} (${per.roleInTeam})`;
        } else if (proj) {
          initialMap[ph] = proj.commanderName;
        } else {
          initialMap[ph] = getCurrentUser().name;
        }
      } else if (key.includes('THIET_BI') || key.includes('MAY_DO')) {
        if (eq) {
          initialMap[ph] = `${eq.name} - ${eq.brandModel} (${eq.serialOrPlate})`;
        } else {
          initialMap[ph] = 'Máy dò bom mìn Vallon VMR3 / Minelab F3';
        }
      } else if (key.includes('CONG_VIEC') || key.includes('NOI_DUNG')) {
        if (t) {
          initialMap[ph] = t.title;
        } else {
          initialMap[ph] = 'Triển khai thi công rà phá bom mìn vật nổ tại khu vực dự án';
        }
      } else if (key.includes('VAN_BAN') || key.includes('TRICH_YEAU')) {
        if (d) {
          initialMap[ph] = `[${d.code}] ${d.title}`;
        } else {
          initialMap[ph] = `Tờ trình phê duyệt phương án kỹ thuật thi công RPBM`;
        }
      } else if (key.includes('NGAY') || key.includes('THOI_GIAN')) {
        initialMap[ph] = new Date().toLocaleDateString('vi-VN');
      } else {
        initialMap[ph] = `Dữ liệu ${key}`;
      }
    });

    setFormMappedData(initialMap);
  };

  const handleSelectTemplateForFill = (tmpl: FormTemplateItem) => {
    setSelectedTemplate(tmpl);
    setActiveSubTab('fill');
    handleAutoFillFromSystem(tmpl);
  };

  // Export handlers
  const handleExportWord = async () => {
    if (!selectedTemplate) return;
    setIsExporting(true);
    try {
      const blob = await generateDocxBlob(selectedTemplate, formMappedData);
      const filename = `${selectedTemplate.code}_${new Date().toISOString().slice(0, 10)}.docx`;
      downloadDocxFile(blob, filename);

      // Save record to history
      const newRecord: GeneratedFormRecord = {
        id: `gen-${Date.now()}`,
        templateId: selectedTemplate.id,
        templateName: selectedTemplate.name,
        category: selectedTemplate.category,
        projectId: selectedProjectId,
        projectName: projects.find(p => p.id === selectedProjectId)?.name || 'Nghiệp vụ chung',
        createdDate: new Date().toISOString().slice(0, 10),
        createdPerson: getCurrentUser().name,
        mappedData: formMappedData,
        wordFileUrl: filename,
        status: 'da_xuat'
      };

      const updated = [newRecord, ...generatedForms];
      setGeneratedForms(updated);
      saveGeneratedForms(updated, `Xuất biểu mẫu Word: ${selectedTemplate.name}`);
      showToast(`Đã xuất tệp Word "${filename}" thành công!`);
    } catch (err) {
      console.error(err);
      showToast('Lỗi khi tạo tệp Word!');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = () => {
    if (!selectedTemplate) return;
    const filename = `${selectedTemplate.code}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    exportFormToExcel(selectedTemplate, formMappedData, filename);

    const newRecord: GeneratedFormRecord = {
      id: `gen-${Date.now()}`,
      templateId: selectedTemplate.id,
      templateName: selectedTemplate.name,
      category: selectedTemplate.category,
      projectId: selectedProjectId,
      projectName: projects.find(p => p.id === selectedProjectId)?.name || 'Nghiệp vụ chung',
      createdDate: new Date().toISOString().slice(0, 10),
      createdPerson: getCurrentUser().name,
      mappedData: formMappedData,
      excelFileUrl: filename,
      status: 'da_xuat'
    };

    const updated = [newRecord, ...generatedForms];
    setGeneratedForms(updated);
    saveGeneratedForms(updated, `Xuất biểu mẫu Excel: ${selectedTemplate.name}`);
    showToast(`Đã xuất tệp Excel "${filename}" thành công!`);
  };

  const handleDirectPrint = () => {
    window.print();
  };

  // Save signed version to Google Drive
  const handleSaveSignedDrive = (record: GeneratedFormRecord) => {
    if (!driveUrlInput) {
      showToast('Vui lòng nhập đường dẫn Google Drive!');
      return;
    }

    const updated = generatedForms.map(f => {
      if (f.id === record.id) {
        const history = f.versionHistory || [];
        return {
          ...f,
          isSignedAndUploadedToDrive: true,
          driveSignedUrl: driveUrlInput,
          signedDate: new Date().toISOString().slice(0, 10),
          status: 'da_ky_gdrive' as const,
          versionHistory: [
            ...history,
            {
              version: (history.length || 1) + 1,
              updatedAt: new Date().toISOString().slice(0, 10),
              updatedBy: getCurrentUser().name,
              driveUrl: driveUrlInput,
              notes: 'Tải lên bản scan có chữ ký & con dấu phòng nghiệp vụ'
            }
          ]
        };
      }
      return f;
    });

    setGeneratedForms(updated);
    saveGeneratedForms(updated, `Lưu bản đã ký lên Google Drive cho biểu mẫu: ${record.templateName}`);
    setDriveModalForm(null);
    setDriveUrlInput('');
    showToast('Đã lưu phiên bản đã ký lên Google Drive thành công!');
  };

  // Upload Word Template
  const handleUploadNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateName) {
      showToast('Vui lòng nhập tên biểu mẫu!');
      return;
    }

    const newTmpl: FormTemplateItem = {
      id: `tmpl-custom-${Date.now()}`,
      code: `BM-CUSTOM-${Math.floor(Math.random() * 900 + 100)}`,
      name: newTemplateName,
      category: newTemplateCat,
      description: newTemplateDesc || 'Biểu mẫu do người dùng tải lên',
      format: 'docx',
      version: '1.0',
      uploadedBy: getCurrentUser().name,
      uploadedDate: new Date().toISOString().slice(0, 10),
      fileName: newTemplateFile ? newTemplateFile.name : `${newTemplateName}.docx`,
      fileSize: newTemplateFile ? `${(newTemplateFile.size / 1024).toFixed(1)} KB` : '50 KB',
      isSystemDefault: false,
      placeholders: ['{TEN_DU_AN}', '{NGUOI_LAP}', '{THOI_GIAN}', '{NOI_DUNG}']
    };

    const updated = [newTmpl, ...templates];
    setTemplates(updated);
    saveFormTemplates(updated, `Tải lên biểu mẫu Word mới: ${newTemplateName}`);

    setNewTemplateName('');
    setNewTemplateDesc('');
    setNewTemplateFile(null);
    setActiveSubTab('library');
    showToast(`Tải lên biểu mẫu "${newTemplateName}" thành công!`);
  };

  // Filter templates
  const filteredTemplates = templates.filter(tmpl => {
    const matchesSearch = tmpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tmpl.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || tmpl.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 border border-emerald-500 text-emerald-100 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span className="text-sm font-medium">{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Mục 14: Quản lý Biểu mẫu RPBM</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Thư viện Biểu mẫu & Nhập dữ liệu Tự động</h2>
            <p className="text-slate-400 text-sm mt-1">
              Quản lý 17 loại biểu mẫu chuẩn Bộ Quốc phòng, tự động điền dữ liệu từ hệ thống, xuất Word, Excel, PDF & lưu bản đã ký trên Google Drive.
            </p>
          </div>

          {/* Tab buttons */}
          <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-xl border border-slate-700/80">
            <button
              onClick={() => setActiveSubTab('library')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'library'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Thư viện (17 Mẫu)</span>
            </button>

            <button
              onClick={() => {
                if (!selectedTemplate) setSelectedTemplate(templates[0]);
                setActiveSubTab('fill');
              }}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'fill'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Nhập tự động & Xuất</span>
            </button>

            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <CloudUpload className="w-4 h-4 text-sky-400" />
              <span>Lưu vết & Google Drive</span>
            </button>

            <button
              onClick={() => setActiveSubTab('upload')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'upload'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Mẫu Word</span>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tab 1: Thư viện Biểu mẫu */}
      {activeSubTab === 'library' && (
        <div className="space-y-6">
          {/* Filters & Search Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm kiếm biểu mẫu theo tên, mã số, mô tả..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Tất cả 17 Loại biểu mẫu</option>
              {Object.entries(CATEGORY_LABELS).map(([catKey, catVal]) => (
                <option key={catKey} value={catKey}>{catVal.label}</option>
              ))}
            </select>
          </div>

          {/* Template Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTemplates.map(tmpl => {
              const categoryInfo = CATEGORY_LABELS[tmpl.category] || CATEGORY_LABELS.phieu_giao_viec;
              const CategoryIcon = categoryInfo.icon;

              return (
                <div
                  key={tmpl.id}
                  className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-xl p-5 transition-all shadow-lg hover:shadow-emerald-950/40 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-md border flex items-center gap-1.5 ${categoryInfo.color}`}>
                        <CategoryIcon className="w-3.5 h-3.5" />
                        <span>{categoryInfo.label}</span>
                      </span>

                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {tmpl.code}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-100 group-hover:text-emerald-300 transition-colors line-clamp-2">
                      {tmpl.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-2 line-clamp-3">
                      {tmpl.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                      <div className="flex justify-between">
                        <span>Định dạng:</span>
                        <span className="text-slate-200 font-mono uppercase">{tmpl.format} (.docx)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Phiên bản:</span>
                        <span className="text-emerald-400 font-mono">v{tmpl.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Trường tự động map:</span>
                        <span className="text-amber-400 font-mono">{tmpl.placeholders.length} trường</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleSelectTemplateForFill(tmpl)}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/30"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                      <span>Nhập dữ liệu & Tạo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Nhập dữ liệu tự động & Tạo mới Biểu mẫu */}
      {activeSubTab === 'fill' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Selector & System Auto-Fill Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1. Chọn Biểu mẫu & Nguồn dữ liệu Hệ thống</span>
              </h3>

              {/* Template selector */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Chọn Biểu mẫu:</label>
                <select
                  value={selectedTemplate?.id || ''}
                  onChange={e => {
                    const found = templates.find(t => t.id === e.target.value);
                    if (found) {
                      setSelectedTemplate(found);
                      handleAutoFillFromSystem(found);
                    }
                  }}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  {templates.map(tmpl => (
                    <option key={tmpl.id} value={tmpl.id}>
                      [{tmpl.code}] {tmpl.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* System Source Controls */}
              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/80 space-y-3">
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tự động map dữ liệu từ:</span>
                </div>

                {/* Select Project */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Dự án RPBM liên quan:</label>
                  <select
                    value={selectedProjectId}
                    onChange={e => {
                      setSelectedProjectId(e.target.value);
                      if (selectedTemplate) handleAutoFillFromSystem(selectedTemplate, e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
                  >
                    <option value="">-- Tất cả dự án (Hệ thống) --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Select Personnel */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Nhân sự / Cán bộ phụ trách:</label>
                  <select
                    value={selectedPersonnelId}
                    onChange={e => {
                      setSelectedPersonnelId(e.target.value);
                      if (selectedTemplate) handleAutoFillFromSystem(selectedTemplate, undefined, e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
                  >
                    <option value="">-- Người đăng nhập hiện tại --</option>
                    {personnel.map(per => (
                      <option key={per.id} value={per.id}>{per.rankTitle} {per.fullName} - {per.roleInTeam}</option>
                    ))}
                  </select>
                </div>

                {/* Select Equipment */}
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Thiết bị / Phương tiện:</label>
                  <select
                    value={selectedEquipmentId}
                    onChange={e => {
                      setSelectedEquipmentId(e.target.value);
                      if (selectedTemplate) handleAutoFillFromSystem(selectedTemplate, undefined, undefined, e.target.value);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-200 focus:border-emerald-500"
                  >
                    <option value="">-- Chọn thiết bị trong kho --</option>
                    {equipment.map(eq => (
                      <option key={eq.id} value={eq.id}>{eq.name} ({eq.serialOrPlate})</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => selectedTemplate && handleAutoFillFromSystem(selectedTemplate)}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Cập nhật lại Mapping Tự động</span>
                </button>
              </div>

              {/* Mapped Fields Editor */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold text-slate-300">Chỉnh sửa Các Trường Dữ Liệu Biểu Mẫu:</h4>
                <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                  {Object.entries(formMappedData).map(([fieldKey, fieldValue]) => (
                    <div key={fieldKey} className="flex flex-col gap-1 bg-slate-800/80 p-2 rounded border border-slate-700/60">
                      <span className="text-[11px] font-mono text-amber-400 font-semibold">{fieldKey}</span>
                      <input
                        type="text"
                        value={fieldValue}
                        onChange={e => setFormMappedData({ ...formMappedData, [fieldKey]: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Form Preview & Export Action Toolbar */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-emerald-400" />
                    <span>Xem Trước & Xuất Biểu Mẫu</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedTemplate?.name} ({selectedTemplate?.code})
                  </p>
                </div>

                {/* Export Action Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleExportWord}
                    disabled={isExporting}
                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Xuất Word (.docx)</span>
                  </button>

                  <button
                    onClick={handleExportExcel}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 shadow"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Xuất Excel (.xlsx)</span>
                  </button>

                  <button
                    onClick={handleDirectPrint}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    <span>In Trực Tiếp</span>
                  </button>
                </div>
              </div>

              {/* HTML Paper Document Preview */}
              <div className="bg-white text-slate-900 p-8 rounded-lg shadow-2xl border border-slate-300 font-serif min-h-[500px]">
                <div className="flex justify-between items-start text-center mb-6 text-xs leading-relaxed border-b pb-4">
                  <div>
                    <div className="font-bold">BỘ QUỐC PHÒNG</div>
                    <div className="font-bold">BINH CHỦNG CÔNG BINH</div>
                  </div>
                  <div>
                    <div className="font-bold">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                    <div className="underline">Độc lập - Tự do - Hạnh phúc</div>
                  </div>
                </div>

                <div className="text-center my-6">
                  <h2 className="text-xl font-bold uppercase tracking-wide text-slate-900">
                    {selectedTemplate?.name}
                  </h2>
                  <div className="text-xs italic text-slate-600 mt-1">
                    Số/Mã: {selectedTemplate?.code} | Ngày lập: {new Date().toLocaleDateString('vi-VN')}
                  </div>
                </div>

                {/* Body Table of mapped fields */}
                <div className="my-6 space-y-3 text-sm leading-relaxed">
                  {Object.entries(formMappedData).map(([key, val]) => (
                    <div key={key} className="flex border-b border-slate-200 pb-1.5">
                      <span className="font-bold w-48 text-slate-800 shrink-0">{key.replace(/[{}]/g, '')}:</span>
                      <span className="text-slate-900 font-sans">{val || '...........................................'}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-4 border-t text-xs italic text-slate-600">
                  Ghi chú / Ý kiến phê duyệt: ..............................................................................................................................................
                </div>

                {/* Signatures */}
                <div className="mt-12 grid grid-cols-2 text-center text-xs gap-4 font-sans">
                  <div>
                    <div className="font-bold">NGƯỜI LẬP BIỂU MẪU</div>
                    <div className="italic text-slate-500">(Ký, ghi rõ họ tên)</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">{getCurrentUser().name}</div>
                  </div>
                  <div>
                    <div className="font-bold">THỦ TRƯỞNG PHÊ DUYỆT</div>
                    <div className="italic text-slate-500">(Ký, đóng dấu)</div>
                    <div className="h-16"></div>
                    <div className="font-bold text-slate-800">Thượng tá Nguyễn Văn Hùng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Lịch sử xuất biểu mẫu & Google Drive Signed Documents */}
      {activeSubTab === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <CloudUpload className="w-5 h-5 text-sky-400" />
                <span>Lịch Sử Xuất Biểu Mẫu & Phiên Bản Đã Ký Google Drive</span>
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý các bản biểu mẫu đã khởi tạo, liên kết link lưu trữ Google Drive và lưu phiên bản đã ký duyệt.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                <tr>
                  <th className="px-4 py-3">Tên Biểu Mẫu</th>
                  <th className="px-4 py-3">Dự Án</th>
                  <th className="px-4 py-3">Người Tạo</th>
                  <th className="px-4 py-3">Ngày Tạo</th>
                  <th className="px-4 py-3">Trạng Thái Ký</th>
                  <th className="px-4 py-3 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {generatedForms.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">
                      Chưa có lịch sử xuất biểu mẫu nào. Vui lòng chuyển sang tab "Nhập tự động & Xuất" để tạo mới.
                    </td>
                  </tr>
                ) : (
                  generatedForms.map(form => (
                    <tr key={form.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {form.templateName}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        {form.projectName || 'Nghiệp vụ chung'}
                      </td>
                      <td className="px-4 py-3 text-slate-300">{form.createdPerson}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{form.createdDate}</td>
                      <td className="px-4 py-3">
                        {form.isSignedAndUploadedToDrive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-700/60">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Đã ký & Lưu Drive</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-950 text-amber-300 border border-amber-700/60">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Bản thảo / Chưa ký</span>
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        {form.driveSignedUrl ? (
                          <a
                            href={form.driveSignedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 px-2.5 py-1.5 rounded text-xs font-semibold"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Mở Drive</span>
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setDriveModalForm(form);
                              setDriveUrlInput('https://drive.google.com/file/d/signed-doc-sample/view');
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded text-xs font-semibold"
                          >
                            + Lưu Google Drive
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: Upload File Biểu mẫu Dạng Word (.docx/.doc) */}
      {activeSubTab === 'upload' && (
        <div className="max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-400" />
              <span>Tải Lên File Biểu Mẫu Dạng Word (.docx / .doc)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Bổ sung biểu mẫu quy chuẩn nội bộ của đơn vị vào thư viện dùng chung cho toàn bộ cán bộ.
            </p>
          </div>

          <form onSubmit={handleUploadNewTemplate} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Biểu Mẫu mới (*):</label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Phiếu đăng ký phương án rà phá đặc thù Long Thành"
                value={newTemplateName}
                onChange={e => setNewTemplateName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phân Loại Biểu Mẫu (*):</label>
              <select
                value={newTemplateCat}
                onChange={e => setNewTemplateCat(e.target.value as FormTemplateCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                {Object.entries(CATEGORY_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>{val.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mô Tả Công Dụng / Mục Đích:</label>
              <textarea
                rows={3}
                placeholder="Nhập ghi chú hoặc phạm vi áp dụng của mẫu này..."
                value={newTemplateDesc}
                onChange={e => setNewTemplateDesc(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* File upload box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Chọn Tệp Word (.docx, .doc):</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/80 rounded-xl p-6 text-center bg-slate-800/50 transition-colors cursor-pointer relative">
                <input
                  type="file"
                  accept=".docx,.doc"
                  onChange={e => setNewTemplateFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <FileText className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
                <div className="text-sm font-semibold text-slate-200">
                  {newTemplateFile ? newTemplateFile.name : 'Kéo thả tệp Word hoặc Bấm để chọn tệp'}
                </div>
                <div className="text-xs text-slate-400 mt-1">Hỗ trợ các định dạng .docx, .doc (Tối đa 25MB)</div>
              </div>
            </div>

            <div className="pt-4 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setActiveSubTab('library')}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-900/40 flex items-center gap-2"
              >
                <UploadCloud className="w-4 h-4" />
                <span>Tải Lên & Thêm Vào Thư Viện</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Google Drive Link Modal */}
      {driveModalForm && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CloudUpload className="w-5 h-5 text-emerald-400" />
              <span>Lưu Phiên Bản Đã Ký Lên Google Drive</span>
            </h3>

            <p className="text-xs text-slate-300">
              Nhập đường dẫn Google Drive của tệp scan đã có chữ ký và con dấu phê duyệt:
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Link Google Drive:</label>
              <input
                type="text"
                value={driveUrlInput}
                onChange={e => setDriveUrlInput(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                onClick={() => setDriveModalForm(null)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={() => handleSaveSignedDrive(driveModalForm)}
                className="px-4 py-2 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Xác nhận & Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
