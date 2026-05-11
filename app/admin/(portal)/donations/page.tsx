"use client";

import { useEffect, useState } from "react";
import {
  subscribeDonations, addDonation, updateDonation, deleteDonation,
  type FsDonation,
} from "@/lib/db";

const CATEGORIES = ["All", "Zakat", "Sadaqah", "General Fund", "Building Fund", "Education", "Iftar"];
const STATUSES   = ["All", "Completed", "Pending", "Refunded"];
const METHODS    = ["Credit Card", "PayPal", "Bank Transfer", "Check", "Cash"];

const blank: Omit<FsDonation, "id"> = {
  donor: "", email: "", amount: 0, category: "General Fund",
  date: new Date().toISOString().slice(0, 10), method: METHODS[0], status: "Completed",
};

export default function DonationsAdmin() {
  const [donations, setDonations] = useState<FsDonation[]>([]);
  const [loading, setLoading]     = useState(true);
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch]       = useState("");
  const [showForm, setShowForm]   = useState(false);
  const [editing, setEditing]     = useState<FsDonation | null>(null);
  const [form, setForm]           = useState<Omit<FsDonation, "id">>(blank);
  const [saving, setSaving]       = useState(false);

  useEffect(() => {
    const unsub = subscribeDonations((rows) => {
      setDonations(rows);
      setLoading(false);
    });
    return unsub;
  }, []);

  function openNew() { setEditing(null); setForm(blank); setShowForm(true); }
  function openEdit(d: FsDonation) {
    setEditing(d);
    setForm({ donor: d.donor, email: d.email, amount: d.amount, category: d.category,
              date: d.date, method: d.method, status: d.status });
    setShowForm(true);
  }

  async function handleSave() {
    if (!form.donor) return;
    setSaving(true);
    try {
      if (editing?.id) await updateDonation(editing.id, form);
      else             await addDonation(form);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this donation record?")) return;
    await deleteDonation(id);
  }

  const filtered = donations.filter((d) => {
    const matchCat    = catFilter === "All" || d.category === catFilter;
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    const matchSearch = d.donor.toLowerCase().includes(search.toLowerCase()) ||
                        d.email.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const total        = filtered.reduce((s, d) => s + d.amount, 0);
  const totalAll     = donations.reduce((s, d) => s + d.amount, 0);
  const zakatTotal   = donations.filter((d) => d.category === "Zakat").reduce((s, d) => s + d.amount, 0);
  const buildTotal   = donations.filter((d) => d.category === "Building Fund").reduce((s, d) => s + d.amount, 0);
  const pendingTotal = donations.filter((d) => d.status === "Pending").reduce((s, d) => s + d.amount, 0);

  const summary = [
    { label: "Total Collected",  value: `৳${totalAll.toLocaleString()}`,   sub: "All time",       color: "text-emerald-primary" },
    { label: "Zakat",            value: `৳${zakatTotal.toLocaleString()}`,  sub: "This period",    color: "text-blue-600"   },
    { label: "Building Fund",    value: `৳${buildTotal.toLocaleString()}`,  sub: "This period",    color: "text-orange-600" },
    { label: "Pending",          value: `৳${pendingTotal.toLocaleString()}`,sub: `${donations.filter(d=>d.status==="Pending").length} transactions`, color: "text-yellow-600" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all donation transactions.</p>
        </div>
        <button onClick={openNew}
          className="bg-emerald-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Record Donation
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {summary.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-sm font-medium text-gray-900 mt-0.5">{s.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-50">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Search donor name or email..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary" />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setCatFilter(c)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                catFilter === c ? "bg-emerald-primary text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s ? "bg-emerald-primary text-white" : "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
              }`}>
              {s}
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
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Donor</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Amount</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Method</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {d.donor.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">{d.donor}</div>
                          <div className="text-xs text-gray-400">{d.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{d.category}</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-gray-900">৳{d.amount.toLocaleString()}</td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs whitespace-nowrap">
                      {d.date ? new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-gray-600 text-xs">{d.method}</td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        d.status === "Completed" ? "bg-emerald-50 text-emerald-primary" :
                        d.status === "Pending"   ? "bg-yellow-50 text-yellow-700" :
                                                   "bg-red-50 text-red-600"
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(d)} className="text-xs text-emerald-primary hover:underline font-medium">Edit</button>
                        <button onClick={() => d.id && handleDelete(d.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-gray-100 bg-gray-50">
                  <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-gray-600">{filtered.length} transactions</td>
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">৳{total.toLocaleString()}</td>
                  <td colSpan={4} />
                </tr>
              </tfoot>
            </table>
            {filtered.length === 0 && !loading && (
              <div className="text-center py-12 text-sm text-gray-400">No donations found.</div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Donation" : "Record Donation"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Donor Name *</label>
                  <input value={form.donor} onChange={(e) => setForm((f) => ({ ...f, donor: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="Full name" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Amount (৳)</label>
                  <input type="number" min={0} value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary">
                    {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Method</label>
                  <select value={form.method} onChange={(e) => setForm((f) => ({ ...f, method: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary">
                    {METHODS.map((m) => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FsDonation["status"] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary">
                    <option>Completed</option>
                    <option>Pending</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving || !form.donor}
                className="flex-1 bg-emerald-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60">
                {saving ? "Saving…" : editing ? "Update" : "Record Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
