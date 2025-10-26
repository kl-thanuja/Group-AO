"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AllNotesPage() {
  const [notesList, setNotesList] = useState<{ roomId: string; notes: any }[]>([]);
  const router = useRouter();

  useEffect(() => {
    const allNotes: { roomId: string; notes: any }[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("finalNotes-")) {
        const roomId = key.replace("finalNotes-", "");
        const notes = JSON.parse(localStorage.getItem(key) || "{}");
        allNotes.push({ roomId, notes });
      }
    }
    setNotesList(allNotes);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📝 All Discussion Notes</h1>

      {notesList.length === 0 ? (
        <p className="text-gray-600 text-center">No saved notes found.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notesList.map(({ roomId, notes }) => (
            <div key={roomId} className="bg-white rounded-xl shadow p-4 border border-gray-200">
              <h2 className="text-lg font-semibold mb-2">Room: {roomId}</h2>

              <h3 className="font-bold mt-2 mb-1 text-blue-700">Summary Notes</h3>
              <ul className="list-disc pl-5 mb-3 text-sm">
                {notes.summaryNotes?.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                )) || <li>No summary notes</li>}
              </ul>

              <h3 className="font-bold mb-1 text-green-700">Action Items</h3>
              <ul className="list-disc pl-5 mb-3 text-sm">
                {notes.actionItems?.map((n: string, i: number) => (
                  <li key={i}>{n}</li>
                )) || <li>No action items</li>}
              </ul>

              <h3 className="font-bold mb-1 text-purple-700">Recap</h3>
              <p className="text-sm mb-3">{notes.recap || "No recap"}</p>

              <button
                onClick={() => router.push(`/practice-test/${roomId}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm mt-3"
              >
                Take Practice Test
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
