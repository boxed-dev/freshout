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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
        <Navbar />
        <ChatBot />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Start adding some fresh vegetables to your cart!</p>
          <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3">
            Shop Now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      <ChatBot />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6 text-gray-600 hover:text-green-600">
          <ArrowLeft className="w-4 h-4 mr-2" />Continue Shopping
        </Button>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <Button variant="outline" onClick={clearCart} className="text-red-600 hover:text-red-700 border-red-200">
            <Trash2 className="w-4 h-4 mr-2" />Clear Cart
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {state.items.map(item => (
              <Card key={item.id} className="bg-white">
                <CardContent className="p-6 flex items-center space-x-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">{item.category}</p>
                    <p className="text-green-600 font-medium">{formatPriceWithUnit(item.price, item.unit)}</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="px-4 py-2 font-medium">{item.quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => removeItem(item.id)} className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="lg:col-span-1">
            <Card className="bg-white sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal ({state.items.length} items)</span>
                  <span>{formatPrice(state.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span>₹49</span>
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">{formatPrice(state.total + 49)}</span>
                  </div>
                </div>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-3">Proceed to Checkout</Button>
                <p className="text-xs text-gray-500 text-center">Free delivery on orders over ₹499</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 