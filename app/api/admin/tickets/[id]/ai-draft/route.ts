import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/authMiddleware';
import { prisma } from '@/lib/db';
import { KB_CONTEXT } from '@/lib/ai/prompts';
import OpenAI from 'openai';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireAdmin();
  if (error) return error;
  const resolvedParams = await params;
  
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: resolvedParams.id },
      include: { book: true, author: true }
    });

    if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

    const bookFacts = ticket.book ? `
      Book Title: ${ticket.book.title}
      ISBN: ${ticket.book.isbn}
      Royalty Pending: ₹${ticket.book.royaltyPending}
      Status: ${ticket.book.status}
    ` : 'General query.';

    const prompt = `You are an empathetic support rep at BookLeaf Publishing.
    Knowledge Base: ${KB_CONTEXT}
    Author: ${ticket.author.name}
    Subject: ${ticket.subject}
    Message: ${ticket.description}
    Book Context: ${bookFacts}
    Write a draft response (max 150 words) that acknowledges their concern and provides a clear next step.`;

    try {
      // Try to use the real OpenAI API
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      });
      return NextResponse.json({ draft: response.choices[0].message.content });
      
    } catch (aiError: any) {
      // GRACEFUL DEGRADATION: If AI fails, return a smart fallback
      console.warn("OpenAI Failed (Likely no credits). Using fallback draft.");
      
      let fallback = `Hi ${ticket.author.name},\n\nThank you for reaching out regarding "${ticket.subject}". `;
      
      if (ticket.category === 'ROYALTY_PAYMENTS') {
        fallback += `We understand your concern about the pending royalty of ₹${ticket.book?.royaltyPending || '0'} for "${ticket.book?.title}". Our finance team is reviewing this, and the payment will be processed in the next payout cycle (within 45 days).`;
      } else if (ticket.category === 'ISBN_METADATA') {
        fallback += `A mismatch in the ISBN for "${ticket.book?.title}" is a critical issue. We have escalated this to our production team immediately and will have it resolved within 48 hours.`;
      } else {
        fallback += `We are looking into the status of "${ticket.book?.title || 'your book'}" and will update you within 48 hours.`;
      }
      
      fallback += `\n\nBest regards,\nTeam BookLeaf`;
      
      return NextResponse.json({ draft: fallback });
    }
  } catch (err: any) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
