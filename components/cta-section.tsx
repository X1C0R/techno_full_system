import Image from "next/image";
export const dynamic = "force-dynamic"
export function CTASection() {
  return (
    <section className="py-20 bg-surface" id="pricing">
      <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
        <h2 className="font-(--font-heading) text-5xl text-primary leading-tight">
          Start growing your business today!
        </h2>
        <p className="text-lg text-on-surface-variant leading-relaxed">
          Join thousands of store owners who have already modernized. No hidden
          fees. No complicated setups.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <button className="bg-primary-container text-white px-12 py-5 rounded-2xl font-semibold text-xl shadow-xl hover:scale-105 transition-transform">
            Register for Free
          </button>
          <button className="bg-white border-2 border-primary-container text-primary-container px-12 py-5 rounded-2xl font-semibold text-xl hover:bg-emerald-50 transition-colors">
            View Pricing
          </button>
        </div>
        <div className="pt-8">
          <Image
            alt="Community Stores"
            className="max-w-xs mx-auto opacity-40 grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDw-VB-V08PHrNWFZhkUSeJidcw0NBMUaNKsZ7trFSZ9hTPycxzU9ilPy6VUuV3Lh8nNntQykxQ_rbhL9UAizaENo-Wb4XzV02nDTKi2hgvr-ZcGtblCFohdSR9A4noV2_S5xeaLneviOv7U_7SXEzTXAAylK0x6uYFIehYMgQlgkhD69FQm1vOFrzd7UP2s0mmG-I0a0a_EqcWKoo2BddyIhuVFW1lR5TmLzw-mwOu_VCtqnGwaDAlZ2zmfGLybk2b7Wu3C8jWX0k"
            width={320}
            height={200}
          />
        </div>
      </div>
    </section>
  );
}
