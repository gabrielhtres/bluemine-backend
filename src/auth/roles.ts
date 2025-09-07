export const RolePermissions = {
  admin: ['users'],
  manager: ['projects', 'tasks'],
  developer: ['toggle_tasks'],
} as const;

export type Role = keyof typeof RolePermissions;
export type Permission = (typeof RolePermissions)[Role][number];
