import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { UserSession } from "./types";

const JWT_SECRET = process.env.JWT_SECRET || "ai-startup-analyzer-secret-key-2026";
const COOKIE_NAME = "ai_startup_session";

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export function createToken(payload: UserSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): UserSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserSession;
  } catch {
    return null;
  }
}

export async function setSessionCookie(user: UserSession) {
  const token = createToken({ id: user.id, email: user.email, name: user.name });
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  cookieStore.delete(COOKIE_NAME);
}

export async function getCurrentUser(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = verifyToken(token);
  if (!session) return null;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function getOrCreateDemoUser(): Promise<UserSession> {
  const demoEmail = "demo@startupanalyzer.ai";
  let user = await prisma.user.findUnique({
    where: { email: demoEmail },
  });

  if (!user) {
    const hashedPassword = await hashPassword("demo123456");
    user = await prisma.user.create({
      data: {
        email: demoEmail,
        name: "Alex Founder",
        password: hashedPassword,
      },
    });
  }

  const sessionUser = { id: user.id, email: user.email, name: user.name };
  await setSessionCookie(sessionUser);
  return sessionUser;
}
