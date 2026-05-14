"use client";

import { useEffect, useState } from "react";
import {
  subscribePrayerTimes,
  savePrayerTimes,
  type PrayerTimesDoc,
  type PrayerEntry,
} from "@/lib/db";
import { fmt24to12 } from "@/lib/timeFormat";

// ── Helpers ───────────────────────────────────────────────────────────────────



const PRAYER_META: Record<string, { icon: React.ReactNode; color: string }> = {
  Fajr: {
    color: "text-indigo-400",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
      </svg>
    ),
  },
  Sunrise: {
    color: "text-yellow-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 000 10" />
      </svg>
    ),
  },
  Dhuhr: {
    color: "text-orange-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="5" strokeWidth={2} />
        <path strokeLinecap="round" strokeWidth={2}
          d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
    ),
  },
  Asr: {
    color: "text-amber-500",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1M3 12H1m22 0h-2M5.636 5.636L4.222 4.222M19.778 19.778l-1.414-1.414M5.636 18.364l-1.414 1.414M19.778 4.222l-1.414 1.414M12 8a4 4 0 100 8 4 4 0 000-8z" />
      </svg>
    ),
  },
  Maghrib: {
    color: "text-rose-400",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 000 10" />
      </svg>
    ),
  },
  Isha: {
    color: "text-violet-400",
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
      </svg>
    ),
  },
  "Jumu'ah": {
    color: "text-emerald-500",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

function getNextPrayerIdx(prayers: PrayerEntry[]) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayers.length; i++) {
    if (!prayers[i].adhan) continue;
    const [h, m] = prayers[i].adhan.split(":").map(Number);
    if (h * 60 + m > nowMin) return i;
  }
  return 0;
}

// ── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT: PrayerTimesDoc = {
  method: "Muslim World League",
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

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PrayerTimesAdmin() {
  const [data, setData]         = useState<PrayerTimesDoc>(DEFAULT);
  const [method, setMethod]     = useState<"manual" | "auto">("manual");
  const [editIdx, setEditIdx]   = useState<number | null>(null);
  const [editVals, setEditVals] = useState<PrayerEntry>({ name: "", adhan: "", iqama: "" });
  const [saveStatus, setSave]   = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [manualEdits, setManualEdits] = useState(0);
  const [syncStatus, setSyncStatus] = useState<"idle" | "loading" | "synced" | "error">("idle");

  useEffect(() => {
    const unsub = subscribePrayerTimes((doc) => {
      if (doc) setData(doc);
    });
    return unsub;
  }, []);

  const nextIdx = getNextPrayerIdx(data.prayers);

  function startEdit(idx: number) {
    setEditIdx(idx);
    setEditVals({ ...data.prayers[idx] });
  }

  function cancelEdit() {
    setEditIdx(null);
  }

  async function saveRow(idx: number) {
    const updated = data.prayers.map((p, i) => i === idx ? { ...editVals } : p);
    const newData = { ...data, prayers: updated };
    setData(newData);
    setEditIdx(null);
    setManualEdits((n) => n + 1);
    setSave("saving");
    try {
      await savePrayerTimes(newData);
      setSave("saved");
      setTimeout(() => setSave("idle"), 2500);
    } catch {
      setSave("error");
      setTimeout(() => setSave("idle"), 2500);
    }
  }

  async function fetchLiveTimes() {
    setSyncStatus("loading");
    try {
      const res = await fetch(
        "https://api.aladhan.com/v1/timingsByCity?city=Dhaka&country=Bangladesh&method=1"
      );
      if (!res.ok) throw new Error("API error");
      const json = await res.json();
      const t = json.data.timings as Record<string, string>;
      const clean = (s: string) => s.replace(/\s*\(.*\)$/, "");
      const MAP: Record<string, string> = {
        Fajr:     clean(t.Fajr),
        Sunrise:  clean(t.Sunrise),
        Dhuhr:    clean(t.Dhuhr),
        Asr:      clean(t.Asr),
        Maghrib:  clean(t.Maghrib),
        Isha:     clean(t.Isha),
        "Jumu'ah": clean(t.Dhuhr),
      };
      const newData: PrayerTimesDoc = {
        ...data,
        prayers: data.prayers.map((p) =>
          MAP[p.name] ? { ...p, adhan: MAP[p.name] } : p
        ),
      };
      setData(newData);
      setSave("saving");
      await savePrayerTimes(newData);
      setSave("saved");
      setSyncStatus("synced");
      setTimeout(() => { setSave("idle"); setSyncStatus("idle"); }, 3000);
    } catch {
      setSyncStatus("error");
      setSave("idle");
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div className="space-y-5">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prayer Times Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage and synchronise daily prayer schedule</p>
        </div>

        {/* Method toggle */}
        <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1 self-start sm:self-auto">
          <button
            onClick={() => setMethod("manual")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              method === "manual"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Manual Override
          </button>
          <button
            onClick={() => setMethod("auto")}
            className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              method === "auto"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Automatic MWL
          </button>
        </div>
      </div>

      {/* ── Two-column grid ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">

        {/* ── Left: Daily Schedule ────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Card header */}
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100">
            <div>
              <div className="text-sm font-semibold text-gray-900">Daily Prayer Schedule</div>
              <div className="text-xs text-gray-400 mt-0.5">{today}</div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {saveStatus === "saved" && (
                <span className="text-xs text-emerald-600 font-medium">Saved!</span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs text-red-500 font-medium">Error saving</span>
              )}
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print
              </button>
              <button
                onClick={fetchLiveTimes}
                disabled={syncStatus === "loading"}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-accent rounded-lg text-xs font-medium text-white hover:bg-[#c96b2f] transition-colors disabled:opacity-60"
              >
                <svg
                  className={`w-3.5 h-3.5 ${syncStatus === "loading" ? "animate-spin" : ""}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {syncStatus === "loading" ? "Fetching…" : syncStatus === "synced" ? "Synced!" : syncStatus === "error" ? "Failed" : "Sync Global"}
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Prayer</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Adhan</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Iqama</th>
                <th className="text-left px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="text-right px-5 py-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.prayers.map((p, i) => {
                const isNext    = i === nextIdx;
                const isEditing = editIdx === i;
                const meta      = PRAYER_META[p.name];

                return (
                  <tr
                    key={p.name}
                    className={isNext ? "bg-orange-50" : "hover:bg-gray-50/60"}
                  >
                    {/* Prayer name */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className={`${meta?.color ?? "text-gray-400"}`}>
                          {meta?.icon}
                        </span>
                        <div>
                          <div className={`font-semibold text-sm ${isNext ? "text-orange-700" : "text-gray-800"}`}>
                            {p.name}
                          </div>
                          {isNext && (
                            <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wide">
                              Next Prayer
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Adhan */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        <input
                          type="time"
                          value={editVals.adhan}
                          onChange={(e) => setEditVals((v) => ({ ...v, adhan: e.target.value }))}
                          className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary w-32"
                        />
                      ) : (
                        <span className={`font-medium ${isNext ? "text-orange-700" : "text-gray-800"}`}>
                                                    {fmt24to12(p.adhan)}
                        </span>
                      )}
                    </td>

                    {/* Iqama */}
                    <td className="px-5 py-3.5">
                      {isEditing ? (
                        p.iqama !== "" ? (
                          <input
                            type="time"
                            value={editVals.iqama}
                            onChange={(e) => setEditVals((v) => ({ ...v, iqama: e.target.value }))}
                            className="border border-gray-200 rounded-lg px-2.5 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-primary/20 focus:border-emerald-primary w-32"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">N/A</span>
                        )
                      ) : (
                        <span className={`${isNext ? "text-orange-700" : "text-gray-600"}`}>
                          {p.iqama ? fmt24to12(p.iqama) : <span className="text-gray-400">N/A</span>}
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      {isNext ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-600 bg-orange-100 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />
                          Upcoming
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-3.5 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => saveRow(i)}
                            disabled={saveStatus === "saving"}
                            className="px-3 py-1.5 bg-emerald-primary text-white rounded-lg text-xs font-semibold hover:bg-[#154d30] transition-colors disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(i)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isNext
                              ? "bg-gold-accent text-white hover:bg-[#c96b2f]"
                              : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>

        {/* ── Right sidebar ────────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Solar Season card */}
          <div className="bg-emerald-primary rounded-2xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-4 h-4 text-yellow-300" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth={2} strokeLinecap="round" />
              </svg>
              <span className="text-sm font-semibold">Solar Season</span>
            </div>
            <div className="text-2xl font-bold mb-1">Spring</div>
            <div className="text-xs text-white/60 mb-4">Mar 20 – Jun 21, 2026</div>
            <div className="space-y-2 text-xs text-white/80">
              <div className="flex justify-between">
                <span>Sunrise</span>
                <span className="font-medium text-white">{fmt24to12(data.prayers.find(p => p.name === "Sunrise")?.adhan ?? "06:51")}</span>
              </div>
              <div className="flex justify-between">
                <span>Sunset</span>
                <span className="font-medium text-white">{fmt24to12(data.prayers.find(p => p.name === "Maghrib")?.adhan ?? "19:58")}</span>
              </div>
              <div className="flex justify-between">
                <span>Day Length</span>
                <span className="font-medium text-white">13h 07m</span>
              </div>
            </div>
          </div>

          {/* System Status card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">System Status</div>
            <div className="space-y-2.5">
              {[
                { label: "Prayer API",     val: "Online",     ok: true  },
                { label: "Last Sync",      val: "2 min ago",  ok: true  },
                { label: "Data Source",    val: "MWL v2.1",   ok: true  },
                { label: "DST Adjusted",   val: "Yes",        ok: true  },
              ].map(({ label, val, ok }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">{label}</span>
                  <span className={`text-xs font-medium flex items-center gap-1 ${ok ? "text-emerald-600" : "text-red-500"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-500" : "bg-red-500"}`} />
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidance banner */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-semibold text-amber-800 mb-1">Community Guidance</div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Iqama times reflect local community practice and may differ from calculated adhan times. Always verify with the Imam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Fajr Variance</span>
            <span className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-indigo-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">-12m</div>
          <div className="text-[11px] text-gray-400 mt-1">vs. calculated</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">Manual Edits</span>
            <span className="w-8 h-8 bg-orange-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-gold-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{String(manualEdits).padStart(2, "0")}</div>
          <div className="text-[11px] text-gray-400 mt-1">this session</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500">API Status</span>
            <span className="w-8 h-8 bg-emerald-50 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">Stable</div>
          <div className="text-[11px] text-gray-400 mt-1">45ms response</div>
        </div>
      </div>
    </div>
  );
}
