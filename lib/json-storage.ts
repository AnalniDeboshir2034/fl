import { put, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const BLOB_PREFIX = 'lshop-';
const DATA_DIR = path.join(process.cwd(), 'backend', 'data');

// Проверяем, запущено ли на Vercel
const isVercel = () => {
  return process.env.VERCEL === '1' || !!process.env.BLOB_READ_WRITE_TOKEN;
};

// Получение данных из JSON файла
export async function readJsonFile(filename: string): Promise<any[]> {
  // На Vercel используем Blob Storage
  if (isVercel()) {
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
        return [];
      }
      console.error(`Error reading ${filename} from blob:`, error);
      return [];
    }

    return [];
  }

  // Локально читаем из файловой системы
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
  // На Vercel используем Blob Storage
  if (isVercel()) {
    const blobKey = `${BLOB_PREFIX}${filename}`;

    try {
      await put(blobKey, JSON.stringify(data, null, 2), {
        access: 'public',
        contentType: 'application/json',
        addRandomSuffix: false,
      });
    } catch (error) {
      console.error(`Error writing ${filename} to blob:`, error);
      throw error;
    }
  } else {
    // Локально пишем в файловую систему
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
