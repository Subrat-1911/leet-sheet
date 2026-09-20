import { cookies } from "next/headers";

import { verifySession } from "@/lib/auth";
import { db } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Check admin session
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("admin_session")?.value;

    if (!sessionToken) {
      return Response.json(
        {
          success: false,
          error: "Unauthorized.",
        },
        { status: 401 }
      );
    }

    const session = await verifySession(sessionToken);

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

    const name = body.name;
    const slug = body.slug;
    const description = body.description;
    const parentId = body.parentId;

    // Validate name
    if (typeof name !== "string" || !name.trim()) {
      return Response.json(
        {
          success: false,
          error: "Section name is required.",
        },
        { status: 400 }
      );
    }

    // Validate slug
    if (typeof slug !== "string" || !slug.trim()) {
      return Response.json(
        {
          success: false,
          error: "Section slug is required.",
        },
        { status: 400 }
      );
    }

    const cleanName = name.trim();
    const cleanSlug = slug.trim().toLowerCase();

    // Check duplicate slug
    const existingSection = await db.orm.public.Section
      .where({
        slug: cleanSlug,
      })
      .first();

    if (existingSection) {
      return Response.json(
        {
          success: false,
          error: "A section with this slug already exists.",
        },
        { status: 409 }
      );
    }

    // Create section
    const section = await db.orm.public.Section.create({
      name: cleanName,
      slug: cleanSlug,
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      parentId:
        typeof parentId === "number"
          ? parentId
          : null,
    });

    return Response.json(
      {
        success: true,
        section,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create section error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to create section.",
      },
      { status: 500 }
    );
  }
}