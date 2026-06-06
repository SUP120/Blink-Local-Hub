import { useParams, Link } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ShoppingBag } from "lucide-react";

const CATEGORY_COLORS: Record<string, string> = {
  groceries: "bg-amber-100 text-amber-800",
  "dairy-eggs": "bg-blue-100 text-blue-800",
  "fruits-vegetables": "bg-emerald-100 text-emerald-800",
  snacks: "bg-orange-100 text-orange-800",
  "cold-drinks": "bg-cyan-100 text-cyan-800",
  "frozen-food": "bg-indigo-100 text-indigo-800",
  "instant-ready": "bg-red-100 text-red-800",
  "personal-care": "bg-pink-100 text-pink-800",
  household: "bg-slate-100 text-slate-800",
  "baby-care": "bg-purple-100 text-purple-800",
  "pet-supplies": "bg-lime-100 text-lime-800",
  medicines: "bg-rose-100 text-rose-800",
  electronics: "bg-sky-100 text-sky-800",
  stationery: "bg-yellow-100 text-yellow-800",
};

export default function Category() {
  const params = useParams();
  const slug = params.slug || "";

  const { data: categories } = useListCategories();
  const category = categories?.find((c) => c.slug === slug);

  const { data: productData, isLoading } = useListProducts(
    { category: slug, limit: 60 },
    { query: { enabled: !!slug } }
  );

  const chipColor = CATEGORY_COLORS[slug] ?? "bg-gray-100 text-gray-800";

  return (
    <div className="pb-12">
      <Link
        href="/categories"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="link-back"
      >
        <ArrowLeft className="w-4 h-4" /> All Categories
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 ${chipColor}`}>
          {category?.icon ?? "🛍️"}
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight capitalize">
            {category?.name ?? slug.replace(/-/g, " ")}
          </h1>
          <p className="text-sm text-muted-foreground font-medium">
            {isLoading ? "Loading…" : `${productData?.total ?? 0} products`}
          </p>
        </div>
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
          <ShoppingBag className="w-10 h-10 text-muted-foreground mb-4" />
          <h2 className="text-lg font-bold mb-1">No products yet</h2>
          <p className="text-sm text-muted-foreground">Check back soon!</p>
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
