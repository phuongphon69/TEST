import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Wrench,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Calendar,
  X,
  ShieldAlert,
  DollarSign,
  Download,
  Trash2
} from 'lucide-react';
import { EquipmentItem, EquipmentCategory, EquipmentStatus, MaintenanceRecord } from '../types';
import { getEquipment, saveEquipment, getCurrentUser } from '../utils/storage';
import {
  formatVND,
  formatDateVN,
  formatDateForInput,
  getExpiryBadgeInfo,
  EQUIPMENT_CAT_MAP
} from '../utils/formatters';
import { exportEquipmentExcel } from '../utils/exportUtils';

export const EquipmentManager: React.FC = () => {
  const [equipmentList, setEquipmentState] = useState<EquipmentItem[]>(getEquipment());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [showAddEquipmentModal, setShowAddEquipmentModal] = useState<boolean>(false);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState<EquipmentItem | null>(null);

  // Forms
  const [eqForm, setEqForm] = useState<Partial<EquipmentItem>>({
    code: `MD-0${equipmentList.length + 1}`,
    name: '',
    category: 'may_do_nong',
    brandModel: 'Vallon VMR3',
    serialOrPlate: '',
    status: 'hoat_dong_tot',
    location: 'Kho Trạm Thiết bị Hà Nội',
    lastCalibrationDate: formatDateForInput(new Date()),
    nextCalibrationDate: formatDateForInput(new Date(Date.now() + 365 * 24 * 3600 * 1000))
  });

  const [maintForm, setMaintForm] = useState<Partial<MaintenanceRecord>>({
    date: formatDateForInput(new Date()),
    action: 'Thay pin chì, cân chỉnh dải đo EMI và kiểm định hiệu chuẩn',
    performedBy: 'Viện Đo lường BQP',
    costVnd: 5000000
  });

  const filteredEquipment = equipmentList
    .filter(item => item.dataStatus !== 'da_xoa')
    .filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          item.code.toLowerCase().includes(q) ||
          item.name.toLowerCase().includes(q) ||
          item.serialOrPlate.toLowerCase().includes(q) ||
          item.brandModel.toLowerCase().includes(q)
        );
      }
      return true;
    });

  const handleSaveEquipment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eqForm.name || !eqForm.serialOrPlate) return;

    const user = getCurrentUser();
    const nowStr = formatDateVN(new Date());

    const newItem: EquipmentItem = {
      id: `eq-${Date.now()}`,
      code: eqForm.code || 'MD-NEW',
      name: eqForm.name || '',
      category: (eqForm.category as EquipmentCategory) || 'may_do_nong',
      brandModel: eqForm.brandModel || 'Minelab / Vallon',
      serialOrPlate: eqForm.serialOrPlate || '',
      status: (eqForm.status as EquipmentStatus) || 'hoat_dong_tot',
      location: eqForm.location || 'Kho Trạm Thiết bị',
      lastCalibrationDate: eqForm.lastCalibrationDate || formatDateForInput(new Date()),
      nextCalibrationDate: eqForm.nextCalibrationDate || formatDateForInput(new Date()),
      assignedTo: eqForm.assignedTo,
      maintenanceLogs: [],
      createdBy: user.name,
      createdAt: nowStr,
      updatedBy: user.name,
      updatedAt: nowStr,
      departmentOrUnit: user.departmentOrUnit || 'Phòng Nghiệp vụ RPBM',
      dataStatus: 'hoat_dong'
    };

    const updated = [newItem, ...equipmentList];
    saveEquipment(updated, `Thêm trang thiết bị/phương tiện mới: ${newItem.code}`);
    setEquipmentState(updated);
    setShowAddEquipmentModal(false);
  };

  const handleDeleteEquipment = (e: EquipmentItem) => {
    if (confirm(`Bạn có chắc muốn chuyển thiết bị "${e.name} (${e.serialOrPlate})" vào Thùng rác?`)) {
      const user = getCurrentUser();
      const updated = equipmentList.map(item =>
        item.id === e.id
          ? {
              ...item,
              dataStatus: 'da_xoa' as const,
              updatedBy: user.name,
              updatedAt: formatDateVN(new Date())
            }
          : item
      );
      saveEquipment(updated, `Chuyển thiết bị ${e.code} vào Thùng rác`);
      setEquipmentState(updated);
    }
  };

  const handleAddMaintenance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showMaintenanceModal || !maintForm.action) return;

    const newLog: MaintenanceRecord = {
      id: `m-${Date.now()}`,
      date: maintForm.date || formatDateForInput(new Date()),
      action: maintForm.action || 'Bảo dưỡng định kỳ',
      performedBy: maintForm.performedBy || 'Trạm Kỹ thuật',
      costVnd: Number(maintForm.costVnd) || 0
    };

    const updatedItem: EquipmentItem = {
      ...showMaintenanceModal,
      maintenanceLogs: [newLog, ...(showMaintenanceModal.maintenanceLogs || [])]
    };

    const updatedList = equipmentList.map(item => (item.id === showMaintenanceModal.id ? updatedItem : item));
    saveEquipment(updatedList, `Cập nhật nhật ký bảo dưỡng cho thiết bị: ${showMaintenanceModal.code}`);
    setEquipmentState(updatedList);
    setShowMaintenanceModal(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            Quản lý Phương tiện & Trang thiết bị Chuyên dụng RPBM
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Theo dõi máy dò kim loại, máy đo từ địa từ Foerster, xe tải dã chiến, xe chỉ huy và cảnh báo thời hạn ĐĂNG KIỂM / KIỂM ĐỊNH.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => exportEquipmentExcel(filteredEquipment)}
            className="bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-700 text-xs font-semibold px-3.5 py-2.5 rounded-xl shadow-md flex items-center gap-2 transition-all shrink-0"
            title="Tải tệp Excel danh sách thiết bị phương tiện"
          >
            <Download className="w-4 h-4 text-emerald-400" /> Xuất Excel
          </button>

          <button
            onClick={() => setShowAddEquipmentModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-950 flex items-center gap-2 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Thêm Thiết bị / Phương tiện
          </button>
        </div>
      </div>

      {/* Filter Category & Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thiết bị theo số hiệu máy, biển số xe, nhãn hiệu..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Tất cả loại thiết bị' },
            { id: 'may_do_nong', label: '🔍 Máy dò nông (<0.3m)' },
            { id: 'may_do_sau', label: '🧲 Máy dò sâu (đến 5m)' },
            { id: 'phuong_tien', label: '🚚 Xe dã chiến / Xe chỉ huy' },
            { id: 'bao_ho', label: '🛡️ Áo giáp & Mũ bảo hộ' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-emerald-900/80 text-emerald-200 border border-emerald-600'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEquipment.map(item => {
          const calibInfo = getExpiryBadgeInfo(item.nextCalibrationDate);
          return (
            <div
              key={item.id}
              className="bg-slate-900 border border-slate-800 hover:border-emerald-700/80 rounded-2xl p-5 shadow-xl transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header Code & Calibration Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-700">
                      {item.code}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">{EQUIPMENT_CAT_MAP[item.category] || item.category}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border font-mono ${calibInfo.classNames}`}>
                    Đăng kiểm/Hiệu chuẩn: {calibInfo.label}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-sm font-bold text-white leading-snug">{item.name}</h3>

                {/* Info Card */}
                <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Hãng / Model</span>
                    <strong className="text-slate-200 font-mono">{item.brandModel}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Số máy / Biển số</span>
                    <strong className="text-emerald-300 font-mono">{item.serialOrPlate}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Kiểm định gần nhất</span>
                    <strong className="text-slate-300 font-mono">{formatDateVN(item.lastCalibrationDate)}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Hạn Đăng kiểm tiếp theo</span>
                    <strong className="text-amber-300 font-mono">{formatDateVN(item.nextCalibrationDate)}</strong>
                  </div>
                </div>

                {/* Location & Personnel */}
                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Vị trí hiện tại: <strong className="text-slate-200">{item.location}</strong></span>
                  </div>
                  {item.assignedTo && (
                    <div>Phân công phụ trách: <strong className="text-emerald-400">{item.assignedTo}</strong></div>
                  )}
                </div>

                {/* Maintenance Log Preview */}
                {item.maintenanceLogs && item.maintenanceLogs.length > 0 && (
                  <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[11px] space-y-1">
                    <div className="font-bold text-slate-300 flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Wrench className="w-3 h-3 text-amber-400" /> Bảo dưỡng gần nhất ({formatDateVN(item.maintenanceLogs[0].date)})
                      </span>
                      <span className="text-emerald-400 font-mono">{formatVND(item.maintenanceLogs[0].costVnd)}</span>
                    </div>
                    <p className="text-slate-400 truncate">{item.maintenanceLogs[0].action}</p>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="pt-3 border-t border-slate-800 flex justify-between items-center">
                <button
                  onClick={() => handleDeleteEquipment(item)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                  title="Xóa / Chuyển vào Thùng rác"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => setShowMaintenanceModal(item)}
                  className="bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Ghi nhận Bảo dưỡng & Đăng kiểm</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Add Equipment */}
      {showAddEquipmentModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-emerald-400 flex items-center gap-2">
                <Truck className="w-5 h-5" /> Thêm mới Trang thiết bị / Phương tiện
              </h3>
              <button onClick={() => setShowAddEquipmentModal(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipment} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Mã thiết bị *</label>
                  <input
                    type="text"
                    required
                    value={eqForm.code || ''}
                    onChange={e => setEqForm({ ...eqForm, code: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Loại trang bị *</label>
                  <select
                    value={eqForm.category || 'may_do_nong'}
                    onChange={e => setEqForm({ ...eqForm, category: e.target.value as EquipmentCategory })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  >
                    <option value="may_do_nong">Máy dò kim loại nông</option>
                    <option value="may_do_sau">Máy dò sâu đến 5m</option>
                    <option value="phuong_tien">Phương tiện cơ giới / Xe</option>
                    <option value="bao_ho">Áo giáp & Mũ bảo hộ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Tên thiết bị / Phương tiện *</label>
                <input
                  type="text"
                  required
                  value={eqForm.name || ''}
                  onChange={e => setEqForm({ ...eqForm, name: e.target.value })}
                  placeholder="VD: Máy dò Vallon VMR3, Xe tải dã chiến Hino..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hãng / Model</label>
                  <input
                    type="text"
                    value={eqForm.brandModel || ''}
                    onChange={e => setEqForm({ ...eqForm, brandModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số máy / Biển số *</label>
                  <input
                    type="text"
                    required
                    value={eqForm.serialOrPlate || ''}
                    onChange={e => setEqForm({ ...eqForm, serialOrPlate: e.target.value })}
                    placeholder="VD: SN-VAL-2022, 29C-882.11"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày Kiểm định gần nhất</label>
                  <input
                    type="date"
                    value={eqForm.lastCalibrationDate || ''}
                    onChange={e => setEqForm({ ...eqForm, lastCalibrationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hạn Đăng kiểm tiếp theo *</label>
                  <input
                    type="date"
                    required
                    value={eqForm.nextCalibrationDate || ''}
                    onChange={e => setEqForm({ ...eqForm, nextCalibrationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Vị trí lưu kho / Công trường</label>
                <input
                  type="text"
                  value={eqForm.location || ''}
                  onChange={e => setEqForm({ ...eqForm, location: e.target.value })}
                  placeholder="Công trường Quảng Trị, Kho Hà Nội..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddEquipmentModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Thêm Thiết Bị
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Maintenance Record */}
      {showMaintenanceModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <Wrench className="w-5 h-5" /> Ghi nhận Bảo dưỡng & Đăng kiểm ({showMaintenanceModal.code})
              </h3>
              <button onClick={() => setShowMaintenanceModal(null)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddMaintenance} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Ngày thực hiện bảo dưỡng/đăng kiểm</label>
                <input
                  type="date"
                  required
                  value={maintForm.date || ''}
                  onChange={e => setMaintForm({ ...maintForm, date: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nội dung bảo dưỡng / Kiểm định *</label>
                <textarea
                  required
                  rows={2}
                  value={maintForm.action || ''}
                  onChange={e => setMaintForm({ ...maintForm, action: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Đơn vị thực hiện</label>
                  <input
                    type="text"
                    value={maintForm.performedBy || ''}
                    onChange={e => setMaintForm({ ...maintForm, performedBy: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Chi phí (VND)</label>
                  <input
                    type="number"
                    value={maintForm.costVnd || ''}
                    onChange={e => setMaintForm({ ...maintForm, costVnd: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-emerald-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMaintenanceModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
                >
                  Lưu Bảo Dưỡng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
