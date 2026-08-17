import React, { useState, useRef, useEffect } from 'react';
import { Project, ProjectStatus, ProjectKmlFile, DocumentAttachment, DocumentRecord } from '../../types';
import { formatDateForInput, PROJECT_STATUS_MAP, formatVND } from '../../utils/formatters';
import { ensureProjectDefaults } from '../../utils/projectDefaults';
import { readKmlOrKmzFile, generateSampleKmlFile } from '../../utils/kmlParser';
import { getDocuments } from '../../utils/storage';
import { getProjectYear } from '../../utils/projectYearUtils';
import { ProjectManagerCombobox } from './ProjectManagerCombobox';
import { KttSelector } from './KttSelector';
import { KmlBoundaryViewerModal } from './KmlBoundaryViewerModal';
import { findKttConfigForProvince } from '../../utils/centralMeridianConfig';
import {
  X,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  UserCheck,
  FolderArchive,
  Layers,
  Globe,
  Upload,
  FileCode,
  Trash2,
  Sparkles,
  Search,
  Link,
  FileText,
  Unlink,
  FileCheck
} from 'lucide-react';

interface Props {
  project?: Partial<Project> | null;
  isOpen?: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
}

export const ProjectFormModal: React.FC<Props> = ({ project, isOpen = true, onClose, onSave }) => {
  if (isOpen === false) return null;

  const kmlInputRef = useRef<HTMLInputElement>(null);
  const coordInputRef = useRef<HTMLInputElement>(null);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const [showBoundaryMapModal, setShowBoundaryMapModal] = useState(false);

  // Incoming Document Lookup for Project Initialization
  const [incomingDocQuery, setIncomingDocQuery] = useState('');
  const [showIncomingDocDropdown, setShowIncomingDocDropdown] = useState(false);
  const [incomingDocsList, setIncomingDocsList] = useState<DocumentRecord[]>([]);

  useEffect(() => {
    // Load incoming documents for search
    const docs = getDocuments().filter(d => d.type === 'vanban_den' && d.dataStatus !== 'da_xoa');
    setIncomingDocsList(docs);
  }, []);

  const [formData, setFormData] = useState<Partial<Project>>(() => {
    const landArea = Math.max(0, project?.landAreaHa ?? project?.areaHa ?? 50.0);
    const underwaterArea = Math.max(0, project?.underwaterAreaHa ?? 0.0);
    const totalArea = Math.round((landArea + underwaterArea) * 100) / 100;

    return {
      code: project?.code || `DA-RPBM-${new Date().getFullYear()}-0${Math.floor(Math.random() * 90 + 10)}`,
      name: project?.name || '',
      workType: project?.workType || project?.projectType || 'Thi công',
      projectType: project?.projectType || project?.workType || 'Thi công',
      investor: project?.investor || '',
      investorRepresentative: project?.investorRepresentative || '',
      consultantUnit: project?.consultantUnit || '',
      contractorUnit: project?.contractorUnit || 'Trung tâm Công nghệ xử lý BMTT / BQP',
      supervisorUnit: project?.supervisorUnit || '',
      coordinatingUnit: project?.coordinatingUnit || '',

      // 1.1 Source Incoming Document
      sourceIncomingDocumentId: project?.sourceIncomingDocumentId || '',
      sourceIncomingDocumentNumber: project?.sourceIncomingDocumentNumber || '',
      sourceIncomingDocumentSymbol: project?.sourceIncomingDocumentSymbol || '',

      location: project?.location || '',
      province: project?.province || 'Quảng Trị',
      provinceCode: project?.provinceCode || 'QT',
      centralMeridian: project?.centralMeridian || 106.25,
      projectionZone: project?.projectionZone || '3deg',
      coordinateSystem: project?.coordinateSystem || 'VN-2000',
      commune: project?.commune || 'Linh Trường',
      coordinatesBoundary: project?.coordinatesBoundary || '',
      coordinateFiles: project?.coordinateFiles || [],
      kmlFiles: project?.kmlFiles || [],

      // 2.2 Areas
      landAreaHa: landArea,
      underwaterAreaHa: underwaterArea,
      totalAreaHa: totalArea,
      areaHa: totalArea,

      capitalSource: project?.capitalSource || 'Ngân sách Nhà nước',
      contractValue: Math.max(0, project?.contractValue || project?.budgetVnd || 1800000000),
      rpbmValue: Math.max(0, project?.rpbmValue || 1500000000),
      budgetVnd: Math.max(0, project?.budgetVnd || project?.contractValue || 1800000000),

      contractNumber: project?.contractNumber || `HĐ-RPBM/${new Date().getFullYear()}/01`,
      contractSigningDate: formatDateForInput(project?.contractSigningDate || new Date()),
      startDate: formatDateForInput(project?.startDate || new Date()),
      endDate: formatDateForInput(project?.endDate || new Date(Date.now() + 180 * 24 * 3600 * 1000)),
      contractDurationDays: project?.contractDurationDays || 180,

      responsibleUserId: project?.responsibleUserId || project?.projectManagerId || '',
      responsiblePersonId: project?.responsiblePersonId || '',
      responsibleName: project?.responsibleName || project?.projectManager || '',
      responsibleRank: project?.responsibleRank || project?.projectManagerRank || '',
      responsiblePosition: project?.responsiblePosition || project?.projectManagerPosition || '',
      responsibleEmail: project?.responsibleEmail || project?.projectManagerEmail || '',

      projectManager: project?.responsibleName || project?.projectManager || '',
      projectManagerId: project?.responsibleUserId || project?.projectManagerId || '',
      projectManagerRank: project?.responsibleRank || project?.projectManagerRank || '',
      projectManagerPosition: project?.responsiblePosition || project?.projectManagerPosition || '',
      projectManagerUnit: project?.projectManagerUnit || '',
      projectManagerEmail: project?.responsibleEmail || project?.projectManagerEmail || '',
      commanderName: project?.commanderName || 'Thượng tá Nguyễn Văn Hùng',
      teamSize: Math.max(1, project?.teamSize || 18),

      status: project?.status || 'dang_thi_cong',
      progressPercent: project?.progressPercent || 0,

      driveFolderUrl: project?.driveFolderUrl || '',
      scanFiles: project?.scanFiles || [],
      notes: project?.notes || '',
      dailyLogs: project?.dailyLogs || [],
      uxoFoundCount: project?.uxoFoundCount || 0
    };
  });

  // Filter incoming docs for quick search
  const filteredIncomingDocs = incomingDocsList.filter(doc => {
    if (!incomingDocQuery.trim()) return true;
    const q = incomingDocQuery.toLowerCase();
    const titleMatch = doc.title.toLowerCase().includes(q);
    const numMatch = (doc.incomingNumberDisplay || String(doc.incomingNumber || '')).toLowerCase().includes(q);
    const codeMatch = doc.code.toLowerCase().includes(q);
    return titleMatch || numMatch || codeMatch;
  });

  const handleSelectIncomingDoc = (doc: DocumentRecord) => {
    setFormData(prev => ({
      ...prev,
      name: doc.title || prev.name,
      sourceIncomingDocumentId: doc.id,
      sourceIncomingDocumentNumber: doc.incomingNumberDisplay || String(doc.incomingNumber || ''),
      sourceIncomingDocumentSymbol: doc.code
    }));
    setShowIncomingDocDropdown(false);
    setIncomingDocQuery('');
  };

  const handleUnlinkIncomingDoc = () => {
    setFormData(prev => ({
      ...prev,
      sourceIncomingDocumentId: '',
      sourceIncomingDocumentNumber: '',
      sourceIncomingDocumentSymbol: ''
    }));
  };

  // Auto calculate total area
  const handleLandAreaChange = (val: number) => {
    const land = Math.max(0, val);
    const water = Math.max(0, formData.underwaterAreaHa || 0);
    const tot = Math.round((land + water) * 100) / 100;
    setFormData(prev => ({
      ...prev,
      landAreaHa: land,
      totalAreaHa: tot,
      areaHa: tot
    }));
  };

  const handleUnderwaterAreaChange = (val: number) => {
    const water = Math.max(0, val);
    const land = Math.max(0, formData.landAreaHa || 0);
    const tot = Math.round((land + water) * 100) / 100;
    setFormData(prev => ({
      ...prev,
      underwaterAreaHa: water,
      totalAreaHa: tot,
      areaHa: tot
    }));
  };

  // Coordinate file attachment (.txt, .doc, .docx, .xls, .xlsx)
  const handleCoordinateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const allowed = ['txt', 'doc', 'docx', 'xls', 'xlsx'];
    if (!allowed.includes(ext)) {
      alert('Chỉ hỗ trợ đính kèm tệp tọa độ định dạng: .txt, .doc, .docx, .xls, .xlsx!');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: DocumentAttachment = {
        id: `coord-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext,
        fileUrl: reader.result as string,
        uploadedAt: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        coordinateFiles: [...(prev.coordinateFiles || []), newAtt]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCoordinateFile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      coordinateFiles: (prev.coordinateFiles || []).filter(f => f.id !== id)
    }));
  };

  // Scan file attachment (PDF preferred)
  const handleScanFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    const reader = new FileReader();
    reader.onload = () => {
      const newAtt: DocumentAttachment = {
        id: `scan-${Date.now()}`,
        fileName: file.name,
        fileSize: file.size,
        fileType: ext,
        fileUrl: reader.result as string,
        uploadedAt: new Date().toISOString()
      };
      setFormData(prev => ({
        ...prev,
        scanFiles: [...(prev.scanFiles || []), newAtt]
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteScanFile = (id: string) => {
    setFormData(prev => ({
      ...prev,
      scanFiles: (prev.scanFiles || []).filter(f => f.id !== id)
    }));
  };

  // KML/KMZ upload with auto polygon area calculation
  const handleKmlFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const parsed = await readKmlOrKmzFile(files[0]);
      const currentList = formData.kmlFiles || [];
      const updated = [parsed, ...currentList];

      setFormData(prev => {
        const kmlAreaSum = updated.reduce((sum, f) => sum + (f.totalAreaHa || 0), 0);
        const newLandArea = kmlAreaSum > 0 ? Math.round(kmlAreaSum * 100) / 100 : (prev.landAreaHa || 0);
        const newTotalArea = Math.round((newLandArea + (prev.underwaterAreaHa || 0)) * 100) / 100;

        return {
          ...prev,
          kmlFiles: updated,
          landAreaHa: newLandArea,
          totalAreaHa: newTotalArea,
          areaHa: newTotalArea,
          coordinatesBoundary: parsed.centerCoordinate
            ? `Tọa độ KML (WGS84): ${parsed.centerCoordinate.lat}°N, ${parsed.centerCoordinate.lng}°E`
            : prev.coordinatesBoundary
        };
      });
    } catch (err: any) {
      alert(`Lỗi đọc file KML/KMZ: ${err.message || 'File không hợp lệ'}`);
    }
  };

  const handleGenerateSampleKml = () => {
    const sample = generateSampleKmlFile(formData.name || 'Dự án RPBM', formData.province || 'Quảng Trị');
    const currentList = formData.kmlFiles || [];
    const updated = [sample, ...currentList];

    setFormData(prev => {
      const kmlAreaSum = updated.reduce((sum, f) => sum + (f.totalAreaHa || 0), 0);
      const newLandArea = kmlAreaSum > 0 ? Math.round(kmlAreaSum * 100) / 100 : (prev.landAreaHa || 0);
      const newTotalArea = Math.round((newLandArea + (prev.underwaterAreaHa || 0)) * 100) / 100;

      return {
        ...prev,
        kmlFiles: updated,
        landAreaHa: newLandArea,
        totalAreaHa: newTotalArea,
        areaHa: newTotalArea,
        coordinatesBoundary: `Tọa độ KML Mẫu: ${sample.centerCoordinate?.lat}°N, ${sample.centerCoordinate?.lng}°E`
      };
    });
  };

  const handleDeleteKml = (id: string) => {
    setFormData(prev => ({
      ...prev,
      kmlFiles: (prev.kmlFiles || []).filter(k => k.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Vui lòng nhập Tên dự án và Mã dự án!');
      return;
    }

    // Anti-duplicate project code check
    try {
      const { checkDuplicateProjectCode, validateCompletionAfterStartDate } = require('../../utils/validationRules');
      if (checkDuplicateProjectCode && checkDuplicateProjectCode(formData.code, project?.id)) {
        alert(`❌ Cảnh báo dữ liệu: Mã dự án "${formData.code}" đã tồn tại trên hệ thống! Vui lòng chọn mã dự án khác.`);
        return;
      }

      if (validateCompletionAfterStartDate) {
        const dateCheck = validateCompletionAfterStartDate(formData.startDate, formData.endDate);
        if (!dateCheck.isValid) {
          alert(`❌ Cảnh báo ngày tháng: ${dateCheck.error}`);
          return;
        }
      }
    } catch (err) {
      // Ignore validation helper error if missing
    }

    const totalCalculated = Math.round(((formData.landAreaHa || 0) + (formData.underwaterAreaHa || 0)) * 100) / 100;

    const draft = ensureProjectDefaults({
      id: project?.id || `proj-${Date.now()}`,
      createdAt: project?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...formData,
      totalAreaHa: totalCalculated,
      areaHa: totalCalculated
    });

    const calculatedYear = getProjectYear(draft);
    const fullProject = {
      ...draft,
      projectYear: calculatedYear
    };

    onSave(fullProject);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex justify-between items-center bg-slate-950/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <Building2 className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                {project?.id ? 'Chỉnh sửa thông tin dự án' : 'Khởi tạo Dự án Rà phá Bom mìn mới'}
              </h3>
              <p className="text-[11px] text-slate-400">Khởi tạo và cập nhật đầy đủ thông tin chi tiết dự án</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto text-xs flex-1">
          {/* Section 1: Thông tin chung, Liên kết Văn bản đến & Các đơn vị */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                <Building2 className="w-4 h-4" /> 1. Khởi tạo & Thông tin chung
              </div>
              <span className="text-[10px] text-slate-500 font-mono">1.1 - 1.2</span>
            </div>

            {/* 1.1 Tìm & Liên kết từ Văn bản đến */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                  <Link className="w-4 h-4 text-sky-400" />
                  Liên kết tên dự án từ "Văn bản đến":
                </span>
                {formData.sourceIncomingDocumentId ? (
                  <button
                    type="button"
                    onClick={handleUnlinkIncomingDoc}
                    className="px-2 py-0.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 rounded text-[11px] font-medium flex items-center gap-1 hover:bg-rose-500/20"
                  >
                    <Unlink className="w-3 h-3" /> Hủy liên kết
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-400">Có thể chọn từ VB đến hoặc gõ thủ công</span>
                )}
              </div>

              {formData.sourceIncomingDocumentId ? (
                <div className="p-2 bg-slate-950 border border-sky-500/30 rounded-lg flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-sky-300 font-semibold truncate">
                    <FileText className="w-4 h-4 text-sky-400 shrink-0" />
                    <span>
                      VB đến số <strong>{formData.sourceIncomingDocumentNumber || 'N/A'}</strong> - Ký hiệu:{' '}
                      <strong className="font-mono">{formData.sourceIncomingDocumentSymbol || 'N/A'}</strong>
                    </span>
                  </div>
                  <span className="text-[10px] bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded font-bold">
                    Đã liên kết
                  </span>
                </div>
              ) : (
                <div className="relative">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm Văn bản đến theo Tên/trích yếu, Số đến, Số ký hiệu..."
                      value={incomingDocQuery}
                      onChange={e => {
                        setIncomingDocQuery(e.target.value);
                        setShowIncomingDocDropdown(true);
                      }}
                      onFocus={() => setShowIncomingDocDropdown(true)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 text-xs"
                    />
                  </div>

                  {showIncomingDocDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-30 max-h-48 overflow-y-auto divide-y divide-slate-800">
                      {filteredIncomingDocs.length > 0 ? (
                        filteredIncomingDocs.map(doc => (
                          <div
                            key={doc.id}
                            onClick={() => handleSelectIncomingDoc(doc)}
                            className="p-2.5 hover:bg-slate-800 cursor-pointer text-xs space-y-0.5 transition-colors"
                          >
                            <div className="flex justify-between font-semibold text-slate-200">
                              <span className="text-amber-400 truncate">{doc.title}</span>
                              <span className="text-slate-400 font-mono text-[11px] shrink-0 ml-2">
                                Số {doc.incomingNumberDisplay || doc.incomingNumber} | {doc.code}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              Cơ quan ban hành: {doc.issuer || 'Chưa rõ'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-slate-500 text-center italic text-xs">
                          Không tìm thấy Văn bản đến nào phù hợp
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Mã dự án (*)</label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={e => setFormData({ ...formData, code: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-400 mb-1">Tên dự án (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Rà phá bom mìn Dự án Đường cao tốc..."
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* 1.2 Đổi "Loại dự án" thành "Công tác" */}
              <div>
                <label className="block text-slate-400 mb-1">Công tác (*)</label>
                <select
                  value={formData.workType || 'Thi công'}
                  onChange={e => setFormData({ ...formData, workType: e.target.value, projectType: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                >
                  <option value="Khảo sát">Khảo sát</option>
                  <option value="Giám sát">Giám sát</option>
                  <option value="Thi công">Thi công</option>
                  <option value="Khảo sát và giám sát">Khảo sát và giám sát</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chủ đầu tư (*)</label>
                <input
                  type="text"
                  required
                  placeholder="Sở GTVT / Ban QLDA..."
                  value={formData.investor}
                  onChange={e => setFormData({ ...formData, investor: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Đại diện chủ đầu tư</label>
                <input
                  type="text"
                  value={formData.investorRepresentative || ''}
                  onChange={e => setFormData({ ...formData, investorRepresentative: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Đơn vị thi công (*)</label>
                <input
                  type="text"
                  required
                  value={formData.contractorUnit}
                  onChange={e => setFormData({ ...formData, contractorUnit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Đơn vị tư vấn</label>
                <input
                  type="text"
                  value={formData.consultantUnit || ''}
                  onChange={e => setFormData({ ...formData, consultantUnit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Đơn vị giám sát</label>
                <input
                  type="text"
                  value={formData.supervisorUnit || ''}
                  onChange={e => setFormData({ ...formData, supervisorUnit: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Địa điểm thực hiện & Quy mô khu vực */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <MapPin className="w-4 h-4" /> 2. Địa điểm thực hiện & Quy mô khu vực
              </div>
              <span className="text-[10px] text-slate-500 font-mono">2.1 - 2.3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 2.1 Tỉnh/Thành phố, Xã/Phường, Địa chỉ & Kinh tuyến trục KTT */}
              <div>
                <label className="block text-slate-400 mb-1">Tỉnh, Thành phố (*)</label>
                <input
                  type="text"
                  required
                  value={formData.province}
                  onChange={e => {
                    const newProv = e.target.value;
                    const kttCfg = findKttConfigForProvince(newProv);
                    setFormData(prev => ({
                      ...prev,
                      province: newProv,
                      provinceCode: kttCfg?.provinceCode || prev.provinceCode,
                      centralMeridian: kttCfg?.centralMeridian ?? prev.centralMeridian ?? 106.25,
                      projectionZone: kttCfg?.projectionZone || prev.projectionZone || '3deg',
                      coordinateSystem: kttCfg?.coordinateSystem || prev.coordinateSystem || 'VN-2000'
                    }));
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Xã, Phường (*)</label>
                <input
                  type="text"
                  required
                  value={formData.commune}
                  onChange={e => setFormData({ ...formData, commune: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Địa chỉ / Mô tả chi tiết địa điểm</label>
                <input
                  type="text"
                  placeholder="Thôn, xóm, công trình..."
                  value={formData.location || ''}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Central Meridian KTT Selector */}
              <div className="md:col-span-3">
                <KttSelector
                  provinceName={formData.province || ''}
                  selectedKtt={formData.centralMeridian || 106.25}
                  selectedZone={formData.projectionZone || '3deg'}
                  selectedCoordinateSystem={formData.coordinateSystem || 'VN-2000'}
                  onChange={(ktt, zone, sys, provCode) => {
                    setFormData(prev => ({
                      ...prev,
                      centralMeridian: ktt,
                      projectionZone: zone,
                      coordinateSystem: sys,
                      provinceCode: provCode || prev.provinceCode
                    }));
                  }}
                />
              </div>

              {/* 2.2 Tách Diện tích: trên cạn, dưới nước, tổng (readonly, tự động tính) */}
              <div>
                <label className="block text-slate-400 mb-1">Diện tích trên cạn (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.landAreaHa || 0}
                  onChange={e => handleLandAreaChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-emerald-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Diện tích dưới nước (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.underwaterAreaHa || 0}
                  onChange={e => handleUnderwaterAreaChange(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-sky-400 font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tổng diện tích rà phá (ha) [Tự động tính]</label>
                <input
                  type="number"
                  readOnly
                  value={formData.totalAreaHa || 0}
                  className="w-full bg-slate-950 border border-slate-700/80 rounded px-3 py-1.5 text-amber-400 font-mono font-bold cursor-not-allowed"
                />
              </div>

              {/* 2.3 Mô tả Tọa độ / Ranh giới & Tệp đính kèm tọa độ */}
              <div className="md:col-span-3 space-y-2">
                <label className="block text-slate-400 mb-1">Tọa độ hoặc phạm vi ranh giới (mô tả)</label>
                <input
                  type="text"
                  placeholder="Hệ VN-2000 Múi 3 độ. Tọa độ X: ..., Y: ..."
                  value={formData.coordinatesBoundary || ''}
                  onChange={e => setFormData({ ...formData, coordinatesBoundary: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Tệp đính kèm Tọa độ (.txt, .doc, .docx, .xls, .xlsx) */}
              <div className="md:col-span-3 bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    Đính kèm tệp Tọa độ / Ranh giới (.txt, .doc, .docx, .xls, .xlsx):
                  </span>
                  <div>
                    <input
                      type="file"
                      ref={coordInputRef}
                      accept=".txt,.doc,.docx,.xls,.xlsx"
                      onChange={handleCoordinateFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => coordInputRef.current?.click()}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center gap-1 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> Tải tệp tọa độ
                    </button>
                  </div>
                </div>

                {formData.coordinateFiles && formData.coordinateFiles.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                    {formData.coordinateFiles.map(file => (
                      <div
                        key={file.id}
                        className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">{file.fileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({Math.round(file.fileSize / 1024)} KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300">
                            .{file.fileType}
                          </span>
                          {file.fileUrl && (
                            <a
                              href={file.fileUrl}
                              download={file.fileName}
                              className="text-emerald-400 hover:underline text-[11px]"
                            >
                              Tải
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteCoordinateFile(file.id)}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] italic text-center py-2 bg-slate-950/60 rounded border border-dashed border-slate-800">
                    Chưa đính kèm tệp tọa độ. Hỗ trợ tệp .txt, .doc, .docx, .xls, .xlsx
                  </div>
                )}
              </div>

              {/* KML/KMZ Ranh Vị trí Field */}
              <div className="md:col-span-3 bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200 text-xs flex items-center gap-1.5">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    Đính kèm File KML / KMZ Ranh vị trí:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowBoundaryMapModal(true)}
                      className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white font-semibold rounded text-xs flex items-center gap-1 transition-all"
                    >
                      <Layers className="w-3.5 h-3.5 text-sky-200" /> Bản đồ ranh giới & Vệ tinh
                    </button>
                    <input
                      type="file"
                      ref={kmlInputRef}
                      accept=".kml,.kmz"
                      onChange={handleKmlFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => kmlInputRef.current?.click()}
                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded text-xs flex items-center gap-1 transition-all"
                    >
                      <Upload className="w-3.5 h-3.5" /> Tải file KML/KMZ
                    </button>
                    <button
                      type="button"
                      onClick={handleGenerateSampleKml}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 rounded text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> KML Mẫu
                    </button>
                  </div>
                </div>

                {formData.kmlFiles && formData.kmlFiles.length > 0 ? (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                    {formData.kmlFiles.map(kml => (
                      <div
                        key={kml.id}
                        className="p-2 bg-slate-950 rounded border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-medium text-slate-200 truncate">{kml.fileName}</span>
                          <span className="text-[10px] text-emerald-400 font-mono">({kml.totalAreaHa || 0} ha)</span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300">
                            .{kml.fileType}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteKml(kml.id)}
                            className="text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] italic text-center py-2 bg-slate-950/60 rounded border border-dashed border-slate-800">
                    Chưa đính kèm file KML/KMZ.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Nguồn vốn dự án</label>
                <input
                  type="text"
                  placeholder="NSNN, ODA, Vốn doanh nghiệp..."
                  value={formData.capitalSource || ''}
                  onChange={e => setFormData({ ...formData, capitalSource: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Giá trị hợp đồng, Ngân sách & Thời gian thực hiện */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                <DollarSign className="w-4 h-4" /> 3. Giá trị hợp đồng, Ngân sách & Thời gian
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Mục 3</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Số hợp đồng</label>
                <input
                  type="text"
                  value={formData.contractNumber || ''}
                  onChange={e => setFormData({ ...formData, contractNumber: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Bỏ trường "Tổng mức đầu tư". Giữ "Giá trị hợp đồng" kiêm ngân sách */}
              <div>
                <label className="block text-slate-400 mb-1">Giá trị hợp đồng (VNĐ) (*)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000000"
                  value={formData.contractValue || 0}
                  onChange={e => {
                    const val = Math.max(0, Number(e.target.value));
                    setFormData({ ...formData, contractValue: val, budgetVnd: val });
                  }}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Hiển thị: {formatVND(formData.contractValue || 0)}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Giá trị phần việc RPBM (VNĐ)</label>
                <input
                  type="number"
                  min="0"
                  step="1000000"
                  value={formData.rpbmValue || 0}
                  onChange={e => setFormData({ ...formData, rpbmValue: Math.max(0, Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Hiển thị: {formatVND(formData.rpbmValue || 0)}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ngày ký hợp đồng</label>
                <input
                  type="date"
                  value={formData.contractSigningDate || ''}
                  onChange={e => setFormData({ ...formData, contractSigningDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ngày khởi công (*)</label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Hạn hoàn thành (*)</label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Trạng thái & Nhân sự chỉ huy */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                <UserCheck className="w-4 h-4" /> 4. Trạng thái dự án & Nhân sự chỉ huy
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Mục 4</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* 4.1 Thêm "Đang trình thẩm định" */}
              <div>
                <label className="block text-slate-400 mb-1">Trạng thái dự án (*)</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as ProjectStatus })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(PROJECT_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>
                      {val.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Tỷ lệ hoàn thành (%) (*)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  value={formData.progressPercent}
                  onChange={e => setFormData({ ...formData, progressPercent: Number(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-emerald-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Chỉ huy trưởng công trường (*)</label>
                <input
                  type="text"
                  required
                  value={formData.commanderName}
                  onChange={e => setFormData({ ...formData, commanderName: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <ProjectManagerCombobox
                  selectedId={formData.responsibleUserId || formData.projectManagerId}
                  selectedName={formData.responsibleName || formData.projectManager}
                  onChange={data => {
                    setFormData(prev => ({
                      ...prev,
                      responsibleUserId: data.id,
                      responsiblePersonId: data.responsiblePersonId,
                      responsibleName: data.name,
                      responsibleRank: data.rank,
                      responsiblePosition: data.position,
                      responsibleEmail: data.email,

                      projectManagerId: data.id,
                      projectManager: data.name,
                      projectManagerRank: data.rank,
                      projectManagerPosition: data.position,
                      projectManagerUnit: data.unit,
                      projectManagerEmail: data.email
                    }));
                  }}
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Quy mô lực lượng (chiến sĩ)</label>
                <input
                  type="number"
                  min="1"
                  value={formData.teamSize || 15}
                  onChange={e => setFormData({ ...formData, teamSize: Math.max(1, Number(e.target.value)) })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Section 5: Hồ sơ scan của dự án & Google Drive */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-teal-400 font-bold text-sm">
                <FileCheck className="w-4 h-4" /> 5. Hồ sơ scan của dự án & Lưu trữ Drive
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Mục 5</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-slate-400 mb-1">Đính kèm Hồ sơ scan dự án (ưu tiên PDF)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={scanInputRef}
                    accept=".pdf,.doc,.docx,.zip,.rar"
                    onChange={handleScanFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => scanInputRef.current?.click()}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" /> Tải tệp Hồ sơ scan (PDF)
                  </button>
                  <span className="text-[11px] text-slate-400">Được mã hóa lưu trữ an toàn</span>
                </div>

                {formData.scanFiles && formData.scanFiles.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pt-2">
                    {formData.scanFiles.map(file => (
                      <div
                        key={file.id}
                        className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <FileText className="w-4 h-4 text-teal-400 shrink-0" />
                          <span className="font-semibold text-slate-200 truncate">{file.fileName}</span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ({Math.round(file.fileSize / 1024)} KB)
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-teal-500/20 text-teal-300">
                            .{file.fileType}
                          </span>
                          {file.fileUrl && (
                            <a
                              href={file.fileUrl}
                              download={file.fileName}
                              className="text-teal-300 hover:underline text-[11px] font-medium"
                            >
                              Xem / Tải
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDeleteScanFile(file.id)}
                            className="text-slate-400 hover:text-rose-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-500 text-[11px] italic text-center py-2 mt-2 bg-slate-900/60 rounded border border-dashed border-slate-800">
                    Chưa đính kèm hồ sơ scan. Nhấn "Tải tệp Hồ sơ scan" để đưa bản scan PDF lên hệ thống.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Link thư mục Google Drive dự án</label>
                <input
                  type="text"
                  placeholder="https://drive.google.com/drive/folders/..."
                  value={formData.driveFolderUrl || ''}
                  onChange={e => setFormData({ ...formData, driveFolderUrl: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ghi chú & Yêu cầu chỉ đạo</label>
                <textarea
                  rows={2}
                  placeholder="Nhập ghi chú quan trọng hoặc chỉ đạo khẩn..."
                  value={formData.notes || ''}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-sm transition-colors"
            >
              Lưu thông tin dự án
            </button>
          </div>
        </form>

        {/* Interactive Satellite Boundary Map Modal */}
        {showBoundaryMapModal && (
          <KmlBoundaryViewerModal
            project={{
              ...(formData as Project),
              id: project?.id || `proj-temp-${Date.now()}`,
              name: formData.name || 'Dự án mới',
              code: formData.code || 'DA-NEW',
              province: formData.province || 'Quảng Trị',
              centralMeridian: formData.centralMeridian || 106.25,
              projectionZone: formData.projectionZone || '3deg',
              coordinateSystem: formData.coordinateSystem || 'VN-2000',
              kmlFiles: formData.kmlFiles || []
            }}
            isOpen={showBoundaryMapModal}
            onClose={() => setShowBoundaryMapModal(false)}
            onUpdateProjectKml={(updatedKmls) => {
              setFormData(prev => {
                const kmlAreaSum = updatedKmls.reduce((sum, f) => sum + (f.totalAreaHa || 0), 0);
                const newLandArea = kmlAreaSum > 0 ? Math.round(kmlAreaSum * 100) / 100 : (prev.landAreaHa || 0);
                const newTotalArea = Math.round((newLandArea + (prev.underwaterAreaHa || 0)) * 100) / 100;
                return {
                  ...prev,
                  kmlFiles: updatedKmls,
                  landAreaHa: newLandArea,
                  totalAreaHa: newTotalArea,
                  areaHa: newTotalArea
                };
              });
            }}
          />
        )}
      </div>
    </div>
  );
};
