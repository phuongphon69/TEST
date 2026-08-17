import React from 'react';
import { Search, Filter, RotateCcw, Building2 } from 'lucide-react';
import { ProjectFilters, User } from '../../types';
import { PROJECT_STATUS_MAP } from '../../utils/formatters';
import { ProjectYearFilter } from './ProjectYearFilter';
import { ProjectResponsibleUserFilter } from './ProjectResponsibleUserFilter';

interface Props {
  filters: ProjectFilters;
  onFilterChange: (filters: ProjectFilters) => void;
  availableYears: (number | 'unspecified')[];
  usersList: User[];
  hasUnlinkedLegacy?: boolean;
  totalResultsCount: number;
  totalProjectsCount: number;
}

export const ProjectFilterBar: React.FC<Props> = ({
  filters,
  onFilterChange,
  availableYears,
  usersList,
  hasUnlinkedLegacy = false,
  totalResultsCount,
  totalProjectsCount
}) => {
  const isFiltered =
    filters.search.trim() !== '' ||
    filters.year !== 'all' ||
    filters.responsibleUserId !== 'all' ||
    filters.status !== 'all';

  const handleClear = () => {
    onFilterChange({
      search: '',
      year: 'all',
      responsibleUserId: 'all',
      status: 'all'
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
      {/* Search Input and Filter Controls Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 text-xs">
        {/* Search Input Box */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm theo Mã, Tên dự án, Tỉnh thành, Chủ đầu tư, Nguồn văn bản..."
            value={filters.search}
            onChange={e => onFilterChange({ ...filters, search: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Dropdown Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Year Filter */}
          <ProjectYearFilter
            selectedYear={filters.year}
            availableYears={availableYears}
            onChange={year => onFilterChange({ ...filters, year })}
          />

          {/* Responsible User Filter */}
          <ProjectResponsibleUserFilter
            selectedUserId={filters.responsibleUserId}
            usersList={usersList}
            hasUnlinkedLegacy={hasUnlinkedLegacy}
            onChange={responsibleUserId => onFilterChange({ ...filters, responsibleUserId })}
          />

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 min-w-0">
            <Filter className="w-3.5 h-3.5 text-sky-400 shrink-0" />
            <select
              value={filters.status}
              onChange={e => onFilterChange({ ...filters, status: e.target.value })}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500 transition-colors max-w-xs truncate"
              title="Lọc theo trạng thái dự án"
            >
              <option value="all">Tất cả trạng thái</option>
              {Object.entries(PROJECT_STATUS_MAP).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800 rounded-lg font-semibold flex items-center gap-1.5 transition-colors shrink-0"
              title="Xóa tất cả bộ lọc hiện tại"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Xóa bộ lọc
            </button>
          )}
        </div>
      </div>

      {/* Results Status Line */}
      <div className="flex justify-between items-center text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>
            Kết quả lọc: <strong className="text-amber-400 font-mono">{totalResultsCount}</strong> / {totalProjectsCount} dự án
          </span>
          {isFiltered && (
            <span className="text-slate-500 italic">
              (Đang áp dụng {filters.year !== 'all' ? `Năm ${filters.year} ` : ''}
              {filters.responsibleUserId !== 'all' ? `· Người phụ trách ` : ''}
              {filters.status !== 'all' ? `· Trạng thái ` : ''}
              {filters.search ? `· Từ khóa "${filters.search}"` : ''})
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
