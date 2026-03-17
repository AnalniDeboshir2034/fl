import { kv } from '@vercel/kv';

const isVercel = process.env.VERCEL === '1';

// Универсальные функции для работы с данными
export const storage = {
  // Пользователи
  async getUsers(): Promise<any[]> {
    if (isVercel) {
      const users = await kv.get<any[]>('users');
      return users || [];
    }
    // Для локальной разработки - читаем из файла
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveUsers(users: any[]): Promise<void> {
    if (isVercel) {
      await kv.set('users', users);
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
      fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
    }
  },

  // Товары
  async getProducts(): Promise<any[]> {
    if (isVercel) {
      const products = await kv.get<any[]>('products');
      return products || [];
    }
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'products.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveProducts(products: any[]): Promise<void> {
    if (isVercel) {
      await kv.set('products', products);
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'products.json');
      fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    }
  },

  // Корзины
  async getBaskets(): Promise<any[]> {
    if (isVercel) {
      const baskets = await kv.get<any[]>('baskets');
      return baskets || [];
    }
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveBaskets(baskets: any[]): Promise<void> {
    if (isVercel) {
      await kv.set('baskets', baskets);
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
      fs.writeFileSync(filePath, JSON.stringify(baskets, null, 2));
    }
  },

  // Заказы
  async getOrders(): Promise<any[]> {
    if (isVercel) {
      const orders = await kv.get<any[]>('orders');
      return orders || [];
    }
    try {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'orders.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async saveOrders(orders: any[]): Promise<void> {
    if (isVercel) {
      await kv.set('orders', orders);
    } else {
      const fs = await import('fs');
      const path = await import('path');
      const filePath = path.join(process.cwd(), 'backend', 'data', 'orders.json');
      fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
    }
  },
};
