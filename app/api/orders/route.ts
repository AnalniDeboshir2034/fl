import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function GET(request: NextRequest) {
  try {
    const orders = await db.getOrders();
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (userId) {
      const userOrders = orders.filter((o: any) => o.userId === userId);
      return NextResponse.json(userOrders);
    }
    
    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error getting orders:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const orders = await db.getOrders();

    const newOrder = {
      ...body,
      id: `o${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    await db.saveOrders([...orders, newOrder]);
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании заказа' },
      { status: 500 }
    );
  }
}
