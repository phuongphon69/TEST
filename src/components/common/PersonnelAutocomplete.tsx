import React from 'react';
import { Personnel } from '../../types';
import { getPersonnel } from '../../utils/storage';

interface PersonnelAutocompleteProps {
  value: string;
  onChange: (personnelName: string, personnelObj?: Personnel) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
}

export const PersonnelAutocomplete: React.FC<PersonnelAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Chọn cán bộ từ danh sách nhân sự...',
  className = 'w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none',
  required = false
}) => {
  const personnel = getPersonnel();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const found = personnel.find(p => p.fullName === val || p.id === val);
    onChange(val, found);
  };

  return (
    <select
      required={required}
      value={value}
      onChange={handleChange}
      className={className}
    >
      <option value="">-- {placeholder} --</option>
      {personnel.map(p => (
        <option key={p.id} value={p.fullName}>
          {p.rankTitle} {p.fullName} - {p.position || p.roleInTeam} ({p.unit})
        </option>
      ))}
    </select>
  );
};
