"use client";
import { SpinningBall } from "../components/SpinningBall";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";

const inputClass = "bg-[#060f2a] border border-[#142655] rounded-lg px-3 py-2.5 text-sm text-white placeholder-[#4a6899] focus:outline-none focus:border-[#2a4a8a] transition-colors w-full";
const labelClass = "text-xs font-medium text-[#9fb0da] uppercase tracking-wider";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="first-name" className={labelClass}>First name</label>
          <input id="first-name" name="first-name" type="text" autoComplete="given-name" className={inputClass} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="last-name" className={labelClass}>Last name</label>
          <input id="last-name" name="last-name" type="text" autoComplete="family-name" className={inputClass} />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="username" className={labelClass}>Username</label>
        <input id="username" name="username" type="text" autoComplete="username" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClass}>Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClass}>Password</label>
        <input id="password" name="password" type="password" autoComplete="new-password" required className={inputClass} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="confirm-password" className={labelClass}>Confirm password</label>
        <input id="confirm-password" name="confirm-password" type="password" autoComplete="new-password" required className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-[#2457E6] hover:bg-[#3a6cf0] text-white py-2.5 rounded-lg text-sm font-medium tracking-wide transition-colors disabled:opacity-50 shadow-[0_0_16px_rgba(36,87,230,0.2)] mt-1"
      >
        {pending ? <span className="inline-flex items-center justify-center gap-2"><SpinningBall size={18} />Creating account…</span> : "Create account"}
      </button>
    </form>
  );
}
