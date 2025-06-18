'use client';

import React, { memo, useCallback } from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Leaf } from '@/lib/icons';
import { formatPriceWithUnit } from '@/lib/utils';
import { Product } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewProduct: (productId: string) => void;
  onMouseEnter: (productId: string) => void;
  onMouseLeave: () => void;
  onPrefetch: (productId: string) => void;
}

const ProductCard = memo(function ProductCard({ 
  product, 
  onAddToCart, 
  onViewProduct, 
  onMouseEnter, 
  onMouseLeave,
  onPrefetch 
}: ProductCardProps) {
  const handleAddToCart = useCallback(() => {
    onAddToCart(product);
  }, [onAddToCart, product]);

  const handleViewProduct = useCallback(() => {
    onViewProduct(product.id);
  }, [onViewProduct, product.id]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter(product.id);
    onPrefetch(product.id);
  }, [onMouseEnter, onPrefetch, product.id]);

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="aspect-square overflow-hidden relative">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          priority={product.id === 'tomato' || product.id === 'carrot'}
        />
        {product.isOrganic && (
          <span className="absolute top-3 left-3 bg-emerald-500 text-white text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
            <Leaf className="w-3 h-3" />
            Organic
          </span>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-2 text-neutral-900">{product.name}</h3>
        <p className="text-sm text-neutral-500 mb-4 line-clamp-2 leading-relaxed">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold text-emerald-600">
            {formatPriceWithUnit(product.price, product.unit)}
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleViewProduct}
              className="border-neutral-200 hover:border-neutral-300 rounded-lg"
            >
              View
            </Button>
            <Button 
              size="sm" 
              className="bg-emerald-600 hover:bg-emerald-700 rounded-lg" 
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

export default ProductCard;