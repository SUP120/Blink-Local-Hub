import { useParams } from "wouter";
import { useListProducts, useListCategories } from "@workspace/api-client-react";
import { ProductCard } from "@/components/product-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function Category() {
  const params = useParams();
  const slug = params.slug || "";
  
  const { data: categories } = useListCategories();
  const category = categories?.find(c => c.slug === slug);
  
  const { data: productData, isLoading } = useListProducts(
    { category: slug, limit: 50 },
    { query: { enabled: !!slug } }
  );

  return (
    <div className="pb-12">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-2xl">
          {category?.icon || "🛍️"}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight capitalize">
            {category?.name || slug.replace(/-/g, " ")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {productData?.total || 0} products
          </p>
        </div>
      </div>
      
      {isLoading ? (
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
      ) : productData?.products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <div className="text-4xl mb-4">🛒</div>
          <h2 className="text-xl font-semibold mb-2">No products found</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We don't have any products in this category right now. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {productData?.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
