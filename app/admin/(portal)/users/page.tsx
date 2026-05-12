"use client";

import { useEffect, useState } from "react";
import {
  subscribeAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
  ADMIN_ROLES,
  type AdminUser,
  type SectionKey,
  type Permission,
  type SectionPerms,
} from "@/lib/db";

// ── constants ────────────────────────────────────────────────────────────────

const ROLES = Object.keys(ADMIN_ROLES);
const PERMS: Permission[] = ["read", "write", "delete"];

const SECTIONS: { key: SectionKey; label: string; icon: string }[] = [
  { key: "dashboard", label: "Dashboard", icon: "⊞" },
  { key: "prayerTimes", label: "Prayer Times", icon: "🕐" },
  { key: "events", label: "Events", icon: "📅" },
  { key: "donations", label: "Donations", icon: "৳" },
  { key: "community", label: "Community", icon: "👥" },
  { key: "users", label: "Users", icon: "🔑" },
];

const PERM_COLORS: Record<Permission, string> = {
  read: "bg-blue-100 text-blue-700",
  write: "bg-amber-100 text-amber-700",
  delete: "bg-red-100 text-red-600",
};

const ROLE_COLORS: Record<string, string> = {
  "Super Admin": "bg-purple-100 text-purple-700",
  Admin: "bg-indigo-100 text-indigo-700",
  "Prayer Manager": "bg-emerald-100 text-emerald-700",
  "Event Manager": "bg-orange-100 text-orange-700",
  "Finance Manager": "bg-blue-100 text-blue-700",
  Viewer: "bg-gray-100 text-gray-600",
};

function emptyPerms(): SectionPerms {
  return SECTIONS.reduce((acc, section) => {
    acc[section.key as keyof SectionPerms] = [];
    return acc;
  }, {} as SectionPerms);
}

type AdminUserForm = {
  name: string;
  email: string;
  password: string;
  role: string;
  status: "Active" | "Inactive";
  permissions: SectionPerms;
};

const blankForm: AdminUserForm = {
  name: "",
  email: "",
  password: "",
  role: ROLES[0],
  status: "Active",
  permissions: ADMIN_ROLES[ROLES[0]],
};

// ── Permission matrix sub-component ─────────────────────────────────────────

