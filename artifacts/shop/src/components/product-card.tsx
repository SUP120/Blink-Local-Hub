import { useState } from "react";
import { Link } from "wouter";
import { Plus, Minus, Clock, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Product,
  useGetCart,
  useAddToCart,
  useUpdateCartItem,
  useRemoveFromCart,
  getGetCartQueryKey,
} from "@workspace/api-client-react";

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

export function ProductCard({ product }: { product: Product }) {
  const { data: cart } = useGetCart();
  const queryClient = useQueryClient();

  const addToCart = useAddToCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();

  const [justAdded, setJustAdded] = useState(false);

  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const handleAdd = () => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          invalidate();
          setJustAdded(true);
          setTimeout(() => setJustAdded(false), 800);
        },
      }
    );
  };

  const handleIncrement = () => {
    updateCart.mutate(
      { productId: product.id, data: { quantity: quantity + 1 } },
      { onSuccess: invalidate }
    );
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeCart.mutate({ productId: product.id }, { onSuccess: invalidate });
    } else {
      updateCart.mutate(
        { productId: product.id, data: { quantity: quantity - 1 } },
        { onSuccess: invalidate }
      );
    }
  };

  const discount = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.price) / product.originalPrice) * 100
      )
    : 0;

  const isPending =
    addToCart.isPending || updateCart.isPending || removeCart.isPending;

  const imgBg = IMG_BG[product.categorySlug] ?? "bg-gray-50";

  return (
    <div
      className="bg-white rounded-2xl overflow-hidden flex flex-col card-shadow hover:card-shadow-hover transition-all duration-200 hover:-translate-y-0.5 group"
      data-testid={`card-product-${product.id}`}
    >
      <Link
        href={`/product/${product.id}`}
        className={`relative aspect-[4/3] overflow-hidden ${imgBg} block`}
      >
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-rose-500 text-white text-[11px] font-black px-2 py-0.5 rounded-full shadow-sm">
            {discount}% OFF
          </div>
        )}
        <img
          src={
            product.imageUrl ||
            `https://picsum.photos/seed/product-${product.id}/300/225`
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/95 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm text-emerald-700">
          <Clock className="w-3 h-3" />
          {product.deliveryTime}
        </div>
      </Link>

      <div className="p-3 flex flex-col flex-1">
        <Link href={`/product/${product.id}`} className="block mb-1">
          <h3 className="font-semibold text-[13px] leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-[11px] text-muted-foreground mb-3">{product.unit}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[11px] text-muted-foreground line-through leading-none mb-0.5">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="text-[15px] font-black text-foreground leading-none">
              ₹{product.price}
            </span>
          </div>

          <div className="shrink-0">
            {quantity > 0 ? (
              <div className="flex items-center gap-0 bg-primary rounded-full overflow-hidden shadow-sm h-8">
                <button
                  onClick={handleDecrement}
                  disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center text-primary-foreground hover:bg-black/10 active:bg-black/20 transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                  data-testid={`button-decrement-${product.id}`}
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <div className="w-6 text-center text-primary-foreground font-black text-sm leading-none">
                  {isPending ? (
                    <Loader2 className="h-3 w-3 animate-spin mx-auto" />
                  ) : (
                    quantity
                  )}
                </div>
                <button
                  onClick={handleIncrement}
                  disabled={isPending}
                  className="w-8 h-8 flex items-center justify-center text-primary-foreground hover:bg-black/10 active:bg-black/20 transition-colors disabled:opacity-50"
                  aria-label="Increase quantity"
                  data-testid={`button-increment-${product.id}`}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                disabled={isPending || !product.inStock}
                className={`h-8 px-4 rounded-full text-[13px] font-bold border-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                  justAdded
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-white text-primary border-primary hover:bg-primary hover:text-primary-foreground"
                }`}
                data-testid={`button-add-${product.id}`}
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : justAdded ? (
                  "✓"
                ) : (
                  "ADD"
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
