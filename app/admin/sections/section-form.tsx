"use client";

import { FormEvent, useState } from "react";

type ParentSection = {
  id: number;
  name: string;
};

type SectionFormProps = {
  parentSections: ParentSection[];
};

export default function SectionForm({
  parentSections,
}: SectionFormProps) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          parentId: parentId ? Number(parentId) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create section.");
        return;
      }

      setMessage("Section created successfully.");

      setName("");
      setSlug("");
      setDescription("");
      setParentId("");

      window.location.reload();
    } catch {
      setError("Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="border border-[#D8D4C8] bg-[#FCFBF7] p-8">
      <div className="mb-7">
        <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
          Content Management
        </p>

        <h2 className="mt-2 font-serif text-2xl">
          Create Section
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Name */}
        <div>
          <label
            htmlFor="section-name"
            className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#55554F]"
          >
            Section Name
          </label>

          <input
            id="section-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Data Structures"
            required
            className="w-full border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
          />
        </div>

        {/* Slug */}
        <div>
          <label
            htmlFor="section-slug"
            className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#55554F]"
          >
            Slug
          </label>

          <input
            id="section-slug"
            type="text"
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="e.g. data-structures"
            required
            className="w-full border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
          />
        </div>

        {/* Description */}
        <div>
          <label
            htmlFor="section-description"
            className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#55554F]"
          >
            Description
          </label>

          <textarea
            id="section-description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional description"
            rows={4}
            className="w-full resize-none border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
          />
        </div>

        {/* Parent */}
        <div>
          <label
            htmlFor="parent-section"
            className="mb-2 block text-[11px] uppercase tracking-[0.18em] text-[#55554F]"
          >
            Parent Section
          </label>

          <select
            id="parent-section"
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="w-full border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
          >
            <option value="">None — Top Level</option>

            {parentSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="border border-[#D8D4C8] bg-[#F4F0E5] px-4 py-3 text-sm text-[#665322]">
            {message}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full border border-[#171717] bg-[#171717] px-5 py-3.5 text-[11px] uppercase tracking-[0.22em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating..." : "Create Section"}
        </button>
      </form>
    </div>
  );
}