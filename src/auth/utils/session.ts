import { isWithinExpiration } from "./date";

export const isValidDatabaseSession = (expires: Date | number): boolean => {
  if (!expires) return false;
  if (typeof expires === "number") {
    expires = new Date(expires);
  }
  return isWithinExpiration(expires.getTime());
};
