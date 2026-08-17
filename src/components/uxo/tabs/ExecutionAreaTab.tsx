import React, { useState } from 'react';
import {
  MapPin,
  Plus,
  Search,
  Map,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Layers,
  Image as ImageIcon,
  UserCheck,
  X
} from 'lucide-react';
import { ExecutionArea, AreaPollutionLevel, AreaExecutionStatus, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  areas: ExecutionArea[];
  projects: Project[];
  onSaveArea: (area: ExecutionArea) => void;
  onDeleteArea: (id: string) => void;
}

const POLLUTION_LEVEL_MAP: Record<AreaPollutionLevel, { label: string; color: string }> = {
  thap: { label: 'Thấp', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  trung_binh: { label: 'Trung bình', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  cao: { label: 'Cao', color: 'bg-orange-500/10 text-orange-400 border-orange-500/30' },
  rat_cao: { label: 'Rất cao', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

const AREA_STATUS_MAP: Record<AreaExecutionStatus, { label: string; color: string }> = {
  chua_thi_cong: { label: 'Chưa thi công', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  dang_thi_cong: { label: 'Đang thi công', color: 'bg-sky-500/10 text-sky-400 border-sky-500/30' },
  cho_kiem_tra: { label: 'Chờ kiểm tra', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  cho_nghiem_thu: { label: 'Chờ nghiệm thu', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  da_hoan_thanh: { label: 'Đã hoàn thành', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  khong_dat: { label: 'Không đạt (Thi công lại)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

export const ExecutionAreaTab: React.FC<Props> = ({
  areas,
  projects,
  onSaveArea,
  onDeleteArea
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [editingArea, setEditingArea] = useState<ExecutionArea | null>(null);
  const [viewingArea, setViewingArea] = useState<ExecutionArea | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Filtered areas
  const filtered = areas.filter(a => {
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.projectName.toLowerCase().includes(q) ||
        a.location.toLowerCase().includes(q) ||
        a.manager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenForm = (area?: ExecutionArea) => {
    if (area) {
      setEditingArea(area);
    } else {
      const defaultProj = projects[0];
      setEditingArea({
        id: `area-${Date.now()}`,
        code: `KV-NEW-${areas.length + 1}`,
        name: '',
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        location: defaultProj?.location || defaultProj?.province || '',
        coordinates: '',
        areaHa: 10.0,
        terrain: 'Đồi núi trung bình',
        pollutionLevel: 'cao',
        surveyMethod: 'Dò nông 0.3m & Dò sâu 3.0m',
        handoverDate: new Date().toISOString().split('T')[0],
        executionDate: new Date().toISOString().split('T')[0],
        status: 'chua_thi_cong',
        manager: defaultProj?.commanderName || 'Thượng tá Nguyễn Văn Hùng',
        fieldPhotos: []
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingArea) return;
    const proj = projects.find(p => p.id === editingArea.projectId);
    const finalItem: ExecutionArea = {
      ...editingArea,
      projectName: proj ? proj.name : editingArea.projectName
    };
    onSaveArea(finalItem);
    setShowModal(false);
    setEditingArea(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-400" /> 8.1. Quản lý Khu vực Thi công RPBM
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý mã khu vực, vị trí, tọa độ, diện tích, địa hình, mức độ ô nhiễm, người phụ trách và bản đồ số.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Thêm khu vực mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã, Tên khu vực, Vị trí, Người phụ trách..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">Tất cả trạng thái thi công</option>
            {Object.entries(AREA_STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(area => {
          const pollution = POLLUTION_LEVEL_MAP[area.pollutionLevel];
          const status = AREA_STATUS_MAP[area.status];

          return (
            <div
              key={area.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {area.code}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${status.color}`}>
                    {status.label}
                  </span>
                </div>

                <h4
                  onClick={() => setViewingArea(area)}
                  className="text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer line-clamp-2 transition-colors"
                >
                  {area.name}
                </h4>

                <div className="text-xs text-slate-400 space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{area.projectName}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{area.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Phụ trách: <strong className="text-slate-200">{area.manager}</strong></span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Diện tích</div>
                    <div className="font-bold text-emerald-400">{area.areaHa} ha</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Mức độ ô nhiễm</div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border inline-block mt-0.5 ${pollution.color}`}>
                      {pollution.label}
                    </span>
                  </div>
                </div>

                {/* Terrain & Method */}
                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1">
                  <div><strong className="text-slate-300">Địa hình:</strong> {area.terrain}</div>
                  <div><strong className="text-slate-300">Khảo sát:</strong> {area.surveyMethod}</div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  {area.digitalMapLink && (
                    <a
                      href={area.digitalMapLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                    >
                      <Map className="w-3.5 h-3.5" /> Bản đồ số
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingArea(area)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenForm(area)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Xóa khu vực "${area.name}"?`)) onDeleteArea(area.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
          <MapPin className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-semibold text-sm">Chưa có khu vực thi công nào phù hợp.</div>
        </div>
      )}

      {/* Modal View Detail */}
      {viewingArea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {viewingArea.code}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{viewingArea.name}</h3>
              </div>
              <button onClick={() => setViewingArea(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400">Thuộc dự án:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingArea.projectName}</p>
              </div>
              <div>
                <span className="text-slate-400">Vị trí:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingArea.location}</p>
              </div>
              <div>
                <span className="text-slate-400">Tọa độ GPS:</span>
                <p className="font-mono text-emerald-400 font-bold mt-0.5">{viewingArea.coordinates || 'Chưa cập nhật'}</p>
              </div>
              <div>
                <span className="text-slate-400">Diện tích:</span>
                <p className="font-mono text-amber-400 font-bold mt-0.5">{viewingArea.areaHa} ha</p>
              </div>
              <div>
                <span className="text-slate-400">Ngày bàn giao:</span>
                <p className="font-mono text-slate-200 mt-0.5">{formatDateVN(viewingArea.handoverDate)}</p>
              </div>
              <div>
                <span className="text-slate-400">Ngày thi công:</span>
                <p className="font-mono text-slate-200 mt-0.5">{formatDateVN(viewingArea.executionDate)}</p>
              </div>
              <div>
                <span className="text-slate-400">Người phụ trách:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingArea.manager}</p>
              </div>
              <div>
                <span className="text-slate-400">Trạng thái:</span>
                <p className="mt-0.5">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold border ${AREA_STATUS_MAP[viewingArea.status].color}`}>
                    {AREA_STATUS_MAP[viewingArea.status].label}
                  </span>
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><strong className="text-slate-300">Địa hình:</strong> {viewingArea.terrain}</div>
              <div><strong className="text-slate-300">Phương pháp khảo sát:</strong> {viewingArea.surveyMethod}</div>
              {viewingArea.notes && <div><strong className="text-slate-300">Ghi chú:</strong> {viewingArea.notes}</div>}
            </div>

            {viewingArea.fieldPhotos && viewingArea.fieldPhotos.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2 flex items-center gap-1.5">
                  <ImageIcon className="w-4 h-4 text-sky-400" /> Ảnh hiện trường ({viewingArea.fieldPhotos.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {viewingArea.fieldPhotos.map((imgUrl, idx) => (
                    <img key={idx} src={imgUrl} alt={`Field ${idx}`} className="rounded-xl border border-slate-800 object-cover h-36 w-full" />
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setViewingArea(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-200 font-medium">
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {showModal && editingArea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {editingArea.id.startsWith('area-') && areas.some(a => a.id === editingArea.id) ? 'Cập nhật Khu vực thi công' : 'Thêm Khu vực thi công mới'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã khu vực *</label>
                <input
                  type="text"
                  required
                  value={editingArea.code}
                  onChange={e => setEditingArea({ ...editingArea, code: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Dự án *</label>
                <select
                  value={editingArea.projectId}
                  onChange={e => {
                    const proj = projects.find(p => p.id === e.target.value);
                    setEditingArea({
                      ...editingArea,
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
                <label className="block font-semibold text-slate-300 mb-1">Tên khu vực *</label>
                <input
                  type="text"
                  required
                  value={editingArea.name}
                  onChange={e => setEditingArea({ ...editingArea, name: e.target.value })}
                  placeholder="e.g. Khu vực 1 - Đoạn Km 12+000 đến Km 20+000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vị trí địa lý</label>
                <input
                  type="text"
                  value={editingArea.location}
                  onChange={e => setEditingArea({ ...editingArea, location: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tọa độ GPS</label>
                <input
                  type="text"
                  value={editingArea.coordinates}
                  onChange={e => setEditingArea({ ...editingArea, coordinates: e.target.value })}
                  placeholder='16°52"48.2"N 106°55"12.4"E'
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Diện tích (ha)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingArea.areaHa}
                  onChange={e => setEditingArea({ ...editingArea, areaHa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mức độ ô nhiễm dự kiến</label>
                <select
                  value={editingArea.pollutionLevel}
                  onChange={e => setEditingArea({ ...editingArea, pollutionLevel: e.target.value as AreaPollutionLevel })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="thap">Thấp</option>
                  <option value="trung_binh">Trung bình</option>
                  <option value="cao">Cao</option>
                  <option value="rat_cao">Rất cao</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Trạng thái thi công</label>
                <select
                  value={editingArea.status}
                  onChange={e => setEditingArea({ ...editingArea, status: e.target.value as AreaExecutionStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(AREA_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Người phụ trách *</label>
                <input
                  type="text"
                  required
                  value={editingArea.manager}
                  onChange={e => setEditingArea({ ...editingArea, manager: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày bàn giao</label>
                <input
                  type="date"
                  value={editingArea.handoverDate}
                  onChange={e => setEditingArea({ ...editingArea, handoverDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày bắt đầu thi công</label>
                <input
                  type="date"
                  value={editingArea.executionDate}
                  onChange={e => setEditingArea({ ...editingArea, executionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Địa hình khu vực</label>
                <input
                  type="text"
                  value={editingArea.terrain}
                  onChange={e => setEditingArea({ ...editingArea, terrain: e.target.value })}
                  placeholder="e.g. Đồi núi thấp, đồi keo lá tràm"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Phương pháp khảo sát</label>
                <input
                  type="text"
                  value={editingArea.surveyMethod}
                  onChange={e => setEditingArea({ ...editingArea, surveyMethod: e.target.value })}
                  placeholder="e.g. Dò kim loại nông 0.3m & Dò sâu 5m"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Link bản đồ số / Google Drive</label>
                <input
                  type="text"
                  value={editingArea.digitalMapLink || ''}
                  onChange={e => setEditingArea({ ...editingArea, digitalMapLink: e.target.value })}
                  placeholder="https://maps.google.com/..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg shadow-lg"
              >
                Lưu khu vực
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
