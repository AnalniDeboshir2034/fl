import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(null);
    }

    const users = await storage.getUsers();
    const user = users.find((u: any) => u.id === userId);

    if (!user) {
      const response = NextResponse.json(null);
      response.cookies.delete('userId');
      return response;
    }

    const { password: _, ...userWithoutPassword } = user;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(null);
  }
}
