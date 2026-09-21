import { db } from "@/lib/prisma";

export async function getSectionData(userId: number) {
  const [sections, problems, solvedProgress] =
    await Promise.all([
      db.orm.public.Section
        .where({
          active: true,
        })
        .all(),

      db.orm.public.Problem
        .where({
          active: true,
        })
        .all(),

      db.orm.public.UserProgress
        .where({
          userId,
          solved: true,
        })
        .all(),
    ]);

  const solvedProblemIds = new Set(
    solvedProgress.map(
      (progress) => progress.problemId
    )
  );

  const problemsBySection = new Map<
    number,
    typeof problems
  >();

  for (const problem of problems) {
    const sectionProblems =
      problemsBySection.get(problem.sectionId) ?? [];

    sectionProblems.push(problem);

    problemsBySection.set(
      problem.sectionId,
      sectionProblems
    );
  }

  const childrenByParent = new Map<
    number,
    typeof sections
  >();

  for (const section of sections) {
    if (section.parentId === null) {
      continue;
    }

    const children =
      childrenByParent.get(section.parentId) ?? [];

    children.push(section);

    childrenByParent.set(
      section.parentId,
      children
    );
  }

  const progressCache = new Map<
    number,
    {
      total: number;
      solved: number;
    }
  >();

  function calculateProgress(sectionId: number) {
    const cached =
      progressCache.get(sectionId);

    if (cached) {
      return cached;
    }

    const sectionProblems =
      problemsBySection.get(sectionId) ?? [];

    let total = sectionProblems.length;
    let solved = 0;

    for (const problem of sectionProblems) {
      if (solvedProblemIds.has(problem.id)) {
        solved++;
      }
    }

    const children =
      childrenByParent.get(sectionId) ?? [];

    for (const child of children) {
      const childProgress =
        calculateProgress(child.id);

      total += childProgress.total;
      solved += childProgress.solved;
    }

    const result = {
      total,
      solved,
    };

    progressCache.set(sectionId, result);

    return result;
  }

  function formatProgress(sectionId: number) {
    const result =
      calculateProgress(sectionId);

    const percentage =
      result.total === 0
        ? 0
        : Math.round(
            (result.solved / result.total) * 100
          );

    return {
      total: result.total,
      solved: result.solved,
      percentage,
    };
  }

  return {
    sections,
    problems,
    solvedProblemIds,
    childrenByParent,
    problemsBySection,
    getProgress: formatProgress,
  };
}