"use client";

import { useEffect, useState } from "react";
import { subscribePrayerTimes, type PrayerTimesDoc } from "@/lib/db";

const BN_NAMES: Record<string, string> = {
  "Fajr":    "ফজর",
  "Sunrise": "সূর্যোদয়",
  "Dhuhr":   "যোহর",
  "Asr":     "আসর",
  "Maghrib": "মাগরিব",
  "Isha":    "এশা",
  "Jumu'ah": "জুমুআ",
};

const PRAYER_ICONS: Record<string, string> = {
  "Fajr":    "🌙",
  "Sunrise": "🌅",
  "Dhuhr":   "☀️",
  "Asr":     "🌤️",
  "Maghrib": "🌇",
  "Isha":    "🌃",
  "Jumu'ah": "🕌",
};

function fmt(t: string) {
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
    if (!prayers[i].adhan || prayers[i].name === "Jumu'ah") continue;
    const [h, m] = prayers[i].adhan.split(":").map(Number);
    if (h * 60 + m > nowMin) return i;
  }
  return 0;
}

export default function PrayerTimes() {
  const [data, setData] = useState<PrayerTimesDoc | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribePrayerTimes((doc) => {
      setData(doc);
      setLoading(false);
    });
    return unsub;
  }, []);

  const today = new Date().toLocaleDateString("bn-BD", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const nextIdx = data ? getNextPrayerIdx(data.prayers) : -1;
  const dailyPrayers = data?.prayers.filter((p) => p.name !== "Jumu'ah") ?? [];
  const jumuah = data?.jumuah;

  return (
    <div className="min-h-screen px-4 py-10 bg-[oklch(97%_0.014_254.604)]">
      <div className="max-w-lg mx-auto space-y-6">

        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            ইবাদতের সময়সূচী
          </h1>
          <p className="text-sm text-gray-400">{today}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !data ? (
          <div className="text-center text-gray-400 py-20">
            সময়সূচী এখনো সেট করা হয়নি।
          </div>
        ) : (
          <>
            {/* Daily prayers */}
            <div className="bg-white rounded-2xl shadow-md overflow-hidden">
              <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100 px-5 py-2.5 text-[11px] font-bold text-gray-400 uppercase tracking-wide">
                <span>নামাজ</span>
                <span className="text-center">আযান</span>
                <span className="text-center">ইকামত</span>
              </div>
              {dailyPrayers.map((p, i) => {
                const isNext = i === nextIdx;
                return (
                  <div
                    key={p.name}
                    className={`grid grid-cols-3 items-center px-5 py-3.5 border-b last:border-none transition-colors ${
                      isNext ? "bg-amber-50" : "hover:bg-gray-50/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{PRAYER_ICONS[p.name]}</span>
                      <div>
                        <div className={`font-semibold text-sm ${isNext ? "text-amber-800" : "text-gray-800"}`}>
                          {BN_NAMES[p.name] ?? p.name}
                        </div>
                        {isNext && (
                          <div className="text-[10px] font-bold text-amber-500 uppercase tracking-wide leading-none">
                            পরবর্তী
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={`text-center font-semibold text-sm tabular-nums ${isNext ? "text-amber-700" : "text-gray-700"}`}>
                      {fmt(p.adhan)}
                    </div>
                    <div className={`text-center text-sm tabular-nums ${isNext ? "text-amber-600" : "text-gray-500"}`}>
                      {p.iqama ? fmt(p.iqama) : <span className="text-gray-300">—</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Jumu'ah card */}
            {jumuah && (
              <div className="bg-emerald-600 text-white rounded-2xl shadow-md p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🕌</span>
                  <span className="font-bold text-lg">জুমুআ</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/10 rounded-xl py-3">
                    <div className="text-[10px] text-white/60 uppercase tracking-wide mb-1">প্রথম খুতবা</div>
                    <div className="font-bold text-sm">{fmt(jumuah.firstKhutbah)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl py-3">
                    <div className="text-[10px] text-white/60 uppercase tracking-wide mb-1">ইকামত</div>
                    <div className="font-bold text-sm">{fmt(jumuah.iqama)}</div>
                  </div>
                  <div className="bg-white/10 rounded-xl py-3">
                    <div className="text-[10px] text-white/60 uppercase tracking-wide mb-1">খতিব</div>
                    <div className="font-bold text-xs leading-tight">{jumuah.khateeb || "—"}</div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
