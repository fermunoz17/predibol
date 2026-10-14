import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-[#142655] bg-[#04091e]/95 backdrop-blur-sm sticky top-0 z-50 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-base font-bold tracking-[0.15em] uppercase text-white group-hover:text-slate-200 transition-colors">
            Predibol
          </span>
        </Link>

        <div className="flex items-center gap-6">
          <Link href="/predictions" className="text-sm text-[#6a90cc] hover:text-[#45bfff] transition-colors tracking-wide">
            Matches
          </Link>
          <Link href="/standings" className="text-sm text-[#6a90cc] hover:text-[#45bfff] transition-colors tracking-wide">
            Standings
          </Link>
          <Link href="/login" className="text-sm text-[#6a90cc] hover:text-[#45bfff] transition-colors tracking-wide">
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-1.5 rounded-lg transition-colors shadow-[0_0_16px_rgba(59,130,246,0.25)]"
          >
            Sign up
          </Link>
        </div>
      </div>
    </nav>
  );
}
