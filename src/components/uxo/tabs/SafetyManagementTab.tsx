import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Search,
  CheckCircle2,
  AlertOctagon,
  PhoneCall,
  Activity,
  FileText,
  UserCheck,
  Building2,
  MapPin,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  Stethoscope,
  X,
  Radio
} from 'lucide-react';
import { UXOSafetyRecord, Project } from '../../../types';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  safetyRecords: UXOSafetyRecord[];
  projects: Project[];
  onSaveSafetyRecord: (record: UXOSafetyRecord) => void;
  onDeleteSafetyRecord: (id: string) => void;
}

export const SafetyManagementTab: React.FC<Props> = ({
  safetyRecords,
  projects,
  onSaveSafetyRecord,
  onDeleteSafetyRecord
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'checklist' | 'emergency' | 'incidents'>('overview');
  const [viewingRecord, setViewingRecord] = useState<UXOSafetyRecord | null>(null);

  const currentRecord = safetyRecords.find(r => selectedProjectId === 'all' || r.projectId === selectedProjectId) || safetyRecords[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" /> 8.7. Quản lý An toàn Lao động & RPBM
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Phương án an toàn QCVN 01:2019/BQP, nhật ký kiểm tra an toàn hằng ngày, trang bị BHLĐ, khu vực nguy hiểm, danh bạ khẩn cấp & sơ cấp cứu.
          </p>
        </div>

        <select
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500 w-full sm:w-72 shrink-0"
        >
          <option value="all">Tất cả dự án</option>
          {projects.map(p => (
            <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
          ))}
        </select>
      </div>

      {/* Sub Navigation Bar */}
      <div className="flex border-b border-slate-800 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('overview')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'overview'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" /> Phương án & Quán triệt An toàn
        </button>

        <button
          onClick={() => setActiveSubTab('checklist')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'checklist'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" /> Nhật ký Kiểm tra An toàn Hằng ngày
        </button>

        <button
          onClick={() => setActiveSubTab('emergency')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'emergency'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <PhoneCall className="w-4 h-4" /> Danh bạ Khẩn cấp & Cấp cứu Y tế
        </button>

        <button
          onClick={() => setActiveSubTab('incidents')}
          className={`px-4 py-2.5 border-b-2 whitespace-nowrap transition-colors flex items-center gap-2 ${
            activeSubTab === 'incidents'
              ? 'border-amber-500 text-amber-400 bg-amber-500/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <AlertOctagon className="w-4 h-4 text-rose-400" /> Sự cố & Diễn tập Khẩn cấp
        </button>
      </div>

      {/* Sub Tab 1: Overview */}
      {activeSubTab === 'overview' && currentRecord && (
        <div className="space-y-5">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {currentRecord.projectName}
                </span>
                <h4 className="text-base font-bold text-slate-100 mt-1">{currentRecord.safetyPlanTitle}</h4>
              </div>

              {currentRecord.trainingMinutesUrl && (
                <a
                  href={currentRecord.trainingMinutesUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0"
                >
                  <FileText className="w-4 h-4" /> Biên bản quán triệt (PDF)
                </a>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-slate-300 font-bold block flex items-center gap-1.5 text-sm">
                  <UserCheck className="w-4 h-4 text-emerald-400" /> Nhân sự đã quán triệt an toàn:
                </strong>
                <p className="text-slate-300 leading-relaxed">{currentRecord.briefedPersonnelList}</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                <strong className="text-slate-300 font-bold block flex items-center gap-1.5 text-sm">
                  <Radio className="w-4 h-4 text-sky-400" /> Trang bị BHLĐ & Thiết bị cá nhân:
                </strong>
                <p className="text-slate-300 leading-relaxed">{currentRecord.ppeTrackingNotes}</p>
              </div>
            </div>

            <div className="bg-rose-950/30 border border-rose-500/30 p-4 rounded-xl space-y-1 text-xs">
              <strong className="text-rose-400 font-bold flex items-center gap-1.5 text-sm">
                <AlertOctagon className="w-4 h-4" /> Khoanh vùng Khu vực Nguy hiểm & Cấm vào:
              </strong>
              <p className="text-rose-200/90 leading-relaxed">{currentRecord.dangerAndRestrictedZones}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 2: Daily Safety Checklist */}
      {activeSubTab === 'checklist' && currentRecord && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Nhật ký Kiểm tra An toàn Công trường Hằng ngày
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              Tổng số đợt kiểm tra: {currentRecord.dailyChecklist.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="p-3">Ngày</th>
                  <th className="p-3">Mũ/Giày BHLĐ</th>
                  <th className="p-3">Biển cảnh báo</th>
                  <th className="p-3">Túi y tế</th>
                  <th className="p-3">Bộ đàm liên lạc</th>
                  <th className="p-3">Người kiểm tra</th>
                  <th className="p-3">Đánh giá</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {currentRecord.dailyChecklist.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-bold text-amber-400">{formatDateVN(item.date)}</td>
                    <td className="p-3 font-sans">
                      {item.ppeChecked ? <span className="text-emerald-400 font-bold">✓ Đầy đủ</span> : <span className="text-rose-400 font-bold">✗ Thiếu</span>}
                    </td>
                    <td className="p-3 font-sans">
                      {item.warningSignageChecked ? <span className="text-emerald-400 font-bold">✓ Đã cắm cờ</span> : <span className="text-rose-400 font-bold">✗ Chưa cắm</span>}
                    </td>
                    <td className="p-3 font-sans">
                      {item.medicalEquipmentChecked ? <span className="text-emerald-400 font-bold">✓ Sẵn sàng</span> : <span className="text-rose-400 font-bold">✗ Thiếu</span>}
                    </td>
                    <td className="p-3 font-sans">
                      {item.communicationChecked ? <span className="text-emerald-400 font-bold">✓ Thông suốt</span> : <span className="text-rose-400 font-bold">✗ Lỗi</span>}
                    </td>
                    <td className="p-3 font-sans text-slate-200">{item.inspectorName}</td>
                    <td className="p-3 font-sans">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${item.passed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/10 text-rose-400 border-rose-500/30'}`}>
                        {item.passed ? 'ĐẠT AN TOÀN' : 'KHÔNG ĐẠT'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub Tab 3: Emergency Directory & Nearby Medical Facilities */}
      {activeSubTab === 'emergency' && currentRecord && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Contacts */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <PhoneCall className="w-5 h-5 text-amber-400" /> Danh bạ Liên lạc Khẩn cấp Công trường
            </h4>

            <div className="space-y-3">
              {currentRecord.emergencyContacts.map((contact, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <div className="font-bold text-slate-200 text-sm">{contact.title}</div>
                    <div className="text-slate-400 mt-0.5">{contact.unitName}</div>
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg font-mono font-bold text-sm hover:bg-emerald-500/20"
                  >
                    {contact.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          {/* Medical Facilities */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Stethoscope className="w-5 h-5 text-emerald-400" /> Cơ sở Y tế / Bệnh viện Gần nhất
            </h4>

            <div className="space-y-3">
              {currentRecord.nearbyMedicalFacilities.map((facility, idx) => (
                <div key={idx} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div className="font-bold text-slate-200 text-sm">{facility.name}</div>
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono font-bold border border-sky-500/20">
                      {facility.distanceKm} km
                    </span>
                  </div>
                  <div className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {facility.address}
                  </div>
                  {facility.phone && (
                    <div className="text-amber-400 font-mono font-bold pt-1 border-t border-slate-800/80">
                      SĐT Khẩn cấp: {facility.phone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sub Tab 4: Incidents & Emergency Drills */}
      {activeSubTab === 'incidents' && currentRecord && (
        <div className="space-y-5">
          {/* Drills */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Activity className="w-5 h-5 text-sky-400" /> Phương án & Nhật ký Diễn tập Khẩn cấp
            </h4>

            <div className="space-y-3">
              {currentRecord.emergencyDrills.map((drill, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <h5 className="font-bold text-slate-200 text-sm">{drill.title}</h5>
                    <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-mono font-bold border border-amber-500/20">
                      {formatDateVN(drill.drillDate)}
                    </span>
                  </div>
                  <p className="text-slate-300"><strong className="text-slate-400">Phương án đáp ứng:</strong> {drill.responsePlan}</p>
                  <p className="text-slate-400"><strong className="text-slate-300">Số lượng quân số tham gia:</strong> {drill.participantsCount} người</p>
                </div>
              ))}
            </div>
          </div>

          {/* Incidents */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <AlertOctagon className="w-5 h-5 text-rose-400" /> Sổ Theo dõi Sự cố An toàn Công trường
            </h4>

            {currentRecord.incidents.length > 0 ? (
              <div className="space-y-3">
                {currentRecord.incidents.map((inc) => (
                  <div key={inc.id} className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-rose-400">{formatDateVN(inc.incidentDate)}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-300 border border-rose-500/30 uppercase">
                        Mức độ: {inc.severity}
                      </span>
                    </div>
                    <p className="text-slate-200"><strong className="text-slate-400">Mô tả sự cố:</strong> {inc.description}</p>
                    <p className="text-emerald-300"><strong className="text-slate-400">Xử lý khắc phục:</strong> {inc.correctiveAction}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500 text-xs">
                Không có sự cố an toàn nào ghi nhận.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
