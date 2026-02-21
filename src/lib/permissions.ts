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

// Legacy check
export function can(role: RoleName | undefined, action: string): boolean {
  if (!role) return false;
  const perms = roleToPermissions[role] || [];
  return perms.includes(action);
}

// New Dynamic RBAC Check
export function hasPermission(user: any, permissionId: string): boolean {
  if (!user || !user.role) return false;
  if (user.role === 'ADMIN') return true;
  
  const userPerms = user.permissions || [];
  if (userPerms.includes(permissionId)) return true;

  // Fallbacks for legacy STAFF/VIEWER without explicit permissions assigned
  if (userPerms.length === 0) {
    if (user.role === 'STAFF') {
      return ['CREATE_ORDER', 'MANAGE_ORDERS', 'MANAGE_WORKORDERS', 'VIEW_DASHBOARD'].includes(permissionId);
    }
    if (user.role === 'VIEWER') {
      return ['MANAGE_ORDERS', 'MANAGE_SERVICES', 'VIEW_REPORTS', 'VIEW_DASHBOARD'].includes(permissionId);
    }
  }

  return false;
}
