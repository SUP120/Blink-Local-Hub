import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useGetCart } from "@workspace/api-client-react";
import { ShoppingCart, Search, Menu, User, Package, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center gap-4">
          <Link href="/" className="font-bold text-2xl tracking-tight text-primary flex items-center gap-2 shrink-0">
            <Package className="h-6 w-6" />
            QuickMart
          </Link>

          <div className="flex-1 max-w-2xl mx-auto px-4 hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for fresh groceries..." 
                className="w-full pl-10 bg-gray-100/50 border-transparent focus-visible:bg-white rounded-full"
              />
            </form>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" asChild>
              <Link href="/orders">
                <User className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="default" className="rounded-full font-semibold" asChild>
              <Link href="/cart">
                <ShoppingCart className="h-5 w-5 mr-2" />
                <span>{cart?.itemCount || 0} items</span>
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="bg-white border-t border-border mt-auto">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground text-sm">
          &copy; 2025 QuickMart. Fast delivery, fresh products.
        </div>
      </footer>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border flex items-center justify-around p-3 z-50">
        <Link href="/" className={`flex flex-col items-center gap-1 ${location === '/' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Home</span>
        </Link>
        <Link href="/categories" className={`flex flex-col items-center gap-1 ${location === '/categories' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-medium">Categories</span>
        </Link>
        <Link href="/orders" className={`flex flex-col items-center gap-1 ${location === '/orders' ? 'text-primary' : 'text-muted-foreground'}`}>
          <Package className="h-5 w-5" />
          <span className="text-[10px] font-medium">Orders</span>
        </Link>
        <Link href="/cart" className={`flex flex-col items-center gap-1 relative ${location === '/cart' ? 'text-primary' : 'text-muted-foreground'}`}>
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {cart && cart.itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                {cart.itemCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-medium">Cart</span>
        </Link>
      </div>
    </div>
  );
}
