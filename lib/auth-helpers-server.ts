/**
 * Centralized authentication utilities for role-based access control
 */
import { getServerSession } from 'next-auth';
import { authOptions } from './auth-config';
import { NextResponse } from 'next/server';

export type Role = 'ADMIN' | 'CUSTOMER' | 'DELIVERY_PARTNER';

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name?: string;
    role: Role;
  };
}

/**
 * Get authenticated session or return 401 error
 */
export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
      session: null,
    };
  }
  return {
    error: null,
    session: session as AuthSession,
  };
}

/**
 * Require specific role or return 403 error
 */
export async function requireRole(allowedRoles: Role | Role[]) {
  const { error, session } = await requireAuth();
  if (error) return { error, session: null };

  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  const userRole = String(session!.user.role).toUpperCase() as Role;

  if (!roles.includes(userRole)) {
    return {
      error: NextResponse.json(
        { error: 'Forbidden', message: `Required role: ${roles.join(' or ')}` },
        { status: 403 }
      ),
      session: null,
    };
  }

  return { error: null, session: session as AuthSession };
}

/**
 * Check if user has admin role
 */
export async function isAdmin() {
  const { session } = await requireAuth();
  if (!session) return false;
  return String(session.user.role).toUpperCase() === 'ADMIN';
}
