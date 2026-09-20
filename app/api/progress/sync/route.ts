import { db } from "@/lib/prisma";

const LEETCODE_API =
  "https://alfa-leetcode-api.onrender.com";

type AcceptedSubmission = {
  titleSlug?: string;
  statusDisplay?: string;
};

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    if (!username) {
      return Response.json(
        {
          success: false,
          error: "LeetCode username is required.",
        },
        { status: 400 }
      );
    }

    /*
     * Find or create the user in our database.
     */
    let user = await db.orm.public.User
      .where({
        leetcodeUsername: username,
      })
      .first();

    if (!user) {
      user = await db.orm.public.User.create({
        leetcodeUsername: username,
      });
    }

    /*
     * Fetch accepted LeetCode submissions.
     *
     * This endpoint currently returns the latest
     * accepted submissions exposed by the API.
     */
    const response = await fetch(
      `${LEETCODE_API}/${encodeURIComponent(
        username
      )}/acSubmission`,
      {
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error: "Could not fetch LeetCode submissions.",
        },
        { status: 502 }
      );
    }

    const data = await response.json();

    const submissions: AcceptedSubmission[] =
      Array.isArray(data?.submission)
        ? data.submission
        : [];

    /*
     * Only accepted submissions count as solved.
     */
    const solvedSlugs = new Set(
      submissions
        .filter(
          (submission) =>
            submission.statusDisplay === "Accepted"
        )
        .map((submission) => submission.titleSlug)
        .filter(
          (slug): slug is string =>
            typeof slug === "string" &&
            slug.length > 0
        )
    );

    /*
     * Get all problems currently created
     * in our tracker.
     */
    const problems = await db.orm.public.Problem
      .where({
        active: true,
      })
      .all();

    let newlySolved = 0;

    /*
     * IMPORTANT:
     *
     * We ONLY move:
     *
     * false → true
     *
     * We NEVER move:
     *
     * true → false
     *
     * Therefore, once a problem becomes green,
     * it stays green permanently.
     */
    for (const problem of problems) {
      if (!solvedSlugs.has(problem.leetcodeSlug)) {
        continue;
      }

      const existing =
        await db.orm.public.UserProgress
          .where({
            userId: user.id,
            problemId: problem.id,
          })
          .first();

      if (existing) {
        if (!existing.solved) {
          await db.orm.public.UserProgress
            .where({
              userId: user.id,
              problemId: problem.id,
            })
            .update({
              solved: true,
            });

          newlySolved++;
        }

        continue;
      }

      await db.orm.public.UserProgress.create({
        userId: user.id,
        problemId: problem.id,
        solved: true,
      });

      newlySolved++;
    }

    return Response.json({
      success: true,
      username,
      checkedSubmissions: submissions.length,
      newlySolved,
    });
  } catch (error) {
    console.error("Progress sync error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to sync LeetCode progress.",
      },
      { status: 500 }
    );
  }
}