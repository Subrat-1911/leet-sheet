import { db } from "@/lib/prisma";

const LEETCODE_API =
  "https://alfa-leetcode-api.onrender.com";

const API_TIMEOUT_MS = 8000;

type AcceptedSubmission = {
  titleSlug?: string;
  statusDisplay?: string;
};

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

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
          error:
            "LeetCode username is required.",
        },
        { status: 400 }
      );
    }

    /*
     * 1. Find or create user
     */
    let user =
      await db.orm.public.User
        .where({
          leetcodeUsername: username,
        })
        .first();

    if (!user) {
      user =
        await db.orm.public.User.create({
          leetcodeUsername: username,
        });
    }

    /*
     * 2. Fetch accepted LeetCode submissions
     */
    const apiUrl =
      `${LEETCODE_API}/${encodeURIComponent(
        username
      )}/acSubmission?limit=20`;

    const controller =
      new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, API_TIMEOUT_MS);

    let response: Response;

    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
        signal: controller.signal,
      });
    } catch (error) {
      if (
        error instanceof Error &&
        error.name === "AbortError"
      ) {
        return Response.json(
          {
            success: false,
            error:
              "LeetCode API took too long to respond.",
          },
          { status: 504 }
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      return Response.json(
        {
          success: false,
          error:
            "Could not fetch LeetCode submissions.",
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
     * 3. Extract accepted problem slugs
     */
    const solvedSlugs = new Set<string>();

    for (const submission of submissions) {
      if (
        submission.statusDisplay !==
        "Accepted"
      ) {
        continue;
      }

      if (
        typeof submission.titleSlug !==
        "string"
      ) {
        continue;
      }

      solvedSlugs.add(
        normalizeSlug(
          submission.titleSlug
        )
      );
    }

    if (solvedSlugs.size === 0) {
      return Response.json({
        success: true,
        username,
        checkedSubmissions:
          submissions.length,
        newlySolved: 0,
      });
    }

    /*
     * 4. Load all active tracker problems
     */
    const problems =
      await db.orm.public.Problem
        .where({
          active: true,
        })
        .all();

    /*
     * 5. Load user's progress ONCE
     *
     * This avoids one DB query per problem.
     */
    const existingProgress =
      await db.orm.public.UserProgress
        .where({
          userId: user.id,
        })
        .all();

    const progressByProblemId =
      new Map(
        existingProgress.map(
          (progress) => [
            progress.problemId,
            progress,
          ]
        )
      );

    let newlySolved = 0;

    /*
     * 6. Match LeetCode accepted problems
     *    against tracker problems.
     *
     *    IMPORTANT:
     *
     *    false → true
     *
     *    true → true
     *
     *    NEVER:
     *
     *    true → false
     */
    for (const problem of problems) {
      const problemSlug =
        normalizeSlug(
          problem.leetcodeSlug
        );

      if (
        !solvedSlugs.has(problemSlug)
      ) {
        continue;
      }

      const existing =
        progressByProblemId.get(
          problem.id
        );

      if (existing) {
        if (existing.solved) {
          continue;
        }

        await db.orm.public.UserProgress
          .where({
            userId: user.id,
            problemId: problem.id,
          })
          .update({
            solved: true,
          });

        newlySolved++;

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
      checkedSubmissions:
        submissions.length,
      acceptedProblems:
        solvedSlugs.size,
      newlySolved,
    });
  } catch (error) {
    console.error(
      "Progress sync error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to sync LeetCode progress.",
      },
      { status: 500 }
    );
  }
}