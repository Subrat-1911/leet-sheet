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

    const { id } = await params;
    const sectionId = Number(id);

    if (!Number.isInteger(sectionId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid section ID.",
        },
        { status: 400 }
      );
    }

    const body = await request.json();

    const name = body.name;
    const slug = body.slug;

    if (typeof name !== "string" || !name.trim()) {
      return Response.json(
        {
          success: false,
          error: "Section name is required.",
        },
        { status: 400 }
      );
    }

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

    // Check current section
    const section = await db.orm.public.Section
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

    // Check slug collision with another section
    const duplicateSection = await db.orm.public.Section
      .where({
        slug: cleanSlug,
      })
      .first();

    if (
      duplicateSection &&
      duplicateSection.id !== sectionId
    ) {
      return Response.json(
        {
          success: false,
          error: "A section with this slug already exists.",
        },
        { status: 409 }
      );
    }

    const updatedSection = await db.orm.public.Section
      .where({
        id: sectionId,
      })
      .update({
        name: cleanName,
        slug: cleanSlug,
      });

    return Response.json({
      success: true,
      section: updatedSection,
    });
  } catch (error) {
    console.error("Update section error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to update section.",
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

    const { id } = await params;
    const sectionId = Number(id);

    if (!Number.isInteger(sectionId)) {
      return Response.json(
        {
          success: false,
          error: "Invalid section ID.",
        },
        { status: 400 }
      );
    }

    // Check section
    const section = await db.orm.public.Section
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

    // Check child sections
    const childSections = await db.orm.public.Section
      .where({
        parentId: sectionId,
      })
      .all();

    if (childSections.length > 0) {
      return Response.json(
        {
          success: false,
          error:
            "Cannot delete this section because it contains child sections. Delete them first.",
        },
        { status: 409 }
      );
    }

    // Check problems
    const problems = await db.orm.public.Problem
      .where({
        sectionId,
      })
      .all();

    if (problems.length > 0) {
      return Response.json(
        {
          success: false,
          error:
            "Cannot delete this section because it contains problems. Delete them first.",
        },
        { status: 409 }
      );
    }

    // Delete section
    await db.orm.public.Section
      .where({
        id: sectionId,
      })
      .delete();

    return Response.json({
      success: true,
      message: "Section deleted successfully.",
    });
  } catch (error) {
    console.error("Delete section error:", error);

    return Response.json(
      {
        success: false,
        error: "Failed to delete section.",
      },
      { status: 500 }
    );
  }
}