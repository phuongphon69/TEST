export const APPRAISAL_NOTICE_SYMBOL_SUFFIX = '/TB-BCCB';

export type AppraisalAuthorityCode = 'BO_QUOC_PHONG' | 'BINH_CHUNG_CONG_BINH';

export interface AppraisalAuthorityConfig {
  code: AppraisalAuthorityCode;
  label: string;
  shortLabel: string;
  description: string;
}

export const APPRAISAL_AUTHORITIES: readonly AppraisalAuthorityConfig[] = [
  {
    code: 'BO_QUOC_PHONG',
    label: 'Bộ Quốc phòng',
    shortLabel: 'BQP',
    description: 'Cơ quan thẩm định cấp Bộ Quốc phòng'
  },
  {
    code: 'BINH_CHUNG_CONG_BINH',
    label: 'Binh chủng Công binh',
    shortLabel: 'BCCB',
    description: 'Cơ quan thẩm định cấp Binh chủng Công binh'
  }
] as const;

export const APPRAISAL_NOTICE_SIGNER_PERMISSION = 'appraisalNotice.sign';
export const DEFAULT_APPRAISAL_NOTICE_SIGNER_KEY = 'DEFAULT_APPRAISAL_NOTICE_SIGNER_USER_ID';

export function isValidAppraisalAuthorityCode(code?: string | null): code is AppraisalAuthorityCode {
  if (!code) return false;
  return code === 'BO_QUOC_PHONG' || code === 'BINH_CHUNG_CONG_BINH';
}

export function isValidAppraisalAuthorityLabel(label?: string | null): boolean {
  if (!label) return false;
  const trimmed = label.trim().toLowerCase();
  return trimmed === 'bộ quốc phòng' || trimmed === 'binh chủng công binh';
}

export function getAppraisalAuthorityByCode(code?: string | null): AppraisalAuthorityConfig | null {
  if (!code) return null;
  return APPRAISAL_AUTHORITIES.find(a => a.code === code) || null;
}

export function getAppraisalAuthorityByLabel(label?: string | null): AppraisalAuthorityConfig | null {
  if (!label) return null;
  const trimmed = label.trim().toLowerCase();
  if (trimmed === 'bộ quốc phòng') {
    return APPRAISAL_AUTHORITIES[0];
  }
  if (trimmed === 'binh chủng công binh') {
    return APPRAISAL_AUTHORITIES[1];
  }
  return null;
}

export function normalizeAppraisalAuthority(codeOrName?: string | null): {
  code: AppraisalAuthorityCode | null;
  label: string;
} {
  if (!codeOrName) {
    return { code: 'BINH_CHUNG_CONG_BINH', label: 'Binh chủng Công binh' };
  }

  const byCode = getAppraisalAuthorityByCode(codeOrName);
  if (byCode) {
    return { code: byCode.code, label: byCode.label };
  }

  const byLabel = getAppraisalAuthorityByLabel(codeOrName);
  if (byLabel) {
    return { code: byLabel.code, label: byLabel.label };
  }

  // Fallback to legacy string if existing notice, but code will be null
  return { code: null, label: codeOrName };
}
