import React from 'react';
import { Calendar } from 'lucide-react';

interface Props {
  selectedYear: number | 'all' | 'unspecified';
  availableYears: (number | 'unspecified')[];
  onChange: (year: number | 'all' | 'unspecified') => void;
}

export const ProjectYearFilter: React.FC<Props> = ({
  selectedYear,
  availableYears,
  onChange
}) => {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <Calendar className="w-3.5 h-3.5 text-amber-400 shrink-0" />
      <select
        value={String(selectedYear)}
        onChange={e => {
          const val = e.target.value;
          if (val === 'all') onChange('all');
          else if (val === 'unspecified') onChange('unspecified');
          else onChange(parseInt(val, 10));
        }}
        className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors w-full sm:w-auto"
        title="Lọc dự án theo năm"
      >
        <option value="all">Tất cả các năm</option>
        {availableYears.map(yr => (
          <option key={String(yr)} value={String(yr)}>
            {yr === 'unspecified' ? 'Chưa xác định năm' : `Năm ${yr}`}
          </option>
        ))}
      </select>
    </div>
  );
};
