'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Order } from '@/types';

export default function Profile() {
  const { user, loading: authLoading, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      // Load orders (completed baskets)
      fetch(`/api/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  if (authLoading || (loading && user)) {
    return (
      <div className="container">
        <Header user={user} onLogout={handleLogout} />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <Header user={user} onLogout={handleLogout} />
      <main style={{ padding: '40px 0' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Профиль</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          <div>
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
                marginBottom: '24px',
              }}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Информация о пользователе</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <span style={{ color: 'var(--secondary)', fontSize: '14px' }}>Имя</span>
                  <p style={{ fontSize: '16px', margin: 0 }}>{user.name}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)', fontSize: '14px' }}>Email</span>
                  <p style={{ fontSize: '16px', margin: 0 }}>{user.email}</p>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)', fontSize: '14px' }}>ID пользователя</span>
                  <p style={{ fontSize: '16px', margin: 0 }}>{user.id}</p>
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>История заказов</h2>
              {orders.length === 0 ? (
                <p style={{ color: 'var(--secondary)', textAlign: 'center', padding: '20px' }}>
                  У вас пока нет заказов. <Link href="/catalog">Перейти к покупкам</Link>
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {orders.map(order => (
                    <div
                      key={order.id}
                      style={{
                        padding: '16px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <span style={{ fontWeight: 600 }}>Заказ #{order.id}</span>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          background: getOrderStatusColor(order.status),
                          color: 'white',
                        }}>
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)', fontSize: '14px' }}>
                        <span>{new Date(order.createdAt).toLocaleDateString('ru-RU')}</span>
                        <span>{(order.total || 0).toLocaleString('ru-RU')} ₽</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Текущая корзина</h2>
              <Basket userId={user.id} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ user, onLogout }: { user: { name: string } | null, onLogout: () => void }) {
  return (
    <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
          L-Shop
        </Link>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <Link href="/catalog" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Каталог</Link>
          <Link href="/basket" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Корзина</Link>
          {user && (
            <>
              <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
                Профиль
              </Link>
              <button onClick={onLogout} style={{ background: 'none', border: 'none', color: 'var(--secondary)', cursor: 'pointer' }}>
                Выйти
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Basket({ userId }: { userId: string }) {
  const [items, setItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/baskets?userId=${userId}`)
      .then(res => res.json())
      .then(baskets => {
        const currentBasket = baskets.find((b: any) => b.status === 'active');
        if (currentBasket) {
          setItems(currentBasket.items || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
      });
  }, [userId]);

  const getTotal = () => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (items.length === 0) {
    return <p style={{ color: 'var(--secondary)', textAlign: 'center' }}>Корзина пуста</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {items.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return null;
        return (
          <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ margin: 0, fontSize: '14px' }}>{product.title}</p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--secondary)' }}>x{item.quantity}</p>
            </div>
            <span style={{ fontWeight: 600 }}>{(product.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
          </div>
        );
      })}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: '12px', marginTop: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}>
          <span>Итого</span>
          <span>{getTotal().toLocaleString('ru-RU')} ₽</span>
        </div>
      </div>
      <Link href="/basket">
        <button className="primary" style={{ width: '100%', padding: '12px', marginTop: '16px' }}>
          Перейти к оформлению
        </button>
      </Link>
    </div>
  );
}

function getOrderStatusLabel(status: Order['status']): string {
  const labels = {
    pending: 'Ожидает подтверждения',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  };
  return labels[status] || status;
}

function getOrderStatusColor(status: Order['status']): string {
  const colors = {
    pending: '#f59e0b',
    processing: '#3b82f6',
    shipped: '#8b5cf6',
    delivered: '#10b981',
    cancelled: '#ef4444',
  };
  return colors[status] || '#64748b';
}
