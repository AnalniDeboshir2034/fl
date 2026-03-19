import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(null, { status: 200 });
    }

    const users = await db.getUsers();
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      // Пользователь не найден, очищаем cookie
      const response = NextResponse.json(null);
      response.cookies.delete('userId');
      return response;
    }

    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
    };

    // Продлеваем cookie при каждом запросе
    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set('userId', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 дней
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(null, { status: 200 });
  }
}
