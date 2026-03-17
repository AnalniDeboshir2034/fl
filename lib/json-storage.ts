import { put, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_PREFIX = 'lshop-';
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');

// Проверяем, есть ли токен для Vercel Blob
const hasBlobToken = () => !!process.env.BLOB_READ_WRITE_TOKEN;

// Получение данных из JSON файла
export async function readJsonFile(filename: string): Promise<any[]> {
  // Пробуем Vercel Blob если есть токен
  if (hasBlobToken()) {
    const blobKey = `${BLOB_PREFIX}${filename}`;

    try {
      const blobMetadata = await head(blobKey);
      if (blobMetadata && blobMetadata.downloadUrl) {
        const response = await fetch(blobMetadata.downloadUrl);
        const text = await response.text();
        return JSON.parse(text);
      }
    } catch (error: any) {
      if (error.statusCode === 404) {
        // Файл не найден в Blob, пробуем локально
        console.log(`File ${filename} not found in blob, trying local fallback`);
      } else {
        console.error(`Error reading ${filename} from blob:`, error);
      }
    }
  }

  // Локально читаем из файловой системы (fallback)
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

// Запись данных в JSON файл
export async function writeJsonFile(filename: string, data: any[]): Promise<void> {
  // Пробуем Vercel Blob если есть токен
  if (hasBlobToken()) {
    const blobKey = `${BLOB_PREFIX}${filename}`;

    try {
      await put(blobKey, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
      return;
    } catch (error) {
      console.error(`Error writing ${filename} to blob, falling back to filesystem:`, error);
      // Fallback к файловой системе если blob не работает
    }
  }

  // Пишем в файловую систему (fallback)
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
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
