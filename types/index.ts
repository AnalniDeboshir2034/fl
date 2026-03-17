export interface Product {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  price: number;
  available: boolean;
  imageUrl: string;
  sizes?: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt?: string;
}

export interface BasketItem {
  productId: string;
  quantity: number;
  size?: string;
}

export interface Basket {
  userId: string;
  items: BasketItem[];
  status?: string;
}

export interface Order {
  id: string;
  userId: string;
  items: BasketItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  shippingInfo?: {
    city: string;
    address: string;
    zipCode: string;
    phone: string;
    name: string;
  };
}
