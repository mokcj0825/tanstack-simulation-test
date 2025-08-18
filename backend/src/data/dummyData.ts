import { User, UserRole } from '../types';


class DummyDataService {
  private users: User[] = [];
  private readonly userRoles: UserRole[] = ['admin', 'user', 'moderator'];

  constructor() {
    this.initializeDummyData();
  }

  private initializeDummyData(): void {
    const dummyUsers: Omit<User, 'id' | 'createdAt' | 'updatedAt'>[] = [
      { name: 'John Doe', email: 'john.doe@example.com', role: 'admin' },
      { name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user' },
      { name: 'Bob Johnson', email: 'bob.johnson@example.com', role: 'moderator' },
      { name: 'Alice Brown', email: 'alice.brown@example.com', role: 'user' },
      { name: 'Charlie Wilson', email: 'charlie.wilson@example.com', role: 'user' },
      { name: 'Diana Davis', email: 'diana.davis@example.com', role: 'moderator' },
      { name: 'Edward Miller', email: 'edward.miller@example.com', role: 'user' },
      { name: 'Fiona Garcia', email: 'fiona.garcia@example.com', role: 'user' },
      { name: 'George Martinez', email: 'george.martinez@example.com', role: 'user' },
      { name: 'Helen Rodriguez', email: 'helen.rodriguez@example.com', role: 'moderator' }
    ];

    this.users = dummyUsers.map((user, index) => ({
      ...user,
      id: `user_${index + 1}`,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  public getAllUsers(): User[] {
    return [...this.users];
  }

  public getUsersPaginated(page: number, pageSize: number): {
    users: User[];
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedUsers = this.users.slice(startIndex, endIndex);
    const total = this.users.length;
    const totalPages = Math.ceil(total / pageSize);

    return {
      users: paginatedUsers,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }

  public getUserById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  public createUser(userData: { name: string; email: string; role?: UserRole }): User {
    const newUser: User = {
      id: `user_${this.users.length + 1}`,
      name: userData.name,
      email: userData.email,
      role: userData.role || 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.users.push(newUser);
    return newUser;
  }

  public updateUser(id: string, updateData: Partial<Omit<User, 'id' | 'createdAt'>>): User | undefined {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return undefined;
    }

    const existingUser = this.users[userIndex];
    if (!existingUser) {
      return undefined;
    }

    const updatedUser: User = {
      id: existingUser.id,
      name: updateData.name ?? existingUser.name,
      email: updateData.email ?? existingUser.email,
      role: updateData.role ?? existingUser.role,
      createdAt: existingUser.createdAt,
      updatedAt: new Date().toISOString()
    };
    this.users[userIndex] = updatedUser;

    return updatedUser;
  }

  public deleteUser(id: string): boolean {
    const userIndex = this.users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return false;
    }

    this.users.splice(userIndex, 1);
    return true;
  }

  public searchUsers(query: string): User[] {
    const lowerQuery = query.toLowerCase();
    return this.users.filter(user => 
      user.name.toLowerCase().includes(lowerQuery) ||
      user.email.toLowerCase().includes(lowerQuery) ||
      user.role.toLowerCase().includes(lowerQuery)
    );
  }

  public getUsersByRole(role: UserRole): User[] {
    return this.users.filter(user => user.role === role);
  }

  public getUsersCount(): number {
    return this.users.length;
  }

  public getUsersCountByRole(role: UserRole): number {
    return this.users.filter(user => user.role === role).length;
  }

  public generateRandomUsers(count: number): User[] {
    const names = [
      'Alex Thompson', 'Sarah Wilson', 'Michael Chen', 'Emily Davis', 'David Brown',
      'Lisa Anderson', 'James Taylor', 'Maria Garcia', 'Robert Johnson', 'Jennifer Lee',
      'William White', 'Amanda Clark', 'Christopher Hall', 'Jessica Moore', 'Daniel Lewis',
      'Ashley Walker', 'Matthew Young', 'Nicole Allen', 'Joshua King', 'Stephanie Wright'
    ];

    const domains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'example.com'];

    const newUsers: User[] = [];
    const startId = this.users.length + 1;

    for (let i = 0; i < count; i++) {
      const randomName = names[Math.floor(Math.random() * names.length)] || 'Unknown User';
      const randomDomain = domains[Math.floor(Math.random() * domains.length)] || 'example.com';
      const randomRole = this.userRoles[Math.floor(Math.random() * this.userRoles.length)] || 'user';
      
      const newUser: User = {
        id: `user_${startId + i}`,
        name: randomName,
        email: `${randomName.toLowerCase().replace(' ', '.')}@${randomDomain}`,
        role: randomRole,
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString()
      };

      newUsers.push(newUser);
      this.users.push(newUser);
    }

    return newUsers;
  }

  public resetData(): void {
    this.users = [];
    this.initializeDummyData();
  }
}

export const dummyDataService = new DummyDataService();
