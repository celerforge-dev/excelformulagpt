"use client";

import { FormulaSection } from "@/app/(home)/formula-section";
import { HomeHeader } from "@/app/(home)/header";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <>
      <div className="min-h-screen">
        <HomeHeader />
        <main className="container">
          <div className="my-24">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-[3.35rem] font-semibold leading-[1.2]">
                AI Excel Formula Generator
              </h1>
              <h2 className="mt-5 text-xl text-gray-600">
                Describe in words, get formulas instantly. Free & accurate. Turn
                your descriptions into working Excel formulas in seconds.
              </h2>
            </div>
            <FormulaSection />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
