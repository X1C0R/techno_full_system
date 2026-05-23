export const dynamic = "force-dynamic"
export function InventorySection() {
  return (
    <section
      className="py-20 bg-surface-container-low overflow-hidden"
      id="inventory"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 space-y-8">
            <div className="inline-block px-4 py-1 bg-secondary-container/20 text-secondary rounded-full font-semibold text-sm">
              Product Spotlight
            </div>
            <h2 className="font-[var(--font-heading)] font-bold text-5xl text-primary leading-tight">
              Be a Pro at Managing Items
            </h2>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              Stop guessing your costs and sales. With our smart inventory list,
              all your prices are organized and easy to update.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  check_circle
                </span>
                Quick add via barcode scanning
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  check_circle
                </span>
                Categories for easier searching
              </li>
              <li className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary-container">
                  check_circle
                </span>
                Expiration date tracking for perishable goods
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 relative w-full">
            <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 border border-outline-variant/30">
              <div className="flex justify-between items-center mb-8">
                <h4 className="font-[var(--font-heading)] font-semibold text-2xl text-primary">
                  Inventory List
                </h4>
                <button className="bg-primary-container text-white px-4 py-2 rounded-xl text-sm font-semibold">
                  Add Item
                </button>
              </div>
              <div className="space-y-4">
                {/* Mockup Row 1 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary-container/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container">
                        egg
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface">
                        Eggs (Large)
                      </p>
                      <p className="text-xs font-medium text-outline">
                        Category: Fresh Goods
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary-container">
                      ₱10.00 / pc
                    </p>
                    <p className="text-xs font-bold text-secondary">
                      48 pcs left
                    </p>
                  </div>
                </div>
                {/* Mockup Row 2 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary-container/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container">
                        liquor
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface">
                        Softdrink (1.5L)
                      </p>
                      <p className="text-xs font-medium text-outline">
                        Category: Beverages
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary-container">
                      ₱75.00 / btl
                    </p>
                    <p className="text-xs font-bold text-error">12 btls left</p>
                  </div>
                </div>
                {/* Mockup Row 3 */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-lowest border border-outline-variant/20 hover:border-primary-container/30 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary-container/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary-container">
                        cleaning_services
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-on-surface">
                        Laundry Soap (Sachet)
                      </p>
                      <p className="text-xs font-medium text-outline">
                        Category: Home Care
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm text-primary-container">
                      ₱15.00 / pc
                    </p>
                    <p className="text-xs font-bold text-primary-container">
                      120 pcs left
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
