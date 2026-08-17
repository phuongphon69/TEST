import React from 'react';
import { User } from '../../types';
import { getUsers } from '../../utils/storage';

interface UserAutocompleteProps {
  value: string;
  onChange: (userName: string, userObj?: User) => void;
  placeholder?: string;
  filterRole?: string;
  className?: string;
  required?: boolean;
}

export const UserAutocomplete: React.FC<UserAutocompleteProps> = ({
  value,
  onChange,
  placeholder = 'Select or type user name...',
  filterRole,
  className = 'w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-white focus:border-emerald-500 focus:outline-none',
  required = false
}) => {
  const users = getUsers();
  const filteredUsers = filterRole
    ? users.filter(u => u.role === filterRole || u.roleLabel?.toLowerCase().includes(filterRole.toLowerCase()))
    : users;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const found = users.find(u => u.name === val || u.email === val);
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
      {filteredUsers.map(u => (
        <option key={u.id} value={u.name}>
          {u.name} ({u.title || u.roleLabel}) - {u.departmentOrUnit || u.email}
        </option>
      ))}
    </select>
  );
};
