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
  
  useEffect(() => {
    setLastCartUpdate(Date.now());
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
    if (response.includes('navigate:home')) {
      router.push('/');
      setCurrentPage('home');
    } else if (response.includes('navigate:cart')) {
      router.push('/cart');
      setCurrentPage('cart');
    } else if (response.includes('navigate:product:')) {
      const productMatch = response.match(/navigate:product:([\w-]+)/);
      if (productMatch) {
        router.push(`/product/${productMatch[1]}`);
        setCurrentPage('product');
      }
    }
    
    // Remove navigation commands from display
    return response.replace(/navigate:[\w-]+:?[\w-]*/g, '').trim();
  };

  const processCartCommands = (response: string): string => {
    let updatedResponse = response;
    
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

      const confirmation = `✅ Added ${quantity} ${product.name}${quantity > 1 ? 's' : ''} to your cart!\n\n**Cart Update:**\n- Items added: ${quantity} x ${product.name} (${formatPriceWithUnit(product.price, product.unit)})\n- New cart total: ${formatPrice(newEstimatedTotal)}\n- Total items: ${newItemCount}`;

      updatedResponse = updatedResponse.replace(addMatch[0], confirmation);
    }
    
    // Handle remove from cart
    const removeFromCartMatch = response.match(/remove_from_cart:([\w-]+)(?::(\d+))?/);
    if (removeFromCartMatch) {
      const productId = removeFromCartMatch[1];
      const quantity = parseInt(removeFromCartMatch[2] || '1');
      const cartItem = cartState.items.find(item => item.id === productId);
      
      if (cartItem) {
        const product = getProductById(productId);
        if (product) {
          if (quantity >= cartItem.quantity) {
            // Remove entire item
            removeItem(productId);
            updatedResponse = updatedResponse.replace(/remove_from_cart:[\w-]+:?\d*/g, 
              `🗑️ Removed all ${product.name} from your cart!\n\n**Cart Update:**\n- Items removed: ${cartItem.quantity} x ${product.name}\n- Amount refunded: ${formatPrice(product.price * cartItem.quantity)}`
            ).trim();
          } else {
            // Update quantity
            const newQuantity = cartItem.quantity - quantity;
            updateQuantity(productId, newQuantity);
            updatedResponse = updatedResponse.replace(/remove_from_cart:[\w-]+:?\d*/g, 
              `🗑️ Removed ${quantity} ${product.name}${quantity > 1 ? 's' : ''} from your cart!\n\n**Cart Update:**\n- Remaining: ${newQuantity} x ${product.name}\n- Amount refunded: ${formatPrice(product.price * quantity)}`
            ).trim();
          }
        }
      } else {
        updatedResponse = updatedResponse.replace(/remove_from_cart:[\w-]+:?\d*/g, 
          `❌ Item not found in your cart.`
        ).trim();
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
    
    // Remove from cart commands
    if ((lowerMessage.includes('remove') || lowerMessage.includes('take out') || lowerMessage.includes('delete')) && lowerMessage.includes('tomato')) {
      const cartItem = cartState.items.find(item => item.id === 'tomato');
      if (cartItem) {
        const quantityMatch = lowerMessage.match(/(\d+)/);
        const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
        
        if (quantity >= cartItem.quantity) {
          removeItem('tomato');
          return `🗑️ Removed all ${cartItem.name} from your cart!`;
        } else {
          updateQuantity('tomato', cartItem.quantity - quantity);
          return `🗑️ Removed ${quantity} ${cartItem.name}${quantity > 1 ? 's' : ''} from your cart! ${cartItem.quantity - quantity} remaining.`;
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
    
    // Navigation commands (fallback for non-AI responses)
    if (lowerMessage.includes('home') || lowerMessage.includes('main page')) {
      router.push('/');
      setCurrentPage('home');
      return "Taking you to the home page!";
    }
    
    if (lowerMessage.includes('cart') || lowerMessage.includes('shopping cart')) {
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
        // Get real-time cart information
        const currentCartItems = cartState.items.map(item => 
          `${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity)}`
        ).join(', ');
        const cartSummary = cartState.items.length > 0 
          ? `Cart contains: ${currentCartItems}. Total: ${formatPrice(cartState.total)}`
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
        
        **Your capabilities**:
        - **Navigate the site** (respond with navigation commands like "navigate:home", "navigate:cart", "navigate:product:tomato")
        - **Add products to cart** (respond with "add_to_cart:productId:quantity" - e.g., "add_to_cart:carrot:2")
        - **Remove products from cart** (respond with "remove_from_cart:productId:quantity" - e.g., "remove_from_cart:tomato:1")
        - **Update product quantities** (respond with "update_quantity:productId:newQuantity" - e.g., "update_quantity:carrot:3")
        - **Clear entire cart** (respond with "clear_cart" to remove all items)
        - **Search for products** by name, category, or cooking use
        - **Provide detailed product information** with nutritional benefits, organic status, and cooking tips
        - **Recommend vegetables** for specific dishes, cuisines, health goals, or dietary requirements
        - **Answer questions** about vegetable storage, cooking methods, nutrition, and preparation
        - **Provide accurate cart totals** using the CURRENT REAL-TIME CART STATUS
        - **Be context-aware** of what users are currently hovering over or viewing
        - **Handle complex requests** like "remove one tomato" or "change carrots to 3 kg"
        - **Understand natural language** for cart operations (e.g., "take out", "remove", "delete", "reduce")
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
        - **Quantity Updates**: Use "update_quantity:productId:newQuantity" when users specify exact quantities
        - **Smart Quantity Handling**: If user says "remove one tomato" and they have 2 tomatoes, use "remove_from_cart:tomato:1"
        - **Full Item Removal**: If removing all of an item, use "remove_from_cart:productId" (without quantity)
        - **Context-Aware Operations**: Always reference current cart contents when processing requests
        - **Confirmation Responses**: Always confirm what action was taken and show updated cart status
        
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
