"use client";

import { useState } from "react";
import { api } from "../lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const res = await fetch(`${api}/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setMessage(data.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg">

        <h1 className="mb-2 text-3xl font-bold">
          Forgot Password
        </h1>

        <p className="mb-6 text-gray-500">
          Enter your email address to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit}>

          <input
            type="email"
            placeholder="Email"
            className="mb-4 w-full rounded-lg border p-3"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button
            className="w-full rounded-lg bg-black p-3 text-white hover:bg-gray-800"
          >
            Send reset link
          </button>

        </form>

        {message && (
          <p className="mt-4 text-center text-green-600">
            {message}
          </p>
        )}

      </div>
    </main>
  );
}