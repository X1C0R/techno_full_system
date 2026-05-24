import Image from "next/image";
export const dynamic = "force-dynamic"
export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-surface py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-12">
        <div className="lg:w-1/2 space-y-6 z-10">
          <div className="inline-flex items-center gap-2 bg-primary-container/10 text-primary-container px-3 py-1 rounded-full font-semibold text-sm">
            <span
              className="material-symbols-outlined text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            Trusted by 5,000+ Stores
          </div>
          <h1 className="font-[var(--font-heading)] font-bold text-primary text-5xl lg:text-6xl tracking-tight leading-tight">
            Elevate your business with{" "}
            <span className="text-secondary">Tory</span>
          </h1>
          <p className="text-lg text-on-surface-variant max-w-xl leading-relaxed">
            The easiest way to track sales, inventory, and credits. Modernize
            your shop with our digital ledger and point-of-sale system.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button className="border-2 border-primary-container text-primary-container px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-container/5 transition-all">
              Try the Demo
            </button>
          </div>
        </div>
        <div className="lg:w-1/2 relative">
          <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-8 border-white/50">
            <Image
              alt="Tory POS Interface"
              className="w-full h-auto"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnnxp2K4XDisqPzajcFwPpVMBN3BEz7LW3DBEPvhRjDWiyMSdfaxrlmv0CL-tgD-7h9vNWzQT3z8JVoSitClaLfVW6oE_IopH8_BYE0uAiQCbIBnU07LESxumcKonlSaBi_h4c2JtYY0cIaiJba3b83YcjRkOrQionXgaJNwArt9cF88bCsAfprhoUNL_3faJPJqA9z5hBPkB93j9QIOwfExn2YhBw2ropb3LwZ7FWnPFB5QusxM9AUPez8pF1SXLqdEYVqCwYoAc"
              width={600}
              height={400}
            />
          </div>
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-secondary-container/20 rounded-full blur-3xl -z-0"></div>
          <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary-container/10 rounded-full blur-3xl -z-0"></div>
        </div>
      </div>
    </section>
  );
}
