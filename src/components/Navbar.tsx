import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useChat } from '@/contexts/ChatContext';
import { ShoppingCart, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const router = useRouter();
  const { state } = useCart();
  const { setIsOpen, isOpen } = useChat();

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => router.push('/')}
          >
            <span className="text-2xl mr-2">🥬</span>
            <span className="text-xl font-bold text-gray-900">FreshVeg</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/')}
              className="text-gray-700 hover:text-green-600"
            >
              Home
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => router.push('/cart')}
              className="relative text-gray-700 hover:text-green-600"
            >
              <ShoppingCart className="w-5 h-5 mr-2" />
              Cart
              {state.items.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-green-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {state.items.length}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-green-600"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Chat
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
