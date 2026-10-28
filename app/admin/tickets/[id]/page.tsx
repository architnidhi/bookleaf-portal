import { prisma } from "@/lib/db";
import Link from "next/link";
import { notFound } from "next/navigation";
import DraftForm from "./DraftForm";

export default async function TicketDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  
  const ticket = await prisma.ticket.findUnique({
    where: { id: resolvedParams.id },
    include: { author: true, book: true }
  });

  if (!ticket) notFound();

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-4xl mx-auto space-y-6">
        <Link href="/admin" className="text-blue-600 hover:underline">&larr; Back to Queue</Link>
        
        <div className="bg-white p-6 rounded shadow border">
          <h1 className="text-2xl font-bold mb-2">{ticket.subject}</h1>
          <p className="text-sm text-gray-500 mb-4">
            From: {ticket.author.name} | Book: {ticket.book?.title || "General"}
          </p>
          <div className="bg-gray-50 p-4 rounded border">
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>
        </div>

        <DraftForm ticketId={ticket.id} />
      </div>
    </div>
  );
}
