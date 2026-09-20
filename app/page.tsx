"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    const cleanUsername = username.trim();

    if (!cleanUsername) {
      setError("Please enter your LeetCode username.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      /*
       * For now we only move to the progress page.
       * LeetCode username verification will be connected
       * when we build the progress backend.
       */
      router.push(
        `/progress?username=${encodeURIComponent(cleanUsername)}`
      );
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Enter") {
      handleSubmit();
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#111111]">

      <div className="flex min-h-screen items-center justify-center px-6">

        <div className="w-full max-w-xl">

          {/* Brand */}
          <div className="text-center">

            <p className="text-[10px] uppercase tracking-[0.4em] text-[#8A6D2F]">
              LeetCode Progress Tracker
            </p>

            <h1 className="mt-5 font-serif text-5xl tracking-tight sm:text-6xl">
              DSA Tracker
            </h1>

            <div className="mx-auto mt-6 h-px w-24 bg-[#A17E32]" />

            <p className="mx-auto mt-6 max-w-md text-sm leading-6 text-[#6B6B63]">
              Track your data structures and algorithms
              progress through your LeetCode journey.
            </p>

          </div>

          {/* Username Card */}
          <div className="mx-auto mt-12 max-w-md rounded-md border border-[#C9C5B9] bg-[#FCFBF7] p-7 shadow-[0_12px_40px_rgba(0,0,0,0.04)]">

            <label
              htmlFor="leetcode-username"
              className="mb-3 block text-[10px] uppercase tracking-[0.25em] text-[#55554F]"
            >
              LeetCode Username
            </label>

            <input
              id="leetcode-username"
              type="text"
              value={username}
              onChange={(event) =>
                setUsername(event.target.value)
              }
              onKeyDown={handleKeyDown}
              placeholder="Enter your username"
              autoComplete="off"
              className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3.5 text-sm text-[#111111] outline-none transition placeholder:text-[#A5A29A] focus:border-[#A17E32]"
            />

            {error && (
              <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="mt-5 w-full rounded-md border border-[#171717] bg-[#171717] px-6 py-3.5 text-[10px] uppercase tracking-[0.25em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Loading..." : "Enter"}
            </button>

          </div>

          {/* Footer */}
          <p className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-[#AAA69B]">
            No password required
          </p>

        </div>

      </div>

    </main>
  );
}