'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface HoverContextType {
  hoveredElement: string | null;
  hoveredProduct: string | null;
  setHoveredElement: (element: string | null) => void;
  setHoveredProduct: (productId: string | null) => void;
  pageScrollPosition: number;
  setPageScrollPosition: (position: number) => void;
}

const HoverContext = createContext<HoverContextType | undefined>(undefined);

export const HoverProvider = ({ children }: { children: ReactNode }) => {
  const [hoveredElement, setHoveredElement] = useState<string | null>(null);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [pageScrollPosition, setPageScrollPosition] = useState(0);

  return (
    <HoverContext.Provider value={{
      hoveredElement,
      hoveredProduct,
      setHoveredElement,
      setHoveredProduct,
      pageScrollPosition,
      setPageScrollPosition
    }}>
      {children}
    </HoverContext.Provider>
  );
};

export const useHover = () => {
  const context = useContext(HoverContext);
  if (!context) {
    throw new Error('useHover must be used within a HoverProvider');
  }
  return context;
}; 