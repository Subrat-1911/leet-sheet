import { db } from "@/lib/prisma";

export async function GET() {
  try {
    const sections = await db.orm.public.Section.all();

    return Response.json({
      success: true,
      sections,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}