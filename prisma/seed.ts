import "dotenv/config";
import { PrismaClient, Role } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import fs from "fs";
import path from "path";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL missing");

const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

const prisma = new PrismaClient({ adapter });

type RawBook = { book_id: string; title: string; isbn: string; genre: string; publication_date: string | null; status: string; mrp: number | null; author_royalty_per_copy: number | null; total_copies_sold: number; total_royalty_earned: number; royalty_paid: number; royalty_pending: number; last_royalty_payout_date: string | null; print_partner: string | null; available_on: string[]; };
type RawAuthor = { author_id: string; name: string; email: string; phone: string; city: string; joined_date: string; books: RawBook[]; };

async function main() {
  console.log("🌱 Seeding...");
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "bookleaf_sample_data.json"), "utf-8")) as { authors: RawAuthor[] };

  await prisma.internalNote.deleteMany();
  await prisma.ticketMessage.deleteMany();
  await prisma.ticket.deleteMany();
  await prisma.book.deleteMany();
  await prisma.user.deleteMany();
  await prisma.author.deleteMany();

  const passwordHash = await bcrypt.hash("password123", 10);

  for (const a of raw.authors) {
    await prisma.author.create({
      data: { id: a.author_id, name: a.name, email: a.email, phone: a.phone, city: a.city, joinedDate: new Date(a.joined_date),
        books: { create: a.books.map((b) => ({ id: b.book_id, title: b.title, isbn: b.isbn, genre: b.genre, publicationDate: b.publication_date ? new Date(b.publication_date) : null, status: b.status, mrp: b.mrp, royaltyPerCopy: b.author_royalty_per_copy, totalCopiesSold: b.total_copies_sold, totalRoyaltyEarned: b.total_royalty_earned, royaltyPaid: b.royalty_paid, royaltyPending: b.royalty_pending, lastPayoutDate: b.last_royalty_payout_date ? new Date(b.last_royalty_payout_date) : null, printPartner: b.print_partner, availableOn: b.available_on ?? [] })) }
      }
    });
    await prisma.user.create({ data: { email: a.email, passwordHash, role: Role.AUTHOR, authorId: a.author_id } });
  }

  await prisma.user.create({ data: { email: "admin@bookleaf.com", passwordHash: await bcrypt.hash("admin123", 10), role: Role.ADMIN } });

  const ticketSeeds = [
    { authorId: "AUTH001", bookId: "BK001", subject: "Royalty pending for Whispers of the Ganges", description: "I see ₹3,570 pending in my dashboard for 'Whispers of the Ganges' but I haven't received it. My last payout was 15 Oct 2025. When will this be settled?", category: "ROYALTY_PAYMENTS" as const, priority: "HIGH" as const },
    { authorId: "AUTH003", bookId: "BK005", subject: "ISBN on Amazon does not match physical copy", description: "The ISBN shown on Amazon for 'Between Two Temples' is different from what's printed on my physical copies.", category: "ISBN_METADATA" as const, priority: "CRITICAL" as const },
    { authorId: "AUTH007", bookId: "BK013", subject: "When will Midnight in Mysore move to next stage?", description: "My book 'Midnight in Mysore' has been in 'Cover Design' for a while. Could you share the current status and timeline?", category: "BOOK_STATUS_PRODUCTION" as const, priority: "MEDIUM" as const },
  ];

  for (const t of ticketSeeds) {
    await prisma.ticket.create({ data: { authorId: t.authorId, bookId: t.bookId, subject: t.subject, description: t.description, category: t.category, priority: t.priority, aiCategory: t.category, aiPriority: t.priority, aiConfidence: 0.9, status: "OPEN", messages: { create: { senderType: "AUTHOR", senderName: "Author", body: t.description } } } });
  }

  console.log("✅ Seed complete");
  console.log("   Admin: admin@bookleaf.com / admin123");
  console.log("   Author: priya.sharma@email.com / password123");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
