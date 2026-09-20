import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";
import SectionActions from "./section-actions";
import SectionHeader from "./section-header";
import ProblemEdit from "./problem-edit";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function SectionPage({
  params,
}: PageProps) {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("admin_session")?.value;

  if (!sessionToken) {
    redirect("/admin/login");
  }

  const session = await verifySession(sessionToken);

  if (!session) {
    redirect("/admin/login");
  }

  const { slug } = await params;

  // Current section
  const section = await db.orm.public.Section
    .where({
      slug,
    })
    .first();

  if (!section) {
    notFound();
  }

  // Direct child sections
  const childSections = await db.orm.public.Section
    .where({
      parentId: section.id,
    })
    .all();

  // Problems directly inside this section
  const problems = await db.orm.public.Problem
    .where({
      sectionId: section.id,
    })
    .all();

  return (
    <main className="min-h-screen bg-[#F8F7F2] px-8 py-10 text-[#111111]">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="border-b border-[#D8D4C8] pb-6">
          <p className="text-[11px] uppercase tracking-[0.3em] text-[#8A6D2F]">
            DSA Tracker
          </p>

          <div className="mt-3">
            <SectionHeader
              sectionId={section.id}
              initialName={section.name}
              initialSlug={section.slug}
            />
          </div>

          <p className="mt-2 text-sm text-[#6B6B63]">
            Section Management
          </p>
        </div>

        {/* Add Actions */}
        <SectionActions
          sectionId={section.id}
          sectionName={section.name}
        />

        {/* Child Sections */}
        <section className="mt-12">
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
            Sections
          </p>

          {childSections.length === 0 ? (
            <div className="rounded-md border border-[#D8D4C8] bg-[#FCFBF7] px-6 py-8 text-sm text-[#77736A]">
              No sections created yet.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {childSections.map((childSection) => (
                <Link
                  key={childSection.id}
                  href={`/admin/sections/${childSection.slug}`}
                  className="block rounded-md border border-[#C9C5B9] bg-[#FCFBF7] px-6 py-7 transition hover:border-[#A17E32] hover:shadow-sm"
                >
                  <h2 className="font-serif text-xl">
                    {childSection.name}
                  </h2>

                  <p className="mt-2 text-[10px] uppercase tracking-[0.15em] text-[#9A978E]">
                    /{childSection.slug}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Problems */}
        <section className="mt-12">
          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
            Problems
          </p>

          {problems.length === 0 ? (
            <div className="rounded-md border border-[#D8D4C8] bg-[#FCFBF7] px-6 py-8 text-sm text-[#77736A]">
              No problems added yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-md border border-[#C9C5B9] bg-[#FCFBF7]">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#D8D4C8] text-left">
                    <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#77736A]">
                      #
                    </th>

                    <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#77736A]">
                      Problem
                    </th>

                    <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#77736A]">
                      Difficulty
                    </th>

                    <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#77736A]">
                      LeetCode
                    </th>

                    <th className="px-5 py-4 text-[10px] uppercase tracking-[0.2em] text-[#77736A]">
                      Edit
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {problems.map((problem, index) => (
                    <tr
                      key={problem.id}
                      className="border-b border-[#E5E2D9] last:border-b-0"
                    >
                      <td className="px-5 py-4 text-sm text-[#77736A]">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 font-medium">
                        {problem.title}
                      </td>

                      <td className="px-5 py-4 text-sm">
                        {problem.difficulty}
                      </td>

                      <td className="px-5 py-4">
                        <a
                          href={problem.leetcodeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#8A6D2F] underline underline-offset-4 hover:text-[#111111]"
                        >
                          Open
                        </a>
                      </td>

                      <td className="px-5 py-4">
                        <ProblemEdit problem={problem} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}