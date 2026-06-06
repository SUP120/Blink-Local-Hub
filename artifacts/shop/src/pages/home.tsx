import { Link } from "wouter";
import { useListCategories, useListFeaturedProducts, useGetStoreSummary } from "@workspace/api-client-react";
import { Clock, ShieldCheck, PackageCheck, ChevronRight, Zap, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

/* Slug → custom PNG icon path (lives in /public/) */
const CATEGORY_IMAGES: Record<string, string> = {
  "baby-care":         "/baby.png",
  "cold-drinks":       "/cold-drinks.png",
  "dairy-eggs":        "/dairy-products.png",
  electronics:         "/electronic-devices.png",
  "frozen-food":       "/frozenfood.png",
  "fruits-vegetables": "/vegetable.png",
};

/* Card accent colours for the icon-grid */
const ICON_GRID_COLORS: Record<string, { bg: string; ring: string; badge: string; text: string }> = {
  "baby-care":         { bg: "from-purple-50 to-pink-50",   ring: "border-purple-200", badge: "bg-purple-100 text-purple-700",  text: "text-purple-900"  },
  "cold-drinks":       { bg: "from-cyan-50   to-blue-50",   ring: "border-cyan-200",   badge: "bg-cyan-100   text-cyan-700",    text: "text-cyan-900"    },
  "dairy-eggs":        { bg: "from-blue-50   to-sky-50",    ring: "border-blue-200",   badge: "bg-blue-100   text-blue-700",    text: "text-blue-900"    },
  electronics:         { bg: "from-slate-50  to-indigo-50", ring: "border-slate-200",  badge: "bg-slate-100  text-slate-700",   text: "text-slate-900"   },
  "frozen-food":       { bg: "from-indigo-50 to-violet-50", ring: "border-indigo-200", badge: "bg-indigo-100 text-indigo-700",  text: "text-indigo-900"  },
  "fruits-vegetables": { bg: "from-emerald-50 to-lime-50",  ring: "border-emerald-200",badge: "bg-emerald-100 text-emerald-700",text: "text-emerald-900" },
};

/* Animated skeleton card for product loading */
function ProductSkeleton({ delay = 0 }: { delay?: number; key?: React.Key }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden border border-border/60 card-shadow animate-fade-in-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Skeleton className="aspect-[4/3] w-full skeleton-shimmer" />
      <div className="p-3 space-y-2.5">
        <Skeleton className="h-3.5 w-full rounded-lg skeleton-shimmer" />
        <Skeleton className="h-3 w-2/3 rounded-lg skeleton-shimmer" />
        <div className="flex justify-between items-center pt-1">
          <Skeleton className="h-5 w-1/3 rounded-lg skeleton-shimmer" />
          <Skeleton className="h-8 w-16 rounded-full skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: featuredProducts, isLoading: isProductsLoading } = useListFeaturedProducts();
  const { data: summary } = useGetStoreSummary();

  return (
    <div className="flex flex-col gap-10 pb-16">

      {/* ── HERO ── */}
      <section className="animate-fade-in-up relative rounded-3xl overflow-hidden bg-[#0a1628] text-white min-h-[320px] md:min-h-[380px] flex items-center border border-white/5 card-shadow">
        {/* Blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/15 blur-3xl" />
          <div className="absolute -bottom-12 -left-12 w-72 h-72 rounded-full bg-violet-500/10 blur-3xl" />
          <div className="absolute top-1/3 left-1/2 w-48 h-48 rounded-full bg-primary/8 blur-2xl" />
          {/* Watermark number */}
          <div className="absolute top-1/2 right-6 -translate-y-1/2 opacity-[0.05] select-none pointer-events-none">
            <span className="text-[220px] md:text-[300px] font-black leading-none tracking-tighter">10</span>
          </div>
        </div>

        <div className="relative z-10 px-8 md:px-14 py-14 flex flex-col md:flex-row md:items-center gap-10 w-full">
          <div className="flex-1 max-w-lg">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 text-primary text-xs font-bold px-3 py-1.5 rounded-full mb-6 animate-slide-right delay-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              Now delivering in your area
            </div>

            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-[1.08] text-balance mb-4 animate-fade-in-up delay-150">
              Groceries in{" "}
              <span className="text-primary">10 minutes.</span>
              <br />
              <span className="text-white/75 text-3xl md:text-4xl font-bold">No kidding.</span>
            </h1>

            <p className="text-white/55 text-base font-medium mb-8 max-w-sm animate-fade-in-up delay-200">
              {summary?.totalProducts ?? "1,000"}+ products. Fresh produce, daily essentials, and cravings — delivered before your chai gets cold.
            </p>

            <div className="flex flex-wrap gap-3 animate-fade-in-up delay-300">
              <Link
                href="/categories"
                className="inline-flex items-center gap-2 bg-primary text-white font-bold text-sm px-6 py-3 rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30 glow-primary"
                data-testid="button-shop-now"
              >
                Shop Now <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/ai"
                className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/18 active:scale-95 transition-all backdrop-blur-sm"
                data-testid="button-ai-shop"
              >
                <Sparkles className="w-4 h-4 text-primary" /> AI Shop
              </Link>
            </div>
          </div>

          {/* Feature pills – desktop */}
          <div className="hidden md:flex flex-col gap-3 shrink-0 animate-fade-in-up delay-400">
            {[
              { icon: Clock,        label: "10-min delivery", sub: "Real-time tracking" },
              { icon: ShieldCheck,  label: "Quality assured",  sub: "Handpicked products" },
              { icon: PackageCheck, label: "Free delivery",    sub: "On orders above ₹199" },
            ].map(({ icon: Icon, label, sub }) => (
              <div key={label} className="flex items-center gap-3 glass-dark rounded-2xl px-4 py-3 w-64">
                <div className="w-9 h-9 rounded-xl bg-primary/25 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{label}</div>
                  <div className="text-xs text-white/45">{sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VALUE STRIP (mobile) ── */}
      <div className="md:hidden grid grid-cols-3 gap-3 animate-fade-in-up delay-100">
        {[
          { icon: Clock,        label: "10 min",  sub: "Delivery" },
          { icon: ShieldCheck,  label: "100%",    sub: "Fresh" },
          { icon: PackageCheck, label: "Free",    sub: "Above ₹199" },
        ].map(({ icon: Icon, label, sub }, i) => (
          <div
            key={label}
            className="bg-white rounded-2xl p-3 text-center border border-border/60 card-shadow flex flex-col items-center gap-1 animate-scale-in"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center mb-1">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <div className="text-base font-black text-foreground leading-none">{label}</div>
            <div className="text-[11px] text-muted-foreground font-medium">{sub}</div>
          </div>
        ))}
      </div>

      {/* ── POPULAR CATEGORIES (icon grid) ── */}
      <section className="animate-fade-in-up delay-100">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Popular Categories</h2>
            <p className="text-sm text-muted-foreground">Browse top picks instantly</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1 transition-all hover:gap-2"
          >
            See all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl border border-border/60 p-4 flex flex-col items-center gap-3 animate-fade-in-up"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Skeleton className="w-16 h-16 rounded-2xl skeleton-shimmer" />
                <Skeleton className="h-3 w-3/4 rounded-lg skeleton-shimmer" />
                <Skeleton className="h-5 w-1/2 rounded-full skeleton-shimmer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {categories
              ?.filter((cat) => CATEGORY_IMAGES[cat.slug])
              .map((cat, i) => {
                const imgSrc = CATEGORY_IMAGES[cat.slug];
                const color = ICON_GRID_COLORS[cat.slug] ?? {
                  bg: "from-gray-50 to-white", ring: "border-gray-200",
                  badge: "bg-gray-100 text-gray-700", text: "text-gray-900",
                };
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className={`bg-gradient-to-br ${color.bg} ${color.ring} border rounded-2xl p-4 flex flex-col items-center gap-2 group hover:-translate-y-1.5 hover:shadow-lg active:translate-y-0 transition-all duration-200 card-shadow animate-scale-in`}
                    style={{ animationDelay: `${i * 55}ms` }}
                    data-testid={`icon-card-${cat.slug}`}
                  >
                    <div className="w-16 h-16 flex items-center justify-center">
                      <img
                        src={imgSrc}
                        alt={cat.name}
                        className="w-14 h-14 object-contain drop-shadow-sm group-hover:scale-110 group-hover:drop-shadow-md transition-all duration-250"
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-xs font-bold leading-tight ${color.text}`}>{cat.name}</p>
                      <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fade-in-up delay-200">
        <div className="rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white relative overflow-hidden border border-emerald-400/30 card-shadow group hover:shadow-xl transition-shadow">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-15 select-none group-hover:scale-110 transition-transform duration-300">🛒</div>
          <div className="relative">
            <div className="text-xs font-bold bg-white/20 inline-block px-2.5 py-1 rounded-full mb-3 tracking-wide">FREE DELIVERY</div>
            <h3 className="text-xl font-black mb-1">Orders above ₹199</h3>
            <p className="text-sm text-white/70 mb-5">No delivery charges. Ever.</p>
            <Link href="/categories" className="inline-flex items-center gap-1 bg-white text-emerald-700 font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
              Shop Now <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 p-6 text-white relative overflow-hidden border border-violet-400/30 card-shadow group hover:shadow-xl transition-shadow">
          <div className="absolute -right-6 -bottom-6 text-8xl opacity-15 select-none group-hover:scale-110 transition-transform duration-300">⚡</div>
          <div className="relative">
            <div className="text-xs font-bold bg-white/20 inline-block px-2.5 py-1 rounded-full mb-3 tracking-wide">FLASH DELIVERY</div>
            <h3 className="text-xl font-black mb-1">Under 10 minutes</h3>
            <p className="text-sm text-white/70 mb-5">Faster than your microwave.</p>
            <Link href="/ai" className="inline-flex items-center gap-1 bg-white text-violet-700 font-bold text-xs px-4 py-2 rounded-full hover:scale-105 transition-transform shadow-md">
              <Sparkles className="w-3 h-3" /> AI Order <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── BESTSELLERS ── */}
      <section className="animate-fade-in-up delay-200">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-extrabold tracking-tight">Bestsellers</h2>
            <p className="text-sm text-muted-foreground">Most loved in your area</p>
          </div>
          <Link
            href="/categories"
            className="text-sm font-bold text-primary hover:underline flex items-center gap-1 hover:gap-2 transition-all"
            data-testid="link-see-all-products"
          >
            View all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isProductsLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} delay={i * 45} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {featuredProducts?.map((product, i) => (
              <div
                key={product.id}
                className="animate-fade-in-up"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="animate-fade-in-up delay-300 rounded-3xl bg-[#0a1628] text-white px-8 py-12 text-center relative overflow-hidden border border-white/5 card-shadow">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] select-none pointer-events-none">
          <Zap className="w-[360px] h-[360px]" />
        </div>
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 text-primary bg-primary/15 border border-primary/25 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Smart Shopping
          </div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Still scrolling?</h2>
          <p className="text-white/50 text-sm mb-7 max-w-xs mx-auto">Your groceries could already be on their way.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-8 py-3.5 rounded-full hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/30"
            >
              Start Shopping <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/ai"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-6 py-3.5 rounded-full hover:bg-white/15 active:scale-95 transition-all backdrop-blur-sm"
            >
              <Sparkles className="w-4 h-4 text-primary" /> Try AI Shop
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
