'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { getProductById } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { ArrowLeft, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPriceWithUnit } from '@/lib/utils';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  const product = getProductById(id);
  const { state, addItem } = useCart();
  const { setCurrentPage } = useChat();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setCurrentPage('product');
  }, [setCurrentPage]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <Navbar />
        <p className="text-lg text-gray-700 mb-4">Product not found.</p>
        <Button onClick={() => router.push('/')} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2">Back to Home</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  const cartItem = state.items.find(item => item.id === product.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      <ChatBot />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => router.push('/')} className="mb-6 text-gray-600 hover:text-green-600">
          <ArrowLeft className="w-4 h-4 mr-2" />Back to Products
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="aspect-square overflow-hidden rounded-lg shadow-lg">
            <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
          </div>

          <div className="space-y-6">
            <div>
              <span className="inline-block bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full mb-2">{product.category}</span>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-xl text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <div className="border-t pt-6">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-bold text-green-600">{formatPriceWithUnit(product.price, product.unit)}</span>
                {cartItem && <span className="text-sm text-gray-600">{cartItem.quantity} in cart</span>}
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-700">Quantity:</span>
                  <div className="flex items-center border rounded-lg">
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(q => Math.max(1, q - 1))}><Minus className="w-4 h-4"/></Button>
                    <span className="px-4 py-2 font-medium">{quantity}</span>
                    <Button variant="ghost" size="sm" onClick={() => setQuantity(q => q + 1)}><Plus className="w-4 h-4"/></Button>
                  </div>
                </div>

                <Button onClick={handleAddToCart} className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg">
                  <ShoppingCart className="w-5 h-5 mr-2"/>Add {quantity} to Cart
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 