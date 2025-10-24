export interface User {
  id: string;
  username: string;
  fullName: string;
  role: 'admin' | 'operator' | 'viewer';
}

const USERS_KEY = 'puppet_users';
const CURRENT_USER_KEY = 'puppet_current_user';

const DEFAULT_USERS: User[] = [
  {
    id: '1',
    username: 'admin',
    fullName: 'Administrator',
    role: 'admin',
  },
];

const DEFAULT_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
};

export const initializeUsers = () => {
  const users = localStorage.getItem(USERS_KEY);
  if (!users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS));
    localStorage.setItem('puppet_passwords', JSON.stringify(DEFAULT_PASSWORDS));
  }
};

export const login = (username: string, password: string): User | null => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const passwords: Record<string, string> = JSON.parse(
    localStorage.getItem('puppet_passwords') || '{}'
  );

  const user = users.find((u) => u.username === username);
  if (user && passwords[username] === password) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return user;
  }

  return null;
};

export const logout = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem(CURRENT_USER_KEY);
  if (userStr) {
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  }
  return null;
};

export const getAllUsers = (): User[] => {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
};

export const addUser = (
  username: string,
  password: string,
  fullName: string,
  role: 'admin' | 'operator' | 'viewer'
): boolean => {
  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const passwords: Record<string, string> = JSON.parse(
    localStorage.getItem('puppet_passwords') || '{}'
  );

  if (users.find((u) => u.username === username)) {
    return false;
  }

  const newUser: User = {
    id: Date.now().toString(),
    username,
    fullName,
    role,
  };

  users.push(newUser);
  passwords[username] = password;

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem('puppet_passwords', JSON.stringify(passwords));

  return true;
};

export const changePassword = (username: string, newPassword: string): boolean => {
  const passwords: Record<string, string> = JSON.parse(
    localStorage.getItem('puppet_passwords') || '{}'
  );

  if (passwords[username]) {
    passwords[username] = newPassword;
    localStorage.setItem('puppet_passwords', JSON.stringify(passwords));
    return true;
  }

  return false;
};

export const deleteUser = (username: string): boolean => {
  if (username === 'admin') {
    return false;
  }

  const users: User[] = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  const passwords: Record<string, string> = JSON.parse(
    localStorage.getItem('puppet_passwords') || '{}'
  );

  const filteredUsers = users.filter((u) => u.username !== username);
  delete passwords[username];

  localStorage.setItem(USERS_KEY, JSON.stringify(filteredUsers));
  localStorage.setItem('puppet_passwords', JSON.stringify(passwords));

  return true;
};
