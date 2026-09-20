import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check admin session
    const cookieStore = await cookies();

    const sessionToken =
      cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const session =
      await verifySession(sessionToken);

    if (!session) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    // Read request body
    const body = await request.json();

    const sectionId = body.sectionId;
    const title = body.title;
    const leetcodeUrl = body.leetcodeUrl;
    const difficulty = body.difficulty;

    // Validate section
    if (typeof sectionId !== "number") {
      return Response.json(
        {
          success: false,
          error: "Section is required.",
        },
        { status: 400 }
      );
    }

    // Validate title
    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return Response.json(
        {
          success: false,
          error: "Problem title is required.",
        },
        { status: 400 }
      );
    }

    // Validate URL
    if (
      typeof leetcodeUrl !== "string" ||
      !leetcodeUrl.trim()
    ) {
      return Response.json(
        {
          success: false,
          error: "LeetCode URL is required.",
        },
        { status: 400 }
      );
    }

    // Validate difficulty
    if (
      difficulty !== "Easy" &&
      difficulty !== "Medium" &&
      difficulty !== "Hard"
    ) {
      return Response.json(
        {
          success: false,
          error: "Invalid difficulty.",
        },
        { status: 400 }
      );
    }

    // Check section exists
    const section =
      await db.orm.public.Section
        .where({
          id: sectionId,
        })
        .first();

    if (!section) {
      return Response.json(
        {
          success: false,
          error: "Section not found.",
        },
        { status: 404 }
      );
    }

    const cleanTitle = title.trim();
    const cleanUrl = leetcodeUrl.trim();

    // Extract LeetCode slug from URL
    let leetcodeSlug: string | null = null;

    try {
      const parsedUrl = new URL(cleanUrl);

      const parts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      const problemsIndex =
        parts.findIndex(
          (part) =>
            part.toLowerCase() === "problems"
        );

      if (problemsIndex !== -1) {
        leetcodeSlug =
          parts[problemsIndex + 1] ?? null;
      }
    } catch {
      leetcodeSlug = null;
    }

    if (!leetcodeSlug) {
      return Response.json(
        {
          success: false,
          error: "Invalid LeetCode URL.",
        },
        { status: 400 }
      );
    }

    leetcodeSlug = leetcodeSlug
      .trim()
      .toLowerCase();

    // Check duplicate ONLY inside this section.
    //
    // The same LeetCode problem can therefore
    // exist in multiple different sections.
    const existingProblem =
      await db.orm.public.Problem
        .where({
          sectionId,
          leetcodeSlug,
        })
        .first();

    if (existingProblem) {
      return Response.json(
        {
          success: false,
          error:
            "This LeetCode problem already exists in this section.",
        },
        { status: 409 }
      );
    }

    // Create problem
    const problem =
      await db.orm.public.Problem.create({
        sectionId,
        title: cleanTitle,
        leetcodeSlug,
        leetcodeUrl: cleanUrl,
        difficulty,
      });

    return Response.json(
      {
        success: true,
        problem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "Create problem error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to create problem.",
      },
      { status: 500 }
    );
  }
}