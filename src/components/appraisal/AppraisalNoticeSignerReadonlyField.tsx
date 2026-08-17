import React from 'react';
import { UserCheck, ShieldAlert, Lock } from 'lucide-react';
import { AppraisalNoticeSignerDetails } from '../../services/AppraisalNoticeSignerService';

interface AppraisalNoticeSignerReadonlyFieldProps {
  signerDetails: AppraisalNoticeSignerDetails | null;
  error?: string;
}

export const AppraisalNoticeSignerReadonlyField: React.FC<AppraisalNoticeSignerReadonlyFieldProps> = ({
  signerDetails,
  error
}) => {
  const isValid = signerDetails?.isValid ?? false;

  return (
    <div>
      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
        <span className="flex items-center gap-1">
          Người Ký Thông Báo <Lock className="w-3 h-3 text-amber-400" />
        </span>
        <span className="text-[10px] text-amber-300 font-normal">Tự động điền (Readonly)</span>
      </label>

      {isValid && signerDetails ? (
        <div className={`w-full bg-slate-950/80 border rounded-lg p-2.5 flex items-start gap-2.5 ${
          error ? 'border-rose-500' : 'border-slate-800'
        }`}>
          <div className="p-1.5 bg-emerald-950/80 border border-emerald-800/80 rounded-md shrink-0 mt-0.5">
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-emerald-300 truncate">
                {signerDetails.rank ? `${signerDetails.rank} ${signerDetails.name}` : signerDetails.name}
              </span>
              <span className="text-[10px] text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/80 font-medium shrink-0">
                {signerDetails.position}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 truncate flex items-center gap-2">
              <span>{signerDetails.unit}</span>
              {signerDetails.email && (
                <>
                  <span>•</span>
                  <span className="text-slate-500 font-mono text-[10px]">{signerDetails.email}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full bg-amber-950/40 border border-amber-800/80 rounded-lg p-2.5 flex items-center gap-2 text-xs text-amber-300">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Chưa cấu hình người ký Thông báo thẩm định</span>
            <span className="block text-[11px] text-amber-400/80 mt-0.5">
              Hệ thống chưa có tài khoản đang hoạt động có quyền ký thông báo thẩm định.
            </span>
          </div>
        </div>
      )}

      {error && (
        <p className="text-[11px] text-rose-400 mt-1 font-medium">{error}</p>
      )}
    </div>
  );
};
