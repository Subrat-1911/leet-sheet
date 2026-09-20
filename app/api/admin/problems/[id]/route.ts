import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";

type RouteProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteProps
) {
  try {
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

    const { id } = await params;
    const problemId = Number(id);

    if (!Number.isInteger(problemId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid problem ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const title = body.title;
    const leetcodeUrl = body.leetcodeUrl;
    const difficulty = body.difficulty;

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

    const problem =
      await db.orm.public.Problem
        .where({
          id: problemId,
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

    const cleanTitle = title.trim();
    const cleanUrl = leetcodeUrl.trim();

    const leetcodeSlug = cleanUrl
      .replace(/\/+$/, "")
      .split("/")
      .filter(Boolean)
      .pop();

    if (!leetcodeSlug) {
      return Response.json(
        {
          success: false,
          error: "Invalid LeetCode URL.",
        },
        { status: 400 }
      );
    }

    const duplicateProblem =
      await db.orm.public.Problem
        .where({
          leetcodeSlug,
        })
        .first();

    if (
      duplicateProblem &&
      duplicateProblem.id !== problemId
    ) {
      return Response.json(
        {
          success: false,
          error:
            "This LeetCode problem already exists.",
        },
        { status: 409 }
      );
    }

    const updatedProblem =
      await db.orm.public.Problem
        .where({
          id: problemId,
        })
        .update({
          title: cleanTitle,
          leetcodeSlug,
          leetcodeUrl: cleanUrl,
          difficulty,
        });

    return Response.json({
      success: true,
      problem: updatedProblem,
    });
  } catch (error) {
    console.error(
      "Update problem error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to update problem.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteProps
) {
  try {
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

    const { id } = await params;
    const problemId = Number(id);

    if (!Number.isInteger(problemId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid problem ID.",
        },
        { status: 400 }
      );
    }

    const problem =
      await db.orm.public.Problem
        .where({
          id: problemId,
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

    // Delete all progress records referencing this problem first.
    await db.orm.public.UserProgress
      .where({
        problemId,
      })
      .delete();

    // Now delete the problem itself.
    await db.orm.public.Problem
      .where({
        id: problemId,
      })
      .delete();

    return Response.json({
      success: true,
      message:
        "Problem deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete problem error:",
      error
    );

    return Response.json(
      {
        success: false,
        error: "Failed to delete problem.",
      },
      { status: 500 }
    );
  }
}