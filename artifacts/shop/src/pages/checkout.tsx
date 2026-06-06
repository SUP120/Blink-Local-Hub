import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, MapPin, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const PAYMENT_METHODS = [
  { id: "upi", label: "UPI", sub: "GPay, PhonePe, Paytm", icon: "💳" },
  { id: "card", label: "Credit / Debit Card", sub: "Visa, Mastercard, RuPay", icon: "🏦" },
  { id: "cod", label: "Cash on Delivery", sub: "Pay when your order arrives", icon: "💵" },
];

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast({ title: "Address Required", description: "Please enter your delivery address.", variant: "destructive" });
      return;
    }
    createOrder.mutate(
      { data: { deliveryAddress: address, paymentMethod } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation(`/orders/${order.id}`);
        },
        onError: () => {
          toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
        },
      }
    );
  };

  if (isCartLoading) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-40 w-full rounded-2xl" />
            <Skeleton className="h-48 w-full rounded-2xl" />
          </div>
          <Skeleton className="w-full md:w-72 h-60 rounded-2xl shrink-0" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <button
        onClick={() => setLocation("/cart")}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="button-back"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Cart
      </button>

      <h1 className="text-2xl font-extrabold tracking-tight mb-8">Checkout</h1>

      <form onSubmit={handleCheckout} className="flex flex-col md:flex-row gap-6 items-start">
        <div className="flex-1 space-y-4">
          {/* Address */}
          <div className="bg-white rounded-2xl card-shadow p-5">
            <h2 className="font-extrabold text-base mb-4 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-3.5 h-3.5 text-primary" />
              </div>
              Delivery Address
            </h2>
            <textarea
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House No, Building, Street, Area, City…"
              rows={3}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-white transition-all resize-none"
              data-testid="input-address"
            />
          </div>

          {/* Payment */}
          <div className="bg-white rounded-2xl card-shadow p-5">
            <h2 className="font-extrabold text-base mb-4">Payment Method</h2>
            <div className="space-y-2.5">
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-border hover:bg-secondary/50"
                    }`}
                    data-testid={`button-payment-${method.id}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg shrink-0 ${isSelected ? "bg-primary/10" : "bg-secondary"}`}>
                      {method.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm">{method.label}</div>
                      <div className="text-xs text-muted-foreground">{method.sub}</div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${isSelected ? "border-primary" : "border-muted-foreground/40"}`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full md:w-72 shrink-0">
          <div className="bg-white rounded-2xl card-shadow p-5 sticky top-24">
            <h2 className="font-extrabold text-base mb-4 pb-4 border-b border-border/60">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              {cart.items.slice(0, 3).map((item) => (
                <div key={item.productId} className="flex justify-between text-muted-foreground">
                  <span className="line-clamp-1 flex-1 pr-2">{item.quantity}× {item.name}</span>
                  <span className="font-semibold text-foreground shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
                </div>
              ))}
              {cart.items.length > 3 && (
                <p className="text-xs text-muted-foreground">+{cart.items.length - 3} more items</p>
              )}
            </div>

            <div className="space-y-2 text-sm pt-4 border-t border-border/60 mb-5">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="font-semibold text-foreground">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery</span>
                {cart.deliveryFee === 0 ? (
                  <span className="font-bold text-primary">FREE</span>
                ) : (
                  <span className="font-semibold text-foreground">₹{cart.deliveryFee}</span>
                )}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-border/60">
                <span className="font-extrabold">Total</span>
                <span className="font-black text-lg">₹{cart.total}</span>
              </div>
            </div>

            <div className="bg-secondary rounded-xl p-3 flex items-start gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground">
                <span className="font-bold text-foreground">{cart.itemCount} items</span> delivered in ~10 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={createOrder.isPending || !address.trim()}
              className="w-full h-12 bg-primary text-primary-foreground font-bold rounded-full flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition-all shadow-md shadow-primary/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
              data-testid="button-place-order"
            >
              {createOrder.isPending ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
              ) : (
                `Pay ₹${cart.total}`
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
