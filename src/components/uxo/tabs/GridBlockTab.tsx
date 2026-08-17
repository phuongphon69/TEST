import React, { useState } from 'react';
import {
  Grid,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  Edit2,
  Trash2,
  Eye,
  FileText,
  Filter,
  Layers,
  HelpCircle,
  X,
  Compass,
  Building2
} from 'lucide-react';
import { GridBlock, GridCompletionStatus, ExecutionArea, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  gridBlocks: GridBlock[];
  areas: ExecutionArea[];
  projects: Project[];
  onSaveGridBlock: (grid: GridBlock) => void;
  onDeleteGridBlock: (id: string) => void;
}

const GRID_STATUS_CONFIG: Record<
  GridCompletionStatus,
  { label: string; badgeColor: string; gridBgColor: string; gridBorderColor: string }
> = {
  chua_thuc_hien: {
    label: 'Chưa thực hiện',
    badgeColor: 'bg-slate-800 text-slate-300 border-slate-700',
    gridBgColor: 'bg-slate-900 hover:bg-slate-800',
    gridBorderColor: 'border-slate-800'
  },
  dang_thuc_hien: {
    label: 'Đang thực hiện',
    badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    gridBgColor: 'bg-sky-950/40 hover:bg-sky-900/60',
    gridBorderColor: 'border-sky-500/50'
  },
  da_hoan_thanh: {
    label: 'Đã hoàn thành',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    gridBgColor: 'bg-amber-950/40 hover:bg-amber-900/60',
    gridBorderColor: 'border-amber-500/50'
  },
  cho_kiem_tra: {
    label: 'Chờ kiểm tra',
    badgeColor: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    gridBgColor: 'bg-orange-950/40 hover:bg-orange-900/60',
    gridBorderColor: 'border-orange-500/50'
  },
  khong_dat: {
    label: 'Không đạt (Cần làm lại)',
    badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    gridBgColor: 'bg-rose-950/40 hover:bg-rose-900/60',
    gridBorderColor: 'border-rose-500/50'
  },
  da_nghiem_thu: {
    label: 'Đã nghiệm thu',
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    gridBgColor: 'bg-emerald-950/40 hover:bg-emerald-900/60',
    gridBorderColor: 'border-emerald-500/50'
  }
};

