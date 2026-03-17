'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';

export default function ProductPage() {
  const params = useParams();
  const productId = params?.product as string;
  const { user } = useAuth();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [basket, setBasket] = useState<{ productId: string; quantity: number; size?: string }[]>([]);

  useEffect(() => {
    if (!productId) return;

    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        const foundProduct = data.find((p: Product) => p.id === productId);
        if (foundProduct) {
          setProduct(foundProduct);
          if (foundProduct.sizes && foundProduct.sizes.length > 0) {
            setSelectedSize(foundProduct.sizes[0]);
          }
        }
        setLoading(false);
      });

    loadBasket();
  }, [productId, user]);

  const loadBasket = async () => {
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
  };

  const addToBasket = async () => {
    if (!product) return;

    if (user) {
      await fetch('/api/baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId: product.id,
          quantity,
          size: selectedSize || undefined,
          action: 'add',
        }),
      });
      loadBasket();
    } else {
      const newBasket = [...basket];
      const existing = newBasket.find(item => item.productId === product.id && item.size === selectedSize);
      if (existing) {
        existing.quantity += quantity;
      } else {
        newBasket.push({ productId: product.id, quantity, size: selectedSize || undefined });
      }
      setBasket(newBasket);
      localStorage.setItem('basket', JSON.stringify(newBasket));
    }

    alert(`Товар добавлен в корзину!\n${product.title}${selectedSize ? `, размер: ${selectedSize}` : ''}\nКоличество: ${quantity}`);
  };

  const buyNow = async () => {
    await addToBasket();
    router.push('/basket');
  };

  if (loading) {
    return (
      <div className="container">
        <Header user={user} />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container">
        <Header user={user} />
        <p style={{ textAlign: 'center', padding: '40px' }}>Товар не найден</p>
      </div>
    );
  }

  const defaultSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  const sizes = product.sizes || defaultSizes;

  return (
    <div className="container">
      <Header user={user} />
      <main style={{ padding: '40px 0' }}>
        <Link href="/catalog" style={{ color: 'var(--primary)', marginBottom: '20px', display: 'inline-block' }}>
          ← Назад в каталог
        </Link>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginTop: '24px' }}>
          <div>
            <div
              style={{
                width: '100%',
                height: '500px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '12px',
                marginBottom: '16px',
              }}
            ></div>
          </div>

          <div>
            <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '8px' }}>
              {product.brand} / {product.category}
            </p>
            <h1 style={{ fontSize: '32px', marginBottom: '16px' }}>{product.title}</h1>
            <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '24px' }}>
              {product.price.toLocaleString('ru-RU')} ₽
            </p>

            <p style={{ color: 'var(--foreground)', lineHeight: 1.8, marginBottom: '32px' }}>
              {product.description}
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Выберите размер</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    style={{
                      width: '50px',
                      height: '50px',
                      border: selectedSize === size
                        ? '2px solid var(--primary)'
                        : '1px solid var(--border)',
                      borderRadius: '8px',
                      background: selectedSize === size ? 'var(--primary)' : 'transparent',
                      color: selectedSize === size ? 'white' : 'var(--foreground)',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: 'var(--secondary)', marginTop: '8px' }}>
                {selectedSize ? `Выбран размер: ${selectedSize}` : 'Выберите размер'}
              </p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 600 }}>Количество</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--card)',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  −
                </button>
                <span style={{ fontSize: '20px', fontWeight: 600, minWidth: '40px', textAlign: 'center' }}>
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  style={{
                    width: '40px',
                    height: '40px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    background: 'var(--card)',
                    fontSize: '18px',
                    cursor: 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                onClick={addToBasket}
                disabled={!product.available}
                className="primary"
                style={{ flex: 1, padding: '16px', fontSize: '16px', fontWeight: 600 }}
              >
                {product.available ? 'Добавить в корзину' : 'Нет в наличии'}
              </button>
              <button
                onClick={buyNow}
                disabled={!product.available}
                style={{
                  flex: 1,
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: 600,
                  border: '2px solid var(--primary)',
                  background: 'white',
                  color: 'var(--primary)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Купить сейчас
              </button>
            </div>

            <div style={{ marginTop: '40px', padding: '20px', background: 'var(--card)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '16px', marginBottom: '12px' }}>Информация о товаре</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
                <div>
                  <span style={{ color: 'var(--secondary)' }}>Артикул:</span>
                  <span style={{ marginLeft: '8px' }}>{product.id}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)' }}>Бренд:</span>
                  <span style={{ marginLeft: '8px' }}>{product.brand}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)' }}>Категория:</span>
                  <span style={{ marginLeft: '8px' }}>{product.category}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--secondary)' }}>Статус:</span>
                  <span style={{ marginLeft: '8px', color: product.available ? '#10b981' : '#ef4444' }}>
                    {product.available ? 'В наличии' : 'Нет в наличии'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function Header({ user }: { user: { name?: string } | null }) {
  return (
    <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
          L-Shop
        </Link>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Link href="/catalog" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Каталог</Link>
          <Link href="/basket" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Корзина</Link>
          {user && (
            <>
              <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
                Профиль
              </Link>
              <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>
                Админка
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
