import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Filter,
  Search,
  Tag,
  Briefcase
} from 'lucide-react';
import { Project, Personnel } from '../types';
import { getProjects, getPersonnel, getCurrentUser, addAuditLog } from '../utils/storage';
import { formatDateVN } from '../utils/formatters';

export interface CalendarEvent {
  id: string;
  title: string;
  eventType: 'field_ops' | 'meeting' | 'inspection' | 'training';
  projectCode?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  location: string;
  participants: string[];
  status: 'planned' | 'in_progress' | 'completed' | 'canceled';
  notes?: string;
}

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-001',
    title: 'Triển khai lực lượng Dò tìm tín hiệu tại Hạng mục A - Dự án Vũng Tàu',
    eventType: 'field_ops',
    projectCode: 'DA001',
    startDate: '2026-07-28',
    endDate: '2026-08-05',
    location: 'Khu công nghiệp Vũng Tàu, Phường Rạch Dừa',
    participants: ['Đại tá Nguyễn Văn Long', 'Thiếu tá Hoàng Đình Phương', 'Trung úy Đỗ Mân'],
    status: 'in_progress',
    notes: 'Tiến hành dò tín hiệu từ 0m đến 5m độ sâu'
  },
  {
    id: 'evt-002',
    title: 'Họp Hội đồng Nghiệm thu Giai đoạn 1 - Cao tốc Mai Sơn',
    eventType: 'meeting',
    projectCode: 'DA002',
    startDate: '2026-07-30',
    endDate: '2026-07-30',
    location: 'Hội trường Ban QLDA Huyện Mai Sơn',
    participants: ['Đại tá Nguyễn Văn Long', 'Đại úy Nguyễn Thùy Linh'],
    status: 'planned',
    notes: 'Nghiệm thu 45ha diện tích mặt bằng đã bàn giao sạch'
  },
  {
    id: 'evt-003',
    title: 'Kiểm định định kỳ Máy dò bom Foerster & Vallon EL1302',
    eventType: 'inspection',
    startDate: '2026-08-02',
    endDate: '2026-08-03',
    location: 'Kho Thiết bị Tập trung PB3',
    participants: ['Đại úy Nguyễn Thùy Linh'],
    status: 'planned',
    notes: 'Thực hiện kiểm định và cấp tem kiểm định đợt 2/2026'
  },
  {
    id: 'evt-004',
    title: 'Tập huấn Quy chuẩn Kỹ thuật QCVN 01:2019/BQP cho Kỹ thuật viên',
    eventType: 'training',
    startDate: '2026-08-10',
    endDate: '2026-08-12',
    location: 'Trung tâm Bồi dưỡng Nghiệp vụ BTL',
    participants: ['Thiếu tá Hoàng Đình Phương', 'Trung úy Đỗ Mân'],
    status: 'planned',
    notes: 'Cấp chứng nhận An toàn Lao động RPBM định kỳ'
  }
];

