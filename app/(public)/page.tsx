"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  type Variants,
} from "framer-motion";
import { useRef } from "react";
import {
  subscribePrayerTimes,
  addDonation,
  type PrayerTimesDoc,
} from "@/lib/db";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
  type ConfirmationResult,
} from "firebase/auth";
import { publicAuth } from "@/lib/firebase";
import { contactInfo } from "../context/contactInfo";
import { fmt24to12 } from "@/lib/timeFormat";

// ── animation variants ──────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const slideLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const slideRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: "easeOut" as const },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

const cardVariant: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ── prayer name → Bengali label + sun flag ───────────────────────────────────
const PRAYER_BN: Record<string, { bn: string; sun: boolean }> = {
  Fajr: { bn: "ফজর", sun: false },
  Sunrise: { bn: "সূর্যোদয়", sun: true },
  Dhuhr: { bn: "যোহর", sun: false },
  Asr: { bn: "আসর", sun: false },
  Maghrib: { bn: "মাগরিব", sun: false },
  Isha: { bn: "এশা", sun: false },
};

const BENGALI_DAYS = [
  "রবিবার",
  "সোমবার",
  "মঙ্গলবার",
  "বুধবার",
  "বৃহস্পতিবার",
  "শুক্রবার",
  "শনিবার",
];
const BENGALI_MONTHS = [
  "জানুয়ারি",
  "ফেব্রুয়ারি",
  "মার্চ",
  "এপ্রিল",
  "মে",
  "জুন",
  "জুলাই",
  "আগস্ট",
  "সেপ্টেম্বর",
  "অক্টোবর",
  "নভেম্বর",
  "ডিসেম্বর",
];
const toBN = (n: number | string) =>
  String(n).replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[+d]);
const bengaliDate = (d: Date) =>
  `${BENGALI_DAYS[d.getDay()]}, ${toBN(d.getDate())} ${BENGALI_MONTHS[d.getMonth()]} ${toBN(d.getFullYear())}`;

// ── data ─────────────────────────────────────────────────────────────────────

const events = [
  {
    image: "/carousel-images/masjid1.jpg",
    category: "শিক্ষা",
    title: "সাপ্তাহিক কুরআন ক্লাস",
    description:
      "প্রতি শুক্রবার জুম্মার পরে পবিত্র কুরআনের তাফসীর বিষয়ক আলোচনা ও পাঠদান অনুষ্ঠিত হবে।",
    date: "১২ অক্টোবর",
    link: "বিস্তারিত জানুন",
  },
  {
    image: "/carousel-images/masjid2.jpg",
    category: "সামাজিক",
    title: "সামাজিক সম্প্রীতি সভা",
    description:
      "আমাদের সম্প্রদায়ের উন্নতি ও ঐক্যের লক্ষ্যে মাসিক সামাজিক সভা ও পরিকল্পনা অধিবেশন।",
    date: "১৫ অক্টোবর",
    link: "আরো দেখুন",
  },
  {
    image: "/carousel-images/masjid3.jpg",
    category: "ধর্ম",
    title: "নতুন ইমাম নিয়োগ",
    description:
      "আমাদের মসজিদে একজন নতুন ইমাম নিয়োগ করা হয়েছে। তাঁকে আমাদের পরিবারে স্বাগত জানাই।",
    date: "৭ দিন আগে",
    link: "বিস্তারিত",
  },
];

const leaders = [
  { name: "ইমাম আব্দুল আলীম", role: "প্রধান ইমাম ও পরিচালক" },
  { name: "মোঃ ওমর আলী খান", role: "পরিচালনা কমিটি" },
  { name: "মোঃ ইসমাইল শেখ", role: "পরিচালনা কমিটি" },
];
const developers = [
  {
    name: "মোঃ শফিকুল ইসলাম",
    image: "/team/shafiq.jpg",
    role: "Software Engineer",
  },
  {
    name: "মোঃ আরিফ মাতুব্বর",
    image: "/team/arif.jpg",
    role: "Software Developer",
  },
];

const donationAmounts = ["১০০", "১০০০", "৫০০০", "অন্যান্য"];
const AMOUNT_NUM: Record<string, number> = {
  "১০০": 100,
  "১০০০": 1000,
  "৫০০০": 5000,
};

