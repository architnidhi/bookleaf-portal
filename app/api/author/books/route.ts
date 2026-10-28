import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== 'AUTHOR' || !user.authorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const books = await prisma.book.findMany({
    where: { authorId: user.authorId },
    orderBy: { publicationDate: 'desc' }
  });
  return NextResponse.json({ books });
}
