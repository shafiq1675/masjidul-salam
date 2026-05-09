"use client";

import { useState } from "react";

type Donation = {
  id: number;
  donor: string;
  email: string;
  amount: number;
  category: string;
  date: string;
  method: string;
  status: "Completed" | "Pending" | "Refunded";
};

const CATEGORIES = ["All", "Zakat", "Sadaqah", "General Fund", "Building Fund", "Education", "Iftar"];
const STATUSES = ["All", "Completed", "Pending", "Refunded"];

const initialDonations: Donation[] = [
  { id: 1, donor: "Ahmed Ali", email: "ahmed@example.com", amount: 150, category: "Zakat", date: "2026-05-10", method: "Credit Card", status: "Completed" },
  { id: 2, donor: "Sarah Khan", email: "sarah@example.com", amount: 50, category: "General Fund", date: "2026-05-10", method: "PayPal", status: "Completed" },
  { id: 3, donor: "Omar Mahmoud", email: "omar@example.com", amount: 1200, category: "Building Fund", date: "2026-05-09", method: "Bank Transfer", status: "Completed" },
  { id: 4, donor: "Fatima Hassan", email: "fatima@example.com", amount: 75, category: "Sadaqah", date: "2026-05-09", method: "Credit Card", status: "Pending" },
  { id: 5, donor: "Ibrahim Yusuf", email: "ibrahim@example.com", amount: 500, category: "Zakat", date: "2026-05-08", method: "Check", status: "Completed" },
  { id: 6, donor: "Aisha Rahman", email: "aisha@example.com", amount: 200, category: "Education", date: "2026-05-07", method: "Credit Card", status: "Completed" },
  { id: 7, donor: "Khalid Mosque Fund", email: "khalid@example.com", amount: 2500, category: "Building Fund", date: "2026-05-06", method: "Bank Transfer", status: "Completed" },
  { id: 8, donor: "Maryam Siddiqui", email: "maryam@example.com", amount: 30, category: "Iftar", date: "2026-05-05", method: "PayPal", status: "Refunded" },
];

const summary = [
  { label: "Total Collected", value: "৳24,500", sub: "This month", color: "text-[#1a5c38]" },
  { label: "Zakat", value: "৳8,200", sub: "33% of total", color: "text-blue-600" },
  { label: "Building Fund", value: "৳9,800", sub: "40% of total", color: "text-orange-600" },
  { label: "Pending", value: "৳425", sub: "3 transactions", color: "text-yellow-600" },
];

export default function DonationsAdmin() {
  const [donations] = useState<Donation[]>(initialDonations);
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = donations.filter((d) => {
    const matchCat = catFilter === "All" || d.category === catFilter;
    const matchStatus = statusFilter === "All" || d.status === statusFilter;
    const matchSearch = d.donor.toLowerCase().includes(search.toLowerCase()) || d.email.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchStatus && matchSearch;
  });

  const total = filtered.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Donations</h1>
          <p className="text-sm text-gray-500 mt-0.5">Track and manage all donation transactions.</p>
        </div>
        <button className="bg-emerald-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export CSV
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
          <input
            type="text"
            placeholder="Search donor name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
          />
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
                    {new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs">{d.method}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      d.status === "Completed" ? "bg-emerald-50 text-emerald-primary" :
                      d.status === "Pending" ? "bg-yellow-50 text-yellow-700" :
                      "bg-red-50 text-red-600"
                    }`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-gray-100 bg-gray-50">
                <td colSpan={2} className="px-5 py-3 text-xs font-semibold text-gray-600">{filtered.length} transactions</td>
                <td className="px-5 py-3 text-sm font-bold text-gray-900">৳{total.toLocaleString()}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No donations found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
