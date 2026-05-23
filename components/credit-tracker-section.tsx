export const dynamic = "force-dynamic"
export function CreditTrackerSection() {
  return (
    <section className="py-20 bg-white" id="pautang">
      <div className="max-w-7xl mx-auto px-6">
        <div className="bg-primary text-white rounded-[3rem] p-12 lg:p-20 relative overflow-hidden">
          <div className="relative z-10 flex flex-col lg:flex-row gap-12 items-center">
            <div className="lg:w-1/2 space-y-6">
              <h2 className="font-(--font-heading) text-5xl leading-tight">
                Say Goodbye to Credit Stress
              </h2>
              <p className="text-lg opacity-80 leading-relaxed">
                The &quot;Credit Tracker&quot; is designed for local business
                needs. Easily record customer names, amounts, and due dates.
                Keep your accounts balanced without the hassle.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-secondary font-(--font-heading) text-2xl">
                    98%
                  </p>
                  <p className="text-xs opacity-70">Payment recovery increase</p>
                </div>
                <div className="bg-white/10 p-4 rounded-2xl">
                  <p className="text-secondary font-(--font-heading) text-2xl">
                    0
                  </p>
                  <p className="text-xs opacity-70">Lost notebooks</p>
                </div>
              </div>
            </div>
            <div className="lg:w-1/2 w-full">
              <div className="bg-white text-on-surface rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b pb-4 mb-4">
                  <span
                    className="material-symbols-outlined text-secondary-container"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    add_circle
                  </span>
                  <span className="font-semibold text-2xl text-primary">
                    New Credit Record
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-outline uppercase mb-1">
                      Customer Name
                    </label>
                    <input
                      className="w-full border-outline-variant rounded-lg p-3"
                      readOnly
                      type="text"
                      value="Aling Tessie"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-outline uppercase mb-1">
                        Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-outline">
                          ₱
                        </span>
                        <input
                          className="w-full border-outline-variant rounded-lg p-3 pl-8"
                          readOnly
                          type="text"
                          value="250.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-outline uppercase mb-1">
                        Date
                      </label>
                      <input
                        className="w-full border-outline-variant rounded-lg p-3"
                        readOnly
                        type="text"
                        value="Oct 24, 2023"
                      />
                    </div>
                  </div>
                  <button className="w-full bg-secondary-container text-on-secondary-container font-semibold text-sm py-3 rounded-xl shadow-md">
                    Save Record
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-linear-to-l from-white/5 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </section>
  );
}
