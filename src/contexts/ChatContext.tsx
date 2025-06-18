'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from './CartContext';
import { useHover } from './HoverContext';
import { openaiService } from '@/services/openaiService';
import { getProductById, getAllProducts } from '@/data/products';
import { formatPrice, formatPriceWithUnit } from '@/lib/utils';
import { db, PersistedChatMessage } from '@/lib/db';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  sendMessage: (message: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
  hasApiKey: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [hasApiKey, setHasApiKey] = useState(!!openaiService.getApiKey());
  const router = useRouter();
  const pathname = usePathname();
  const { state: cartState, addItem, removeItem, updateQuantity, clearCart } = useCart();
  const { hoveredProduct, hoveredElement } = useHover();
  
  // Real-time cart monitoring for enhanced context
  const [lastCartUpdate, setLastCartUpdate] = useState(Date.now());
  const [cartStateRef, setCartStateRef] = useState(cartState);
  
  useEffect(() => {
    setLastCartUpdate(Date.now());
    setCartStateRef(cartState);
  }, [cartState.items, cartState.total]);

  // Pre-fetch commonly visited routes for snappier navigation
  useEffect(() => {
    (router as unknown as { prefetch?: (url: string) => void }).prefetch?.('/');
    (router as unknown as { prefetch?: (url: string) => void }).prefetch?.('/cart');
  }, [router]);

  // On first mount load messages from IndexedDB, or create welcome message
  useEffect(() => {
    (async () => {
      try {
        const saved = await db.chatMessages.toArray();
        if (saved.length) {
          setMessages(saved.map(m => ({ ...m, timestamp: new Date(m.timestamp) })));
        } else {
          const welcome: ChatMessage = {
            id: '1',
            text: "Hello! How can I assist you today with your vegetable shopping? 🥬\n\nI can help you:\n- **Find products** by name or category\n- **Add items to cart** instantly\n- **Recommend vegetables** for specific dishes\n- **Navigate** through the store\n- **Answer questions** about nutrition and cooking\n\nTo enable AI-powered responses, please set your OpenAI API key using the settings button.",
            isUser: false,
            timestamp: new Date()
          };
          setMessages([welcome]);
          await db.chatMessages.add({ ...welcome, timestamp: welcome.timestamp.toISOString() });
        }
      } catch (err) {
        console.error('Failed to load chat messages', err);
      }
    })();
  }, []);

  // Persist messages whenever they change
  useEffect(() => {
    (async () => {
      try {
        await db.chatMessages.clear();
        if (messages.length) {
          const toSave: PersistedChatMessage[] = messages.map(m => ({ ...m, timestamp: m.timestamp.toISOString() }));
          await db.chatMessages.bulkPut(toSave);
        }
      } catch (err) {
        console.error('Failed to persist chat messages', err);
      }
    })();
  }, [messages]);

  const getPageContext = () => {
    const path = pathname || '/';
    if (path === '/') return `home page showing products, cart has ${cartState.items.length} items worth ${formatPrice(cartState.total)}`;
    if (path === '/cart') return `cart page with ${cartState.items.length} items, total: ${formatPrice(cartState.total)}`;
    if (path.startsWith('/product/')) {
      const productId = path.split('/')[2];
      const product = getProductById(productId);
      return `product page for ${product?.name || productId}, price: ${product ? formatPriceWithUnit(product.price, product.unit) : 'unknown'}`;
    }
    return 'unknown page';
  };

  const processNavigationCommand = (response: string): string => {
    let hasNavigation = false;
    let navigationMessage = '';
    
    if (response.includes('navigate:home')) {
      router.push('/');
      setCurrentPage('home');
      hasNavigation = true;
      navigationMessage = '\n\n📍 Navigating to home page...';
    } else if (response.includes('navigate:cart')) {
      router.push('/cart');
      setCurrentPage('cart');
      hasNavigation = true;
      navigationMessage = '\n\n📍 Taking you to your cart...';
    } else if (response.includes('navigate:product:')) {
      const productMatch = response.match(/navigate:product:([\w-]+)/);
      if (productMatch) {
        router.push(`/product/${productMatch[1]}`);
        setCurrentPage('product');
        hasNavigation = true;
        const product = getProductById(productMatch[1]);
        navigationMessage = `\n\n📍 Navigating to ${product?.name || 'product'} page...`;
      }
    }
    
    // Remove navigation commands from display and add navigation message if navigation occurred
    let cleanedResponse = response.replace(/navigate:[\w-]+:?[\w-]*/g, '').trim();
    
    // If response becomes empty after removing navigation commands, provide a default message
    if (!cleanedResponse && hasNavigation) {
      cleanedResponse = 'Let me take you there!' + navigationMessage;
    } else if (hasNavigation) {
      cleanedResponse += navigationMessage;
    }
    
    return cleanedResponse;
  };

  const processCartCommands = (response: string): string => {
    let updatedResponse = response;
    
    // Handle bulk add all products
    if (response.includes('add_all_to_cart')) {
      const allProducts = getAllProducts();
      const addedProducts: string[] = [];
      let totalAdded = 0;
      let totalCost = 0;
      
      allProducts.forEach(product => {
        // Check if product is not already in cart or add 1 more if it is
        const existingItem = cartState.items.find(item => item.id === product.id);
        if (!existingItem) {
          addItem(product, 1);
          addedProducts.push(`${product.name}`);
          totalAdded++;
          totalCost += product.price;
        }
      });
      
      if (addedProducts.length > 0) {
        const confirmation = `✅ Added ${totalAdded} products to your cart (₹${totalCost} total)`;
        updatedResponse = updatedResponse.replace(/add_all_to_cart/g, confirmation);
      } else {
        updatedResponse = updatedResponse.replace(/add_all_to_cart/g, '✅ All products already in your cart!');
      }
    }
    
    // Handle add to cart (support multiple commands in one response)
    const addRegex = /add_to_cart:([\w-]+)(?::(\d+))?/g;
    let addMatch;
    while ((addMatch = addRegex.exec(response)) !== null) {
      const productId = addMatch[1];
      const quantity = parseInt(addMatch[2] || '1');
      const product = getProductById(productId);
      if (!product) continue;

      const currentTotal = cartState.total;
      const currentItemCount = cartState.items.reduce((sum, item) => sum + item.quantity, 0);

      addItem(product, quantity);

      const newEstimatedTotal = currentTotal + product.price * quantity;
      const newItemCount = currentItemCount + quantity;

      const confirmation = `✅ Added ${quantity} ${product.name} to your cart (${formatPriceWithUnit(product.price, product.unit)})`;

      updatedResponse = updatedResponse.replace(addMatch[0], confirmation);
    }
    
    // Handle remove from cart (support multiple removals)
    const removeRegex = /remove_from_cart:([\w-]+)(?::(\d+))?/g;
    let removeMatch;
    const removedItems: string[] = [];
    let totalRefunded = 0;
    
    while ((removeMatch = removeRegex.exec(response)) !== null) {
      const productId = removeMatch[1];
      const quantity = parseInt(removeMatch[2] || '1');
      const cartItem = cartState.items.find(item => item.id === productId);
      
      if (cartItem) {
        const product = getProductById(productId);
        if (product) {
          if (quantity >= cartItem.quantity) {
            // Remove entire item
            removeItem(productId);
            removedItems.push(product.name);
            totalRefunded += product.price * cartItem.quantity;
          } else {
            // Update quantity
            const newQuantity = cartItem.quantity - quantity;
            updateQuantity(productId, newQuantity);
            removedItems.push(`${quantity} ${product.name}`);
            totalRefunded += product.price * quantity;
          }
        }
      }
    }
    
    if (removedItems.length > 0) {
      const refundText = totalRefunded > 0 ? ` (₹${totalRefunded} refunded)` : '';
      const confirmation = removedItems.length === 1 
        ? `🗑️ Removed ${removedItems[0]} from your cart${refundText}`
        : `🗑️ Removed ${removedItems.join(' and ')} from your cart${refundText}`;
      
      updatedResponse = updatedResponse.replace(/remove_from_cart:[\w-]+:?\d*/g, '').trim();
      updatedResponse = updatedResponse ? `${updatedResponse}\n\n${confirmation}` : confirmation;
    }
    
    // Handle intelligent category removal
    const categoryRemovalMatch = response.match(/remove_category:([\w-]+)/);
    if (categoryRemovalMatch) {
      const category = categoryRemovalMatch[1];
      const removedCategoryItems: string[] = [];
      let categoryRefunded = 0;
      
      if (category === 'non-leafy') {
        // Remove all non-leafy vegetables
        const leafyCategories = ['Leafy Greens'];
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && !leafyCategories.includes(product.category)) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      } else if (category === 'leafy') {
        // Remove all leafy vegetables
        const leafyCategories = ['Leafy Greens'];
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && leafyCategories.includes(product.category)) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      } else if (category === 'organic') {
        // Remove all organic items
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && product.isOrganic) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      } else if (category === 'non-organic') {
        // Remove all non-organic items
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && !product.isOrganic) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      } else if (category === 'expensive') {
        // Remove items over ₹350
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && product.price > 350) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      } else if (category === 'cheap') {
        // Remove items under ₹250
        cartState.items.forEach(item => {
          const product = getProductById(item.id);
          if (product && product.price < 250) {
            removeItem(item.id);
            removedCategoryItems.push(product.name);
            categoryRefunded += product.price * item.quantity;
          }
        });
      }
      
      if (removedCategoryItems.length > 0) {
        const categoryRefundText = categoryRefunded > 0 ? ` (₹${categoryRefunded} refunded)` : '';
        const categoryConfirmation = `🗑️ Removed all ${category.replace('-', ' ')} items: ${removedCategoryItems.join(', ')}${categoryRefundText}`;
        updatedResponse = updatedResponse.replace(/remove_category:[\w-]+/g, categoryConfirmation);
      } else {
        updatedResponse = updatedResponse.replace(/remove_category:[\w-]+/g, `❌ No ${category.replace('-', ' ')} items found in your cart`);
      }
    }
    
    // Handle smart price-based removal
    const priceRankMatch = response.match(/remove_price_rank:(\d+)/);
    if (priceRankMatch) {
      const position = parseInt(priceRankMatch[1]);
      
      // Sort cart items by price (descending)
      const sortedByPrice = cartState.items
        .map(item => ({ ...item, product: getProductById(item.id) }))
        .filter(item => item.product)
        .sort((a, b) => (b.product?.price || 0) - (a.product?.price || 0));
      
      if (sortedByPrice.length >= position) {
        const itemToRemove = sortedByPrice[position - 1];
        if (itemToRemove.product) {
          removeItem(itemToRemove.id);
          const refundAmount = itemToRemove.product.price * itemToRemove.quantity;
          const confirmation = `🗑️ Removed ${itemToRemove.product.name} (${position === 1 ? 'most expensive' : position === 2 ? 'second most expensive' : `${position}${position > 3 ? 'th' : position === 3 ? 'rd' : 'nd'} most expensive`} item) from your cart (₹${refundAmount} refunded)`;
          updatedResponse = updatedResponse.replace(/remove_price_rank:\d+/g, confirmation);
        }
      } else {
        updatedResponse = updatedResponse.replace(/remove_price_rank:\d+/g, `❌ Only ${sortedByPrice.length} items in cart, cannot remove ${position}${position > 3 ? 'th' : position === 3 ? 'rd' : position === 2 ? 'nd' : 'st'} most expensive`);
      }
    }
    
    // Handle smart criteria removal
    const smartRemovalMatch = response.match(/remove_smart:(\w+)/);
    if (smartRemovalMatch) {
      const criteria = smartRemovalMatch[1];
      let targetItem = null;
      let confirmationText = '';
      
      if (criteria === 'priciest' || criteria === 'most_expensive') {
        // Find most expensive item
        const items = cartState.items
          .map(item => ({ ...item, product: getProductById(item.id) }))
          .filter(item => item.product);
        targetItem = items.length > 0 ? items.reduce((max, item) => 
          (item.product?.price || 0) > (max.product?.price || 0) ? item : max
        ) : null;
        confirmationText = 'most expensive';
      } else if (criteria === 'cheapest' || criteria === 'least_expensive') {
        // Find cheapest item
        const items = cartState.items
          .map(item => ({ ...item, product: getProductById(item.id) }))
          .filter(item => item.product);
        targetItem = items.length > 0 ? items.reduce((min, item) => 
          (item.product?.price || 0) < (min.product?.price || 0) ? item : min
        ) : null;
        confirmationText = 'cheapest';
      } else if (criteria === 'largest_quantity' || criteria === 'most_quantity') {
        // Find item with largest quantity
        const items = cartState.items
          .map(item => ({ ...item, product: getProductById(item.id) }))
          .filter(item => item.product);
        targetItem = items.length > 0 ? items.reduce((max, item) => 
          item.quantity > max.quantity ? item : max
        ) : null;
        confirmationText = 'largest quantity';
      } else if (criteria === 'smallest_quantity' || criteria === 'least_quantity') {
        // Find item with smallest quantity
        const items = cartState.items
          .map(item => ({ ...item, product: getProductById(item.id) }))
          .filter(item => item.product);
        targetItem = items.length > 0 ? items.reduce((min, item) => 
          item.quantity < min.quantity ? item : min
        ) : null;
        confirmationText = 'smallest quantity';
      }
      
      if (targetItem && targetItem.product) {
        removeItem(targetItem.id);
        const refundAmount = targetItem.product.price * targetItem.quantity;
        const confirmation = `🗑️ Removed ${targetItem.product.name} (${confirmationText} item) from your cart (₹${refundAmount} refunded)`;
        updatedResponse = updatedResponse.replace(/remove_smart:\w+/g, confirmation);
      } else {
        updatedResponse = updatedResponse.replace(/remove_smart:\w+/g, `❌ No items found matching "${criteria}" criteria`);
      }
    }
    
    // Handle update quantity
    const updateQuantityMatch = response.match(/update_quantity:([\w-]+):(\d+)/);
    if (updateQuantityMatch) {
      const productId = updateQuantityMatch[1];
      const newQuantity = parseInt(updateQuantityMatch[2]);
      const cartItem = cartState.items.find(item => item.id === productId);
      
      if (cartItem && newQuantity > 0) {
        const product = getProductById(productId);
        if (product) {
          updateQuantity(productId, newQuantity);
          const difference = newQuantity - cartItem.quantity;
          const action = difference > 0 ? 'increased' : 'decreased';
          
          updatedResponse = updatedResponse.replace(/update_quantity:[\w-]+:\d*/g, 
            `📊 ${action.charAt(0).toUpperCase() + action.slice(1)} ${product.name} quantity to ${newQuantity}!\n\n**Cart Update:**\n- New quantity: ${newQuantity} x ${product.name}\n- New item total: ${formatPrice(product.price * newQuantity)}`
          ).trim();
        }
      } else if (newQuantity === 0) {
        removeItem(productId);
        updatedResponse = updatedResponse.replace(/update_quantity:[\w-]+:\d*/g, 
          `🗑️ Removed ${cartItem?.name || 'item'} from your cart!`
        ).trim();
      }
    }
    
    // Handle clear cart
    if (response.includes('clear_cart')) {
      clearCart();
      updatedResponse = updatedResponse.replace(/clear_cart/g, 
        `🗑️ **Cart Cleared!** All items have been removed from your cart.`
      ).trim();
    }
    
    return updatedResponse;
  };

  const processCommand = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Cart operation commands
    
    // Multiple product removal commands
    if ((lowerMessage.includes('remove') || lowerMessage.includes('take out') || lowerMessage.includes('delete')) && 
        (lowerMessage.includes('and') || lowerMessage.includes(','))) {
      // Handle multiple product removal like "remove cucumbers and onions"
      const productKeywords = [
        { keywords: ['cucumber'], id: 'cucumber' },
        { keywords: ['onion'], id: 'onion' },
        { keywords: ['tomato'], id: 'tomato' },
        { keywords: ['carrot'], id: 'carrot' },
        { keywords: ['lettuce'], id: 'lettuce' },
        { keywords: ['broccoli'], id: 'broccoli' },
        { keywords: ['pepper'], id: 'bell-pepper' },
        { keywords: ['spinach'], id: 'spinach' },
        { keywords: ['zucchini'], id: 'zucchini' },
        { keywords: ['potato'], id: 'potato' },
        { keywords: ['eggplant'], id: 'eggplant' },
        { keywords: ['cabbage'], id: 'cabbage' },
        { keywords: ['cauliflower'], id: 'cauliflower' },
        { keywords: ['corn'], id: 'corn' },
        { keywords: ['mushroom'], id: 'mushroom' }
      ];
      
      const productsToRemove: string[] = [];
      let totalRefunded = 0;
      
      productKeywords.forEach(productInfo => {
        if (productInfo.keywords.some(keyword => lowerMessage.includes(keyword))) {
          const cartItem = cartState.items.find(item => item.id === productInfo.id);
          if (cartItem) {
            removeItem(productInfo.id);
            productsToRemove.push(cartItem.name);
            totalRefunded += cartItem.price * cartItem.quantity;
          }
        }
      });
      
      if (productsToRemove.length > 0) {
        const refundText = totalRefunded > 0 ? ` (₹${totalRefunded} refunded)` : '';
        return productsToRemove.length === 1 
          ? `🗑️ Removed ${productsToRemove[0]} from your cart${refundText}`
          : `🗑️ Removed ${productsToRemove.join(' and ')} from your cart${refundText}`;
      } else {
        return `❌ None of those items were found in your cart.`;
      }
    }
    
    // Single product removal commands
    if ((lowerMessage.includes('remove') || lowerMessage.includes('take out') || lowerMessage.includes('delete')) && lowerMessage.includes('tomato')) {
      const cartItem = cartState.items.find(item => item.id === 'tomato');
      if (cartItem) {
        const quantityMatch = lowerMessage.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        if (quantity >= cartItem.quantity) {
          removeItem('tomato');
          return `🗑️ Removed ${cartItem.name} from your cart (₹${cartItem.price * cartItem.quantity} refunded)`;
        } else {
          updateQuantity('tomato', cartItem.quantity - quantity);
          return `🗑️ Removed ${quantity} ${cartItem.name} from your cart (₹${cartItem.price * quantity} refunded)`;
        }
      } else {
        return `❌ No tomatoes found in your cart.`;
      }
    }
    
    // Add to cart commands
    if (lowerMessage.includes('add') && (lowerMessage.includes('cart') || lowerMessage.includes('carrot'))) {
      if (lowerMessage.includes('carrot')) {
        const product = getProductById('carrot');
        if (product) {
          addItem(product);
          return `✅ Added ${product.name} to your cart! You now have ${cartState.items.reduce((sum, item) => sum + item.quantity, 0) + 1} items.`;
        }
      }
    }
    
    if (lowerMessage.includes('add') && lowerMessage.includes('tomato')) {
      const product = getProductById('tomato');
      if (product) {
        addItem(product);
        return `✅ Added ${product.name} to your cart! You now have ${cartState.items.reduce((sum, item) => sum + item.quantity, 0) + 1} items.`;
      }
    }
    
    // Bulk add command
    if ((lowerMessage.includes('add') && (lowerMessage.includes('all') || lowerMessage.includes('everything') || lowerMessage.includes('each'))) ||
        (lowerMessage.includes('1 unit each') || lowerMessage.includes('one of each'))) {
      const allProducts = getAllProducts();
      const addedProducts: string[] = [];
      let totalAdded = 0;
      let totalCost = 0;
      
      allProducts.forEach(product => {
        const existingItem = cartState.items.find(item => item.id === product.id);
        if (!existingItem) {
          addItem(product, 1);
          addedProducts.push(product.name);
          totalAdded++;
          totalCost += product.price;
        }
      });
      
      if (addedProducts.length > 0) {
        return `✅ Added ${totalAdded} products to your cart!\n\n**Products Added:**\n${addedProducts.map(name => `• ${name}`).join('\n')}\n\n**Total Cost Added:** ${formatPrice(totalCost)}\n**Your cart now has:** ${cartState.items.length + totalAdded} unique items`;
      } else {
        return '✅ All available products are already in your cart!';
      }
    }
    
    // Navigation commands (fallback for non-AI responses)
    if (lowerMessage.includes('home') || lowerMessage.includes('main page')) {
      router.push('/');
      setCurrentPage('home');
      return "Taking you to the home page!";
    }
    
    if ((lowerMessage.includes('cart') || lowerMessage.includes('shopping cart')) && !lowerMessage.includes('add')) {
      router.push('/cart');
      setCurrentPage('cart');
      return `Taking you to your cart! You have ${cartState.items.length} items.`;
    }
    
    // Product searches with detailed information
    if (lowerMessage.includes('tomato') || lowerMessage.includes('show') && lowerMessage.includes('tomato')) {
      router.push('/product/tomato');
      setCurrentPage('product');
      const tomato = getProductById('tomato');
      if (tomato) {
        return `🍅 **${tomato.name}**: ${formatPriceWithUnit(tomato.price, tomato.unit)}\n\n${tomato.description}\n\nNavigating to tomato page...`;
      }
      return "Here are our fresh tomatoes!";
    }
    
    if (lowerMessage.includes('carrot') || (lowerMessage.includes('show') && lowerMessage.includes('carrot'))) {
      router.push('/product/carrot');
      setCurrentPage('product');
      const carrot = getProductById('carrot');
      if (carrot) {
        return `🥕 **${carrot.name}**: ${formatPriceWithUnit(carrot.price, carrot.unit)}\n\n${carrot.description}\n\nNavigating to carrot page...`;
      }
      return "Check out our organic carrots!";
    }

    // Handle other common product searches
    const productKeywords = [
      { keywords: ['lettuce'], id: 'lettuce', emoji: '🥬' },
      { keywords: ['broccoli'], id: 'broccoli', emoji: '🥦' },
      { keywords: ['bell pepper', 'pepper'], id: 'bell-pepper', emoji: '🫑' },
      { keywords: ['spinach'], id: 'spinach', emoji: '🥬' },
      { keywords: ['cucumber'], id: 'cucumber', emoji: '🥒' },
      { keywords: ['onion'], id: 'onion', emoji: '🧅' }
    ];

    for (const productInfo of productKeywords) {
      if (productInfo.keywords.some(keyword => lowerMessage.includes(keyword)) || 
          (lowerMessage.includes('show') && productInfo.keywords.some(keyword => lowerMessage.includes(keyword)))) {
        router.push(`/product/${productInfo.id}`);
        setCurrentPage('product');
        const product = getProductById(productInfo.id);
        if (product) {
          return `${productInfo.emoji} **${product.name}**: ${formatPriceWithUnit(product.price, product.unit)}\n\n${product.description}\n\nNavigating to ${product.name.toLowerCase()} page...`;
        }
        return `Here's our ${productInfo.keywords[0]}!`;
      }
    }
    
    if (lowerMessage.includes('vegetable') || lowerMessage.includes('produce')) {
      router.push('/');
      setCurrentPage('home');
      setTimeout(() => {
        const productGrid = document.getElementById('product-grid');
        if (productGrid) {
          productGrid.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return "Here are all our fresh vegetables!";
    }
    
    // Cart information
    if (lowerMessage.includes('how many') || lowerMessage.includes('cart items') || lowerMessage.includes('total') || lowerMessage.includes('cart')) {
      if (cartState.items.length === 0) {
        return `Your cart is currently empty. Browse our fresh vegetables and add some to your cart! 🛒`;
      }
      
      const itemsList = cartState.items.map(item => 
        `• **${item.name}** x${item.quantity} - ${formatPrice(item.price * item.quantity)}`
      ).join('\n');
      
      return `🛒 **Your Cart Summary:**\n\n${itemsList}\n\n**Total: ${formatPrice(cartState.total)}**\n\nReady to checkout or add more vegetables? 🥬`;
    }
    
    // General help
    if (lowerMessage.includes('help')) {
      return "I can help you navigate the site and add items to your cart! Try saying: 'add carrots to cart', 'show vegetables', 'go to cart', or 'find tomatoes'.";
    }
    
    // Default responses
    const responses = [
      "I understand you're looking for something! Try asking me to add items to your cart, navigate somewhere, or find a specific vegetable.",
      "I'm here to help! I can add products to your cart, navigate the site, or provide information about our vegetables.",
      "Let me help you shop! I can add items to your cart, navigate the site, or find specific vegetables for you."
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async (message: string) => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isUser: true,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Add loading message
    const loadingMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: 'Thinking...',
      isUser: false,
      timestamp: new Date(),
      isLoading: true
    };
    
    setMessages(prev => [...prev, loadingMessage]);
    
    try {
      let response: string;
      
      if (hasApiKey && openaiService.getApiKey()) {
        // Get real-time cart information using the most current state
        const currentCart = cartStateRef;
        const currentCartItems = currentCart.items.map(item => 
          `${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
        ).join(', ');
        const cartSummary = currentCart.items.length > 0 
          ? `Cart contains: ${currentCartItems}. Total: ${formatPrice(currentCart.total)}`
          : 'Cart is empty';

        // Use OpenAI for response
        const context = getPageContext();
        const availableProducts = getAllProducts().map(p => 
          `**${p.name}** (${p.id}): ${formatPriceWithUnit(p.price, p.unit)} - ${p.description}${p.isOrganic ? ' [ORGANIC CERTIFIED]' : ''}`
        ).join('\n');
        
        // Add hover context
        const hoverContext = hoveredProduct 
          ? `User is currently hovering over product: ${getProductById(hoveredProduct)?.name} (${hoveredProduct})`
          : 'User is not hovering over any product';
        
        const fullContext = `${context}. ${hoverContext}`;
        
        const systemMessage = `You are a helpful shopping assistant for a fresh vegetable ecommerce site in India. 

        **CURRENT REAL-TIME CART STATUS**: ${cartSummary}
        
        **Current page context**: ${fullContext}
        
        **Available products**:
        ${availableProducts}
        
        **IMPORTANT CART CALCULATION RULES**:
        - Always use the CURRENT REAL-TIME CART STATUS above for any cart calculations
        - When user asks about totals, use the exact total from the cart status
        - Individual product prices are per unit as listed
        - Cart total is already calculated correctly in the cart status
        
        **INTELLIGENT CATEGORIZATION SYSTEM**:
        **Leafy Vegetables**: Lettuce, Spinach, Cabbage (category: "Leafy Greens")
        **Non-Leafy Vegetables**: Tomatoes, Carrots, Broccoli, Bell Peppers, Cucumbers, Onions, Zucchini, Potatoes, Eggplants, Cauliflower, Corn, Mushrooms, Sweet Potatoes
        **Root Vegetables**: Carrots, Potatoes, Sweet Potatoes, Onions
        **Cruciferous**: Broccoli, Cauliflower, Cabbage
        **Expensive Items**: Products over ₹350 (Bell Peppers ₹599, Broccoli ₹429, Mushrooms ₹389, Cauliflower ₹399, etc.)
        **Cheap Items**: Products under ₹250 (Carrots ₹249, Lettuce ₹199, Potatoes ₹159, etc.)
        **Organic vs Non-Organic**: Check the isOrganic property of each product
        
        **Your capabilities**:
        - **Navigate the site** (respond with navigation commands like "navigate:home", "navigate:cart", "navigate:product:tomato")
        - **Add products to cart** (respond with "add_to_cart:productId:quantity" - e.g., "add_to_cart:carrot:2")
        - **Add all products to cart** (respond with "add_all_to_cart" when user wants to add one of each product)
        - **Remove products from cart** (respond with "remove_from_cart:productId:quantity" - e.g., "remove_from_cart:tomato:1")
        - **Remove by category** (respond with "remove_category:categoryName" - e.g., "remove_category:non-leafy", "remove_category:organic", "remove_category:expensive")
        - **Remove by price rank** (respond with "remove_price_rank:position" - e.g., "remove_price_rank:1" for most expensive, "remove_price_rank:2" for second most expensive)
        - **Remove by smart criteria** (respond with "remove_smart:criteria" - e.g., "remove_smart:priciest", "remove_smart:cheapest", "remove_smart:largest_quantity")
        - **Update product quantities** (respond with "update_quantity:productId:newQuantity" - e.g., "update_quantity:carrot:3")
        - **Clear entire cart** (respond with "clear_cart" to remove all items)
        - **Handle bulk operations** like "add 1 unit each" or "add all products" (use "add_all_to_cart")
        - **Intelligent category operations** like "remove all non-leafy vegetables", "remove expensive items", "keep only organic"
        - **Search for products** by name, category, or cooking use
        - **Provide detailed product information** with nutritional benefits, organic status, and cooking tips
        - **Recommend vegetables** for specific dishes, cuisines, health goals, or dietary requirements
        - **Answer questions** about vegetable storage, cooking methods, nutrition, and preparation
        - **Provide accurate cart totals** using the CURRENT REAL-TIME CART STATUS
        - **Be context-aware** of what users are currently hovering over or viewing
        - **Handle complex requests** like "remove one tomato" or "change carrots to 3 kg"
        - **Understand natural language** for cart operations (e.g., "take out", "remove", "delete", "reduce")
        - **Process bulk requests** like "add one of each", "add all vegetables", "1 unit each"
        - **Accurately inform about organic status** (products marked [ORGANIC CERTIFIED] are certified organic)
        - **Calculate savings** and price comparisons
        - **Suggest complementary items** based on cart contents
        
        **IMPORTANT NAVIGATION RULES**:
        - When users ask to "show me [product]" or want to see a specific product, ALWAYS include the navigation command "navigate:product:[productId]" in your response
        - For example: If user asks "show me carrots", include "navigate:product:carrot" in your response
        - If user asks "show me tomatoes", include "navigate:product:tomato" in your response
        - Available product IDs: tomato, carrot, lettuce, broccoli, bell-pepper, spinach, cucumber, onion
        - The navigation command should be on a separate line at the end of your response
        - ALWAYS navigate when users want to see details about a specific product
        
        **ADVANCED CART OPERATION RULES**:
        - **Natural Language Processing**: Understand variations like "remove one", "take out", "delete", "reduce by", "make it 3", etc.
        - **Remove Operations**: Use "remove_from_cart:productId:quantity" for partial removal or full removal
        - **Category Removal**: Use "remove_category:categoryName" for intelligent bulk removal
        - **Quantity Updates**: Use "update_quantity:productId:newQuantity" when users specify exact quantities
        - **Smart Quantity Handling**: If user says "remove one tomato" and they have 2 tomatoes, use "remove_from_cart:tomato:1"
        - **Full Item Removal**: If removing all of an item, use "remove_from_cart:productId" (without quantity)
        - **Context-Aware Operations**: Always reference current cart contents when processing requests
        - **Confirmation Responses**: Always confirm what action was taken and show updated cart status
        
        **INTELLIGENT REQUEST PROCESSING**:
        - **"Remove all non-leafy vegetables"** → Use "remove_category:non-leafy"
        - **"Remove all expensive items"** → Use "remove_category:expensive"
        - **"Keep only organic items"** → Use "remove_category:non-organic"
        - **"Remove all cheap vegetables"** → Use "remove_category:cheap"
        - **"Remove leafy vegetables"** → Use "remove_category:leafy"
        - **"Remove all organic items"** → Use "remove_category:organic"
        - **"Remove the priciest/most expensive"** → Use "remove_smart:priciest"
        - **"Remove second priciest"** → Use "remove_price_rank:2"
        - **"Remove third most expensive"** → Use "remove_price_rank:3"
        - **"Remove the cheapest"** → Use "remove_smart:cheapest"
        - **"Remove" (without specification after previous context)** → Analyze previous conversation to understand what to remove
        - **Automatically detect and categorize** when users ask for complex removals
        
        **CONTEXT-AWARE PROCESSING**:
        - **Track conversation flow** - if user says "remove the priciest", then "remove second priciest", then just "remove", understand they want the third priciest
        - **Use real-time cart analysis** - dynamically determine what "most expensive", "second priciest" etc. means based on CURRENT cart contents
        - **Intelligent disambiguation** - when user says just "remove", ask for clarification or infer from context
        
        **INTELLIGENT RESPONSE PATTERNS**:
        - If user is imprecise (e.g., "remove some"), ask for clarification
        - If removing more than available, explain and remove what's possible
        - Suggest related actions (e.g., "Would you like to add something else?")
        - Provide cooking tips for items in cart
        - Calculate and show savings from organic products
        
        **Response formatting guidelines**:
        - Use markdown formatting for better readability
        - Use **bold** for product names and important information
        - Use bullet points for lists
        - Include emojis where appropriate for vegetables
        - Prices are in Indian Rupees (₹)
        - When listing products, format as: **Product Name**: ₹Price per unit - brief description
        - When showing cart information, always refer to the CURRENT REAL-TIME CART STATUS
        
        **Special commands**:
        - When users want to add items to cart, use the add_to_cart command
        - When they ask to navigate, use navigation commands
        - Always be enthusiastic about fresh vegetables and healthy eating
        
        Keep responses helpful, well-formatted, and conversational. Focus on the benefits of fresh vegetables and how they can enhance the user's cooking and health.`;
        
        const openAIMessages = messages
          .filter(msg => !msg.isLoading)
          .slice(-5) // Last 5 messages for context
          .map(msg => ({
            role: msg.isUser ? 'user' as const : 'assistant' as const,
            content: msg.text
          }));
        
        openAIMessages.push({
          role: 'user',
          content: message
        });
        
        response = await openaiService.generateResponse(openAIMessages, systemMessage);
        response = processNavigationCommand(response);
        response = processCartCommands(response);
      } else {
        // Fallback to rule-based responses
        response = processCommand(message);
      }
      
      // Remove loading message and add actual response
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          text: response,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => prev.filter(msg => !msg.isLoading).concat(botMessage));
      }, 500);
      
    } catch (error) {
      console.error('Failed to generate response:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 2).toString(),
        text: 'Sorry, I encountered an error. Please check your API key or try again.',
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => prev.filter(msg => !msg.isLoading).concat(errorMessage));
    }
  };

  const updateApiKeyStatus = () => {
    setHasApiKey(!!openaiService.getApiKey());
  };

  return (
    <ChatContext.Provider value={{
      messages,
      isOpen,
      setIsOpen,
      sendMessage,
      currentPage,
      setCurrentPage,
      hasApiKey
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
