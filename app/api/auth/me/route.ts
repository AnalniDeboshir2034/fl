import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(null);
    }

    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'users.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const users = JSON.parse(data);
    
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
