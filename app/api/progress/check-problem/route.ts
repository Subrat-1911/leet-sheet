import { db } from "@/lib/prisma";

const LEETCODE_API =
  "https://alfa-leetcode-api.onrender.com";

const API_TIMEOUT_MS = 8000;

type AcceptedSubmission = {
  titleSlug?: string;
  statusDisplay?: string;
  title?: string;
};

function normalizeSlug(slug: string) {
  return slug
    .trim()
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "");
}

function getSlugFromLeetCodeUrl(url: string) {
  try {
    const parsedUrl = new URL(url);

    const parts = parsedUrl.pathname
      .split("/")
      .filter(Boolean);

    const problemsIndex =
      parts.findIndex(
        (part) =>
          part.toLowerCase() === "problems"
      );

    if (problemsIndex === -1) {
      return null;
    }

    const slug =
      parts[problemsIndex + 1];

    if (!slug) {
      return null;
    }

    return normalizeSlug(slug);
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username =
      typeof body.username === "string"
        ? body.username.trim()
        : "";

    const problemId =
      typeof body.problemId === "number"
        ? body.problemId
        : null;

    if (!username || problemId === null) {
      return Response.json(
        {
          success: false,
          error:
            "Username and problemId are required.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 1. Find user and problem in parallel
    // -----------------------------------------

    const [existingUser, problem] =
      await Promise.all([
        db.orm.public.User
          .where({
            leetcodeUsername: username,
          })
          .first(),

        db.orm.public.Problem
          .where({
            id: problemId,
            active: true,
          })
          .first(),
      ]);

    // -----------------------------------------
    // 2. Validate problem
    // -----------------------------------------

    if (!problem) {
      return Response.json(
        {
          success: false,
          error: "Problem not found.",
        },
        { status: 404 }
      );
    }

    // -----------------------------------------
    // 3. Create user if needed
    // -----------------------------------------

    const user =
      existingUser ??
      (await db.orm.public.User.create({
        leetcodeUsername: username,
      }));

    // -----------------------------------------
    // 4. Check our DB FIRST
    // -----------------------------------------

    const existingProgress =
      await db.orm.public.UserProgress
        .where({
          userId: user.id,
          problemId: problem.id,
        })
        .first();

    // -----------------------------------------
    // 5. Already solved = NEVER call API
    // -----------------------------------------

    if (existingProgress?.solved) {
      return Response.json({
        success: true,
        solved: true,
        alreadySolved: true,
      });
    }

    // -----------------------------------------
    // 6. Get target LeetCode slug
    // -----------------------------------------

    const slugFromUrl =
      getSlugFromLeetCodeUrl(
        problem.leetcodeUrl
      );

    const slugFromDatabase =
      normalizeSlug(
        problem.leetcodeSlug
      );

    const targetSlugs = new Set<string>();

    if (slugFromUrl) {
      targetSlugs.add(slugFromUrl);
    }

    if (slugFromDatabase) {
      targetSlugs.add(slugFromDatabase);
    }

    if (targetSlugs.size === 0) {
      return Response.json(
        {
          success: false,
          error:
            "Could not determine LeetCode problem slug.",
        },
        { status: 400 }
      );
    }

    // -----------------------------------------
    // 7. Fetch accepted submissions
    // -----------------------------------------

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
        console.error(
          "LeetCode API request timed out."
        );

        return Response.json(
          {
            success: false,
            error:
              "LeetCode API took too long to respond. Please try again.",
          },
          { status: 504 }
        );
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }

    if (!response.ok) {
      console.error(
        "LeetCode API error:",
        response.status
      );

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

    // -----------------------------------------
    // 8. Check ONLY this problem
    // -----------------------------------------

    const solvedOnLeetCode =
      submissions.some((submission) => {
        if (
          submission.statusDisplay !==
          "Accepted"
        ) {
          return false;
        }

        if (
          typeof submission.titleSlug !==
          "string"
        ) {
          return false;
        }

        const submissionSlug =
          normalizeSlug(
            submission.titleSlug
          );

        return targetSlugs.has(
          submissionSlug
        );
      });

    // -----------------------------------------
    // 9. Not solved yet
    // -----------------------------------------

    if (!solvedOnLeetCode) {
      return Response.json({
        success: true,
        solved: false,
        alreadySolved: false,
      });
    }

    // -----------------------------------------
    // 10. Permanently mark as solved
    // -----------------------------------------

    if (existingProgress) {
      await db.orm.public.UserProgress
        .where({
          userId: user.id,
          problemId: problem.id,
        })
        .update({
          solved: true,
        });
    } else {
      await db.orm.public.UserProgress.create({
        userId: user.id,
        problemId: problem.id,
        solved: true,
      });
    }

    // -----------------------------------------
    // 11. Success
    // -----------------------------------------

    return Response.json({
      success: true,
      solved: true,
      alreadySolved: false,
    });
  } catch (error) {
    console.error(
      "Problem check error:",
      error
    );

    return Response.json(
      {
        success: false,
        error:
          "Failed to check problem status.",
      },
      { status: 500 }
    );
  }
}