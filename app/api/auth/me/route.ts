import { NextRequest, NextResponse } from 'next/server';
import { readData } from '@/lib/data';
import { User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(null);
    }

    const users = readData<User & { password?: string }>('users.json');
    const user = users.find(u => u.id === userId);

    if (!user) {
      const response = NextResponse.json(null);
      response.cookies.delete('userId');
      return response;
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    return NextResponse.json(null);
  }
}
