import { AppraisalNotice } from '../types';
import {
  isValidAppraisalAuthorityCode,
  isValidAppraisalAuthorityLabel,
  normalizeAppraisalAuthority
} from '../constants/appraisalNoticeConstants';
import { AppraisalNoticeCounterService } from './AppraisalNoticeCounterService';

export interface AppraisalNoticeValidationResult {
  isValid: boolean;
  errors: {
    noticeNumber?: string;
    appraisalAuthority?: string;
    signer?: string;
    general?: string;
  };
  normalizedAuthority: {
    code: 'BO_QUOC_PHONG' | 'BINH_CHUNG_CONG_BINH' | null;
    label: string;
  };
  cleanNoticeNumberSeq: number;
  cleanCodeSymbol: string;
  cleanSignerName: string;
}

export class AppraisalNoticeValidation {
  /**
   * Validate an appraisal notice data object before saving
   */
  public static validateNotice(
    noticeData: Partial<AppraisalNotice>,
    excludeId?: string,
    existingNotices?: AppraisalNotice[]
  ): AppraisalNoticeValidationResult {
    const errors: { noticeNumber?: string; appraisalAuthority?: string; signer?: string; general?: string } = {};

    // 1. Validate Notice Number
    const rawNumberStr = String(noticeData.noticeNumber || '').trim();
    let cleanSeq = 0;
    let cleanSymbol = '';

    if (!rawNumberStr || !/^\d+$/.test(rawNumberStr)) {
      errors.noticeNumber = 'Vui lòng nhập số thông báo hợp lệ';
    } else {
      cleanSeq = parseInt(rawNumberStr, 10);
      if (cleanSeq <= 0) {
        errors.noticeNumber = 'Vui lòng nhập số thông báo hợp lệ';
      } else if (AppraisalNoticeCounterService.isNumberDuplicate(cleanSeq, excludeId, existingNotices)) {
        errors.noticeNumber = 'Số thông báo này đã tồn tại. Vui lòng chọn số khác';
      } else {
        cleanSymbol = AppraisalNoticeCounterService.formatSymbol(cleanSeq);
      }
    }

    // 2. Validate Appraisal Authority
    const rawAgency = noticeData.appraisalAuthorityCode || noticeData.appraisalAgency;
    const normalizedAuth = normalizeAppraisalAuthority(rawAgency);

    if (!isValidAppraisalAuthorityCode(noticeData.appraisalAuthorityCode) && !isValidAppraisalAuthorityLabel(noticeData.appraisalAgency)) {
      errors.appraisalAuthority = 'Cơ quan thẩm định không hợp lệ';
    }

    // 3. Validate Signer Name (User free-text input)
    const rawSigner = String(noticeData.signerName || noticeData.signerDisplayName || '').trim().replace(/\s+/g, ' ');

    if (!rawSigner) {
      errors.signer = 'Vui lòng nhập người ký thông báo';
    }

    const isValid = Object.keys(errors).length === 0;

    return {
      isValid,
      errors,
      normalizedAuthority: normalizedAuth,
      cleanNoticeNumberSeq: cleanSeq,
      cleanCodeSymbol: cleanSymbol || (cleanSeq ? `${cleanSeq}/TB-BCCB` : ''),
      cleanSignerName: rawSigner
    };
  }
}
