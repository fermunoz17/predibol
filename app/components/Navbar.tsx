import Link from "next/link";
import { NavLogo } from "./NavLogo";
import { UserMenu } from "./UserMenu";
import { createClient } from "@/lib/supabase-server";
import { prisma } from "@/lib/prisma";

export async function Navbar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let dbUser: { username: string; firstName: string | null } | null = null;
  if (user) {
    dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { username: true, firstName: true },
    });
  }

  const initials = dbUser?.firstName
    ? dbUser.firstName[0].toUpperCase()
    : dbUser?.username
      ? dbUser.username[0].toUpperCase()
      : "?";

  return (
    <nav className="border-b border-[#142655] bg-[#04091e]/95 backdrop-blur-sm sticky top-0 z-50 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center" aria-label="Predibol home">
          <NavLogo height={30} />
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/predictions" className="text-sm text-[#9fb0da] hover:text-[#7BE33B] transition-colors tracking-wide">
            Matches
          </Link>
          <Link href="/standings" className="text-sm text-[#9fb0da] hover:text-[#7BE33B] transition-colors tracking-wide">
            Standings
          </Link>

          {user && dbUser ? (
            <UserMenu username={dbUser.username} initials={initials} />
          ) : (
            <>
              <Link href="/login" className="text-sm text-[#9fb0da] hover:text-[#7BE33B] transition-colors tracking-wide">
                Log in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-[#2457E6] hover:bg-[#3a6cf0] text-white px-4 py-1.5 rounded-lg transition-colors shadow-[0_0_16px_rgba(36,87,230,0.25)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
