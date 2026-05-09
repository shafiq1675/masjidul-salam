"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const images = [
    "/carousel-images/masjid1.jpg",
    "/carousel-images/masjid2.jpg",
    "/carousel-images/masjid3.jpg",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10 bg-[oklch(97%_0.014_254.604)]">

      {/* Heading */}
      <h1 className="text-4xl md:text-5xl font-bold text-center text-[oklch(76.5%_0.177_163.223)]">
        মসজিদুল সালামে স্বাগতম
      </h1>

      {/* Subtitle */}
      <p className="mt-4 text-lg text-center text-[oklch(79.2%_0.209_151.711)] max-w-2xl">
        আপনার ইবাদত, আত্মিক উন্নতি ও সামাজিক সম্প্রীতির স্থান।
      </p>

      {/* Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <Link
          href="/about"
          className="px-6 py-3 text-white rounded-lg transition hover:opacity-90 bg-[oklch(70.7%_0.165_254.624)] inline-block text-center"        >
          মসজিদুল সালাম সম্পর্কে আরও জানুন
        </Link>

        <Link
          href="/prayer-times"
          className="px-6 py-3 border rounded-lg transition hover:bg-white text-[oklch(70.7%_0.165_254.624)] border-[oklch(70.7%_0.165_254.624)] inline-block text-center"        >
          ইবাদতের সময়সূচী দেখুন
        </Link>
         <Link
          href="/permanent-member"
          className="px-6 py-3 border rounded-lg transition hover:bg-white text-[oklch(70.7%_0.165_254.624)] border-[oklch(70.7%_0.165_254.624)] inline-block text-center"        >
          মসজিদুল সালামের স্থায়ী সদস্যগণ দেখুন
        </Link>
      </div>

      {/* Carousel */}
      <div className="relative mt-10 w-full max-w-4xl overflow-hidden rounded-2xl shadow-xl">

        <div className="relative h-[300px] sm:h-[500px] md:h-[700px] w-full">
          <Image
            src={images[currentIndex]}
            alt={`Masjid Image ${currentIndex + 1}`}
            fill
            className="object-cover"
          />
        </div>

        {/* Previous */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
        >
          ❮
        </button>

        {/* Next */}
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 text-white px-3 py-2 rounded-full"
        >
          ❯
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-3 h-3 rounded-full ${currentIndex === index
                  ? "bg-white"
                  : "bg-gray-400"
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}