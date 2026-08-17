import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Search,
  Calendar,
  CloudSun,
  Users,
  Truck,
  Clock,
  Bomb,
  AlertTriangle,
  CheckCircle2,
  Image as ImageIcon,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Building2,
  MapPin,
  X,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { UXODailyExecutionLog, Project, ExecutionArea } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  logs: UXODailyExecutionLog[];
  projects: Project[];
  areas: ExecutionArea[];
  onSaveLog: (log: UXODailyExecutionLog) => void;
  onDeleteLog: (id: string) => void;
}

export const DailyExecutionLogTab: React.FC<Props> = ({
  logs,
  projects,
  areas,
  onSaveLog,
  onDeleteLog
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingLog, setViewingLog] = useState<UXODailyExecutionLog | null>(null);
  const [editingLog, setEditingLog] = useState<UXODailyExecutionLog | null>(null);
  const [showModal, setShowModal] = useState(false);

  const filteredLogs = logs.filter(l => {
    if (selectedProjectId !== 'all' && l.projectId !== selectedProjectId) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        l.projectName.toLowerCase().includes(q) ||
        (l.areaName && l.areaName.toLowerCase().includes(q)) ||
        l.weatherCondition.toLowerCase().includes(q) ||
        l.processingContent.toLowerCase().includes(q) ||
        l.technicalOpinion.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenForm = (log?: UXODailyExecutionLog) => {
    if (log) {
      setEditingLog(log);
    } else {
      const defaultProj = projects[0];
      const defaultArea = areas[0];
      setEditingLog({
        id: `log-${Date.now()}`,
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        areaId: defaultArea?.id || '',
        areaName: defaultArea?.name || '',
        logDate: new Date().toISOString().split('T')[0],
        weatherCondition: 'Nắng đẹp, nhiệt độ 30°C, gió nhẹ.',
        personnelCount: 16,
        personnelList: 'Chỉ huy trưởng, Cán bộ kỹ thuật và 14 KTV & Chiến sĩ',
        equipmentUsed: '08 Máy dò Vallon VMR3, 02 Máy dò Foerster FEREX',
        startTime: '07:00',
        endTime: '17:00',
        executedAreaHa: 1.2,
        executedVolume: 'Dò nông 0.3m: 1.2 ha; Đào kiểm tra 15 vị trí',
        signalsDetectedCount: 15,
        checkedLocationsCount: 15,
        incidents: 'Không có sự cố mất an toàn',
        processingContent: 'Đã xử lý 15 tín hiệu kim loại phế liệu gỉ sét an toàn.',
        technicalOpinion: 'Thi công đúng quy trình QCVN 01:2019/BQP.',
        supervisorOpinion: 'Đồng ý nghiệm thu nhật ký.'
      });
    }
    setShowModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLog) return;
    const proj = projects.find(p => p.id === editingLog.projectId);
    const area = areas.find(a => a.id === editingLog.areaId);
    const finalItem: UXODailyExecutionLog = {
      ...editingLog,
      projectName: proj ? proj.name : editingLog.projectName,
      areaName: area ? area.name : editingLog.areaName
    };
    onSaveLog(finalItem);
    setShowModal(false);
    setEditingLog(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> 8.3. Nhật ký Thi công Hằng ngày
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ghi nhận chi tiết nhật ký thời tiết, nhân sự, thiết bị, khối lượng thực hiện, tín hiệu phát hiện, ý kiến kỹ thuật & giám sát.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Ghi nhật ký thi công
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
            placeholder="Tìm theo nội dung, thời tiết, ý kiến chỉ đạo..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-4">
        {filteredLogs.map(log => (
          <div
            key={log.id}
            className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 hover:border-slate-700 transition-all shadow-lg space-y-4"
          >
            {/* Top Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded-lg border border-amber-500/20">
                  {formatDateVN(log.logDate)}
                </span>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm line-clamp-1">{log.projectName}</h4>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {log.areaName || 'Khu vực thi công chính'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
                <span className="text-slate-400 font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  <Clock className="w-3.5 h-3.5 text-amber-400 inline mr-1" /> {log.startTime} - {log.endTime}
                </span>
                <button
                  onClick={() => setViewingLog(log)}
                  className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOpenForm(log)}
                  className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg"
                  title="Sửa"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Xóa nhật ký này?')) onDeleteLog(log.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">Diện tích thực hiện</span>
                <p className="font-bold text-emerald-400 font-mono text-sm mt-0.5">{log.executedAreaHa} ha</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">Tín hiệu phát hiện / Kiểm tra</span>
                <p className="font-bold text-amber-400 font-mono text-sm mt-0.5">{log.signalsDetectedCount} / {log.checkedLocationsCount} vị trí</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">Nhân sự tham gia</span>
                <p className="font-bold text-sky-400 font-mono text-sm mt-0.5">{log.personnelCount} cán bộ/CS</p>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-slate-500 text-[10px]">Thời tiết</span>
                <p className="font-medium text-slate-200 line-clamp-1 text-xs mt-0.5">{log.weatherCondition}</p>
              </div>
            </div>

            {/* Opinions & Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-emerald-400" /> Ý kiến Cán bộ Kỹ thuật:
                </span>
                <p className="text-slate-300 italic">{log.technicalOpinion}</p>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-amber-400" /> Ý kiến Cán bộ Giám sát:
                </span>
                <p className="text-slate-300 italic">{log.supervisorOpinion}</p>
              </div>
            </div>

            {log.signedLogFileUrl && (
              <div className="text-xs pt-1">
                <a href={log.signedLogFileUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                  <ExternalLink className="w-3.5 h-3.5" /> Xem file nhật ký ký xác nhận (PDF Scan)
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
          <FileText className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-semibold text-sm">Chưa có nhật ký thi công hằng ngày nào.</div>
        </div>
      )}

      {/* Modal View Detail */}
      {viewingLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 font-mono font-bold text-xs rounded border border-amber-500/20">
                  Nhật ký ngày {formatDateVN(viewingLog.logDate)}
                </span>
                <h3 className="text-base font-bold text-slate-100 mt-1">{viewingLog.projectName}</h3>
              </div>
              <button onClick={() => setViewingLog(null)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><strong className="text-slate-400">Thời tiết:</strong> <p className="text-slate-200 mt-0.5">{viewingLog.weatherCondition}</p></div>
              <div><strong className="text-slate-400">Thời gian:</strong> <p className="text-slate-200 mt-0.5 font-mono">{viewingLog.startTime} - {viewingLog.endTime}</p></div>
              <div><strong className="text-slate-400">Diện tích rà phá:</strong> <p className="text-emerald-400 font-bold font-mono mt-0.5">{viewingLog.executedAreaHa} ha</p></div>
              <div><strong className="text-slate-400">Tín hiệu / Đã kiểm tra:</strong> <p className="text-amber-400 font-bold font-mono mt-0.5">{viewingLog.signalsDetectedCount} / {viewingLog.checkedLocationsCount} vị trí</p></div>
              <div className="col-span-2"><strong className="text-slate-400">Nhân sự:</strong> <p className="text-slate-200 mt-0.5">{viewingLog.personnelList}</p></div>
              <div className="col-span-2"><strong className="text-slate-400">Thiết bị:</strong> <p className="text-slate-200 mt-0.5">{viewingLog.equipmentUsed}</p></div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div><strong className="text-slate-300">Khối lượng thực hiện:</strong> {viewingLog.executedVolume}</div>
              <div><strong className="text-slate-300">Sự cố phát sinh:</strong> {viewingLog.incidents || 'Không có'}</div>
              <div><strong className="text-slate-300">Nội dung xử lý:</strong> {viewingLog.processingContent}</div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800 text-xs">
              <button onClick={() => setViewingLog(null)} className="px-4 py-2 bg-slate-800 rounded-lg text-slate-200">Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add / Edit Form */}
      {showModal && editingLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <FileText className="w-5 h-5" /> Ghi / Cập nhật Nhật ký thi công
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Dự án *</label>
                <select
                  value={editingLog.projectId}
                  onChange={e => {
                    const proj = projects.find(p => p.id === e.target.value);
                    setEditingLog({
                      ...editingLog,
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
                <label className="block font-semibold text-slate-300 mb-1">Ngày thi công *</label>
                <input
                  type="date"
                  required
                  value={editingLog.logDate}
                  onChange={e => setEditingLog({ ...editingLog, logDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Thời tiết hiện trường</label>
                <input
                  type="text"
                  value={editingLog.weatherCondition}
                  onChange={e => setEditingLog({ ...editingLog, weatherCondition: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thời gian bắt đầu</label>
                <input
                  type="text"
                  value={editingLog.startTime}
                  onChange={e => setEditingLog({ ...editingLog, startTime: e.target.value })}
                  placeholder="07:00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thời gian kết thúc</label>
                <input
                  type="text"
                  value={editingLog.endTime}
                  onChange={e => setEditingLog({ ...editingLog, endTime: e.target.value })}
                  placeholder="17:00"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Diện tích thực hiện trong ngày (ha)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editingLog.executedAreaHa}
                  onChange={e => setEditingLog({ ...editingLog, executedAreaHa: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số lượng nhân sự tham gia</label>
                <input
                  type="number"
                  value={editingLog.personnelCount}
                  onChange={e => setEditingLog({ ...editingLog, personnelCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số lượng tín hiệu phát hiện</label>
                <input
                  type="number"
                  value={editingLog.signalsDetectedCount}
                  onChange={e => setEditingLog({ ...editingLog, signalsDetectedCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số vị trí đã kiểm tra</label>
                <input
                  type="number"
                  value={editingLog.checkedLocationsCount}
                  onChange={e => setEditingLog({ ...editingLog, checkedLocationsCount: parseInt(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Nội dung xử lý trong ngày</label>
                <textarea
                  rows={2}
                  value={editingLog.processingContent}
                  onChange={e => setEditingLog({ ...editingLog, processingContent: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Ý kiến Cán bộ Kỹ thuật</label>
                <input
                  type="text"
                  value={editingLog.technicalOpinion}
                  onChange={e => setEditingLog({ ...editingLog, technicalOpinion: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Ý kiến Cán bộ Giám sát</label>
                <input
                  type="text"
                  value={editingLog.supervisorOpinion}
                  onChange={e => setEditingLog({ ...editingLog, supervisorOpinion: e.target.value })}
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
                Lưu nhật ký
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
