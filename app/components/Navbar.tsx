import Link from "next/link";

export function Navbar() {
  return (
    <nav className="border-b border-gray-800 px-6 py-4">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <Link href="/" className="text-xl font-bold tracking-tight hover:text-gray-300 transition-colors">
          Predibol
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/predictions"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Matches
          </Link>
          <Link
            href="/standings"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Standings
          </Link>
          <Link
            href="/#coming-soon"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Coming Soon
          </Link>
          <Link
            href="/login"
            className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            Log in
          </Link>
        </div>
      </div>
    </nav>
  );
}
