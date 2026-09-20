"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Problem = {
  id: number;
  title: string;
  leetcodeUrl: string;
  difficulty: string;
};

export default function ProblemEdit({
  problem,
}: {
  problem: Problem;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState(problem.title);
  const [leetcodeUrl, setLeetcodeUrl] = useState(
    problem.leetcodeUrl
  );
  const [difficulty, setDifficulty] = useState(
    problem.difficulty
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setTitle(problem.title);
    setLeetcodeUrl(problem.leetcodeUrl);
    setDifficulty(problem.difficulty);

    setError("");
    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
    setError("");
  }

  async function handleUpdate() {
    if (!title.trim()) {
      setError("Problem title is required.");
      return;
    }

    if (!leetcodeUrl.trim()) {
      setError("LeetCode URL is required.");
      return;
    }

    if (
      difficulty !== "Easy" &&
      difficulty !== "Medium" &&
      difficulty !== "Hard"
    ) {
      setError("Invalid difficulty.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/problems/${problem.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: title.trim(),
            leetcodeUrl: leetcodeUrl.trim(),
            difficulty,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to update problem."
        );
        return;
      }

      setOpen(false);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${problem.title}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/problems/${problem.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to delete problem."
        );
        return;
      }

      setOpen(false);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Edit Button */}
      <button
        type="button"
        onClick={openModal}
        className="rounded-md border border-[#C9C5B9] px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-[#55554F] transition hover:border-[#A17E32] hover:bg-[#F1EFE8] hover:text-[#8A6D2F]"
      >
        Edit
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#D8D4C8] bg-[#FCFBF7] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#D8D4C8] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
                  Content Management
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Edit Problem
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="text-xl text-[#77736A] hover:text-[#111111]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-6">

              {/* Problem Title */}
              <div>
                <label
                  htmlFor={`problem-title-${problem.id}`}
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Problem Title
                </label>

                <input
                  id={`problem-title-${problem.id}`}
                  type="text"
                  value={title}
                  onChange={(event) =>
                    setTitle(event.target.value)
                  }
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* LeetCode URL */}
              <div className="mt-5">
                <label
                  htmlFor={`problem-url-${problem.id}`}
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  LeetCode URL
                </label>

                <input
                  id={`problem-url-${problem.id}`}
                  type="url"
                  value={leetcodeUrl}
                  onChange={(event) =>
                    setLeetcodeUrl(event.target.value)
                  }
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* Difficulty */}
              <div className="mt-5">
                <label
                  htmlFor={`problem-difficulty-${problem.id}`}
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Difficulty
                </label>

                <select
                  id={`problem-difficulty-${problem.id}`}
                  value={difficulty}
                  onChange={(event) =>
                    setDifficulty(event.target.value)
                  }
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#D8D4C8] px-6 py-5">

              {/* Delete */}
              <button
                type="button"
                onClick={handleDelete}
                disabled={loading}
                className="rounded-md border border-red-300 px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>

              {/* Cancel + Save */}
              <div className="flex gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="rounded-md border border-[#C9C5B9] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#55554F] transition hover:bg-[#F1EFE8] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>

              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}