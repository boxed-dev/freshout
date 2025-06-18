'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import { products } from '@/data/products';
import type { Product } from '@/contexts/CartContext';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { useHover } from '@/contexts/HoverContext';
import { ArrowRight, Truck, Shield, Leaf } from '@/lib/icons';
import ProductCard from '@/components/ProductCard';

// Dynamic import for ChatBot to improve initial load time
const ChatBot = dynamic(() => import('@/components/ChatBot'), {
  ssr: false,
  loading: () => null
});

export default function HomePage() {
  const router = useRouter();
  const { addItem } = useCart();
  const { setCurrentPage } = useChat();
  const { setHoveredProduct, setHoveredElement } = useHover();

  useEffect(() => {
    setCurrentPage('home');
  }, [setCurrentPage]);

  const handleAddToCart = useCallback((product: Product) => {
    addItem(product);
  }, [addItem]);

  const handleViewProduct = useCallback((productId: string) => {
    router.push(`/product/${productId}`);
  }, [router]);
  
  const prefetchProduct = useCallback((productId: string) => {
    router.prefetch?.(`/product/${productId}`);
  }, [router]);

  const scrollToProducts = useCallback(() => {
    const grid = document.getElementById('product-grid');
    if (grid) grid.scrollIntoView({ behavior: 'smooth' });
  }, []);
  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f9fafb 0%, #e5e7eb 100%)' }}>
      <Navbar />
      <ChatBot />

      {/* Hero Section */}
      <section style={{ padding: '6rem 1.5rem' }}>
        <div style={{ maxWidth: '64rem', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            background: '#ecfdf5',
            color: '#047857',
            fontSize: '0.875rem',
            fontWeight: '500',
            padding: '0.5rem 1rem',
            borderRadius: '9999px',
            marginBottom: '2rem'
          }}>
            <Leaf style={{ width: '1rem', height: '1rem' }} />
            100% Organic & Fresh
          </div>
          <h1 style={{ 
            fontSize: 'clamp(3rem, 5vw, 4rem)', 
            fontWeight: 'bold', 
            color: '#171717', 
            marginBottom: '1.5rem',
            letterSpacing: '-0.025em'
          }}>
            Premium <span style={{ color: '#059669' }}>Vegetables</span><br/>
            <span style={{ color: '#525252', fontWeight: '500' }}>Delivered Fresh</span>
          </h1>
          <p style={{ 
            fontSize: '1.25rem', 
            color: '#525252', 
            marginBottom: '2rem', 
            maxWidth: '32rem', 
            margin: '0 auto 2rem auto',
            lineHeight: '1.7'
          }}>
            Farm-fresh, organic vegetables sourced directly from trusted farmers. 
            Experience the taste of nature with every bite.
          </p>
          <button 
            style={{
              background: '#059669',
              color: 'white',
              padding: '1rem 2rem',
              fontSize: '1.125rem',
              borderRadius: '0.75rem',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
            onClick={scrollToProducts}
            onMouseOver={(e) => {
              e.currentTarget.style.background = '#047857';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = '#059669';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            }}
          >
            Shop Fresh Vegetables
            <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
          </button>
        </div>
      </section>      {/* Features Section */}
      <section style={{ padding: '4rem 1.5rem', background: 'white' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto' }}>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
            gap: '2rem' 
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                background: '#ecfdf5', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem auto',
                transition: 'background-color 0.2s'
              }}>
                <Leaf style={{ width: '1.75rem', height: '1.75rem', color: '#059669' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
                100% Organic
              </h3>
              <p style={{ color: '#525252', lineHeight: '1.7' }}>
                Grown without harmful chemicals or pesticides, ensuring pure and natural nutrition.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                background: '#dbeafe', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem auto',
                transition: 'background-color 0.2s'
              }}>
                <Truck style={{ width: '1.75rem', height: '1.75rem', color: '#2563eb' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
                Fast Delivery
              </h3>
              <p style={{ color: '#525252', lineHeight: '1.7' }}>
                Same-day delivery available for orders placed before 2 PM in select areas.
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ 
                width: '3.5rem', 
                height: '3.5rem', 
                background: '#fed7aa', 
                borderRadius: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 1rem auto',
                transition: 'background-color 0.2s'
              }}>
                <Shield style={{ width: '1.75rem', height: '1.75rem', color: '#ea580c' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.75rem', color: '#171717' }}>
                Quality Assured
              </h3>
              <p style={{ color: '#525252', lineHeight: '1.7' }}>
                Direct from farm to your door, maintaining the highest quality standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section id="product-grid" className="py-20 px-6 bg-neutral-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4 tracking-tight">Fresh Vegetables</h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Handpicked from trusted organic farms, delivered fresh to your doorstep
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onViewProduct={handleViewProduct}
                onMouseEnter={(productId: string) => {
                  setHoveredProduct(productId);
                  setHoveredElement(`product-card-${productId}`);
                }}
                onMouseLeave={() => {
                  setHoveredProduct(null);
                  setHoveredElement(null);
                }}
                onPrefetch={prefetchProduct}
              />
            ))}
          </div>        </div>
      </section>
    </div>
  );
}