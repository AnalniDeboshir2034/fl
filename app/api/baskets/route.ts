import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const baskets = JSON.parse(data);
    
    const userId = request.nextUrl.searchParams.get('userId');
    if (userId) {
      const userBaskets = baskets.filter((b: any) => b.userId === userId);
      return NextResponse.json(userBaskets);
    }
    
    return NextResponse.json(baskets);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, items, action, productId, quantity, size } = body;
    
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const baskets = JSON.parse(data);

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

    fs.writeFileSync(filePath, JSON.stringify(baskets, null, 2));
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
    
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const baskets = JSON.parse(data);

    const basket = baskets.find((b: any) => b.userId === userId && b.status === 'active');
    if (basket && status) {
      basket.status = status;
      fs.writeFileSync(filePath, JSON.stringify(baskets, null, 2));
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
    
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'baskets.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    let baskets = JSON.parse(data);

    if (userId) {
      baskets = baskets.filter((b: any) => b.userId !== userId || b.status !== 'active');
      fs.writeFileSync(filePath, JSON.stringify(baskets, null, 2));
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