// ── helper: scroll-into-view for anchor links ────────────────────────────────
const HEADER_H = 64; // matches h-16 in Header.tsx

function useSmoothAnchor() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href) return;
      // accept both "#section" and "/#section"
      const hash = href.startsWith("#")
        ? href
        : href.startsWith("/#")
          ? href.slice(1)
          : null;
      if (!hash) return;
      const el = document.querySelector(hash);
      if (!el) return;
      e.preventDefault();
      const top = el.getBoundingClientRect().top + window.scrollY - HEADER_H;
      window.scrollTo({ top, behavior: "smooth" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
}

// ── reusable section-wrapper with whileInView ────────────────────────────────
function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      id={id}
      ref={ref}
      variants={staggerContainer}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      className={className}
    >
      {children}
    </motion.section>
  );
}

// ── page ────────────────────────────────────────────────────────────────────
export default function Home() {
  const [donationAmount, setDonationAmount] = useState("১০০০");
  const [donorName, setDonorName] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donateStatus, setDonateStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [now, setNow] = useState(() => new Date());
  const [prayerDoc, setPrayerDoc] = useState<PrayerTimesDoc | null>(null);
  const [otpStep, setOtpStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSending, setOtpSending] = useState(false);
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null);
  const confirmRef = useRef<ConfirmationResult | null>(null);

  useSmoothAnchor();

  // tick every minute for real-time prayer status
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // live prayer times from Firestore
  useEffect(() => {
    return subscribePrayerTimes(setPrayerDoc);
  }, []);

  // cleanup reCAPTCHA on unmount
  useEffect(
    () => () => {
      recaptchaRef.current?.clear();
    },
    [],
  );

  
  // build display array from Firestore doc (skip Jumu'ah — weekly only)
  // Maghrib expands to two cards: adhan = iftar/Maghrib, iqama = Sunset prayer start
  const prayers = (prayerDoc?.prayers ?? [])
    .filter((p) => p.name !== "Jumu'ah")
    .flatMap((p) => {
      const meta = PRAYER_BN[p.name] ?? { bn: p.name, sun: false };
      const [h, m] = (p.adhan || "0:0").split(":").map(Number);
      const entry = { name: meta.bn, time: toBN(p.iqama?fmt24to12(p.iqama):fmt24to12(p.adhan)), h, m, sun: meta.sun };
      if (p.name === "Maghrib" && p.iqama) {
        const [ih, im] = p.iqama.split(":").map(Number);
        return [
          entry,
          { name: "সূর্যাস্ত", time: toBN(fmt24to12(p.adhan)), h: ih, m: im, sun: true },
        ];
      }
      return [entry];
    });

  // determine current & next prayer
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const prayerMins = prayers.map((p) => p.h * 60 + p.m);
  let currentIdx = -1;
  for (let i = prayerMins.length - 1; i >= 0; i--) {
    if (prayerMins[i] <= nowMins) {
      currentIdx = i;
      break;
    }
  }
  const nextIdx = currentIdx === -1 ? 0 : (currentIdx + 1) % prayers.length;

  // hero parallax
  const { scrollY } = useScroll();
  const heroY = useTransform(scrollY, [0, 500], [0, 120]);

  async function sendOtp() {
    if (!donorName.trim() || !donorPhone.trim()) return;
    const numAmount =
      donationAmount === "অন্যান্য"
        ? Number(customAmount)
        : (AMOUNT_NUM[donationAmount] ?? 0);
    if (numAmount <= 0) return;

    // Strip spaces, hyphens, parentheses before formatting
    const cleaned = donorPhone.trim().replace(/[\s\-(). ]/g, "");
    const phone = cleaned.startsWith("+")
      ? cleaned
      : cleaned.startsWith("0")
        ? "+880" + cleaned.slice(1)
        : "+880" + cleaned;

    setOtpSending(true);
    setOtpError("");
    try {
      if (!recaptchaRef.current) {
        recaptchaRef.current = new RecaptchaVerifier(
          publicAuth,
          "recaptcha-container",
          { size: "invisible" },
        );
      }
      await recaptchaRef.current.render();

      // Race against 60-second timeout — RecaptchaVerifier.verify() never rejects
      // on its own, so a blocked/frozen reCAPTCHA would hang the button forever.
      const otpTimeout = new Promise<never>((_, rej) =>
        window.setTimeout(() => rej({ code: "otp/timeout" }), 60_000),
      );
      confirmRef.current = await Promise.race([
        signInWithPhoneNumber(publicAuth, phone, recaptchaRef.current),
        otpTimeout,
      ]);
      setOtpStep("otp");
    } catch (err: unknown) {
      console.error("sendOtp error:", err);
      const code = (err as { code?: string }).code ?? "";
      const msg = err instanceof Error ? err.message : String(err);
      const OTP_ERRORS: Record<string, string> = {
        "auth/operation-not-allowed":
          "Phone Auth Firebase Console-এ সক্রিয় নেই।",
        "auth/invalid-phone-number": "ফোন নম্বর সঠিক নয়। ফরম্যাট: 01XXXXXXXXX",
        "auth/quota-exceeded": "SMS কোটা শেষ হয়ে গেছে। পরে আবার চেষ্টা করুন।",
        "auth/too-many-requests": "অনেক বেশি অনুরোধ। কিছুক্ষণ পরে চেষ্টা করুন।",
        "auth/captcha-check-failed": "reCAPTCHA ব্যর্থ হয়েছে। পেজ রিলোড করুন।",
        "auth/missing-phone-number": "ফোন নম্বর দেওয়া হয়নি।",
        "auth/app-not-authorized": "এই ডোমেইন Firebase-এ অনুমোদিত নয়।",
        "auth/internal-error": "Firebase কনফিগারেশন ত্রুটি। Console দেখুন।",
        "otp/timeout": "reCAPTCHA সাড়া দিচ্ছে না। পেজ রিলোড করুন।",
      };
      setOtpError(OTP_ERRORS[code] ?? `ত্রুটি: ${code || msg.slice(0, 100)}`);
      recaptchaRef.current?.clear();
      recaptchaRef.current = null;
    } finally {
      setOtpSending(false);
    }
  }

  async function verifyAndDonate() {
    if (!confirmRef.current || otp.length < 6) return;
    setDonateStatus("submitting");
    setOtpError("");
    try {
      await confirmRef.current.confirm(otp);
      const numAmount =
        donationAmount === "অন্যান্য"
          ? Number(customAmount)
          : (AMOUNT_NUM[donationAmount] ?? 0);
      await addDonation({
        donor: donorName.trim(),
        email: "",
        phone: donorPhone.trim(),
        amount: numAmount,
        category: "General Fund",
        date: new Date().toISOString().slice(0, 10),
        method: "Cash",
        status: "Pending",
      });
      await signOut(publicAuth).catch(() => {});
      setDonateStatus("success");
      setDonorName("");
      setDonorPhone("");
      setCustomAmount("");
      setDonationAmount("১০০০");
      setOtp("");
      setOtpStep("form");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setOtpError(
        msg.includes("invalid-verification-code")
          ? "OTP সঠিক নয়।"
          : "যাচাইকরণ ব্যর্থ হয়েছে।",
      );
      setDonateStatus("idle");
    }
  }

  return (
    <div className="flex flex-col bg-white">
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative h-[88vh] min-h-[520px] w-full overflow-hidden">
        {/* parallax image */}
        <motion.div className="absolute inset-0 scale-110" style={{ y: heroY }}>
          <Image
            src="/hero-image.png"
            alt="মাসজিদুস সালাম"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />

        {/* watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
          <span className="text-white/[0.06] text-5xl sm:text-7xl md:text-9xl font-black tracking-[0.3em] uppercase whitespace-nowrap">
            MASJIDUL SALAM
          </span>
        </div>

        <div className="absolute inset-0 flex flex-col justify-center px-6 md:px-16 lg:px-24 max-w-7xl mx-auto left-0 right-0">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl font-bold text-white max-w-2xl leading-tight"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.2 }}
          >
            মাসজিদুস সালামে স্বাগতম
          </motion.h1>

          <motion.p
            className="mt-4 text-base md:text-lg text-white/80 max-w-xl leading-relaxed"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.4 }}
          >
            আপনার ইবাদত, আত্মিক উন্নতি ও সামাজিক সম্প্রীতির স্থান। আমরা একটি
            উন্নত ও সমৃদ্ধ মুসলিম সমাজ নির্মাণের অঙ্গীকারে প্রতিশ্রুতিবদ্ধ।
          </motion.p>

          <motion.div
            className="mt-8 flex flex-col sm:flex-row gap-4"
            variants={fadeUp}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.55 }}
          >
            <Link
              href="/permanent-member"
              className="inline-flex items-center justify-center bg-[#e07b39] text-white px-8 py-3.5 rounded-md font-semibold hover:bg-[#c96c2e] transition-colors"
            >
              সদস্যপদ গ্রহণ করুন
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center justify-center border-2 border-white text-white px-8 py-3.5 rounded-md font-semibold hover:bg-white hover:text-[#1a5c38] transition-colors"
            >
              আরো জানুন
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Prayer Times ──────────────────────────────────────────────────── */}
      <div className="px-4 md:px-8 lg:px-16 -mt-12 relative z-10">
        <motion.div
          className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-5 md:p-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6, ease: "easeOut" }}
        >
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
              <span className="text-lg">🕌</span>
              আজকের নামাজের সময়সূচী
            </div>
            <span className="text-sm text-gold-accent font-black">{bengaliDate(now)}</span>
                     
          </div>

          <motion.div
            className="grid grid-cols-4 md:grid-cols-7 gap-2"
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            transition={{ delayChildren: 0.85 }}
          >
            {prayers.map((prayer, i) => {
              const isCurrent = i === currentIdx;
              const isNext = i === nextIdx;
              const isPast = currentIdx !== -1 && i < currentIdx;

              return (
                <motion.div
                  key={prayer.name}
                  variants={cardVariant}
                  className={`relative flex flex-col items-center py-3 px-1 rounded-xl text-center border transition-colors ${prayer.sun ? "bg-gold-accent/10! text-gold-accent" : ""} ${
                    isCurrent
                      ? "bg-gold-accent border-gold-accent"
                      : isNext
                        ? "bg-white border-2 border-gold-accent"
                        : isPast
                          ? "bg-gray-50 border-gray-100 opacity-50"
                          : "bg-gray-50 border-gray-100"
                  }`}
                >
                  {/* status badge */}
                  {(isCurrent || isNext) && (
                    <span
                      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 text-[9px] px-2 py-0.5 rounded-full font-bold whitespace-nowrap ${
                        isCurrent
                          ? "bg-white text-gold-accent"
                          : "bg-gold-accent text-white"
                      }`}
                    >
                      {isCurrent ? "এখন" : "পরবর্তী"}
                    </span>
                  )}

                  {/* prayer name */}
                  <span
                    className={`text-[11px] font-medium flex items-center gap-0.5 ${
                      isCurrent ? "text-white/80" : "text-gray-500"
                    }`}
                  >
                    {prayer.sun && (
                      <svg
                        className="w-3 h-3 shrink-0"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zm10-7a1 1 0 010 2h-1a1 1 0 110-2h1zM3 12a1 1 0 010 2H2a1 1 0 110-2h1zm15.657-6.657a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM6.464 17.536a1 1 0 010 1.414l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 0zM17.536 17.536a1 1 0 011.414 0l.707.707a1 1 0 01-1.414 1.414l-.707-.707a1 1 0 010-1.414zM5.05 6.343a1 1 0 011.414 0l.707.707A1 1 0 115.757 8.464l-.707-.707a1 1 0 010-1.414zM12 7a5 5 0 110 10A5 5 0 0112 7z" />
                      </svg>
                    )}
                    {prayer.name}
                  </span>

                  {/* time */}
                  <span
                    className={`text-lg font-bold mt-1 ${
                      isCurrent
                        ? "text-white"
                        : isNext
                          ? "text-gold-accent"
                          : "text-emerald-primary"
                    }`}
                  >
                    <span className="text-sm mr-1">{prayer.time.split(" ")[0]}</span>
                    {prayer.time.split(" ")[1]}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>

      {/* ── Mission ───────────────────────────────────────────────────────── */}
      <Section className="py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            variants={slideLeft}
            className="relative h-72 md:h-[400px] rounded-2xl overflow-hidden shadow-lg"
          >
            <Image
              src="/carousel-images/masjid2.jpg"
              alt="মসজিদের ভেতরে"
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div variants={slideRight}>
            <span className="text-[#e07b39] text-sm font-bold uppercase tracking-widest">
              আমাদের লক্ষ্য
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
              আধ্যাত্মিক বিকাশ ও সামাজিক ঐক্য
            </h2>
            <p className="mt-4 text-gray-600 leading-relaxed text-[15px]">
              মাসজিদুস সালাম একটি শান্তিপূর্ণ সম্প্রদায় তৈরির লক্ষ্যে কাজ করছে।
              আমরা ধর্মীয় শিক্ষা, সামাজিক সংহতি ও সাংস্কৃতিক উন্নয়নের মাধ্যমে
              একটি আদর্শ সমাজ গঠনে প্রতিশ্রুতিবদ্ধ।
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "নিয়মিত আলোচনা ও শিক্ষা কার্যক্রম পরিচালনা",
                "কুরআন ও হাদিস শিক্ষার বিশেষ প্রোগ্রাম",
                "সামাজিক সহায়তা ও কমিউনিটি কার্যক্রম",
              ].map((item, i) => (
                <motion.li
                  key={item}
                  className="flex items-start gap-3"
                  variants={fadeUp}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 bg-[#1a5c38] rounded-full flex items-center justify-center">
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </span>
                  <span className="text-gray-700 text-[15px]">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </Section>

      {/* ── Events ────────────────────────────────────────────────────────── */}
      <Section className="bg-gray-50 py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            variants={fadeUp}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                আসন্ন ইভেন্ট ও ঘোষণা
              </h2>
              <p className="mt-1.5 text-gray-500 text-sm">
                আমাদের কমিউনিটির সাথে যুক্ত থাকুন
              </p>
            </div>
            <Link
              href="#"
              className="hidden md:flex items-center gap-1 text-sm text-[#1a5c38] font-semibold hover:underline shrink-0"
            >
              সকল ইভেন্ট দেখুন <span className="text-base">→</span>
            </Link>
          </motion.div>

          <motion.div
            className="grid md:grid-cols-3 gap-6"
            variants={staggerContainer}
          >
            {events.map((event) => (
              <motion.div
                key={event.title}
                variants={cardVariant}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-shadow group"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-white/95 text-[#1a5c38] text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm">
                    {event.category}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 text-[17px] leading-snug">
                    {event.title}
                  </h3>
                  <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                    {event.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {event.date}
                    </span>
                    <Link
                      href="#"
                      className="text-sm text-[#e07b39] font-semibold hover:underline"
                    >
                      {event.link}
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Donation ──────────────────────────────────────────────────────── */}
      <Section id="donation" className="bg-[#1a5c38] py-16 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div variants={slideLeft} className="text-white">
            <h2 className="text-3xl md:text-4xl font-bold leading-tight">
              সদস্যপদ গ্রহণ ও দান
            </h2>
            <p className="mt-4 text-white/75 leading-relaxed text-[15px]">
              মাসজিদুস সালামের উন্নয়ন ও কার্যক্রম পরিচালনায় আপনার সহায়তা
              অত্যন্ত প্রয়োজনীয়। আমাদের সদস্য হয়ে নিয়মিত অনুদান প্রদান করুন
              এবং একটি সুন্দর সমাজ গড়ার অংশীদার হোন।
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-6">
              {[
                {
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                  title: "সদস্যপদ",
                  sub: "আমাদের পরিবারে যুক্ত হন",
                },
                {
                  icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z",
                  title: "মাসিক দান",
                  sub: "নিয়মিত অনুদান প্রদান করুন",
                },
              ].map((item) => (
                <div key={item.title} className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-white/20 rounded-full flex items-center justify-center shrink-0">
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
                        d={item.icon}
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-white font-semibold">{item.title}</div>
                    <div className="text-white/60 text-sm">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={slideRight}
            className="bg-white rounded-2xl p-6 shadow-2xl"
          >
            {/* Success state */}
            {donateStatus === "success" ? (
              <div className="flex flex-col items-center justify-center py-8 text-center gap-3">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-emerald-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <p className="font-bold text-gray-900 text-lg">
                  জাযাকাল্লাহু খায়রান!
                </p>
                <p className="text-gray-500 text-sm">
                  আপনার দানের অনুরোধ সফলভাবে জমা হয়েছে।
                </p>
                <button
                  onClick={() => setDonateStatus("idle")}
                  className="mt-2 text-sm text-emerald-primary font-semibold hover:underline"
                >
                  আবার দান করুন
                </button>
              </div>
            ) : (
              <>
                {/* invisible reCAPTCHA mount point */}
                <div id="recaptcha-container" />

                {otpStep === "form" ? (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1.5">
                          আবেদনকারীর নাম *
                        </label>
                        <input
                          type="text"
                          placeholder="আপনার নাম"
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 font-medium block mb-1.5">
                          ফোন নম্বর *
                        </label>
                        <input
                          type="tel"
                          placeholder="01XXXXXXXXX"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition"
                        />
                      </div>
                    </div>

                    <div className="mb-5">
                      <label className="text-xs text-gray-500 font-medium block mb-2">
                        দান পরিমাণ (টাকা)
                      </label>
                      <div className="grid grid-cols-4 gap-2">
                        {donationAmounts.map((amount) => (
                          <motion.button
                            key={amount}
                            onClick={() => setDonationAmount(amount)}
                            whileTap={{ scale: 0.94 }}
                            className={`py-2.5 rounded-lg text-sm font-semibold border transition-all ${
                              donationAmount === amount
                                ? "bg-emerald-primary text-white border-emerald-primary shadow-sm"
                                : "bg-white text-gray-700 border-gray-200 hover:border-emerald-primary hover:text-emerald-primary"
                            }`}
                          >
                            {amount}
                          </motion.button>
                        ))}
                      </div>
                      {donationAmount === "অন্যান্য" && (
                        <input
                          type="number"
                          min={1}
                          placeholder="পরিমাণ লিখুন"
                          value={customAmount}
                          onChange={(e) => setCustomAmount(e.target.value)}
                          className="mt-2 w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-primary focus:ring-1 focus:ring-emerald-primary transition"
                        />
                      )}
                    </div>

                    {otpError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3 text-sm text-red-700 font-medium">
                        {otpError}
                      </div>
                    )}

                    <motion.button
                      onClick={sendOtp}
                      disabled={
                        otpSending || !donorName.trim() || !donorPhone.trim()
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full bg-gold-accent text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#c96c2e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {otpSending ? "পাঠানো হচ্ছে..." : "OTP পাঠান"}
                    </motion.button>
                  </>
                ) : (
                  <>
                    {/* summary */}
                    <div className="bg-gray-50 rounded-xl p-4 mb-5 text-sm text-gray-700 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">নাম</span>
                        <span className="font-medium">{donorName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">ফোন</span>
                        <span className="font-medium">{donorPhone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">পরিমাণ</span>
                        <span className="font-medium text-emerald-primary">
                          ৳
                          {donationAmount === "অন্যান্য"
                            ? customAmount
                            : donationAmount}
                        </span>
                      </div>
                    </div>

                    <label className="text-xs text-gray-500 font-medium block mb-2">
                      আপনার ফোনে পাঠানো ৬ সংখ্যার OTP লিখুন
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="• • • • • •"
                      value={otp}
                      onChange={(e) =>
                        setOtp(e.target.value.replace(/\D/g, ""))
                      }
                      className="w-full border-2 border-gray-200 rounded-xl px-4 py-3.5 text-2xl font-bold text-center tracking-[0.5em] focus:outline-none focus:border-emerald-primary transition mb-4"
                    />

                    {otpError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3 text-sm text-red-700 font-medium">
                        {otpError}
                      </div>
                    )}

                    <motion.button
                      onClick={verifyAndDonate}
                      disabled={donateStatus === "submitting" || otp.length < 6}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="w-full bg-emerald-primary text-white py-3.5 rounded-xl font-bold text-base hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed mb-3"
                    >
                      {donateStatus === "submitting"
                        ? "যাচাই হচ্ছে..."
                        : "যাচাই করুন ও দান করুন"}
                    </motion.button>

                    <button
                      onClick={() => {
                        setOtpStep("form");
                        setOtp("");
                        setOtpError("");
                        recaptchaRef.current?.clear();
                        recaptchaRef.current = null;
                      }}
                      className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors py-1"
                    >
                      ← পরিবর্তন করুন
                    </button>
                  </>
                )}
              </>
            )}
          </motion.div>
        </div>
      </Section>

      {/* ── Leadership ────────────────────────────────────────────────────── */}
      <Section className="py-16 px-4 md:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-center text-gray-900 mb-12"
          >
            নেতৃত্ব ও যোগাযোগ
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-3 gap-10"
            variants={staggerContainer}
          >
            {leaders.map((leader) => (
              <motion.div
                key={leader.name}
                variants={cardVariant}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-24 h-24 rounded-full bg-[#1a5c38]/10 border-4 border-[#1a5c38]/20 flex items-center justify-center mb-4">
                  <svg
                    className="w-14 h-14 text-[#1a5c38]/40"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-gray-900 text-[15px]">
                  {leader.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{leader.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>

      {/* ── Contact ───────────────────────────────────────────────────────── */}
      <Section id="contact" className="bg-gray-50 py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2  gap-8">
          <motion.div
            variants={slideLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
          >
            <h3 className="font-bold text-gray-900 text-lg mb-5">
              আমাদের ঠিকানা
            </h3>
            <div className="space-y-4">
              {[
                {
                  icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                  text: contactInfo.address,
                },
                {
                  icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                  text: contactInfo.email,
                },
                {
                  icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
                  text: contactInfo.phone,
                },
              ].map((row) => (
                <div
                  key={row.text}
                  className="flex items-center gap-3 text-gray-600 text-sm"
                >
                  <svg
                    className="w-4 h-4 text-[#1a5c38] shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={row.icon}
                    />
                  </svg>
                  {row.text}
                </div>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              {[
                {
                  label: "Facebook",
                  d: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
                },
                {
                  label: "X",
                  d: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
                },
              ].map((s) => (
                <motion.a
                  key={s.label}
                  href="#"
                  aria-label={s.label}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-9 h-9 bg-[#1a5c38]/10 rounded-full flex items-center justify-center hover:bg-[#1a5c38]/20 transition-colors"
                >
                  <svg
                    className="w-4 h-4 text-[#1a5c38]"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d={s.d} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={slideRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-60px" }}
            className="bg-gray-200 rounded-2xl h-64 flex items-center justify-center"
          >
            <div className="text-gray-400 flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
              <span className="text-sm font-medium">মানচিত্র লোড হচ্ছে</span>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ── Leadership ────────────────────────────────────────────────────── */}
      <Section className="py-16 px-4 md:px-8 bg-slate-800">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            variants={fadeUp}
            className="text-3xl font-bold text-center text-slate-100 mb-12"
          >
            ডিজাইন ও ডেভেলপমেন্ট
          </motion.h2>
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-10"
            variants={staggerContainer}
          >
            {developers.map((leader) => (
              <motion.div
                key={leader.name}
                variants={cardVariant}
                whileHover={{ scale: 1.04, transition: { duration: 0.2 } }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-32 h-32 overflow-hidden rounded-full bg-[#1a5c38]/10 border-4 border-[#1a5c38]/20 flex items-center justify-center mb-4">
                  <Image
                    src={leader.image}
                    alt={leader.name}
                    width={300}
                    height={300}
                    className=" object-cover"
                  />
                </div>
                <h3 className="font-bold text-slate-100 text-[15px]">
                  {leader.name}
                </h3>
                <p className="mt-1 text-sm text-slate-300">{leader.role}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </Section>
    </div>
  );
}
