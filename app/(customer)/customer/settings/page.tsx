export const metadata = { title: 'Customer • Settings' };

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-sm text-gray-500">Customer Panel</div>
        <h1 className="text-2xl font-semibold">Settings</h1>
      </header>

      {/* Tabs-мокап */}
      <div className="rounded-lg border bg-gray-50 p-2">
        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-md bg-white px-3 py-2 text-left text-sm">
            ⚙ General Settings
          </button>
          <button className="rounded-md bg-white px-3 py-2 text-left text-sm">
            🔒 Security
          </button>
        </div>
      </div>

      {/* Security card */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Change Password</h2>
        <p className="mb-6 text-sm text-gray-600">
          Update your account password for security
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Current Password
            </label>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter current password"
              type="password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">
              New Password
            </label>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Enter new password (min 8 characters)"
              type="password"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm text-gray-700">
              Confirm New Password
            </label>
            <input
              className="w-full rounded-md border px-3 py-2"
              placeholder="Confirm new password"
              type="password"
            />
          </div>

          <button className="mt-2 rounded-md bg-blue-600 px-4 py-2 text-white">
            Change Password
          </button>
        </div>
      </div>
    </div>
  );
}
