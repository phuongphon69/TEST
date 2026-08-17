import { User } from '../types';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser } from '../utils/storage';
import { hashPassword } from '../utils/userManagementUtils';

export class MockAuthService {
  public static registerUser(user: User): boolean {
    const users = getUsers();
    const existingIndex = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    saveUsers(users);
    return true;
  }

  public static deleteUser(userId: string): boolean {
    const users = getUsers();
    const filtered = users.filter(u => u.id !== userId);
    saveUsers(filtered);
    return true;
  }

  public static getCurrentAuthenticatedUser(): User | null {
    return getCurrentUser();
  }

  public static logout(): void {
    setCurrentUser(null as any);
  }
}
