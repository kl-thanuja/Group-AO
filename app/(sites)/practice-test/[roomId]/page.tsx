"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PracticeTestPage() {
  const { roomId } = useParams();
  const [quiz, setQuiz] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedNotes = localStorage.getItem(`finalNotes-${roomId}`);
    if (!savedNotes) {
      console.warn("No saved notes found for this room.");
      return;
    }
    const { recap, summaryNotes, actionItems } = JSON.parse(savedNotes);
    const transcript = `
      Summary: ${summaryNotes?.join(", ")}
      Action Items: ${actionItems?.join(", ")}
      Recap: ${recap}
    `;

    generateQuiz(transcript);
  }, [roomId]);

  const generateQuiz = async (transcript: string) => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/generate-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, numQuestions: 5 }),
      });
      if (!res.ok) throw new Error("Failed to generate quiz");
      const data = await res.json();
      setQuiz(data.quiz || []);
    } catch (err) {
      console.error("Quiz generation failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (index: number, choice: string) => {
    setSelectedAnswers((prev) => ({ ...prev, [index]: choice }));
  };

  const handleSubmit = () => {
    let correct = 0;
    quiz.forEach((q, i) => {
      if (q.answer === selectedAnswers[i]) correct++;
    });
    setScore(correct);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 ">
      <h1 className="text-2xl font-bold text-center mb-6">
        🧠 Practice Test for Room {roomId}
      </h1>

      {loading && <p className="text-center text-gray-600">Generating quiz...</p>}

      {!loading && quiz.length === 0 && (
        <p className="text-center text-gray-600">No quiz available.</p>
      )}

      {!loading &&
        quiz.map((q, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-md p-4 mb-4 border border-gray-200 w-1/2 mx-auto"
          >
            <p className="font-semibold mb-2">
              {i + 1}. {q.question}
            </p>
            <div className="space-y-2">
              {Object.entries(q.options).map(([key, value]) => (
                <label
                  key={key}
                  className="block cursor-pointer bg-gray-100 p-2 rounded-md hover:bg-gray-200"
                >
                  <input
                    type="radio"
                    name={`q-${i}`}
                    value={key}
                    checked={selectedAnswers[i] === key}
                    onChange={() => handleAnswer(i, key)}
                    className="mr-2"
                  />
                  <span>{value}</span>
                </label>
              ))}
            </div>

            {score !== null && (
              <p
                className={`mt-2 text-sm ${
                  q.answer === selectedAnswers[i]
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                Correct answer: {q.answer} — {q.explanation}
              </p>
            )}
          </div>
        ))}

      {quiz.length > 0 && score === null && (
        <div className="text-center">
          <button
            onClick={handleSubmit}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Submit
          </button>
        </div>
      )}

      {score !== null && (
        <p className="text-center mt-4 text-lg font-semibold text-blue-700">
          You scored {score} / {quiz.length}
        </p>
      )}
    </div>
  );
}
