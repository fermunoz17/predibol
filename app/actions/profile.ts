"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export type ProfileState = { error: string } | { success: string } | null;

export async function updateProfileAction(
  _prevState: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" };

  const username = (formData.get("username") as string).trim();
  const firstName = (formData.get("first-name") as string).trim();
  const lastName = (formData.get("last-name") as string).trim();

  if (!username) return { error: "Username is required" };
  if (username.length < 3) return { error: "Username must be at least 3 characters" };
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return { error: "Username can only contain letters, numbers, and underscores" };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
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
      return { error: "That username is already taken" };
    }
    return { error: "Failed to save changes — please try again" };
  }

  revalidatePath("/settings");
  revalidatePath("/", "layout"); // refreshes the navbar
  return { success: "Profile updated" };
}
