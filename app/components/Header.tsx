"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "হোম",         href: "/" },
  { label: "সম্পর্কে",     href: "/about" },
  // { label: "ইবাদতের সময়", href: "/prayer-times" },
  { label: "যোগাযোগ",      href: "/#contact" },
  { label: "স্থায়ী সদস্য",     href: "/permanent-member" },
];

export default function Header() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <motion.header
      className={`sticky top-0 z-50 bg-white transition-shadow duration-300 ${
        scrolled ? "shadow-md" : "shadow-sm"
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="font-bold text-xl text-[#1a5c38] tracking-tight">
            মাসজিদুস সালাম
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const [path] = link.href.split("#");
              const isActive =
                path === "/" || path === ""
                  ? pathname === "/"
                  : pathname.startsWith(path);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`transition-colors ${
                    isActive
                      ? "font-semibold text-[#1a5c38] border-b-2 border-[#e07b39] pb-0.5"
                      : "text-gray-600 hover:text-[#1a5c38]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/#donation"
            className="hidden md:inline-flex items-center bg-[#1a5c38] text-white text-sm px-5 py-2.5 rounded-md font-medium hover:bg-[#154d30] transition-colors"
          >
            দান করুন
          </Link>

          <button
            className="md:hidden p-1 text-gray-700"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="মেনু"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                animate={{
                  d: mobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16",
                }}
                transition={{ duration: 0.25 }}
              />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="md:hidden overflow-hidden bg-white border-t"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => {
                const [path] = link.href.split("#");
                const isActive =
                  path === "/" || path === ""
                    ? pathname === "/"
                    : pathname.startsWith(path);
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm ${
                      isActive ? "font-semibold text-[#1a5c38]" : "text-gray-600"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/#donation"
                className="bg-[#1a5c38] text-white text-sm px-5 py-2.5 rounded-md font-medium text-center"
              >
                দান করুন
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
