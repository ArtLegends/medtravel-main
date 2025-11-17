"use client";

import { useState } from "react";

export default function CustomerSettingsPage() {
  const [tab, setTab] = useState<"general"|"security">("general");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <div className="rounded-xl border bg-white">
        <div className="flex">
          <button
            onClick={() => setTab("general")}
            className={`w-1/2 px-4 py-2 border-b ${tab==="general" ? "font-semibold bg-gray-50" : "text-gray-600"}`}
          >
            General Settings
          </button>
          <button
            onClick={() => setTab("security")}
            className={`w-1/2 px-4 py-2 border-b ${tab==="security" ? "font-semibold bg-gray-50" : "text-gray-600"}`}
          >
            Security
          </button>
        </div>

        {tab === "general" && (
          <div className="p-6 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm text-gray-600">Main email</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Additional email <span className="text-gray-400">(optional)</span></label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm text-gray-600">Time zone</label>
              <input className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
          </div>
        )}

        {tab === "security" && (
          <div className="p-6 grid grid-cols-1 gap-4">
            <div>
              <label className="text-sm text-gray-600">New password</label>
              <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-600">Confirm password</label>
              <input type="password" className="mt-1 w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <button className="rounded-md bg-gray-900 text-white px-4 py-2">Update password</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
