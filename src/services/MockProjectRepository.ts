import { Project, ProjectFilters, User } from '../types';
import { getProjects, saveProjects } from '../utils/storage';
import { getProjectYear } from '../utils/projectYearUtils';
import { ProjectAssignmentService } from './ProjectAssignmentService';
import { UserAccountRepository } from './UserAccountRepository';

export class MockProjectRepository {
  public static getAll(): Project[] {
    const projects = getProjects();
    return projects.filter(p => p.dataStatus !== 'da_xoa');
  }

  public static getById(id: string): Project | null {
    const projects = this.getAll();
    return projects.find(p => p.id === id) || null;
  }

  /**
   * Filters projects based on the unified ProjectFilters criteria.
   */
  public static filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
    const users = UserAccountRepository.getAll();

    return projects.filter(p => {
      // 1. Data Status Check
      if (p.dataStatus === 'da_xoa') return false;

      // 2. Status Filter
      if (filters.status && filters.status !== 'all') {
        if (p.status !== filters.status) return false;
      }

      // 3. Year Filter
      if (filters.year !== 'all') {
        const pYear = getProjectYear(p);
        if (filters.year === 'unspecified') {
          if (pYear !== null) return false;
        } else {
          if (pYear !== filters.year) return false;
        }
      }

      // 4. Responsible User Filter
      if (filters.responsibleUserId !== 'all') {
        const respId = p.responsibleUserId || p.projectManagerId;
        const respName = p.responsibleName || p.projectManager;

        if (filters.responsibleUserId === 'unassigned') {
          // Unassigned: no ID and no text name
          if (respId || (respName && respName.trim().length > 0)) {
            return false;
          }
        } else if (filters.responsibleUserId === 'unlinked') {
          // Unlinked: has text name but no linked system user ID
          if (respId) return false;
          if (!respName || !respName.trim()) return false;
          // Check if text name can be mapped
          const mapping = ProjectAssignmentService.mapLegacyResponsiblePerson(respName, users);
          if (!mapping.isUnlinked) return false;
        } else {
          // Specific User ID
          if (respId === filters.responsibleUserId) {
            // Direct ID match
          } else if (respName) {
            // Check legacy name mapping
            const mapping = ProjectAssignmentService.mapLegacyResponsiblePerson(respName, users);
            if (mapping.user?.id !== filters.responsibleUserId) {
              return false;
            }
          } else {
            return false;
          }
        }
      }

      // 5. Search Text Filter
      if (filters.search && filters.search.trim().length > 0) {
        const q = filters.search.toLowerCase().trim();
        const codeMatch = (p.code || '').toLowerCase().includes(q);
        const nameMatch = (p.name || '').toLowerCase().includes(q);
        const provinceMatch = (p.province || '').toLowerCase().includes(q);
        const investorMatch = (p.investor || '').toLowerCase().includes(q);
        const workTypeMatch = (p.workType || '').toLowerCase().includes(q);
        const docNumMatch = (p.sourceIncomingDocumentNumber || '').toLowerCase().includes(q);
        const respNameMatch = (p.responsibleName || p.projectManager || '').toLowerCase().includes(q);
        const commanderMatch = (p.commanderName || '').toLowerCase().includes(q);

        if (
          !codeMatch &&
          !nameMatch &&
          !provinceMatch &&
          !investorMatch &&
          !workTypeMatch &&
          !docNumMatch &&
          !respNameMatch &&
          !commanderMatch
        ) {
          return false;
        }
      }

      return true;
    });
  }

  public static save(project: Project): Project {
    const projects = getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    let updatedList: Project[];
    if (idx !== -1) {
      updatedList = projects.map(p => (p.id === project.id ? project : p));
    } else {
      updatedList = [project, ...projects];
    }
    saveProjects(updatedList);
    return project;
  }
}
