import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ExternalLink,
  Printer,
  ChevronRight,
  Download,
  Trash2,
  Edit2,
  DollarSign,
  FileCheck,
  Bomb,
  Eye,
  Filter
} from 'lucide-react';
import { Project, ProjectFilters } from '../types';
import { getProjects, saveProjects } from '../utils/storage';
import {
  formatVND,
  formatVNDShort,
  formatDateVN,
  PROJECT_STATUS_MAP,
  SIGNAL_DENSITY_MAP
} from '../utils/formatters';
import { exportProjectsExcel } from '../utils/exportUtils';
import { ensureProjectDefaults } from '../utils/projectDefaults';
import { getProjectYear, extractProjectYearsList } from '../utils/projectYearUtils';
import { UserAccountRepository } from '../services/UserAccountRepository';
import { ProjectRepository } from '../services/ProjectRepository';
import { ProjectAssignmentService } from '../services/ProjectAssignmentService';
import { ProjectFormModal } from './projects/ProjectFormModal';
import { ProjectDetailModal } from './projects/ProjectDetailModal';
import { PrintReportModal } from './PrintReportModal';
import { ProjectFilterBar } from './projects/ProjectFilterBar';
import { UserCheck } from 'lucide-react';

export const ProjectManager: React.FC = () => {
  // Ensure default data (7.3 milestones & 7.5 dossiers & 7.4 financials) on all projects
  const [projects, setProjectsState] = useState<Project[]>(() => {
    const raw = getProjects();
    const updated = raw.map(p => ensureProjectDefaults(p));
    saveProjects(updated);
    return updated;
  });

  // Unified Filter State
  const [filters, setFilters] = useState<ProjectFilters>({
    search: '',
    year: 'all',
    responsibleUserId: 'all',
    status: 'all'
  });

  // Modals
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Partial<Project> | null>(null);
  const [showFormModal, setShowFormModal] = useState<boolean>(false);
  const [showPrintModal, setShowPrintModal] = useState<Project | null>(null);

  const usersList = UserAccountRepository.getAll();
  const availableYears = extractProjectYearsList(projects);

  // Check if any legacy projects have unlinked responsible text
  const hasUnlinkedLegacy = projects.some(p => {
    const respId = p.responsibleUserId || p.projectManagerId;
    const respName = p.responsibleName || p.projectManager;
    if (respId) return false;
    if (!respName || !respName.trim()) return false;
    return ProjectAssignmentService.mapLegacyResponsiblePerson(respName, usersList).isUnlinked;
  });

  // Filter projects using ProjectRepository.filterProjects
  const filteredProjects = ProjectRepository.filterProjects(projects, filters);

  const updateProjectsInStateAndStorage = (newProjects: Project[]) => {
    setProjectsState(newProjects);
    saveProjects(newProjects);
  };

  const handleSaveProject = (savedProject: Project) => {
    const exists = projects.some(p => p.id === savedProject.id);
    let updatedList: Project[];
    if (exists) {
      updatedList = projects.map(p => (p.id === savedProject.id ? savedProject : p));
    } else {
      updatedList = [savedProject, ...projects];
    }
    updateProjectsInStateAndStorage(updatedList);

    if (viewingProject && viewingProject.id === savedProject.id) {
      setViewingProject(savedProject);
    }
  };

  const handleDeleteProject = (id: string, name: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa dự án "${name}"?`)) {
      const updated = projects.filter(p => p.id !== id);
      updateProjectsInStateAndStorage(updated);
      if (viewingProject?.id === id) setViewingProject(null);
    }
  };

  const handleUpdateProjectFromModal = (updatedProject: Project) => {
    handleSaveProject(updatedProject);
    setViewingProject(updatedProject);
  };

  const handleExportExcel = () => {
    const yearLabel =
      filters.year === 'all'
        ? 'Tất cả các năm'
        : filters.year === 'unspecified'
        ? 'Chưa xác định năm'
        : `Năm ${filters.year}`;

    const selectedUser = usersList.find(u => u.id === filters.responsibleUserId);
    const responsibleUserLabel =
      filters.responsibleUserId === 'all'
        ? 'Tất cả người phụ trách'
        : filters.responsibleUserId === 'unassigned'
        ? 'Chưa phân công'
        : filters.responsibleUserId === 'unlinked'
        ? 'Chưa liên kết tài khoản'
        : selectedUser
        ? selectedUser.name
        : 'Nguoi-phu-trach';

    exportProjectsExcel(filteredProjects, { yearLabel, responsibleUserLabel });
  };

  // High-level statistics
  const activeProjectsList = projects.filter(p => p.dataStatus !== 'da_xoa');
  const totalProjects = activeProjectsList.length;
  const activeProjects = activeProjectsList.filter(p => p.status === 'dang_thi_cong' || p.status === 'dang_khao_sat').length;
  const completedProjects = activeProjectsList.filter(p => p.status === 'hoan_thanh' || p.status === 'da_hoan_thanh' || p.status === 'da_quyet_toan').length;
  const totalArea = activeProjectsList.reduce((sum, p) => sum + (p.areaHa || 0), 0);
  const totalContractVal = activeProjectsList.reduce((sum, p) => sum + (p.contractValue || p.budgetVnd || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Overview Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/90 p-6 rounded-2xl border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            <h1 className="text-xl font-bold text-slate-100">7. Phân hệ Quản lý Dự án Rà phá Bom mìn</h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý toàn bộ vòng đời dự án: Thông tin chung (7.1), Trạng thái (7.2), Tiến độ & Gantt (7.3), Tài chính & Giải ngân (7.4), Hồ sơ Checklist 21 loại (7.5).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 transition-colors"
            title="Xuất danh sách dự án hiện tại ra file Excel CSV (UTF-8)"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            Xuất Excel ({filteredProjects.length})
          </button>
          <button
            onClick={() => {
              setEditingProject(null);
              setShowFormModal(true);
            }}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Khởi tạo Dự án mới
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Tổng số dự án</div>
          <div className="text-xl font-bold text-slate-100 font-mono">{totalProjects} dự án</div>
          <div className="text-[11px] text-slate-500">Đang quản lý trên hệ thống</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Đang thi công / Khảo sát</div>
          <div className="text-xl font-bold text-sky-400 font-mono">{activeProjects} dự án</div>
          <div className="text-[11px] text-slate-500">Đang triển khai thực địa</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Đã hoàn thành</div>
          <div className="text-xl font-bold text-emerald-400 font-mono">{completedProjects} dự án</div>
          <div className="text-[11px] text-slate-500">Đã bàn giao đất sạch</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Tổng diện tích rà phá</div>
          <div className="text-xl font-bold text-amber-400 font-mono">{totalArea.toFixed(1)} ha</div>
          <div className="text-[11px] text-slate-500">Đạt tiêu chuẩn QCVN 01:2019</div>
        </div>

        <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 space-y-1">
          <div className="text-xs text-slate-400 font-medium">Tổng giá trị hợp đồng</div>
          <div className="text-xl font-bold text-indigo-300 font-mono">{formatVNDShort(totalContractVal)}</div>
          <div className="text-[11px] text-slate-500">Nguồn vốn NSNN / Khác</div>
        </div>
      </div>

      {/* Unified Filter Bar (Năm, Người phụ trách, Trạng thái, Từ khóa) */}
      <ProjectFilterBar
        filters={filters}
        onFilterChange={setFilters}
        availableYears={availableYears}
        usersList={usersList}
        hasUnlinkedLegacy={hasUnlinkedLegacy}
        totalResultsCount={filteredProjects.length}
        totalProjectsCount={totalProjects}
      />

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-12 text-center text-slate-400 space-y-3">
          <Filter className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-200">Không tìm thấy dự án nào khớp với bộ lọc</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Vui lòng thử điều chỉnh lại năm dự án, người phụ trách, trạng thái hoặc từ khóa tìm kiếm.
          </p>
          <button
            onClick={() =>
              setFilters({ search: '', year: 'all', responsibleUserId: 'all', status: 'all' })
            }
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(proj => {
            const statusInfo = PROJECT_STATUS_MAP[proj.status] || {
              label: proj.status,
              classNames: 'bg-slate-800 text-slate-300'
            };

            const yr = getProjectYear(proj);
            const respId = proj.responsibleUserId || proj.projectManagerId;
            const respName = proj.responsibleName || proj.projectManager;
            const matchedUser = usersList.find(u => u.id === respId);

            return (
              <div
                key={proj.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg group"
              >
                <div className="space-y-3">
                  {/* Header row */}
                  <div className="flex justify-between items-start gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5">
                      <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {proj.code}
                      </span>
                      {yr && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          Năm {yr}
                        </span>
                      )}
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${statusInfo.classNames}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Project Title */}
                  <h3
                    onClick={() => setViewingProject(proj)}
                    className="text-base font-bold text-slate-100 hover:text-amber-400 cursor-pointer line-clamp-2 transition-colors"
                  >
                    {proj.name}
                  </h3>

                  {/* Info Pills */}
                  <div className="space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">
                        {proj.commune ? `${proj.commune}, ` : ''}
                        {proj.province}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span className="truncate">Chủ đầu tư: {proj.investor}</span>
                    </div>

                    {/* Responsible System User Row */}
                    <div className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="truncate">
                        Phụ trách:{' '}
                        <strong className="text-slate-200">
                          {matchedUser
                            ? matchedUser.name
                            : respName
                            ? respName
                            : 'Chưa phân công'}
                        </strong>
                        {matchedUser?.isLocked && (
                          <span className="text-rose-400 text-[10px] ml-1">(Đã khóa)</span>
                        )}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>
                        {formatDateVN(proj.startDate)} - {formatDateVN(proj.endDate)}
                      </span>
                    </div>
                  </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800/80 text-xs font-mono">
                  <div>
                    <div className="text-[10px] text-slate-500">Tổng diện tích rà phá</div>
                    <div className="font-bold text-emerald-400">
                      {proj.totalAreaHa || proj.areaHa} ha
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-500">Giá trị hợp đồng</div>
                    <div className="font-bold text-amber-400">{formatVNDShort(proj.contractValue || proj.budgetVnd)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between items-center text-[11px] text-slate-400 mb-1">
                    <span>Tiến độ thực hiện:</span>
                    <span className="font-bold text-emerald-400 font-mono">{proj.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, proj.progressPercent)}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center pt-4 mt-4 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setViewingProject(proj)}
                  className="px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" /> Chi tiết 7.1-7.5
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingProject(proj);
                      setShowFormModal(true);
                    }}
                    className="p-1.5 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Sửa thông tin"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => setShowPrintModal(proj)}
                    className="p-1.5 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="In báo cáo"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDeleteProject(proj.id, proj.name)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
                    title="Xóa dự án"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Form Modal (Add / Edit) */}
      {showFormModal && (
        <ProjectFormModal
          isOpen={showFormModal}
          project={editingProject}
          onClose={() => {
            setShowFormModal(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
        />
      )}

      {/* Detail Full Modal (7.1, 7.3, 7.4, 7.5 tabs) */}
      <ProjectDetailModal
        isOpen={!!viewingProject}
        project={viewingProject}
        onClose={() => setViewingProject(null)}
        onUpdateProject={handleUpdateProjectFromModal}
        onEditGeneral={() => {
          if (viewingProject) {
            setEditingProject(viewingProject);
            setShowFormModal(true);
          }
        }}
        onPrint={() => {
          if (viewingProject) setShowPrintModal(viewingProject);
        }}
      />

      {/* Print Report Modal */}
      {showPrintModal && (
        <PrintReportModal
          project={showPrintModal}
          isOpen={!!showPrintModal}
          onClose={() => setShowPrintModal(null)}
        />
      )}
    </div>
  );
};
