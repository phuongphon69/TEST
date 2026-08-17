import { Personnel } from '../types';
import { getPersonnel, getStoredIssuers, addStoredIssuer } from '../utils/storage';

export const INITIAL_AGENCIES = [
  'Binh chủng Công binh',
  'Bộ Quốc phòng'
];

/**
 * Get all active employees from personnel records
 */
export function getMasterEmployeeList(): Personnel[] {
  const allPersonnel = getPersonnel();
  return allPersonnel.filter(
    p => p.dataStatus !== 'da_xoa' && p.workStatus !== 'nghi_huu' && p.workStatus !== 'tam_nghi'
  );
}

/**
 * Get all leaders (officers with leadership role, position, or rank)
 */
export function getMasterLeaderList(): Personnel[] {
  const employees = getMasterEmployeeList();
  const leaderRegex = /trưởng|phó|chỉ huy|thủ trưởng|lãnh đạo|chủ tịch|tư lệnh|cục trưởng|tiểu đoàn trưởng|đội trưởng|giám đốc/i;

  const leaders = employees.filter(p => {
    const text = `${p.position || ''} ${p.roleInTeam || ''} ${p.rankTitle || ''}`;
    return leaderRegex.test(text);
  });

  // Fallback to all employees if no specific leaders found
  return leaders.length > 0 ? leaders : employees;
}

/**
 * Get agency suggestions list
 */
export function getMasterAgencyList(): string[] {
  const stored = getStoredIssuers();
  const set = new Set([...INITIAL_AGENCIES, ...stored]);
  return Array.from(set);
}

/**
 * Add a new agency to stored suggestions
 */
export function addMasterAgency(agencyName: string): string[] {
  if (!agencyName || !agencyName.trim()) return getMasterAgencyList();
  addStoredIssuer(agencyName.trim());
  return getMasterAgencyList();
}

/**
 * Atomic Counter helper for document numbering (N+1)
 */
const COUNTER_PREFIX = 'qlrpbm_atomic_counter_';

export function getAtomicCounterNext(key: string): number {
  try {
    const raw = localStorage.getItem(`${COUNTER_PREFIX}${key}`);
    const current = raw ? parseInt(raw, 10) : 0;
    const next = current + 1;
    localStorage.setItem(`${COUNTER_PREFIX}${key}`, next.toString());
    return next;
  } catch (err) {
    console.error('Error fetching atomic counter:', err);
    return Date.now() % 10000;
  }
}

export function peekAtomicCounterNext(key: string): number {
  try {
    const raw = localStorage.getItem(`${COUNTER_PREFIX}${key}`);
    const current = raw ? parseInt(raw, 10) : 0;
    return current + 1;
  } catch {
    return 1;
  }
}