function PermMatrix({
  permissions,
  onChange,
}: {
  permissions: SectionPerms;
  onChange: (p: SectionPerms) => void;
}) {
  function toggle(key: SectionKey, perm: Permission) {
    const current = permissions[key] ?? [];
    const next = current.includes(perm)
      ? current.filter((p) => p !== perm)
      : [...current, perm];
    onChange({ ...permissions, [key]: next });
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Section
            </th>
            {PERMS.map((p) => (
              <th
                key={p}
                className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20"
              >
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {SECTIONS.map((s) => {
            const granted = permissions[s.key] ?? [];
            return (
              <tr key={s.key} className="hover:bg-gray-50/60">
                <td className="px-4 py-2.5">
                  <span className="text-sm text-gray-700 font-medium">
                    {s.label}
                  </span>
                </td>
                {PERMS.map((perm) => {
                  const checked = granted.includes(perm);
                  return (
                    <td key={perm} className="text-center px-3 py-2.5">
                      <label className="inline-flex items-center justify-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(s.key, perm)}
                          className="w-4 h-4 rounded accent-emerald-primary cursor-pointer"
                        />
                      </label>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Permission summary badges ─────────────────────────────────────────────────

function PermSummary({ permissions }: { permissions: SectionPerms }) {
  const granted = SECTIONS.filter((s) => (permissions[s.key] ?? []).length > 0);
  if (granted.length === 0)
    return <span className="text-xs text-gray-400">No access</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {granted.map((s) => (
        <span
          key={s.key}
          className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium"
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function UsersAdmin() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [viewPerms, setViewPerms] = useState<AdminUser | null>(null);

  useEffect(() => {
    const unsub = subscribeAdminUsers((rows) => {
      setUsers(rows);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blankForm);
    setSaveError("");
    setShowForm(true);
  }

  function openEdit(u: AdminUser) {
    setEditing(u);
    setForm({
      name: u.name,
      email: u.email,
      password: "",
      role: u.role,
      status: u.status,
      permissions: u.permissions ?? ADMIN_ROLES[u.role] ?? emptyPerms(),
    });
    setSaveError("");
    setShowForm(true);
  }

  function handleRoleChange(role: string) {
    setForm((f) => ({
      ...f,
      role,
      permissions: ADMIN_ROLES[role] ?? emptyPerms(),
    }));
  }

  async function handleSave() {
    if (!form.name || !form.email) return;
    setSaving(true);
    setSaveError("");
    try {
      if (editing?.id) {
        const { password, ...rest } = form;
        await updateAdminUser(editing.id, rest);
      } else {
        if (!form.password || form.password.length < 6) {
          setSaveError("Password must be at least 6 characters.");
          setSaving(false);
          return;
        }
        await createAdminUser(form);
      }
      setShowForm(false);
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? "";
      if (code === "auth/email-already-in-use")
        setSaveError("This email is already registered in Firebase Auth.");
      else if (code === "auth/invalid-email")
        setSaveError("Invalid email address.");
      else setSaveError(`Error: ${code || "unknown"}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u: AdminUser) {
    if (
      !confirm(
        `Remove ${u.name} from admin users? Their Firebase Auth account remains active.`,
      )
    )
      return;
    if (u.id) await deleteAdminUser(u.id);
  }

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage admin accounts and their section permissions.
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-emerald-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: users.length },
          {
            label: "Active",
            value: users.filter((u) => u.status === "Active").length,
          },
          {
            label: "Super Admins",
            value: users.filter((u) => u.role === "Super Admin").length,
          },
          {
            label: "Viewers",
            value: users.filter((u) => u.role === "Viewer").length,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-gray-100 p-4 text-center"
          >
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-50">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...ROLES].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r
                  ? "bg-emerald-primary text-white"
                  : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-emerald-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    User
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Role
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Section Access
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {u.name}
                          </div>
                          <div className="text-xs text-gray-400">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ROLE_COLORS[u.role] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 max-w-xs">
                      <PermSummary
                        permissions={u.permissions ?? emptyPerms()}
                      />
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                          u.status === "Active"
                            ? "bg-emerald-50 text-emerald-primary"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => setViewPerms(u)}
                          className="text-xs text-gray-500 hover:text-gray-800 font-medium border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Permissions
                        </button>
                        <button
                          onClick={() => openEdit(u)}
                          className="text-xs text-emerald-primary hover:underline font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="text-xs text-red-500 hover:underline font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-sm text-gray-400">
                No users found.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Add / Edit Modal ─────────────────────────────────────────────────── */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
              <h2 className="font-semibold text-gray-900">
                {editing ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Basic info */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as "Active" | "Inactive",
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
                <div className={editing ? "col-span-2" : ""}>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    disabled={!!editing}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary disabled:bg-gray-50 disabled:text-gray-400"
                    placeholder="user@example.com"
                  />
                </div>
                {!editing && (
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, password: e.target.value }))
                      }
                      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                      placeholder="Min 6 characters"
                    />
                  </div>
                )}
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Role
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleRoleChange(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                        form.role === r
                          ? `${ROLE_COLORS[r] ?? "bg-gray-100"} border-transparent`
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Permission matrix */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-gray-600">
                    Section Permissions
                  </label>
                  <div className="flex gap-2">
                    {PERMS.map((p) => (
                      <span
                        key={p}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${PERM_COLORS[p]}`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
                <PermMatrix
                  permissions={form.permissions}
                  onChange={(p) => setForm((f) => ({ ...f, permissions: p }))}
                />
              </div>

              {saveError && (
                <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  {saveError}
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 shrink-0">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name || !form.email}
                className="flex-1 bg-emerald-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Update User" : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── View Permissions Modal ───────────────────────────────────────────── */}
      {viewPerms && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div>
                <h2 className="font-semibold text-gray-900">
                  {viewPerms.name}
                </h2>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[viewPerms.role] ?? "bg-gray-100 text-gray-600"}`}
                  >
                    {viewPerms.role}
                  </span>
                  <span className="text-xs text-gray-400">
                    {viewPerms.email}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewPerms(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Section
                      </th>
                      {PERMS.map((p) => (
                        <th
                          key={p}
                          className="text-center px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wide w-20"
                        >
                          {p}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {SECTIONS.map((s) => {
                      const granted =
                        (viewPerms.permissions ?? emptyPerms())[s.key] ?? [];
                      const hasAny = granted.length > 0;
                      return (
                        <tr key={s.key} className={hasAny ? "" : "opacity-40"}>
                          <td className="px-4 py-2.5 font-medium text-gray-700 text-sm">
                            {s.label}
                          </td>
                          {PERMS.map((perm) => (
                            <td key={perm} className="text-center px-3 py-2.5">
                              {granted.includes(perm) ? (
                                <span
                                  className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-semibold ${PERM_COLORS[perm]}`}
                                >
                                  ✓
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="px-6 pb-5">
              <button
                onClick={() => {
                  setViewPerms(null);
                  openEdit(viewPerms);
                }}
                className="w-full border border-[#1a5c38] text-emerald-primary py-2 rounded-lg text-sm font-semibold hover:bg-emerald-primary/5 transition-colors"
              >
                Edit Permissions
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
