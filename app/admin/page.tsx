import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";

import CreateSection from "./create-section";

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
    <main className="min-h-screen bg-[#F8F7F2] px-8 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="border-b border-[#D8D4C8] pb-6">
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

        {/* Create Button */}
        <section className="mt-10">
          <CreateSection />
        </section>

        {/* Sections */}
        <section className="mt-12">
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
            Sections
          </p>

          {sections.length === 0 ? (
            <div className="rounded-md border border-[#D8D4C8] bg-[#FCFBF7] px-6 py-8 text-sm text-[#77736A]">
              No sections created yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sections
                .filter((section) => section.parentId === null)
                .map((section) => (
                  <Link
                    key={section.id}
                    href={`/admin/sections/${section.slug}`}
                    className="block rounded-md border border-[#C9C5B9] bg-[#FCFBF7] px-6 py-7 transition hover:border-[#A17E32] hover:shadow-sm"
                  >
                    <h2 className="font-serif text-xl">
                      {section.name}
                    </h2>

                    <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#9A978E]">
                      /{section.slug}
                    </p>
                  </Link>
                ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}