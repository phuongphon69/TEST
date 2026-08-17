import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Clock,
  UserCheck,
  ShieldAlert,
  X,
  ExternalLink,
  ChevronRight,
  Mail,
  Filter,
  AlertTriangle,
  Info,
  Send,
  Calendar,
  Sparkles
} from 'lucide-react';
import { AppNotificationItem, NotificationStatus, NotificationType } from '../types';
import {
  generateSystemNotifications,
  saveStoredNotifications,
  getEmailNotificationSettings,
  saveEmailNotificationSettings
} from '../utils/notificationEngine';
import { getUsers, getCurrentUser } from '../utils/storage';

interface NotificationBellPopoverProps {
  onNavigateTab: (tab: string, itemId?: string) => void;
}

export const NotificationBellPopover: React.FC<NotificationBellPopoverProps> = ({ onNavigateTab }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotificationItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [emailSettings, setEmailSettings] = useState(getEmailNotificationSettings());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modal Delegate State
  const [delegateModalItem, setDelegateModalItem] = useState<AppNotificationItem | null>(null);
  const [selectedUserToDelegate, setSelectedUserToDelegate] = useState<string>('');
  const [delegateNote, setDelegateNote] = useState<string>('');

  const users = getUsers();

  const reloadNotifications = () => {
    const list = generateSystemNotifications();
    setNotifications(list);
  };

  useEffect(() => {
    reloadNotifications();
    const interval = setInterval(reloadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter(n => n.status === 'chua_doc').length;
  const criticalCount = notifications.filter(n => n.severity === 'critical' && n.status !== 'da_xu_ly').length;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Actions
  const handleUpdateStatus = (id: string, newStatus: NotificationStatus, extra?: { snoozedUntil?: string; assignedToUser?: string; assignedNote?: string }) => {
    const updated = notifications.map(n => {
      if (n.id === id) {
        return {
          ...n,
          status: newStatus,
          ...extra
        };
      }
      return n;
    });
    setNotifications(updated);
    saveStoredNotifications(updated);
  };

  const handleMarkAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, status: 'da_doc' as NotificationStatus }));
    setNotifications(updated);
    saveStoredNotifications(updated);
    showToast('Đã đánh dấu tất cả là đã đọc!');
  };

  const handleSnooze = (n: AppNotificationItem, days: number) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    const dateStr = futureDate.toISOString().slice(0, 10);

    handleUpdateStatus(n.id, 'tam_hoan', { snoozedUntil: dateStr });
    showToast(`Đã hoãn thông báo đến ngày ${dateStr}!`);
  };

  const handleConfirmDelegate = () => {
    if (!delegateModalItem || !selectedUserToDelegate) return;
    handleUpdateStatus(delegateModalItem.id, 'giao_nguoi_khac', {
      assignedToUser: selectedUserToDelegate,
      assignedNote: delegateNote
    });
    setDelegateModalItem(null);
    setSelectedUserToDelegate('');
    setDelegateNote('');
    showToast(`Đã giao việc xử lý cho đồng chí ${selectedUserToDelegate}!`);
  };

  const filteredList = notifications.filter(n => {
    if (filterStatus === 'unread') return n.status === 'chua_doc';
    if (filterStatus === 'critical') return n.severity === 'critical';
    if (filterStatus === 'snoozed') return n.status === 'tam_hoan';
    if (filterStatus === 'resolved') return n.status === 'da_xu_ly';
    return true;
  });

  return (
    <div className="relative">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed top-16 right-6 z-50 bg-slate-900 border border-emerald-500 text-emerald-300 text-xs px-3.5 py-2 rounded-lg shadow-xl animate-fade-in flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
          criticalCount > 0
            ? 'bg-red-950/80 border-red-700 text-red-200 hover:bg-red-900'
            : unreadCount > 0
            ? 'bg-amber-950/70 border-amber-700 text-amber-200 hover:bg-amber-900'
            : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
        }`}
        title="Trung tâm thông báo và cảnh báo hệ thống (Mục 15)"
      >
        <Bell className={`w-4 h-4 ${criticalCount > 0 ? 'text-red-400 animate-bounce' : 'text-amber-400'}`} />
        <span className="hidden xs:inline">Cảnh báo:</span>
        <span className="font-bold font-mono text-sm">{notifications.length}</span>
        {unreadCount > 0 && (
          <span className="bg-amber-500 text-slate-950 text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-0.5">
            {unreadCount} mới
          </span>
        )}
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          <div className="absolute right-0 mt-2 w-96 sm:w-[480px] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100 flex flex-col max-h-[85vh] animate-in fade-in slide-in-from-top-2">
            {/* Header */}
            <div className="p-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">Trung tâm Cảnh báo & Thông báo</h3>
                  <p className="text-[11px] text-slate-400">Tự động phát hiện 15 loại rủi ro nghiệp vụ RPBM</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-emerald-300 transition-colors"
                  title="Cấu hình nhận Email thông báo"
                >
                  <Mail className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub Filter Toolbar */}
            <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs overflow-x-auto gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Tất cả ({notifications.length})
                </button>
                <button
                  onClick={() => setFilterStatus('unread')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    filterStatus === 'unread' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Chưa đọc ({unreadCount})
                </button>
                <button
                  onClick={() => setFilterStatus('critical')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                    filterStatus === 'critical' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  Gấp ({criticalCount})
                </button>
              </div>

              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-emerald-400 hover:underline shrink-0 font-medium"
              >
                Đánh dấu đã đọc
              </button>
            </div>

            {/* Notification Items List */}
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1 max-h-[420px] p-2 space-y-2">
              {filteredList.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs italic">
                  Không có thông báo nào trong danh mục này.
                </div>
              ) : (
                filteredList.map(n => {
                  const isCritical = n.severity === 'critical';
                  const isUnread = n.status === 'chua_doc';
                  const isSnoozed = n.status === 'tam_hoan';
                  const isResolved = n.status === 'da_xu_ly';

                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isCritical
                          ? 'bg-red-950/30 border-red-800/60'
                          : isUnread
                          ? 'bg-slate-800/80 border-amber-500/30'
                          : 'bg-slate-900/60 border-slate-800'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          {isCritical ? (
                            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
                          ) : (
                            <Info className="w-4 h-4 text-amber-400 shrink-0" />
                          )}
                          <h4 className={`text-xs font-bold leading-tight ${isCritical ? 'text-red-200' : 'text-slate-200'}`}>
                            {n.title}
                          </h4>
                        </div>

                        {/* Status badges */}
                        <div className="shrink-0 flex items-center gap-1">
                          {isResolved && (
                            <span className="text-[10px] bg-green-950 text-green-400 px-1.5 py-0.5 rounded font-medium border border-green-800">
                              Đã xử lý
                            </span>
                          )}
                          {isSnoozed && (
                            <span className="text-[10px] bg-purple-950 text-purple-300 px-1.5 py-0.5 rounded font-medium border border-purple-800">
                              Tạm hoãn ({n.snoozedUntil})
                            </span>
                          )}
                          {n.assignedToUser && (
                            <span className="text-[10px] bg-blue-950 text-blue-300 px-1.5 py-0.5 rounded font-medium border border-blue-800">
                              Giao: {n.assignedToUser}
                            </span>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 mt-1.5 leading-normal">
                        {n.message}
                      </p>

                      <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                        <span className="font-mono">{n.createdAt}</span>

                        {/* Action buttons bar */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Mark Read/Unread */}
                          <button
                            onClick={() => handleUpdateStatus(n.id, isUnread ? 'da_doc' : 'chua_doc')}
                            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
                          >
                            {isUnread ? 'Đánh dấu đọc' : 'Chưa đọc'}
                          </button>

                          {/* Mark Resolved */}
                          {!isResolved && (
                            <button
                              onClick={() => handleUpdateStatus(n.id, 'da_xu_ly')}
                              className="px-2 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 font-medium"
                            >
                              Đã xử lý
                            </button>
                          )}

                          {/* Snooze dropdown trigger */}
                          <button
                            onClick={() => handleSnooze(n, 3)}
                            className="px-2 py-0.5 rounded bg-purple-950 hover:bg-purple-900 text-purple-300 border border-purple-700/60 font-medium"
                            title="Hoãn nhắc lại sau 3 ngày"
                          >
                            Hoãn 3 ngày
                          </button>

                          {/* Delegate to user */}
                          <button
                            onClick={() => setDelegateModalItem(n)}
                            className="px-2 py-0.5 rounded bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-700/60 font-medium"
                          >
                            Giao việc
                          </button>

                          {/* Link Module */}
                          {n.linkModule && (
                            <button
                              onClick={() => {
                                setIsOpen(false);
                                onNavigateTab(n.linkModule!, n.linkId);
                              }}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1"
                            >
                              <span>Đến Module</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Direct Navigation */}
            <div className="p-3 bg-slate-800/90 border-t border-slate-700 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onNavigateTab('dashboard');
                }}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1.5"
              >
                <span>Xem Trung tâm Cảnh báo trên Dashboard</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delegate Modal */}
      {delegateModalItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <UserCheck className="w-5 h-5 text-blue-400" />
              <span>Giao Cho Người Khác Xử Lý</span>
            </h3>

            <p className="text-xs text-slate-300">
              Nhiệm vụ: <strong className="text-amber-300">{delegateModalItem.title}</strong>
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Chọn Cán bộ Xử lý:</label>
              <select
                value={selectedUserToDelegate}
                onChange={e => setSelectedUserToDelegate(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Chọn cán bộ phòng --</option>
                {users.map(u => (
                  <option key={u.id} value={`${u.title} ${u.name}`}>
                    {u.name} - {u.title} ({u.roleLabel})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Ghi chú giao việc:</label>
              <textarea
                rows={2}
                placeholder="Nhập yêu cầu chi tiết..."
                value={delegateNote}
                onChange={e => setDelegateNote(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDelegateModalItem(null)}
                className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirmDelegate}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Xác nhận Giao việc
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Settings Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-100">
            <h3 className="text-base font-bold flex items-center gap-2 text-emerald-400">
              <Mail className="w-5 h-5 text-amber-400" />
              <span>Cấu Hình Nhận Email Thông Báo</span>
            </h3>

            <div className="space-y-3 text-xs">
              <label className="flex items-center gap-3 cursor-pointer p-2 bg-slate-800/80 rounded border border-slate-700">
                <input
                  type="checkbox"
                  checked={emailSettings.enableEmail}
                  onChange={e => setEmailSettings({ ...emailSettings, enableEmail: e.target.checked })}
                  className="rounded border-slate-700 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span className="font-semibold text-slate-200">Bật tính năng tự động gửi Email thông báo</span>
              </label>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Email nhận thông báo:</label>
                <input
                  type="email"
                  value={emailSettings.userEmail}
                  onChange={e => setEmailSettings({ ...emailSettings, userEmail: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100 focus:border-emerald-500 font-mono"
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={emailSettings.notifyOnCriticalAlerts}
                    onChange={e => setEmailSettings({ ...emailSettings, notifyOnCriticalAlerts: e.target.checked })}
                  />
                  <span>Gửi email ngay khi có Cảnh báo Gấp (Quá hạn, Trễ tiến độ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={emailSettings.notifyOnExpiryWarnings}
                    onChange={e => setEmailSettings({ ...emailSettings, notifyOnExpiryWarnings: e.target.checked })}
                  />
                  <span>Gửi email khi Đăng kiểm, Chứng chỉ sắp hết hạn</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={emailSettings.dailySummaryDigest}
                    onChange={e => setEmailSettings({ ...emailSettings, dailySummaryDigest: e.target.checked })}
                  />
                  <span>Gửi email tổng hợp tình hình công việc mỗi sáng (07:30 AM)</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-4 py-1.5 rounded bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  saveEmailNotificationSettings(emailSettings);
                  setShowSettingsModal(false);
                  showToast('Đã lưu cấu hình Email thông báo!');
                }}
                className="px-4 py-1.5 rounded bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-500"
              >
                Lưu Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
