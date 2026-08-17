import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  Folder,
  FolderPlus,
  FileText,
  File,
  Image as ImageIcon,
  FileSpreadsheet,
  Upload,
  Search,
  Download,
  Trash2,
  Lock,
  Eye,
  History,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Users,
  RefreshCw,
  Plus,
  ShieldCheck,
  FileCode,
  Sliders,
  X,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  Info,
  Layers,
  Check
} from 'lucide-react';
import {
  DriveFileItem,
  DriveFolderItem,
  DriveFileType,
  DriveAccessPermission,
  DriveFileVersion,
  Project
} from '../types';
import {
  getDriveFolders,
  getDriveFiles,
  saveDriveFolders,
  saveDriveFiles,
  ensureProjectDriveFolders,
  formatStandardFilename,
  checkDuplicateFileName,
  deleteDriveFileConfirmed,
  addFileVersionToDrive,
  updateFileAccessPermission,
  getFolderBreadcrumbs,
  PROJECT_SUBFOLDERS
} from '../utils/driveStorage';
import { getProjects, getCurrentUser, addAuditLog } from '../utils/storage';
import { formatDateVN, formatFileSize } from '../utils/formatters';

export const GoogleDriveManager: React.FC = () => {
  const [folders, setFolders] = useState<DriveFolderItem[]>(getDriveFolders());
  const [files, setFiles] = useState<DriveFileItem[]>(getDriveFiles());
  const projects: Project[] = getProjects();
  const currentUser = getCurrentUser();

  // Active navigation state
  const [selectedFolderId, setSelectedFolderId] = useState<string>('folder-root');
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>(['folder-root', 'folder-04-da', 'folder-da001']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFileTypeFilter, setSelectedFileTypeFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');

  // Modals state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAutoProjectFoldersModal, setShowAutoProjectFoldersModal] = useState(false);
  const [selectedProjectForAutoFolder, setSelectedProjectForAutoFolder] = useState<string>(projects[0]?.code || 'DA001');

  // Preview Modal
  const [previewFile, setPreviewFile] = useState<DriveFileItem | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(100);
  const [previewRotation, setPreviewRotation] = useState<number>(0);
  const [previewPage, setPreviewPage] = useState<number>(1);

  // Deletion Confirmation Modal
  const [deleteConfirmFile, setDeleteConfirmFile] = useState<DriveFileItem | null>(null);

  // Versioning Modal
  const [versionHistoryFile, setVersionHistoryFile] = useState<DriveFileItem | null>(null);
  const [newVersionComment, setNewVersionComment] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

  // Permission Modal
  const [permissionFile, setPermissionFile] = useState<DriveFileItem | null>(null);
  const [newPermission, setNewPermission] = useState<DriveAccessPermission>('editor');
  const [newSharedEmail, setNewSharedEmail] = useState('');
  const [sharedEmailsList, setSharedEmailsList] = useState<string[]>([]);

  // File Upload Form State
  const [uploadTargetFolderId, setUploadTargetFolderId] = useState<string>('folder-da001-7');
  const [uploadProjectCode, setUploadProjectCode] = useState<string>('DA001');
  const [uploadCategory, setUploadCategory] = useState<string>('BienBanNghiemThu');
  const [uploadDocNum, setUploadDocNum] = useState<string>('05');
  const [uploadDateStr, setUploadDateStr] = useState<string>(new Date().toISOString().slice(0, 10).replace(/-/g, ''));
  const [uploadVersionStr, setUploadVersionStr] = useState<string>('V01');
  const [uploadFileType, setUploadFileType] = useState<DriveFileType>('pdf');
  const [customFileName, setCustomFileName] = useState<string>('');
  const [selectedRawFile, setSelectedRawFile] = useState<File | null>(null);

  // Duplicate Alert State inside upload
  const [duplicateAlert, setDuplicateAlert] = useState<{
    existingFile: DriveFileItem;
    candidateName: string;
  } | null>(null);

  const reloadDriveData = () => {
    setFolders(getDriveFolders());
    setFiles(getDriveFiles());
  };

  useEffect(() => {
    setUploadTargetFolderId(selectedFolderId);
  }, [selectedFolderId]);

  // Toggle tree node collapse/expand
  const toggleFolderExpand = (folderId: string) => {
    setExpandedFolderIds(prev =>
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Auto Project Folder Generation (Requirement: Tạo thư mục dự án tự động)
  const handleAutoCreateProjectFolders = (pCode: string) => {
    const targetProj = projects.find(p => p.code === pCode);
    const pName = targetProj ? targetProj.name : `Du_an_${pCode}`;
    const newFolder = ensureProjectDriveFolders(pCode, pName);
    reloadDriveData();
    setSelectedFolderId(newFolder.id);
    if (!expandedFolderIds.includes('folder-04-da')) {
      setExpandedFolderIds(prev => [...prev, 'folder-04-da', newFolder.id]);
    }
    setShowAutoProjectFoldersModal(false);
    alert(`✅ Đã tự động khởi tạo cấu trúc 9 thư mục Google Drive chuẩn QLRPBM cho Dự án ${pCode}!`);
  };

  // Calculate Standard Filename Generator Output
  const generatedStandardName = formatStandardFilename(
    uploadProjectCode,
    uploadCategory,
    uploadDocNum,
    uploadDateStr,
    uploadVersionStr,
    uploadFileType === 'pdf' ? 'pdf' : uploadFileType === 'image' ? 'png' : uploadFileType === 'docx' ? 'docx' : 'xlsx'
  );

  const finalUploadName = customFileName.trim() || generatedStandardName;

  // Handle File Selection for Upload
  const handleSelectRawFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedRawFile(file);
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (ext === 'pdf') setUploadFileType('pdf');
      else if (['png', 'jpg', 'jpeg', 'webp'].includes(ext || '')) setUploadFileType('image');
      else if (['doc', 'docx'].includes(ext || '')) setUploadFileType('docx');
      else if (['xls', 'xlsx'].includes(ext || '')) setUploadFileType('xlsx');
      else if (['dwg', 'dxf'].includes(ext || '')) setUploadFileType('cad');

      setCustomFileName(file.name);
    }
  };

  // Submit File Upload with Duplicate Detection
  const handleExecuteUpload = (overrideMode?: 'bump' | 'overwrite' | 'copy') => {
    const targetFolder = folders.find(f => f.id === uploadTargetFolderId) || folders[0];
    
    // Check duplicate
    const duplicate = checkDuplicateFileName(uploadTargetFolderId, finalUploadName);

    if (duplicate && !overrideMode) {
      setDuplicateAlert({
        existingFile: duplicate,
        candidateName: finalUploadName
      });
      return;
    }

    let fileNameToUse = finalUploadName;
    if (overrideMode === 'copy') {
      fileNameToUse = finalUploadName.replace(/(\.[^.]+)$/, `_copy${Date.now().toString().slice(-4)}$1`);
    }

    if (overrideMode === 'bump' && duplicate) {
      // Add version to existing file
      const res = addFileVersionToDrive(
        duplicate.id,
        fileNameToUse,
        selectedRawFile ? selectedRawFile.size : 2500000,
        `Cập nhật phiên bản mới qua Trình tải lên Google Drive`
      );
      if (res) {
        alert(`✅ Đã cập nhật thành công phiên bản mới cho file "${duplicate.name}"!`);
        reloadDriveData();
        setShowUploadModal(false);
        setDuplicateAlert(null);
      }
      return;
    }

    // New File Creation
    const newFileItem: DriveFileItem = {
      id: `file-drive-${Date.now()}`,
      name: fileNameToUse,
      folderId: uploadTargetFolderId,
      path: `${targetFolder.path}/${fileNameToUse}`,
      fileType: uploadFileType,
      mimeType: uploadFileType === 'pdf' ? 'application/pdf' : uploadFileType === 'image' ? 'image/png' : 'application/octet-stream',
      size: selectedRawFile ? selectedRawFile.size : 2800000,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      uploadedBy: currentUser.name,
      projectCode: uploadProjectCode,
      docCategory: uploadCategory,
      documentNumber: uploadDocNum,
      version: uploadVersionStr,
      permission: 'editor',
      sharedWith: [currentUser.name],
      isProtected: true,
      versions: [
        {
          id: `ver-init-${Date.now()}`,
          versionName: `${uploadVersionStr}.0`,
          fileName: fileNameToUse,
          fileSize: selectedRawFile ? selectedRawFile.size : 2800000,
          uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          uploadedBy: currentUser.name,
          comment: 'Tải lên ban đầu chuẩn hóa tên file QLRPBM',
          isCurrent: true
        }
      ],
      webPreviewUrl: uploadFileType === 'image' ? 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80' : undefined
    };

    let updatedFilesList = files;
    if (overrideMode === 'overwrite' && duplicate) {
      updatedFilesList = files.filter(f => f.id !== duplicate.id);
    }

    const finalFiles = [newFileItem, ...updatedFilesList];
    saveDriveFiles(finalFiles);
    reloadDriveData();

    addAuditLog(
      'Google Drive',
      `Tải file lên đúng thư mục Google Drive: ${fileNameToUse} (${targetFolder.path})`,
      'tai_len',
      null,
      newFileItem
    );

    setShowUploadModal(false);
    setDuplicateAlert(null);
    setSelectedRawFile(null);
    alert(`✅ Tải file lên Google Drive thành công!\nVị trí: ${targetFolder.path}`);
  };

  // Confirm File Deletion (Mandatory Confirmation Requirement)
  const handleExecuteDeleteFile = () => {
    if (!deleteConfirmFile) return;
    const res = deleteDriveFileConfirmed(deleteConfirmFile.id);
    if (res) {
      alert(`✅ Đã xóa an toàn file "${deleteConfirmFile.name}" khỏi Google Drive.`);
      reloadDriveData();
      setDeleteConfirmFile(null);
    }
  };

  // Submit New Version Upload
  const handleExecuteUploadNewVersion = () => {
    if (!versionHistoryFile) return;
    const newName = newVersionFile ? newVersionFile.name : versionHistoryFile.name;
    const newSize = newVersionFile ? newVersionFile.size : versionHistoryFile.size + 150000;

    const updated = addFileVersionToDrive(
      versionHistoryFile.id,
      newName,
      newSize,
      newVersionComment || 'Cập nhật phiên bản qua quản lý phiên bản'
    );

    if (updated) {
      alert('✅ Tải lên phiên bản mới thành công!');
      reloadDriveData();
      setVersionHistoryFile(updated);
      setNewVersionComment('');
      setNewVersionFile(null);
    }
  };

  // Submit Access Control Update
  const handleExecuteUpdatePermission = () => {
    if (!permissionFile) return;
    updateFileAccessPermission(permissionFile.id, newPermission, sharedEmailsList);
    alert('✅ Đã cập nhật quyền truy cập file Google Drive thành công!');
    reloadDriveData();
    setPermissionFile(null);
  };

  // Breadcrumbs for current folder
  const currentFolder = folders.find(f => f.id === selectedFolderId) || folders[0];
  const breadcrumbs = getFolderBreadcrumbs(selectedFolderId);

  // Filter files in active view
  const currentFolderFiles = files.filter(f => {
    const isDirectChild = f.folderId === selectedFolderId;
    const matchSearch =
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.projectCode && f.projectCode.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase());

    const matchType = selectedFileTypeFilter === 'all' || f.fileType === selectedFileTypeFilter;

    return isDirectChild && matchSearch && matchType;
  });

  // Render Tree Folder Item recursively
  const renderFolderTreeNode = (folder: DriveFolderItem, depth: number = 0) => {
    const subFolders = folders.filter(f => f.parentId === folder.id);
    const hasChildren = subFolders.length > 0;
    const isExpanded = expandedFolderIds.includes(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => setSelectedFolderId(folder.id)}
          style={{ paddingLeft: `${depth * 14 + 10}px` }}
          className={`flex items-center justify-between py-1.5 pr-2 rounded-lg text-xs cursor-pointer transition-colors ${
            isSelected
              ? 'bg-emerald-950/80 text-emerald-300 font-bold border border-emerald-800/80'
              : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
          }`}
        >
          <div className="flex items-center gap-1.5 overflow-hidden">
            {hasChildren ? (
              <span
                onClick={e => {
                  e.stopPropagation();
                  toggleFolderExpand(folder.id);
                }}
                className="p-0.5 hover:text-white text-slate-500 rounded"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </span>
            ) : (
              <span className="w-3.5 inline-block"></span>
            )}

            <Folder className={`w-4 h-4 shrink-0 ${folder.isProjectRootFolder ? 'text-amber-400' : 'text-emerald-400'}`} />
            <span className="truncate">{folder.name}</span>
          </div>

          {folder.isProjectRootFolder && (
            <span className="text-[9px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono shrink-0">
              {folder.projectCode}
            </span>
          )}
        </div>

        {hasChildren && isExpanded && (
          <div className="space-y-0.5">
            {subFolders.map(child => renderFolderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const rootFolder = folders.find(f => f.parentId === null) || folders[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HardDrive className="w-6 h-6 text-emerald-400" />
            Tích hợp Google Drive & Quản lý Thư mục Tự động (Mục 19)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Cấu trúc phân cấp chuẩn QLRPBM (Văn bản đến, Văn bản đi, Dự án 9 thư mục con, Nhân sự, Thiết bị, Kho hồ sơ). Xem trước PDF/Hình ảnh, Kiểm soát quyền & Quản lý phiên bản.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto">
          <button
            onClick={() => setShowAutoProjectFoldersModal(true)}
            className="bg-amber-700 hover:bg-amber-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-950 transition-colors"
          >
            <FolderPlus className="w-4 h-4" /> Tạo Thư mục Dự án Tự động
          </button>

          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors"
          >
            <Upload className="w-4 h-4" /> Tải File lên Google Drive
          </button>
        </div>
      </div>

      {/* Main Workspace Layout (Left Tree + Right Explorer) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT PANEL: Directory Tree Hierarchy */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl space-y-3 lg:col-span-1">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-400" /> Cấu trúc Thư mục QLRPBM
            </h3>
            <button
              onClick={reloadDriveData}
              className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              title="Làm mới đồng bộ Google Drive"
            >
              <RefreshCw className="w-3 h-3" /> Sync
            </button>
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-1 space-y-1">
            {renderFolderTreeNode(rootFolder, 0)}
          </div>
        </div>

        {/* RIGHT PANEL: File Explorer */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4 lg:col-span-3 flex flex-col">
          {/* Breadcrumbs Navigation Bar */}
          <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1 text-slate-400 overflow-x-auto py-0.5">
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.id}>
                  {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />}
                  <button
                    onClick={() => setSelectedFolderId(b.id)}
                    className={`hover:text-emerald-400 font-mono text-[11px] whitespace-nowrap ${
                      b.id === selectedFolderId ? 'text-emerald-300 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {b.name}
                  </button>
                </React.Fragment>
              ))}
            </div>

            <div className="text-[11px] font-mono text-slate-500">
              Tổng số: <strong className="text-emerald-400">{currentFolderFiles.length}</strong> file(s)
            </div>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tên file, mã dự án, người tải lên trong thư mục..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedFileTypeFilter}
                onChange={e => setSelectedFileTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="all">Tất cả định dạng</option>
                <option value="pdf">📄 PDF Documents</option>
                <option value="image">🖼️ Hình ảnh (PNG/JPG)</option>
                <option value="docx">📝 Word (.docx)</option>
                <option value="xlsx">📊 Excel (.xlsx)</option>
                <option value="cad">📐 Bản vẽ CAD (.dwg)</option>
              </select>

              <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg text-xs ${viewMode === 'table' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                  title="Chế độ Bảng"
                >
                  <FileText className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs ${viewMode === 'grid' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                  title="Chế độ Lưới Grid"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* File Contents List */}
          {currentFolderFiles.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-xs space-y-2 border border-dashed border-slate-800 rounded-2xl my-auto">
              <Folder className="w-10 h-10 text-slate-600 mx-auto opacity-60" />
              <p>Thư mục hiện tại chưa có file nào.</p>
              <button
                onClick={() => setShowUploadModal(true)}
                className="text-emerald-400 hover:underline font-semibold text-xs"
              >
                + Click vào đây để tải file lên thư mục này
              </button>
            </div>
          ) : viewMode === 'table' ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Tên File Google Drive</th>
                    <th className="p-3">Dự án / Loại</th>
                    <th className="p-3">Dung lượng</th>
                    <th className="p-3">Phiên bản</th>
                    <th className="p-3">Quyền truy cập</th>
                    <th className="p-3">Ngày cập nhật</th>
                    <th className="p-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                  {currentFolderFiles.map(file => (
                    <tr key={file.id} className="hover:bg-slate-900/80 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-2.5">
                          {file.fileType === 'pdf' ? (
                            <FileText className="w-5 h-5 text-rose-400 shrink-0" />
                          ) : file.fileType === 'image' ? (
                            <ImageIcon className="w-5 h-5 text-sky-400 shrink-0" />
                          ) : file.fileType === 'xlsx' ? (
                            <FileSpreadsheet className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <File className="w-5 h-5 text-amber-400 shrink-0" />
                          )}
                          <span
                            onClick={() => setPreviewFile(file)}
                            className="font-semibold text-white hover:text-emerald-300 cursor-pointer truncate max-w-xs"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                        </div>
                      </td>
                      <td className="p-3">
                        {file.projectCode && (
                          <span className="text-[10px] bg-slate-900 text-amber-300 border border-amber-800/80 px-2 py-0.5 rounded font-mono font-bold mr-1">
                            {file.projectCode}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400">{file.docCategory || 'Tài liệu'}</span>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{formatFileSize(file.size)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => setVersionHistoryFile(file)}
                          className="text-[10px] bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1"
                          title="Click xem lịch sử phiên bản"
                        >
                          <History className="w-3 h-3 text-emerald-400" /> {file.version} ({file.versions.length} ver)
                        </button>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setPermissionFile(file);
                            setNewPermission(file.permission);
                            setSharedEmailsList(file.sharedWith || []);
                          }}
                          className="text-[10px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded font-mono flex items-center gap-1"
                        >
                          <Lock className="w-3 h-3 text-sky-400" /> {file.permission.toUpperCase()}
                        </button>
                      </td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{formatDateVN(file.updatedAt)}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewFile(file)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg text-xs"
                            title="Xem trước PDF/Hình ảnh"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setVersionHistoryFile(file)}
                            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg text-xs"
                            title="Quản lý phiên bản"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmFile(file)}
                            className="p-1.5 bg-rose-950/60 hover:bg-rose-900 text-rose-300 rounded-lg text-xs"
                            title="Xóa an toàn (Cần xác nhận)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {currentFolderFiles.map(file => (
                <div
                  key={file.id}
                  className="bg-slate-950 border border-slate-800 hover:border-emerald-500/50 p-4 rounded-xl text-xs space-y-3 flex flex-col justify-between transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      {file.fileType === 'pdf' ? (
                        <span className="bg-rose-950 text-rose-300 border border-rose-800 px-2 py-0.5 rounded text-[10px] font-bold">PDF</span>
                      ) : file.fileType === 'image' ? (
                        <span className="bg-sky-950 text-sky-300 border border-sky-800 px-2 py-0.5 rounded text-[10px] font-bold">IMAGE</span>
                      ) : (
                        <span className="bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded text-[10px] font-bold">DOC</span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">{formatFileSize(file.size)}</span>
                    </div>

                    <strong
                      onClick={() => setPreviewFile(file)}
                      className="text-white hover:text-emerald-400 cursor-pointer block line-clamp-2"
                      title={file.name}
                    >
                      {file.name}
                    </strong>
                  </div>

                  <div className="pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>{file.version}</span>
                    <div className="flex items-center gap-1">
                      <button onClick={() => setPreviewFile(file)} className="p-1 hover:text-sky-400"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setVersionHistoryFile(file)} className="p-1 hover:text-emerald-400"><History className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeleteConfirmFile(file)} className="p-1 hover:text-rose-400"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL 1: AUTO CREATE PROJECT FOLDERS */}
      {showAutoProjectFoldersModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-400" /> Tạo Cấu trúc 9 Thư mục Tự động
              </h3>
              <button onClick={() => setShowAutoProjectFoldersModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Hệ thống sẽ tự động tạo thư mục dự án bên trong <strong>04_Du_an</strong> và tự động sinh 9 thư mục con chuẩn nghiệp vụ:
              </p>

              <div className="bg-slate-950 p-3 rounded-xl space-y-1 font-mono text-[11px] text-amber-300/90 max-h-40 overflow-y-auto border border-slate-800">
                {PROJECT_SUBFOLDERS.map((sub, i) => (
                  <div key={sub}>├── {sub}</div>
                ))}
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Chọn Dự án để khởi tạo:</label>
                <select
                  value={selectedProjectForAutoFolder}
                  onChange={e => setSelectedProjectForAutoFolder(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-amber-500"
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.code}>
                      [{p.code}] - {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAutoProjectFoldersModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleAutoCreateProjectFolders(selectedProjectForAutoFolder)}
                className="bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-amber-950"
              >
                <Check className="w-4 h-4" /> Khởi tạo Thư mục Ngay
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: UPLOAD FILE WITH STANDARDIZED NAMING & DUPLICATE DETECTION */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" /> Tải File lên Google Drive & Đặt tên Chuẩn hóa
              </h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Duplicate File Alert Warning */}
            {duplicateAlert && (
              <div className="bg-amber-950/60 border border-amber-800 p-4 rounded-xl text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400" /> Phát hiện File Trùng tên trong Thư mục Target!
                </div>
                <p className="text-amber-200/90">
                  Tệp tên <strong>"{duplicateAlert.candidateName}"</strong> đã tồn tại trong thư mục mục tiêu (Size: {formatFileSize(duplicateAlert.existingFile.size)}, Ver: {duplicateAlert.existingFile.version}).
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    onClick={() => handleExecuteUpload('bump')}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-semibold text-xs flex items-center gap-1"
                  >
                    <History className="w-3.5 h-3.5" /> Tạo phiên bản mới (V02)
                  </button>
                  <button
                    onClick={() => handleExecuteUpload('overwrite')}
                    className="bg-rose-700 hover:bg-rose-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs"
                  >
                    Ghi đè file
                  </button>
                  <button
                    onClick={() => handleExecuteUpload('copy')}
                    className="bg-sky-700 hover:bg-sky-600 text-white px-3 py-1.5 rounded-lg font-semibold text-xs"
                  >
                    Tự động đổi tên copy
                  </button>
                  <button
                    onClick={() => setDuplicateAlert(null)}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4 text-xs">
              {/* Target Folder Select */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Thư mục Đích Google Drive:</label>
                <select
                  value={uploadTargetFolderId}
                  onChange={e => setUploadTargetFolderId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-300 rounded-xl p-2.5 text-xs font-mono focus:outline-none focus:border-emerald-500"
                >
                  {folders.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.path}
                    </option>
                  ))}
                </select>
              </div>

              {/* Standardized Naming Convention Tool */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                  <span className="font-bold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Trình Đặt Tên File Chuẩn hóa: [Mã dự án]_[Loại hồ sơ]_[Số văn bản]_[Ngày]_[Phiên bản]
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <span className="text-slate-400 text-[10px]">1. Mã dự án</span>
                    <input
                      type="text"
                      value={uploadProjectCode}
                      onChange={e => setUploadProjectCode(e.target.value)}
                      placeholder="DA001"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">2. Loại hồ sơ</span>
                    <input
                      type="text"
                      value={uploadCategory}
                      onChange={e => setUploadCategory(e.target.value)}
                      placeholder="BienBanNghiemThu"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">3. Số văn bản</span>
                    <input
                      type="text"
                      value={uploadDocNum}
                      onChange={e => setUploadDocNum(e.target.value)}
                      placeholder="05"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px]">4. Phiên bản</span>
                    <input
                      type="text"
                      value={uploadVersionStr}
                      onChange={e => setUploadVersionStr(e.target.value)}
                      placeholder="V01"
                      className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-1.5 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="p-2.5 bg-slate-900 rounded-lg text-emerald-300 font-mono text-[11px] flex items-center justify-between border border-slate-800">
                  <span className="truncate">Tên gợi ý: <strong>{generatedStandardName}</strong></span>
                  <button
                    type="button"
                    onClick={() => setCustomFileName(generatedStandardName)}
                    className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded font-bold shrink-0 ml-2 hover:bg-emerald-900"
                  >
                    Áp dụng tên này
                  </button>
                </div>
              </div>

              {/* Final Filename */}
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên file thực tế lưu trữ trên Google Drive:</label>
                <input
                  type="text"
                  value={customFileName}
                  onChange={e => setCustomFileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white font-mono rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Select Raw File */}
              <div className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 p-6 rounded-xl text-center space-y-2 cursor-pointer bg-slate-950/50">
                <input type="file" onChange={handleSelectRawFile} className="hidden" id="drive-raw-file-input" />
                <label htmlFor="drive-raw-file-input" className="cursor-pointer block space-y-2">
                  <Upload className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-slate-300 font-semibold">
                    {selectedRawFile ? `Đã chọn: ${selectedRawFile.name} (${formatFileSize(selectedRawFile.size)})` : 'Kéo thả tệp hoặc Bấm để chọn file từ máy tính'}
                  </p>
                  <p className="text-[10px] text-slate-500">Hỗ trợ PDF, PNG/JPG, Word (.docx), Excel (.xlsx), CAD (.dwg)</p>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowUploadModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={() => handleExecuteUpload()}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950"
              >
                <Upload className="w-4 h-4" /> Tải Lên Google Drive
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: INTERACTIVE PDF AND IMAGE PREVIEWER */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Top Toolbar */}
            <div className="bg-slate-950 border-b border-slate-800 p-3 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 overflow-hidden">
                {previewFile.fileType === 'pdf' ? <FileText className="w-5 h-5 text-rose-400 shrink-0" /> : <ImageIcon className="w-5 h-5 text-sky-400 shrink-0" />}
                <span className="font-bold text-white truncate max-w-sm" title={previewFile.name}>{previewFile.name}</span>
                <span className="text-[10px] bg-slate-900 text-emerald-400 border border-slate-800 px-2 py-0.5 rounded font-mono">{previewFile.version}</span>
              </div>

              {/* View Controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewZoom(prev => Math.max(50, prev - 25))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Thu nhỏ"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>

                <span className="text-[11px] font-mono text-slate-400 min-w-[40px] text-center">{previewZoom}%</span>

                <button
                  onClick={() => setPreviewZoom(prev => Math.min(200, prev + 25))}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Phóng to"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPreviewRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                  title="Xoay hình"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                </button>

                <div className="h-4 w-px bg-slate-800 my-auto"></div>

                <button
                  onClick={() => window.print()}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-lg"
                  title="In tài liệu"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 bg-slate-800 hover:bg-slate-700 text-rose-400 rounded-lg font-bold"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Main Viewer Body */}
            <div className="flex-1 overflow-auto bg-slate-950 p-6 flex items-center justify-center">
              {previewFile.fileType === 'pdf' ? (
                <div
                  style={{ transform: `scale(${previewZoom / 100})`, transformOrigin: 'top center' }}
                  className="transition-transform duration-200 w-full max-w-3xl"
                >
                  {previewFile.contentPdfHtml ? (
                    <div dangerouslySetInnerHTML={{ __html: previewFile.contentPdfHtml }} className="shadow-2xl rounded-lg overflow-hidden" />
                  ) : (
                    <div className="bg-white text-slate-900 p-8 rounded-xl shadow-2xl space-y-4 max-w-2xl mx-auto font-sans">
                      <div className="text-center border-b pb-4">
                        <h3 className="text-lg font-bold text-slate-900 uppercase">TÀI LIỆU CÔNG TRƯỜNG RÀ PHÁ BOM MÌN</h3>
                        <p className="text-xs text-slate-500">Mã file: {previewFile.name}</p>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        Tài liệu nghiệm thu và nhật ký kỹ thuật đã được chứng thực điện tử lưu trữ trực tiếp trên hệ thống Google Drive dự án <strong>{previewFile.projectCode || 'QLRPBM'}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              ) : previewFile.fileType === 'image' ? (
                <div style={{ transform: `scale(${previewZoom / 100}) rotate(${previewRotation}deg)` }} className="transition-transform duration-200">
                  <img
                    src={previewFile.webPreviewUrl || 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1000&auto=format&fit=crop&q=80'}
                    alt={previewFile.name}
                    className="max-h-[70vh] rounded-xl shadow-2xl object-contain border border-slate-800"
                  />
                </div>
              ) : (
                <div className="text-center space-y-3">
                  <FileText className="w-16 h-16 text-amber-400 mx-auto" />
                  <p className="text-slate-300 text-sm font-semibold">{previewFile.name}</p>
                  <p className="text-xs text-slate-500">Xem trước trực tuyến sẵn sàng cho PDF và Hình ảnh. Click bên dưới để tải file gốc.</p>
                </div>
              )}
            </div>

            {/* Bottom Metadata Bar */}
            <div className="bg-slate-950 border-t border-slate-800 p-3 flex flex-wrap items-center justify-between text-[11px] text-slate-400 font-mono">
              <div>Đường dẫn: <span className="text-emerald-300">{previewFile.path}</span></div>
              <div>Người tải: <span className="text-slate-200">{previewFile.uploadedBy}</span> ({formatDateVN(previewFile.createdAt)})</div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETION SAFETY CONFIRMATION (Requirement: Không xóa file khi chưa xác nhận) */}
      {deleteConfirmFile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-800/80 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 border-b border-rose-900/60 pb-3">
              <div className="p-2.5 bg-rose-950 rounded-xl border border-rose-800">
                <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Xác nhận Xóa File trên Google Drive</h3>
                <p className="text-[11px] text-rose-300">File trên Google Drive CHỈ bị xóa khi bạn xác nhận trực tiếp.</p>
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div>Tên file: <strong className="text-white block font-mono text-[11px]">{deleteConfirmFile.name}</strong></div>
              <div>Vị trí: <span className="text-emerald-400 font-mono text-[11px]">{deleteConfirmFile.path}</span></div>
              <div>Dung lượng: <span className="text-slate-400 font-mono">{formatFileSize(deleteConfirmFile.size)}</span></div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmFile(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy bỏ (Giữ lại file)
              </button>
              <button
                onClick={handleExecuteDeleteFile}
                className="bg-rose-700 hover:bg-rose-600 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-rose-950"
              >
                <Trash2 className="w-4 h-4" /> Xác nhận Xóa File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: FILE VERSIONING MANAGEMENT */}
      {versionHistoryFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-emerald-400" /> Quản lý Lịch sử Phiên bản Tệp Google Drive
              </h3>
              <button onClick={() => setVersionHistoryFile(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">File: <strong className="text-white">{versionHistoryFile.name}</strong></div>
                <div className="text-slate-400 text-[11px]">Phiên bản hiện tại: <strong className="text-emerald-400">{versionHistoryFile.version}</strong></div>
              </div>

              {/* Version History List */}
              <div className="space-y-2">
                <label className="text-slate-300 font-semibold block">Các phiên bản đã lưu trữ ({versionHistoryFile.versions.length}):</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {versionHistoryFile.versions.map(v => (
                    <div
                      key={v.id}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                        v.isCurrent ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{v.versionName}</span>
                          {v.isCurrent && <span className="text-[9px] bg-emerald-900 text-emerald-300 px-1.5 py-0.2 rounded font-bold">Hiện tại</span>}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{v.comment || 'Không có ghi chú'}</p>
                        <span className="text-[10px] text-slate-500 font-mono">Tải bởi: {v.uploadedBy} ({formatDateVN(v.uploadedAt)})</span>
                      </div>
                      <span className="font-mono text-[11px] text-slate-400">{formatFileSize(v.fileSize)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upload New Version Section */}
              <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-3">
                <label className="text-emerald-400 font-bold block flex items-center gap-1.5">
                  <Plus className="w-4 h-4" /> Tải lên phiên bản mới hơn cho tệp này:
                </label>
                <div>
                  <span className="text-slate-400 text-[10px] block mb-1">Ghi chú thay đổi phiên bản mới:</span>
                  <input
                    type="text"
                    placeholder="VD: Cập nhật chữ ký phê duyệt bổ sung..."
                    value={newVersionComment}
                    onChange={e => setNewVersionComment(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-white rounded-lg p-2 text-xs"
                  />
                </div>
                <button
                  onClick={handleExecuteUploadNewVersion}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950"
                >
                  <Upload className="w-4 h-4" /> Xác nhận Tải lên Phiên bản Mới
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: ACCESS CONTROL & PERMISSION MANAGEMENT */}
      {permissionFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-sky-400" /> Phân quyền Truy cập File Google Drive
              </h3>
              <button onClick={() => setPermissionFile(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[11px]">File: <strong className="text-white">{permissionFile.name}</strong></div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Cấp độ Quyền hạn:</label>
                <select
                  value={newPermission}
                  onChange={e => setNewPermission(e.target.value as DriveAccessPermission)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="owner">👑 Owner - Chủ sở hữu (Toàn quyền)</option>
                  <option value="editor">✏️ Editor - Biên tập (Được tải bản mới)</option>
                  <option value="viewer">👁️ Viewer - Chỉ xem & Tải xuống</option>
                  <option value="restricted">🔒 Restricted - Giới hạn Nội bộ</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Thêm email chia sẻ:</label>
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    placeholder="nguyenvana@qlrpbm.vn"
                    value={newSharedEmail}
                    onChange={e => setNewSharedEmail(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 text-white rounded-xl p-2 text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newSharedEmail.trim()) {
                        setSharedEmailsList(prev => [...prev, newSharedEmail.trim()]);
                        setNewSharedEmail('');
                      }
                    }}
                    className="bg-sky-700 hover:bg-sky-600 text-white px-3 py-2 rounded-xl text-xs font-semibold"
                  >
                    Thêm
                  </button>
                </div>
              </div>

              {sharedEmailsList.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {sharedEmailsList.map(email => (
                    <span key={email} className="bg-slate-950 text-sky-300 border border-slate-800 px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1">
                      {email}
                      <button onClick={() => setSharedEmailsList(prev => prev.filter(e => e !== email))} className="hover:text-rose-400">✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setPermissionFile(null)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                onClick={handleExecuteUpdatePermission}
                className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-sky-950"
              >
                Lưu Phân quyền
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
