import { AuditLog, AuditActionType } from '../types';
import { getCurrentUser, getAuditLogs, setStored, STORAGE_KEYS } from '../utils/storage';

export interface AuditLogParams {
  module: string;
  actionDetails: string;
  actionType?: AuditActionType | string;
  targetObject?: string;
  targetObjectId?: string;
  dataBefore?: any;
  dataAfter?: any;
  reason?: string;
  result?: 'success' | 'failure';
}

function sanitizeData(data: any): any {
  if (!data) return undefined;
  if (typeof data === 'string') return data;
  try {
    const clone = JSON.parse(JSON.stringify(data));
    const maskSecrets = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      for (const key of Object.keys(obj)) {
        if (
          key.toLowerCase().includes('password') ||
          key.toLowerCase().includes('token') ||
          key.toLowerCase().includes('secret')
        ) {
          obj[key] = '[PROTECTED]';
        } else if (typeof obj[key] === 'object') {
          maskSecrets(obj[key]);
        }
      }
    };
    maskSecrets(clone);
    return JSON.stringify(clone, null, 2);
  } catch {
    return String(data);
  }
}

export class AuditLogService {
  public static log(params: AuditLogParams): AuditLog {
    const user = getCurrentUser();
    const logs = getAuditLogs();
    const now = new Date();
    const timestampStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    const userAgentStr = typeof window !== 'undefined' ? window.navigator.userAgent : 'Chrome/Linux';
    let simpleDevice = 'Trình duyệt Web Standard';
    if (userAgentStr.includes('Chrome')) simpleDevice = 'Google Chrome';
    else if (userAgentStr.includes('Firefox')) simpleDevice = 'Mozilla Firefox';

    let inferredType = params.actionType;
    if (!inferredType) {
      const actLower = params.actionDetails.toLowerCase();
      if (actLower.includes('đăng nhập')) inferredType = 'dang_nhap';
      else if (actLower.includes('tạo') || actLower.includes('thêm')) inferredType = 'tao';
      else if (actLower.includes('xóa')) inferredType = 'xoa';
      else if (actLower.includes('chỉnh') || actLower.includes('chuyển')) inferredType = 'chinh_sua';
      else inferredType = 'he_thong';
    }

    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: timestampStr,
      userName: user ? user.name : 'Hệ thống Auto',
      userRole: user ? user.title || user.roleLabel : 'Chỉ huy / Quản trị',
      userDevice: simpleDevice,
      module: params.module,
      actionType: inferredType,
      action: params.actionDetails.split(':')[0] || 'Thao tác Dữ liệu',
      details: params.actionDetails,
      dataBefore: sanitizeData(params.dataBefore),
      dataAfter: sanitizeData(params.dataAfter),
      targetObject: params.targetObject,
      targetObjectId: params.targetObjectId,
      reason: params.reason,
      result: params.result || 'success'
    };

    const updated = [newLog, ...logs].slice(0, 500);
    setStored(STORAGE_KEYS.AUDIT_LOGS, updated);
    return newLog;
  }

  public static getLogs(): AuditLog[] {
    return getAuditLogs();
  }
}
