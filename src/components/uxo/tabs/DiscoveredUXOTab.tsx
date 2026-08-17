import React, { useState } from 'react';
import {
  Archive,
  Plus,
  Search,
  FileCheck,
  Building2,
  Calendar,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  CheckCircle2,
  Image as ImageIcon,
  UserCheck,
  X,
  Lock
} from 'lucide-react';
import { UXODiscoveryDossier, DiscoveryDossierStatus, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  dossiers: UXODiscoveryDossier[];
  projects: Project[];
  onSaveDossier: (dossier: UXODiscoveryDossier) => void;
  onDeleteDossier: (id: string) => void;
}

const DOSSIER_STATUS_MAP: Record<DiscoveryDossierStatus, { label: string; color: string }> = {
  moi_phat_hien: { label: 'Mới phát hiện', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  cho_phe_duyet: { label: 'Chờ phê duyệt', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  da_ban_giao: { label: 'Đã bàn giao đơn vị quân sự', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  da_xu_ly: { label: 'Đã xử lý an toàn', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  da_luu_ho_so: { label: 'Đã lưu hồ sơ hoàn công', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
};

export const DiscoveredUXOTab: React.FC<Props> = ({
  dossiers,
  projects,
  onSaveDossier,
  onDeleteDossier
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingDossier, setViewingDossier] = useState<UXODiscoveryDossier | null>(null);
  const [editingDossier, setEditingDossier] = useState<UXODiscoveryDossier | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredDossiers = dossiers.filter(d => {
    if (selectedProjectId !== 'all' && d.projectId !== selectedProjectId) return false;
    if (selectedStatus !== 'all' && d.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        d.dossierCode.toLowerCase().includes(q) ||
        d.objectType.toLowerCase().includes(q) ||
        d.location.toLowerCase().includes(q) ||
        d.receivingOrDisposalUnit.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenForm = (dossier?: UXODiscoveryDossier) => {
    if (dossier) {
      setEditingDossier(dossier);
    } else {
      const defaultProj = projects[0];
      setEditingDossier({
        id: `disc-${Date.now()}`,
        dossierCode: `HS-VT-2026-0${dossiers.length + 1}`,
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        location: 'Khu vực 1 - Ô A1-03',
        detectionDate: new Date().toISOString().split('T')[0],
        objectType: 'Đạn pháo 105mm (Phân loại theo danh mục Bộ Quốc phòng)',
        quantity: 1,
        condition: 'Gỉ sét nặng, không ngòi nổ',
        receivingOrDisposalUnit: 'Bộ CHQS Tỉnh Quảng Trị / Ban Công binh',
        handoverTime: `${new Date().toISOString().split('T')[0]} 16:00`,
        preparer: 'Đại úy Trần Văn Mạnh',
        inspector: 'Thiếu tá Lê Minh Tuấn',
        approver: defaultProj?.commanderName || 'Thượng tá Nguyễn Văn Hùng',
        status: 'moi_phat_hien'
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDossier) return;
    const proj = projects.find(p => p.id === editingDossier.projectId);
    const finalItem: UXODiscoveryDossier = {
      ...editingDossier,
      projectName: proj ? proj.name : editingDossier.projectName
    };
    onSaveDossier(finalItem);
    setShowModal(false);
    setEditingDossier(null);
  };

  return (
    <div className="space-y-6">
      {/* Safety Compliance Notice */}
      <div className="bg-sky-950/40 border border-sky-500/30 p-4 rounded-2xl flex items-start gap-3">
        <ShieldCheck className="w-6 h-6 text-sky-400 shrink-0 mt-0.5" />
        <div className="text-xs text-sky-200/90 leading-relaxed">
          <strong className="text-sky-300 font-bold block uppercase text-[11px] tracking-wider mb-0.5">
            Quản lý Hồ sơ Hồ sơ Bàn giao & Tiêu hủy Vật thể / Vật nổ
          </strong>
          Phân hệ chỉ phục vụ lưu trữ quản lý hồ sơ bàn giao, biên bản nghiệm thu và chứng nhận an toàn giữa đơn vị thi công và cơ quan quân sự chuyên trách. Không chứa thông tin chế tạo hoặc kỹ thuật nguy hiểm.
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Archive className="w-5 h-5 text-amber-400" /> 8.5. Hồ sơ Vật thể & Vật nổ Phát hiện
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Phân loại theo danh mục BQP, số lượng, tình trạng, đơn vị tiếp nhận, biên bản bàn giao & hủy nổ.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Lập hồ sơ phát hiện mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedProjectId}
            onChange={e => setSelectedProjectId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-72"
          >
            <option value="all">Tất cả dự án</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-52"
          >
            <option value="all">Tất cả trạng thái hồ sơ</option>
            {Object.entries(DOSSIER_STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã HS, Chủng loại, Đơn vị tiếp nhận..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDossiers.map(dossier => {
          const statusInfo = DOSSIER_STATUS_MAP[dossier.status];

          return (
            <div
              key={dossier.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex justify-between items-start gap-2 border-b border-slate-800 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {dossier.dossierCode}
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{dossier.objectType}</h4>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shrink-0 ${statusInfo.color}`}>
                  {statusInfo.label}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 text-[10px]">Dự án:</span>
                  <p className="font-semibold text-slate-200 line-clamp-1 mt-0.5">{dossier.projectName}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Vị trí:</span>
                  <p className="font-semibold text-emerald-400 line-clamp-1 mt-0.5">{dossier.location}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Số lượng phát hiện:</span>
                  <p className="font-bold text-amber-400 font-mono mt-0.5">{dossier.quantity} quả/vật</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px]">Ngày phát hiện:</span>
                  <p className="font-mono text-slate-200 mt-0.5">{formatDateVN(dossier.detectionDate)}</p>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs space-y-1">
                <div><strong className="text-slate-400">Đơn vị tiếp nhận / xử lý:</strong> <span className="text-slate-200 font-medium">{dossier.receivingOrDisposalUnit}</span></div>
                <div><strong className="text-slate-400">Tình trạng:</strong> <span className="text-slate-300">{dossier.condition}</span></div>
                <div><strong className="text-slate-400">Người lập / Phê duyệt:</strong> <span className="text-slate-300">{dossier.preparer} / {dossier.approver}</span></div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-3">
                  {dossier.handoverMinutesUrl && (
                    <a href={dossier.handoverMinutesUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                      <FileCheck className="w-3.5 h-3.5" /> Biên bản bàn giao
                    </a>
                  )}
                  {dossier.disposalMinutesUrl && (
                    <a href={dossier.disposalMinutesUrl} target="_blank" rel="noreferrer" className="text-sky-400 hover:underline flex items-center gap-1 font-semibold text-[11px]">
                      <FileCheck className="w-3.5 h-3.5" /> Biên bản hủy nổ
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingDossier(dossier)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenForm(dossier)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa hồ sơ "${dossier.dossierCode}"?`)) onDeleteDossier(dossier.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDossiers.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
          <Archive className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-semibold text-sm">Chưa có hồ sơ phát hiện vật thể/vật nổ nào.</div>
        </div>
      )}

      {/* Modal View Detail */}
      {viewingDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded border border-amber-500/20">
                  {viewingDossier.dossierCode}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{viewingDossier.objectType}</h3>
              </div>
              <button onClick={() => setViewingDossier(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong className="text-slate-400">Dự án:</strong> <p className="text-slate-200 mt-0.5">{viewingDossier.projectName}</p></div>
              <div><strong className="text-slate-400">Vị trí:</strong> <p className="text-emerald-400 font-bold mt-0.5">{viewingDossier.location}</p></div>
              <div><strong className="text-slate-400">Số lượng:</strong> <p className="text-amber-400 font-mono font-bold mt-0.5">{viewingDossier.quantity} quả</p></div>
              <div><strong className="text-slate-400">Ngày phát hiện:</strong> <p className="text-slate-200 font-mono mt-0.5">{formatDateVN(viewingDossier.detectionDate)}</p></div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><strong className="text-slate-300">Tình trạng thực tế:</strong> {viewingDossier.condition}</div>
              <div><strong className="text-slate-300">Đơn vị tiếp nhận / Hủy nổ:</strong> {viewingDossier.receivingOrDisposalUnit}</div>
              <div><strong className="text-slate-300">Thời gian bàn giao:</strong> {viewingDossier.handoverTime || 'Đã ghi nhận'}</div>
              <div><strong className="text-slate-300">Cán bộ lập / Phê duyệt:</strong> {viewingDossier.preparer} / {viewingDossier.approver}</div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setViewingDossier(null)} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-200">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && editingDossier && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Archive className="w-5 h-5" /> Lập / Cập nhật Hồ sơ Phát hiện
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã hồ sơ *</label>
                <input
                  type="text"
                  required
                  value={editingDossier.dossierCode}
                  onChange={e => setEditingDossier({ ...editingDossier, dossierCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Dự án *</label>
                <select
                  value={editingDossier.projectId}
                  onChange={e => {
                    const proj = projects.find(p => p.id === e.target.value);
                    setEditingDossier({
                      ...editingDossier,
                      projectId: e.target.value,
                      projectName: proj ? proj.name : ''
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Chủng loại (Phân loại theo BQP) *</label>
                <input
                  type="text"
                  required
                  value={editingDossier.objectType}
                  onChange={e => setEditingDossier({ ...editingDossier, objectType: e.target.value })}
                  placeholder="e.g. Đạn pháo 105mm, Cối 81mm, Mìn cá nhân..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số lượng</label>
                <input
                  type="number"
                  value={editingDossier.quantity}
                  onChange={e => setEditingDossier({ ...editingDossier, quantity: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày phát hiện</label>
                <input
                  type="date"
                  value={editingDossier.detectionDate}
                  onChange={e => setEditingDossier({ ...editingDossier, detectionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Vị trí phát hiện</label>
                <input
                  type="text"
                  value={editingDossier.location}
                  onChange={e => setEditingDossier({ ...editingDossier, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Đơn vị tiếp nhận / Hủy nổ</label>
                <input
                  type="text"
                  value={editingDossier.receivingOrDisposalUnit}
                  onChange={e => setEditingDossier({ ...editingDossier, receivingOrDisposalUnit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Trạng thái hồ sơ</label>
                <select
                  value={editingDossier.status}
                  onChange={e => setEditingDossier({ ...editingDossier, status: e.target.value as DiscoveryDossierStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(DOSSIER_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Tình trạng thực tế</label>
                <textarea
                  rows={2}
                  value={editingDossier.condition}
                  onChange={e => setEditingDossier({ ...editingDossier, condition: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-lg"
              >
                Lưu hồ sơ
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
