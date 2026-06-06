import { useListProducts } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function SearchPage() {
  const searchParams = new URLSearchParams(window.location.search);
  const query = searchParams.get("q") || "";

  const { data: productData, isLoading } = useListProducts(
    { search: query, limit: 50 },
    { query: { enabled: !!query } }
  );

  const count = productData?.total ?? 0;

  return (
    <div className="pb-12">
      <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors" data-testid="link-back">
        <ArrowLeft className="w-4 h-4" /> Back
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">
          {query ? `"${query}"` : "Search Results"}
        </h1>
        {!isLoading && query && (
          <p className="text-muted-foreground text-sm">
            {count > 0 ? `${count} product${count !== 1 ? "s" : ""} found` : "No products found"}
          </p>
        )}
      </div>

      {isLoading ? (
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
      ) : productData?.products.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-border flex flex-col items-center card-shadow">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
            <Search className="w-7 h-7 text-muted-foreground" />
          </div>
          <h2 className="text-lg font-bold mb-2">Nothing found</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-6">
            We couldn't find anything for "{query}". Try a different term.
          </p>
          <Link href="/categories" className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold text-sm px-5 py-2.5 rounded-full hover:bg-primary/90 transition-all">
            Browse all categories
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {productData?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
