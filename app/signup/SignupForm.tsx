"use client";

import { useActionState } from "react";
import { signupAction } from "@/app/actions/auth";

export function SignupForm() {
  const [state, action, pending] = useActionState(signupAction, null);

  return (
    <form action={action} className="flex flex-col gap-4">
      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="first-name" className="text-sm font-medium">
            First name
          </label>
          <input
            id="first-name"
            name="first-name"
            type="text"
            autoComplete="given-name"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="last-name" className="text-sm font-medium">
            Last name
          </label>
          <input
            id="last-name"
            name="last-name"
            type="text"
            autoComplete="family-name"
            className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="username" className="text-sm font-medium">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="confirm-password" className="text-sm font-medium">
          Confirm password
        </label>
        <input
          id="confirm-password"
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
