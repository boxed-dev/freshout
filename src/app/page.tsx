'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ChatBot from '@/components/ChatBot';
import { products } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { useHover } from '@/contexts/HoverContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import { formatPriceWithUnit } from '@/lib/utils';

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { setCurrentPage } = useChat();
  const { setHoveredProduct, setHoveredElement } = useHover();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  const handleAddToCart = (product: any) => {
    addItem(product);
  };

  const handleViewProduct = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const prefetchProduct = (productId: string) => {
    router.prefetch?.(`/product/${productId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Fresh <span className="text-green-600">Vegetables</span><br/>Delivered Daily
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Farm-fresh, organic vegetables delivered straight to your door. Quality you can taste, freshness you can trust.
          </p>
          <Button size="lg" className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            onClick={() => {
              const grid = document.getElementById('product-grid');
              if (grid) grid.scrollIntoView({ behavior: 'smooth' });
            }}>
            Shop Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🌱</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">100% Organic</h3>
              <p className="text-gray-600">All our vegetables are grown without harmful pesticides or chemicals.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Same-day delivery available for orders placed before 2 PM.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Best Prices</h3>
              <p className="text-gray-600">Direct-from-farm pricing means you get the best value.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="product-grid" className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Fresh Vegetables</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <Card key={product.id}
                className="group hover:shadow-lg transition-shadow duration-300"
                onMouseEnter={() => {
                  setHoveredProduct(product.id);
                  setHoveredElement(`product-card-${product.id}`);
                  prefetchProduct(product.id);
                }}
                onMouseLeave={() => {
                  setHoveredProduct(null);
                  setHoveredElement(null);
                }}>
                <CardHeader className="p-0">
                  <div className="aspect-square overflow-hidden rounded-t-lg relative">
                    <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      src={product.image} alt={product.name} />
                    {product.isOrganic && (
                      <span className="absolute top-2 left-2 bg-green-600 text-white text-xs font-medium px-2 py-1 rounded-full">🌱 Organic</span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg mb-2">{product.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</CardDescription>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold text-green-600">{formatPriceWithUnit(product.price, product.unit)}</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewProduct(product.id)}>View</Button>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAddToCart(product)}>
                        <ShoppingCart className="w-4 h-4 mr-1" />Add
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
} 