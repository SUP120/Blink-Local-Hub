import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, CreditCard, Banknote, MapPin, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { data: cart, isLoading: isCartLoading } = useGetCart();
  const createOrder = useCreateOrder();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi");
  
  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!address.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter your delivery address.",
        variant: "destructive"
      });
      return;
    }
    
    createOrder.mutate(
      { data: { deliveryAddress: address, paymentMethod } },
      {
        onSuccess: (order) => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setLocation(`/orders/${order.id}`);
          toast({
            title: "Order Placed Successfully!",
            description: "Your order is on the way.",
          });
        },
        onError: () => {
          toast({
            title: "Checkout Failed",
            description: "There was a problem placing your order. Please try again.",
            variant: "destructive"
          });
        }
      }
    );
  };

  if (isCartLoading) {
    return (
      <div className="max-w-3xl mx-auto pb-12 flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    setLocation("/cart");
    return null;
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">Checkout</h1>
      
      <form onSubmit={handleCheckout} className="flex flex-col md:flex-row gap-8">
        <div className="flex-1 space-y-6">
          {/* Address Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" /> Delivery Address
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Complete Address</Label>
                <Input 
                  id="address" 
                  placeholder="House/Flat No, Building, Street, Area" 
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="bg-gray-50 border-gray-200"
                  autoFocus
                />
              </div>
            </div>
          </div>
          
          {/* Payment Section */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment Method
            </h2>
            
            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
              <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <RadioGroupItem value="upi" id="upi" />
                <Label htmlFor="upi" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                  UPI (GPay, PhonePe, Paytm)
                </Label>
              </div>
              <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <RadioGroupItem value="card" id="card" />
                <Label htmlFor="card" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                  Credit / Debit Card
                </Label>
              </div>
              <div className="flex items-center space-x-3 border border-gray-200 p-4 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors [&:has(:checked)]:border-primary [&:has(:checked)]:bg-primary/5">
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="flex-1 cursor-pointer font-medium flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-gray-500" /> Cash on Delivery
                </Label>
              </div>
            </RadioGroup>
          </div>
        </div>
        
        {/* Order Summary */}
        <div className="w-full md:w-80 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-bold text-gray-900 mb-4">To Pay</h2>
            
            <div className="flex justify-between items-center mb-6">
              <span className="font-medium text-gray-600">Total Amount</span>
              <span className="text-2xl font-black text-gray-900">₹{cart.total}</span>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                <span><span className="font-medium text-gray-900">{cart.itemCount} items</span> will be delivered in ~10 minutes to the address provided.</span>
              </div>
            </div>
            
            <Button 
              type="submit"
              className="w-full rounded-full font-bold shadow-md hover:shadow-lg transition-all" 
              size="lg"
              disabled={createOrder.isPending || !address.trim()}
            >
              {createOrder.isPending ? (
                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
              ) : (
                `Pay ₹${cart.total}`
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
