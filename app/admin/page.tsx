"use client";

const stats = [
  {
    label: "Total Members",
    value: "1,284",
    change: "+12% this month",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: "bg-blue-50",
    iconColor: "text-blue-600",
  },
  {
    label: "Monthly Collections",
    value: "৳24,500",
    change: "On Track",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    bg: "bg-emerald-50",
    iconColor: "text-[#1a5c38]",
  },
  {
    label: "Upcoming Events",
    value: "8",
    change: "This month",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bg: "bg-orange-50",
    iconColor: "text-orange-600",
  },
  {
    label: "Active Volunteers",
    value: "142",
    change: "+5 this week",
    positive: true,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    bg: "bg-purple-50",
    iconColor: "text-purple-600",
  },
];

const donations = [
  { name: "Ahmed Ali", category: "Zakat", amount: "৳150", date: "May 10, 2026", status: "Completed" },
  { name: "Sarah Khan", category: "General Fund", amount: "৳50", date: "May 10, 2026", status: "Completed" },
  { name: "Omar Mahmoud", category: "Building Fund", amount: "৳1,200", date: "May 9, 2026", status: "Completed" },
  { name: "Fatima Hassan", category: "Sadaqah", amount: "৳75", date: "May 9, 2026", status: "Pending" },
  { name: "Ibrahim Yusuf", category: "Zakat", amount: "৳500", date: "May 8, 2026", status: "Completed" },
];

const prayers = [
  { name: "Fajr", time: "5:23 AM", iqama: "5:43 AM" },
  { name: "Sunrise", time: "6:51 AM", iqama: "—" },
  { name: "Dhuhr", time: "1:05 PM", iqama: "1:30 PM" },
  { name: "Asr", time: "4:47 PM", iqama: "5:00 PM" },
  { name: "Maghrib", time: "7:58 PM", iqama: "8:03 PM" },
  { name: "Isha", time: "9:32 PM", iqama: "9:45 PM" },
];

const events = [
  { title: "Jumu'ah Khutbah", date: "May 16, 2026", time: "1:00 PM", category: "Weekly" },
  { title: "Quran Study Circle", date: "May 17, 2026", time: "7:00 PM", category: "Education" },
  { title: "Community Iftar", date: "May 18, 2026", time: "7:30 PM", category: "Community" },
  { title: "Youth Basketball", date: "May 20, 2026", time: "5:00 PM", category: "Youth" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
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
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                s.positive ? "bg-emerald-50 text-[#1a5c38]" : "bg-red-50 text-red-600"
              }`}>
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
            <button className="text-xs text-[#1a5c38] font-medium hover:underline">View All →</button>
          </div>
          <div className="divide-y divide-gray-50">
            {donations.map((d, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-[#1a5c38]/10 text-[#1a5c38] flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {d.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{d.name}</div>
                  <div className="text-xs text-gray-400">{d.category} · {d.date}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">{d.amount}</div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  d.status === "Completed"
                    ? "bg-emerald-50 text-[#1a5c38]"
                    : "bg-yellow-50 text-yellow-700"
                }`}>
                  {d.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Prayer Times */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Today&apos;s Prayer Times</h2>
              <span className="text-xs text-gray-400">May 10</span>
            </div>
            <div className="px-4 py-2 space-y-1">
              {prayers.map((p, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                  <span className="font-medium text-gray-700">{p.name}</span>
                  <div className="flex gap-4 text-gray-500">
                    <span>{p.time}</span>
                    <span className="text-gray-300">|</span>
                    <span>{p.iqama}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-gray-100">
              <button className="w-full text-xs text-[#1a5c38] font-medium border border-[#1a5c38]/30 rounded-lg py-1.5 hover:bg-[#1a5c38]/5 transition-colors">
                Update Prayer Times
              </button>
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-xl border border-gray-100">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">Upcoming Events</h2>
              <button className="text-xs text-[#1a5c38] font-medium hover:underline">View All →</button>
            </div>
            <div className="px-4 py-2 space-y-2">
              {events.map((e, i) => (
                <div key={i} className="flex items-start gap-3 py-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#1a5c38] mt-1.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-900 truncate">{e.title}</div>
                    <div className="text-xs text-gray-400">{e.date} · {e.time}</div>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-500 flex-shrink-0">
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
