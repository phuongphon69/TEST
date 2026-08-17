import { User } from '../types';
import { UserAccountRepository } from './UserAccountRepository';
import {
  APPRAISAL_NOTICE_SIGNER_PERMISSION,
  DEFAULT_APPRAISAL_NOTICE_SIGNER_KEY
} from '../constants/appraisalNoticeConstants';
import { getStored } from '../utils/storage';

export interface AppraisalNoticeSignerDetails {
  userId: string;
  name: string;
  rank: string;
  position: string;
  roleLabel: string;
  unit: string;
  email: string;
  fullLineDisplay: string;
  isValid: boolean;
}

export class AppraisalNoticeSignerService {
  /**
   * Check if a user account is active, unlocked, and eligible to sign Appraisal Notices
   */
  public static isUserEligibleSigner(user?: User | null): boolean {
    if (!user) return false;
    if (user.isLocked) return false;
    if (user.status && user.status !== 'active') return false;

    // Check specific permissions array if present
    if (Array.isArray(user.permissions)) {
      const hasDirectPerm = user.permissions.some(p =>
        p.toLowerCase().includes('appraisalnotice.sign') ||
        p.toLowerCase().includes('ký văn bản') ||
        p.toLowerCase().includes('phê duyệt & ký')
      );
      if (hasDirectPerm) return true;
    }

    // Role check: 'chihuy' (Tiểu đoàn trưởng) or 'phochihuy' (Phó Tiểu đoàn trưởng)
    const role = (user.role || '').toLowerCase();
    if (role === 'chihuy' || role === 'phochihuy' || role === 'quantri') {
      return true;
    }

    // Position check
    const userAny = user as any;
    const position = (userAny.position || user.title || '').toLowerCase();
    if (
      position.includes('tiểu đoàn trưởng') ||
      position.includes('trưởng phòng') ||
      position.includes('giám đốc')
    ) {
      return true;
    }

    return false;
  }

  /**
   * Get all active, unlocked user accounts eligible to sign Appraisal Notices
   */
  public static getEligibleSigners(allAccounts?: User[]): User[] {
    const accounts = allAccounts && allAccounts.length > 0 ? allAccounts : UserAccountRepository.getAll();
    return accounts.filter(u => this.isUserEligibleSigner(u));
  }

  /**
   * Get currently configured default signer User ID if any
   */
  public static getDefaultSignerUserId(): string | null {
    return getStored<string | null>(DEFAULT_APPRAISAL_NOTICE_SIGNER_KEY, null);
  }

  /**
   * Automatically resolve the signer for a new Appraisal Notice
   */
  public static resolveAutoSigner(allAccounts?: User[]): {
    signerUser: User | null;
    details: AppraisalNoticeSignerDetails | null;
    warningMessage?: string;
  } {
    const eligible = this.getEligibleSigners(allAccounts);

    if (eligible.length === 0) {
      return {
        signerUser: null,
        details: null,
        warningMessage: 'Chưa cấu hình người ký Thông báo thẩm định'
      };
    }

    // Priority 1: Configured default signer ID
    const configuredId = this.getDefaultSignerUserId();
    if (configuredId) {
      const matched = eligible.find(u => u.id === configuredId);
      if (matched) {
        return {
          signerUser: matched,
          details: this.extractSignerDetails(matched)
        };
      }
    }

    // Priority 2: Battalion Commander ("Tiểu đoàn trưởng")
    const battalionCommander = eligible.find(u => {
      const uAny = u as any;
      const pos = (uAny.position || u.title || '').toLowerCase();
      return pos.includes('tiểu đoàn trưởng') || u.role === 'chihuy';
    });

    if (battalionCommander) {
      return {
        signerUser: battalionCommander,
        details: this.extractSignerDetails(battalionCommander)
      };
    }

    // Priority 3: First eligible user
    const firstEligible = eligible[0];
    return {
      signerUser: firstEligible,
      details: this.extractSignerDetails(firstEligible)
    };
  }

  /**
   * Extract formatted details from a signer user account
   */
  public static extractSignerDetails(user?: User | null): AppraisalNoticeSignerDetails {
    if (!user || !this.isUserEligibleSigner(user)) {
      return {
        userId: '',
        name: '',
        rank: '',
        position: '',
        roleLabel: '',
        unit: '',
        email: '',
        fullLineDisplay: 'Chưa cấu hình người ký Thông báo thẩm định',
        isValid: false
      };
    }

    const uAny = user as any;
    const name = user.name || uAny.fullName || '';
    const rank = uAny.rankTitle || uAny.rank || '';
    const position = uAny.position || user.title || 'Chỉ huy';
    const roleLabel = user.roleLabel || position;
    const unit = user.departmentOrUnit || uAny.unit || uAny.department || 'Bộ phận bom mìn';
    const email = user.email || '';

    const fullLineDisplay = rank ? `${rank} ${name}` : name;

    return {
      userId: user.id,
      name,
      rank,
      position,
      roleLabel,
      unit,
      email,
      fullLineDisplay,
      isValid: true
    };
  }
}
