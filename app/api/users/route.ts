import { NextRequest, NextResponse } from 'next/server';

const STORAGE_KEY = 'lshop_users';
const DATA_DIR = process.env.STORAGE_PATH || './backend/data';

// Для Vercel используем in-memory хранилище
const usersCache: any[] = [];

export async function GET() {
  // В production (Vercel) возвращаем из кэша
  if (process.env.VERCEL) {
    return NextResponse.json(usersCache);
  }
  
  // В development читаем из файла
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action, user } = body;

  if (action === 'add') {
    if (process.env.VERCEL) {
      usersCache.push(user);
    } else {
      try {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const users = JSON.parse(data);
        users.push(user);
        fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
      } catch (error) {
        console.error('Error saving user:', error);
      }
    }
  }

  return NextResponse.json({ success: true });
}
