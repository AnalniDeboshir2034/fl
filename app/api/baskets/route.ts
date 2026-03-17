import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Basket, BasketItem } from '@/types';

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const baskets = readData<Basket & { status?: string }>('baskets.json');
  
  if (userId) {
    const userBaskets = baskets.filter(b => b.userId === userId);
    return NextResponse.json(userBaskets);
  }
  
  return NextResponse.json(baskets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, items, action } = body;
  const baskets = readData<Basket & { status?: string }>('baskets.json');

  if (action === 'add') {
    const { productId, quantity } = body;
    let basket = baskets.find(b => b.userId === userId && b.status === 'active');
    
    if (!basket) {
      basket = {
        userId,
        items: [],
        status: 'active',
      } as Basket & { status: string };
      baskets.push(basket);
    }

    const existingItem = basket.items.find(item => item.productId === productId);
    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      basket.items.push({ productId, quantity: quantity || 1 });
    }

    writeData('baskets.json', baskets);
    return NextResponse.json(basket);
  } else if (action === 'update') {
    const { productId, quantity } = body;
    let basket = baskets.find(b => b.userId === userId && b.status === 'active');
    
    if (basket) {
      const existingItem = basket.items.find(item => item.productId === productId);
      if (existingItem) {
        if (quantity <= 0) {
          basket.items = basket.items.filter(item => item.productId !== productId);
        } else {
          existingItem.quantity = quantity;
        }
      }
      writeData('baskets.json', baskets);
    }
    
    return NextResponse.json(basket || { userId, items: [] });
  } else if (action === 'clear') {
    const basket = baskets.find(b => b.userId === userId && b.status === 'active');
    if (basket) {
      basket.items = [];
      writeData('baskets.json', baskets);
    }
    return NextResponse.json(basket || { userId, items: [] });
  } else {
    const existingIndex = baskets.findIndex(b => b.userId === userId && b.status === 'active');
    if (existingIndex >= 0) {
      baskets[existingIndex] = { ...baskets[existingIndex], items };
    } else {
      baskets.push({ userId, items, status: 'active' });
    }

    writeData('baskets.json', baskets);
    return NextResponse.json(baskets[existingIndex >= 0 ? existingIndex : baskets.length - 1]);
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const { userId, status } = body;
  const baskets = readData<Basket & { status?: string }>('baskets.json');

  const basket = baskets.find(b => b.userId === userId && b.status === 'active');
  if (basket && status) {
    basket.status = status;
    writeData('baskets.json', baskets);
  }

  return NextResponse.json(basket || { userId, items: [] });
}

export async function DELETE(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId');
  const baskets = readData<Basket & { status?: string }>('baskets.json');

  if (userId) {
    const filteredBaskets = baskets.filter(b => b.userId !== userId || b.status !== 'active');
    writeData('baskets.json', filteredBaskets);
  }

  return NextResponse.json({ success: true });
}
