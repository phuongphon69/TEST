import React from 'react';

interface IssuingAgencyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

const DEFAULT_AGENCIES = [
  'Binh chủng Công binh',
  'Bộ Quốc phòng'
];

export const IssuingAgencyAutocomplete: React.FC<IssuingAgencyAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Nhập hoặc chọn cơ quan ban hành...',
  className = 'w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none',
  required = false
}) => {
  return (
    <div className="relative">
      <input
        type="text"
        list="issuing-agency-suggestions"
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
      />
      <datalist id="issuing-agency-suggestions">
        {DEFAULT_AGENCIES.map((agency, index) => (
          <option key={index} value={agency} />
        ))}
      </datalist>
    </div>
  );
};
