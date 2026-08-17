import { Project } from '../types';

/**
 * Derives the project year according to business priority:
 * 1. project.projectYear (if explicitly set and valid)
 * 2. Start date (startDate), initiation year, or contract signing date
 * 3. Approval date or expected/actual completion date
 * 4. Fallback to createdAt date
 * Note: Never uses updatedAt. Handles invalid date strings safely.
 */
export function getProjectYear(project: Partial<Project>): number | null {
  if (!project) return null;

  // 1. Explicit projectYear field
  if (typeof project.projectYear === 'number' && !isNaN(project.projectYear) && project.projectYear > 1900 && project.projectYear < 2100) {
    return project.projectYear;
  }

  // Helper to parse year from any string / Date
  const parseYearStr = (dateVal?: string | number | Date | null): number | null => {
    if (!dateVal) return null;
    if (typeof dateVal === 'number' && dateVal > 1900 && dateVal < 2100) {
      return dateVal;
    }
    const str = String(dateVal).trim();
    if (!str) return null;

    // Check if string is 4 digits like "2026"
    if (/^\d{4}$/.test(str)) {
      const yr = parseInt(str, 10);
      if (yr > 1900 && yr < 2100) return yr;
    }

    // Attempt Date parse
    try {
      const d = new Date(str);
      if (!isNaN(d.getTime())) {
        const yr = d.getFullYear();
        if (yr > 1900 && yr < 2100) return yr;
      }
    } catch {
      // Ignore parse error
    }

    // Regex match YYYY-MM-DD or DD/MM/YYYY or YYYY
    const match = str.match(/(?:19|20)\d{2}/);
    if (match) {
      const yr = parseInt(match[0], 10);
      if (yr > 1900 && yr < 2100) return yr;
    }

    return null;
  };

  // 2. Start Date / Contract Signing Date
  const startYr = parseYearStr(project.startDate) || parseYearStr(project.contractSigningDate);
  if (startYr) return startYr;

  // 3. Approval / Completion Date
  const completionYr = parseYearStr(project.actualCompletionDate) || parseYearStr(project.expectedCompletionDate);
  if (completionYr) return completionYr;

  // 4. Fallback to createdAt
  const createdYr = parseYearStr(project.createdAt);
  if (createdYr) return createdYr;

  return null;
}

/**
 * Extracts a sorted descending list of unique years present across all projects.
 */
export function extractProjectYearsList(projects: Project[]): (number | 'unspecified')[] {
  const activeProjects = projects.filter(p => p.dataStatus !== 'da_xoa');
  const yearsSet = new Set<number>();
  let hasUnspecified = false;

  for (const p of activeProjects) {
    const yr = getProjectYear(p);
    if (yr !== null) {
      yearsSet.add(yr);
    } else {
      hasUnspecified = true;
    }
  }

  const sortedYears: (number | 'unspecified')[] = Array.from(yearsSet).sort((a, b) => b - a);
  if (hasUnspecified) {
    sortedYears.push('unspecified');
  }

  return sortedYears;
}
