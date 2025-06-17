import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { ShoppingCart, MessageSquare, Leaf } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const { state } = useCart();
  const { setIsOpen, isOpen } = useChat();

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200/50 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer group"
            onClick={() => router.push('/')}
          >
            <div className="bg-emerald-100 p-2 rounded-xl mr-3 group-hover:bg-emerald-200 transition-colors">
              <Leaf className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xl font-semibold text-neutral-900 tracking-tight">FreshVeg</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              Home
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => router.push('/cart')}
              className="relative text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Cart
              {state.items.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                  {state.items.length}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 px-4 py-2 rounded-xl transition-all duration-200"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
