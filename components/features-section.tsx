import Image from "next/image";
export const dynamic = "force-dynamic"
export function FeaturesSection() {
  return (
    <section className="py-20 bg-white" id="features">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 space-y-4">
          <h2 className="font-(--font-heading) text-primary text-4xl">
            Why choose Tory?
          </h2>
          <p className="text-on-surface-variant text-lg max-w-2xl mx-auto">
            Faster, clearer, and much easier to use than your old notebook.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Feature 1 - Inventory Management */}
          <div className="md:col-span-8 bg-surface-container-low p-8 rounded-3xl border border-primary-container/5 hover:shadow-lg transition-all group">
            <div className="flex flex-col h-full justify-between">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-primary-container text-white rounded-2xl flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-2xl">
                    inventory_2
                  </span>
                </div>
                <h3 className="font-(--font-heading) text-2xl text-primary">
                  Inventory Management
                </h3>
                <p className="text-on-surface-variant max-w-md leading-relaxed">
                  Track your stock levels in real-time. Receive
                  &quot;Low Stock&quot; alerts before your products run out.
                </p>
              </div>
              <div className="mt-8 overflow-hidden rounded-xl border border-outline-variant bg-white p-4">
                <div className="flex items-center justify-between border-b pb-2 mb-2 text-xs font-medium text-outline">
                  <span>Item Name</span>
                  <span>Stock</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-sm">
                    Canned Tuna (155g)
                  </span>
                  <span className="text-error font-bold">5 Left</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-semibold text-sm">Instant Noodles</span>
                  <span className="text-primary-container font-bold">
                    42 Left
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 2 - Credit Tracker */}
          <div className="md:col-span-4 bg-secondary-container/10 p-8 rounded-3xl border border-secondary-container/20 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-secondary-container text-on-secondary-container rounded-2xl flex items-center justify-center mb-6">
              <span
                className="material-symbols-outlined text-2xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                menu_book
              </span>
            </div>
            <h3 className="font-(--font-heading) text-2xl text-primary">
              Credit Tracker
            </h3>
            <p className="text-on-surface-variant mt-4 leading-relaxed">
              No more forgotten debts! Manage customer credits easily and send
              automated payment reminders.
            </p>
            <div className="mt-8 space-y-3">
              <div className="bg-white p-3 rounded-xl shadow-sm border border-secondary-container/10">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-outline">
                    Aling Nena
                  </span>
                  <span className="text-xs font-bold text-error">₱120.00</span>
                </div>
              </div>
              <div className="bg-white p-3 rounded-xl shadow-sm border border-secondary-container/10 opacity-60">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-outline">
                    Mang Jose
                  </span>
                  <span className="text-xs font-bold text-primary-container">
                    PAID
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 - Sales Reports */}
          <div className="md:col-span-12 lg:col-span-4 bg-surface-container-highest p-8 rounded-3xl border border-primary-container/5 hover:shadow-lg transition-all">
            <div className="w-12 h-12 bg-on-primary-container text-white rounded-2xl flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-2xl">
                bar_chart
              </span>
            </div>
            <h3 className="font-(--font-heading) text-2xl text-primary">
              Sales Reports
            </h3>
            <p className="text-on-surface-variant mt-4 leading-relaxed">
              View your daily and monthly profits at a glance. Stay informed
              about your business performance.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
