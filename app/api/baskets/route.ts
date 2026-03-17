import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function GET(request: NextRequest) {
  try {
    const baskets = await db.getBaskets();
    const userId = request.nextUrl.searchParams.get('userId');
    
    if (userId) {
      const userBaskets = baskets.filter((b: any) => b.userId === userId);
      return NextResponse.json(userBaskets);
    }
    
    return NextResponse.json(baskets);
  } catch (error) {
    console.error('Error getting baskets:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, action, productId, quantity, size } = body;
    
    let baskets = await db.getBaskets();

    if (action === 'add') {
      let basket = baskets.find((b: any) => b.userId === userId && b.status === 'active');
      
      if (!basket) {
        basket = { userId, items: [], status: 'active' };
        baskets.push(basket);
      }

      const existingItem = basket.items.find((item: any) => item.productId === productId && item.size === size);
      if (existingItem) {
        existingItem.quantity += quantity || 1;
      } else {
        basket.items.push({ productId, quantity: quantity || 1, size });
      }
    } else if (action === 'update') {
      const basket = baskets.find((b: any) => b.userId === userId && b.status === 'active');
      if (basket) {
        const existingItem = basket.items.find((item: any) => item.productId === productId);
        if (existingItem) {
          if (quantity <= 0) {
            basket.items = basket.items.filter((item: any) => item.productId !== productId);
          } else {
            existingItem.quantity = quantity;
          }
        }
      }
    } else if (action === 'clear') {
      const basket = baskets.find((b: any) => b.userId === userId && b.status === 'active');
      if (basket) {
        basket.items = [];
      }
    } else {
      const existingIndex = baskets.findIndex((b: any) => b.userId === userId && b.status === 'active');
      if (existingIndex >= 0) {
        baskets[existingIndex] = { ...baskets[existingIndex], items };
      } else {
        baskets.push({ userId, items, status: 'active' });
      }
    }

    await db.saveBaskets(baskets);
    return NextResponse.json(baskets[baskets.length - 1]);
  } catch (error) {
    console.error('Error updating basket:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении корзины' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, status } = body;
    
    let baskets = await db.getBaskets();

    const basket = baskets.find((b: any) => b.userId === userId && b.status === 'active');
    if (basket && status) {
      basket.status = status;
      await db.saveBaskets(baskets);
    }

    return NextResponse.json(basket || { userId, items: [] });
  } catch (error) {
    console.error('Error updating basket status:', error);
    return NextResponse.json(
      { error: 'Ошибка при обновлении статуса' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    
    let baskets = await db.getBaskets();

    if (userId) {
      baskets = baskets.filter((b: any) => b.userId !== userId || b.status !== 'active');
      await db.saveBaskets(baskets);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting basket:', error);
    return NextResponse.json(
      { error: 'Ошибка при удалении корзины' },
      { status: 500 }
    );
  }
}
