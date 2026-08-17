import { Project, ProjectFilters } from '../types';
import { MockProjectRepository } from './MockProjectRepository';

export class ProjectRepository {
  public static getAll(): Project[] {
    return MockProjectRepository.getAll();
  }

  public static getById(id: string): Project | null {
    return MockProjectRepository.getById(id);
  }

  public static filterProjects(projects: Project[], filters: ProjectFilters): Project[] {
    return MockProjectRepository.filterProjects(projects, filters);
  }

  public static save(project: Project): Project {
    return MockProjectRepository.save(project);
  }
}
