import React, { useState } from 'react';
import {
  Compass,
  Plus,
  Search,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Building2,
  MapPin,
  X,
  Lock
} from 'lucide-react';
import { UXOSignalRecord, SignalInspectionStatus, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  signals: UXOSignalRecord[];
  projects: Project[];
  onSaveSignal: (signal: UXOSignalRecord) => void;
  onDeleteSignal: (id: string) => void;
}

const SIGNAL_STATUS_MAP: Record<SignalInspectionStatus, { label: string; color: string }> = {
  chua_kiem_tra: { label: 'Chưa kiểm tra', color: 'bg-slate-800 text-slate-300 border-slate-700' },
  dang_kiem_tra: { label: 'Đang kiểm tra đào kiểm tra', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  da_kiem_tra: { label: 'Đã kiểm tra & xác nhận', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' }
};

export const SignalTrackingTab: React.FC<Props> = ({
  signals,
  projects,
  onSaveSignal,
  onDeleteSignal
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingSignal, setViewingSignal] = useState<UXOSignalRecord | null>(null);
  const [editingSignal, setEditingSignal] = useState<UXOSignalRecord | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredSignals = signals.filter(s => {
    if (selectedProjectId !== 'all' && s.projectId !== selectedProjectId) return false;
    if (selectedStatus !== 'all' && s.inspectionStatus !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        s.signalCode.toLowerCase().includes(q) ||
        s.lotOrGridCode.toLowerCase().includes(q) ||
        s.detectorPerson.toLowerCase().includes(q) ||
        s.initialClassification.toLowerCase().includes(q) ||
        s.inspectionResult.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenForm = (signal?: UXOSignalRecord) => {
    if (signal) {
      setEditingSignal(signal);
    } else {
      const defaultProj = projects[0];
      setEditingSignal({
        id: `sig-${Date.now()}`,
        signalCode: `TH-QT-2026-0${signals.length + 1}`,
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        lotOrGridCode: 'Lô A1 / Ô A1-01',
        coordinates: '16°52\'49.0"N 106°55\'13.0"E',
        detectionDate: new Date().toISOString().split('T')[0],
        detectionEquipment: 'Foerster FEREX 4.034',
        detectorPerson: 'Trung úy Nguyễn Hoàng Nam',
        estimatedDepthM: 1.5,
        initialClassification: 'Tín hiệu kim loại sâu',
        inspectionStatus: 'chua_kiem_tra',
        inspectionResult: 'Chờ kết quả đào kiểm tra do cán bộ có thẩm quyền xác nhận',
        approver: defaultProj?.commanderName || 'Thượng tá Nguyễn Văn Hùng'
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSignal) return;
    const proj = projects.find(p => p.id === editingSignal.projectId);
    const finalItem: UXOSignalRecord = {
      ...editingSignal,
      projectName: proj ? proj.name : editingSignal.projectName
    };
    onSaveSignal(finalItem);
    setShowModal(false);
    setEditingSignal(null);
  };

  return (
    <div className="space-y-6">
      {/* Safety Compliance Banner */}
      <div className="bg-amber-950/40 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
        <ShieldAlert className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-bold block uppercase text-[11px] tracking-wider mb-0.5">
            Quy định an toàn & Quản lý thông tin tín hiệu (QCVN 01:2019/BQP)
          </strong>
          Chỉ ghi nhận thông tin quản lý kết quả tín hiệu do cán bộ có thẩm quyền nhập. Tuyệt đối không đăng tải, chia sẻ hoặc cung cấp các hướng dẫn thao tác kỹ thuật xử lý vật nổ dưới mọi hình thức.
        </div>
      </div>

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-400" /> 8.4. Sổ Theo dõi Tín hiệu Rà phá
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý mã tín hiệu, tọa độ, thiết bị, người phát hiện, độ sâu dự kiến, phân loại và kết quả kiểm tra.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Đăng ký tín hiệu mới
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
            <option value="all">Tất cả trạng thái kiểm tra</option>
            {Object.entries(SIGNAL_STATUS_MAP).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo Mã tín hiệu, lô/ô, người phát hiện..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Signal Table */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Mã tín hiệu</th>
                <th className="p-3.5">Dự án & Lô/Ô</th>
                <th className="p-3.5">Tọa độ & Độ sâu</th>
                <th className="p-3.5">Thiết bị & Người phát hiện</th>
                <th className="p-3.5">Phân loại & Trạng thái</th>
                <th className="p-3.5">Kết quả kiểm tra</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredSignals.map(sig => {
                const statusInfo = SIGNAL_STATUS_MAP[sig.inspectionStatus];

                return (
                  <tr key={sig.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-bold text-amber-400">
                      {sig.signalCode}
                      <div className="text-[10px] text-slate-500 font-sans">{formatDateVN(sig.detectionDate)}</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="font-semibold text-slate-200 line-clamp-1">{sig.projectName}</div>
                      <div className="text-emerald-400 font-mono text-[11px]">{sig.lotOrGridCode}</div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-300">{sig.coordinates}</div>
                      <div className="text-amber-400 font-bold">Độ sâu: {sig.estimatedDepthM}m</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="text-slate-200 font-medium">{sig.detectionEquipment}</div>
                      <div className="text-slate-400 text-[11px]">Người tìm: {sig.detectorPerson}</div>
                    </td>

                    <td className="p-3.5 font-sans">
                      <div className="text-slate-200 font-semibold">{sig.initialClassification}</div>
                      <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border mt-1 ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>

                    <td className="p-3.5 font-sans max-w-xs">
                      <p className="text-slate-300 line-clamp-2">{sig.inspectionResult}</p>
                      <span className="text-[10px] text-slate-500 block mt-0.5">Xác nhận: {sig.approver}</span>
                    </td>

                    <td className="p-3.5 text-right font-sans">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSignal(sig)}
                          className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenForm(sig)}
                          className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Xóa tín hiệu "${sig.signalCode}"?`)) onDeleteSignal(sig.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredSignals.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-xs">
            Không có tín hiệu nào phù hợp bộ lọc.
          </div>
        )}
      </div>

      {/* Modal View Detail */}
      {viewingSignal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded border border-amber-500/20">
                  {viewingSignal.signalCode}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{viewingSignal.projectName}</h3>
              </div>
              <button onClick={() => setViewingSignal(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong className="text-slate-400">Lô / Ô:</strong> <p className="text-emerald-400 font-mono font-bold mt-0.5">{viewingSignal.lotOrGridCode}</p></div>
              <div><strong className="text-slate-400">Tọa độ:</strong> <p className="text-slate-200 font-mono mt-0.5">{viewingSignal.coordinates}</p></div>
              <div><strong className="text-slate-400">Độ sâu dự kiến:</strong> <p className="text-amber-400 font-bold font-mono mt-0.5">{viewingSignal.estimatedDepthM} m</p></div>
              <div><strong className="text-slate-400">Ngày phát hiện:</strong> <p className="text-slate-200 font-mono mt-0.5">{formatDateVN(viewingSignal.detectionDate)}</p></div>
              <div><strong className="text-slate-400">Thiết bị:</strong> <p className="text-slate-200 mt-0.5">{viewingSignal.detectionEquipment}</p></div>
              <div><strong className="text-slate-400">Người phát hiện:</strong> <p className="text-slate-200 mt-0.5">{viewingSignal.detectorPerson}</p></div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><strong className="text-slate-300">Phân loại ban đầu:</strong> {viewingSignal.initialClassification}</div>
              <div><strong className="text-slate-300">Kết quả kiểm tra:</strong> {viewingSignal.inspectionResult}</div>
              <div><strong className="text-slate-300">Người xác nhận:</strong> {viewingSignal.approver}</div>
              {viewingSignal.relatedMinutes && <div><strong className="text-slate-300">Biên bản liên quan:</strong> {viewingSignal.relatedMinutes}</div>}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setViewingSignal(null)} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-200">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {showModal && editingSignal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Compass className="w-5 h-5" /> Đăng ký / Cập nhật Tín hiệu
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã tín hiệu *</label>
                <input
                  type="text"
                  required
                  value={editingSignal.signalCode}
                  onChange={e => setEditingSignal({ ...editingSignal, signalCode: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Dự án *</label>
                <select
                  value={editingSignal.projectId}
                  onChange={e => {
                    const proj = projects.find(p => p.id === e.target.value);
                    setEditingSignal({
                      ...editingSignal,
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
                <label className="block font-semibold text-slate-300 mb-1">Lô / Ô *</label>
                <input
                  type="text"
                  required
                  value={editingSignal.lotOrGridCode}
                  onChange={e => setEditingSignal({ ...editingSignal, lotOrGridCode: e.target.value })}
                  placeholder="e.g. Lô A1 / Ô A1-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tọa độ GPS</label>
                <input
                  type="text"
                  value={editingSignal.coordinates}
                  onChange={e => setEditingSignal({ ...editingSignal, coordinates: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Độ sâu dự kiến (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingSignal.estimatedDepthM}
                  onChange={e => setEditingSignal({ ...editingSignal, estimatedDepthM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Trạng thái kiểm tra</label>
                <select
                  value={editingSignal.inspectionStatus}
                  onChange={e => setEditingSignal({ ...editingSignal, inspectionStatus: e.target.value as SignalInspectionStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(SIGNAL_STATUS_MAP).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thiết bị phát hiện</label>
                <input
                  type="text"
                  value={editingSignal.detectionEquipment}
                  onChange={e => setEditingSignal({ ...editingSignal, detectionEquipment: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Người phát hiện</label>
                <input
                  type="text"
                  value={editingSignal.detectorPerson}
                  onChange={e => setEditingSignal({ ...editingSignal, detectorPerson: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Phân loại ban đầu</label>
                <input
                  type="text"
                  value={editingSignal.initialClassification}
                  onChange={e => setEditingSignal({ ...editingSignal, initialClassification: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Kết quả kiểm tra / Cán bộ kết luận</label>
                <textarea
                  rows={2}
                  value={editingSignal.inspectionResult}
                  onChange={e => setEditingSignal({ ...editingSignal, inspectionResult: e.target.value })}
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
                Lưu tín hiệu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
