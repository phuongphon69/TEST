import React, { useState, useRef } from 'react';
import { Project, ProjectKmlFile } from '../../types';
import { KmlBoundaryViewerModal } from './KmlBoundaryViewerModal';
import { readKmlOrKmzFile } from '../../utils/kmlParser';
import { UserAccountRepository } from '../../services/UserAccountRepository';
import { ProjectAssignmentService } from '../../services/ProjectAssignmentService';
import { getProjectYear } from '../../utils/projectYearUtils';
import { Lock, AlertCircle } from 'lucide-react';
import {
  formatVND,
  formatDateVN,
  PROJECT_STATUS_MAP
} from '../../utils/formatters';
import {
  Building2,
  MapPin,
  Calendar,
  UserCheck,
  FolderArchive,
  ExternalLink,
  Layers,
  FileText,
  Globe,
  Upload,
  FileCode,
  DollarSign,
  Map,
  Link as LinkIcon,
  FileCheck
} from 'lucide-react';

interface Props {
  project: Project;
  onEdit?: () => void;
  onUpdateProject?: (updatedProject: Project) => void;
}

export const ProjectGeneralTab: React.FC<Props> = ({ project, onEdit, onUpdateProject }) => {
  const [isKmlModalOpen, setIsKmlModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const statusInfo = PROJECT_STATUS_MAP[project.status] || {
    label: project.status,
    classNames: 'bg-slate-700 text-slate-300'
  };

  const kmlFilesList = project.kmlFiles || [];
  const coordFilesList = project.coordinateFiles || [];
  const scanFilesList = project.scanFiles || [];

  const handleUpdateKmlFiles = (newKmlFiles: ProjectKmlFile[]) => {
    if (onUpdateProject) {
      onUpdateProject({
        ...project,
        kmlFiles: newKmlFiles
      });
    }
  };

  const handleQuickFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const parsed = await readKmlOrKmzFile(files[0]);
      const updated = [parsed, ...kmlFilesList];
      handleUpdateKmlFiles(updated);
      setIsKmlModalOpen(true);
    } catch (err: any) {
      alert(`Lỗi đọc file KML/KMZ: ${err.message || 'File không hợp lệ'}`);
    }
  };

  const landHa = project.landAreaHa ?? project.areaHa ?? 0;
  const waterHa = project.underwaterAreaHa ?? 0;
  const totalHa = project.totalAreaHa ?? project.areaHa ?? (landHa + waterHa);

  return (
    <div className="space-y-6">
      {/* Overview Top Bar */}
      <div className="bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              {project.code}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${statusInfo.classNames}`}>
              {statusInfo.label}
            </span>
            {(project.workType || project.projectType) && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-amber-300 border border-slate-700 font-semibold">
                Công tác: {project.workType || project.projectType}
              </span>
            )}
            {project.sourceIncomingDocumentNumber && (
              <span className="px-2.5 py-0.5 rounded-full text-xs bg-sky-500/10 text-sky-300 border border-sky-500/30 flex items-center gap-1 font-mono">
                <LinkIcon className="w-3 h-3 text-sky-400" />
                VB đến số {project.sourceIncomingDocumentNumber} ({project.sourceIncomingDocumentSymbol || 'N/A'})
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-100">{project.name}</h2>
          <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-emerald-400" />
            {project.location ? `${project.location}, ` : ''}
            {project.commune ? `${project.commune}, ` : ''}
            {project.province}
          </p>
        </div>

        {onEdit && (
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-medium rounded-lg text-sm transition-colors flex items-center gap-2 shrink-0"
          >
            Chỉnh sửa thông tin
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* 1. Các đơn vị tham gia */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-amber-400 font-semibold text-base">
            <Building2 className="w-5 h-5" />
            Các đơn vị tham gia
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-400 text-xs">Chủ đầu tư:</div>
              <div className="font-medium text-slate-200">{project.investor || 'Chưa cập nhật'}</div>
            </div>
            {project.investorRepresentative && (
              <div>
                <div className="text-slate-400 text-xs">Đại diện chủ đầu tư:</div>
                <div className="font-medium text-slate-300">{project.investorRepresentative}</div>
              </div>
            )}
            <div>
              <div className="text-slate-400 text-xs">Đơn vị thi công (Chính):</div>
              <div className="font-medium text-amber-300">{project.contractorUnit || 'Trung tâm Công nghệ XLBMTT / BQP'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Đơn vị tư vấn:</div>
              <div className="font-medium text-slate-300">{project.consultantUnit || 'Chưa cập nhật'}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs">Đơn vị giám sát:</div>
              <div className="font-medium text-slate-300">{project.supervisorUnit || 'Ban BQLDA / Trung tâm KT Công binh'}</div>
            </div>
          </div>
        </div>

        {/* 2. Quy mô & Phạm vi khu vực */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-base">
              <Layers className="w-5 h-5" />
              Quy mô & Phạm vi khu vực
            </div>
            <button
              onClick={() => setIsKmlModalOpen(true)}
              className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Globe className="w-3.5 h-3.5" /> Bản đồ KML
            </button>
          </div>

          <div className="space-y-3 text-sm">
            {/* Split Areas: On land, Underwater, Total */}
            <div className="grid grid-cols-3 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400">Trên cạn</div>
                <div className="text-sm font-bold text-emerald-400">{landHa} ha</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Dưới nước</div>
                <div className="text-sm font-bold text-sky-400">{waterHa} ha</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400">Tổng diện tích</div>
                <div className="text-sm font-bold text-amber-400">{totalHa} ha</div>
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs">Tọa độ / Mô tả ranh giới:</div>
              <div className="text-slate-300 text-xs bg-slate-950 p-2 rounded-lg border border-slate-800 font-mono mt-1 break-all">
                {project.coordinatesBoundary || 'Chưa cập nhật mô tả tọa độ'}
              </div>
            </div>

            {/* Coordinate files (.txt, .doc, .docx, .xls, .xlsx) */}
            {coordFilesList.length > 0 && (
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1.5">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-emerald-400" />
                  Tệp tọa độ đính kèm ({coordFilesList.length}):
                </div>
                {coordFilesList.map(f => (
                  <div key={f.id} className="flex justify-between items-center text-xs text-slate-300">
                    <span className="truncate">{f.fileName}</span>
                    {f.fileUrl && (
                      <a href={f.fileUrl} download={f.fileName} className="text-emerald-400 hover:underline text-[11px]">
                        Tải
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* KML / KMZ Ranh Vị Trí Section */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-emerald-400" />
                  File KML / KMZ Ranh vị trí:
                </span>
                <span className="text-[10px] font-mono text-emerald-400">
                  {kmlFilesList.length} tệp
                </span>
              </div>

              {kmlFilesList.length > 0 ? (
                <div className="space-y-1.5">
                  {kmlFilesList.map((kml) => (
                    <div
                      key={kml.id}
                      onClick={() => setIsKmlModalOpen(true)}
                      className="p-2 bg-slate-900 hover:bg-slate-800/80 rounded-lg border border-slate-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="font-medium text-slate-200 truncate">{kml.fileName}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-[10px] font-mono text-slate-400">
                        <span className="text-emerald-400 font-bold">{kml.totalAreaHa || 0} ha</span>
                        <span className="bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded uppercase font-bold">{kml.fileType}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-xs text-center py-2 italic border border-dashed border-slate-800 rounded-lg">
                  Chưa có file KML/KMZ
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => setIsKmlModalOpen(true)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Map className="w-3.5 h-3.5" /> Bản đồ Ranh KML/KMZ
                </button>

                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".kml,.kmz"
                  onChange={handleQuickFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-amber-400" /> Thêm File
                </button>
              </div>
            </div>

            <div>
              <div className="text-slate-400 text-xs">Nguồn vốn dự án:</div>
              <div className="font-medium text-slate-200">{project.capitalSource || 'Ngân sách Nhà nước'}</div>
            </div>
          </div>
        </div>

        {/* 3. Thời gian & Hợp đồng */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-sky-400 font-semibold text-base">
            <Calendar className="w-5 h-5" />
            Thời gian & Hợp đồng
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-400 text-xs">Số hợp đồng:</div>
              <div className="font-mono text-amber-300 font-medium">{project.contractNumber || 'HĐ-RPBM/2026/01'}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400">Ngày ký:</span>{' '}
                <span className="text-slate-200 font-medium">{formatDateVN(project.contractSigningDate || project.startDate)}</span>
              </div>
              <div>
                <span className="text-slate-400">Thời hạn HĐ:</span>{' '}
                <span className="text-slate-200 font-medium">{project.contractDurationDays || 180} ngày</span>
              </div>
            </div>
            <div className="space-y-1 bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Ngày khởi công:</span>
                <span className="text-emerald-400 font-medium">{formatDateVN(project.startDate)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Dự kiến hoàn thành:</span>
                <span className="text-sky-400 font-medium">{formatDateVN(project.expectedCompletionDate || project.endDate)}</span>
              </div>
              {project.actualCompletionDate && (
                <div className="flex justify-between text-xs pt-1 border-t border-slate-800">
                  <span className="text-slate-400">Hoàn thành thực tế:</span>
                  <span className="text-emerald-300 font-bold">{formatDateVN(project.actualCompletionDate)}</span>
                </div>
              )}
            </div>
            <div>
              <div className="text-slate-400 text-xs">Tiến độ thực hiện:</div>
              <div className="flex items-center gap-3 mt-1">
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, project.progressPercent || 0)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-emerald-400 font-mono">{project.progressPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Giá trị hợp đồng & Ngân sách */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-purple-400 font-semibold text-base">
            <DollarSign className="w-5 h-5" />
            Giá trị hợp đồng & Ngân sách
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Giá trị hợp đồng:</span>
              <span className="text-amber-400 font-bold text-sm">{formatVND(project.contractValue || project.budgetVnd)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Giá trị phần việc RPBM:</span>
              <span className="text-emerald-400 font-semibold">{formatVND(project.rpbmValue || project.budgetVnd * 0.85)}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-800">
              <span className="text-slate-400">Đã thanh toán:</span>
              <span className="text-sky-400 font-semibold">{formatVND(project.paidValue || 0)}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Giá trị còn lại:</span>
              <span className="text-rose-400 font-semibold">{formatVND(project.remainingValue || project.budgetVnd)}</span>
            </div>
          </div>
        </div>

        {/* 5. Nhân sự chỉ huy */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-indigo-400 font-semibold text-base">
            <UserCheck className="w-5 h-5" />
            Nhân sự chỉ huy & Lực lượng
          </div>
          <div className="space-y-3 text-sm">
            <div>
              <div className="text-slate-400 text-xs">Chỉ huy trưởng công trường:</div>
              <div className="font-bold text-amber-300">{project.commanderName}</div>
            </div>
            <div>
              <div className="text-slate-400 text-xs mb-1">Người phụ trách dự án (Tài khoản hệ thống):</div>
              {(() => {
                const respId = project.responsibleUserId || project.projectManagerId;
                const respName = project.responsibleName || project.projectManager;
                const users = UserAccountRepository.getAll();
                const matchedUser = users.find(u => u.id === respId);

                if (matchedUser) {
                  const isLocked = matchedUser.isLocked || matchedUser.status === 'locked';
                  return (
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                      <div className="font-semibold text-slate-100 flex items-center gap-1.5 flex-wrap">
                        <span>{matchedUser.name}</span>
                        {isLocked && (
                          <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-semibold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Tài khoản đã khóa
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{matchedUser.title || 'Cán bộ quản lý'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">📧 {matchedUser.email}</div>
                    </div>
                  );
                }

                if (respName && respName.trim()) {
                  const legacyMap = ProjectAssignmentService.mapLegacyResponsiblePerson(respName, users);
                  if (legacyMap.user) {
                    return (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <div className="font-semibold text-slate-100">{legacyMap.user.name}</div>
                        <div className="text-xs text-slate-400">{legacyMap.user.title || 'Cán bộ quản lý'}</div>
                        <div className="text-[11px] text-slate-500 font-mono">📧 {legacyMap.user.email}</div>
                      </div>
                    );
                  }

                  return (
                    <div className="bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/60 space-y-1">
                      <div className="font-semibold text-amber-200">{respName}</div>
                      <div className="text-[11px] text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>Người phụ trách cũ chưa được liên kết với tài khoản hệ thống</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="text-slate-500 italic text-xs">Chưa phân công người phụ trách</div>
                );
              })()}
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Năm dự án:</span>
              <span className="text-amber-400 font-bold font-mono">
                {getProjectYear(project) ? `Năm ${getProjectYear(project)}` : 'Chưa xác định'}
              </span>
            </div>
            <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
              <span className="text-slate-400">Quy mô đội thi công:</span>
              <span className="text-indigo-400 font-bold">{project.teamSize || 18} cán bộ, chiến sĩ</span>
            </div>
          </div>
        </div>

        {/* 6. Hồ sơ scan dự án & Lưu trữ Drive */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-4 shadow-lg">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 text-teal-400 font-semibold text-base">
            <FolderArchive className="w-5 h-5" />
            Hồ sơ scan dự án & Google Drive
          </div>
          <div className="space-y-3 text-sm">
            {/* Scan Files */}
            <div>
              <div className="text-slate-400 text-xs mb-1 flex items-center justify-between">
                <span>Bản scan hồ sơ dự án (PDF):</span>
                <span className="text-teal-400 font-mono text-[10px]">{scanFilesList.length} tệp</span>
              </div>
              {scanFilesList.length > 0 ? (
                <div className="space-y-1.5 max-h-32 overflow-y-auto pt-1">
                  {scanFilesList.map(file => (
                    <div key={file.id} className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex justify-between items-center text-xs">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span className="text-slate-200 truncate font-medium">{file.fileName}</span>
                      </div>
                      {file.fileUrl && (
                        <a href={file.fileUrl} download={file.fileName} className="text-teal-400 hover:underline text-[11px] font-semibold shrink-0">
                          Tải về
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic text-xs bg-slate-950 p-2 rounded-lg border border-slate-800">
                  Chưa đính kèm tệp scan PDF
                </div>
              )}
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Thư mục Google Drive dự án:</div>
              {project.driveFolderUrl ? (
                <a
                  href={project.driveFolderUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Mở Thư mục Google Drive
                </a>
              ) : (
                <span className="text-slate-500 italic text-xs">Chưa gắn liên kết Drive</span>
              )}
            </div>

            <div>
              <div className="text-slate-400 text-xs mb-1">Ghi chú & Chỉ đạo:</div>
              <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap">
                {project.notes || 'Không có ghi chú thêm.'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive KML Boundary Viewer Modal */}
      <KmlBoundaryViewerModal
        project={project}
        isOpen={isKmlModalOpen}
        onClose={() => setIsKmlModalOpen(false)}
        onUpdateProjectKml={handleUpdateKmlFiles}
      />
    </div>
  );
};
