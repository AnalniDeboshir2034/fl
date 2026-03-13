import { NextRequest, NextResponse } from 'next/server';
import { readData, writeData } from '@/lib/data';
import { Basket } from '@/types';

export async function GET() {
  const baskets = readData<Basket>('baskets.json');
  return NextResponse.json(baskets);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const baskets = readData<Basket>('baskets.json');
  
  const existingIndex = baskets.findIndex(b => b.userId === body.userId);
  if (existingIndex >= 0) {
    baskets[existingIndex] = body;
  } else {
    baskets.push(body);
  }
  
  writeData('baskets.json', baskets);
  return NextResponse.json(body, { status: 201 });
}
