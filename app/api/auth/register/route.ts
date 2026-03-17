import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { User } from '@/types';

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

    const users = readData<User & { password?: string }>('users.json');

    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      );
    }

    const newUser: User & { password: string } = {
      id: `u${Date.now()}`,
      email,
      name,
      phone: phone || '',
      password,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    writeData('users.json', users);

    const { password: _, ...userWithoutPassword } = newUser;

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
