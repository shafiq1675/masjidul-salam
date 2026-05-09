"use client";

import { useState } from "react";

const initialPrayers = [
  { name: "Fajr", adhan: "05:23", iqama: "05:43" },
  { name: "Sunrise", adhan: "06:51", iqama: "" },
  { name: "Dhuhr", adhan: "13:05", iqama: "13:30" },
  { name: "Asr", adhan: "16:47", iqama: "17:00" },
  { name: "Maghrib", adhan: "19:58", iqama: "20:03" },
  { name: "Isha", adhan: "21:32", iqama: "21:45" },
  { name: "Jumu'ah", adhan: "13:00", iqama: "13:30" },
];

export default function PrayerTimesAdmin() {
  const [prayers, setPrayers] = useState(initialPrayers);
  const [saved, setSaved] = useState(false);

  function update(idx: number, field: "adhan" | "iqama", value: string) {
    setPrayers((prev) => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prayer Times</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage daily adhan and iqama times displayed on the website.</p>
        </div>
        <button
          onClick={handleSave}
          className="bg-[#1a5c38] text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors"
        >
          {saved ? "Saved!" : "Save Changes"}
        </button>
      </div>

      {/* Method selector */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Calculation Method</h2>
        <div className="grid grid-cols-3 gap-3">
          {["ISNA (North America)", "Muslim World League", "Egyptian General Authority", "Umm Al-Qura (Mecca)", "University of Islamic Sciences, Karachi", "Manual Override"].map((m, i) => (
            <label key={i} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                defaultChecked={i === 0}
                className="accent-[#1a5c38]"
              />
              <span className="text-sm text-gray-700">{m}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Times table */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Daily Prayer Schedule</h2>
          <span className="text-xs text-gray-400">Effective: May 10, 2026</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Prayer</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Adhan Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Iqama Time</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {prayers.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="time"
                      value={p.adhan}
                      onChange={(e) => update(i, "adhan", e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    {p.iqama !== "" ? (
                      <input
                        type="time"
                        value={p.iqama}
                        onChange={(e) => update(i, "iqama", e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38]"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1a5c38] bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-[#1a5c38] rounded-full" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jumua special */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Jumu&apos;ah (Friday) Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">First Khutbah</label>
            <input type="time" defaultValue="13:00" className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] w-full" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Iqama / Salah Start</label>
            <input type="time" defaultValue="13:30" className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] w-full" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Khateeb / Speaker</label>
            <input type="text" defaultValue="Imam Abdullah Hassan" className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1a5c38]/20 focus:border-[#1a5c38] w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
