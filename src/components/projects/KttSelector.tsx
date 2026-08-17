import React, { useEffect, useState } from 'react';
import {
  findKttConfigForProvince,
  validateKttMatch,
  COMMON_KTT_OPTIONS,
  getAllKttConfigs,
  saveCustomKttConfig,
  CentralMeridianConfig,
  decimalDegreeToDegreeMinute,
  formatCentralMeridian
} from '../../utils/centralMeridianConfig';
import { Compass, AlertTriangle, CheckCircle2, Info, Settings, Plus, X, Layers, Globe } from 'lucide-react';

interface Props {
  provinceName: string;
  selectedKtt: number;
  selectedZone?: '3deg' | '6deg';
  selectedCoordinateSystem?: string;
  onChange: (ktt: number, zone: '3deg' | '6deg', system: string, provinceCode?: string) => void;
}

export const KttSelector: React.FC<Props> = ({
  provinceName,
  selectedKtt,
  selectedZone = '3deg',
  selectedCoordinateSystem = 'VN-2000',
  onChange
}) => {
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [customKttInput, setCustomKttInput] = useState<string>('');
  const [customNote, setCustomNote] = useState<string>('');

  // Auto propose KTT when province changes if selectedKtt is 0 or unset or province changed
  useEffect(() => {
    if (provinceName) {
      const config = findKttConfigForProvince(provinceName);
      if (config && (!selectedKtt || selectedKtt === 0)) {
        onChange(config.centralMeridian, config.projectionZone || '3deg', config.coordinateSystem || 'VN-2000', config.provinceCode);
      }
    }
  }, [provinceName]);

  const validation = validateKttMatch(provinceName, selectedKtt);
  const matchedConfig = findKttConfigForProvince(provinceName);

  const handleSystemChange = (sys: string) => {
    onChange(selectedKtt || 106.25, selectedZone, sys, matchedConfig?.provinceCode);
  };

  const handleZoneChange = (zone: '3deg' | '6deg') => {
    onChange(selectedKtt || 106.25, zone, selectedCoordinateSystem, matchedConfig?.provinceCode);
  };

  const handleSelectKtt = (kttVal: number) => {
    const config = findKttConfigForProvince(provinceName);
    const zone = config?.projectionZone || selectedZone || '3deg';
    const sys = config?.coordinateSystem || selectedCoordinateSystem || 'VN-2000';
    onChange(kttVal, zone, sys, config?.provinceCode);
  };

  const handleSaveCustomKttForProvince = (e: React.FormEvent) => {
    e.preventDefault();
    const kttNum = parseFloat(customKttInput);
    if (isNaN(kttNum) || kttNum < 100 || kttNum > 110) {
      alert('Vui lòng nhập giá trị Kinh tuyến trục hợp lệ trong khoảng 102.0° đến 110.0°!');
      return;
    }

    const newConfig: CentralMeridianConfig = {
      provinceCode: matchedConfig?.provinceCode || provinceName.substring(0, 4).toUpperCase(),
      provinceName: provinceName || 'Tỉnh mới',
      centralMeridian: kttNum,
      zoneWidth: selectedZone === '6deg' ? 6 : 3,
      projectionZone: (selectedZone as '3deg' | '6deg') || '3deg',
      coordinateSystem: (selectedCoordinateSystem as 'VN-2000' | 'WGS84') || 'VN-2000',
      scaleFactor: selectedZone === '6deg' ? 0.9996 : 0.9999,
      falseEasting: 500000,
      falseNorthing: 0,
      axisOrder: 'XY',
      unit: 'meter',
      note: customNote || 'Cấu hình tùy chỉnh bởi Quản trị viên'
    };

    saveCustomKttConfig(newConfig);
    onChange(kttNum, newConfig.projectionZone || '3deg', selectedCoordinateSystem, newConfig.provinceCode);
    setShowConfigModal(false);
    setCustomKttInput('');
    setCustomNote('');
  };

  const scaleFactorDisplay = selectedZone === '6deg' ? '0.9996' : '0.9999';

  return (
    <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
          <Compass className="w-4 h-4 text-sky-400" />
          Kinh tuyến trục KTT & Cấu hình Hệ tọa độ <span className="text-rose-400">*</span>
        </label>
        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="p-1 text-slate-400 hover:text-sky-300 rounded hover:bg-slate-800 flex items-center gap-1 text-[11px]"
          title="Cấu hình danh mục KTT"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Cấu hình KTT</span>
        </button>
      </div>

      {/* Selectors Grid: System, Zone, Central Meridian */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {/* 1. Coordinate System */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Hệ tọa độ
          </label>
          <select
            value={selectedCoordinateSystem}
            onChange={e => handleSystemChange(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-300 focus:outline-none focus:border-sky-500"
          >
            <option value="VN-2000">VN-2000 (Việt Nam)</option>
            <option value="WGS84">WGS84 (Quốc tế / GPS)</option>
          </select>
        </div>

        {/* 2. Projection Zone */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Múi chiếu
          </label>
          <select
            value={selectedZone}
            onChange={e => handleZoneChange(e.target.value as '3deg' | '6deg')}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-amber-300 focus:outline-none focus:border-amber-500"
          >
            <option value="3deg">Múi 3° (k0 = 0.9999)</option>
            <option value="6deg">Múi 6° (k0 = 0.9996)</option>
          </select>
        </div>

        {/* 3. Central Meridian (KTT) */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-400 mb-1">
            Kinh tuyến trục (KTT)
          </label>
          <select
            value={selectedKtt || 106.25}
            onChange={e => handleSelectKtt(parseFloat(e.target.value))}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500"
          >
            {COMMON_KTT_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label} ({opt.value.toFixed(2)}°)
              </option>
            ))}
            {!COMMON_KTT_OPTIONS.some(o => o.value === selectedKtt) && selectedKtt > 0 && (
              <option value={selectedKtt}>
                {decimalDegreeToDegreeMinute(selectedKtt)} ({selectedKtt.toFixed(2)}° - Tùy chỉnh)
              </option>
            )}
          </select>
        </div>
      </div>

      {/* Border suggestion buttons if applicable */}
      {matchedConfig?.alternativeMeridians && matchedConfig.alternativeMeridians.length > 0 && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-slate-800/80">
          <span className="font-semibold text-amber-400">Đề xuất giáp ranh {matchedConfig.provinceName}:</span>
          <button
            type="button"
            onClick={() => handleSelectKtt(matchedConfig.centralMeridian)}
            className={`px-2 py-0.5 rounded font-mono text-xs transition-all ${
              selectedKtt === matchedConfig.centralMeridian
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            }`}
          >
            {formatCentralMeridian(matchedConfig.centralMeridian)} (Chính)
          </button>
          {matchedConfig.alternativeMeridians.map(alt => (
            <button
              key={alt}
              type="button"
              onClick={() => handleSelectKtt(alt)}
              className={`px-2 py-0.5 rounded font-mono text-xs transition-all ${
                selectedKtt === alt
                  ? 'bg-sky-500 text-white font-bold shadow'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300'
              }`}
            >
              {formatCentralMeridian(alt)} (Bổ sung)
            </button>
          ))}
        </div>
      )}

      {/* Active Configuration Summary Display Card */}
      <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-[11px] text-slate-300 grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5">
        <div>
          <span className="text-slate-500">Hệ tọa độ:</span>{' '}
          <span className="text-sky-300 font-bold">{selectedCoordinateSystem}</span>
        </div>
        <div>
          <span className="text-slate-500">Múi chiếu:</span>{' '}
          <span className="text-amber-300 font-bold">{selectedZone === '6deg' ? '6°' : '3°'}</span>
        </div>
        <div>
          <span className="text-slate-500">Kinh tuyến trục:</span>{' '}
          <span className="text-emerald-300 font-bold">{formatCentralMeridian(selectedKtt)}</span>
        </div>
        <div>
          <span className="text-slate-500">Hệ số k0:</span>{' '}
          <span className="text-slate-200 font-bold">{scaleFactorDisplay}</span>
        </div>
        <div>
          <span className="text-slate-500">Đơn vị:</span>{' '}
          <span className="text-slate-200 font-bold">mét</span>
        </div>
        <div>
          <span className="text-slate-500">Thứ tự tọa độ:</span>{' '}
          <span className="text-slate-200 font-bold">X/Y (N/E)</span>
        </div>
      </div>

      {/* Validation Status Message */}
      <div className="text-xs">
        {validation.isConfigured ? (
          validation.isExactMatch ? (
            <div className="p-2 bg-emerald-950/50 border border-emerald-800/60 rounded-lg text-emerald-300 flex items-start gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">{validation.message}</span>
            </div>
          ) : validation.isAlternativeMatch ? (
            <div className="p-2 bg-sky-950/50 border border-sky-800/60 rounded-lg text-sky-300 flex items-start gap-1.5">
              <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">{validation.message}</span>
            </div>
          ) : (
            <div className="p-2 bg-amber-950/60 border border-amber-800/60 rounded-lg text-amber-300 flex items-start justify-between gap-1.5">
              <div className="flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-tight">
                  <div>{validation.message}</div>
                  {validation.recommendedKtt && (
                    <button
                      type="button"
                      onClick={() => handleSelectKtt(validation.recommendedKtt!)}
                      className="mt-1 underline text-amber-200 font-semibold hover:text-white"
                    >
                      👉 Nhấn để tự động đổi về KTT chuẩn ({formatCentralMeridian(validation.recommendedKtt)})
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        ) : (
          <div className="p-2 bg-rose-950/50 border border-rose-800/60 rounded-lg text-rose-300 flex items-start justify-between gap-1.5">
            <div className="flex items-start gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[11px] leading-tight">
                Chưa có cấu hình KTT chuẩn cho tỉnh "{provinceName || 'chưa chọn'}".
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-2 py-0.5 bg-rose-500/20 text-rose-200 border border-rose-500/40 rounded text-[10px] shrink-0 font-medium hover:bg-rose-500/30"
            >
              Cấu hình KTT
            </button>
          </div>
        )}
      </div>

      {/* Admin Quick KTT Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                <Settings className="w-4 h-4 text-sky-400" />
                Cấu hình Kinh tuyến trục (KTT) cho Tỉnh thành
              </h4>
              <button onClick={() => setShowConfigModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomKttForProvince} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Tỉnh / Thành phố:</label>
                <input
                  type="text"
                  value={provinceName}
                  disabled
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-amber-300 font-semibold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Kinh tuyến trục KTT (độ decimal, e.g. 106.25):</label>
                <input
                  type="number"
                  step="0.01"
                  min="102"
                  max="110"
                  required
                  placeholder="VD: 106.25"
                  value={customKttInput}
                  onChange={e => setCustomKttInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 font-mono focus:outline-none focus:border-sky-500"
                />
                {customKttInput && !isNaN(parseFloat(customKttInput)) && (
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">
                    Định dạng độ phút: {formatCentralMeridian(parseFloat(customKttInput))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Ghi chú / Quyết định quy định:</label>
                <input
                  type="text"
                  placeholder="VD: QĐ 05/2007/QĐ-BTNMT"
                  value={customNote}
                  onChange={e => setCustomNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-slate-100 focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded font-medium"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded font-bold shadow-sm"
                >
                  Lưu cấu hình KTT
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

