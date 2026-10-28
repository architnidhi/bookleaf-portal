"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DraftForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [draft, setDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDraft = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticketId}/ai-draft`, { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error); // Throw the exact error from backend
      
      setDraft(data.draft || "");
    } catch (e: any) {
      alert(`AI Error: ${e.message}`); // Show the exact error
    } finally {
      setIsGenerating(false);
    }
  };

  const sendResponse = async () => {
    if (!draft) return;
    await fetch(`/api/admin/tickets/${ticketId}/respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft })
    });
    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="bg-white p-6 rounded shadow border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Draft Response</h2>
        <button 
          onClick={generateDraft} 
          disabled={isGenerating}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {isGenerating ? "Generating AI Draft..." : "✨ Generate AI Draft"}
        </button>
      </div>
      <textarea 
        className="w-full border p-3 rounded h-40" 
        placeholder="Type your response or use AI..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
      />
      <div className="mt-4 flex justify-end">
        <button 
          onClick={sendResponse} 
          disabled={!draft} 
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          Send Response
        </button>
      </div>
    </div>
  );
}
