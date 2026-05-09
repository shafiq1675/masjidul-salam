"use client";

import { useState } from "react";

type Event = {
  id: number;
  title: string;
  date: string;
  time: string;
  category: string;
  location: string;
  description: string;
  status: "Published" | "Draft";
};

const CATEGORIES = ["Weekly", "Education", "Community", "Youth", "Fundraising", "Special"];

const initialEvents: Event[] = [
  { id: 1, title: "Jumu'ah Khutbah", date: "2026-05-16", time: "13:00", category: "Weekly", location: "Main Prayer Hall", description: "Weekly Friday prayer and sermon.", status: "Published" },
  { id: 2, title: "Quran Study Circle", date: "2026-05-17", time: "19:00", category: "Education", location: "Classroom 1", description: "Weekly Quran recitation and tafsir study.", status: "Published" },
  { id: 3, title: "Community Iftar", date: "2026-05-18", time: "19:30", category: "Community", location: "Banquet Hall", description: "Monthly community iftar dinner open to all.", status: "Published" },
  { id: 4, title: "Youth Basketball League", date: "2026-05-20", time: "17:00", category: "Youth", location: "Gymnasium", description: "Inter-masjid youth basketball tournament.", status: "Draft" },
  { id: 5, title: "Annual Fundraising Gala", date: "2026-05-25", time: "18:00", category: "Fundraising", location: "Banquet Hall", description: "Annual fundraiser for the building expansion project.", status: "Published" },
];

const blank: Omit<Event, "id"> = {
  title: "", date: "", time: "", category: CATEGORIES[0], location: "", description: "", status: "Draft",
};

export default function EventsAdmin() {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Event | null>(null);
  const [form, setForm] = useState<Omit<Event, "id">>(blank);
  const [filter, setFilter] = useState("All");

  function openNew() {
    setEditing(null);
    setForm(blank);
    setShowForm(true);
  }

  function openEdit(e: Event) {
    setEditing(e);
    setForm({ title: e.title, date: e.date, time: e.time, category: e.category, location: e.location, description: e.description, status: e.status });
    setShowForm(true);
  }

  function handleSave() {
    if (editing) {
      setEvents((prev) => prev.map((e) => e.id === editing.id ? { ...e, ...form } : e));
    } else {
      setEvents((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    setShowForm(false);
  }

  function handleDelete(id: number) {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  }

  const filtered = filter === "All" ? events : events.filter((e) => e.category === filter || e.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Events</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage mosque events, programs, and activities.</p>
        </div>
        <button onClick={openNew} className="bg-[#1a5c38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {["All", ...CATEGORIES, "Published", "Draft"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f ? "bg-[#1a5c38] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Date & Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Category</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((e) => (
                <tr key={e.id} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5">
                    <div className="font-medium text-gray-900">{e.title}</div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate max-w-[220px]">{e.description}</div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 whitespace-nowrap">
                    {new Date(e.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    <div className="text-xs text-gray-400">{e.time}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{e.category}</span>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600 text-xs">{e.location}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      e.status === "Published" ? "bg-emerald-50 text-[#1a5c38]" : "bg-yellow-50 text-yellow-700"
                    }`}>
                      {e.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(e)} className="text-xs text-[#1a5c38] hover:underline font-medium">Edit</button>
                      <button onClick={() => handleDelete(e.id)} className="text-xs text-red-500 hover:underline font-medium">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-sm text-gray-400">No events found.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">{editing ? "Edit Event" : "Add New Event"}</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Event Title</label>
                <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]"
                  placeholder="Enter event title" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Time</label>
                  <input type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]">
                    {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Event["status"] }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]">
                    <option>Published</option>
                    <option>Draft</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Location</label>
                <input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]"
                  placeholder="e.g. Main Prayer Hall" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Description</label>
                <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] resize-none"
                  placeholder="Brief description..." />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowForm(false)} className="flex-1 border border-gray-200 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">Cancel</button>
              <button onClick={handleSave} className="flex-1 bg-[#1a5c38] text-white py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors">
                {editing ? "Update Event" : "Create Event"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
