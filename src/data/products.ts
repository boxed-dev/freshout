import { Product } from '@/contexts/CartContext';

export const products: Product[] = [
  {
    id: 'tomato',
    name: 'Organic Tomatoes',
    price: 329,
    image: 'https://images.unsplash.com/photo-1546470427-e75b6d11f8bf?w=400&h=300&fit=crop',
    description: 'Juicy, vine-ripened organic tomatoes perfect for salads, cooking, and sauces. Grown locally with certified organic practices.',
    category: 'Fruits',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'carrot',
    name: 'Organic Carrots',
    price: 249,
    image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=400&h=300&fit=crop',
    description: 'Sweet, crunchy organic carrots. High in beta-carotene and perfect for snacking or cooking.',
    category: 'Root Vegetables',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'lettuce',
    name: 'Organic Crisp Lettuce',
    price: 199,
    image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop',
    description: 'Fresh, crispy organic lettuce heads perfect for salads and sandwiches. Harvested daily for maximum freshness.',
    category: 'Leafy Greens',
    unit: 'per head',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'broccoli',
    name: 'Organic Broccoli',
    price: 429,
    image: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=400&h=300&fit=crop',
    description: 'Nutrient-rich organic broccoli crowns. Packed with vitamins and minerals, perfect steamed or in stir-fries.',
    category: 'Cruciferous',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'bell-pepper',
    name: 'Organic Bell Peppers',
    price: 599,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop',
    description: 'Colorful mix of red, yellow, and green organic bell peppers. Sweet, crunchy, and perfect for any dish.',
    category: 'Peppers',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'spinach',
    name: 'Organic Baby Spinach',
    price: 349,
    image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop',
    description: 'Tender organic baby spinach leaves. Perfect for salads, smoothies, or sautéing. Rich in iron and vitamins.',
    category: 'Leafy Greens',
    unit: 'per 500g pack',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'cucumber',
    name: 'Organic English Cucumbers',
    price: 299,
    image: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop',
    description: 'Crisp, seedless organic English cucumbers. Perfect for salads, snacking, or making refreshing water.',
    category: 'Gourds',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'onion',
    name: 'Organic Yellow Onions',
    price: 179,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
    description: 'Sweet organic yellow onions. Essential for cooking, these add flavor to any dish. Long-lasting storage.',
    category: 'Alliums',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Farm Fresh', 'Same Day Delivery Available', 'Pesticide Free']
  },
  {
    id: 'zucchini',
    name: 'Organic Zucchini',
    price: 279,
    image: 'https://images.unsplash.com/photo-1592928304565-8e3e55b1a952?w=400&h=300&fit=crop',
    description: 'Tender organic zucchini perfect for grilling, roasting or zoodles.',
    category: 'Gourds',
    unit: 'per kg',
    isOrganic: true,
    features: ['100% Organic', 'Low Calorie', 'Farm Fresh', 'Pesticide Free']
  },
  {
    id: 'potato',
    name: 'Golden Potatoes',
    price: 159,
    image: 'https://images.unsplash.com/photo-1568600891621-2d6cb4a32c5d?w=400&h=300&fit=crop',
    description: 'Fluffy, versatile golden potatoes ideal for mashing, baking and fries.',
    category: 'Root Vegetables',
    unit: 'per kg',
    isOrganic: false,
    features: ['Farm Fresh', 'Long Storage', 'Versatile']
  },
  {
    id: 'eggplant',
    name: 'Globe Eggplants',
    price: 349,
    image: 'https://images.unsplash.com/photo-1566740933430-6ad2638399d9?w=400&h=300&fit=crop',
    description: 'Glossy purple eggplants, great for grilling and curries.',
    category: 'Nightshades',
    unit: 'per kg',
    isOrganic: true,
    features: ['Rich Flavor', 'Low Calorie', 'Pesticide Free']
  },
  {
    id: 'cabbage',
    name: 'Green Cabbage',
    price: 189,
    image: 'https://images.unsplash.com/photo-1577209984472-28f1b9230e2b?w=400&h=300&fit=crop',
    description: 'Crunchy green cabbage perfect for salads, slaws and stir-fries.',
    category: 'Leafy Greens',
    unit: 'per head',
    isOrganic: true,
    features: ['High Fiber', 'Farm Fresh', 'Pesticide Free']
  },
  {
    id: 'cauliflower',
    name: 'Cauliflower',
    price: 399,
    image: 'https://images.unsplash.com/photo-1561047029-3000e62f6c5b?w=400&h=300&fit=crop',
    description: 'Snow-white cauliflower heads, perfect for roasting or rice substitute.',
    category: 'Cruciferous',
    unit: 'per head',
    isOrganic: true,
    features: ['Keto Friendly', 'Vitamin C Rich', 'Pesticide Free']
  },
  {
    id: 'ginger',
    name: 'Fresh Ginger Root',
    price: 499,
    image: 'https://images.unsplash.com/photo-1615486368753-d7c15b60ca2e?w=400&h=300&fit=crop',
    description: 'Fragrant ginger root for teas, curries and marinades.',
    category: 'Roots & Rhizomes',
    unit: 'per kg',
    isOrganic: true,
    features: ['Anti-Inflammatory', 'Aromatic', 'Pesticide Free']
  },
  {
    id: 'garlic',
    name: 'Garlic Bulbs',
    price: 299,
    image: 'https://images.unsplash.com/photo-1518976024611-4881d19c9a3d?w=400&h=300&fit=crop',
    description: 'Pungent garlic bulbs to elevate any savoury dish.',
    category: 'Alliums',
    unit: 'per kg',
    isOrganic: true,
    features: ['Antioxidant', 'Farm Fresh', 'Pesticide Free']
  },
  {
    id: 'corn',
    name: 'Sweet Corn',
    price: 249,
    image: 'https://images.unsplash.com/photo-1591888866669-2ca26d1c3cef?w=400&h=300&fit=crop',
    description: 'Sweet, juicy corn cobs great for boiling or grilling.',
    category: 'Grains',
    unit: 'per 4 cobs',
    isOrganic: true,
    features: ['Sweet Flavor', 'Non-GMO', 'Pesticide Free']
  },
  {
    id: 'mushroom',
    name: 'Button Mushrooms',
    price: 389,
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&h=300&fit=crop',
    description: 'Fresh white button mushrooms, perfect for sautés and pizzas.',
    category: 'Fungi',
    unit: 'per 500g pack',
    isOrganic: true,
    features: ['Umami Rich', 'Low Calorie', 'Pesticide Free']
  },
  {
    id: 'sweet-potato',
    name: 'Sweet Potatoes',
    price: 279,
    image: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?w=400&h=300&fit=crop',
    description: 'Naturally sweet potatoes loaded with beta-carotene.',
    category: 'Root Vegetables',
    unit: 'per kg',
    isOrganic: true,
    features: ['High Fiber', 'Antioxidant', 'Pesticide Free']
  }
];

export const getProductById = (id: string): Product | undefined => {
  return products.find(product => product.id === id);
};

export const getProductsByCategory = (category: string): Product[] => {
  return products.filter(product => product.category === category);
};

export const getAllProducts = (): Product[] => {
  return products;
};
