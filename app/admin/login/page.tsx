"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.push("/admin");
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#111111] flex items-center justify-center px-6">
      <div className="w-full max-w-[430px]">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-7">
            <div className="h-px w-12 bg-[#B08D3C]" />

            <span className="text-[11px] tracking-[0.35em] uppercase text-[#8A6D2F]">
              DSA Tracker
            </span>

            <div className="h-px w-12 bg-[#B08D3C]" />
          </div>

          <h1 className="font-serif text-4xl tracking-tight text-[#111111]">
            Administrator
          </h1>

          <p className="mt-3 text-sm text-[#6B6B63] tracking-wide">
            Private access to the DSA Tracker
          </p>
        </div>

        {/* Login Card */}
        <div className="border border-[#D8D4C8] bg-[#FCFBF7] px-9 py-10 shadow-[0_10px_35px_rgba(0,0,0,0.05)]">

          <form onSubmit={handleLogin} className="space-y-7">

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#55554F]"
              >
                Username
              </label>

              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter username"
                autoComplete="username"
                required
                className="w-full border-b border-[#C9C5B9] bg-transparent px-1 py-3 text-[15px] text-[#111111] placeholder-[#AAA79E] outline-none transition focus:border-[#A17E32]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block mb-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#55554F]"
              >
                Password
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                required
                className="w-full border-b border-[#C9C5B9] bg-transparent px-1 py-3 text-[15px] text-[#111111] placeholder-[#AAA79E] outline-none transition focus:border-[#A17E32]"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-3 w-full border border-[#171717] bg-[#171717] px-5 py-3.5 text-[12px] font-medium uppercase tracking-[0.25em] text-[#F8F7F2] transition hover:bg-[#A17E32] hover:border-[#A17E32] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing In..." : "Enter"}
            </button>
          </form>

          {/* Bottom Detail */}
          <div className="mt-8 flex items-center gap-3">
            <div className="h-px flex-1 bg-[#DDD9CE]" />

            <span className="text-[9px] tracking-[0.25em] text-[#A19D92] uppercase">
              Private
            </span>

            <div className="h-px flex-1 bg-[#DDD9CE]" />
          </div>
        </div>

        {/* Footer */}
        <p className="mt-7 text-center text-[10px] tracking-[0.18em] uppercase text-[#9A978E]">
          DSA Tracker · Administration
        </p>

      </div>
    </main>
  );
}