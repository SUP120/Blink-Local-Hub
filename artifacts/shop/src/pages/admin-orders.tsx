import { useEffect, useState, useRef } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { CheckCircle2, XCircle, Truck, Clock, Printer, Package, ChevronDown } from "lucide-react";
import { format } from "date-fns";

interface OrderItem { productId: number; name: string; price: number; quantity: number; unit: string; }
interface Order {
  id: number; status: string; subtotal: number; deliveryFee: number; total: number;
  deliveryAddress: string; paymentMethod: string; estimatedDelivery: string | null;
  createdAt: string; items: OrderItem[];
}

const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-amber-100 text-amber-700",
  "on the way": "bg-violet-100 text-violet-700",
  delivered: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-red-100 text-red-700",
};

const NEXT_STATUSES: Record<string, { label: string; value: string; icon: typeof CheckCircle2; color: string }[]> = {
  confirmed: [
    { label: "Accept", value: "processing", icon: CheckCircle2, color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
    { label: "Reject", value: "cancelled", icon: XCircle, color: "bg-red-500 hover:bg-red-600 text-white" },
  ],
  processing: [
    { label: "Out for Delivery", value: "on the way", icon: Truck, color: "bg-violet-500 hover:bg-violet-600 text-white" },
    { label: "Cancel", value: "cancelled", icon: XCircle, color: "bg-red-100 hover:bg-red-200 text-red-700" },
  ],
  "on the way": [
    { label: "Mark Delivered", value: "delivered", icon: CheckCircle2, color: "bg-emerald-500 hover:bg-emerald-600 text-white" },
  ],
};

function Receipt({ order }: { order: Order }) {
  return (
    <div className="font-mono text-sm text-black bg-white p-6 rounded-xl border border-border max-w-xs mx-auto" id="receipt">
      <div className="text-center mb-4">
        <div className="font-extrabold text-lg">⚡ QuickMart</div>
        <div className="text-xs text-gray-500">10-minute delivery</div>
        <div className="border-b border-dashed border-gray-300 my-3" />
        <div className="font-bold text-base">RECEIPT</div>
        <div className="text-xs text-gray-500">Order #{order.id}</div>
        <div className="text-xs text-gray-500">{format(new Date(order.createdAt), "dd MMM yyyy, hh:mm a")}</div>
      </div>

      <div className="border-b border-dashed border-gray-300 mb-3" />
      {order.items.map((item, i) => (
        <div key={i} className="flex justify-between gap-2 mb-1.5">
          <span className="flex-1 text-xs">{item.quantity}× {item.name}</span>
          <span className="text-xs font-bold shrink-0">₹{(item.price * item.quantity).toFixed(0)}</span>
        </div>
      ))}
      <div className="border-b border-dashed border-gray-300 my-3" />

      <div className="space-y-1 text-xs">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
        <div className="flex justify-between"><span>Delivery</span><span>{order.deliveryFee === 0 ? "FREE" : `₹${order.deliveryFee}`}</span></div>
        <div className="flex justify-between font-extrabold text-sm mt-2 pt-2 border-t border-dashed border-gray-300">
          <span>TOTAL</span><span>₹{order.total}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-gray-300 my-3" />
      <div className="text-xs text-gray-500">
        <div><span className="font-bold">Payment:</span> {order.paymentMethod}</div>
        <div className="mt-1"><span className="font-bold">Address:</span> {order.deliveryAddress}</div>
        <div className="mt-1"><span className="font-bold">Status:</span> {order.status}</div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-4">Thank you for shopping with QuickMart!</div>
    </div>
  );
}

export default function AdminOrders() {
  const [, setLocation] = useLocation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<Order | null>(null);
  const [filter, setFilter] = useState("all");
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAdminLoggedIn()) { setLocation("/admin/login"); return; }
    fetch("/api/admin/orders").then((r) => r.json()).then((d) => { setOrders(d); setLoading(false); });
  }, [setLocation]);

  const updateStatus = async (orderId: number, status: string) => {
    setUpdating(orderId);
    const r = await fetch(`/api/admin/orders/${orderId}/status`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const updated = await r.json();
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    setUpdating(null);
  };

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`<html><head><title>Receipt #${receiptOrder?.id}</title>
      <style>body{margin:0;font-family:monospace;} @media print{body{margin:0}}</style>
      </head><body>${content}</body></html>`);
    w.document.close();
    w.print();
    w.close();
  };

  const filtered = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const statuses = ["all", "confirmed", "processing", "on the way", "delivered", "cancelled"];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold">Orders</h1>
              <p className="text-sm text-muted-foreground">{orders.length} total orders</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-white rounded-xl border border-border/40 p-1">
            {statuses.map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${filter === s ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="bg-white rounded-2xl h-32 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-border/40">
            <Package className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-muted-foreground">No orders found</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => {
              const actions = NEXT_STATUSES[order.status] ?? [];
              const chipColor = STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-700";
              return (
                <div key={order.id} className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-extrabold">Order #{order.id}</span>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full capitalize ${chipColor}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {format(new Date(order.createdAt), "dd MMM yyyy · hh:mm a")} · {order.paymentMethod}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 max-w-sm truncate">{order.deliveryAddress}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-black text-lg">₹{order.total}</div>
                        <div className="text-xs text-muted-foreground">{order.items.length} items</div>
                      </div>
                    </div>

                    <div className="bg-secondary rounded-xl p-3 mb-4">
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, i) => (
                          <span key={i} className="text-xs bg-white rounded-lg px-2.5 py-1 font-medium border border-border/40">
                            {item.quantity}× {item.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                          <button
                            key={action.value}
                            onClick={() => updateStatus(order.id, action.value)}
                            disabled={updating === order.id}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50 ${action.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {updating === order.id ? "Updating…" : action.label}
                          </button>
                        );
                      })}
                      <button
                        onClick={() => setReceiptOrder(order)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-secondary hover:bg-border/60 transition-all ml-auto"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        Receipt
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {receiptOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setReceiptOrder(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/60">
              <h3 className="font-extrabold">Receipt Preview</h3>
              <button onClick={() => setReceiptOrder(null)} className="w-7 h-7 rounded-full bg-secondary hover:bg-border/60 flex items-center justify-center text-muted-foreground transition-colors">✕</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[70vh]">
              <div ref={printRef}>
                <Receipt order={receiptOrder} />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-border/60 flex gap-3">
              <button onClick={() => setReceiptOrder(null)} className="flex-1 h-10 rounded-xl border border-border/60 text-sm font-bold hover:bg-secondary transition-colors">Close</button>
              <button onClick={handlePrint} className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors">
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
