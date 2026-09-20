"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SectionActions({
  sectionId,
  sectionName,
}: {
  sectionId: number;
  sectionName: string;
}) {
  const router = useRouter();

  // Add Section
  const [showAddSection, setShowAddSection] = useState(false);
  const [sectionNameInput, setSectionNameInput] = useState("");
  const [sectionSlug, setSectionSlug] = useState("");

  // Add Problem
  const [showAddProblem, setShowAddProblem] = useState(false);
  const [problemTitle, setProblemTitle] = useState("");
  const [leetcodeUrl, setLeetcodeUrl] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // ADD SECTION
  // --------------------------------------------------

  async function handleAddSection() {
    if (!sectionNameInput.trim()) {
      setError("Section name is required.");
      return;
    }

    if (!sectionSlug.trim()) {
      setError("Section slug is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: sectionNameInput.trim(),
          slug: sectionSlug.trim(),
          parentId: sectionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create section.");
        return;
      }

      setSectionNameInput("");
      setSectionSlug("");
      setShowAddSection(false);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // ADD PROBLEM
  // --------------------------------------------------

  async function handleAddProblem() {
    if (!problemTitle.trim()) {
      setError("Problem title is required.");
      return;
    }

    if (!leetcodeUrl.trim()) {
      setError("LeetCode URL is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/problems", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sectionId,
          title: problemTitle.trim(),
          leetcodeUrl: leetcodeUrl.trim(),
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create problem.");
        return;
      }

      setProblemTitle("");
      setLeetcodeUrl("");
      setDifficulty("Easy");
      setShowAddProblem(false);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  // --------------------------------------------------
  // CLOSE MODALS
  // --------------------------------------------------

  function closeSectionModal() {
    setShowAddSection(false);
    setSectionNameInput("");
    setSectionSlug("");
    setError("");
  }

  function closeProblemModal() {
    setShowAddProblem(false);
    setProblemTitle("");
    setLeetcodeUrl("");
    setDifficulty("Easy");
    setError("");
  }

  return (
    <>
      {/* ================================================
          ACTION BUTTONS
      ================================================= */}

      <section className="mt-10 grid gap-5 sm:grid-cols-2">

        {/* ADD SECTION */}

        <button
          type="button"
          onClick={() => {
            setShowAddSection(true);
            setError("");
          }}
          className="rounded-md border border-[#C9C5B9] bg-[#FCFBF7] px-6 py-8 text-left transition hover:border-[#A17E32] hover:shadow-sm"
        >
          <h2 className="font-serif text-2xl">
            Add Section
          </h2>

          <p className="mt-2 text-sm text-[#77736A]">
            Create a new section inside {sectionName}.
          </p>
        </button>

        {/* ADD PROBLEM */}

        <button
          type="button"
          onClick={() => {
            setShowAddProblem(true);
            setError("");
          }}
          className="rounded-md border border-[#C9C5B9] bg-[#FCFBF7] px-6 py-8 text-left transition hover:border-[#A17E32] hover:shadow-sm"
        >
          <h2 className="font-serif text-2xl">
            Add Problem
          </h2>

          <p className="mt-2 text-sm text-[#77736A]">
            Add a LeetCode problem to {sectionName}.
          </p>
        </button>

      </section>

      {/* ================================================
          ADD SECTION MODAL
      ================================================= */}

      {showAddSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#D8D4C8] bg-[#FCFBF7] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#D8D4C8] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
                  {sectionName}
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Add Section
                </h2>
              </div>

              <button
                type="button"
                onClick={closeSectionModal}
                className="text-xl text-[#77736A] hover:text-[#111111]"
              >
                ×
              </button>
            </div>

            {/* Form */}

            <div className="px-6 py-6">

              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                Section Name
              </label>

              <input
                type="text"
                value={sectionNameInput}
                onChange={(event) =>
                  setSectionNameInput(event.target.value)
                }
                placeholder="e.g. Array"
                className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none focus:border-[#A17E32]"
              />

              <label className="mb-2 mt-5 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                Slug
              </label>

              <input
                type="text"
                value={sectionSlug}
                onChange={(event) =>
                  setSectionSlug(event.target.value)
                }
                placeholder="e.g. array"
                className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none focus:border-[#A17E32]"
              />

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-[#D8D4C8] px-6 py-5">

              <button
                type="button"
                onClick={closeSectionModal}
                className="rounded-md border border-[#C9C5B9] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddSection}
                disabled={loading}
                className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Section"}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ================================================
          ADD PROBLEM MODAL
      ================================================= */}

      {showAddProblem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-lg border border-[#D8D4C8] bg-[#FCFBF7] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

            {/* Header */}

            <div className="flex items-center justify-between border-b border-[#D8D4C8] px-6 py-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
                  {sectionName}
                </p>

                <h2 className="mt-2 font-serif text-2xl">
                  Add Problem
                </h2>
              </div>

              <button
                type="button"
                onClick={closeProblemModal}
                className="text-xl text-[#77736A] hover:text-[#111111]"
              >
                ×
              </button>
            </div>

            {/* Form */}

            <div className="px-6 py-6">

              {/* Problem Title */}

              <label className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                Problem Title
              </label>

              <input
                type="text"
                value={problemTitle}
                onChange={(event) =>
                  setProblemTitle(event.target.value)
                }
                placeholder="e.g. Two Sum"
                className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none focus:border-[#A17E32]"
              />

              {/* LeetCode URL */}

              <label className="mb-2 mt-5 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                LeetCode URL
              </label>

              <input
                type="url"
                value={leetcodeUrl}
                onChange={(event) =>
                  setLeetcodeUrl(event.target.value)
                }
                placeholder="https://leetcode.com/problems/two-sum/"
                className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none focus:border-[#A17E32]"
              />

              {/* Difficulty */}

              <label className="mb-2 mt-5 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                Difficulty
              </label>

              <select
                value={difficulty}
                onChange={(event) =>
                  setDifficulty(event.target.value)
                }
                className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none focus:border-[#A17E32]"
              >
                <option value="Easy">
                  Easy
                </option>

                <option value="Medium">
                  Medium
                </option>

                <option value="Hard">
                  Hard
                </option>
              </select>

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>

            {/* Footer */}

            <div className="flex justify-end gap-3 border-t border-[#D8D4C8] px-6 py-5">

              <button
                type="button"
                onClick={closeProblemModal}
                className="rounded-md border border-[#C9C5B9] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAddProblem}
                disabled={loading}
                className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Adding..." : "Add Problem"}
              </button>

            </div>

          </div>
        </div>
      )}
    </>
  );
}