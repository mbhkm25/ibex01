"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingCart, Plus, Minus, Trash } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet"; // Need to install sheet

interface Product {
  id: number;
  name: string;
  price: string;
  description: string | null;
  isAvailable: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

export function StoreView({ products, whatsappNumber, customerName }: { products: Product[], whatsappNumber: string, customerName: string }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const totalPrice = cart.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);

  const sendOrderViaWhatsApp = () => {
    let message = `*طلب جديد من ${customerName}*\n\n`;
    message += `------------------------\n`;
    
    cart.forEach(item => {
        message += `• ${item.name} (x${item.quantity}) - ${(Number(item.price) * item.quantity).toFixed(2)}\n`;
    });
    
    message += `------------------------\n`;
    message += `*المجموع الكلي: ${totalPrice.toFixed(2)}*\n`;
    
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      {/* Products Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {products.filter(p => p.isAvailable).length === 0 ? (
            <div className="col-span-full text-center text-gray-500 py-10">
                لا توجد منتجات متاحة حالياً.
            </div>
        ) : (
            products.filter(p => p.isAvailable).map((product) => (
            <Card key={product.id} className="flex flex-col">
                <CardHeader>
                <CardTitle className="flex justify-between items-start">
                    <span>{product.name}</span>
                    <Badge variant="secondary" className="mr-2 dir-ltr">
                        {Number(product.price).toFixed(2)}
                    </Badge>
                </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                <p className="text-sm text-gray-500">{product.description}</p>
                </CardContent>
                <CardFooter>
                <Button className="w-full" onClick={() => addToCart(product)}>
                    <Plus className="mr-2 h-4 w-4" /> إضافة للسلة
                </Button>
                </CardFooter>
            </Card>
            ))
        )}
      </div>

      {/* Floating Cart Button (Mobile Friendly) */}
      <div className="fixed bottom-6 left-6 z-50">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0 relative">
              <ShoppingCart className="h-6 w-6" />
              {totalItems > 0 && (
                <Badge className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center rounded-full bg-red-500 text-white border-2 border-white">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>سلة المشتريات</SheetTitle>
            </SheetHeader>
            
            <div className="mt-8 space-y-4 flex-grow overflow-y-auto max-h-[60vh]">
              {cart.length === 0 ? (
                <div className="text-center text-gray-500 py-10">السلة فارغة</div>
              ) : (
                cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between border-b pb-4">
                    <div className="flex-1">
                      <h4 className="font-semibold">{item.name}</h4>
                      <p className="text-sm text-gray-500 dir-ltr text-right">
                         {Number(item.price).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, -1)}>
                          <Minus className="h-3 w-3" />
                       </Button>
                       <span className="w-4 text-center">{item.quantity}</span>
                       <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => updateQuantity(item.id, 1)}>
                          <Plus className="h-3 w-3" />
                       </Button>
                       <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => removeFromCart(item.id)}>
                          <Trash className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <SheetFooter className="mt-auto border-t pt-4">
               <div className="w-full space-y-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                      <span>المجموع:</span>
                      <span className="dir-ltr">{totalPrice.toFixed(2)}</span>
                  </div>
                  <Button className="w-full bg-green-600 hover:bg-green-700" onClick={sendOrderViaWhatsApp} disabled={cart.length === 0}>
                      إرسال الطلب عبر واتساب
                  </Button>
               </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

