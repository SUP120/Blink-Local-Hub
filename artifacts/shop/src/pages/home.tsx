import { Link } from "wouter";
import { useListCategories, useListFeaturedProducts } from "@workspace/api-client-react";
import { Clock, Zap, ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const { data: categories, isLoading: isCategoriesLoading } = useListCategories();
  const { data: featuredProducts, isLoading: isProductsLoading } = useListFeaturedProducts();

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* Hero Banner */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-emerald-800 to-primary text-white p-8 md:p-12 shadow-lg flex flex-col justify-center min-h-[240px]">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 opacity-20 pointer-events-none">
          <Zap className="w-64 h-64" />
        </div>
        <div className="relative z-10 max-w-xl">
          <Badge className="bg-white/20 text-white hover:bg-white/30 mb-4 border-none px-3 py-1">
            ⚡ Flash Delivery
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Groceries delivered in 10 minutes.
          </h1>
          <p className="text-lg md:text-xl text-emerald-50 mb-6 font-medium max-w-md">
            Fresh produce, daily essentials, and cravings met at lightning speed.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold">
            <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5 backdrop-blur-md">
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>10 Min Delivery</span>
            </div>
            <div className="flex items-center gap-1.5 bg-black/20 rounded-full px-3 py-1.5 backdrop-blur-md">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Quality Assured</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
          <Link href="/categories" className="text-sm font-semibold text-primary hover:underline">
            See all
          </Link>
        </div>
        
        {isCategoriesLoading ? (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-2xl" />
                <Skeleton className="w-16 h-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 md:grid-cols-8 gap-x-4 gap-y-6">
            {categories?.slice(0, 8).map((category) => (
              <Link 
                key={category.id} 
                href={`/category/${category.slug}`}
                className="flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-3xl group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/20 transition-all">
                  {category.icon}
                </div>
                <span className="text-xs font-medium text-center text-gray-700 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Featured Products */}
      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 tracking-tight">Bestsellers</h2>
          <p className="text-sm text-muted-foreground">Most popular items in your area</p>
        </div>
        
        {isProductsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-2/3 h-3" />
                <div className="flex justify-between mt-2">
                  <Skeleton className="w-1/3 h-5" />
                  <Skeleton className="w-1/3 h-8 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// Needed to make Badge work in the file scope without extra import
function Badge({ children, className }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${className}`}>
      {children}
    </div>
  );
}
