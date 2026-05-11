"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribeEvents, subscribeDonations, subscribeMembers, subscribePrayerTimes,
  type FsEvent, type FsDonation, type PrayerTimesDoc,
} from "@/lib/db";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt24to12(t: string) {
  if (!t) return "—";
  const [hStr, mStr] = t.split(":");
  const h = parseInt(hStr, 10);
  const suffix = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${mStr} ${suffix}`;
}

function getNextPrayerIdx(prayers: PrayerTimesDoc["prayers"]) {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < prayers.length; i++) {
    if (!prayers[i].adhan) continue;
    const [h, m] = prayers[i].adhan.split(":").map(Number);
    if (h * 60 + m > nowMin) return i;
  }
  return 0;
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase();
}

function eventDateParts(dateStr: string) {
  const d = new Date(dateStr + "T00:00");
  return {
    month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
    day: d.getDate(),
    weekday: d.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

// ── Prayer icons ──────────────────────────────────────────────────────────────

const PRAYER_META: Record<string, { icon: React.ReactNode; color: string }> = {
  Fajr: {
    color: "text-indigo-400",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>,
  },
  Sunrise: {
    color: "text-yellow-400",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 000 10" /></svg>,
  },
  Dhuhr: {
    color: "text-orange-400",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>,
  },
  Asr: {
    color: "text-amber-500",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" strokeWidth={2} /><path strokeLinecap="round" strokeWidth={2} d="M12 2v2M12 20v2M2 12h2M20 12h2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" /></svg>,
  },
  Maghrib: {
    color: "text-rose-400",
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1M4.22 4.22l.7.7m12.16 12.16l.7.7M1 12h1m20 0h1M4.22 19.78l.7-.7M18.36 5.64l.7-.7M12 7a5 5 0 000 10" /></svg>,
  },
  Isha: {
    color: "text-violet-400",
    icon: <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" /></svg>,
  },
};

// ── Stars watermark ───────────────────────────────────────────────────────────

function StarsWatermark() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none opacity-[0.045]">
      <div className="flex flex-wrap gap-x-4 gap-y-3 p-4 text-gray-800 text-[22px] leading-none">
        {Array.from({ length: 64 }).map((_, i) => <span key={i}>★</span>)}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const [events, setEvents]       = useState<FsEvent[]>([]);
  const [donations, setDonations] = useState<FsDonation[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesDoc | null>(null);

  useEffect(() => {
    const u1 = subscribeEvents(setEvents);
    const u2 = subscribeDonations(setDonations);
    const u3 = subscribeMembers((rows) => {
      setMemberCount(rows.filter((m) => m.status === "Active").length);
    });
    const u4 = subscribePrayerTimes(setPrayerTimes);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const totalCollected  = donations.reduce((s, d) => s + d.amount, 0);
  const recentDonations = donations.slice(0, 5);
  const upcomingEvents  = events
    .filter((e) => e.status === "Published" && e.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 3);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const nextIdx = prayerTimes ? getNextPrayerIdx(prayerTimes.prayers) : -1;

  const EVENT_COLORS = [
    "bg-red-100 text-red-600",
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-600",
  ];

  return (
    <div className="space-y-5">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-400 mt-1">
          Welcome back, Admin. Here is the spiritual and operational status for Masjidul Salam today.
        </p>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_290px] gap-5 items-start">

        {/* Left column */}
        <div className="space-y-5">

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-5">

            {/* Total Members */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 relative overflow-hidden">
              <StarsWatermark />
              <div className="relative">
                <div className="flex items-start justify-between mb-7">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 whitespace-nowrap">
                    +12% this month
                  </span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Total Members
                </div>
                <div className="text-[40px] font-black text-gray-900 leading-none">
                  {memberCount.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Monthly Collections */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 relative overflow-hidden">
              <StarsWatermark />
              <div className="relative">
                <div className="flex items-start justify-between mb-7">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-600">
                    On Track
                  </span>
                </div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Monthly Collections
                </div>
                <div className="text-[40px] font-black text-gold-accent leading-none">
                  ৳{totalCollected.toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Donation Activity */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Recent Donation Activity</h2>
              <Link
                href="/admin/donations"
                className="flex items-center gap-1 text-sm text-gray-400 font-medium hover:text-gray-600 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {recentDonations.length === 0 ? (
              <div className="py-14 text-center text-sm text-gray-400">No donations recorded yet.</div>
            ) : (
              <div className="px-2 py-2 space-y-0.5">
                {recentDonations.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-gray-50/70 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center text-xs font-bold shrink-0">
                      {initials(d.donor)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">{d.donor}</div>
                      <div className="text-xs text-gray-400 mt-0.5">{d.category} · {d.date}</div>
                    </div>
                    <div className="text-sm font-semibold text-emerald-600 tabular-nums">
                      +৳{d.amount.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">

          {/* Prayer Times */}
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-5 pt-5 pb-3 relative">
              {/* Mosque silhouette */}
              <div className="absolute right-4 top-4 opacity-[0.08] pointer-events-none">
                <svg width="72" height="72" viewBox="0 0 100 100" fill="currentColor" className="text-gray-900">
                  <path d="M50 2c-3 0-5 2-5 5 0 2 1 3.5 2.5 4.5C45.5 12 44 13.5 44 16c0 2 1.5 3.5 3 4.5L44 48h12L53 20.5c1.5-1 3-2.5 3-4.5 0-2.5-1.5-4-3.5-4.5C54 10.5 55 9 55 7c0-3-2-5-5-5z" />
                  <path d="M20 35c0-8 5-15 13-18v-2c-10 3-17 11-17 20v43h8V35z" />
                  <path d="M80 35c0-8-5-15-13-18v-2c10 3 17 11 17 20v43h-8V35z" />
                  <rect x="28" y="22" width="6" height="4" rx="3" />
                  <rect x="66" y="22" width="6" height="4" rx="3" />
                  <path d="M20 75h60v3H20z" />
                  <path d="M10 80h80v3H10z" />
                  <path d="M0 85h100v5H0z" />
                  <path d="M28 50h44v28H28z" />
                  <path d="M42 50c0-5 3.5-9 8-9s8 4 8 9" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Prayer Times</h2>
              <p className="text-xs text-gray-400 mt-0.5">{todayLabel}</p>
            </div>

            <div className="px-3 pb-2">
              {prayerTimes ? (
                prayerTimes.prayers.map((p, idx) => {
                  if (p.name === "Jumu'ah") return null;
                  const isNext = idx === nextIdx;
                  const meta = PRAYER_META[p.name];
                  return (
                    <div
                      key={p.name}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                        isNext ? "bg-amber-50" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <span className={`${meta?.color ?? "text-gray-400"} shrink-0`}>
                        {meta?.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${isNext ? "text-amber-800" : "text-gray-700"}`}>
                          {p.name}
                        </div>
                        {isNext && (
                          <div className="text-[9px] font-black text-amber-500 uppercase tracking-widest leading-none mt-0.5">
                            Next Prayer
                          </div>
                        )}
                      </div>
                      <span className={`text-sm font-semibold tabular-nums shrink-0 ${
                        isNext ? "text-amber-600" : "text-gray-700"
                      }`}>
                        {fmt24to12(p.adhan)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-gray-400 py-5 text-center px-5">No prayer times saved yet.</p>
              )}
            </div>

            <div className="px-5 py-4 border-t border-gray-100">
              <Link
                href="/admin/prayer-times"
                className="block w-full text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-xl py-2.5 hover:bg-gray-50 transition-colors"
              >
                Update Prayer Times
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Upcoming Events</h2>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No upcoming events.</div>
            ) : (
              <div className="px-4 py-3 space-y-3">
                {upcomingEvents.map((e, i) => {
                  const { month, day, weekday } = eventDateParts(e.date);
                  return (
                    <div key={e.id} className="flex items-start gap-3 py-1">
                      <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 ${EVENT_COLORS[i % EVENT_COLORS.length]}`}>
                        <span className="text-[9px] font-black uppercase leading-none tracking-wide">{month}</span>
                        <span className="text-xl font-black leading-tight">{day}</span>
                      </div>
                      <div className="flex-1 min-w-0 pt-0.5">
                        <div className="text-sm font-semibold text-gray-900 truncate">{e.title}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{weekday} · {e.time}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
