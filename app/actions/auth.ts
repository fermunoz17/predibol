"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type AuthState = { error: string } | null;

export async function loginAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: error.message };

  redirect("/predictions");
}

export async function signupAction(
  _prevState: AuthState,
  formData: FormData
): Promise<AuthState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirm-password") as string;
  const username = (formData.get("username") as string).trim();
  const firstName = (formData.get("first-name") as string).trim();
  const lastName = (formData.get("last-name") as string).trim();

  if (password !== confirmPassword) return { error: "Passwords do not match" };
  if (!username) return { error: "Username is required" };

  // Check username availability before creating the auth user to avoid orphaned accounts.
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Username is already taken" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) return { error: error.message };
  if (!data.user) return { error: "Sign up failed — please try again" };

  try {
    await prisma.user.create({
      data: {
        id: data.user.id,
        email,
        username,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return { error: "Username is already taken" };
    }
    return { error: "Failed to create profile — please contact support" };
  }

  redirect("/predictions");
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
