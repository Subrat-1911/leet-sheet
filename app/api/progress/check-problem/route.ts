import { db } from "@/lib/prisma";

const LEETCODE_API =
  "https://alfa-leetcode-api.onrender.com";

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
        (part) => part.toLowerCase() === "problems"
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
    // 1. Find or create user
    // -----------------------------------------

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

    // -----------------------------------------
    // 2. Find problem
    // -----------------------------------------

    const problem = await db.orm.public.Problem
      .where({
        id: problemId,
        active: true,
      })
      .first();

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
    // 3. Check our DB first
    // -----------------------------------------

    const existingProgress =
      await db.orm.public.UserProgress
        .where({
          userId: user.id,
          problemId: problem.id,
        })
        .first();

    // Once solved, it stays solved forever.
    if (existingProgress?.solved) {
      return Response.json({
        success: true,
        solved: true,
        alreadySolved: true,
      });
    }

    // -----------------------------------------
    // 4. Get the actual LeetCode slug
    //    directly from the stored URL
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

    // -----------------------------------------
    // 5. Fetch accepted submissions
    // -----------------------------------------

    const apiUrl =
      `${LEETCODE_API}/${encodeURIComponent(
        username
      )}/acSubmission?limit=20&t=${Date.now()}`;

    const response = await fetch(apiUrl, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

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
    // 6. Check ONLY this problem
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
    // 7. Not solved yet
    // -----------------------------------------

    if (!solvedOnLeetCode) {
      return Response.json({
        success: true,
        solved: false,
        alreadySolved: false,
      });
    }

    // -----------------------------------------
    // 8. Permanently mark solved
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
    // 9. Success
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