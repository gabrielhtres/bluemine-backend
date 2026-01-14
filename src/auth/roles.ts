export const RolePermissions = {
  admin: ['users', 'projects', 'tasks', 'dashboard'],
  manager: ['projects', 'tasks', 'dashboard'],
  developer: ['tasks', 'dashboard'],
} as const;

export type Role = keyof typeof RolePermissions;
export type Permission = (typeof RolePermissions)[Role][number];