export const WorkCalendarManager: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [selectedMonth, setSelectedMonth] = useState<number>(7); // 0-indexed: 7 is August
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedEventDetails, setSelectedEventDetails] = useState<CalendarEvent | null>(null);

  // Form states
  const projects: Project[] = getProjects();
  const personnel: Personnel[] = getPersonnel();
  const currentUser = getCurrentUser();

  const [formTitle, setFormTitle] = useState('');
  const [formEventType, setFormEventType] = useState<CalendarEvent['eventType']>('field_ops');
  const [formProjectCode, setFormProjectCode] = useState('DA001');
  const [formStartDate, setFormStartDate] = useState('2026-08-01');
  const [formEndDate, setFormEndDate] = useState('2026-08-02');
  const [formLocation, setFormLocation] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formParticipants, setFormParticipants] = useState<string[]>([]);

  const monthsList = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(prev => prev - 1);
    } else {
      setSelectedMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(prev => prev + 1);
    } else {
      setSelectedMonth(prev => prev + 1);
    }
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formStartDate || !formEndDate) {
      alert('Vui lòng nhập đầy đủ Tên sự kiện, Ngày bắt đầu và Ngày kết thúc!');
      return;
    }

    if (new Date(formEndDate) < new Date(formStartDate)) {
      alert('❌ Cảnh báo: Ngày kết thúc không được nhỏ hơn Ngày bắt đầu!');
      return;
    }

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title: formTitle,
      eventType: formEventType,
      projectCode: formProjectCode || undefined,
      startDate: formStartDate,
      endDate: formEndDate,
      location: formLocation || 'Chưa xác định',
      participants: formParticipants.length > 0 ? formParticipants : [currentUser.name],
      status: 'planned',
      notes: formNotes
    };

    setEvents(prev => [newEvt, ...prev]);
    addAuditLog('Lịch công tác', `Thêm mới lịch công tác: ${formTitle}`, 'tao', null, newEvt);
    setShowAddModal(false);
    setFormTitle('');
    setFormNotes('');
    alert('✅ Đã thêm mới Lịch công tác thành công!');
  };

  const filteredEvents = events.filter(e => {
    const matchSearch =
      searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.projectCode && e.projectCode.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchType = filterType === 'all' || e.eventType === filterType;

    return matchSearch && matchType;
  });

  // Calculate calendar grid for selected month & year
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 is Sunday

  const eventTypeLabels = {
    field_ops: { label: 'Rà phá Hiện trường', bg: 'bg-emerald-950 text-emerald-300 border-emerald-800' },
    meeting: { label: 'Họp / Báo cáo', bg: 'bg-amber-950 text-amber-300 border-amber-800' },
    inspection: { label: 'Kiểm định Thiết bị', bg: 'bg-sky-950 text-sky-300 border-sky-800' },
    training: { label: 'Tập huấn Professional', bg: 'bg-purple-950 text-purple-300 border-purple-800' }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 border border-slate-800 p-5 rounded-2xl shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-indigo-400" />
            Lịch Công tác & Kế hoạch Thi công (Mục 12)
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý lịch rà phá hiện trường, hội đồng nghiệm thu, kiểm định khí tài và công tác BTL.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950 transition-colors"
        >
          <Plus className="w-4 h-4" /> Thêm Lịch Công tác Mới
        </button>
      </div>

      {/* Filter & Month Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevMonth}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <span className="text-sm font-bold text-white font-mono min-w-[140px] text-center">
            {monthsList[selectedMonth]} {selectedYear}
          </span>

          <button
            onClick={handleNextMonth}
            className="p-2 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm lịch công tác, địa điểm..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">Tất cả loại lịch</option>
            <option value="field_ops">Rà phá Hiện trường</option>
            <option value="meeting">Họp / Báo cáo</option>
            <option value="inspection">Kiểm định Thiết bị</option>
            <option value="training">Tập huấn</option>
          </select>
        </div>
      </div>

      {/* Main View: Calendar Grid & Events List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLS: Visual Calendar Grid */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-800">
            <span>CN</span><span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 bg-slate-950/30 rounded-xl border border-slate-900/50"></div>
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              
              const dayEvents = filteredEvents.filter(e => {
                return dateStr >= e.startDate && dateStr <= e.endDate;
              });

              const isToday = dateStr === new Date().toISOString().slice(0, 10);

              return (
                <div
                  key={`day-${dayNum}`}
                  className={`h-24 p-1.5 rounded-xl border flex flex-col justify-between overflow-hidden transition-all ${
                    isToday
                      ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200'
                      : 'bg-slate-950 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${isToday ? 'bg-indigo-600 text-white w-5 h-5 rounded-full flex items-center justify-center' : 'text-slate-400'}`}>
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1 rounded font-mono font-bold">
                        {dayEvents.length} lịch
                      </span>
                    )}
                  </div>

                  {/* Day Events Preview */}
                  <div className="space-y-1 overflow-y-auto max-h-14 pr-0.5 text-[10px]">
                    {dayEvents.map(evt => (
                      <div
                        key={evt.id}
                        onClick={() => setSelectedEventDetails(evt)}
                        className={`p-1 rounded truncate cursor-pointer font-semibold border ${
                          eventTypeLabels[evt.eventType].bg
                        }`}
                        title={evt.title}
                      >
                        {evt.title}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COL: Upcoming Events Feed */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-400" /> Danh sách Lịch Công tác
            </span>
            <span className="text-indigo-400 font-mono text-[11px]">{filteredEvents.length} nhiệm vụ</span>
          </h3>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredEvents.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">Không có lịch công tác phù hợp.</p>
            ) : (
              filteredEvents.map(evt => (
                <div
                  key={evt.id}
                  onClick={() => setSelectedEventDetails(evt)}
                  className="bg-slate-950 border border-slate-800 hover:border-indigo-500/60 p-3.5 rounded-xl space-y-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${eventTypeLabels[evt.eventType].bg}`}>
                      {eventTypeLabels[evt.eventType].label}
                    </span>
                    {evt.projectCode && (
                      <span className="text-[10px] bg-slate-900 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono">
                        {evt.projectCode}
                      </span>
                    )}
                  </div>

                  <h4 className="font-semibold text-white text-xs line-clamp-2 hover:text-indigo-300">{evt.title}</h4>

                  <div className="space-y-1 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{formatDateVN(evt.startDate)} → {formatDateVN(evt.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{evt.location}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL: ADD EVENT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleAddEvent} className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-indigo-400" /> Thêm Lịch Công tác & Kế hoạch Thi công
              </h3>
              <button type="button" onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">Tên Nhiệm vụ / Lịch công tác *:</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Dò tìm hiện trường Hạng mục A..."
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Phân loại:</label>
                  <select
                    value={formEventType}
                    onChange={e => setFormEventType(e.target.value as CalendarEvent['eventType'])}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="field_ops">Rà phá Hiện trường</option>
                    <option value="meeting">Họp / Báo cáo</option>
                    <option value="inspection">Kiểm định Thiết bị</option>
                    <option value="training">Tập huấn</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Liên kết Dự án (nếu có):</label>
                  <select
                    value={formProjectCode}
                    onChange={e => setFormProjectCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-indigo-500 font-mono"
                  >
                    <option value="">-- Không chọn --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.code}>
                        [{p.code}] - {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ngày bắt đầu *:</label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={e => setFormStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Ngày kết thúc *:</label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={e => setFormEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Địa điểm thực hiện:</label>
                <input
                  type="text"
                  placeholder="Nhập địa điểm, công trường..."
                  value={formLocation}
                  onChange={e => setFormLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">Ghi chú & Nội dung chi tiết:</label>
                <textarea
                  rows={3}
                  placeholder="Ghi chú thêm về lực lượng, trang thiết bị..."
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white rounded-xl p-2.5 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-950"
              >
                <Plus className="w-4 h-4" /> Lưu Lịch Công tác
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: EVENT DETAILS */}
      {selectedEventDetails && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${eventTypeLabels[selectedEventDetails.eventType].bg}`}>
                {eventTypeLabels[selectedEventDetails.eventType].label}
              </span>
              <button onClick={() => setSelectedEventDetails(null)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3 text-xs">
              <h3 className="text-sm font-bold text-white">{selectedEventDetails.title}</h3>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-slate-300">
                <div>Thời gian: <strong className="text-indigo-300">{formatDateVN(selectedEventDetails.startDate)} → {formatDateVN(selectedEventDetails.endDate)}</strong></div>
                <div>Địa điểm: <span className="text-white">{selectedEventDetails.location}</span></div>
                {selectedEventDetails.projectCode && <div>Dự án: <span className="text-amber-300">{selectedEventDetails.projectCode}</span></div>}
              </div>

              {selectedEventDetails.participants.length > 0 && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Thành phần tham gia:</span>
                  <div className="flex flex-wrap gap-1">
                    {selectedEventDetails.participants.map(p => (
                      <span key={p} className="bg-slate-800 text-slate-200 text-[10px] px-2 py-0.5 rounded border border-slate-700">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedEventDetails.notes && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Ghi chú nội dung:</span>
                  <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">{selectedEventDetails.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setSelectedEventDetails(null)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
