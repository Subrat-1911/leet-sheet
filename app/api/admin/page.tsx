import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const session = await verifySession(sessionToken);

  if (!session) {
    redirect("/admin/login");
  }

  const sections = await db.orm.public.Section.all();

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#111111] px-8 py-10">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="border-b border-[#D8D4C8] pb-6">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A6D2F]">
                DSA Tracker
              </p>

              <h1 className="mt-3 font-serif text-4xl">
                Administration
              </h1>

              <p className="mt-2 text-sm text-[#6B6B63]">
                Welcome, {session.username}.
              </p>
            </div>

            <button
              type="button"
              className="border border-[#171717] bg-[#171717] px-5 py-3 text-[11px] uppercase tracking-[0.2em] text-white transition hover:border-[#A17E32] hover:bg-[#A17E32]"
            >
              + New Section
            </button>
          </div>
        </div>

        {/* Sections */}
        <section className="mt-10">
          <div className="mb-5">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
              Content Structure
            </p>

            <h2 className="mt-2 font-serif text-2xl">
              Sections
            </h2>
          </div>

          {sections.length === 0 ? (
            <div className="border border-dashed border-[#C9C5B9] bg-[#FCFBF7] px-8 py-16 text-center">
              <p className="font-serif text-xl text-[#333333]">
                No sections yet
              </p>

              <p className="mt-2 text-sm text-[#77736A]">
                Create your first section to start building the tracker.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className="border border-[#D8D4C8] bg-[#FCFBF7] p-6 shadow-[0_5px_20px_rgba(0,0,0,0.03)]"
                >
                  <h3 className="font-serif text-xl">
                    {section.name}
                  </h3>

                  {section.description && (
                    <p className="mt-2 text-sm text-[#77736A]">
                      {section.description}
                    </p>
                  )}

                  <div className="mt-5 border-t border-[#E2DED3] pt-4">
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#9A978E]">
                      Section ID: {section.id}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}