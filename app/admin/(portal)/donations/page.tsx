"use client";

import { useEffect, useState, useMemo } from "react";
import {
  subscribeDonations,
  subscribeMembers,
  addDonation,
  updateDonation,
  deleteDonation,
  type FsDonation,
  type FsMember,
} from "@/lib/db";

const CATEGORIES = [
  "All",
  "Zakat",
  "Sadaqah",
  "General Fund",
  "Building Fund",
  "Education",
  "Iftar",
];
const METHODS = ["Credit Card", "PayPal", "Bank Transfer", "Check", "Cash"];
const PAGE_SIZE = 5;
const ANNUAL_GOAL = 200000;

const blank: Omit<FsDonation, "id"> = {
  donor: "",
  email: "",
  phone: "",
  amount: 0,
  category: "General Fund",
  date: new Date().toISOString().slice(0, 10),
  method: METHODS[0],
  status: "Paid",
};

const CAT_COLORS: Record<string, string> = {
  Zakat: "bg-orange-100 text-orange-700",
  Sadaqah: "bg-blue-100 text-blue-700",
  "General Fund": "bg-emerald-100 text-emerald-700",
  "Building Fund": "bg-purple-100 text-purple-700",
  Education: "bg-indigo-100 text-indigo-700",
  Iftar: "bg-amber-100 text-amber-700",
};
const STATUS_COLORS: Record<string, string> = {
  Paid: "bg-green-100 text-green-700",
  Pending: "bg-yellow-100 text-yellow-700",
  Failed: "bg-red-100 text-red-700",
};

const AVATAR_COLORS = [
  "bg-emerald-100 text-emerald-700",
  "bg-blue-100 text-blue-700",
  "bg-orange-100 text-orange-700",
  "bg-purple-100 text-purple-700",
  "bg-teal-100 text-teal-700",
  "bg-rose-100 text-rose-700",
];

