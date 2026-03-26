import type { User } from "../types/auth.types";

const normalizeRole = (role: unknown): string => {
  if (typeof role !== "string") {
    return "";
  }

  return role.trim().toUpperCase();
};

export const hasAdminAccess = (user: User | null | undefined): boolean => {
  return normalizeRole(user?.role) === "ADMIN";
};
