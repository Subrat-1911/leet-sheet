"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreateSection() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    if (!name.trim()) {
      setError("Section name is required.");
      return;
    }

    if (!slug.trim()) {
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
          name: name.trim(),
          slug: slug.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create section.");
        return;
      }

      setName("");
      setSlug("");
      setOpen(false);

      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setOpen(false);
    setName("");
    setSlug("");
    setError("");
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          setError("");
        }}
        className="rounded-md border border-[#171717] bg-[#171717] px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32]"
      >
        Create
      </button>

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
                  Create Section
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

              {/* Section Name */}
              <div>
                <label
                  htmlFor="section-name"
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Section Name
                </label>

                <input
                  id="section-name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Data Structures"
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* Slug */}
              <div className="mt-5">
                <label
                  htmlFor="section-slug"
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Slug
                </label>

                <input
                  id="section-slug"
                  type="text"
                  value={slug}
                  onChange={(event) => setSlug(event.target.value)}
                  placeholder="e.g. data-structures"
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />

                <p className="mt-2 text-xs text-[#8A877F]">
                  Use lowercase letters, numbers, and hyphens.
                </p>
              </div>

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
                onClick={closeModal}
                className="rounded-md border border-[#C9C5B9] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#55554F] transition hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreate}
                disabled={loading}
                className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Section"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}