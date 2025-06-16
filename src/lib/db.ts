import Dexie, { Table } from 'dexie';
import { CartItem } from '@/contexts/CartContext';

export interface PersistedChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string; // ISO string
}

class FreshVegDB extends Dexie {
  cartItems!: Table<CartItem, string>; // primary key id
  chatMessages!: Table<PersistedChatMessage, string>;

  constructor() {
    super('freshveg-db');
    this.version(1).stores({
      cartItems: 'id',
      chatMessages: 'id'
    });
  }
}

export const db = new FreshVegDB(); 