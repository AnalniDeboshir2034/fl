'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, BasketItem as BasketItemType } from '@/types';
import { useAuth } from '@/lib/auth-context';

interface BasketItem {
  productId: string;
  quantity: number;
  size?: string;
}

export default function Basket() {
  const { user, loading: authLoading } = useAuth();
  const [basket, setBasket] = useState<BasketItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const router = useRouter();

  const [checkoutForm, setCheckoutForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    address: '',
    zipCode: '',
    comment: '',
  });

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

  const removeItem = async (productId: string, size?: string) => {
    if (user) {
      await fetch('/api/baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity: 0,
          action: 'update',
        }),
      });
      loadBasket();
    } else {
      const newBasket = basket.filter(item => !(item.productId === productId && item.size === size));
      setBasket(newBasket);
      localStorage.setItem('basket', JSON.stringify(newBasket));
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

    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.city || !checkoutForm.address) {
      alert('Пожалуйста, заполните обязательные поля (Имя, Телефон, Город, Адрес)');
      return;
    }

    const orderData = {
      userId: user.id,
      items: basket,
      total: getTotal(),
      shippingInfo: {
        name: checkoutForm.name,
        phone: checkoutForm.phone,
        city: checkoutForm.city,
        address: checkoutForm.address,
        zipCode: checkoutForm.zipCode,
      },
    };

    await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData),
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
    alert('Заказ оформлен! Менеджер свяжется с вами в ближайшее время.');
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
            <div>
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Товары</h2>
              {basket.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) return null;
                return (
                  <div
                    key={item.productId + (item.size || '')}
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
                      <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '8px' }}>
                        {product.price.toLocaleString('ru-RU')} ₽
                        {item.size && <span style={{ marginLeft: '12px' }}>Размер: {item.size}</span>}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          style={{ width: '32px', height: '32px' }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: '24px', textAlign: 'center' }}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          style={{ width: '32px', height: '32px' }}
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeItem(item.productId, item.size)}
                          style={{
                            marginLeft: 'auto',
                            background: 'none',
                            border: 'none',
                            color: '#ef4444',
                            cursor: 'pointer',
                            fontSize: '14px',
                          }}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: '18px', fontWeight: 'bold' }}>
                      {(product.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                );
              })}
            </div>
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
                <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Итого</h2>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--secondary)' }}>Товары ({basket.length} шт.)</span>
                  <span>{getTotal().toLocaleString('ru-RU')} ₽</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ color: 'var(--secondary)' }}>Доставка</span>
                  <span>Бесплатно</span>
                </div>
                <div
                  style={{
                    borderTop: '1px solid var(--border)',
                    paddingTop: '16px',
                    marginTop: '16px',
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
                <button
                  className="primary"
                  onClick={() => setShowCheckout(!showCheckout)}
                  style={{ width: '100%', padding: '12px', marginBottom: '8px' }}
                >
                  {showCheckout ? 'Назад к корзине' : 'Оформить заказ'}
                </button>
                {!user && (
                  <Link href="/login" style={{ display: 'block', textAlign: 'center' }}>
                    <button style={{ width: '100%', padding: '12px', marginTop: '8px' }}>
                      Войти для оформления
                    </button>
                  </Link>
                )}
              </div>

              {showCheckout && user && (
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '24px',
                    border: '1px solid var(--border)',
                  }}
                >
                  <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Данные доставки</h2>
                  <form style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Имя *
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Телефон *
                      </label>
                      <input
                        type="tel"
                        value={checkoutForm.phone}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                        required
                        placeholder="+7 (999) 000-00-00"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Город *
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                        required
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Адрес доставки *
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        required
                        placeholder="Улица, дом, квартира"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Индекс
                      </label>
                      <input
                        type="text"
                        value={checkoutForm.zipCode}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, zipCode: e.target.value })}
                        placeholder="123456"
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 500 }}>
                        Комментарий к заказу
                      </label>
                      <textarea
                        value={checkoutForm.comment}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, comment: e.target.value })}
                        rows={3}
                        placeholder="Пожелания к доставке..."
                        style={{
                          width: '100%',
                          padding: '10px',
                          border: '1px solid var(--border)',
                          borderRadius: '6px',
                          fontSize: '14px',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      className="primary"
                      onClick={placeOrder}
                      style={{ padding: '14px', fontSize: '16px', fontWeight: 600, marginTop: '8px' }}
                    >
                      Подтвердить заказ
                    </button>
                  </form>
                </div>
              )}
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
