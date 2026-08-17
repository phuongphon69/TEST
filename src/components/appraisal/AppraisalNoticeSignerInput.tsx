import React from 'react';
import { User } from 'lucide-react';

interface AppraisalNoticeSignerInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export const AppraisalNoticeSignerInput: React.FC<AppraisalNoticeSignerInputProps> = ({
  value,
  onChange,
  error,
  disabled = false
}) => {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          Người Ký Thông Báo <span className="text-rose-400">*</span>
        </span>
      </label>

      <div className="relative">
        <input
          type="text"
          disabled={disabled}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Nhập cấp bậc và họ tên người ký..."
          className={`w-full bg-slate-950 border rounded-lg pl-9 pr-3 py-2 text-xs font-medium text-slate-100 placeholder-slate-500 transition-colors focus:outline-none ${
            error
              ? 'border-rose-500 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30'
              : 'border-slate-700 hover:border-slate-600 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/30'
          } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        />
        <User className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>

      {error ? (
        <p className="text-[11px] text-rose-400 mt-1 font-medium">{error}</p>
      ) : null}
    </div>
  );
};
