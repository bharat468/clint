import type { User } from "@/types";

/**
 * Checks whether a user has permission to perform an action or view a module in the Landlord workspace.
 * SuperAdmins, master admins, and organization owners have universal access ('*').
 */
export function canAccess(user: User | null | undefined, permissionKey: string): boolean {
  if (!user) return false;

  // Master SuperAdmin bypass
  if (user.isSuperAdmin || user.adminRole === "SUPER_ADMIN") {
    return true;
  }

  // Owner or universal permission bypass
  if (user.permissions?.includes("*")) {
    return true;
  }

  // Direct permission check
  return Boolean(user.permissions?.includes(permissionKey));
}

/**
 * Checks whether a user has platform governance permission in the SuperAdmin portal.
 */
export function canAccessPlatform(user: User | null | undefined, platformKey: string): boolean {
  if (!user) return false;

  // Full master SuperAdmin has access to all platform modules
  if (user.isSuperAdmin || user.adminRole === "SUPER_ADMIN") {
    return true;
  }

  if (user.platformPermissions?.includes("*")) {
    return true;
  }

  return Boolean(user.platformPermissions?.includes(platformKey));
}
