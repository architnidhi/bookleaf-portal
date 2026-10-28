import { cookies } from 'next/headers';
import { verifyToken } from './auth';
import { NextResponse } from 'next/server';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  if (!token) return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  try {
    const user = await verifyToken(token);
    return { user };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export async function requireAdmin() {
  const res = await requireAuth();
  if (res.error) return res;
  if (res.user!.role !== 'ADMIN') {
    return { error: NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 }) };
  }
  return res;
}
