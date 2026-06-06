import { Link } from "wouter";
import { useListCategories, useListFeaturedProducts, useGetStoreSummary } from "@workspace/api-client-react";
import { Clock, ShieldCheck, PackageCheck, ChevronRight, Zap } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_COLORS: Record<string, string> = {
  groceries: "bg-amber-100 text-amber-800 hover:bg-amber-200",
  "dairy-eggs": "bg-blue-100 text-blue-800 hover:bg-blue-200",
  "fruits-vegetables": "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  snacks: "bg-orange-100 text-orange-800 hover:bg-orange-200",
  "cold-drinks": "bg-cyan-100 text-cyan-800 hover:bg-cyan-200",
  "frozen-food": "bg-indigo-100 text-indigo-800 hover:bg-indigo-200",
  "instant-ready": "bg-red-100 text-red-800 hover:bg-red-200",
  "personal-care": "bg-pink-100 text-pink-800 hover:bg-pink-200",
  household: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  "baby-care": "bg-purple-100 text-purple-800 hover:bg-purple-200",
  "pet-supplies": "bg-lime-100 text-lime-800 hover:bg-lime-200",
  medicines: "bg-rose-100 text-rose-800 hover:bg-rose-200",
  electronics: "bg-sky-100 text-sky-800 hover:bg-sky-200",
  stationery: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
};

/* Slug → custom PNG icon path (lives in /public/) */
const CATEGORY_IMAGES: Record<string, string> = {
  "baby-care": "/baby.png",
  "cold-drinks": "/cold-drinks.png",
  "dairy-eggs": "/dairy-products.png",
  electronics: "/electronic-devices.png",
  "frozen-food": "/frozenfood.png",
  "fruits-vegetables": "/vegetable.png",
};

/* Card accent colours for the icon-grid */
const ICON_GRID_COLORS: Record<string, { bg: string; badge: string; text: string }> = {
  "baby-care":        { bg: "from-purple-50 to-pink-50   border-purple-200", badge: "bg-purple-100 text-purple-700", text: "text-purple-900" },
  "cold-drinks":      { bg: "from-cyan-50   to-blue-50   border-cyan-200",   badge: "bg-cyan-100   text-cyan-700",   text: "text-cyan-900"   },
  "dairy-eggs":       { bg: "from-blue-50   to-sky-50    border-blue-200",   badge: "bg-blue-100   text-blue-700",   text: "text-blue-900"   },
  electronics:        { bg: "from-slate-50  to-indigo-50 border-slate-200",  badge: "bg-slate-100  text-slate-700",  text: "text-slate-900"  },
  "frozen-food":      { bg: "from-indigo-50 to-violet-50 border-indigo-200", badge: "bg-indigo-100 text-indigo-700", text: "text-indigo-900" },
  "fruits-vegetables":{ bg: "from-emerald-50 to-lime-50  border-emerald-200",badge: "bg-emerald-100 text-emerald-700",text:"text-emerald-900"},
};

