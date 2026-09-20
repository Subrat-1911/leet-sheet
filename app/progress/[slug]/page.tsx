import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";
import { getSectionProgress } from "@/lib/section-progress";
import ProblemLink from "../problem-link";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    username?: string;
  }>;
};

export default async function SectionProgressPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const { username } = await searchParams;

  if (!username) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F8F7F2] px-6">
        <div className="text-center">
          <p className="font-serif text-2xl">
            Username not provided
          </p>

          <Link
            href="/"
            className="mt-5 inline-block rounded-md border border-[#171717] bg-[#171717] px-6 py-3 text-[10px] uppercase tracking-[0.2em] text-white transition hover:bg-[#A17E32]"
          >
            Go Back
          </Link>
        </div>
      </main>
    );
  }

  // Find current section
  const section = await db.orm.public.Section
    .where({
      slug,
      active: true,
    })
    .first();

  if (!section) {
    notFound();
  }

  // Find current user
  let user = await db.orm.public.User
    .where({
      leetcodeUsername: username,
    })
    .first();

  // Create user if it doesn't exist
  if (!user) {
    user = await db.orm.public.User.create({
      leetcodeUsername: username,
    });
  }

  // Find direct child sections
  const childSections = await db.orm.public.Section
    .where({
      parentId: section.id,
      active: true,
    })
    .all();

  // Calculate progress for every child section
  const childSectionsWithProgress =
    await Promise.all(
      childSections.map(async (childSection) => {
        const progress =
          await getSectionProgress(
            childSection.id,
            user.id
          );

        return {
          section: childSection,
          progress,
        };
      })
    );

  // Find problems directly inside this section
  const problems = await db.orm.public.Problem
    .where({
      sectionId: section.id,
      active: true,
    })
    .all();

  // Find solved status for current user
  const progress =
    await db.orm.public.UserProgress
      .where({
        userId: user.id,
      })
      .all();

  // Store solved problem IDs for fast lookup
  const solvedProblemIds = new Set(
    progress
      .filter((item) => item.solved)
      .map((item) => item.problemId)
  );

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#111111]">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">

        {/* Header */}
        <header className="border-b border-[#D8D4C8] pb-8">

          <Link
            href={`/progress?username=${encodeURIComponent(
              username
            )}`}
            className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-[#8A6D2F] transition hover:text-[#111111]"
          >
            ← Back
          </Link>

          <p className="mt-8 text-[10px] uppercase tracking-[0.35em] text-[#8A6D2F]">
            DSA Tracker
          </p>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
            {section.name}
          </h1>

          <p className="mt-3 text-sm text-[#6B6B63]">
            Choose a topic to continue.
          </p>

        </header>

        {/* Child Sections */}
        {childSectionsWithProgress.length > 0 && (
          <section className="mt-12">

            <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
              Topics
            </p>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {childSectionsWithProgress.map(
                ({ section: childSection, progress }) => (
                  <Link
                    key={childSection.id}
                    href={`/progress/${childSection.slug}?username=${encodeURIComponent(
                      username
                    )}`}
                    className="group rounded-md border border-[#C9C5B9] bg-[#FCFBF7] p-7 transition hover:border-[#A17E32] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                  >

                    {/* Section name */}
                    <div className="flex items-start justify-between">

                      <h2 className="font-serif text-2xl">
                        {childSection.name}
                      </h2>

                      <span className="text-[#A17E32] transition-transform group-hover:translate-x-1">
                        →
                      </span>

                    </div>

                    {/* Progress */}
                    <div className="mt-8">

                      <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.15em]">

                        <span className="text-[#77736A]">
                          Progress
                        </span>

                        <span className="text-[#8A6D2F]">
                          {progress.percentage}%
                        </span>

                      </div>

                      {/* Progress bar */}
                      <div className="mt-2 h-1.5 w-full overflow-hidden bg-[#E5E2D9]">

                        <div
                          className="h-full bg-[#A17E32] transition-all duration-500"
                          style={{
                            width: `${progress.percentage}%`,
                          }}
                        />

                      </div>

                    </div>

                  </Link>
                )
              )}

            </div>

          </section>
        )}

        {/* Problems */}
        {problems.length > 0 && (
          <section className="mt-12">

            <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
              Problems
            </p>

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

                  </tr>
                </thead>

                <tbody>
                  {problems.map((problem, index) => {
                    const isSolved =
                      solvedProblemIds.has(
                        problem.id
                      );

                    return (
                      <tr
                        key={problem.id}
                        className={`border-b border-[#E5E2D9] last:border-b-0 transition ${
                          isSolved
                            ? "bg-[#E4F1E5]"
                            : "bg-transparent"
                        }`}
                      >

                        <td
                          className={`px-5 py-4 text-sm ${
                            isSolved
                              ? "text-[#4F7655]"
                              : "text-[#77736A]"
                          }`}
                        >
                          {index + 1}
                        </td>

                        <td className="px-5 py-4">
                          <ProblemLink
                            problemId={problem.id}
                            username={username}
                            title={problem.title}
                            leetcodeUrl={problem.leetcodeUrl}
                            solved={isSolved}
                          />
                        </td>

                        <td
                          className={`px-5 py-4 text-sm ${
                            isSolved
                              ? "text-[#4F7655]"
                              : "text-[#111111]"
                          }`}
                        >
                          {problem.difficulty}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>

              </table>

            </div>

          </section>
        )}

      </div>
    </main>
  );
}