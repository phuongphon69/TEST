import React, { useState } from 'react';
import { Project, ProjectMilestone, ProjectDossierItem } from '../../types';
import { ProjectGeneralTab } from './ProjectGeneralTab';
import { ProjectProgressGanttTab } from './ProjectProgressGanttTab';
import { ProjectFinancialTab } from './ProjectFinancialTab';
import { ProjectDossierChecklistTab } from './ProjectDossierChecklistTab';
import { formatDateVN } from '../../utils/formatters';
import {
  X,
  Building2,
  Layers,
  DollarSign,
  FileCheck,
  Calendar,
  Bomb,
  Printer,
  ExternalLink,
  Edit2
} from 'lucide-react';

interface Props {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updated: Project) => void;
  onEditGeneral?: () => void;
  onPrint?: () => void;
}

export const ProjectDetailModal: React.FC<Props> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
  onEditGeneral,
  onPrint
}) => {
  if (!isOpen || !project) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'progress' | 'financial' | 'dossier' | 'logs'>('general');

  const handleUpdateMilestones = (milestones: ProjectMilestone[]) => {
    onUpdateProject({ ...project, milestones });
  };

  const handleUpdateFinancials = (updatedFields: Partial<Project>) => {
    onUpdateProject({ ...project, ...updatedFields });
  };

  const handleUpdateDossiers = (dossiers: ProjectDossierItem[]) => {
    onUpdateProject({ ...project, dossiers });
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
              <Building2 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-800 text-amber-300 border border-slate-700">
                  {project.code}
                </span>
                <span className="text-xs text-slate-400 font-medium">| {project.province}</span>
              </div>
              <h2 className="text-lg font-bold text-slate-100 line-clamp-1">{project.name}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onPrint && (
              <button
                onClick={onPrint}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4 text-slate-400" /> In hồ sơ
              </button>
            )}
            {onEditGeneral && (
              <button
                onClick={onEditGeneral}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Chỉnh sửa
              </button>
            )}
            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-slate-950/80 px-4 pt-2 border-b border-slate-800 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-amber-400 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            7.1 Thông tin chung
          </button>

          <button
            onClick={() => setActiveTab('progress')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'progress'
                ? 'border-amber-400 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            7.3 Tiến độ & Gantt
          </button>

          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'financial'
                ? 'border-amber-400 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            7.4 Giá trị & Thanh toán
          </button>

          <button
            onClick={() => setActiveTab('dossier')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'dossier'
                ? 'border-amber-400 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            7.5 Hồ sơ Dự án (21 Checklist)
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2.5 rounded-t-lg border-b-2 flex items-center gap-2 transition-colors whitespace-nowrap ${
              activeTab === 'logs'
                ? 'border-amber-400 text-amber-400 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bomb className="w-4 h-4" />
            Nhật ký & Vật nổ ({project.dailyLogs?.length || 0})
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'general' && (
            <ProjectGeneralTab
              project={project}
              onEdit={onEditGeneral}
              onUpdateProject={onUpdateProject}
            />
          )}

          {activeTab === 'progress' && (
            <ProjectProgressGanttTab project={project} onUpdateMilestones={handleUpdateMilestones} />
          )}

          {activeTab === 'financial' && (
            <ProjectFinancialTab project={project} onUpdateFinancials={handleUpdateFinancials} />
          )}

          {activeTab === 'dossier' && (
            <ProjectDossierChecklistTab project={project} onUpdateDossiers={handleUpdateDossiers} />
          )}

          {activeTab === 'logs' && (
            <div className="space-y-4 text-xs">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h4 className="font-bold text-slate-200 text-sm">Nhật ký thi công công trường</h4>
                  <p className="text-slate-400">Tổng số vật nổ đã tìm thấy & xử lý: <span className="text-amber-400 font-bold">{project.uxoFoundCount || 0} tín hiệu/vật nổ</span></p>
                </div>
              </div>

              {(!project.dailyLogs || project.dailyLogs.length === 0) ? (
                <div className="text-center py-12 text-slate-500">
                  Chưa có nhật ký thi công nào được ghi nhận cho dự án này.
                </div>
              ) : (
                <div className="space-y-3">
                  {project.dailyLogs.map(log => (
                    <div key={log.id} className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-mono text-amber-400 font-bold">{formatDateVN(log.date)}</span>
                        <span className="text-slate-400">Người ghi: {log.recordedBy}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-300">
                        <div>Diện tích rà phá trong ngày: <span className="font-bold text-emerald-400">{log.areaClearedHa} ha</span></div>
                        <div>Thời tiết: <span className="font-medium text-slate-200">{log.weatherCondition}</span></div>
                      </div>
                      {log.notes && <div className="text-slate-400 bg-slate-950 p-2 rounded border border-slate-800">{log.notes}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
