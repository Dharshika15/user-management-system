const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

const ROLE_HIERARCHY = {
  [ROLES.ADMIN]: 3,
  [ROLES.MANAGER]: 2,
  [ROLES.USER]: 1,
};

const PERMISSIONS = {
  // User management
  CREATE_USER: 'create:user',
  READ_USER: 'read:user',
  READ_ALL_USERS: 'read:all_users',
  UPDATE_USER: 'update:user',
  UPDATE_ANY_USER: 'update:any_user',
  UPDATE_USER_ROLE: 'update:user_role',
  DELETE_USER: 'delete:user',
  MANAGE_ADMINS: 'manage:admins',

  // Profile
  READ_OWN_PROFILE: 'read:own_profile',
  UPDATE_OWN_PROFILE: 'update:own_profile',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_ALL_USERS,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.UPDATE_ANY_USER,
    PERMISSIONS.UPDATE_USER_ROLE,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.MANAGE_ADMINS,
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
  [ROLES.MANAGER]: [
    PERMISSIONS.READ_USER,
    PERMISSIONS.READ_ALL_USERS,
    PERMISSIONS.UPDATE_USER,
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.READ_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
  ],
};

const hasPermission = (role, permission) => {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
};

const canManageUser = (actorRole, targetRole) => {
  const actorLevel = ROLE_HIERARCHY[actorRole] || 0;
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0;
  // Admins can manage anyone; managers can manage users only
  if (actorRole === ROLES.ADMIN) return true;
  if (actorRole === ROLES.MANAGER && targetRole === ROLES.USER) return true;
  return false;
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  canManageUser,
};
