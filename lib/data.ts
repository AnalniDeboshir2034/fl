import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATA_DIR = join(process.cwd(), 'backend', 'data');

export function readData<T>(fileName: string): T[] {
  const filePath = join(DATA_DIR, fileName);
  try {
    const data = readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

export function writeData<T>(fileName: string, data: T[]): void {
  const filePath = join(DATA_DIR, fileName);
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export function getNextId(items: { id?: string | number }[]): string {
  if (items.length === 0) return '1';
  const maxId = Math.max(...items.map(item => parseInt(String(item.id || '0'), 10)));
  return (maxId + 1).toString();
}
