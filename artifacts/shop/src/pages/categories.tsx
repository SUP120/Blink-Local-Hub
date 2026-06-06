import { Link } from "wouter";
import { useListCategories } from "@workspace/api-client-react";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_COLORS: Record<string, string> = {
  groceries: "from-amber-400/20 to-amber-50 border-amber-200 text-amber-900",
  "dairy-eggs": "from-blue-400/20 to-blue-50 border-blue-200 text-blue-900",
  "fruits-vegetables": "from-emerald-400/20 to-emerald-50 border-emerald-200 text-emerald-900",
  snacks: "from-orange-400/20 to-orange-50 border-orange-200 text-orange-900",
  "cold-drinks": "from-cyan-400/20 to-cyan-50 border-cyan-200 text-cyan-900",
  "frozen-food": "from-indigo-400/20 to-indigo-50 border-indigo-200 text-indigo-900",
  "instant-ready": "from-red-400/20 to-red-50 border-red-200 text-red-900",
  "personal-care": "from-pink-400/20 to-pink-50 border-pink-200 text-pink-900",
  household: "from-slate-400/20 to-slate-50 border-slate-200 text-slate-900",
  "baby-care": "from-purple-400/20 to-purple-50 border-purple-200 text-purple-900",
  "pet-supplies": "from-lime-400/20 to-lime-50 border-lime-200 text-lime-900",
  medicines: "from-rose-400/20 to-rose-50 border-rose-200 text-rose-900",
  electronics: "from-sky-400/20 to-sky-50 border-sky-200 text-sky-900",
  stationery: "from-yellow-400/20 to-yellow-50 border-yellow-200 text-yellow-900",
};

export default function Categories() {
  const { data: categories, isLoading } = useListCategories();

  return (
    <div className="pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight mb-1">All Categories</h1>
        <p className="text-muted-foreground text-sm">Everything you need, delivered in minutes.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories?.map((cat) => {
            const colors = CATEGORY_COLORS[cat.slug] ?? "from-gray-400/20 to-gray-50 border-gray-200 text-gray-900";
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className={`relative bg-gradient-to-br ${colors} border rounded-2xl p-5 flex flex-col gap-3 group hover:-translate-y-1 active:translate-y-0 transition-all duration-200 card-shadow hover:card-shadow-hover`}
                data-testid={`card-category-${cat.slug}`}
              >
                <div className="text-4xl">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-base leading-tight">{cat.name}</h3>
                  <p className="text-sm opacity-60 font-medium mt-0.5">{cat.productCount} items</p>
                </div>
                <ChevronRight className="absolute bottom-4 right-4 w-4 h-4 opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5 transition-all" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
