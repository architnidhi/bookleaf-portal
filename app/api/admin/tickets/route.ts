import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';

export async function GET() {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const tickets = await prisma.ticket.findMany({
      include: { 
        author: { select: { name: true } }, 
        book: { select: { title: true } } 
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ tickets });
  } catch (error) {
    console.error("Failed to fetch admin tickets:", error);
    return NextResponse.json({ error: 'Failed to fetch tickets' }, { status: 500 });
  }
}
