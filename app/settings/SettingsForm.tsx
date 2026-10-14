"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/app/actions/profile";

interface Props {
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
}

export function SettingsForm({ username, firstName, lastName, email }: Props) {
  const [state, action, pending] = useActionState(updateProfileAction, null);

  return (
    <form action={action} className="space-y-5">
      {state && "error" in state && (
        <p className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="text-sm text-[#7BE33B] bg-[#7BE33B]/10 border border-[#7BE33B]/20 rounded-lg px-4 py-3">
          {state.success}
        </p>
      )}

      {/* Email — read only, managed by Supabase Auth */}
      <div>
        <label className="block text-xs text-[#4a6899] uppercase tracking-widest mb-1.5">
          Email
        </label>
        <input
          type="email"
          value={email}
          readOnly
          className="w-full bg-[#060f2a]/60 border border-[#142655] rounded-lg px-4 py-2.5 text-sm text-[#4a6899] cursor-not-allowed"
        />
        <p className="mt-1 text-xs text-[#4a6899]">Email cannot be changed here.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label htmlFor="first-name" className="block text-xs text-[#4a6899] uppercase tracking-widest mb-1.5">
            First name
          </label>
          <input
            id="first-name"
            name="first-name"
            type="text"
            defaultValue={firstName ?? ""}
            placeholder="First name"
            className="w-full bg-[#060f2a]/60 border border-[#142655] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#2d4a7a] focus:outline-none focus:border-[#2457E6] transition-colors"
          />
        </div>
        <div>
          <label htmlFor="last-name" className="block text-xs text-[#4a6899] uppercase tracking-widest mb-1.5">
            Last name
          </label>
          <input
            id="last-name"
            name="last-name"
            type="text"
            defaultValue={lastName ?? ""}
            placeholder="Last name"
            className="w-full bg-[#060f2a]/60 border border-[#142655] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#2d4a7a] focus:outline-none focus:border-[#2457E6] transition-colors"
          />
        </div>
      </div>

      <div>
        <label htmlFor="username" className="block text-xs text-[#4a6899] uppercase tracking-widest mb-1.5">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          defaultValue={username}
          required
          minLength={3}
          pattern="[a-zA-Z0-9_]+"
          placeholder="username"
          className="w-full bg-[#060f2a]/60 border border-[#142655] rounded-lg px-4 py-2.5 text-sm text-white placeholder-[#2d4a7a] focus:outline-none focus:border-[#2457E6] transition-colors"
        />
        <p className="mt-1 text-xs text-[#4a6899]">Letters, numbers, and underscores only.</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-[#2457E6] hover:bg-[#3a6cf0] disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors shadow-[0_0_16px_rgba(36,87,230,0.25)]"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </form>
  );
}
