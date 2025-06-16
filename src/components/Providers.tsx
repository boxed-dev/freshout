'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { CartProvider } from '@/contexts/CartContext';
import { HoverProvider } from '@/contexts/HoverContext';
import { ChatProvider } from '@/contexts/ChatContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <HoverProvider>
            <ChatProvider>
              <Toaster />
              <Sonner />
              {children}
            </ChatProvider>
          </HoverProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
} 