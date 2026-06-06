import { Link, useLocation } from "wouter";
import { useGetCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Minus, Trash2, ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading } = useGetCart();
  const queryClient = useQueryClient();
  
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();

  const handleIncrement = (productId: number, currentQuantity: number) => {
    updateCart.mutate(
      { productId, data: { quantity: currentQuantity + 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
      }
    );
  };

  const handleDecrement = (productId: number, currentQuantity: number) => {
    if (currentQuantity <= 1) {
      removeCart.mutate(
        { productId },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    } else {
      updateCart.mutate(
        { productId, data: { quantity: currentQuantity - 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    }
  };

  const handleRemove = (productId: number) => {
    removeCart.mutate(
      { productId },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48 mb-6" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="w-full md:w-80 space-y-4">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center flex flex-col items-center">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingBag className="w-12 h-12 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h1>
        <p className="text-muted-foreground mb-8">
          Looks like you haven't added anything to your cart yet.
        </p>
        <Button size="lg" className="rounded-full px-8" asChild>
          <Link href="/">Start Shopping</Link>
        </Button>
      </div>
    );
  }

  const freeDeliveryThreshold = 199;
  const isFreeDelivery = cart.subtotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - cart.subtotal);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Your Cart</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            {!isFreeDelivery && (
              <div className="bg-blue-50 text-blue-800 text-sm font-medium p-3 text-center border-b border-blue-100">
                Add ₹{amountToFreeDelivery} more to get <span className="font-bold">FREE Delivery</span>!
              </div>
            )}
            
            <div className="p-4 md:p-6 divide-y divide-gray-100">
              {cart.items.map((item) => {
                const isPending = updateCart.isPending || removeCart.isPending;
                
                return (
                  <div key={item.productId} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <Link href={`/product/${item.productId}`} className="shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-100">
                      <img 
                        src={item.imageUrl || `https://picsum.photos/seed/product-${item.productId}/300/300`} 
                        alt={item.name} 
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    
                    <div className="flex-1 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <Link href={`/product/${item.productId}`}>
                            <h3 className="font-semibold text-gray-900 hover:text-primary transition-colors line-clamp-2">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-muted-foreground mt-1">{item.unit}</p>
                        </div>
                        <p className="font-bold text-gray-900 shrink-0 ml-4">₹{item.price * item.quantity}</p>
                      </div>
                      
                      <div className="mt-auto pt-4 flex items-center justify-between">
                        <div className="flex items-center bg-gray-50 rounded-md border border-gray-200 shadow-sm overflow-hidden">
                          <button 
                            onClick={() => handleDecrement(item.productId, item.quantity)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors disabled:opacity-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <div className="w-8 h-8 flex items-center justify-center font-semibold text-sm bg-white border-x border-gray-200">
                            {item.quantity}
                          </div>
                          <button 
                            onClick={() => handleIncrement(item.productId, item.quantity)}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors disabled:opacity-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleRemove(item.productId)}
                          disabled={isPending}
                          className="h-8 w-8 text-gray-400 hover:text-destructive hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Bill Details</h2>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Item Total</span>
                <span className="font-medium text-gray-900">₹{cart.subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                {cart.deliveryFee === 0 ? (
                  <span className="font-medium text-green-600">FREE</span>
                ) : (
                  <span className="font-medium text-gray-900">₹{cart.deliveryFee}</span>
                )}
              </div>
              
              <Separator className="my-3" />
              
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-900">To Pay</span>
                <span className="text-xl font-black text-gray-900">₹{cart.total}</span>
              </div>
            </div>
            
            <Button 
              className="w-full mt-6 rounded-full font-bold shadow-md hover:shadow-lg transition-all" 
              size="lg"
              onClick={() => setLocation("/checkout")}
            >
              Checkout <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
