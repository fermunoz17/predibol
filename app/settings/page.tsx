import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";
import { SettingsForm } from "./SettingsForm";

export const metadata = { title: "Profile settings — Predibol" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { username: true, firstName: true, lastName: true, email: true, createdAt: true },
  });

  if (!dbUser) redirect("/login");

  return (
    <main className="min-h-screen bg-[#04091e] py-16 px-4">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="w-14 h-14 rounded-full bg-[#2457E6] flex items-center justify-center text-white text-xl font-bold mb-4 shadow-[0_0_24px_rgba(36,87,230,0.3)]">
            {dbUser.firstName?.[0]?.toUpperCase() ?? dbUser.username[0].toUpperCase()}
          </div>
          <h1 className="text-2xl font-bold text-white">Profile settings</h1>
          <p className="text-sm text-[#4a6899] mt-1">
            Member since{" "}
            {dbUser.createdAt.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        {/* Form card */}
        <div className="border border-[#142655] rounded-2xl bg-[#060f2a]/40 p-6">
          <SettingsForm
            username={dbUser.username}
            firstName={dbUser.firstName}
            lastName={dbUser.lastName}
            email={dbUser.email}
          />
        </div>

      </div>
    </main>
  );
}
