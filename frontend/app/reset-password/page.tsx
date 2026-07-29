"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { API } from "../lib/api";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();

  const token = params.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    const res = await fetch(`${API}/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Password changed successfully.");
      router.push("/login");
    } else {
      alert(data.message);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100">

      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow">

        <h1 className="mb-6 text-3xl font-bold">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            type="password"
            placeholder="New password"
            className="w-full rounded border p-3"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm password"
            className="w-full rounded border p-3"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button className="w-full rounded bg-black p-3 text-white">
            Change password
          </button>

        </form>

      </div>

    </main>
  );
}