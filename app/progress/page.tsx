import Link from "next/link";

import { db } from "@/lib/prisma";
import { getAllSectionsProgress } from "@/lib/all-sections-progress";
import ProgressSync from "./progress-sync";

type PageProps = {
  searchParams: Promise<{
    username?: string;
  }>;
};

export default async function ProgressPage({
  searchParams,
}: PageProps) {
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

  // Find user
  let user =
    await db.orm.public.User
      .where({
        leetcodeUsername: username,
      })
      .first();

  // Create user if it doesn't exist
  if (!user) {
    user =
      await db.orm.public.User.create({
        leetcodeUsername: username,
      });
  }

  // Calculate progress for all top-level sections
  // using a single optimized data load.
  const sectionsWithProgress =
    await getAllSectionsProgress(user.id);

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#111111]">
      <ProgressSync username={username} />

      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-8">

        {/* Header */}
        <header className="border-b border-[#D8D4C8] pb-8">

          <p className="text-[10px] uppercase tracking-[0.35em] text-[#8A6D2F]">
            LeetCode Progress Tracker
          </p>

          <h1 className="mt-4 font-serif text-4xl sm:text-5xl">
            Hello, {username}
          </h1>

          <p className="mt-3 text-sm text-[#6B6B63]">
            Select a section to continue your DSA journey.
          </p>

        </header>

        {/* Sections */}
        <section className="mt-12">

          <p className="mb-5 text-[10px] uppercase tracking-[0.25em] text-[#8A6D2F]">
            Sections
          </p>

          {sectionsWithProgress.length === 0 ? (
            <div className="rounded-md border border-[#D8D4C8] bg-[#FCFBF7] px-6 py-8 text-sm text-[#77736A]">
              No sections available yet.
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

              {sectionsWithProgress.map(
                ({ section, progress }) => (
                  <Link
                    key={section.id}
                    href={`/progress/${section.slug}?username=${encodeURIComponent(
                      username
                    )}`}
                    className="group rounded-md border border-[#C9C5B9] bg-[#FCFBF7] p-7 transition hover:border-[#A17E32] hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
                  >

                    {/* Section name */}
                    <div className="flex items-start justify-between">

                      <h2 className="font-serif text-2xl">
                        {section.name}
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
          )}

        </section>

      </div>
    </main>
  );
}