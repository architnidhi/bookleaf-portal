"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/tickets")
      .then(res => res.json())
      .then(data => { setTickets(data.tickets || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-10 text-center text-black">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Ticket Queue</h1>
        <div className="bg-white rounded shadow overflow-hidden border">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Subject</th>
                <th className="p-4">Author</th>
                <th className="p-4">Category</th>
                <th className="p-4">Priority</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(t => (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    <Link href={`/admin/tickets/${t.id}`} className="text-blue-600 hover:underline">
                      {t.subject}
                    </Link>
                  </td>
                  <td className="p-4">{t.author.name}</td>
                  <td className="p-4"><span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">{t.category}</span></td>
                  <td className="p-4"><span className={`text-xs font-bold px-2 py-1 rounded ${t.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' : t.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>{t.priority}</span></td>
                  <td className="p-4">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
