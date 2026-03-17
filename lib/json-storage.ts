import { put, head, del, list } from '@vercel/blob';

const BLOB_PREFIX = 'lshop-';

// Получение данных из JSON файла
export async function readJsonFile(filename: string): Promise<any[]> {
  const blobKey = `${BLOB_PREFIX}${filename}`;

  try {
    // Пытаемся получить метаданные файла из Vercel Blob
    const blobMetadata = await head(blobKey);
    if (blobMetadata && blobMetadata.downloadUrl) {
      // Скачиваем файл
      const response = await fetch(blobMetadata.downloadUrl);
      const text = await response.text();
      return JSON.parse(text);
    }
  } catch (error: any) {
    if (error.statusCode === 404) {
      // Файл не найден, возвращаем пустой массив
      return [];
    }
    console.error(`Error reading ${filename}:`, error);
  }

  return [];
}

// Запись данных в JSON файл
export async function writeJsonFile(filename: string, data: any[]): Promise<void> {
  const blobKey = `${BLOB_PREFIX}${filename}`;

  try {
    await put(blobKey, JSON.stringify(data, null, 2), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
  } catch (error) {
    console.error(`Error writing ${filename}:`, error);
    throw error;
  }
}

// Вспомогательные функции для конкретных файлов
export const db = {
  async getUsers() {
    return readJsonFile('users.json');
  },
  async saveUsers(users: any[]) {
    return writeJsonFile('users.json', users);
  },

  async getProducts() {
    return readJsonFile('products.json');
  },
  async saveProducts(products: any[]) {
    return writeJsonFile('products.json', products);
  },

  async getBaskets() {
    return readJsonFile('baskets.json');
  },
  async saveBaskets(baskets: any[]) {
    return writeJsonFile('baskets.json', baskets);
  },

  async getOrders() {
    return readJsonFile('orders.json');
  },
  async saveOrders(orders: any[]) {
    return writeJsonFile('orders.json', orders);
  },
};
