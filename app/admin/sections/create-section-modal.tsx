"use client";

import { useState } from "react";

type ChildType = "section" | "problem";

type ChildItem = {
  id: number;
  name: string;
  type: ChildType;
};

export default function CreateSectionModal() {
  const [open, setOpen] = useState(false);

  const [sectionName, setSectionName] = useState("");
  const [slug, setSlug] = useState("");

  const [children, setChildren] = useState<ChildItem[]>([]);

  function addChild() {
    setChildren((current) => [
      ...current,
      {
        id: Date.now(),
        name: "",
        type: "section",
      },
    ]);
  }

  function removeChild(id: number) {
    setChildren((current) =>
      current.filter((child) => child.id !== id)
    );
  }

  function updateChild(
    id: number,
    field: "name" | "type",
    value: string
  ) {
    setChildren((current) =>
      current.map((child) => {
        if (child.id !== id) {
          return child;
        }

        return {
          ...child,
          [field]: value,
        };
      })
    );
  }

  function closeModal() {
    setOpen(false);
    setSectionName("");
    setSlug("");
    setChildren([]);
  }

  return (
    <>
      {/* Create Section Button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32]"
      >
        + Create Section
      </button>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-2xl rounded-lg border border-[#D8D4C8] bg-[#FCFBF7] shadow-[0_20px_60px_rgba(0,0,0,0.15)]">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-[#D8D4C8] px-7 py-6">
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
                className="text-xl text-[#77736A] transition hover:text-[#111111]"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {/* Body */}
            <div className="max-h-[70vh] overflow-y-auto px-7 py-7">

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
                  value={sectionName}
                  onChange={(event) =>
                    setSectionName(event.target.value)
                  }
                  placeholder="e.g. Data Structures"
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* Slug */}
              <div className="mt-6">
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
                  onChange={(event) =>
                    setSlug(event.target.value)
                  }
                  placeholder="e.g. data-structures"
                  className="w-full rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
                />
              </div>

              {/* Children */}
              <div className="mt-8">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#55554F]">
                      Children
                    </p>

                    <p className="mt-1 text-xs text-[#8A877F]">
                      Add sections or problems under this section.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {children.map((child, index) => (
                    <div
                      key={child.id}
                      className="flex items-center gap-3"
                    >
                      <span className="w-6 text-center text-xs text-[#9A978E]">
                        {index + 1}
                      </span>

                      {/* Child Name */}
                      <input
                        type="text"
                        value={child.name}
                        onChange={(event) =>
                          updateChild(
                            child.id,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder={
                          child.type === "section"
                            ? "e.g. Array"
                            : "e.g. Two Sum"
                        }
                        className="min-w-0 flex-1 rounded-md border border-[#C9C5B9] bg-white px-4 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
                      />

                      {/* Child Type */}
                      <select
                        value={child.type}
                        onChange={(event) =>
                          updateChild(
                            child.id,
                            "type",
                            event.target.value
                          )
                        }
                        className="w-36 rounded-md border border-[#C9C5B9] bg-white px-3 py-3 text-sm text-[#111111] outline-none transition focus:border-[#A17E32]"
                      >
                        <option value="section">
                          Section
                        </option>

                        <option value="problem">
                          Problem
                        </option>
                      </select>

                      {/* Remove */}
                      <button
                        type="button"
                        onClick={() => removeChild(child.id)}
                        className="px-2 text-lg text-[#9A978E] transition hover:text-red-600"
                        aria-label="Remove child"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add Child */}
                <button
                  type="button"
                  onClick={addChild}
                  className="mt-5 rounded-md border border-[#B08D3C] px-5 py-2.5 text-[10px] uppercase tracking-[0.2em] text-[#8A6D2F] transition hover:bg-[#F1EBDD]"
                >
                  + Add Child
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-[#D8D4C8] px-7 py-5">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md border border-[#C9C5B9] px-5 py-3 text-[10px] uppercase tracking-[0.2em] text-[#55554F] transition hover:bg-[#F1EFE8]"
              >
                Cancel
              </button>

              <button
                type="button"
                className="rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32]"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}