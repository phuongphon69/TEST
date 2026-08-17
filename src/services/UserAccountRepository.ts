import { User } from '../types';
import { FirebaseAuthService } from './FirebaseAuthService';
import { FirebaseUserAccountRepository } from './FirebaseUserAccountRepository';
import { MockUserAccountRepository } from './MockUserAccountRepository';

export class UserAccountRepository {
  public static getAll(): User[] {
    if (FirebaseAuthService.isFirebaseConfigured()) {
      // Synchronous return of local state or cached state
      return MockUserAccountRepository.getAll();
    }
    return MockUserAccountRepository.getAll();
  }

  public static getById(userId: string): User | null {
    return MockUserAccountRepository.getById(userId);
  }

  public static update(userId: string, updates: Partial<User>, actorName?: string): User {
    if (FirebaseAuthService.isFirebaseConfigured()) {
      FirebaseUserAccountRepository.update(userId, updates, actorName);
    }
    return MockUserAccountRepository.update(userId, updates, actorName);
  }

  public static setLockStatus(userId: string, isLocked: boolean, reason: string, actorName?: string): boolean {
    if (FirebaseAuthService.isFirebaseConfigured()) {
      FirebaseUserAccountRepository.setLockStatus(userId, isLocked, reason, actorName);
    }
    return MockUserAccountRepository.setLockStatus(userId, isLocked, reason, actorName);
  }

  public static resetPassword(userId: string, actorName?: string): { user: User; tempPassword: string } {
    if (FirebaseAuthService.isFirebaseConfigured()) {
      FirebaseUserAccountRepository.resetPassword(userId, actorName);
    }
    return MockUserAccountRepository.resetPassword(userId, actorName);
  }
}
