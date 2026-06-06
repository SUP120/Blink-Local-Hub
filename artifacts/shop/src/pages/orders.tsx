import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { PackageOpen, ChevronRight, Clock, CheckCircle2, Package } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_STYLES: Record<string, { label: string; color: string; icon: typeof Clock }> = {
  confirmed: { label: "Confirmed", color: "bg-blue-100 text-blue-700", icon: Clock },
  processing: { label: "Processing", color: "bg-amber-100 text-amber-700", icon: Clock },
  "on the way": { label: "On the way", color: "bg-violet-100 text-violet-700", icon: Package },
  delivered: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
};

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-12">
        <Skeleton className="h-8 w-40 mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-sm mx-auto py-24 text-center flex flex-col items-center">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <PackageOpen className="w-9 h-9 text-muted-foreground" />
        </div>
        <h1 className="text-xl font-extrabold mb-2">No orders yet</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Your orders will appear here once you place one.
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

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <h1 className="text-2xl font-extrabold tracking-tight mb-8">My Orders</h1>

      <div className="space-y-3">
        {orders.map((order) => {
          const statusKey = order.status.toLowerCase();
          const style = STATUS_STYLES[statusKey] ?? STATUS_STYLES.confirmed;
          const Icon = style.icon;

          return (
            <Link
              key={order.id}
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl card-shadow hover:card-shadow-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
              data-testid={`card-order-${order.id}`}
            >
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 min-w-0">
                    <div className="w-11 h-11 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-extrabold text-sm">Order #{order.id}</span>
                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${style.color}`}>
                          <Icon className="w-3 h-3" />
                          {style.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1.5">
                        {format(new Date(order.createdAt), "MMM d, yyyy · h:mm a")}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {order.items.map((i) => `${i.quantity}× ${i.name}`).join(", ")}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0 flex flex-col items-end gap-2">
                    <span className="font-black text-base">₹{order.total}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
