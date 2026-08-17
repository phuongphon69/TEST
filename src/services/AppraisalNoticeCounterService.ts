import { APPRAISAL_NOTICE_SYMBOL_SUFFIX } from '../constants/appraisalNoticeConstants';
import { getStored, setStored } from '../utils/storage';
import { AppraisalNotice } from '../types';

const APPRAISAL_COUNTER_STORAGE_KEY = 'qlrpbm_appraisal_notice_counter';
const APPRAISAL_NOTICES_STORAGE_KEY = 'appraisal_notices';

export interface AppraisalNoticeNumberAllocation {
  numberSeq: number;
  numberDisplay: string;
  codeSymbol: string;
}

export class AppraisalNoticeCounterService {
  /**
   * Format appraisal notice symbol given a sequence number
   */
  public static formatSymbol(num: number | string): string {
    if (!num) return '';
    const cleanNum = String(num).replace(/\D/g, '');
    if (!cleanNum) return '';
    return `${cleanNum}${APPRAISAL_NOTICE_SYMBOL_SUFFIX}`;
  }

  /**
   * Peek next available sequential number without incrementing storage counter
   */
  public static peekNextNumber(existingNotices?: AppraisalNotice[]): AppraisalNoticeNumberAllocation {
    const notices: AppraisalNotice[] = existingNotices || getStored<AppraisalNotice[]>(APPRAISAL_NOTICES_STORAGE_KEY, []);
    let maxFound = 0;

    notices.forEach(n => {
      if (n.dataStatus === 'da_xoa') return;
      if (typeof n.noticeNumberSeq === 'number' && n.noticeNumberSeq > maxFound) {
        maxFound = n.noticeNumberSeq;
      } else if (n.noticeNumber) {
        const parsed = parseInt(String(n.noticeNumber).replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxFound) {
          maxFound = parsed;
        }
      } else if (n.codeSymbol) {
        const parsed = parseInt(String(n.codeSymbol.split('/')[0]).replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed > maxFound) {
          maxFound = parsed;
        }
      }
    });

    const storedVal = getStored<number>(APPRAISAL_COUNTER_STORAGE_KEY, 0);
    const nextSeq = Math.max(maxFound, storedVal) + 1;

    return {
      numberSeq: nextSeq,
      numberDisplay: `${nextSeq}`,
      codeSymbol: `${nextSeq}${APPRAISAL_NOTICE_SYMBOL_SUFFIX}`
    };
  }

  /**
   * Allocate and persistently increment counter (used strictly during save operation)
   */
  public static allocateNextNumber(existingNotices?: AppraisalNotice[]): AppraisalNoticeNumberAllocation {
    const next = this.peekNextNumber(existingNotices);
    setStored(APPRAISAL_COUNTER_STORAGE_KEY, next.numberSeq);
    return next;
  }

  /**
   * Check if a notice number or sequence is duplicated among non-deleted notices
   */
  public static isNumberDuplicate(num: number | string, excludeId?: string, notices?: AppraisalNotice[]): boolean {
    if (!num) return false;
    const cleanNumStr = String(num).trim().replace(/\D/g, '');
    if (!cleanNumStr) return false;
    const cleanNum = parseInt(cleanNumStr, 10);

    const all = notices || getStored<AppraisalNotice[]>(APPRAISAL_NOTICES_STORAGE_KEY, []);
    return all.some(n => {
      if (n.dataStatus === 'da_xoa') return false;
      if (excludeId && n.id === excludeId) return false;

      if (typeof n.noticeNumberSeq === 'number' && n.noticeNumberSeq === cleanNum) {
        return true;
      }
      if (n.noticeNumber) {
        const parsed = parseInt(String(n.noticeNumber).replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed === cleanNum) return true;
      }
      if (n.codeSymbol) {
        const prefix = n.codeSymbol.split('/')[0];
        const parsed = parseInt(String(prefix).replace(/\D/g, ''), 10);
        if (!isNaN(parsed) && parsed === cleanNum) return true;
      }
      return false;
    });
  }

  /**
   * Check if a code symbol is duplicated among non-deleted notices
   */
  public static isCodeSymbolDuplicate(codeSymbol: string, excludeId?: string, notices?: AppraisalNotice[]): boolean {
    if (!codeSymbol) return false;
    const all = notices || getStored<AppraisalNotice[]>(APPRAISAL_NOTICES_STORAGE_KEY, []);
    const clean = codeSymbol.trim().toLowerCase();
    return all.some(n => {
      if (n.dataStatus === 'da_xoa') return false;
      if (excludeId && n.id === excludeId) return false;
      return (n.codeSymbol || '').trim().toLowerCase() === clean;
    });
  }

  /**
   * Update internal counter if user saved a notice number higher than current max counter
   */
  public static updateCounterIfHigher(enteredNum: number): void {
    if (!enteredNum || enteredNum <= 0) return;
    const storedVal = getStored<number>(APPRAISAL_COUNTER_STORAGE_KEY, 0);
    if (enteredNum > storedVal) {
      setStored(APPRAISAL_COUNTER_STORAGE_KEY, enteredNum);
    }
  }
}
