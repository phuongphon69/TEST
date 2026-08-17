import React, { useState } from 'react';
import {
  BarChart3,
  FileSpreadsheet,
  Printer,
  FileText,
  CheckSquare,
  Bomb,
  Truck,
  Users,
  Archive,
  CheckCircle2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  getDocuments,
  getTasks,
  getProjects,
  getPersonnel,
  getVehicles,
  getEquipment,
  getArchiveWarehouses,
  getUsers
} from '../utils/storage';
import { formatVNDShort } from '../utils/formatters';

type ReportCategory = 'documents' | 'tasks' | 'projects' | 'equipment' | 'personnel' | 'warehouse';

export const ReportAnalyticsManager: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('projects');
  
  // Global Filters
  const [filterProject, setFilterProject] = useState<string>('all');
  const [filterPerson, setFilterPerson] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('2026');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // System Data
  const documents = getDocuments();
  const tasks = getTasks();
  const projects = getProjects();
  const personnel = getPersonnel();
  const vehicles = getVehicles();
  const equipment = getEquipment();
  const warehouses = getArchiveWarehouses();
  const users = getUsers();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Filtered dataset helpers
  const filteredProjects = projects.filter(p => {
    if (filterProject !== 'all' && p.id !== filterProject) return false;
    if (filterStatus !== 'all' && p.status !== filterStatus) return false;
    return true;
  });

  const filteredDocuments = documents.filter(d => {
    if (filterPerson !== 'all' && d.assignedProcessor !== filterPerson) return false;
    if (filterStatus !== 'all' && d.status !== filterStatus) return false;
    return true;
  });

  const filteredTasks = tasks.filter(t => {
    if (filterPerson !== 'all' && t.leadAssignee !== filterPerson) return false;
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    return true;
  });

  const filteredVehicles = vehicles.filter(v => {
    if (filterPerson !== 'all' && v.frequentDriverName !== filterPerson) return false;
    return true;
  });

  const filteredEquipment = equipment.filter(e => {
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  });

  const filteredPersonnel = personnel.filter(p => {
    if (filterPerson !== 'all' && p.fullName !== filterPerson) return false;
    return true;
  });

  // Calculate Project aggregates
  const totalProjectValue = filteredProjects.reduce((sum, p) => sum + (p.budgetVnd || 0), 0);
  const totalImplementedValue = filteredProjects.reduce((sum, p) => sum + ((p.budgetVnd || 0) * (p.progressPercent || 0) / 100), 0);
  const totalAcceptedValue = filteredProjects.reduce((sum, p) => sum + ((p.budgetVnd || 0) * Math.max(0, (p.progressPercent || 0) - 10) / 100), 0);
  const totalPaidValue = filteredProjects.reduce((sum, p) => sum + (p.paidValue || ((p.budgetVnd || 0) * 0.7)), 0);
  const totalDebtValue = Math.max(0, totalAcceptedValue - totalPaidValue);
  const totalAreaHa = filteredProjects.reduce((sum, p) => sum + (p.areaHa || 0), 0);

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  // Export report to Excel
  const handleExportExcel = () => {
    let exportData: any[] = [];
    let sheetName = 'BaoCao';

    if (activeCategory === 'projects') {
      sheetName = 'BaoCao_DuAn_RPBM';
      exportData = filteredProjects.map(p => ({
        'Mã Dự Án': p.code,
        'Tên Dự Án': p.name,
        'Chủ Đầu Tư': p.investor,
        'Chỉ Huy Trưởng': p.commanderName,
        'Diện Tích (ha)': p.areaHa,
        'Tổng Dự Toán (VNĐ)': p.budgetVnd,
        'Tiến Độ (%)': `${p.progressPercent}%`,
        'Đã Thanh Toán (VNĐ)': p.paidValue || ((p.budgetVnd || 0) * 0.7),
        'Trạng Thái': p.status
      }));
    } else if (activeCategory === 'documents') {
      sheetName = 'BaoCao_VanBan';
      exportData = filteredDocuments.map(d => ({
        'Số / Ký Hiệu': d.code,
        'Trích Yếu': d.title,
        'Loại Văn Bản': d.type === 'vanban_den' ? 'Văn bản Đến' : 'Văn bản Đi',
        'Cơ Quan Ban Hành': d.issuer,
        'Người Xử Lý': d.assignedProcessor,
        'Ngày Ban Hành': d.issueDate,
        'Trạng Thái': d.status
      }));
    } else if (activeCategory === 'tasks') {
      sheetName = 'BaoCao_CongViec';
      exportData = filteredTasks.map(t => ({
        'Nhiệm Vụ': t.title,
        'Người Chủ Trì': t.leadAssignee,
        'Mức Độ Khẩn': t.priority,
        'Hạn Hoàn Thành': t.deadline,
        'Trạng Thái': t.status
      }));
    } else if (activeCategory === 'equipment') {
      sheetName = 'BaoCao_ThietBi_PhuongTien';
      exportData = filteredEquipment.map(e => ({
        'Mã / Serial': e.serialOrPlate,
        'Tên Thiết Bị': e.name,
        'Hãng SX': e.brandModel,
        'Phân Loại': e.category,
        'Hạn Kiểm Định': e.nextCalibrationDate,
        'Trạng Thái': e.status
      }));
    } else if (activeCategory === 'personnel') {
      sheetName = 'BaoCao_NhanSu';
      exportData = filteredPersonnel.map(p => ({
        'Họ và Tên': `${p.rankTitle} ${p.fullName}`,
        'Vai Trò': p.roleInTeam,
        'Phòng Bàn / Đơn Vị': p.unit,
        'Số Chứng Chỉ': p.certificates?.length || 0,
        'Đủ Điều Kiện RPBM': (p.certificates && p.certificates.length > 0) ? 'ĐỦ ĐIỀU KIỆN' : 'CHƯA ĐỦ ĐIỀU KIỆN'
      }));
    } else if (activeCategory === 'warehouse') {
      sheetName = 'BaoCao_Kho_HoSo';
      const allDossiers = warehouses.flatMap(w => w.dossiers || []);
      exportData = allDossiers.map(d => ({
        'Mã Hồ Sơ': d.code,
        'Tên Hồ Sơ': d.title,
        'Dự Án': d.projectName,
        'Ngày Lưu Kho': d.archivedDate,
        'Thời Hạn Bảo Quản': `${d.retentionYears} năm`,
        'Trạng Thái': d.status
      }));
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    XLSX.writeFile(workbook, `${sheetName}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast(`Đã xuất báo cáo Excel "${sheetName}.xlsx" thành công!`);
  };

  return (
    <div className="space-y-6">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-900 border border-emerald-500 text-emerald-100 text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold tracking-wider uppercase mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Mục 17: Báo cáo & Thống kê Tổng hợp</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Trung tâm Tổng hợp & Thống kê Nghiệp vụ</h2>
            <p className="text-slate-400 text-sm mt-1">
              Báo cáo đa chiều 6 lĩnh vực: Văn bản, Công việc, Dự án RPBM, Phương tiện & Thiết bị, Nhân sự, Kho hồ sơ.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/40"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Báo Cáo Excel (.xlsx)</span>
            </button>

            <button
              onClick={handlePrintReport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>In Báo Cáo / Xuất PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Global Filter Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Filter Project */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Lọc Theo Dự Án:</label>
          <select
            value={filterProject}
            onChange={e => setFilterProject(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả dự án (Toàn đơn vị)</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>[{p.code}] {p.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Person */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Lọc Theo Người Phụ Trách:</label>
          <select
            value={filterPerson}
            onChange={e => setFilterPerson(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả cán bộ phụ trách</option>
            {users.map(u => (
              <option key={u.id} value={u.name}>{u.title} {u.name}</option>
            ))}
          </select>
        </div>

        {/* Filter Status */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Lọc Theo Trạng Thái:</label>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="dang_thi_cong">Đang thi công</option>
            <option value="cham_tien_do">Chậm tiến độ / Quá hạn</option>
            <option value="da_hoan_thanh">Đã hoàn thành</option>
          </select>
        </div>

        {/* Filter Year */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1 uppercase">Kỳ Báo Cáo (Năm):</label>
          <select
            value={filterYear}
            onChange={e => setFilterYear(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-purple-500 font-mono"
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
          </select>
        </div>
      </div>

      {/* Category Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
        {[
          { id: 'projects', label: 'Báo cáo Dự án RPBM', icon: Bomb },
          { id: 'documents', label: 'Báo cáo Văn bản', icon: FileText },
          { id: 'tasks', label: 'Báo cáo Công việc', icon: CheckSquare },
          { id: 'equipment', label: 'Phương tiện & Thiết bị', icon: Truck },
          { id: 'personnel', label: 'Báo cáo Nhân sự', icon: Users },
          { id: 'warehouse', label: 'Báo cáo Kho Hồ sơ', icon: Archive },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeCategory === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.id as ReportCategory)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold shrink-0 transition-all flex items-center gap-2 border ${
                isActive
                  ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-950/40'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* REPORT CONTENT VIEWPORTS */}
      {/* 1. BÁO CÁO DỰ ÁN */}
      {activeCategory === 'projects' && (
        <div className="space-y-6">
          {/* Summary Financial Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Tổng Dự Toán Dự Án</div>
              <div className="text-lg font-bold text-amber-400 font-mono">{formatVNDShort(totalProjectValue)}</div>
              <div className="text-[10px] text-slate-500">{filteredProjects.length} dự án trong kỳ</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Giá Trị Thực Hiện & Nghiệm Thu</div>
              <div className="text-lg font-bold text-sky-400 font-mono">{formatVNDShort(totalImplementedValue)}</div>
              <div className="text-[10px] text-emerald-400">Nghiệm thu: {formatVNDShort(totalAcceptedValue)}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Đã Thanh Toán Giải Ngân</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">{formatVNDShort(totalPaidValue)}</div>
              <div className="text-[10px] text-slate-400">Đạt ~75% giá trị nghiệm thu</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow space-y-1">
              <div className="text-[11px] text-slate-400 font-semibold uppercase">Công Nợ Còn Phải Thu</div>
              <div className="text-lg font-bold text-rose-400 font-mono">{formatVNDShort(totalDebtValue)}</div>
              <div className="text-[10px] text-rose-300 font-mono">Khối lượng RPBM: {totalAreaHa} ha</div>
            </div>
          </div>

          {/* Project Detailed Table Report */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Bomb className="w-4 h-4 text-amber-400" />
              <span>Bảng Chi Tiết Báo Cáo Tiến Độ & Tài Chính Dự Án RPBM</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã & Tên Dự Án</th>
                    <th className="px-4 py-3">Chủ Đầu Tư</th>
                    <th className="px-4 py-3">Chỉ Huy Trưởng</th>
                    <th className="px-4 py-3 text-right">Diện Tích (ha)</th>
                    <th className="px-4 py-3 text-right">Tổng Dự Toán</th>
                    <th className="px-4 py-3 text-right">Đã Thanh Toán</th>
                    <th className="px-4 py-3 text-center">Tiến Độ</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredProjects.map(p => (
                    <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-200">{p.name}</div>
                        <div className="text-[10px] font-mono text-amber-400">{p.code}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{p.investor}</td>
                      <td className="px-4 py-3 text-slate-300">{p.commanderName}</td>
                      <td className="px-4 py-3 text-right font-mono font-bold text-emerald-400">{p.areaHa} ha</td>
                      <td className="px-4 py-3 text-right font-mono text-slate-200">{formatVNDShort(p.budgetVnd || 0)}</td>
                      <td className="px-4 py-3 text-right font-mono text-teal-400">{formatVNDShort(p.paidValue || ((p.budgetVnd || 0) * 0.7))}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="w-24 mx-auto bg-slate-800 rounded-full h-2 border border-slate-700 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${p.progressPercent}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">{p.progressPercent}%</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. BÁO CÁO VĂN BẢN */}
      {activeCategory === 'documents' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Số Văn Bản Đến / Đi</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-1">{filteredDocuments.length}</div>
              <div className="text-[11px] text-slate-400 mt-1">Đến: {documents.filter(d => d.type === 'vanban_den').length} | Đi: {documents.filter(d => d.type === 'vanban_di').length}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Văn Bản Chưa Xử Lý / Đang Xử Lý</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">
                {documents.filter(d => d.status !== 'da_hoan_thanh').length}
              </div>
              <div className="text-[11px] text-amber-300 mt-1">Cần tập trung giải quyết đúng hạn</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Văn Bản Bị Quá Hạn</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {documents.filter(d => d.status === 'qua_han').length}
              </div>
              <div className="text-[11px] text-rose-300 mt-1">Chiếm {((documents.filter(d => d.status === 'qua_han').length / (documents.length || 1)) * 100).toFixed(1)}%</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span>Danh Sách Thống Kê Chi Tiết Văn Bản Nghiệp Vụ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Số / Ký Hiệu</th>
                    <th className="px-4 py-3">Trích Yếu Nội Dung</th>
                    <th className="px-4 py-3">Loại</th>
                    <th className="px-4 py-3">Cơ Quan Ban Hành</th>
                    <th className="px-4 py-3">Cán Bộ Xử Lý</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredDocuments.map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-sky-400">{d.code}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">{d.title}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${d.type === 'vanban_den' ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-purple-950 text-purple-300 border border-purple-800'}`}>
                          {d.type === 'vanban_den' ? 'Văn bản Đến' : 'Văn bản Đi'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{d.issuer}</td>
                      <td className="px-4 py-3 text-slate-200 font-semibold">{d.assignedProcessor}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. BÁO CÁO CÔNG VIỆC */}
      {activeCategory === 'tasks' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Số Công Việc Quản Lý</div>
              <div className="text-2xl font-bold text-indigo-400 font-mono mt-1">{filteredTasks.length}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Hoàn Thành Đúng Hạn</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">
                {tasks.filter(t => t.status === 'hoan_thanh').length}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Quá Hạn Hoàn Thành</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">
                {tasks.filter(t => t.status === 'qua_han').length}
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-400" />
              <span>Phân Tích Khối Lượng & Kết Quả Công Việc Theo Cán Bộ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Nhiệm Vụ</th>
                    <th className="px-4 py-3">Người Chủ Trì</th>
                    <th className="px-4 py-3">Độ Khẩn</th>
                    <th className="px-4 py-3 font-mono">Hạn Hoàn Thành</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredTasks.map(t => (
                    <tr key={t.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-200">{t.title}</td>
                      <td className="px-4 py-3 font-semibold text-emerald-400">{t.leadAssignee}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-950 text-amber-300 border border-amber-800">
                          {t.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-slate-300">{t.deadline}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {t.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 4. BÁO CÁO PHƯƠNG TIỆN & THIẾT BỊ */}
      {activeCategory === 'equipment' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Phương Tiện Xe Ô Tô</div>
              <div className="text-2xl font-bold text-orange-400 font-mono mt-1">{filteredVehicles.length}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Xe Sắp Hết Đăng Kiểm / Bảo Hiểm</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">2 xe</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Khí Tài & Máy Dò RPBM</div>
              <div className="text-2xl font-bold text-teal-400 font-mono mt-1">{filteredEquipment.length}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Thiết Bị Sắp Hết Kiểm Định</div>
              <div className="text-2xl font-bold text-amber-400 font-mono mt-1">3 máy</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-400" />
              <span>Báo Cáo Tình Trạng Kỹ Thuật & Hạn Kiểm Định Thiết Bị</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã / Serial</th>
                    <th className="px-4 py-3">Tên Khí Tài / Phương Tiện</th>
                    <th className="px-4 py-3">Hãng SX & Model</th>
                    <th className="px-4 py-3 font-mono">Hạn Kiểm Định / Đăng Kiểm</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredEquipment.map(e => (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-teal-400">{e.serialOrPlate}</td>
                      <td className="px-4 py-3 font-bold text-slate-200">{e.name}</td>
                      <td className="px-4 py-3 text-slate-400">{e.brandModel}</td>
                      <td className="px-4 py-3 font-mono text-amber-300">{e.nextCalibrationDate}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {e.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. BÁO CÁO NHÂN SỰ */}
      {activeCategory === 'personnel' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Số Cán Bộ Nhân Sự</div>
              <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">{filteredPersonnel.length}</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Cán Bộ Đủ Điều Kiện RPBM</div>
              <div className="text-2xl font-bold text-teal-400 font-mono mt-1">
                {personnel.filter(p => p.certificates && p.certificates.length > 0).length}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Chứng Chỉ Sắp Hết Hạn</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">1 chứng chỉ</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Báo Cáo Chứng Chỉ & Điều Kiện Bố Trí Nhân Sự Rà Phá Bom Mìn</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Họ và Tên Cán Bộ</th>
                    <th className="px-4 py-3">Vai Trò Đội Ngũ</th>
                    <th className="px-4 py-3">Đơn Vị / Phòng Bàn</th>
                    <th className="px-4 py-3 text-center">Số Chứng Chỉ</th>
                    <th className="px-4 py-3">Đánh Giá Điều Kiện Bố Trí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredPersonnel.map(p => {
                    const hasCert = p.certificates && p.certificates.length > 0;
                    return (
                      <tr key={p.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-4 py-3 font-bold text-slate-200">
                          {p.rankTitle} {p.fullName}
                        </td>
                        <td className="px-4 py-3 text-slate-300">{p.roleInTeam}</td>
                        <td className="px-4 py-3 text-slate-400">{p.unit}</td>
                        <td className="px-4 py-3 text-center font-bold text-purple-400 font-mono">
                          {p.certificates?.length || 0}
                        </td>
                        <td className="px-4 py-3">
                          {hasCert ? (
                            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-700">
                              ĐỦ ĐIỀU KIỆN RPBM
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700">
                              CHƯA ĐỦ ĐIỀU KIỆN
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 6. BÁO CÁO KHO HỒ SƠ */}
      {activeCategory === 'warehouse' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Số Kho Lưu Trữ</div>
              <div className="text-2xl font-bold text-amber-500 font-mono mt-1">{warehouses.length} kho</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Tổng Hồ Sơ Đang Lưu trữ</div>
              <div className="text-2xl font-bold text-sky-400 font-mono mt-1">
                {warehouses.reduce((sum, w) => sum + (w.dossiers?.length || 0), 0)} hồ sơ
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow">
              <div className="text-xs text-slate-400 font-semibold">Hồ Sơ Đang Mượn / Xem Xét Tiêu Hủy</div>
              <div className="text-2xl font-bold text-rose-400 font-mono mt-1">1 hồ sơ</div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Archive className="w-4 h-4 text-amber-500" />
              <span>Báo Cáo Thống Kê Danh Mục & Vị Trí Trống Trong Kho Hồ Sơ</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-800 text-slate-400 font-semibold uppercase">
                  <tr>
                    <th className="px-4 py-3">Mã & Tên Hồ Sơ</th>
                    <th className="px-4 py-3">Thuộc Dự Án</th>
                    <th className="px-4 py-3 font-mono">Ngày Lưu Kho</th>
                    <th className="px-4 py-3 font-mono">Thời Hạn Bảo Quản</th>
                    <th className="px-4 py-3">Trạng Thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {warehouses.flatMap(w => w.dossiers || []).map(d => (
                    <tr key={d.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-200">{d.title}</div>
                        <div className="text-[10px] font-mono text-amber-400">{d.code}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{d.projectName}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{d.archivedDate}</td>
                      <td className="px-4 py-3 font-mono text-purple-300">{d.retentionYears} năm</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                          {d.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
