"use client";

import { useEffect, useState } from "react";
import {
  subscribePrayerTimes,
  savePrayerTimes,
  type PrayerTimesDoc,
  type PrayerEntry,
} from "@/lib/db";

const DEFAULT: PrayerTimesDoc = {
  method: "ISNA (North America)",
  prayers: [
    { name: "Fajr",    adhan: "05:23", iqama: "05:43" },
    { name: "Sunrise", adhan: "06:51", iqama: ""       },
    { name: "Dhuhr",   adhan: "13:05", iqama: "13:30"  },
    { name: "Asr",     adhan: "16:47", iqama: "17:00"  },
    { name: "Maghrib", adhan: "19:58", iqama: "20:03"  },
    { name: "Isha",    adhan: "21:32", iqama: "21:45"  },
    { name: "Jumu'ah", adhan: "13:00", iqama: "13:30"  },
  ],
  jumuah: { firstKhutbah: "13:00", iqama: "13:30", khateeb: "Imam Abdullah Hassan" },
};

const METHODS = [
  "ISNA (North America)",
  "Muslim World League",
  "Egyptian General Authority",
  "Umm Al-Qura (Mecca)",
  "University of Islamic Sciences, Karachi",
  "Manual Override",
];

export default function PrayerTimesAdmin() {
  const [data, setData]       = useState<PrayerTimesDoc>(DEFAULT);
  const [status, setStatus]   = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    const unsub = subscribePrayerTimes((doc) => {
      if (doc) setData(doc);
    });
    return unsub;
  }, []);

  function updatePrayer(idx: number, field: keyof PrayerEntry, value: string) {
    setData((prev) => ({
      ...prev,
      prayers: prev.prayers.map((p, i) => i === idx ? { ...p, [field]: value } : p),
    }));
  }

  async function handleSave() {
    setStatus("saving");
    try {
      await savePrayerTimes(data);
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  }

  const saveLabel = status === "saving" ? "Saving…" : status === "saved" ? "Saved!" : status === "error" ? "Error — retry" : "Save Changes";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prayer Times</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage daily adhan and iqama times displayed on the website.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={status === "saving"}
          className="bg-emerald-primary text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60"
        >
          {saveLabel}
        </button>
      </div>

      {/* Method */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Calculation Method</h2>
        <div className="grid grid-cols-3 gap-3">
          {METHODS.map((m) => (
            <label key={m} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="method"
                checked={data.method === m}
                onChange={() => setData((d) => ({ ...d, method: m }))}
                className="accent-emerald-primary"
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
          <span className="text-xs text-gray-400">Changes sync to website on save</span>
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
              {data.prayers.map((p, i) => (
                <tr key={p.name} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3.5 font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5">
                    <input
                      type="time"
                      value={p.adhan}
                      onChange={(e) => updatePrayer(i, "adhan", e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                    />
                  </td>
                  <td className="px-5 py-3.5">
                    {p.iqama !== "" ? (
                      <input
                        type="time"
                        value={p.iqama}
                        onChange={(e) => updatePrayer(i, "iqama", e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">N/A</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-primary bg-emerald-50 px-2.5 py-1 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-primary rounded-full" />
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Jumu'ah */}
      <div className="bg-white rounded-xl border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Jumu&apos;ah (Friday) Settings</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">First Khutbah</label>
            <input
              type="time"
              value={data.jumuah.firstKhutbah}
              onChange={(e) => setData((d) => ({ ...d, jumuah: { ...d.jumuah, firstKhutbah: e.target.value } }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary w-full"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Iqama / Salah Start</label>
            <input
              type="time"
              value={data.jumuah.iqama}
              onChange={(e) => setData((d) => ({ ...d, jumuah: { ...d.jumuah, iqama: e.target.value } }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary w-full"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Khateeb / Speaker</label>
            <input
              type="text"
              value={data.jumuah.khateeb}
              onChange={(e) => setData((d) => ({ ...d, jumuah: { ...d.jumuah, khateeb: e.target.value } }))}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
