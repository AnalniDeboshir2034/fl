export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  available: boolean;
  imageUrl: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface BasketItem {
  productId: string;
  quantity: number;
}

export interface Basket {
  userId: string;
  items: BasketItem[];
}

export interface Order {
  id: string;
  userId: string;
  items: BasketItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
}
