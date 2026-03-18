import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

const BLOB_NAME = 'fl-ynid-blob';

// Начальные данные
const initialProducts = [
  {
    id: "p1",
    title: "MaFinBuSi Runner X",
    description: "Легкие беговые кроссовки для тренировок и города",
    category: "sneakers",
    brand: "MaFinBuSi",
    price: 7990,
    available: true,
    imageUrl: "/api/assets/images/runner-x.jpg"
  },
  {
    id: "p2",
    title: "MaFinBuSi Urban Hoodie",
    description: "Теплое худи для спорта и повседневной носки",
    category: "clothes",
    brand: "MaFinBuSi",
    price: 4990,
    available: true,
    imageUrl: "/api/assets/images/urban-hoodie.jpg"
  },
  {
    id: "p3",
    title: "Трусы Calin Kelai",
    description: "UwU",
    category: "etc",
    brand: "Calvin Klein",
    price: 232,
    available: true,
    imageUrl: "",
    sizes: ["36", "37", "38", "39", "40", "41", "42", "43", "44", "45"]
  }
];

const initialUsers: any[] = [];
const initialBaskets: any[] = [];
const initialOrders: any[] = [];

export async function POST() {
  try {
    // Инициализируем данные в Vercel Blob
    await put(`${BLOB_NAME}/products`, JSON.stringify(initialProducts), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    await put(`${BLOB_NAME}/users`, JSON.stringify(initialUsers), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    await put(`${BLOB_NAME}/baskets`, JSON.stringify(initialBaskets), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    await put(`${BLOB_NAME}/orders`, JSON.stringify(initialOrders), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });

    return NextResponse.json({
      success: true,
      message: 'Данные успешно инициализированы',
      products: initialProducts.length
    });
  } catch (error) {
    console.error('Init error:', error);
    return NextResponse.json(
      { error: 'Ошибка инициализации данных', details: String(error) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Отправь POST запрос для инициализации данных',
    endpoint: '/api/init'
  });
}
