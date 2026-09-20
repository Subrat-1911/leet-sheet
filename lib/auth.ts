import { SignJWT, jwtVerify } from "jose";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error("AUTH_SECRET is not configured.");
}

const secret = new TextEncoder().encode(authSecret);

export async function createSession(username: string) {
  return new SignJWT({
    username,
  })
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("1d")
    .sign(secret);
}

export async function verifySession(token: string) {
  try {
    const { payload } = await jwtVerify(token, secret);

    if (typeof payload.username !== "string") {
      return null;
    }

    return {
      username: payload.username,
    };
  } catch {
    return null;
  }
}