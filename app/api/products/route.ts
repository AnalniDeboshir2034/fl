import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Product } from '@/types';

export async function GET() {
  const products = readData<Product>('products.json');
  return NextResponse.json(products);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const products = readData<Product>('products.json');
  const newProduct: Product = {
    ...body,
    id: `p${products.length + 1}`,
  };
  products.push(newProduct);
  writeData('products.json', products);
  return NextResponse.json(newProduct, { status: 201 });
}
