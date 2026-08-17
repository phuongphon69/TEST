import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  FileCheck,
  Building2,
  Calendar,
  X
} from 'lucide-react';
import { UXOQualityRecord, QualityInspectionType, QualityInspectionResult, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  qualityRecords: UXOQualityRecord[];
  projects: Project[];
  onSaveQualityRecord: (record: UXOQualityRecord) => void;
  onDeleteQualityRecord: (id: string) => void;
}

const RESULT_MAP: Record<QualityInspectionResult, { label: string; color: string }> = {
  dat: { label: 'Đạt chất lượng QCVN 01:2019', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  khong_dat: { label: 'Không đạt (Yêu cầu làm lại)', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  can_khac_phuc: { label: 'Cần khắc phục', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' }
};

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  cho_khac_phuc: { label: 'Chờ khắc phục', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' },
  da_khac_phuc: { label: 'Đã khắc phục xong', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  da_nghiem_thu: { label: 'Đã nghiệm thu chất lượng', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
};

export const QualityManagementTab: React.FC<Props> = ({
  qualityRecords,
  projects,
  onSaveQualityRecord,
  onDeleteQualityRecord
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingRecord, setViewingRecord] = useState<UXOQualityRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<UXOQualityRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredRecords = qualityRecords.filter(q => {
    if (selectedProjectId !== 'all' && q.projectId !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase();
      return (
        q.inspectionPlan.toLowerCase().includes(term) ||
        q.responsiblePerson.toLowerCase().includes(term) ||
        q.inspector.toLowerCase().includes(term) ||
        (q.nonConformities && q.nonConformities.toLowerCase().includes(term))
      );
    }
    return true;
  });

  const handleOpenForm = (rec?: UXOQualityRecord) => {
    if (rec) {
      setEditingRecord(rec);
    } else {
      const defaultProj = projects[0];
      setEditingRecord({
        id: `qual-${Date.now()}`,
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        inspectionPlan: 'Kế hoạch kiểm tra chất lượng định kỳ tháng mới',
        inspectionType: 'xac_suat',
        inspectionDate: new Date().toISOString().split('T')[0],
        inspectionResult: 'dat',
        responsiblePerson: 'Đại úy Trần Văn Mạnh',
        inspector: defaultProj?.commanderName || 'Thượng tá Nguyễn Văn Hùng',
        status: 'da_nghiem_thu'
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;
    const proj = projects.find(p => p.id === editingRecord.projectId);
    const finalItem: UXOQualityRecord = {
      ...editingRecord,
      projectName: proj ? proj.name : editingRecord.projectName
    };
    onSaveQualityRecord(finalItem);
    setShowModal(false);
    setEditingRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> 8.6. Quản lý Chất lượng Rà phá
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Kế hoạch kiểm tra nội bộ, kiểm tra xác suất độ sâu, khắc phục sai sót và biên bản nghiệm thu chất lượng.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Đăng ký đợt kiểm tra mới
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-80"
        >
          <option value="all">Tất cả dự án RPBM</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
          ))}
        </select>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo kế hoạch, cán bộ kiểm tra..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Records Grid */}
      <div className="space-y-4">
        {filteredRecords.map(record => {
          const resInfo = RESULT_MAP[record.inspectionResult];
          const stInfo = STATUS_MAP[record.status];

          return (
            <div
              key={record.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded text-[11px] font-bold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {record.inspectionType === 'noi_bo' ? 'Kiểm tra nội bộ' : 'Kiểm tra xác suất'}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">{formatDateVN(record.inspectionDate)}</span>
                  </div>
                  <h4 className="font-bold text-slate-100 text-sm mt-1">{record.inspectionPlan}</h4>
                  <p className="text-xs text-slate-400">{record.projectName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${resInfo.color}`}>
                    {resInfo.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${stInfo.color}`}>
                    {stInfo.label}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-slate-300">Điểm chưa phù hợp / Sai sót:</strong>
                  <p className="text-slate-200">{record.nonConformities || 'Không phát hiện sai sót.'}</p>
                </div>

                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                  <strong className="text-slate-300">Biện pháp khắc phục:</strong>
                  <p className="text-slate-200">{record.correctiveActions || 'Duy trì chất lượng hiện tại.'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-slate-400 pt-2 border-t border-slate-800">
                <div>
                  <span>Người giám sát: <strong className="text-slate-200">{record.inspector}</strong></span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingRecord(record)}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenForm(record)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Xóa đợt kiểm tra này?')) onDeleteQualityRecord(record.id);
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

      {filteredRecords.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
          <ShieldCheck className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-semibold text-sm">Chưa có bản ghi quản lý chất lượng nào.</div>
        </div>
      )}

      {/* Modal View Detail */}
      {viewingRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded border border-amber-500/20">
                  {viewingRecord.inspectionPlan}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{viewingRecord.projectName}</h3>
              </div>
              <button onClick={() => setViewingRecord(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong className="text-slate-400">Loại kiểm tra:</strong> <p className="text-slate-200 mt-0.5">{viewingRecord.inspectionType === 'noi_bo' ? 'Nội bộ' : 'Xác suất'}</p></div>
              <div><strong className="text-slate-400">Ngày kiểm tra:</strong> <p className="text-slate-200 font-mono mt-0.5">{formatDateVN(viewingRecord.inspectionDate)}</p></div>
              <div><strong className="text-slate-400">Người phụ trách:</strong> <p className="text-slate-200 mt-0.5">{viewingRecord.responsiblePerson}</p></div>
              <div><strong className="text-slate-400">Người giám sát:</strong> <p className="text-slate-200 mt-0.5">{viewingRecord.inspector}</p></div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><strong className="text-slate-300">Điểm chưa phù hợp:</strong> {viewingRecord.nonConformities || 'Không có'}</div>
              <div><strong className="text-slate-300">Biện pháp khắc phục:</strong> {viewingRecord.correctiveActions || 'Duy trì'}</div>
              {viewingRecord.reInspectionResult && <div><strong className="text-slate-300">Kết quả kiểm tra lại:</strong> {viewingRecord.reInspectionResult}</div>}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setViewingRecord(null)} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-200">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {showModal && editingRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Lập / Cập nhật Quản lý chất lượng
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Dự án *</label>
                <select
                  value={editingRecord.projectId}
                  onChange={e => {
                    const proj = projects.find(p => p.id === e.target.value);
                    setEditingRecord({
                      ...editingRecord,
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

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Loại kiểm tra</label>
                <select
                  value={editingRecord.inspectionType}
                  onChange={e => setEditingRecord({ ...editingRecord, inspectionType: e.target.value as QualityInspectionType })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="noi_bo">Nội bộ</option>
                  <option value="xac_suat">Xác suất</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Tên kế hoạch kiểm tra *</label>
                <input
                  type="text"
                  required
                  value={editingRecord.inspectionPlan}
                  onChange={e => setEditingRecord({ ...editingRecord, inspectionPlan: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày kiểm tra</label>
                <input
                  type="date"
                  value={editingRecord.inspectionDate}
                  onChange={e => setEditingRecord({ ...editingRecord, inspectionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Kết quả kiểm tra</label>
                <select
                  value={editingRecord.inspectionResult}
                  onChange={e => setEditingRecord({ ...editingRecord, inspectionResult: e.target.value as QualityInspectionResult })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="dat">Đạt</option>
                  <option value="can_khac_phuc">Cần khắc phục</option>
                  <option value="khong_dat">Không đạt</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Người phụ trách</label>
                <input
                  type="text"
                  value={editingRecord.responsiblePerson}
                  onChange={e => setEditingRecord({ ...editingRecord, responsiblePerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Cán bộ Giám sát / Kiểm tra</label>
                <input
                  type="text"
                  value={editingRecord.inspector}
                  onChange={e => setEditingRecord({ ...editingRecord, inspector: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Điểm sai sót / Không phù hợp</label>
                <textarea
                  rows={2}
                  value={editingRecord.nonConformities || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, nonConformities: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Biện pháp khắc phục</label>
                <textarea
                  rows={2}
                  value={editingRecord.correctiveActions || ''}
                  onChange={e => setEditingRecord({ ...editingRecord, correctiveActions: e.target.value })}
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
