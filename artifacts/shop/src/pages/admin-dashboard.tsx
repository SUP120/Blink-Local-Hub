import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { AdminLayout } from "@/components/admin-layout";
import { isAdminLoggedIn } from "@/lib/admin-auth";
import { Package, ShoppingBag, TrendingUp, CheckCircle2, Clock, Truck, XCircle, LayoutDashboard } from "lucide-react";

interface Stats {
  products: number;
  categories: number;
  revenue: number;
  orders: {
    total: number;
    confirmed: number;
    processing: number;
    onTheWay: number;
    delivered: number;
    cancelled: number;
  };
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdminLoggedIn()) { setLocation("/admin/login"); return; }
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [setLocation]);

  const cards = stats
    ? [
        { label: "Total Products", value: stats.products, icon: Package, color: "bg-blue-100 text-blue-700" },
        { label: "Total Orders", value: stats.orders.total, icon: ShoppingBag, color: "bg-violet-100 text-violet-700" },
        { label: "Delivered", value: stats.orders.delivered, icon: CheckCircle2, color: "bg-emerald-100 text-emerald-700" },
        { label: "Revenue", value: `₹${stats.revenue.toLocaleString("en-IN")}`, icon: TrendingUp, color: "bg-amber-100 text-amber-700" },
      ]
    : [];

  const orderStatuses = stats
    ? [
        { label: "Confirmed", value: stats.orders.confirmed, icon: Clock, color: "bg-blue-500" },
        { label: "Processing", value: stats.orders.processing, icon: Clock, color: "bg-amber-500" },
        { label: "On the Way", value: stats.orders.onTheWay, icon: Truck, color: "bg-violet-500" },
        { label: "Delivered", value: stats.orders.delivered, icon: CheckCircle2, color: "bg-emerald-500" },
        { label: "Cancelled", value: stats.orders.cancelled, icon: XCircle, color: "bg-red-500" },
      ]
    : [];

  return (
    <AdminLayout>
      <div className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Dashboard</h1>
            <p className="text-sm text-muted-foreground">Welcome back, Admin</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 h-28 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="text-2xl font-black">{value}</div>
                  <div className="text-sm text-muted-foreground font-medium mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
              <h2 className="font-extrabold text-base mb-5">Order Pipeline</h2>
              <div className="flex gap-3 flex-wrap">
                {orderStatuses.map(({ label, value, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-secondary rounded-xl px-4 py-3 flex-1 min-w-[120px]">
                    <div className={`w-2 h-2 rounded-full ${color}`} />
                    <div>
                      <div className="font-black text-lg leading-none">{value}</div>
                      <div className="text-xs text-muted-foreground font-medium mt-0.5">{label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                <h3 className="font-extrabold text-sm mb-1">Avg Delivery Time</h3>
                <div className="text-3xl font-black text-primary">10 min</div>
                <div className="text-xs text-muted-foreground mt-1">Across all orders</div>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-border/40">
                <h3 className="font-extrabold text-sm mb-1">Categories</h3>
                <div className="text-3xl font-black text-primary">{stats?.categories}</div>
                <div className="text-xs text-muted-foreground mt-1">Product categories</div>
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}
