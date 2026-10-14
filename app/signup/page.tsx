import { SignupForm } from "./SignupForm";

export default function SignupPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-1">Create an account</h1>
        <p className="text-[#4a6899] mb-8 text-sm">
          Sign up to track UCL predictions.
        </p>
        <SignupForm />
        <p className="mt-6 text-center text-sm text-[#4a6899]">
          Already have an account?{" "}
          <a href="/login" className="text-[#4FA3F7] hover:underline">
            Log in
          </a>
        </p>
      </div>
    </main>
  );
}
