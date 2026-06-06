import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { Package, Clock, CheckCircle2, MapPin, ChevronLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function OrderDetails() {
  const params = useParams();
  const orderId = Number(params.id);
  
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId }
  });

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pb-12">
        <Skeleton className="h-8 w-48 mb-6" />
        <Skeleton className="h-[400px] w-full rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Order not found</h1>
        <Link href="/orders" className="text-primary hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  const isDelivered = order.status.toLowerCase() === 'delivered';
  const isProcessing = order.status.toLowerCase() === 'processing';
  
  const steps = [
    { label: "Order Placed", active: true, completed: true },
    { label: "Processing", active: isProcessing || isDelivered, completed: isProcessing || isDelivered },
    { label: "On the way", active: order.status.toLowerCase() === 'on the way' || isDelivered, completed: isDelivered },
    { label: "Delivered", active: isDelivered, completed: isDelivered },
  ];

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <Link href="/orders" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
      </Link>
      
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order #{order.id}</h1>
        <div className="text-sm text-muted-foreground bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
          {format(new Date(order.createdAt), "MMM d, yyyy • h:mm a")}
        </div>
      </div>
      
      {/* Tracker */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDelivered ? 'bg-green-100 text-green-600' : 'bg-primary/10 text-primary'}`}>
              {isDelivered ? <CheckCircle2 className="w-6 h-6" /> : <Clock className="w-6 h-6" />}
            </div>
            <div>
              <h2 className="font-bold text-lg text-gray-900 capitalize">{order.status}</h2>
              <p className="text-sm text-gray-500">
                {isDelivered 
                  ? "Order was delivered successfully" 
                  : order.estimatedDelivery 
                    ? `Estimated delivery by ${order.estimatedDelivery}`
                    : "Arriving in approx. 10 minutes"}
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-100 -translate-y-1/2 rounded-full z-0"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full z-0 transition-all duration-500"
            style={{ 
              width: isDelivered ? '100%' : 
                     order.status.toLowerCase() === 'on the way' ? '66%' : 
                     isProcessing ? '33%' : '0%' 
            }}
          ></div>
          
          <div className="relative z-10 flex justify-between">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors ${
                  step.completed 
                    ? 'bg-primary border-primary text-white' 
                    : step.active 
                      ? 'bg-white border-primary text-primary' 
                      : 'bg-white border-gray-200 text-gray-300'
                }`}>
                  {step.completed ? <CheckCircle2 className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current"></div>}
                </div>
                <span className={`text-[10px] sm:text-xs font-medium text-center ${step.active ? 'text-gray-900' : 'text-gray-400'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Items */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900">Items Ordered</h3>
        </div>
        <div className="p-4 divide-y divide-gray-100">
          {order.items.map((item, idx) => (
            <div key={idx} className="py-3 flex justify-between items-center first:pt-0 last:pb-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 font-medium text-xs">
                  {item.quantity}x
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.unit}</p>
                </div>
              </div>
              <span className="font-bold text-sm text-gray-900">₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Summary & Address */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-400" /> Delivery Address
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed">
            {order.deliveryAddress}
          </p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h3 className="font-bold text-gray-900 mb-3">Bill Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Item Total</span>
              <span>₹{order.subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              {order.deliveryFee === 0 ? (
                <span className="text-green-600">FREE</span>
              ) : (
                <span>₹{order.deliveryFee}</span>
              )}
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-bold text-gray-900">
              <span>Paid Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
