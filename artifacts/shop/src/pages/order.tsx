import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { CheckCircle2, Clock, Package, MapPin, ChevronLeft, Truck, Store } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const STEPS = [
  { key: "placed", label: "Order Placed", icon: Store },
  { key: "confirmed", label: "Confirmed", icon: CheckCircle2 },
  { key: "on the way", label: "On the Way", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

function getStepIndex(status: string) {
  const s = status.toLowerCase();
  if (s === "delivered") return 3;
  if (s === "on the way") return 2;
  if (s === "confirmed" || s === "processing") return 1;
  return 0;
}

export default function OrderDetails() {
  const params = useParams();
  const orderId = Number(params.id);

  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: [] as unknown as never },
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-12">
        <Skeleton className="h-5 w-32 mb-6" />
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Skeleton className="h-32 rounded-2xl" />
            <Skeleton className="h-32 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-24">
        <h1 className="text-xl font-extrabold mb-4">Order not found</h1>
        <Link href="/orders" className="text-primary font-semibold hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const stepIndex = getStepIndex(order.status);
  const isDelivered = order.status.toLowerCase() === "delivered";

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground mb-6 transition-colors"
        data-testid="link-back"
      >
        <ChevronLeft className="w-4 h-4" /> My Orders
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Order #{order.id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(order.createdAt), "MMMM d, yyyy · h:mm a")}
          </p>
        </div>
        <div className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full capitalize ${isDelivered ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
          {isDelivered ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
          {order.status}
        </div>
      </div>

      {/* Status tracker */}
      <div className="bg-white rounded-2xl card-shadow p-6 mb-4">
        <p className="text-sm font-bold text-muted-foreground mb-6">
          {isDelivered
            ? "Your order was delivered successfully."
            : order.estimatedDelivery
            ? `Estimated arrival: ${order.estimatedDelivery}`
            : "Arriving in approximately 10 minutes."}
        </p>

        <div className="relative">
          {/* Track line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-secondary rounded-full" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-primary rounded-full transition-all duration-700"
            style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
          />

          <div className="relative flex justify-between">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = i <= stepIndex;
              const current = i === stepIndex;
              return (
                <div key={step.key} className="flex flex-col items-center gap-2" style={{ width: `${100 / STEPS.length}%` }}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 z-10 transition-all duration-300 ${
                    done
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-white border-border text-muted-foreground"
                  } ${current ? "ring-4 ring-primary/20" : ""}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-[11px] font-semibold text-center leading-tight ${done ? "text-foreground" : "text-muted-foreground"}`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-white rounded-2xl card-shadow overflow-hidden mb-4">
        <div className="px-5 py-4 border-b border-border/60">
          <h3 className="font-extrabold text-sm">{order.items.length} item{order.items.length !== 1 ? "s" : ""} ordered</h3>
        </div>
        <div className="divide-y divide-border/60">
          {order.items.map((item, idx) => (
            <div key={idx} className="px-5 py-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground shrink-0">
                  {item.quantity}×
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm line-clamp-1">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.unit}</p>
                </div>
              </div>
              <span className="font-black text-sm shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address + Bill */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="font-extrabold text-sm mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" /> Delivery Address
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{order.deliveryAddress}</p>
        </div>

        <div className="bg-white rounded-2xl card-shadow p-5">
          <h3 className="font-extrabold text-sm mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Item Total</span>
              <span className="font-semibold text-foreground">₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              {order.deliveryFee === 0 ? (
                <span className="font-bold text-primary">FREE</span>
              ) : (
                <span className="font-semibold text-foreground">₹{order.deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between pt-2 border-t border-border/60 font-black">
              <span>Total Paid</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>

      {!isDelivered && (
        <div className="mt-4 bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
            <Truck className="w-4.5 h-4.5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold">Your order is on its way!</p>
            <p className="text-xs text-muted-foreground">Our delivery partner is heading to your location.</p>
          </div>
        </div>
      )}
    </div>
  );
}
