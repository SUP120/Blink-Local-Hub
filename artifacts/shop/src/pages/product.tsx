import { useParams, Link } from "wouter";
import {
  useGetProduct,
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Minus, ChevronLeft, Loader2, ShieldCheck, Zap, RotateCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const IMG_BG: Record<string, string> = {
  groceries: "bg-amber-50",
  "dairy-eggs": "bg-blue-50",
  "fruits-vegetables": "bg-emerald-50",
  snacks: "bg-orange-50",
  "cold-drinks": "bg-cyan-50",
  "frozen-food": "bg-indigo-50",
  "instant-ready": "bg-red-50",
  "personal-care": "bg-pink-50",
  household: "bg-slate-50",
  "baby-care": "bg-purple-50",
  "pet-supplies": "bg-lime-50",
  medicines: "bg-rose-50",
  electronics: "bg-sky-50",
  stationery: "bg-yellow-50",
};

export default function ProductDetail() {
  const params = useParams();
  const productId = Number(params.id);
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: getGetCartQueryKey() as unknown as never },
  });
  const { data: cart } = useGetCart();

  const addToCart = useAddToCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <Skeleton className="h-5 w-32 mb-6" />
        <div className="flex flex-col md:flex-row gap-10">
          <Skeleton className="w-full md:w-1/2 aspect-square rounded-3xl" />
          <div className="w-full md:w-1/2 space-y-4 pt-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-8 w-28 mt-4" />
            <Skeleton className="h-14 w-full mt-6 rounded-full" />
            <div className="space-y-2 mt-6">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-5/6" />
              <Skeleton className="h-3.5 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-24">
        <h1 className="text-xl font-extrabold mb-4">Product not found</h1>
        <Link href="/" className="text-primary font-semibold hover:underline">Home</Link>
      </div>
    );
  }

  const cartItem = cart?.items.find((i) => i.productId === product.id);
  const quantity = cartItem?.quantity ?? 0;
  const isPending = addToCart.isPending || updateCart.isPending || removeCart.isPending;

  const handleAdd = () =>
    addToCart.mutate({ data: { productId: product.id, quantity: 1 } }, { onSuccess: invalidate });

  const handleIncrement = () =>
    updateCart.mutate({ productId: product.id, data: { quantity: quantity + 1 } }, { onSuccess: invalidate });

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeCart.mutate({ productId: product.id }, { onSuccess: invalidate });
    } else {
      updateCart.mutate({ productId: product.id, data: { quantity: quantity - 1 } }, { onSuccess: invalidate });
    }
  };

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const imgBg = IMG_BG[product.categorySlug] ?? "bg-gray-50";

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link
        href={`/category/${product.categorySlug}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="link-back"
      >
        <ChevronLeft className="w-4 h-4" /> {product.categoryName}
      </Link>

      <div className="flex flex-col md:flex-row gap-10">
        {/* Image */}
        <div className="w-full md:w-1/2">
          <div className={`relative aspect-square rounded-3xl overflow-hidden ${imgBg} flex items-center justify-center p-10`}>
            {discount > 0 && (
              <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-black px-3 py-1 rounded-full shadow-sm z-10">
                {discount}% OFF
              </div>
            )}
            <img
              src={product.imageUrl || `https://picsum.photos/seed/product-${product.id}/600/600`}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-[1.04] transition-transform duration-500"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full shadow-sm text-emerald-700">
              <Clock className="w-3.5 h-3.5" />
              {product.deliveryTime}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-2">
            <Link
              href={`/category/${product.categorySlug}`}
              className="text-xs font-bold text-primary uppercase tracking-wider hover:underline"
            >
              {product.categoryName}
            </Link>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight mb-2 text-balance">
            {product.name}
          </h1>
          <p className="text-sm text-muted-foreground font-medium mb-6">{product.unit}</p>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-black tracking-tight">₹{product.price}</span>
            {product.originalPrice && (
              <>
                <span className="text-lg text-muted-foreground line-through font-medium mb-1">₹{product.originalPrice}</span>
                <span className="text-sm font-bold text-rose-500 mb-1">{discount}% off</span>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="mb-8">
            {!product.inStock ? (
              <div className="h-14 flex items-center justify-center bg-secondary rounded-2xl text-muted-foreground font-bold text-base">
                Out of Stock
              </div>
            ) : quantity > 0 ? (
              <div className="flex items-center justify-between bg-primary rounded-2xl h-14 px-3 shadow-md shadow-primary/20">
                <button
                  onClick={handleDecrement}
                  disabled={isPending}
                  className="w-12 h-10 rounded-xl flex items-center justify-center text-primary-foreground hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
                  data-testid="button-decrement"
                >
                  <Minus className="w-5 h-5" />
                </button>
                <div className="flex-1 flex items-center justify-center text-primary-foreground font-black text-lg">
                  {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : `${quantity} in cart`}
                </div>
                <button
                  onClick={handleIncrement}
                  disabled={isPending}
                  className="w-12 h-10 rounded-xl flex items-center justify-center text-primary-foreground hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
                  data-testid="button-increment"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isPending}
                className="w-full h-14 bg-primary text-primary-foreground font-extrabold text-base rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-60"
                data-testid="button-add"
              >
                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                Add to Cart
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            {[
              { icon: Zap, label: "10-min delivery" },
              { icon: ShieldCheck, label: "Quality assured" },
              { icon: RotateCcw, label: "Easy returns" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="bg-secondary rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-[11px] font-semibold text-muted-foreground leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Description */}
          <div className="border-t border-border/60 pt-6">
            <h3 className="font-extrabold text-sm mb-3">Product Details</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description ??
                `High quality ${product.name.toLowerCase()} sourced locally. Freshness guaranteed. Delivered to your doorstep in minutes.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
