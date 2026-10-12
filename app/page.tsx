import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-5xl font-bold tracking-tight">Predibol</h1>
      <p className="text-lg text-gray-500 max-w-md">
        Machine learning predictions for UEFA Champions League matches.
      </p>
      <Link
        href="/login"
        className="mt-4 bg-blue-600 text-white px-8 py-3 rounded-lg text-base font-medium hover:bg-blue-700 transition-colors"
      >
        Log in
      </Link>
    </main>
  );
}
