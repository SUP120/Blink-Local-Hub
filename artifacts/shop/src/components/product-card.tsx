import { useState } from "react";
import { Link } from "wouter";
import { Plus, Minus, Clock, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Product, useGetCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

export function ProductCard({ product }: { product: Product }) {
  const { data: cart } = useGetCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const addToCart = useAddToCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();

  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAdd = () => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({
            title: "Added to cart",
            description: `${product.name} added to your cart.`,
          });
        },
      }
    );
  };

  const handleIncrement = () => {
    updateCart.mutate(
      { productId: product.id, data: { quantity: quantity + 1 } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
        },
      }
    );
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeCart.mutate(
        { productId: product.id },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    } else {
      updateCart.mutate(
        { productId: product.id, data: { quantity: quantity - 1 } },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          },
        }
      );
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  const isPending = addToCart.isPending || updateCart.isPending || removeCart.isPending;

  return (
    <Card className="overflow-hidden flex flex-col hover-elevate transition-all border-border shadow-sm hover:shadow-md">
      <Link href={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-100 block">
        {discount > 0 && (
          <Badge className="absolute top-2 left-2 z-10 bg-blue-600 hover:bg-blue-700 font-bold border-none shadow-sm">
            {discount}% OFF
          </Badge>
        )}
        <img
          src={product.imageUrl || `https://picsum.photos/seed/product-${product.id}/300/300`}
          alt={product.name}
          className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-xs font-semibold px-1.5 py-0.5 rounded text-gray-700 shadow-sm border border-gray-100">
          <Clock className="w-3 h-3 text-green-600" />
          {product.deliveryTime}
        </div>
      </Link>
      
      <CardContent className="p-3 flex-1 flex flex-col">
        <div className="flex-1">
          <Link href={`/product/${product.id}`} className="block">
            <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-1 text-gray-800 hover:text-primary transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="text-xs text-muted-foreground mb-2">{product.unit}</div>
        </div>
        
        <div className="flex items-end justify-between mt-auto pt-2">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-muted-foreground line-through">
                ₹{product.originalPrice}
              </span>
            )}
            <span className="font-bold text-gray-900 leading-none">₹{product.price}</span>
          </div>
          
          <div className="shrink-0 h-8">
            {quantity > 0 ? (
              <div className="flex items-center bg-primary text-primary-foreground rounded-md h-full overflow-hidden shadow-sm">
                <button 
                  onClick={handleDecrement}
                  disabled={isPending}
                  className="w-8 h-full flex items-center justify-center hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="w-6 h-full flex items-center justify-center font-bold text-sm bg-primary border-x border-primary/20">
                  {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : quantity}
                </div>
                <button 
                  onClick={handleIncrement}
                  disabled={isPending}
                  className="w-8 h-full flex items-center justify-center hover:bg-primary/90 active:bg-primary/80 transition-colors disabled:opacity-50"
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <Button 
                onClick={handleAdd} 
                variant="outline" 
                size="sm" 
                disabled={isPending || !product.inStock}
                className="h-full px-4 text-primary border-primary/30 hover:bg-primary/5 hover:text-primary hover:border-primary font-semibold shadow-sm"
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ADD"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
