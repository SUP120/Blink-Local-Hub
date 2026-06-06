import { Link } from "wouter";
import { useListOrders } from "@workspace/api-client-react";
import { Package, ChevronRight, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function Orders() {
  const { data: orders, isLoading } = useListOrders();

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto pb-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Your Orders</h1>
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Package className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h1>
        <p className="text-muted-foreground mb-8">
          When you place an order, it will appear here.
        </p>
        <Link href="/" className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Your Orders</h1>
      
      <div className="space-y-4">
        {orders.map((order) => {
          const isDelivered = order.status.toLowerCase() === 'delivered';
          const StatusIcon = isDelivered ? CheckCircle2 : Clock;
          
          return (
            <Link 
              key={order.id} 
              href={`/orders/${order.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all overflow-hidden"
            >
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100">
                    <Package className="w-6 h-6 text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-gray-900">Order #{order.id}</span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(order.createdAt), "MMM d, yyyy 'at' h:mm a")}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <StatusIcon className={`w-4 h-4 ${isDelivered ? 'text-green-600' : 'text-amber-500'}`} />
                      <span className={isDelivered ? 'text-green-700' : 'text-amber-600 capitalize'}>
                        {order.status}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mt-2 line-clamp-1">
                      {order.items.map(item => `${item.quantity}x ${item.name}`).join(', ')}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0 pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <span className="font-bold text-gray-900 text-lg">₹{order.total}</span>
                  <div className="text-primary text-sm font-semibold flex items-center group-hover:underline">
                    View Details <ChevronRight className="w-4 h-4 ml-1" />
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
