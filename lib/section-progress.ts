import { db } from "@/lib/prisma";

export async function getSectionProgress(
  sectionId: number,
  userId: number
) {
  // Problems directly inside this section
  const problems =
    await db.orm.public.Problem
      .where({
        sectionId,
        active: true,
      })
      .all();

  // Child sections
  const childSections =
    await db.orm.public.Section
      .where({
        parentId: sectionId,
        active: true,
      })
      .all();

  let total = problems.length;
  let solved = 0;

  // Count solved problems
  for (const problem of problems) {
    const progress =
      await db.orm.public.UserProgress
        .where({
          userId,
          problemId: problem.id,
          solved: true,
        })
        .first();

    if (progress) {
      solved++;
    }
  }

  // Recursively include ALL child sections
  for (const childSection of childSections) {
    const childProgress =
      await getSectionProgress(
        childSection.id,
        userId
      );

    total += childProgress.total;
    solved += childProgress.solved;
  }

  const percentage =
    total === 0
      ? 0
      : Math.round((solved / total) * 100);

  return {
    total,
    solved,
    percentage,
  };
}