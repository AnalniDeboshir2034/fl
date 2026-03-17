import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Order } from '@/types';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const orders = readData<Order>('orders.json');
  
  if (userId) {
    const userOrders = orders.filter(o => o.userId === userId);
    return NextResponse.json(userOrders);
  }
  
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const orders = readData<Order>('orders.json');

  const newOrder: Order = {
    ...body,
    id: `o${orders.length + 1}`,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  orders.push(newOrder);
  writeData('orders.json', orders);
  return NextResponse.json(newOrder, { status: 201 });
}
