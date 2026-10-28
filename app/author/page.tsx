"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthorDashboard() {
  const router = useRouter();
  const [books, setBooks] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"books" | "tickets" | "new">("books");

  // Form state
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [bookId, setBookId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/author/books").then(res => res.json()),
      fetch("/api/author/tickets").then(res => res.json())
    ]).then(([booksData, ticketsData]) => {
      setBooks(booksData.books || []);
      setTickets(ticketsData.tickets || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/author/tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, description, bookId: bookId || null })
    });
    if (res.ok) {
      alert("Ticket submitted successfully!");
      setSubject(""); setDescription(""); setBookId("");
      setActiveTab("tickets");
      // Refresh tickets
      fetch("/api/author/tickets").then(r => r.json()).then(d => setTickets(d.tickets || []));
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return <div className="p-10 text-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 text-black">
      <nav className="bg-white border-b px-8 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-blue-600">BookLeaf Author Portal</h1>
        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-500">Logout</button>
      </nav>

      <div className="max-w-6xl mx-auto p-8 flex gap-8">
        {/* Sidebar */}
        <div className="w-64 space-y-2">
          <button onClick={() => setActiveTab("books")} className={`w-full text-left px-4 py-2 rounded ${activeTab === "books" ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}`}>My Books</button>
          <button onClick={() => setActiveTab("tickets")} className={`w-full text-left px-4 py-2 rounded ${activeTab === "tickets" ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}`}>My Tickets</button>
          <button onClick={() => setActiveTab("new")} className={`w-full text-left px-4 py-2 rounded ${activeTab === "new" ? "bg-blue-100 text-blue-700 font-medium" : "hover:bg-gray-100"}`}>Submit New Query</button>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-6 rounded shadow-sm border">
          {activeTab === "books" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Books</h2>
              {books.length === 0 ? <p>No books found.</p> : (
                <div className="space-y-4">
                  {books.map(b => (
                    <div key={b.id} className="border p-4 rounded">
                      <h3 className="font-bold text-lg">{b.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">{b.genre} | ISBN: {b.isbn} | Status: {b.status}</p>
                      <div className="grid grid-cols-4 gap-4 text-sm bg-gray-50 p-3 rounded">
                        <div><span className="block text-gray-500">Sales</span> {b.totalCopiesSold}</div>
                        <div><span className="block text-gray-500">Total Earned</span> ₹{b.totalRoyaltyEarned}</div>
                        <div><span className="block text-gray-500">Paid</span> ₹{b.royaltyPaid}</div>
                        <div><span className="block text-gray-500">Pending</span> <span className={b.royaltyPending > 0 ? "text-red-600 font-bold" : ""}>₹{b.royaltyPending}</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "tickets" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Support Tickets</h2>
              {tickets.length === 0 ? <p>No tickets found.</p> : (
                <div className="space-y-4">
                  {tickets.map(t => (
                    <div key={t.id} className="border p-4 rounded">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold">{t.subject}</h3>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">{t.status}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-4">{t.description}</p>
                      {t.messages.filter((m: any) => m.senderType === "ADMIN").map((m: any) => (
                        <div key={m.id} className="bg-blue-50 border-l-4 border-blue-500 p-3 mt-2">
                          <p className="text-xs text-blue-600 font-bold mb-1">Reply from BookLeaf:</p>
                          <p className="text-sm whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "new" && (
            <div>
              <h2 className="text-2xl font-bold mb-6">Submit a Support Query</h2>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Which book is this regarding?</label>
                  <select value={bookId} onChange={e => setBookId(e.target.value)} className="w-full border p-2 rounded">
                    <option value="">General / Account Level</option>
                    {books.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Subject</label>
                  <input required value={subject} onChange={e => setSubject(e.target.value)} className="w-full border p-2 rounded" placeholder="Brief summary of the issue" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea required value={description} onChange={e => setDescription(e.target.value)} className="w-full border p-2 rounded h-32" placeholder="Provide as much detail as possible..." />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">Submit Query</button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
