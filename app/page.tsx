import BenefitsSection from "@/components/landing/BenefitsSection";
import CTASection from "@/components/landing/CTASection";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import ShiftSection from "@/components/landing/ShiftSection";

export default function Home() {
  return (
    <main className="flex-1 bg-[#f7f7f3] px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
        <HeroSection scrollTargetId="problem-today" />
        <ProblemSection />
        <ShiftSection />
        <BenefitsSection />
        <CTASection />
      </div>
    </main>
  );
}
