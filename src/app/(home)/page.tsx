import { FormulaPrompt } from "@/app/(home)/formula-prompt";
import { FormulaResult } from "@/app/(home)/formula-result";
import { Footer } from "@/components/footer";
import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <main className="container mx-auto mt-24 max-w-5xl px-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div>
                <h2 className="mb-4 text-xl font-medium">
                  Generate Excel Formula
                </h2>
                <FormulaPrompt />
              </div>
              <div>
                <h2 className="mb-4 text-xl font-medium">Result</h2>
                <FormulaResult />
              </div>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
