'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { getProductById } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { ArrowLeft, ShoppingCart, Plus, Minus, Leaf, Truck, Shield, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPriceWithUnit } from '@/lib/utils';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [id, setId] = React.useState<string>('');
  const [product, setProduct] = React.useState<any>(null);

  useEffect(() => {
    (async () => {
      const resolvedParams = await params;
      const productId = resolvedParams.id;
      setId(productId);
      setProduct(getProductById(productId));
    })();
  }, [params]);
  const { state, addItem } = useCart();
  const { setCurrentPage } = useChat();
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    setCurrentPage('product');
  }, [setCurrentPage]);

  if (!product && id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="bg-neutral-100 rounded-full w-20 h-20 flex items-center justify-center mb-6">
            <ShoppingCart className="w-10 h-10 text-neutral-400" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">Product not found</h2>
          <p className="text-neutral-600 mb-8">The product you're looking for doesn't exist.</p>
          <Button 
            onClick={() => router.push('/')} 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl"
          >
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-neutral-600">Loading product...</p>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setQuantity(1);
  };

  const cartItem = state.items.find(item => item.id === product.id);

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
          Back to Products
        </Button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="relative">
            <div className="aspect-square overflow-hidden rounded-2xl bg-white shadow-sm">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
              {product.isOrganic && (
                <div className="absolute top-4 left-4 bg-emerald-500 text-white text-sm font-medium px-4 py-2 rounded-full flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  Organic
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-neutral-500 mb-2">
                <span>{product.category}</span>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span>4.8 (124 reviews)</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-neutral-900 mb-4">{product.name}</h1>
              <p className="text-lg text-neutral-600 leading-relaxed mb-6">{product.description}</p>
              <div className="text-3xl font-bold text-emerald-600 mb-6">
                {formatPriceWithUnit(product.price, product.unit)}
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {product.features?.map((feature: string, index: number) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-neutral-600">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    {feature}
                  </div>
                ))}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-neutral-900">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white rounded-xl border border-neutral-200">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 rounded-l-xl"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-6 py-3 font-semibold text-lg min-w-[4rem] text-center">{quantity}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-12 h-12 rounded-r-xl"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                {cartItem && (
                  <span className="text-sm text-neutral-500">
                    {cartItem.quantity} in cart
                  </span>
                )}
              </div>
            </div>

            {/* Add to Cart Button */}
            <Button 
              onClick={handleAddToCart} 
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-xl text-lg font-semibold"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Add to Cart
            </Button>

            {/* Delivery Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-0 bg-white shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Truck className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Fast Delivery</p>
                    <p className="text-sm text-neutral-500">Same day if ordered before 2 PM</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 bg-white shadow-sm rounded-xl">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <Shield className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">Quality Assured</p>                    <p className="text-sm text-neutral-500">Fresh guarantee or money back</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}