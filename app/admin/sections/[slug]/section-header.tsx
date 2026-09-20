"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  sectionId: number;
  initialName: string;
  initialSlug: string;
};

export default function SectionHeader({
  sectionId,
  initialName,
  initialSlug,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function openModal() {
    setName(initialName);
    setSlug(initialSlug);
    setError("");
    setOpen(true);
  }

  function closeModal() {
    if (loading) return;

    setOpen(false);
    setError("");
  }

  async function handleUpdate() {
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
      const response = await fetch(
        `/api/admin/sections/${sectionId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: name.trim(),
            slug: slug.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to update section."
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
      `Delete "${initialName}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/admin/sections/${sectionId}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error || "Failed to delete section."
        );
        return;
      }

      setOpen(false);

      router.push("/admin");
      router.refresh();
    } catch {
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Section Heading + Edit Icon */}
      <div className="group flex items-center gap-3">
        <h1 className="font-serif text-4xl">
          {initialName}
        </h1>

        <button
          type="button"
          onClick={openModal}
          aria-label="Edit section"
          className="rounded-md p-2 text-[#9A978E] opacity-0 transition group-hover:opacity-100 hover:bg-[#ECE9DF] hover:text-[#8A6D2F]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.862 3.487a2.1 2.1 0 0 1 2.97 2.97L7.5 18.79l-4 1 1-4L16.862 3.487Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15.5 4.85 3.65 3.65"
            />
          </svg>
        </button>
      </div>

      {/* Edit Section Modal */}
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
                  Edit Section
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="text-xl text-[#77736A] hover:text-[#111111] disabled:opacity-50"
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
                  htmlFor="edit-section-name"
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Section Name
                </label>

                <input
                  id="edit-section-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* Slug */}
              <div className="mt-5">
                <label
                  htmlFor="edit-section-slug"
                  className="mb-2 block text-[10px] uppercase tracking-[0.2em] text-[#55554F]"
                >
                  Slug
                </label>

                <input
                  id="edit-section-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#A17E32]"
                />

                <p className="mt-2 text-xs text-[#8A877F]">
                  Use lowercase letters, numbers, and hyphens.
                </p>
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