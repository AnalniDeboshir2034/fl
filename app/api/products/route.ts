import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'products.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    return NextResponse.json(JSON.parse(data));
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.join(process.cwd(), 'backend', 'data', 'products.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    const products = JSON.parse(data);
    
    const newProduct = {
      ...body,
      id: `p${Date.now()}`,
    };
    
    products.push(newProduct);
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
    
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Ошибка при создании товара' },
      { status: 500 }
    );
  }
}
