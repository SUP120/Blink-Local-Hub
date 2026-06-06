import { useParams, Link } from "wouter";
import { useGetProduct, useGetCart, useAddToCart, useUpdateCartItem, useRemoveFromCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Clock, Plus, Minus, ChevronLeft, Loader2, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function ProductDetail() {
  const params = useParams();
  const productId = Number(params.id);
  
  const queryClient = useQueryClient();
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId }
  });
  
  const { data: cart } = useGetCart();
  
  const addToCart = useAddToCart();
  const updateCart = useUpdateCartItem();
  const removeCart = useRemoveFromCart();

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto pb-12 flex flex-col md:flex-row gap-8">
        <Skeleton className="w-full md:w-1/2 aspect-square rounded-3xl" />
        <div className="w-full md:w-1/2 space-y-4 pt-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-8 w-1/3 mt-6" />
          <Skeleton className="h-12 w-full mt-8 rounded-full" />
          <div className="space-y-2 mt-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold mb-4">Product not found</h1>
        <Link href="/" className="text-primary hover:underline">
          Return to Home
        </Link>
      </div>
    );
  }

  const cartItem = cart?.items.find((item) => item.productId === product.id);
  const quantity = cartItem?.quantity || 0;

  const isPending = addToCart.isPending || updateCart.isPending || removeCart.isPending;

  const handleAdd = () => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleIncrement = () => {
    updateCart.mutate(
      { productId: product.id, data: { quantity: quantity + 1 } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
    );
  };

  const handleDecrement = () => {
    if (quantity <= 1) {
      removeCart.mutate(
        { productId: product.id },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
      );
    } else {
      updateCart.mutate(
        { productId: product.id, data: { quantity: quantity - 1 } },
        { onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }) }
      );
    }
  };

  const discount = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link href={`/category/${product.categorySlug}`} className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 mb-6 transition-colors">
        <ChevronLeft className="w-4 h-4 mr-1" /> Back to {product.categoryName}
      </Link>

      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Product Image */}
        <div className="w-full md:w-1/2">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-white border border-gray-100 shadow-sm p-8 flex items-center justify-center">
            {discount > 0 && (
              <Badge className="absolute top-4 left-4 z-10 bg-blue-600 hover:bg-blue-700 text-sm font-bold border-none shadow-sm px-3 py-1">
                {discount}% OFF
              </Badge>
            )}
            <img 
              src={product.imageUrl || `https://picsum.photos/seed/product-${product.id}/600/600`}
              alt={product.name}
              className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
            />
          </div>
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Link href={`/category/${product.categorySlug}`} className="text-xs font-semibold uppercase tracking-wider text-primary hover:underline">
                {product.categoryName}
              </Link>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-2">
              {product.name}
            </h1>
            <p className="text-muted-foreground">{product.unit}</p>
          </div>

          <div className="flex items-center gap-3 mb-8">
            <div className="bg-gray-100 text-gray-800 text-sm font-semibold px-3 py-1.5 rounded-md flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              {product.deliveryTime}
            </div>
          </div>

          <div className="flex items-end gap-4 mb-8">
            <div className="text-4xl font-black text-gray-900 tracking-tight">₹{product.price}</div>
            {product.originalPrice && (
              <div className="text-lg text-gray-400 line-through mb-1 font-medium">₹{product.originalPrice}</div>
            )}
            <div className="text-xs text-gray-500 mb-2 ml-1">(Inclusive of all taxes)</div>
          </div>

          {/* Add to Cart Actions */}
          <div className="mb-10">
            {!product.inStock ? (
              <Button disabled className="w-full rounded-xl h-14 text-lg font-bold" variant="secondary">
                Out of Stock
              </Button>
            ) : quantity > 0 ? (
              <div className="flex items-center justify-between bg-primary rounded-xl h-14 overflow-hidden shadow-md px-2">
                <button 
                  onClick={handleDecrement}
                  disabled={isPending}
                  className="w-14 h-12 rounded-lg flex items-center justify-center text-primary-foreground hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <Minus className="h-6 w-6" />
                </button>
                <div className="flex-1 flex items-center justify-center text-primary-foreground font-bold text-xl">
                  {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : `${quantity} in Cart`}
                </div>
                <button 
                  onClick={handleIncrement}
                  disabled={isPending}
                  className="w-14 h-12 rounded-lg flex items-center justify-center text-primary-foreground hover:bg-white/20 active:bg-white/30 transition-colors disabled:opacity-50"
                >
                  <Plus className="h-6 w-6" />
                </button>
              </div>
            ) : (
              <Button 
                onClick={handleAdd}
                disabled={isPending}
                className="w-full rounded-xl h-14 text-lg font-bold shadow-md hover:shadow-lg transition-all"
              >
                {isPending ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
                Add to Cart
              </Button>
            )}
          </div>

          <Separator className="mb-6" />

          {/* Description */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-lg">Product Details</h3>
            <div className="text-gray-600 leading-relaxed text-sm space-y-4">
              {product.description ? (
                <p>{product.description}</p>
              ) : (
                <p>High quality {product.name.toLowerCase()} sourced locally. Freshness guaranteed. Delivered to your doorstep in minutes.</p>
              )}
            </div>
          </div>
          
          {/* Important Info */}
          <div className="mt-8 bg-blue-50/50 rounded-xl p-4 border border-blue-100 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-900">
              <p className="font-medium mb-1">Important Information</p>
              <p className="text-blue-700/80">Actual product packaging and materials may contain more and different information than what is shown on our app or website. We recommend that you do not rely solely on the information presented here and that you always read labels, warnings, and directions before using or consuming a product.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
