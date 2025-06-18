import { Product } from '@/contexts/CartContext';

export const products: Product[] = [
  {
    id: 'tomato',
    name: 'Organic Tomatoes',
    price: 329,
    image: '/tomato.jpeg',
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
    image: '/carrot.jpeg',
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
    image: '/lettuce.jpeg',
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
    image: '/broccoli.jpeg',
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
    image: '/bellPepper.jpeg',
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
    image: '/spinach.jpeg',
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
    image: '/cucumber.jpeg',
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
    image: '/onion.jpeg',
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
    image: '/zucchini.jpeg',
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
    image: '/potato.jpeg',
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
    image: '/globeEggplant.jpeg',
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
    image: '/greeCabbage.jpeg',
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
    image: '/cauliflower.jpeg',
    description: 'Snow-white cauliflower heads, perfect for roasting or rice substitute.',
    category: 'Cruciferous',
    unit: 'per head',
    isOrganic: true,
    features: ['Keto Friendly', 'Vitamin C Rich', 'Pesticide Free']
  },
  {
    id: 'corn',
    name: 'Sweet Corn',
    price: 249,
    image: '/sweetCorn.jpeg',
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
    image: '/buttonMushroom.jpeg',
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
    image: '/sweetPotato.jpeg',
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