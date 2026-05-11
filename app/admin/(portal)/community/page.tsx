"use client";

import { useEffect, useState } from "react";
import {
  subscribeMembers, addMember, updateMember, deleteMember,
  type FsMember,
} from "@/lib/db";

const ROLES = ["Member", "Volunteer", "Board Member", "Imam", "Teacher", "Youth Leader"];
const blank: Omit<FsMember, "id"> = {
  name: "", email: "", phone: "", role: ROLES[0],
  joinDate: new Date().toISOString().slice(0, 10), status: "Active",
};

export default function CommunityAdmin() {
  const [members, setMembers] = useState<FsMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showForm, setShowForm]     = useState(false);
  const [editing, setEditing]       = useState<FsMember | null>(null);
  const [form, setForm]             = useState<Omit<FsMember, "id">>(blank);
  const [saving, setSaving]         = useState(false);

  useEffect(() => {
    const unsub = subscribeMembers((rows) => {
      setMembers(rows);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openNew() { setEditing(null); setForm(blank); setShowForm(true); }
  function openEdit(m: FsMember) {
    setEditing(m);
    setForm({ name: m.name, email: m.email, phone: m.phone, role: m.role,
              joinDate: m.joinDate, status: m.status });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.name) return;
    setSaving(true);
    try {
      if (editing?.id) await updateMember(editing.id, form);
      else             await addMember(form);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this member?")) return;
    await deleteMember(id);
  }

  const filtered = members.filter((m) => {
    const matchRole   = roleFilter === "All" || m.role === roleFilter;
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const activeCount = members.filter((m) => m.status === "Active").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Community</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage mosque members, volunteers, and leadership.</p>
        </div>
        <button onClick={openNew}
          className="bg-emerald-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Member
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Total Members",  value: members.length },
          { label: "Active",         value: activeCount },
          { label: "Volunteers",     value: members.filter((m) => m.role === "Volunteer").length },
          { label: "Leadership",     value: members.filter((m) => ["Board Member","Imam","Teacher","Youth Leader"].includes(m.role)).length },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-50">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search by name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {["All", ...ROLES].map((r) => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                roleFilter === r ? "bg-emerald-primary text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}>
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
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Member</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Role</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Joined</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{m.name}</div>
                          <div className="text-xs text-gray-400">{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        m.role === "Imam" || m.role === "Board Member" ? "bg-purple-50 text-purple-700" :
                        m.role === "Teacher" || m.role === "Youth Leader" ? "bg-blue-50 text-blue-700" :
                        m.role === "Volunteer" ? "bg-orange-50 text-orange-700" : "bg-gray-100 text-gray-600"
                      }`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{m.phone}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                      {m.joinDate ? new Date(m.joinDate).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        m.status === "Active" ? "bg-emerald-50 text-emerald-primary" : "bg-gray-100 text-gray-500"
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(m)} className="text-xs text-emerald-primary hover:underline font-medium">Edit</button>
                        <button onClick={() => m.id && handleDelete(m.id)} className="text-xs text-red-500 hover:underline font-medium">Remove</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-sm text-gray-400">No members found.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Member" : "Add New Member"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name *</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  placeholder="Full name" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  placeholder="email@example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phone</label>
                <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  placeholder="(555) 000-0000" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary">
                    {ROLES.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FsMember["status"] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary">
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Join Date</label>
                <input type="date" value={form.joinDate} onChange={(e) => setForm((f) => ({ ...f, joinDate: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary" />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.name}
                className="flex-1 bg-emerald-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Update Member" : "Add Member"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
