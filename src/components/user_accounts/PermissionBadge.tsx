import React from 'react';
import { Shield, Key, FileCheck, Eye, CheckCircle2 } from 'lucide-react';

interface PermissionBadgeProps {
  label: string;
}

export const PermissionBadge: React.FC<PermissionBadgeProps> = ({ label }) => {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800/80 text-slate-300 border border-slate-700/60 whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
      <span>{label}</span>
    </span>
  );
};
