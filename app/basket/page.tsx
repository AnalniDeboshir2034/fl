'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, BasketItem as BasketItemType } from '@/types';
import { useAuth } from '@/lib/auth-context';

interface BasketItem {
  productId: string;
  quantity: number;
}

export default function Basket() {
  const { user, loading: authLoading } = useAuth();
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading) {
      loadBasket();
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      });
  }, []);

  const loadBasket = async () => {
    setLoading(true);
    if (user) {
      try {
        const res = await fetch(`/api/baskets?userId=${user.id}`);
        const baskets = await res.json();
        const activeBasket = baskets.find((b: any) => b.status === 'active');
        if (activeBasket) {
          setBasket(activeBasket.items || []);
        } else {
          setBasket([]);
        }
      } catch {
        setBasket([]);
      }
    } else {
      const savedBasket = localStorage.getItem('basket');
      if (savedBasket) {
        setBasket(JSON.parse(savedBasket));
      } else {
        setBasket([]);
      }
    }
    setLoading(false);
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (user) {
      await fetch('/api/baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity,
          action: 'update',
        }),
      });
      loadBasket();
    } else {
      if (quantity <= 0) {
        const newBasket = basket.filter(item => item.productId !== productId);
        setBasket(newBasket);
        localStorage.setItem('basket', JSON.stringify(newBasket));
      } else {
        const newBasket = basket.map(item =>
          item.productId === productId ? { ...item, quantity } : item
        );
        setBasket(newBasket);
        localStorage.setItem('basket', JSON.stringify(newBasket));
      }
    }
  };

  const getTotal = () => {
    return basket.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const placeOrder = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        items: basket,
        total: getTotal(),
      }),
    });

    await fetch('/api/baskets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        status: 'completed',
      }),
    });

    setBasket([]);
    alert('Заказ оформлен!');
    router.push('/profile');
  };

  if (authLoading || loading) {
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
        <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Корзина</h1>
        {basket.length === 0 ? (
          <p style={{ color: 'var(--secondary)', textAlign: 'center', padding: '40px' }}>
            Корзина пуста. <Link href="/catalog">Перейти к покупкам</Link>
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px' }}>
            <div>
              {basket.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div
                    key={item.productId}
                    style={{
                      display: 'flex',
                      gap: '16px',
                      padding: '16px',
                      background: 'var(--card)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      marginBottom: '16px',
                    }}
                  >
                    <div
                      style={{
                        width: '100px',
                        height: '100px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: '8px',
                        flexShrink: 0,
                      }}
                    ></div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>{product.title}</h3>
                      <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '12px' }}>
                        {product.price.toLocaleString('ru-RU')} ₽
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                      </div>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {(product.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                );
              })}
            </div>
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
                height: 'fit-content',
              }}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Итого</h2>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                <span style={{ color: 'var(--secondary)' }}>Товары</span>
                <span>{getTotal().toLocaleString('ru-RU')} ₽</span>
              </div>
              <div
                style={{
                  borderTop: '1px solid var(--border)',
                  paddingTop: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '24px',
                }}
              >
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Итого</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)' }}>
                  {getTotal().toLocaleString('ru-RU')} ₽
                </span>
              </div>
              <button className="primary" onClick={placeOrder} style={{ width: '100%', padding: '12px' }}>
                {!user ? 'Войдите для оформления' : 'Оформить заказ'}
              </button>
            </div>
          </div>
        )}
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
