import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(null);
    }

    const users = await db.getUsers();
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      return NextResponse.json(null);
    }

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(null);
  }
}
