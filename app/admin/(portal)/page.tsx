"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  subscribeEvents, subscribeDonations, subscribeMembers, subscribePrayerTimes,
  type FsEvent, type FsDonation, type PrayerTimesDoc,
} from "@/lib/db";

export default function AdminDashboard() {
  const [events, setEvents]       = useState<FsEvent[]>([]);
  const [donations, setDonations] = useState<FsDonation[]>([]);
  const [memberCount, setMemberCount] = useState(0);
  const [volunteerCount, setVolunteerCount] = useState(0);
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesDoc | null>(null);

  useEffect(() => {
    const u1 = subscribeEvents(setEvents);
    const u2 = subscribeDonations(setDonations);
    const u3 = subscribeMembers((rows) => {
      setMemberCount(rows.filter((m) => m.status === "Active").length);
      setVolunteerCount(rows.filter((m) => m.role === "Volunteer").length);
    });
    const u4 = subscribePrayerTimes(setPrayerTimes);
    return () => { u1(); u2(); u3(); u4(); };
  }, []);

  const totalCollected  = donations.reduce((s, d) => s + d.amount, 0);
  const recentDonations = donations.slice(0, 5);
  const upcomingEvents  = events
    .filter((e) => e.status === "Published" && e.date >= new Date().toISOString().slice(0, 10))
    .slice(0, 4);

  const stats = [
    {
      label: "Active Members", value: memberCount.toLocaleString(), change: "Community",
      bg: "bg-blue-50", iconColor: "text-blue-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    },
    {
      label: "Total Collected", value: `৳${totalCollected.toLocaleString()}`, change: "All donations",
      bg: "bg-emerald-50", iconColor: "text-emerald-primary",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    },
    {
      label: "Upcoming Events", value: upcomingEvents.length.toString(), change: "Published",
      bg: "bg-orange-50", iconColor: "text-orange-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
    },
    {
      label: "Volunteers", value: volunteerCount.toString(), change: "Active",
      bg: "bg-purple-50", iconColor: "text-purple-600",
      icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Welcome back — here&apos;s what&apos;s happening at Masjidul Salam.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className={`${s.bg} ${s.iconColor} p-2 rounded-lg`}>{s.icon}</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-primary">
                {s.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-3 gap-4">
        {/* Recent Donations */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-900 text-sm">Recent Donation Activity</h2>
            <Link href="/admin/donations" className="text-xs text-emerald-primary font-medium hover:underline">View All →</Link>
          </div>
          {recentDonations.length === 0 ? (
            <div className="text-center py-10 text-sm text-gray-400">No donations recorded yet.</div>
          ) : (
            <div className="divide-y divide-gray-50">
              {recentDonations.map((d) => (
                <div key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-primary/10 text-emerald-primary flex items-center justify-center text-xs font-bold shrink-0">
                    {d.donor.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">{d.donor}</div>
                    <div className="text-xs text-gray-400">{d.category} · {d.date}</div>
                  </div>
                  <div className="text-sm font-semibold text-gray-900">৳{d.amount.toLocaleString()}</div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    d.status === "Completed" ? "bg-emerald-50 text-emerald-primary" : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Prayer Times */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Today&apos;s Prayer Times</h2>
            </div>
            <div className="px-4 py-2 space-y-1">
              {prayerTimes ? prayerTimes.prayers.map((p) => (
                <div key={p.name} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="font-medium text-gray-700">{p.name}</span>
                  <div className="flex gap-4 text-gray-500">
                    <span>{p.adhan}</span>
                    <span className="text-gray-300">|</span>
                    <span>{p.iqama || "—"}</span>
                  </div>
                </div>
              )) : (
                <p className="text-xs text-gray-400 py-3 text-center">No prayer times saved yet.</p>
              )}
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <Link href="/admin/prayer-times"
                className="block w-full text-center text-xs text-emerald-primary font-medium border border-emerald-primary/30 rounded-lg py-1.5 hover:bg-emerald-primary/5 transition-colors">
                Update Prayer Times
              </Link>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Upcoming Events</h2>
              <Link href="/admin/events" className="text-xs text-emerald-primary font-medium hover:underline">View All →</Link>
            </div>
            <div className="px-4 py-2 space-y-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-xs text-gray-400 py-3 text-center">No upcoming events.</p>
              ) : upcomingEvents.map((e) => (
                <div key={e.id} className="flex items-start gap-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-primary mt-1.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{e.title}</div>
                    <div className="text-xs text-gray-400">{e.date} · {e.time}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">
                    {e.category}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
