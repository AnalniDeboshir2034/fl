import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { User } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password и name обязательны' },
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
      id: `u${users.length + 1}`,
      email,
      name,
      password,
    };

    users.push(newUser);
    writeData('users.json', users);

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Ошибка при регистрации' },
      { status: 500 }
    );
  }
}
