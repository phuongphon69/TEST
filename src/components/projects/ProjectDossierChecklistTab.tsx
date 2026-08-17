import React, { useState, useRef } from 'react';
import { Project, ProjectDossierItem, DossierStatus } from '../../types';
import { DOSSIER_STATUS_MAP, formatDateVN } from '../../utils/formatters';
import { STANDARD_DOSSIER_CATEGORIES } from '../../utils/projectDefaults';
import { getCurrentUser } from '../../utils/storage';
import {
  FileCheck,
  Search,
  Filter,
  ExternalLink,
  Edit2,
  Save,
  CheckSquare,
  Upload,
  Download,
  Trash2,
  FileText,
  UserCheck,
  Calendar,
  Eye,
  Paperclip
} from 'lucide-react';

interface Props {
  project: Project;
  onUpdateDossiers: (dossiers: ProjectDossierItem[]) => void;
}

export const ProjectDossierChecklistTab: React.FC<Props> = ({ project, onUpdateDossiers }) => {
  const currentUser = getCurrentUser();

  // Ensure all 13 standard categories are present
  const existingDossiers = project.dossiers || [];
  const normalizedDossiers: ProjectDossierItem[] = STANDARD_DOSSIER_CATEGORIES.map((category, index) => {
    // Find matching existing dossier item by category or by position
    const found = existingDossiers.find(d => d.category.toLowerCase().trim() === category.toLowerCase().trim()) || existingDossiers[index];
    
    // Map legacy status if any
    let status: DossierStatus = 'chua_co';
    if (found?.status) {
      if (found.status === 'da_hoan_thien' || found.status === 'da_ky') status = 'da_co';
      else if (found.status === 'can_bo_sung' || found.status === 'dang_chuan_bi') status = 'dang_bo_sung';
      else if (found.status === 'het_hieu_luc') status = 'khong_ap_dung';
      else status = found.status as DossierStatus;
    }

    return {
      id: found?.id || `dos-${index + 1}`,
      category,
      status,
      documentCode: found?.documentCode || `${index + 1 > 9 ? index + 1 : '0' + (index + 1)}/HS-RPBM`,
      issueDate: found?.issueDate || '',
      note: found?.note || '',
      fileUrl: found?.fileUrl || '',
      fileName: found?.fileName || '',
      fileSize: found?.fileSize || undefined,
      fileType: found?.fileType || '',
      updatedAt: found?.updatedAt || new Date().toISOString().split('T')[0],
      updatedBy: found?.updatedBy || 'Cán bộ hồ sơ'
    };
  });

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<ProjectDossierItem>>({});
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadId, setActiveUploadId] = useState<string | null>(null);

  // Completion calculation
  const completedCount = normalizedDossiers.filter(d => d.status === 'da_co' || d.status === 'khong_ap_dung').length;
  const totalCount = normalizedDossiers.length; // 13 items
  const completionRate = Math.round((completedCount / totalCount) * 100);

  const filteredDossiers = normalizedDossiers.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.category.toLowerCase().includes(q) ||
        (d.documentCode && d.documentCode.toLowerCase().includes(q)) ||
        (d.note && d.note.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const handleStartEdit = (d: ProjectDossierItem) => {
    setEditingId(d.id);
    setEditForm({ ...d });
  };

  const handleSaveEdit = (id: string) => {
    const updated = normalizedDossiers.map(d => {
      if (d.id === id) {
        return {
          ...d,
          ...editForm,
          updatedAt: new Date().toISOString().split('T')[0],
          updatedBy: currentUser.name || 'Cán bộ hồ sơ'
        } as ProjectDossierItem;
      }
      return d;
    });
    onUpdateDossiers(updated);
    setEditingId(null);
    setEditForm({});
  };

  const handleQuickStatusChange = (id: string, newStatus: DossierStatus) => {
    const updated = normalizedDossiers.map(d =>
      d.id === id
        ? {
            ...d,
            status: newStatus,
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: currentUser.name || 'Cán bộ hồ sơ'
          }
        : d
    );
    onUpdateDossiers(updated);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    const reader = new FileReader();
    reader.onload = () => {
      const fileUrl = reader.result as string;
      const updated = normalizedDossiers.map(d =>
        d.id === id
          ? {
              ...d,
              fileUrl,
              fileName: file.name,
              fileSize: file.size,
              fileType: ext,
              status: d.status === 'chua_co' ? ('da_co' as DossierStatus) : d.status,
              updatedAt: new Date().toISOString().split('T')[0],
              updatedBy: currentUser.name || 'Cán bộ hồ sơ'
            }
          : d
      );
      onUpdateDossiers(updated);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveFile = (id: string) => {
    const updated = normalizedDossiers.map(d =>
      d.id === id
        ? {
            ...d,
            fileUrl: '',
            fileName: '',
            fileSize: undefined,
            fileType: '',
            updatedAt: new Date().toISOString().split('T')[0],
            updatedBy: currentUser.name || 'Cán bộ hồ sơ'
          }
        : d
    );
    onUpdateDossiers(updated);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={uploadInputRef}
        className="hidden"
        onChange={e => {
          if (activeUploadId) {
            handleFileUpload(e, activeUploadId);
          }
        }}
      />

      {/* Header & Overall Progress */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-lg">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-amber-400" />
            7.5 Danh mục Hồ sơ & Quy trình Checklist Dự án (13 Hạng mục)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý và cập nhật tiến độ 13 hạng mục hồ sơ pháp lý, kỹ thuật, nghiệm thu và thanh quyết toán theo quy định BQP.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-950 p-3.5 rounded-xl border border-slate-800 text-xs">
          <div>
            <div className="text-slate-400 text-[11px] font-medium">Tiến độ hoàn thành Checklist:</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              {completedCount}/{totalCount} <span className="text-xs text-slate-300">({completionRate}%)</span>
            </div>
          </div>
          <div className="w-28 bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${completionRate}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Filter & Search Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm kiếm danh mục, mã văn bản hoặc ghi chú..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="chua_co">Chưa có</option>
            <option value="da_co">Đã có</option>
            <option value="dang_bo_sung">Đang bổ sung</option>
            <option value="khong_ap_dung">Không áp dụng</option>
          </select>
        </div>
      </div>

      {/* Checklist Table */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 overflow-x-auto shadow-xl">
        <table className="w-full text-left text-xs text-slate-300 min-w-[950px]">
          <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800 text-[11px]">
            <tr>
              <th className="p-3 w-12 text-center">STT</th>
              <th className="p-3">Danh mục loại hồ sơ (13 mục)</th>
              <th className="p-3 w-36">Trạng thái</th>
              <th className="p-3">Tệp đính kèm</th>
              <th className="p-3">Ghi chú</th>
              <th className="p-3 w-36">Cập nhật</th>
              <th className="p-3 text-right w-24">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {filteredDossiers.map((item, idx) => {
              const isEditing = editingId === item.id;
              const statusConfig = DOSSIER_STATUS_MAP[item.status] || {
                label: item.status,
                classNames: 'bg-slate-800 text-slate-400'
              };

              return (
                <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 text-center font-mono text-slate-500 font-bold">{idx + 1}</td>

                  {/* Category Name */}
                  <td className="p-3 font-semibold text-slate-100 max-w-xs">
                    <div className="flex items-start gap-2">
                      <CheckSquare className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span>{item.category}</span>
                        {item.documentCode && (
                          <div className="text-[10px] text-slate-500 font-mono font-normal">
                            Số hiệu: {item.documentCode}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Status Dropdown */}
                  <td className="p-3">
                    <select
                      value={item.status}
                      onChange={e => handleQuickStatusChange(item.id, e.target.value as DossierStatus)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold border focus:outline-none cursor-pointer ${statusConfig.classNames}`}
                    >
                      <option value="chua_co" className="bg-slate-900 text-slate-300">
                        Chưa có
                      </option>
                      <option value="da_co" className="bg-slate-900 text-emerald-300">
                        Đã có
                      </option>
                      <option value="dang_bo_sung" className="bg-slate-900 text-amber-300">
                        Đang bổ sung
                      </option>
                      <option value="khong_ap_dung" className="bg-slate-900 text-slate-400">
                        Không áp dụng
                      </option>
                    </select>
                  </td>

                  {/* Attached File & Actions */}
                  <td className="p-3">
                    {item.fileUrl ? (
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between gap-2 max-w-xs">
                        <div className="flex items-center gap-1.5 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="text-slate-200 text-xs font-medium truncate" title={item.fileName || 'Tệp đính kèm'}>
                            {item.fileName || 'Tệp đính kèm'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <a
                            href={item.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1 hover:bg-slate-800 text-sky-400 rounded"
                            title="Xem tệp"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <a
                            href={item.fileUrl}
                            download={item.fileName || 'ho_so.pdf'}
                            className="p-1 hover:bg-slate-800 text-emerald-400 rounded"
                            title="Tải tệp"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleRemoveFile(item.id)}
                            className="p-1 hover:bg-slate-800 text-rose-400 rounded"
                            title="Xóa tệp"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setActiveUploadId(item.id);
                          uploadInputRef.current?.click();
                        }}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5 text-amber-400" />
                        Đính kèm file
                      </button>
                    )}
                  </td>

                  {/* Note */}
                  <td className="p-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editForm.note || ''}
                        onChange={e => setEditForm({ ...editForm, note: e.target.value })}
                        className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-slate-200 w-full"
                        placeholder="Nhập ghi chú..."
                      />
                    ) : (
                      <span className="text-slate-400 italic text-[11px] block truncate max-w-xs">
                        {item.note || '--'}
                      </span>
                    )}
                  </td>

                  {/* Update date & updater */}
                  <td className="p-3 text-[11px] text-slate-400 font-mono">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDateVN(item.updatedAt || new Date())}
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 text-[10px]">
                        <UserCheck className="w-3 h-3 text-slate-600" />
                        {item.updatedBy || 'N/A'}
                      </span>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="p-3 text-right">
                    {isEditing ? (
                      <button
                        onClick={() => handleSaveEdit(item.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-1 text-xs transition-colors ml-auto"
                      >
                        <Save className="w-3.5 h-3.5" /> Lưu
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStartEdit(item)}
                        className="p-1.5 text-amber-400 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors"
                        title="Chỉnh sửa chi tiết"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
