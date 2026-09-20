"use client";

import { useState } from "react";

type Section = {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
};

type ManageSectionsProps = {
  sections: Section[];
};

export default function ManageSections({
  sections,
}: ManageSectionsProps) {
  const [open, setOpen] = useState(false);

  function toggleManage() {
    setOpen((current) => !current);
  }

  return (
    <section className="mt-10">
      <button
        type="button"
        onClick={toggleManage}
        className="rounded-md border border-[#B08D3C] bg-transparent px-7 py-3 text-[11px] uppercase tracking-[0.2em] text-[#8A6D2F] transition hover:bg-[#F1EBDD]"
      >
        {open ? "Close Manage" : "Manage"}
      </button>

      {open && (
        <div className="mt-8 rounded-md border border-[#D8D4C8] bg-[#FCFBF7] p-7">
          <div className="mb-6">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
              Content Management
            </p>

            <h2 className="mt-2 font-serif text-2xl">
              Structure
            </h2>
          </div>

          {sections.length === 0 ? (
            <p className="text-sm text-[#77736A]">
              No sections created yet.
            </p>
          ) : (
            <div className="space-y-3">
              {sections
                .filter((section) => section.parentId === null)
                .map((section) => (
                  <SectionNode
                    key={section.id}
                    section={section}
                    sections={sections}
                    level={0}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function SectionNode({
  section,
  sections,
  level,
}: {
  section: Section;
  sections: Section[];
  level: number;
}) {
  const children = sections.filter(
    (child) => child.parentId === section.id
  );

  return (
    <div>
      <div
        className="flex items-center justify-between rounded-md border border-[#E0DCD1] bg-white px-5 py-4"
        style={{
          marginLeft: `${level * 28}px`,
        }}
      >
        <div>
          <h3 className="font-serif text-lg">
            {section.name}
          </h3>

          <p className="mt-1 text-[10px] uppercase tracking-[0.15em] text-[#9A978E]">
            /{section.slug}
          </p>
        </div>

        <button
          type="button"
          className="rounded-md border border-[#C9C5B9] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#55554F] transition hover:border-[#A17E32] hover:text-[#8A6D2F]"
        >
          Edit
        </button>
      </div>

      {children.length > 0 && (
        <div className="mt-3 space-y-3">
          {children.map((child) => (
            <SectionNode
              key={child.id}
              section={child}
              sections={sections}
              level={level + 1}
            />
          ))}
        </div>
      )}

      <div
        className="mt-3 border-b border-[#E0DCD1] pb-3 text-right"
        style={{
          marginLeft: `${level * 28}px`,
        }}
      >
        <button
          type="button"
          className="rounded-md border border-[#B08D3C] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-[#8A6D2F] transition hover:bg-[#F1EBDD]"
        >
          + Add
        </button>
      </div>
    </div>
  );
}