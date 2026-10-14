"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/actions/auth";

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-medium text-[#7a9cc0] uppercase tracking-wider">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="bg-[#060d1a] border border-[#1a2d4a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a5a7a] focus:outline-none focus:border-[#2a4a7a] transition-colors"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-medium text-[#7a9cc0] uppercase tracking-wider">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="bg-[#060d1a] border border-[#1a2d4a] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#3a5a7a] focus:outline-none focus:border-[#2a4a7a] transition-colors"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 hover:bg-blue-500 text-white py-2.5 rounded-lg text-sm font-medium tracking-wide transition-colors disabled:opacity-50 shadow-[0_0_16px_rgba(59,130,246,0.2)] mt-1"
      >
        {pending ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
