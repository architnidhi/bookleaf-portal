import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const resolvedParams = await params;

  const { body } = await req.json();
  
  await prisma.ticketMessage.create({
    data: {
      ticketId: resolvedParams.id,
      senderType: 'ADMIN',
      senderName: 'BookLeaf Support',
      body: body
    }
  });

  await prisma.ticket.update({
    where: { id: resolvedParams.id },
    data: { status: 'RESOLVED' }
  });

  return NextResponse.json({ success: true });
}
