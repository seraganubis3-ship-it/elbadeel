export type RoleName = 'ADMIN' | 'STAFF' | 'VIEWER' | 'USER';

// Action format: domain:verb
// domains: users, orders, services, reports
// verbs: read, write
const roleToPermissions: Record<RoleName, string[]> = {
  ADMIN: [
    'users:read',
    'users:write',
    'orders:read',
    'orders:write',
    'services:read',
    'services:write',
    'reports:read',
  ],
  STAFF: [
    'users:read', // يمكنه رؤية المستخدمين فقط
    'orders:read',
    'orders:write', // تحديث حالة الطلبات
    'services:read',
    'reports:read',
  ],
  VIEWER: ['orders:read', 'services:read', 'reports:read'],
  USER: [],
};

export function can(role: RoleName | undefined, action: string): boolean {
  if (!role) return false;
  const perms = roleToPermissions[role] || [];
  return perms.includes(action);
}
