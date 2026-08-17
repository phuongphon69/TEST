import React, { useState } from 'react';
import { ShieldAlert, ArrowLeft, Home, Send, Lock, AlertTriangle, User, Key } from 'lucide-react';
import { getCurrentUser, addPermissionRequest } from '../../utils/storage';

interface AccessDeniedViewProps {
  moduleName?: string;
  moduleKey?: string;
  requiredLevel?: string;
  onNavigateHome: () => void;
  onNavigateBack?: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  moduleName = 'Chức năng / Phân hệ Yêu cầu',
  moduleKey = 'general',
  requiredLevel = 'Kiểm tra / Phê duyệt',
  onNavigateHome,
  onNavigateBack
}) => {
  const currentUser = getCurrentUser();
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [reason, setReason] = useState('');
  const [days, setDays] = useState(30);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    addPermissionRequest({
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      requesterEmail: currentUser.email,
      requestedModule: moduleKey,
      requestedModuleName: moduleName,
      accessType: 'edit',
      reason,
      durationDays: days,
      requestedExpiresAt: new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
    });
    setSubmitted(true);
    setTimeout(() => {
      setShowRequestModal(false);
      setSubmitted(false);
      setReason('');
    }, 1500);
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 text-center">
        <div className="w-16 h-16 bg-red-950/60 border border-red-800/60 rounded-2xl flex items-center justify-center mx-auto text-red-400 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div>
          <h2 className="text-xl font-bold text-red-400">TRUY CẬP BỊ TỪ CHỐI</h2>
          <p className="text-sm font-semibold text-slate-200 mt-1">
            “Bạn không có quyền truy cập nội dung này.”
          </p>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            Hệ thống phân quyền bảo mật cấp bậc quân sự QLRPBM ngăn chặn truy cập trực tiếp vào phân hệ <strong className="text-amber-400">{moduleName}</strong> khi tài khoản chưa được phê duyệt cấp quyền <span className="font-mono text-emerald-400 font-bold">[{requiredLevel}]</span>.
          </p>
        </div>

        {/* Current Account Details */}
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs space-y-2 font-mono">
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Tài khoản hiện tại:</span>
            <span className="text-slate-200 font-semibold">{currentUser.name} ({currentUser.email})</span>
          </div>
          <div className="flex justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-slate-500">Vai trò / Chức danh:</span>
            <span className="text-amber-400">{currentUser.roleLabel}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Mức bảo mật hồ sơ:</span>
            <span className="text-red-400 font-bold uppercase">{currentUser.secrecyLevel}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-colors border border-slate-700"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Quay lại trang trước</span>
            </button>
          )}

          <button
            onClick={onNavigateHome}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-colors border border-slate-700"
          >
            <Home className="w-4 h-4" />
            <span>Về Dashboard</span>
          </button>

          <button
            onClick={() => setShowRequestModal(true)}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-950/50 flex items-center justify-center space-x-2 transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Gửi Yêu cầu Cấp quyền</span>
          </button>
        </div>
      </div>

      {/* Permission Request Modal */}
      {showRequestModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 text-left">
            <h3 className="text-sm font-bold text-slate-100 flex items-center space-x-2">
              <Send className="w-4 h-4 text-emerald-400" />
              <span>Gửi Yêu cầu Cấp quyền Phân hệ [{moduleName}]</span>
            </h3>

            {submitted ? (
              <div className="p-4 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 text-center space-y-2">
                <p className="font-bold">ĐÃ GỬI YÊU CẦU THÀNH CÔNG!</p>
                <p className="text-slate-400">Yêu cầu đã được chuyển tới Quản trị viên hệ thống để phê duyệt.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmitRequest} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Lý do Cần Cấp quyền <span className="text-red-400">*</span></label>
                  <textarea
                    required
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Mô tả lý do phục vụ dự án, nhiệm vụ hoặc chỉ đạo..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Thời hạn Quyền Đề xuất (Ngày)</label>
                  <input
                    type="number"
                    min={1}
                    max={365}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-slate-200 font-mono"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowRequestModal(false)}
                    className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg font-semibold"
                  >
                    Xác nhận Gửi
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
