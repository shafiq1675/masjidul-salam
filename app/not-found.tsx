import Image from "next/image";
import Link from "next/link";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function NotFound() {
  return (
    <>
      <Header />

      <main className="min-h-[calc(100vh-64px)] bg-[#f5f5f0] flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-xl mx-auto flex flex-col items-center text-center">

          {/* Image with 404 badge */}
          <div className="relative w-full max-w-[600px] mb-10">
            <div className="relative rounded-2xl overflow-hidden shadow-lg aspect-[16/10]">
              <Image
                src="/404.webp"
                alt="মসজিদ"
                fill
                className="object-cover"
                priority
              />
              {/* Dark overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* 404 badge */}
            <div className="absolute -top-4 -right-4 bg-[#e07b39] text-white rounded-2xl px-5 py-3 shadow-lg">
              <span className="text-4xl font-black tracking-tight leading-none">404</span>
            </div>
          </div>

          {/* Text */}
          <h1 className="text-3xl md:text-4xl font-bold text-[#1a5c38] mb-4 leading-tight">
            এই পথটি সঠিক নয়
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-md mb-10">
            শান্ত হোন, মনে হচ্ছে আপনি ভুল পথে চলে এসেছেন।&nbsp;
            আমরা আপনাকে সঠিক গন্তব্যে ফিরে যেতে সাহায্য করছি।
          </p>

          {/* Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#1a5c38] text-white px-6 py-3 rounded-xl text-sm font-semibold hover:bg-[#154d30] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10" />
              </svg>
              হোম পেজে ফিরে যান
            </Link>

            <Link
              href="/#prayer-times"
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              প্রার্থনার সময়
            </Link>

            <Link
              href="/#donation"
              className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-6 py-3 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              দান
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
