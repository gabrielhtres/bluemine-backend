export const RolePermissions = {
  admin: ['users', 'dashboard'],
  manager: ['projects', 'tasks', 'dashboard'],
  developer: ['toggle_tasks', 'dashboard'],
} as const;

export type Role = keyof typeof RolePermissions;
export type Permission = (typeof RolePermissions)[Role][number];
