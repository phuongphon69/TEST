import React, { useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen
} from 'lucide-react';
import { TaskItem, TaskStatus } from '../../types';
import { formatDateVN, TASK_STATUS_MAP, TASK_PRIORITY_MAP } from '../../utils/formatters';

interface TaskCalendarViewProps {
  tasks: TaskItem[];
  onViewTask: (task: TaskItem) => void;
}

export const TaskCalendarView: React.FC<TaskCalendarViewProps> = ({
  tasks,
  onViewTask
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1)); // Default July 2026

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  const monthNames = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
    'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
    'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Calendar matrix calculation
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  let startingDayOfWeek = firstDayOfMonth.getDay() - 1; // Monday = 0
  if (startingDayOfWeek === -1) startingDayOfWeek = 6; // Sunday

  const daysInMonth = lastDayOfMonth.getDate();

  // Create grid cells
  const calendarDays: Array<{
    dayNumber: number | null;
    dateStr: string | null;
    isCurrentMonth: boolean;
  }> = [];

  // Padding previous month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push({ dayNumber: null, dateStr: null, isCurrentMonth: false });
  }

  // Days of current month
  for (let day = 1; day <= daysInMonth; day++) {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    calendarDays.push({ dayNumber: day, dateStr, isCurrentMonth: true });
  }

  // Get tasks that fall on a date string
  const getTasksForDate = (dateStr: string) => {
    if (!dateStr) return [];
    return tasks.filter((t) => {
      if (t.startDate === dateStr || t.deadline === dateStr) return true;
      if (t.startDate && t.deadline && t.startDate <= dateStr && dateStr <= t.deadline) return true;
      return false;
    });
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
      {/* Calendar Header Nav */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-950/80 border border-emerald-800/80 text-emerald-400 rounded-xl">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-sans uppercase tracking-tight">
              Lịch Công Việc {monthNames[month]} Năm {year}
            </h2>
            <p className="text-xs text-slate-400">
              Hiển thị tiến độ và hạn hoàn thành công việc theo từng ngày trong tháng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Tháng trước
          </button>
          <button
            onClick={() => setCurrentDate(new Date(2026, 6, 1))}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 text-xs font-semibold transition-colors"
          >
            Tháng 7/2026
          </button>
          <button
            onClick={handleNextMonth}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            Tháng sau <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Header (Days of week) */}
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-xs text-slate-400 bg-slate-950 p-2 rounded-xl border border-slate-800 uppercase tracking-wider">
        <div>Thứ 2</div>
        <div>Thứ 3</div>
        <div>Thứ 4</div>
        <div>Thứ 5</div>
        <div>Thứ 6</div>
        <div className="text-amber-400">Thứ 7</div>
        <div className="text-rose-400">Chủ nhật</div>
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((cell, idx) => {
          if (!cell.isCurrentMonth || !cell.dateStr) {
            return (
              <div
                key={idx}
                className="bg-slate-950/40 border border-slate-800/40 rounded-xl p-2 min-h-[110px] opacity-30"
              />
            );
          }

          const dateTasks = getTasksForDate(cell.dateStr);

          return (
            <div
              key={idx}
              className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-2 min-h-[110px] flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
                <span className="font-mono text-xs font-bold text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                  {cell.dayNumber}
                </span>
                {dateTasks.length > 0 && (
                  <span className="text-[10px] font-mono text-emerald-400 font-bold">
                    {dateTasks.length} CV
                  </span>
                )}
              </div>

              {/* Tasks List for Day */}
              <div className="space-y-1 my-1 overflow-y-auto max-h-[90px] pr-0.5">
                {dateTasks.map((task) => {
                  const statusMeta = TASK_STATUS_MAP[task.status] || {
                    label: task.status,
                    classNames: 'bg-slate-800 text-slate-300'
                  };

                  return (
                    <div
                      key={task.id}
                      onClick={() => onViewTask(task)}
                      className={`p-1 rounded text-[10px] cursor-pointer hover:brightness-125 transition-all border font-medium truncate ${statusMeta.classNames}`}
                      title={`${task.code}: ${task.title} (Hạn: ${formatDateVN(task.deadline)})`}
                    >
                      <span className="font-mono font-bold mr-1">{task.code}</span>
                      <span className="truncate">{task.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
