'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { formatPrice, formatPriceWithUnit } from '@/lib/utils';

export default function CartPage() {
  const router = useRouter();
  const { state, updateQuantity, removeItem, clearCart } = useCart();
  const { setCurrentPage } = useChat();

  useEffect(() => {
    setCurrentPage('cart');
  }, [setCurrentPage]);

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Navbar />
        <ChatBot />
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="bg-neutral-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-neutral-400" />
          </div>
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Your cart is empty</h2>
          <p className="text-neutral-600 mb-8 text-lg">Discover our fresh, organic vegetables and start building your healthy meal.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-xl text-lg"
          >
            Start Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
      <Navbar />
      <ChatBot />
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Button 
          variant="ghost" 
          onClick={() => router.push('/')} 
          className="mb-8 text-neutral-600 hover:text-neutral-900 hover:bg-white rounded-xl px-4 py-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Continue Shopping
        </Button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-neutral-900">Shopping Cart</h1>
          <Button 
            variant="outline" 
            onClick={clearCart} 
            className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 rounded-xl"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map(item => (
              <Card key={item.id} className="bg-white border-0 shadow-sm rounded-2xl overflow-hidden">
                <CardContent className="p-6 flex items-center space-x-6">
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-xl" 
                  />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-neutral-900 mb-1">{item.name}</h3>
                    <p className="text-neutral-500 text-sm mb-2">{item.category}</p>
                    <p className="text-emerald-600 font-semibold">{formatPriceWithUnit(item.price, item.unit)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 p-0 rounded-lg"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-semibold text-lg min-w-[3rem] text-center">{item.quantity}</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 p-0 rounded-lg"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeItem(item.id)} 
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg ml-4"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right min-w-[4rem]">
                    <span className="text-xl font-bold text-neutral-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="lg:col-span-1">
            <Card className="bg-white border-0 shadow-sm rounded-2xl sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl font-semibold text-neutral-900">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-neutral-600">
                  <span>Subtotal ({state.items.length} items)</span>
                  <span className="font-semibold">{formatPrice(state.total)}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-semibold">₹49</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span className="text-neutral-900">Total</span>
                    <span className="text-emerald-600">{formatPrice(state.total + 49)}</span>
                  </div>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-lg font-semibold">
                  Proceed to Checkout
                </Button>
                <p className="text-sm text-neutral-500 text-center">
                  Free delivery on orders over ₹499
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}