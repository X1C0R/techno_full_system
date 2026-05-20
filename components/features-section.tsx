import Image from "next/image";

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

          {/* Feature 4 - Mobile App */}
          <div className="md:col-span-12 lg:col-span-8 bg-primary-container text-white p-8 rounded-3xl flex flex-col md:flex-row items-center gap-8">
            <div className="space-y-4 md:w-1/2">
              <h3 className="font-(--font-heading) text-2xl">
                Mobile App for the Go-Getter
              </h3>
              <p className="opacity-90 leading-relaxed">
                Works even offline! No signal in your shop? No problem. Sync
                your data once you&apos;re back online.
              </p>
              <button className="bg-white text-primary-container font-semibold text-sm px-6 py-2 rounded-lg mt-4 flex items-center gap-2">
                <span className="material-symbols-outlined">download</span>
                Download App
              </button>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <Image
                alt="Mobile App Interface"
                className="w-48 h-auto rounded-3xl shadow-xl transform rotate-6"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAuhgH7Znm-mJShw7t9icrdEpHvm0I3nV7nMsRKaQw68iD6-t6_fkVUSi9ijVrgVxAolA8agNbQIkRAgfCh3NbujwwY9ruVgV8aIWeraK8_TIcYTM0X5e7P0nSe9LhpZ3F3gjTs4Jj6bLu89RyCFxAYFJRhoh_77hsNJXDOtxTOY7VpoflYeHJYhfnvGqV8_z_d8N9E8hBqJjNFzzoExIwdUC-ogPcW3WDIZb641MhWXK60BlNQfr9BYhcq5MPOFWvkizHGg0gQM1Y"
                width={192}
                height={400}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
