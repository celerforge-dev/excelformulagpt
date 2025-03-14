import { FormulaSection } from "@/app/[locale]/(home)/formula-section";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { useTranslations } from "next-intl";

export default function Home() {
  const t = useTranslations("/");
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <main className="container">
          <div className="my-24">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-[3.35rem] font-semibold leading-[1.2]">
                {t("title")}
              </h1>
              <h2 className="mt-5 text-xl text-gray-600">{t("description")}</h2>
            </div>
            <FormulaSection />
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
