import React, { useState, useRef, useEffect } from 'react';
import { Building, Check, ChevronDown } from 'lucide-react';
import {
  APPRAISAL_AUTHORITIES,
  AppraisalAuthorityCode,
  getAppraisalAuthorityByCode
} from '../../constants/appraisalNoticeConstants';

interface AppraisalAuthoritySelectProps {
  valueCode?: AppraisalAuthorityCode | string;
  valueName?: string;
  onChange: (code: AppraisalAuthorityCode, label: string) => void;
  error?: string;
  disabled?: boolean;
}

export const AppraisalAuthoritySelect: React.FC<AppraisalAuthoritySelectProps> = ({
  valueCode,
  valueName,
  onChange,
  error,
  disabled = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedAuth = getAppraisalAuthorityByCode(valueCode) ||
    APPRAISAL_AUTHORITIES.find(a => a.label === valueName) ||
    APPRAISAL_AUTHORITIES[1]; // Default to Binh chủng Công binh if not set

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          Cơ Quan Thẩm Định <span className="text-rose-400">*</span>
        </span>
        <span className="text-[10px] text-emerald-400 font-normal">Cố định 02 cơ quan</span>
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen(prev => !prev)}
        className={`w-full bg-slate-950 border rounded-lg px-3 py-2 text-xs font-semibold text-slate-100 flex items-center justify-between transition-colors focus:outline-none ${
          error
            ? 'border-rose-500 focus:border-rose-400'
            : isOpen
            ? 'border-sky-500 ring-1 ring-sky-500/30'
            : 'border-slate-700 hover:border-slate-600'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2 truncate">
          <Building className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="truncate text-slate-100">{selectedAuth.label}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {error && (
        <p className="text-[11px] text-rose-400 mt-1 font-medium">{error}</p>
      )}

      {isOpen && (
        <div className="absolute z-[120] top-full left-0 right-0 mt-1 bg-slate-950 border border-slate-700 rounded-xl shadow-2xl overflow-hidden divide-y divide-slate-800">
          <div className="px-3 py-2 bg-slate-900/80 text-[10px] text-slate-400 uppercase font-bold tracking-wider">
            Danh sách Cơ quan Thẩm định
          </div>

          {APPRAISAL_AUTHORITIES.map(item => {
            const isSelected = selectedAuth.code === item.code;
            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  onChange(item.code, item.label);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 text-xs transition-colors flex items-center justify-between ${
                  isSelected
                    ? 'bg-sky-950/60 text-sky-200 font-bold'
                    : 'hover:bg-slate-900 text-slate-200 font-medium'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-sky-400' : 'bg-slate-600'}`} />
                  <div>
                    <div className="text-xs">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal">{item.description}</div>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 text-sky-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
