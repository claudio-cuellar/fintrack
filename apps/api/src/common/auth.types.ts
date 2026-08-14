import { MembershipRole } from '@prisma/client';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  sessionId?: string;
}

export interface WorkspaceContext {
  workspaceId: string;
  membershipId: string;
  userId: string;
  role: MembershipRole;
}

declare global {
  namespace Express {
    interface User extends AuthenticatedUser {}
    interface Request {
      workspaceContext?: WorkspaceContext;
      requestId?: string;
    }
  }
}
