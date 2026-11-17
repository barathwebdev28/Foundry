export type AuthorizationRole = "founder" | "admin" | "investor";
export type ApplicationStatus = "pending" | "approved" | "rejected";

export function canReviewApplications(role: AuthorizationRole) {
  return role === "admin";
}

export function canRecordFunding(role: AuthorizationRole) {
  return role === "investor";
}

export function canViewApplication(
  role: AuthorizationRole,
  userId: string,
  founderUserId: string | null,
  status: ApplicationStatus,
) {
  if (role === "admin") return true;
  if (role === "investor") return status === "approved";
  return founderUserId === userId;
}

export function canDownloadApplicationFile(
  role: AuthorizationRole,
  userId: string,
  founderUserId: string | null,
  status: ApplicationStatus,
) {
  return canViewApplication(role, userId, founderUserId, status);
}
