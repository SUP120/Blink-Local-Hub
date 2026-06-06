import { Link, useLocation } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Zap } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();
  const queryClient = useQueryClient();

  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });

  const handleIncrement = (productId: number, qty: number) =>
    updateCart.mutate({ productId, data: { quantity: qty + 1 } }, { onSuccess: invalidate });

  const handleDecrement = (productId: number, qty: number) =>
    qty <= 1
      ? removeCart.mutate({ productId }, { onSuccess: invalidate })
      : updateCart.mutate({ productId, data: { quantity: qty - 1 } }, { onSuccess: invalidate });

  const handleRemove = (productId: number) =>
    removeCart.mutate({ productId }, { onSuccess: invalidate });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="w-full md:w-80 h-64 rounded-2xl shrink-0" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-sm mx-auto py-24 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <ShoppingBag className="w-9 h-9 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-extrabold mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground text-sm mb-8 max-w-xs">
          Looks like you haven't added anything yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-6 py-3 rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-md shadow-primary/20"
          data-testid="button-start-shopping"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  const freeAt = 199;
  const isFree = cart.subtotal >= freeAt;
  const remaining = Math.max(0, freeAt - cart.subtotal);
  const progress = Math.min((cart.subtotal / freeAt) * 100, 100);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-extrabold tracking-tight mb-8">
        Your Cart <span className="text-muted-foreground font-semibold text-lg">({cart.itemCount} items)</span>
      </h1>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Items */}
        <div className="flex-1 min-w-0">
          {/* Free delivery progress */}
          <div className="bg-white rounded-2xl card-shadow p-4 mb-4">
            {isFree ? (
              <div className="flex items-center gap-2 text-sm font-bold text-primary">
                <Zap className="w-4 h-4 fill-primary" />
                You've unlocked FREE delivery!
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                  <span className="text-muted-foreground">Add <span className="text-foreground">₹{remaining}</span> more for free delivery</span>
                  <span className="text-primary">{Math.round(progress)}%</span>
                </div>
                <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Cart items */}
          <div className="bg-white rounded-2xl card-shadow overflow-hidden">
            <div className="divide-y divide-border/60">
              {cart.items.map((item) => {
                const isPending = updateCart.isPending || removeCart.isPending;
                return (
                  <div key={item.productId} className="p-4 flex gap-4 items-start" data-testid={`cart-item-${item.productId}`}>
                    <Link href={`/product/${item.productId}`} className="shrink-0 w-18 h-18 rounded-xl overflow-hidden bg-secondary w-16 h-16">
                      <img
                        src={item.imageUrl || `https://picsum.photos/seed/product-${item.productId}/160/160`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    <div className="flex-1 min-w-0">
                      <Link href={`/product/${item.productId}`}>
                        <h3 className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">{item.name}</h3>
                      </Link>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.unit}</p>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-0 bg-secondary rounded-full overflow-hidden border border-border/60 h-8">
                          <button
                            onClick={() => handleDecrement(item.productId, item.quantity)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-border/60 transition-colors disabled:opacity-40"
                            data-testid={`button-cart-decrement-${item.productId}`}
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-7 text-center font-black text-sm">{item.quantity}</div>
                          <button
                            onClick={() => handleIncrement(item.productId, item.quantity)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-40"
                            data-testid={`button-cart-increment-${item.productId}`}
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-black text-sm">₹{(item.price * item.quantity).toFixed(0)}</span>
                          <button
                            onClick={() => handleRemove(item.productId)}
                            disabled={isPending}
                            className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors disabled:opacity-40"
                            data-testid={`button-cart-remove-${item.productId}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bill */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-2xl card-shadow p-5 sticky top-24">
            <h2 className="font-extrabold text-base mb-5 pb-4 border-b border-border/60">Bill Details</h2>

            <div className="space-y-3 text-sm mb-5">
              <div className="flex justify-between text-muted-foreground">
                <span>Item Total</span>
                <span className="font-semibold text-foreground">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Fee</span>
                {cart.deliveryFee === 0 ? (
                  <span className="font-bold text-primary">FREE</span>
                ) : (
                  <span className="font-semibold text-foreground">₹{cart.deliveryFee}</span>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border/60 mb-5">
              <span className="font-extrabold text-base">To Pay</span>
              <span className="font-black text-xl text-foreground">₹{cart.total}</span>
            </div>

            <button
              onClick={() => setLocation("/checkout")}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20"
              data-testid="button-checkout"
            >
              Proceed to Checkout <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-xs text-muted-foreground text-center mt-3">
              Estimated delivery: <span className="font-bold text-foreground">10 minutes</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
