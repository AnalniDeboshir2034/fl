'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product } from '@/types';

export default function Catalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<{ productId: string; quantity: number }[]>([]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });

    const savedBasket = localStorage.getItem('basket');
    if (savedBasket) {
      setBasket(JSON.parse(savedBasket));
    }
  }, []);

  const addToBasket = (productId: string) => {
    const newBasket = [...basket];
    const existing = newBasket.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      newBasket.push({ productId, quantity: 1 });
    }
    setBasket(newBasket);
    localStorage.setItem('basket', JSON.stringify(newBasket));
  };

  if (loading) {
    return (
      <div className="container">
        <Header />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Header />
      <main style={{ padding: '40px 0' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Каталог товаров</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
          {products.map(product => (
            <div
              key={product.id}
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '20px',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  height: '200px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  marginBottom: '16px',
                }}
              ></div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>{product.title}</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '12px', minHeight: '40px' }}>
                {product.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {product.price.toLocaleString('ru-RU')} ₽
                </p>
                <button
                  className="primary"
                  onClick={() => addToBasket(product.id)}
                  disabled={!product.available}
                >
                  {product.available ? 'В корзину' : 'Нет в наличии'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Header() {
  return (
    <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
          L-Shop
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/catalog" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Каталог</Link>
          <Link href="/basket" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Корзина</Link>
        </div>
      </nav>
    </header>
  );
}
