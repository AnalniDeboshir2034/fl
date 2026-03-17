import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    // Читаем пользователей из файла
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);

    const user = users.find((u: any) => u.email === email && u.password === password);
    if (!user) {
      return NextResponse.json(
        { error: 'Неверный email или пароль' },
        { status: 401 }
      );
    }

    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set('userId', user.id, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка при входе' },
      { status: 500 }
    );
  }
}
