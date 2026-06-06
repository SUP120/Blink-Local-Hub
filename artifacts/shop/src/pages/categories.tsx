import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">All Categories</h1>
      
      {isLoading ? (
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="w-full aspect-square rounded-2xl" />
              <Skeleton className="w-16 h-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-x-4 gap-y-8">
          {categories?.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div className="w-full aspect-square rounded-2xl bg-white border border-gray-100 shadow-sm flex items-center justify-center text-4xl group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/20 transition-all">
                {category.icon}
              </div>
              <span className="text-sm font-semibold text-center text-gray-700 group-hover:text-primary transition-colors leading-tight">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
