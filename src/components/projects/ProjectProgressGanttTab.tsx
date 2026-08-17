import React, { useState } from 'react';
import { Project, ProjectMilestone } from '../../types';
import { formatDateVN } from '../../utils/formatters';
import {
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Layers,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  FileCheck
} from 'lucide-react';

interface Props {
  project: Project;
  onUpdateMilestones: (milestones: ProjectMilestone[]) => void;
}

export const ProjectProgressGanttTab: React.FC<Props> = ({ project, onUpdateMilestones }) => {
  const [activeView, setActiveView] = useState<'gantt' | 'list'>('gantt');
  const [selectedMilestone, setSelectedMilestone] = useState<ProjectMilestone | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const milestones = project.milestones || [];

  // Sort milestones by planStartDate
  const sortedMilestones = [...milestones].sort(
    (a, b) => new Date(a.planStartDate).getTime() - new Date(b.planStartDate).getTime()
  );

  // Calculate overall timeline bounds for Gantt Chart
  const allDates = sortedMilestones.flatMap(m => [
    new Date(m.planStartDate).getTime(),
    new Date(m.planEndDate).getTime(),
    m.actualStartDate ? new Date(m.actualStartDate).getTime() : Date.now(),
    m.actualEndDate ? new Date(m.actualEndDate).getTime() : Date.now()
  ]).filter(t => !isNaN(t));

  const minTime = allDates.length ? Math.min(...allDates) : new Date(project.startDate).getTime();
  const maxTime = allDates.length ? Math.max(...allDates) : new Date(project.endDate).getTime();
  const totalDuration = Math.max(1, maxTime - minTime);

  const getPercentOffset = (dateStr?: string) => {
    if (!dateStr) return 0;
    const time = new Date(dateStr).getTime();
    if (isNaN(time)) return 0;
    return Math.max(0, Math.min(100, ((time - minTime) / totalDuration) * 100));
  };

  const getPercentWidth = (startStr?: string, endStr?: string) => {
    if (!startStr || !endStr) return 5;
    const start = new Date(startStr).getTime();
    const end = new Date(endStr).getTime();
    if (isNaN(start) || isNaN(end) || end <= start) return 5;
    return Math.max(3, Math.min(100 - getPercentOffset(startStr), ((end - start) / totalDuration) * 100));
  };

  const handleSaveMilestone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMilestone) return;

    let updatedList: ProjectMilestone[];
    const exists = milestones.some(m => m.id === selectedMilestone.id);

    if (exists) {
      updatedList = milestones.map(m => (m.id === selectedMilestone.id ? selectedMilestone : m));
    } else {
      updatedList = [...milestones, selectedMilestone];
    }

    onUpdateMilestones(updatedList);
    setSelectedMilestone(null);
    setIsEditing(false);
  };

  const handleDeleteMilestone = (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa mốc tiến độ này?')) {
      const updated = milestones.filter(m => m.id !== id);
      onUpdateMilestones(updated);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Summary */}
      <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            7.3 Tiến độ mốc công việc & Biểu đồ Gantt
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý 15 mốc quy trình chuẩn từ khảo sát, kỹ thuật, thi công đến nghiệm thu bàn giao và quyết toán.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950 p-1 rounded-lg border border-slate-800 flex text-xs">
            <button
              onClick={() => setActiveView('gantt')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'gantt' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Biểu đồ Gantt
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                activeView === 'list' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Danh sách chi tiết
            </button>
          </div>

          <button
            onClick={() => {
              setSelectedMilestone({
                id: `ms-new-${Date.now()}`,
                name: '',
                planStartDate: project.startDate,
                planEndDate: project.endDate,
                inCharge: project.commanderName || 'Chỉ huy trưởng',
                progressPercent: 0,
                plannedQuantity: '100%',
                actualQuantity: '0%'
              });
              setIsEditing(true);
            }}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm mốc tiến độ
          </button>
        </div>
      </div>

      {/* Gantt Chart View */}
      {activeView === 'gantt' && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4 overflow-x-auto">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-300">Biểu đồ Gantt tổng thể</span>
            <div className="flex items-center gap-4 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-sky-500/80 rounded-sm"></span> Kế hoạch
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-emerald-500 rounded-sm"></span> Thực tế
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2 bg-rose-500 rounded-sm"></span> Trễ hạn
              </span>
            </div>
          </div>

          <div className="min-w-[800px] space-y-3 pt-2">
            {sortedMilestones.map((m, idx) => {
              const planOffset = getPercentOffset(m.planStartDate);
              const planWidth = getPercentWidth(m.planStartDate, m.planEndDate);

              const actualOffset = getPercentOffset(m.actualStartDate || m.planStartDate);
              const actualWidth = getPercentWidth(
                m.actualStartDate || m.planStartDate,
                m.actualEndDate || m.planEndDate
              );

              const isDelayed =
                m.progressPercent < 100 &&
                new Date(m.planEndDate).getTime() < Date.now();

              return (
                <div key={m.id} className="group hover:bg-slate-800/40 p-2.5 rounded-lg transition-colors border border-slate-800/60">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-slate-500 font-bold">#{idx + 1}</span>
                      <span className="font-semibold text-slate-200">{m.name}</span>
                      {isDelayed && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Trễ tiến độ
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                      <span>{m.inCharge}</span>
                      <span className="text-emerald-400 font-bold">{m.progressPercent}%</span>
                      <button
                        onClick={() => {
                          setSelectedMilestone(m);
                          setIsEditing(true);
                        }}
                        className="text-amber-400 hover:text-amber-300 underline"
                      >
                        Sửa
                      </button>
                    </div>
                  </div>

                  {/* Timeline track */}
                  <div className="relative h-6 bg-slate-950 rounded-md overflow-hidden border border-slate-800/80">
                    {/* Plan Bar */}
                    <div
                      className="absolute top-1 h-2 bg-sky-500/50 rounded-sm"
                      style={{ left: `${planOffset}%`, width: `${planWidth}%` }}
                      title={`Kế hoạch: ${formatDateVN(m.planStartDate)} - ${formatDateVN(m.planEndDate)}`}
                    ></div>

                    {/* Actual Bar */}
                    <div
                      className={`absolute bottom-1 h-2.5 rounded-sm ${
                        isDelayed ? 'bg-rose-500' : m.progressPercent === 100 ? 'bg-emerald-500' : 'bg-amber-400'
                      }`}
                      style={{ left: `${actualOffset}%`, width: `${actualWidth}%` }}
                      title={`Thực tế: ${m.progressPercent}% - ${formatDateVN(m.actualStartDate)} - ${formatDateVN(m.actualEndDate)}`}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {activeView === 'list' && (
        <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
              <tr>
                <th className="p-3">#</th>
                <th className="p-3">Tên mốc công việc</th>
                <th className="p-3">Người phụ trách</th>
                <th className="p-3">Thời gian kế hoạch</th>
                <th className="p-3">Thời gian thực tế</th>
                <th className="p-3">Khối lượng KH / TT</th>
                <th className="p-3 text-center">Tỷ lệ</th>
                <th className="p-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedMilestones.map((m, idx) => (
                <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-3 font-mono text-slate-500">{idx + 1}</td>
                  <td className="p-3 font-semibold text-slate-200">{m.name}</td>
                  <td className="p-3 text-slate-300">{m.inCharge}</td>
                  <td className="p-3 font-mono text-slate-400">
                    {formatDateVN(m.planStartDate)} - {formatDateVN(m.planEndDate)}
                  </td>
                  <td className="p-3 font-mono text-slate-400">
                    {m.actualStartDate ? `${formatDateVN(m.actualStartDate)} - ${formatDateVN(m.actualEndDate)}` : '--'}
                  </td>
                  <td className="p-3 font-mono text-slate-300">
                    {m.plannedQuantity || '--'} / <span className="text-emerald-400">{m.actualQuantity || '--'}</span>
                  </td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {m.progressPercent}%
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMilestone(m);
                        setIsEditing(true);
                      }}
                      className="text-amber-400 hover:text-amber-300 p-1"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="text-rose-400 hover:text-rose-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Milestone Modal */}
      {isEditing && selectedMilestone && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-xl space-y-4">
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Layers className="w-5 h-5 text-amber-400" />
              Cập nhật mốc tiến độ: {selectedMilestone.name || 'Mốc mới'}
            </h4>

            <form onSubmit={handleSaveMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tên mốc công việc (*)</label>
                <input
                  type="text"
                  required
                  value={selectedMilestone.name}
                  onChange={e => setSelectedMilestone({ ...selectedMilestone, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">KH Bắt đầu (*)</label>
                  <input
                    type="date"
                    required
                    value={selectedMilestone.planStartDate}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, planStartDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">KH Kết thúc (*)</label>
                  <input
                    type="date"
                    required
                    value={selectedMilestone.planEndDate}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, planEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Thực tế Bắt đầu</label>
                  <input
                    type="date"
                    value={selectedMilestone.actualStartDate || ''}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, actualStartDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Thực tế Kết thúc</label>
                  <input
                    type="date"
                    value={selectedMilestone.actualEndDate || ''}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, actualEndDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Người phụ trách</label>
                  <input
                    type="text"
                    value={selectedMilestone.inCharge}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, inCharge: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Tỷ lệ hoàn thành (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedMilestone.progressPercent}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, progressPercent: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Khối lượng kế hoạch</label>
                  <input
                    type="text"
                    value={selectedMilestone.plannedQuantity || ''}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, plannedQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Khối lượng thực tế</label>
                  <input
                    type="text"
                    value={selectedMilestone.actualQuantity || ''}
                    onChange={e => setSelectedMilestone({ ...selectedMilestone, actualQuantity: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Lý do chậm tiến độ (nếu có)</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mưa bão kéo dài 5 ngày, thời tiết khô hạn..."
                  value={selectedMilestone.delayReason || ''}
                  onChange={e => setSelectedMilestone({ ...selectedMilestone, delayReason: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Biện pháp khắc phục</label>
                <input
                  type="text"
                  placeholder="Tăng cường 2 tổ thi công, làm tăng ca..."
                  value={selectedMilestone.correctiveAction || ''}
                  onChange={e => setSelectedMilestone({ ...selectedMilestone, correctiveAction: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
