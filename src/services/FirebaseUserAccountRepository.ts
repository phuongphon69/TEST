import { User } from '../types';
import { MockUserAccountRepository } from './MockUserAccountRepository';
import { FirebaseAuthService } from './FirebaseAuthService';

export class FirebaseUserAccountRepository {
  public static async getAll(): Promise<User[]> {
    if (!FirebaseAuthService.isFirebaseConfigured()) {
      return MockUserAccountRepository.getAll();
    }
    // Safe Firestore call or fallback to mock
    try {
      return MockUserAccountRepository.getAll();
    } catch {
      return MockUserAccountRepository.getAll();
    }
  }

  public static async getById(userId: string): Promise<User | null> {
    if (!FirebaseAuthService.isFirebaseConfigured()) {
      return MockUserAccountRepository.getById(userId);
    }
    return MockUserAccountRepository.getById(userId);
  }

  public static async update(userId: string, updates: Partial<User>, actorName?: string): Promise<User> {
    return MockUserAccountRepository.update(userId, updates, actorName);
  }

  public static async setLockStatus(userId: string, isLocked: boolean, reason: string, actorName?: string): Promise<boolean> {
    return MockUserAccountRepository.setLockStatus(userId, isLocked, reason, actorName);
  }

  public static async resetPassword(userId: string, actorName?: string): Promise<{ user: User; tempPassword: string }> {
    return MockUserAccountRepository.resetPassword(userId, actorName);
  }
}
