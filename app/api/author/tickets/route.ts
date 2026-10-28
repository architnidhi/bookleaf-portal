import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';

export async function GET() {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== 'AUTHOR' || !user.authorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const tickets = await prisma.ticket.findMany({
    where: { authorId: user.authorId },
    include: { book: { select: { title: true } }, messages: { orderBy: { createdAt: 'asc' } } },
    orderBy: { createdAt: 'desc' }
  });
  return NextResponse.json({ tickets });
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth();
  if (error) return error;
  if (user.role !== 'AUTHOR' || !user.authorId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  try {
    const body = await req.json();
    const ticket = await prisma.ticket.create({
      data: {
        authorId: user.authorId,
        bookId: body.bookId || null,
        subject: body.subject,
        description: body.description,
        messages: {
          create: { senderType: 'AUTHOR', senderName: 'Author', body: body.description }
        }
      }
    });
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create ticket' }, { status: 400 });
  }
}
