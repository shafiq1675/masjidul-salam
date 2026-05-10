"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Footer() {
  return (
    <footer className="bg-[#0d3d26] text-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <div className="font-bold text-xl mb-3">মাসজিদুস সালাম</div>
            <p className="text-white/55 text-sm leading-relaxed">
              আপনার ইবাদত, আত্মিক উন্নতি ও সামাজিক সম্প্রীতির স্থান। আমাদের সাথে থাকুন
              এবং একটি সুন্দর সমাজের অংশীদার হোন।
            </p>
          </div>
          <div>
            <div className="font-semibold mb-4 text-white/90">দ্রুত লিংক</div>
            <ul className="space-y-2 text-white/60 text-sm">
              {[
                { label: "যোগাযোগ মিডিয়া", href: "/about" },
                { label: "স্থায়ী সদস্য",    href: "/permanent-member" },
                { label: "অনুদান",           href: "/#donation" },
                { label: "রিপোর্ট",          href: "#" },
              ].map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="font-semibold mb-4 text-white/90">নিউজলেটার</div>
            <p className="text-white/55 text-sm mb-3">আমাদের আপডেট পেতে ইমেইল দিন</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="ইমেইল দিন"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-white/50 transition"
              />
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="bg-[#e07b39] text-white px-4 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#c96c2e] transition-colors whitespace-nowrap"
              >
                যুক্ত হোন
              </motion.button>
            </div>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-white/35 text-xs">
          © {new Date().getFullYear()} মাসজিদুস সালাম। সর্বস্বত্ব সংরক্ষিত।
        </div>
      </div>
    </footer>
  );
}
