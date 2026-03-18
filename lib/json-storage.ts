import { put, head } from '@vercel/blob';

const BLOB_NAME = 'fl-ynid-blob';

// Ключи для разных типов данных в blob
const BLOB_KEYS = {
  users: `${BLOB_NAME}/users`,
  products: `${BLOB_NAME}/products`,
  baskets: `${BLOB_NAME}/baskets`,
  orders: `${BLOB_NAME}/orders`,
};

// Получение данных из blob
async function readBlob<T>(key: string): Promise<T[]> {
  try {
    const { downloadUrl } = await head(key);
    const response = await fetch(downloadUrl);
    if (!response.ok) {
      return [];
    }
    const text = await response.text();
    if (!text) {
      return [];
    }
    return JSON.parse(text);
  } catch (error: any) {
    if (error.code === 'BLOB_NOT_FOUND') {
      return [];
    }
    console.error(`Error reading ${key} from blob:`, error);
    return [];
  }
}

// Запись данных в blob
async function writeBlob<T>(key: string, data: T[]): Promise<void> {
  await put(key, JSON.stringify(data), {
    access: 'public',
    contentType: 'application/json',
    addRandomSuffix: false,
  });
}

// Вспомогательные функции для конкретных сущностей
export const db = {
  async getUsers() {
    return readBlob<any>(BLOB_KEYS.users);
  },
  async saveUsers(users: any[]) {
    return writeBlob(BLOB_KEYS.users, users);
  },

  async getProducts() {
    return readBlob<any>(BLOB_KEYS.products);
  },
  async saveProducts(products: any[]) {
    return writeBlob(BLOB_KEYS.products, products);
  },

  async getBaskets() {
    return readBlob<any>(BLOB_KEYS.baskets);
  },
  async saveBaskets(baskets: any[]) {
    return writeBlob(BLOB_KEYS.baskets, baskets);
  },

  async getOrders() {
    return readBlob<any>(BLOB_KEYS.orders);
  },
  async saveOrders(orders: any[]) {
    return writeBlob(BLOB_KEYS.orders, orders);
  },
};
