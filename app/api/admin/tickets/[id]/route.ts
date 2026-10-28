import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const resolvedParams = await params;
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: resolvedParams.id },
    include: { author: true, book: true, messages: true }
  });
  return NextResponse.json({ ticket });
}