export const GridBlockTab: React.FC<Props> = ({
  gridBlocks,
  areas,
  projects,
  onSaveGridBlock,
  onDeleteGridBlock
}) => {
  const [selectedAreaId, setSelectedAreaId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewingGrid, setViewingGrid] = useState<GridBlock | null>(null);
  const [editingGrid, setEditingGrid] = useState<GridBlock | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);

  // Grouping grid blocks by Lot Code for visual map rendering
  const filteredGridBlocks = gridBlocks.filter(g => {
    if (selectedAreaId !== 'all' && g.areaId !== selectedAreaId) return false;
    if (selectedStatus !== 'all' && g.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        g.lotCode.toLowerCase().includes(q) ||
        g.gridCode.toLowerCase().includes(q) ||
        g.executionTeam.toLowerCase().includes(q) ||
        g.inspector.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const lotsMap: Record<string, GridBlock[]> = {};
  filteredGridBlocks.forEach(gb => {
    const lot = gb.lotCode || 'Lô Khác';
    if (!lotsMap[lot]) lotsMap[lot] = [];
    lotsMap[lot].push(gb);
  });

  const handleOpenForm = (grid?: GridBlock) => {
    if (grid) {
      setEditingGrid(grid);
    } else {
      const defaultArea = areas[0];
      const defaultProj = projects[0];
      setEditingGrid({
        id: `grid-${Date.now()}`,
        areaId: defaultArea?.id || '',
        areaName: defaultArea?.name || '',
        projectId: defaultProj?.id || '',
        projectName: defaultProj?.name || '',
        lotCode: 'Lô A1',
        gridCode: `Ô A1-0${gridBlocks.length + 1}`,
        areaM2: 2500,
        cornerCoordinates: 'A(16.880, 106.920); B(16.885, 106.920); C(16.885, 106.925); D(16.880, 106.925)',
        approvedDepthM: 5.0,
        executionDate: new Date().toISOString().split('T')[0],
        executionTeam: 'Tổ RPBM Số 1',
        equipmentUsed: 'Vallon VMR3 + Foerster FEREX',
        status: 'chua_thuc_hien',
        inspector: 'Đại úy Trần Văn Mạnh',
        acceptanceResult: 'Đang theo dõi'
      });
    }
    setShowFormModal(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGrid) return;
    const selectedArea = areas.find(a => a.id === editingGrid.areaId);
    const finalGrid: GridBlock = {
      ...editingGrid,
      areaName: selectedArea ? selectedArea.name : editingGrid.areaName,
      projectId: selectedArea ? selectedArea.projectId : editingGrid.projectId,
      projectName: selectedArea ? selectedArea.projectName : editingGrid.projectName
    };
    onSaveGridBlock(finalGrid);
    setShowFormModal(false);
    setEditingGrid(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Grid className="w-5 h-5 text-amber-400" /> 8.2. Quản lý Lưới dò & Phân khu thi công
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Phân chia lô ô, độ sâu dò tìm phê duyệt, tổ thi công, thiết bị và sơ đồ lưới dò tô màu trạng thái trực quan.
          </p>
        </div>

        <button
          onClick={() => handleOpenForm()}
          className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" /> Khởi tạo Ô lưới mới
        </button>
      </div>

      {/* Legend Bar */}
      <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="font-semibold text-slate-300 shrink-0">Chú giải màu sơ đồ lưới:</div>
        <div className="flex flex-wrap items-center gap-2.5 text-[11px]">
          {Object.entries(GRID_STATUS_CONFIG).map(([key, val]) => (
            <div key={key} className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              <span className={`w-3 h-3 rounded-sm border ${val.gridBgColor} ${val.gridBorderColor}`}></span>
              <span className="text-slate-300 font-medium">{val.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-xs">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedAreaId}
            onChange={e => setSelectedAreaId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-72"
          >
            <option value="all">Tất cả khu vực thi công</option>
            {areas.map(a => (
              <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-52"
          >
            <option value="all">Tất cả trạng thái</option>
            {Object.entries(GRID_STATUS_CONFIG).map(([key, val]) => (
              <option key={key} value={key}>{val.label}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm mã lô, mã ô, tổ thi công..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Visual Lot Map Display */}
      {Object.keys(lotsMap).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(lotsMap).map(([lotCode, cells]) => (
            <div key={lotCode} className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-400 font-mono font-bold text-sm border border-amber-500/20">
                    {lotCode}
                  </span>
                  <span className="text-xs text-slate-400">({cells.length} ô lưới)</span>
                </div>
                <button
                  onClick={() => handleOpenForm()}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm ô vào {lotCode}
                </button>
              </div>

              {/* Grid Box Cells Container */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {cells.map(cell => {
                  const cfg = GRID_STATUS_CONFIG[cell.status];

                  return (
                    <div
                      key={cell.id}
                      onClick={() => setViewingGrid(cell)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2 group shadow-md ${cfg.gridBgColor} ${cfg.gridBorderColor}`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-mono font-bold text-xs text-slate-100 group-hover:text-amber-300">
                          {cell.gridCode}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-slate-950/80 px-1.5 py-0.5 rounded">
                          {cell.approvedDepthM}m
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-300 line-clamp-1">
                        {cell.executionTeam}
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-800/60">
                        <span>{cell.areaM2} m²</span>
                        <span className={`px-1.5 py-0.2 rounded font-semibold border ${cfg.badgeColor}`}>
                          {cfg.label.split(' ')[0]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-2">
          <Grid className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="text-slate-300 font-semibold text-sm">Chưa có ô lưới dò nào phù hợp bộ lọc.</div>
        </div>
      )}

      {/* Modal Cell Detail View */}
      {viewingGrid && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 text-slate-100">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {viewingGrid.lotCode}
                  </span>
                  <span className="text-base font-bold text-slate-100 font-mono">{viewingGrid.gridCode}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1">{viewingGrid.areaName}</p>
              </div>
              <button onClick={() => setViewingGrid(null)} className="p-1.5 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-400">Diện tích ô:</span>
                <p className="font-mono text-emerald-400 font-bold mt-0.5">{viewingGrid.areaM2} m²</p>
              </div>
              <div>
                <span className="text-slate-400">Độ sâu phê duyệt:</span>
                <p className="font-mono text-amber-400 font-bold mt-0.5">{viewingGrid.approvedDepthM} mét</p>
              </div>
              <div>
                <span className="text-slate-400">Tổ thi công:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingGrid.executionTeam}</p>
              </div>
              <div>
                <span className="text-slate-400">Thiết bị sử dụng:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingGrid.equipmentUsed}</p>
              </div>
              <div>
                <span className="text-slate-400">Ngày thực hiện:</span>
                <p className="font-mono text-slate-200 mt-0.5">{formatDateVN(viewingGrid.executionDate)}</p>
              </div>
              <div>
                <span className="text-slate-400">Người kiểm tra:</span>
                <p className="font-semibold text-slate-200 mt-0.5">{viewingGrid.inspector}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <strong className="text-slate-300">Tọa độ các điểm góc:</strong>
                <p className="font-mono text-amber-300 text-[11px] mt-0.5">{viewingGrid.cornerCoordinates || 'Chưa nhập'}</p>
              </div>
              <div>
                <strong className="text-slate-300">Kết quả nghiệm thu:</strong>
                <p className="text-slate-200 mt-0.5">{viewingGrid.acceptanceResult}</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-xs">
              <div>
                {viewingGrid.asBuiltMapUrl && (
                  <a href={viewingGrid.asBuiltMapUrl} target="_blank" rel="noreferrer" className="text-amber-400 hover:underline flex items-center gap-1 font-semibold">
                    <FileText className="w-4 h-4" /> Bản đồ hoàn công
                  </a>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const target = viewingGrid;
                    setViewingGrid(null);
                    handleOpenForm(target);
                  }}
                  className="px-3 py-1.5 bg-sky-500/10 text-sky-400 border border-sky-500/30 font-semibold rounded-lg flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Chỉnh sửa
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Xóa ô lưới "${viewingGrid.gridCode}"?`)) {
                      onDeleteGridBlock(viewingGrid.id);
                      setViewingGrid(null);
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold rounded-lg flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Modal Add / Edit */}
      {showFormModal && editingGrid && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <form onSubmit={handleFormSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Grid className="w-5 h-5" /> Cập nhật / Thêm Ô Lưới Dò
              </h3>
              <button type="button" onClick={() => setShowFormModal(false)} className="p-1.5 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thuộc Khu vực thi công *</label>
                <select
                  value={editingGrid.areaId}
                  onChange={e => {
                    const selArea = areas.find(a => a.id === e.target.value);
                    setEditingGrid({
                      ...editingGrid,
                      areaId: e.target.value,
                      areaName: selArea ? selArea.name : '',
                      projectId: selArea ? selArea.projectId : '',
                      projectName: selArea ? selArea.projectName : ''
                    });
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {areas.map(a => (
                    <option key={a.id} value={a.id}>{a.code} - {a.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã Lô *</label>
                <input
                  type="text"
                  required
                  value={editingGrid.lotCode}
                  onChange={e => setEditingGrid({ ...editingGrid, lotCode: e.target.value })}
                  placeholder="e.g. Lô A1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã Ô Lưới *</label>
                <input
                  type="text"
                  required
                  value={editingGrid.gridCode}
                  onChange={e => setEditingGrid({ ...editingGrid, gridCode: e.target.value })}
                  placeholder="e.g. Ô A1-01"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Diện tích ô (m²)</label>
                <input
                  type="number"
                  value={editingGrid.areaM2}
                  onChange={e => setEditingGrid({ ...editingGrid, areaM2: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Độ sâu dò tìm phê duyệt (m)</label>
                <input
                  type="number"
                  step="0.1"
                  value={editingGrid.approvedDepthM}
                  onChange={e => setEditingGrid({ ...editingGrid, approvedDepthM: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tình trạng hoàn thành</label>
                <select
                  value={editingGrid.status}
                  onChange={e => setEditingGrid({ ...editingGrid, status: e.target.value as GridCompletionStatus })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {Object.entries(GRID_STATUS_CONFIG).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tổ thi công</label>
                <input
                  type="text"
                  value={editingGrid.executionTeam}
                  onChange={e => setEditingGrid({ ...editingGrid, executionTeam: e.target.value })}
                  placeholder="e.g. Tổ RPBM Số 1"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Thiết bị sử dụng</label>
                <input
                  type="text"
                  value={editingGrid.equipmentUsed}
                  onChange={e => setEditingGrid({ ...editingGrid, equipmentUsed: e.target.value })}
                  placeholder="Vallon VMR3, Foerster..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Người kiểm tra / Cán bộ GS</label>
                <input
                  type="text"
                  value={editingGrid.inspector}
                  onChange={e => setEditingGrid({ ...editingGrid, inspector: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Ngày thực hiện</label>
                <input
                  type="date"
                  value={editingGrid.executionDate}
                  onChange={e => setEditingGrid({ ...editingGrid, executionDate: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Tọa độ các điểm góc (A, B, C, D)</label>
                <input
                  type="text"
                  value={editingGrid.cornerCoordinates}
                  onChange={e => setEditingGrid({ ...editingGrid, cornerCoordinates: e.target.value })}
                  placeholder="A(16.880, 106.920); B(16.885, 106.920)..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-300 mb-1">Kết quả nghiệm thu / Đánh giá</label>
                <textarea
                  rows={2}
                  value={editingGrid.acceptanceResult}
                  onChange={e => setEditingGrid({ ...editingGrid, acceptanceResult: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg font-medium"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-lg"
              >
                Lưu ô lưới
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