function avatarColor(name: string) {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

function pageButtons(current: number, total: number): number[] {
  if (total <= 3) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 1) return [1, 2, 3];
  if (current >= total) return [total - 2, total - 1, total];
  return [current - 1, current, current + 1];
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DonationsAdmin() {
  const [donations, setDonations] = useState<FsDonation[]>([]);
  const [members, setMembers] = useState<FsMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [catFilter, setCatFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FsDonation | null>(null);
  const [form, setForm] = useState<Omit<FsDonation, "id">>(blank);
  const [saving, setSaving] = useState(false);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [donorSearch, setDonorSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const unsub = subscribeDonations((rows) => {
      setDonations(rows);
      setLoading(false);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const unsub = subscribeMembers((rows) => setMembers(rows));
    return unsub;
  }, []);

  function openNew() {
    setEditing(null);
    setForm(blank);
    setDonorSearch("");
    setShowSuggestions(false);
    setShowForm(true);
  }
  function openEdit(d: FsDonation) {
    setEditing(d);
    setForm({
      donor: d.donor,
      email: d.email,
      phone: d.phone ?? "",
      amount: d.amount,
      category: d.category,
      date: d.date,
      method: d.method,
      status: d.status,
    });
    setDonorSearch(d.donor);
    setShowSuggestions(false);
    setShowForm(true);
    setMenuOpen(null);
  }

  async function handleSave() {
    if (!form.donor) return;
    setSaving(true);
    try {
      if (editing?.id) await updateDonation(editing.id, form);
      else await addDonation(form);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    setMenuOpen(null);
    if (!confirm("Delete this donation record?")) return;
    await deleteDonation(id);
  }

  // ── Derived stats ────────────────────────────────────────────────────────────
  const totalAll = donations.reduce((s, d) => s + d.amount, 0);
  const zakatTotal = donations
    .filter((d) => d.category === "Zakat")
    .reduce((s, d) => s + d.amount, 0);
  const mosqueTotal = totalAll - zakatTotal;
  const zakatPct = totalAll ? Math.round((zakatTotal / totalAll) * 100) : 0;
  const mosquePct = totalAll ? 100 - zakatPct : 0;
  const goalPct = Math.min(
    100,
    totalAll > 0 ? Math.round((totalAll / ANNUAL_GOAL) * 100) : 0,
  );

  // ── Monthly trend (last 6 months) ────────────────────────────────────────────
  const monthlyData = useMemo(() => {
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return {
        label: d.toLocaleDateString("en-US", { month: "short" }),
        year: d.getFullYear(),
        monthIdx: d.getMonth(),
        total: 0,
        isCurrent: i === 5,
      };
    });
    donations.forEach((d) => {
      if (!d.date) return;
      const date = new Date(d.date + "T00:00");
      const entry = months.find(
        (m) => m.monthIdx === date.getMonth() && m.year === date.getFullYear(),
      );
      if (entry) entry.total += d.amount;
    });
    return months;
  }, [donations]);

  const maxMonthly = Math.max(...monthlyData.map((m) => m.total), 1);

  // ── Pagination ───────────────────────────────────────────────────────────────
  const filtered = donations.filter(
    (d) => catFilter === "All" || d.category === catFilter,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE,
  );

  // ── Annual goal ring ─────────────────────────────────────────────────────────
  const r = 50;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ - (goalPct / 100) * circ;

  return (
    <div className="space-y-5" onClick={() => setMenuOpen(null)}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Donation Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and manage financial contributions from the community.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
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
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Export Report
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-primary text-white rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors"
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
            Manual Entry
          </button>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Collection */}
        <div className="bg-emerald-primary rounded-2xl p-6 text-white relative overflow-hidden">
          <div className="absolute right-5 top-5 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-3">
            Total Collection
          </div>
          <div className="text-3xl font-black text-white mb-4">
            ৳{totalAll.toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/15 text-white">
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              +12.5%
            </span>
            <span className="text-[11px] text-white/50">vs previous month</span>
          </div>
        </div>

        {/* Zakat Fund */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-orange-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-orange-500">
              Zakat Fund
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mb-1">
            ৳{zakatTotal.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mb-3">{zakatPct}% of total</div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-orange-500 rounded-full transition-all"
              style={{ width: `${zakatPct}%` }}
            />
          </div>
        </div>

        {/* Mosque Fund */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-emerald-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <span className="text-sm font-semibold text-emerald-primary">
              Mosque Fund
            </span>
          </div>
          <div className="text-2xl font-black text-gray-900 mb-1">
            ৳{mosqueTotal.toLocaleString()}
          </div>
          <div className="text-xs text-gray-400 mb-3">
            {mosquePct}% of total
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full">
            <div
              className="h-1.5 bg-emerald-primary rounded-full transition-all"
              style={{ width: `${mosquePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Recent Transactions ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Transactions</h2>
          <div className="flex items-center gap-1.5 border border-gray-200 rounded-xl px-3 py-2">
            <svg
              className="w-3.5 h-3.5 text-gray-400 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
              />
            </svg>
            <select
              value={catFilter}
              onChange={(e) => {
                setCatFilter(e.target.value);
                setPage(1);
              }}
              className="bg-transparent text-sm text-gray-600 focus:outline-none pr-1"
            >
              {CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-5 h-5 border-2 border-emerald-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Donor Name
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Date
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Category
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                    Payment Status
                  </th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paged.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* Donor */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {d.donor.toLowerCase() === "anonymous" ? (
                          <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0">
                            <svg
                              className="w-5 h-5"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                          </div>
                        ) : (
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(d.donor)}`}
                          >
                            {initials(d.donor)}
                          </div>
                        )}
                        <div>
                          <div className="font-semibold text-gray-900">
                            {d.donor}
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {d.email || d.phone || "—"}
                          </div>
                          {d.email && d.phone && (
                            <div className="text-xs text-gray-400">
                              {d.phone}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-semibold text-gray-900 tabular-nums">
                      ৳{d.amount.toLocaleString()}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {d.date
                        ? new Date(d.date + "T00:00").toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )
                        : "—"}
                    </td>

                    {/* Category */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CAT_COLORS[d.category] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {d.category}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[d.status] ?? "bg-gray-100 text-gray-600"}`}
                      >
                        {d.status}
                      </span>
                    </td>

                    {/* Three-dots action */}
                    <td className="px-6 py-4 text-right">
                      <div
                        className="relative inline-block"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() =>
                            setMenuOpen(
                              menuOpen === d.id ? null : (d.id ?? null),
                            )
                          }
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 6a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4zm0 8a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                        {menuOpen === d.id && (
                          <div className="absolute right-0 top-9 bg-white rounded-xl border border-gray-100 shadow-lg z-20 py-1 min-w-[130px]">
                            <button
                              onClick={() => openEdit(d)}
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => d.id && handleDelete(d.id)}
                              className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {paged.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-14 text-center text-sm text-gray-400"
                    >
                      No donations found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-t border-gray-100">
              <span className="text-sm text-gray-400">
                {filtered.length === 0
                  ? "No donations"
                  : `Showing ${(safePage - 1) * PAGE_SIZE + 1}–${Math.min(safePage * PAGE_SIZE, filtered.length)} of ${filtered.length} donations`}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
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
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                {pageButtons(safePage, totalPages).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                      n === safePage
                        ? "bg-emerald-primary text-white"
                        : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors"
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Bottom row ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-4">
        {/* Monthly Trend bar chart */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h2 className="font-semibold text-gray-900 mb-6">Monthly Trend</h2>
          <div className="flex items-end gap-3" style={{ height: 140 }}>
            {monthlyData.map((m) => {
              const heightPct = (m.total / maxMonthly) * 100;
              return (
                <div
                  key={m.label}
                  className="flex-1 flex flex-col items-center gap-2"
                >
                  <div
                    className="w-full flex items-end"
                    style={{ height: 100 }}
                  >
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${m.isCurrent ? "bg-emerald-primary" : "bg-emerald-200"}`}
                      style={{ height: `${Math.max(6, heightPct)}%` }}
                    />
                  </div>
                  <span
                    className={`text-[11px] font-medium ${m.isCurrent ? "text-emerald-primary font-bold" : "text-gray-400"}`}
                  >
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Annual Goal donut */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col">
          <div className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
            Annual Goal
          </div>
          <div className="text-4xl font-black text-gray-900 mb-0.5">
            {goalPct}%
          </div>
          <div className="text-xs text-gray-400 mb-4">
            ৳{Math.round(totalAll / 1000)}k of ৳{Math.round(ANNUAL_GOAL / 1000)}
            k target
          </div>

          <div className="flex-1 flex items-center justify-center py-2">
            <div className="relative w-28 h-28">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="10"
                />
                <circle
                  cx="60"
                  cy="60"
                  r={r}
                  fill="none"
                  stroke="#e07b39"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={circ}
                  strokeDashoffset={dashOffset}
                  className="transition-all duration-700"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gold-accent"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9"
                  />
                </svg>
              </div>
            </div>
          </div>

          <button className="mt-2 w-full border border-gray-200 text-sm font-medium text-gray-700 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            View Campaign Details
          </button>
        </div>
      </div>

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">
                {editing ? "Edit Donation" : "Manual Entry"}
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
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 relative">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Donor Name *
                  </label>
                  <input
                    value={donorSearch}
                    onChange={(e) => {
                      const val = e.target.value;
                      setDonorSearch(val);
                      setForm((f) => ({ ...f, donor: val, email: f.email, phone: f.phone }));
                      setShowSuggestions(true);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="Type or search member name…"
                    autoComplete="off"
                  />
                  {showSuggestions && donorSearch.length > 0 && (() => {
                    const hits = members.filter((m) =>
                      m.name.toLowerCase().includes(donorSearch.toLowerCase())
                    ).slice(0, 6);
                    return hits.length > 0 ? (
                      <ul className="absolute z-50 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                        {hits.map((m) => (
                          <li key={m.id}>
                            <button
                              type="button"
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                setDonorSearch(m.name);
                                setForm((f) => ({
                                  ...f,
                                  donor: m.name,
                                  email: m.email || f.email,
                                  phone: m.phone || f.phone,
                                }));
                                setShowSuggestions(false);
                              }}
                              className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 flex items-center gap-3"
                            >
                              <div className="w-7 h-7 rounded-full bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-xs font-bold shrink-0">
                                {m.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{m.name}</div>
                                {m.phone && <div className="text-xs text-gray-400">{m.phone}</div>}
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : null;
                  })()}
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Email
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="email@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={form.phone ?? ""}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    placeholder="+880XXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Amount (৳)
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, amount: Number(e.target.value) }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  >
                    {CATEGORIES.filter((c) => c !== "All").map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Method
                  </label>
                  <select
                    value={form.method}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, method: e.target.value }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  >
                    {METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        status: e.target.value as FsDonation["status"],
                      }))
                    }
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                  >
                    <option>Paid</option>
                    <option>Pending</option>
                    <option>Refunded</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.donor}
                className="flex-1 bg-emerald-primary text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60"
              >
                {saving ? "Saving…" : editing ? "Update" : "Record Donation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
