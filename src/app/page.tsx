import { Footer } from "@/components/footer";
import Header from "@/components/header";

export default function Home() {
  return (
    <>
      <div className="min-h-screen">
        <Header />
        <main className="bg-background">
          <h1>Home</h1>
        </main>
      </div>
      <Footer />
    </>
  );
}