export default function Home() {
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: featuredProducts, isLoading: isProductsLoading } = useListFeaturedProducts();
  const { data: summary } = useGetStoreSummary();

  return (
    <div className="flex flex-col gap-10 pb-12">

      {/* ── HERO ── */}
      <section className="relative rounded-3xl overflow-hidden bg-[#0f172a] text-white min-h-[300px] md:min-h-[360px] flex items-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-primary/5 blur-2xl" />
          <div className="absolute top-1/2 right-8 -translate-y-1/2 opacity-[0.06] select-none">
            <span className="text-[220px] md:text-[300px] font-black leading-none tracking-tighter">10</span>
          </div>
        </div>

        <div className="relative z-10 px-8 md:px-12 py-12 flex flex-col md:flex-row md:items-center gap-8 w-full">
          <div className="flex-1 max-w-lg">
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-5 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now delivering in your area
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.05] text-balance mb-4">
              Groceries in{" "}
              <span className="text-primary">10 minutes.</span>
              <br />
              <span className="text-white/80 text-3xl md:text-4xl font-bold">No kidding.</span>
            </h1>

            <p className="text-white/60 text-base font-medium mb-8 max-w-sm">
              {summary?.totalProducts ?? "1,000"}+ products. Fresh produce, daily essentials, and cravings — all at your door before your tea gets cold.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-5 py-3 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30"
                data-testid="button-shop-now"
              >
                Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-5 py-3 rounded-full hover:bg-white/15 active:scale-95 transition-all backdrop-blur-sm"
                data-testid="button-browse-categories"
              >
                Browse Categories
              </Link>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3 shrink-0">
            {[
              { icon: Clock, label: "10-min delivery", sub: "Real-time tracking" },
              { icon: ShieldCheck, label: "Quality assured", sub: "Handpicked products" },
              { icon: PackageCheck, label: "Free delivery", sub: "On orders above ₹199" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 bg-white/8 border border-white/12 rounded-2xl px-4 py-3 backdrop-blur-sm w-64">
                <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{label}</div>
                  <div className="text-xs text-white/50">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STRIP (mobile) ── */}
      <div className="md:hidden grid grid-cols-3 gap-3">
        {[
          { icon: Clock, label: "10 min", sub: "Delivery" },
          { icon: ShieldCheck, label: "100%", sub: "Fresh" },
          { icon: PackageCheck, label: "Free", sub: "Above ₹199" },
        ].map(({ icon: Icon, label, sub }) => (
          <div key={label} className="bg-white rounded-2xl p-3 text-center card-shadow flex flex-col items-center gap-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-base font-black text-foreground leading-none">{label}</div>
            <div className="text-[11px] text-muted-foreground font-medium">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── CATEGORIES ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Shop by Category</h2>
            <p className="text-sm text-muted-foreground">{summary?.totalCategories ?? 14} categories</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            data-testid="link-see-all-categories"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-32 rounded-full shrink-0" />
            ))}
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1">
            {categories?.map((cat) => {
              const colors = CATEGORY_COLORS[cat.slug] ?? "bg-gray-100 text-gray-800 hover:bg-gray-200";
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold text-sm whitespace-nowrap transition-all active:scale-95 shrink-0 ${colors}`}
                  data-testid={`link-category-${cat.slug}`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  {cat.name}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ── FEATURED CATEGORY ICON GRID ── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Popular Categories</h2>
            <p className="text-sm text-muted-foreground">Tap to browse top picks</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
          >
            All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories
              ?.filter((cat) => CATEGORY_IMAGES[cat.slug])
              .map((cat) => {
                const imgSrc = CATEGORY_IMAGES[cat.slug];
                const color = ICON_GRID_COLORS[cat.slug] ?? {
                  bg: "from-gray-50 to-white border-gray-200",
                  badge: "bg-gray-100 text-gray-700",
                  text: "text-gray-900",
                };
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`bg-gradient-to-br ${color.bg} border rounded-2xl p-4 flex flex-col items-center gap-2 group hover:-translate-y-1 active:translate-y-0 transition-all duration-200 shadow-sm hover:shadow-md`}
                    data-testid={`icon-card-${cat.slug}`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-14 h-14 object-contain drop-shadow-sm group-hover:scale-110 transition-transform duration-200"
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold leading-tight ${color.text}`}>{cat.name}</p>
                      <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
                        {cat.productCount} items
                      </span>
                    </div>
                  </Link>
                );
              })}
          </div>
        )}
      </section>

      {/* ── PROMO BANNERS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 select-none">🛒</div>
          <div className="relative">
            <div className="text-xs font-bold bg-white/20 inline-block px-2 py-0.5 rounded-full mb-2">FREE DELIVERY</div>
            <h3 className="text-xl font-black mb-1">Orders above ₹199</h3>
            <p className="text-sm text-white/75 mb-4">No delivery charges. Ever.</p>
            <Link href="/categories" className="inline-flex items-center gap-1 bg-white text-emerald-700 font-bold text-xs px-3 py-1.5 rounded-full hover:scale-105 transition-transform">
              Shop Now <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 text-7xl opacity-20 select-none">⚡</div>
          <div className="relative">
            <div className="text-xs font-bold bg-white/20 inline-block px-2 py-0.5 rounded-full mb-2">FLASH DELIVERY</div>
            <h3 className="text-xl font-black mb-1">Under 10 minutes</h3>
            <p className="text-sm text-white/75 mb-4">Faster than your microwave.</p>
            <Link href="/categories" className="inline-flex items-center gap-1 bg-white text-violet-700 font-bold text-xs px-3 py-1.5 rounded-full hover:scale-105 transition-transform">
              Order Now <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── FEATURED PRODUCTS ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Bestsellers</h2>
            <p className="text-sm text-muted-foreground">Most popular in your area</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1"
            data-testid="link-see-all-products"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden card-shadow">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-3 space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                  <div className="flex justify-between pt-1">
                    <Skeleton className="h-5 w-1/3" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="rounded-3xl bg-[#0f172a] text-white px-8 py-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-5 select-none pointer-events-none">
          <Zap className="w-96 h-96" />
        </div>
        <div className="relative z-10">
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Still scrolling?</h2>
          <p className="text-white/60 text-sm mb-6">Your groceries could already be on their way.</p>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30"
          >
            Start Shopping <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
