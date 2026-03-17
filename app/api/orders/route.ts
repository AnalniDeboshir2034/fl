import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'orders.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const orders = JSON.parse(data);
    
    const userId = request.nextUrl.searchParams.get('userId');
    if (userId) {
      const userOrders = orders.filter((o: any) => o.userId === userId);
      return NextResponse.json(userOrders);
    }
    
    return NextResponse.json(orders);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'orders.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const orders = JSON.parse(data);

    const newOrder = {
      ...body,
      id: `o${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    orders.push(newOrder);
    fs.writeFileSync(filePath, JSON.stringify(orders, null, 2));
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}
