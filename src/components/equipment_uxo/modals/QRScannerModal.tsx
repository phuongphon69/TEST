import React, { useState } from 'react';
import { QrCode, Search, Camera, CheckCircle2, ShieldCheck, Wrench, Send, ExternalLink, X, FileText, Calendar, Building, MapPin, Sparkles } from 'lucide-react';
import { UXOEquipment } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  equipmentList: UXOEquipment[];
  isOpen: boolean;
  onClose: () => void;
  selectedEquipment?: UXOEquipment | null;
}

export const QRScannerModal: React.FC<Props> = ({
  equipmentList,
  isOpen,
  onClose,
  selectedEquipment
}) => {
  const [scannedCode, setScannedCode] = useState<string>(selectedEquipment?.qrCode || selectedEquipment?.assetCode || '');
  const [activeTab, setActiveTab] = useState<'info' | 'calibrations' | 'maintenances' | 'dispatches'>('info');

  if (!isOpen) return null;

  // Find target equipment by code or ID
  const matched = equipmentList.find(
    e =>
      e.qrCode.toLowerCase() === scannedCode.trim().toLowerCase() ||
      e.assetCode.toLowerCase() === scannedCode.trim().toLowerCase() ||
      e.serialNumber.toLowerCase() === scannedCode.trim().toLowerCase() ||
      e.id === scannedCode
  ) || selectedEquipment || equipmentList[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl space-y-0 my-6">
        {/* Modal Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Trương trình Quét Mã QR & Truy xuất Thông tin Thiết bị RPBM
              </h3>
              <p className="text-xs text-slate-400">
                Tra cứu tức thì Hồ sơ kỹ thuật, Lịch sử kiểm định theo đợt, Bảo trì & Cấp phát thu hồi bằng mã QR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* QR Simulation / Selector Bar */}
        <div className="p-6 bg-slate-950/50 border-b border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 text-xs">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={scannedCode}
                onChange={e => setScannedCode(e.target.value)}
                placeholder="Nhập hoặc quét Mã QR / Mã tài sản / Số serial (ví dụ: QR-TS-MDB-001-VXC1)..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Quick selector dropdown */}
            <select
              onChange={e => setScannedCode(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-sans"
            >
              <option value="">-- Bấm chọn nhanh thiết bị trong hệ thống --</option>
              {equipmentList.map(item => (
                <option key={item.id} value={item.qrCode}>
                  [{item.assetCode}] {item.name} ({item.brand})
                </option>
              ))}
            </select>
          </div>

          {/* Preset QR tag simulator buttons */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Mã QR Mẫu nhanh:
            </span>
            {equipmentList.slice(0, 4).map(eq => (
              <button
                key={eq.id}
                onClick={() => setScannedCode(eq.qrCode)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-lg border border-slate-700 font-mono transition-colors"
              >
                {eq.assetCode}
              </button>
            ))}
          </div>
        </div>

        {/* Details View for Matched Equipment */}
        {matched ? (
          <div className="p-6 space-y-6 text-xs max-h-[70vh] overflow-y-auto">
            {/* Top Quick Profile Card */}
            <div className="bg-slate-950 rounded-2xl p-5 border border-amber-500/30 shadow-xl flex flex-col md:flex-row gap-5 items-start">
              {/* QR Image Box */}
              <div className="bg-white p-3 rounded-xl shrink-0 flex flex-col items-center justify-center text-center shadow-lg border border-slate-300">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(matched.qrCode)}`}
                  alt="QR Code"
                  className="w-28 h-28 object-contain"
                />
                <div className="mt-1 font-mono font-bold text-[10px] text-slate-900">{matched.assetCode}</div>
              </div>

              {/* Equipment Main Overview */}
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                    MÃ QR: {matched.qrCode}
                  </span>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                    S/N: {matched.serialNumber}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    matched.status === 'san_sang' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                    matched.status === 'dang_su_dung' ? 'bg-sky-500/10 text-sky-400 border border-sky-500/30' :
                    matched.status === 'dang_bao_tri' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {matched.status === 'san_sang' ? '✓ SẴN SÀNG' : matched.status === 'dang_su_dung' ? '⚡ ĐANG SỬ DỤNG' : matched.status === 'dang_bao_tri' ? '🔧 ĐANG BẢO TRÌ' : matched.status}
                  </span>
                </div>

                <h3 className="text-base font-black text-slate-100">{matched.name}</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-[11px] text-slate-300 pt-1">
                  <div><span className="text-slate-400">Hãng & Model:</span> <strong className="text-slate-100">{matched.brand} - {matched.model}</strong></div>
                  <div><span className="text-slate-400">Năm SX / Ngày dùng:</span> <span className="font-mono">{matched.manufactureYear} ({formatDateVN(matched.commissioningDate)})</span></div>
                  <div><span className="text-slate-400">Đơn vị quản lý:</span> <strong className="text-slate-200">{matched.managingUnit}</strong></div>
                  <div><span className="text-slate-400">Người quản lý:</span> <span className="text-slate-200">{matched.managerName}</span></div>
                  <div><span className="text-slate-400">Vị trí hiện tại:</span> <span className="text-amber-300 font-semibold">{matched.currentLocation}</span></div>
                  <div><span className="text-slate-400">Dự án áp dụng:</span> <span className="text-sky-300">{matched.currentProject || 'Chưa gán'}</span></div>
                </div>
              </div>
            </div>

            {/* Sub Tabs Inside QR Scan View */}
            <div className="flex border-b border-slate-800 text-xs font-bold gap-2">
              <button
                onClick={() => setActiveTab('info')}
                className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'info'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-4 h-4" /> 1. Hồ sơ & File Kỹ thuật
              </button>

              <button
                onClick={() => setActiveTab('calibrations')}
                className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'calibrations'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 2. Đợt Kiểm định / Hiệu chuẩn ({matched.calibrationHistory?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('maintenances')}
                className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'maintenances'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Wrench className="w-4 h-4 text-amber-400" /> 3. Nhật ký Bảo trì & Sửa chữa ({matched.maintenanceHistory?.length || 0})
              </button>

              <button
                onClick={() => setActiveTab('dispatches')}
                className={`px-3.5 py-2 border-b-2 transition-all flex items-center gap-1.5 ${
                  activeTab === 'dispatches'
                    ? 'border-amber-500 text-amber-400 bg-amber-500/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-4 h-4 text-sky-400" /> 4. Lịch sử Cấp phát & Thu hồi ({matched.dispatchHistory?.length || 0})
              </button>
            </div>

            {/* Tab 1: Dossiers & Manuals */}
            {activeTab === 'info' && (
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Nguồn hình thành tài sản:</span>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-200 font-medium">
                      {matched.originSource || 'Chưa cập nhật'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Ghi chú kỹ thuật:</span>
                    <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                      {matched.notes || 'Không có ghi chú.'}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Hồ sơ kỹ thuật (Dossier):</span>
                    {matched.technicalDossierUrl ? (
                      <a
                        href={matched.technicalDossierUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-amber-400 hover:underline flex items-center justify-between font-mono"
                      >
                        <span>📄 File_Ho_so_Ky_thuat_Specs.pdf</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-500 italic">
                        Chưa đính kèm file hồ sơ
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Hướng dẫn sử dụng (User Manual):</span>
                    {matched.userManualUrl ? (
                      <a
                        href={matched.userManualUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-sky-400 hover:underline flex items-center justify-between font-mono"
                      >
                        <span>📖 Huong_dan_su_dung_Manual.pdf</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <div className="p-2.5 bg-slate-900/50 rounded-lg border border-slate-800 text-slate-500 italic">
                        Chưa đính kèm tài liệu hướng dẫn
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Calibration Rounds */}
            {activeTab === 'calibrations' && (
              <div className="space-y-3">
                {matched.calibrationHistory && matched.calibrationHistory.length > 0 ? (
                  <div className="space-y-2">
                    {matched.calibrationHistory.map(cal => (
                      <div key={cal.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5 font-sans">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="font-mono font-bold text-amber-400 text-xs">{cal.roundCode} - {cal.certificateNo}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            cal.result === 'dat' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/10 text-rose-400'
                          }`}>
                            {cal.result === 'dat' ? '✓ ĐẠT CHUẨN KĨ THUẬT' : '✗ KHÔNG ĐẠT'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                          <div>Đơn vị: <strong className="text-slate-100">{cal.providerUnit}</strong></div>
                          <div>Ngày thực hiện: <span className="font-mono">{formatDateVN(cal.inspectionDate || cal.calibrationDate)}</span></div>
                          <div>Hạn hết hiệu lực: <strong className="font-mono text-emerald-400">{formatDateVN(cal.expiryDate)}</strong></div>
                        </div>
                        {cal.notes && <div className="text-[11px] text-slate-400 italic">Ghi chú: {cal.notes}</div>}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 text-center text-slate-500 rounded-xl">Chưa có nhật ký kiểm định cho thiết bị này.</div>
                )}
              </div>
            )}

            {/* Tab 3: Maintenance */}
            {activeTab === 'maintenances' && (
              <div className="space-y-3">
                {matched.maintenanceHistory && matched.maintenanceHistory.length > 0 ? (
                  <div className="space-y-2">
                    {matched.maintenanceHistory.map(maint => (
                      <div key={maint.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-100">{maint.content}</span>
                          <span className="font-mono text-amber-400 font-bold">{formatDateVN(maint.maintenanceDate)}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>Đơn vị sửa chữa: {maint.providerUnit}</div>
                          <div>Linh kiện thay thế: {maint.replacedParts || 'Không có'}</div>
                          <div>Chi phí: {maint.costVnd ? `${maint.costVnd.toLocaleString('vi-VN')} VND` : 'Miễn phí'}</div>
                          <div>Thời gian dừng hoạt động: <span className="font-mono text-amber-300">{maint.downtimeHours || 0} giờ</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 text-center text-slate-500 rounded-xl">Chưa có nhật ký bảo trì & sửa chữa.</div>
                )}
              </div>
            )}

            {/* Tab 4: Dispatches */}
            {activeTab === 'dispatches' && (
              <div className="space-y-3">
                {matched.dispatchHistory && matched.dispatchHistory.length > 0 ? (
                  <div className="space-y-2">
                    {matched.dispatchHistory.map(disp => (
                      <div key={disp.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-sky-400">Người nhận: {disp.receiverName}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            disp.status === 'dang_muon' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/10 text-emerald-400'
                          }`}>
                            {disp.status === 'dang_muon' ? 'ĐANG CẤP PHÁT' : 'ĐÃ THU HỒI'}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
                          <div>Dự án: {disp.projectName}</div>
                          <div>Người phê duyệt: {disp.approverName}</div>
                          <div>Ngày giao: <span className="font-mono">{formatDateVN(disp.issueDate)}</span></div>
                          <div>Ngày trả dự kiến: <span className="font-mono text-amber-300">{formatDateVN(disp.expectedReturnDate)}</span></div>
                        </div>
                        {disp.actualReturnDate && (
                          <div className="text-[11px] text-emerald-400 font-mono">
                            Ngày trả thực tế: {formatDateVN(disp.actualReturnDate)} - Tình trạng trả: {disp.returnCondition}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 bg-slate-950 text-center text-slate-500 rounded-xl">Chưa có nhật ký cấp phát & thu hồi.</div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            Không tìm thấy thiết bị nào phù hợp với mã quét/mã tài sản này.
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-950 px-6 py-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            Đóng cửa sổ QR
          </button>
        </div>
      </div>
    </div>
  );
};
