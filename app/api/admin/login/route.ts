import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { db } from "@/lib/prisma";
import { createSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const username = body.username;
    const password = body.password;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username ||
      !password
    ) {
      return Response.json(
        {
          success: false,
          error: "Username and password are required.",
        },
        { status: 400 }
      );
    }

    const admin = await db.orm.public.AdminUser
      .where({ username })
      .first();

    if (!admin) {
      return Response.json(
        {
          success: false,
          error: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.passwordHash
    );

    if (!passwordMatches) {
      return Response.json(
        {
          success: false,
          error: "Invalid username or password.",
        },
        { status: 401 }
      );
    }

    const session = await createSession(admin.username);

    const cookieStore = await cookies();

    cookieStore.set("admin_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return Response.json({
      success: true,
      message: "Login successful.",
    });
  } catch (error) {
    console.error("Admin login error:", error);

    return Response.json(
      {
        success: false,
        error: "Something went wrong.",
      },
      { status: 500 }
    );
  }
}