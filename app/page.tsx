import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { FeaturesSection } from "@/components/features-section";
import { InventorySection } from "@/components/inventory-section";
import { CreditTrackerSection } from "@/components/credit-tracker-section";
import { CTASection } from "@/components/cta-section";
import { Footer } from "@/components/footer";
export const dynamic = "force-dynamic"
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="pt-20">
        <HeroSection />
        <FeaturesSection />
        <InventorySection />
        <CreditTrackerSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
