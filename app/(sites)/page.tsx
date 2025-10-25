"use client";

import Navbar from "@/app/components/common/Navbar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";
import ProductShowcase from "../components/landing/Product";
import FeaturesSection from "../components/landing/Features";
import CallToAction from "../components/landing/CallToAction";
import Footer from "../components/landing/Footer";

const HeroSection = () => {
  const words = ["Learn", "Collaborate", "Discuss", "Grow", "Engage"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);

  return (
    <>
      <section className="relative w-full bg-gradient-to-b from-[#f8f6f3] to-[#f0ece7] flex flex-col items-center justify-center text-center px-6">
        <Navbar />
          <div className="w-full min-h-[60vh]">
            <h1 className="max-w-3xl mx-auto text-4xl md:text-6xl font-semibold text-[#2f2a25] leading-tight mt-20">
              Discover & Explore
              <span className="inline-block relative mx-3 bg-[#2f2a25] text-[#f4e9d8] rounded-lg align-middle overflow-hidden px-3 py-1 min-w-[300px] h-[1.3em]">
                <span
                  className={`block transition-transform duration-700 ease-in-out`}
                  style={{
                    transform: `translateY(-${currentIndex * 1.3}em)`,
                  }}
                >
                  {words.map((word, index) => (
                    <span
                      key={index}
                      className="block text-center h-[1.3em] leading-[1.1em]"
                    >
                      {word}
                    </span>
                  ))}
                </span>
              </span>
              Effortlessly
            </h1>
            <p className="mt-6 text-lg mx-auto text-gray-700 max-w-3xl">
              Create or join discussion rooms, resolve doubts with real-time AI,
              access auto-generated notes, and test your knowledge with
              interactive quizzes.
            </p>
          <Link href={"/companies"} className="mt-10 block">
            <ProductShowcase />
          </Link>
        </div>
        <FeaturesSection />
        <CallToAction />
        <Footer/>
      </section>
    </>
  );
};

export default HeroSection;
