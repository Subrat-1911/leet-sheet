import { db } from "@/lib/prisma";

export async function getSectionProgress(
  sectionId: number,
  userId: number
) {
  // Load the complete section tree in one query.
  const allSections =
    await db.orm.public.Section
      .where({
        active: true,
      })
      .all();

  // Load all active problems in one query.
  const allProblems =
    await db.orm.public.Problem
      .where({
        active: true,
      })
      .all();

  // Load this user's solved problems in one query.
  const solvedProgress =
    await db.orm.public.UserProgress
      .where({
        userId,
        solved: true,
      })
      .all();

  const solvedProblemIds = new Set(
    solvedProgress.map(
      (progress) => progress.problemId
    )
  );

  // Build section -> child sections map.
  const childrenByParent = new Map<
    number,
    typeof allSections
  >();

  for (const section of allSections) {
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

  // Build section -> problems map.
  const problemsBySection = new Map<
    number,
    typeof allProblems
  >();

  for (const problem of allProblems) {
    const problems =
      problemsBySection.get(problem.sectionId) ?? [];

    problems.push(problem);
    problemsBySection.set(
      problem.sectionId,
      problems
    );
  }

  // Calculate the complete subtree in memory.
  function calculate(sectionId: number) {
    const problems =
      problemsBySection.get(sectionId) ?? [];

    let total = problems.length;
    let solved = 0;

    for (const problem of problems) {
      if (solvedProblemIds.has(problem.id)) {
        solved++;
      }
    }

    const children =
      childrenByParent.get(sectionId) ?? [];

    for (const child of children) {
      const childProgress =
        calculate(child.id);

      total += childProgress.total;
      solved += childProgress.solved;
    }

    return {
      total,
      solved,
    };
  }

  const result = calculate(sectionId);

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