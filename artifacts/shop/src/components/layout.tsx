import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingCart, Search, Home, Grid3X3, PackageOpen, Zap } from "lucide-react";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const { data: cart } = useGetCart();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const itemCount = cart?.itemCount ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-border/60">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group"
            data-testid="link-logo"
          >
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <Zap className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-foreground hidden sm:block">
              Quick<span className="text-primary">Mart</span>
            </span>
          </Link>

          <form
            onSubmit={handleSearch}
            className="flex-1 max-w-xl mx-auto hidden md:flex relative"
          >
            <div className="relative w-full group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search groceries, snacks, essentials…"
                className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 focus:bg-white transition-all"
                data-testid="input-search"
              />
            </div>
          </form>

          <div className="flex items-center gap-2 ml-auto shrink-0">
            <Link href="/orders" className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors px-3 py-2" data-testid="link-orders">
              My Orders
            </Link>
            <Link
              href="/cart"
              className="relative flex items-center gap-2 bg-primary text-primary-foreground rounded-full px-4 py-2 font-bold text-sm shadow-sm hover:bg-primary/90 active:scale-95 transition-all"
              data-testid="link-cart"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>
                {itemCount > 0 ? (
                  <>Cart · {itemCount}</>
                ) : (
                  "Cart"
                )}
              </span>
            </Link>
          </div>
        </div>

        <div className="border-t border-border/40 bg-[hsl(142,72%,36%)/0.04] md:hidden">
          <form onSubmit={handleSearch} className="flex gap-2 px-4 py-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products…"
                className="w-full h-9 pl-9 pr-3 rounded-full bg-secondary border border-border/60 text-sm font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                data-testid="input-search-mobile"
              />
            </div>
          </form>
        </div>
      </header>

      <main className="flex-1 max-w-screen-xl mx-auto w-full px-4 sm:px-6 py-6">
        {children}
      </main>

      <footer className="bg-white border-t border-border/60 mt-auto">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-white fill-white" />
                </div>
                <span className="font-extrabold text-lg tracking-tight">Quick<span className="text-primary">Mart</span></span>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs">
                Groceries, essentials, and more — delivered to your door in 10 minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 text-sm font-medium text-muted-foreground">
              <Link href="/categories" className="hover:text-primary transition-colors">All Categories</Link>
              <Link href="/orders" className="hover:text-primary transition-colors">My Orders</Link>
              <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
            </div>
          </div>
          <div className="border-t border-border/60 mt-8 pt-6 text-xs text-muted-foreground text-center">
            © 2026 QuickMart. All rights reserved.
          </div>
        </div>
      </footer>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border/60 z-50 safe-area-pb">
        <div className="grid grid-cols-4 h-14">
          {[
            { href: "/", icon: Home, label: "Home" },
            { href: "/categories", icon: Grid3X3, label: "Categories" },
            { href: "/orders", icon: PackageOpen, label: "Orders" },
            { href: "/cart", icon: ShoppingCart, label: "Cart" },
          ].map(({ href, icon: Icon, label }) => {
            const active = location === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-col items-center justify-center gap-0.5 relative transition-colors ${active ? "text-primary" : "text-muted-foreground"}`}
                data-testid={`nav-${label.toLowerCase()}`}
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  {href === "/cart" && itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center">
                      {itemCount > 9 ? "9+" : itemCount}
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-semibold">{label}</span>
                {active && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-primary rounded-b-full" />}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="h-14 md:hidden" />
    </div>
  );
}
