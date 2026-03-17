import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/json-storage';

export async function GET() {
  try {
    const products = await db.getProducts();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const products = await db.getProducts();
    
    const newProduct = {
      ...body,
      id: `p${Date.now()}`,
    };
    
    await db.saveProducts([...products, newProduct]);
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}
