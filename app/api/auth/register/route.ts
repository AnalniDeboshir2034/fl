import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, phone } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, пароль и имя обязательны' },
        { status: 400 }
      );
    }

    const users = await db.getUsers();

    const existingUser = users.find((u: any) => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const newUser = {
      id: `u${Date.now()}`,
      email,
      name,
      phone: phone || '',
      password,
      createdAt: new Date().toISOString(),
    };

    await db.saveUsers([...users, newUser]);

    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    };

    const response = NextResponse.json(userWithoutPassword, { status: 201 });
    response.cookies.set('userId', newUser.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
