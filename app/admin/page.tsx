'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Product } from '@/types';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    brand: '',
    price: '',
    available: true,
    imageUrl: '',
    sizes: '36, 37, 38, 39, 40, 41, 42, 43, 44, 45',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products', error);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          sizes: formData.sizes.split(',').map(s => s.trim()).filter(s => s),
        }),
      });

      if (res.ok) {
        setMessage({ type: 'success', text: 'Товар успешно добавлен!' });
        setFormData({
          title: '',
          description: '',
          category: '',
          brand: '',
          price: '',
          available: true,
          imageUrl: '',
          sizes: '36, 37, 38, 39, 40, 41, 42, 43, 44, 45',
        });
        loadProducts();
      } else {
        const data = await res.json();
        setMessage({ type: 'error', text: data.error || 'Ошибка при добавлении товара' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Ошибка при добавлении товара' });
    }

    setSubmitting(false);
  };

  if (authLoading || (loading && !user)) {
    return (
      <div className="container">
        <Header user={user} />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container">
      <Header user={user} />
      <main style={{ padding: '40px 0' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Админ-панель</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '32px' }}>
          <div>
            <div
              style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '24px',
                border: '1px solid var(--border)',
              }}
            >
              <h2 style={{ fontSize: '20px', marginBottom: '24px' }}>Добавить товар</h2>
              <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Название</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Описание</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '16px',
                      resize: 'vertical',
                    }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Категория</label>
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      placeholder="sneakers, clothes, etc."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Бренд</label>
                    <input
                      type="text"
                      value={formData.brand}
                      onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Цена (₽)</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      step="1"
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>URL изображения</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="/api/assets/images/..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        fontSize: '16px',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Размеры (через запятую)</label>
                  <input
                    type="text"
                    value={formData.sizes}
                    onChange={(e) => setFormData({ ...formData, sizes: e.target.value })}
                    placeholder="36, 37, 38, 39, 40, 41, 42, 43, 44, 45"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="checkbox"
                    id="available"
                    checked={formData.available}
                    onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <label htmlFor="available" style={{ fontWeight: 500 }}>Доступен</label>
                </div>
                {message && (
                  <p style={{
                    color: message.type === 'success' ? '#10b981' : '#ef4444',
                    fontSize: '14px',
                    margin: 0,
                  }}>
                    {message.text}
                  </p>
                )}
                <button
                  type="submit"
                  className="primary"
                  disabled={submitting}
                  style={{ padding: '12px', fontSize: '16px', marginTop: '8px' }}
                >
                  {submitting ? 'Добавление...' : 'Добавить товар'}
                </button>
              </form>
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
              <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Товары ({products.length})</h2>
              {loading ? (
                <p>Загрузка...</p>
              ) : products.length === 0 ? (
                <p style={{ color: 'var(--secondary)' }}>Товаров пока нет</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '600px', overflowY: 'auto' }}>
                  {products.map(product => (
                    <div
                      key={product.id}
                      style={{
                        padding: '12px',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontWeight: 600 }}>{product.title}</p>
                          <p style={{ margin: 0, fontSize: '12px', color: 'var(--secondary)' }}>
                            {product.price.toLocaleString('ru-RU')} ₽
                          </p>
                        </div>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: product.available ? '#10b981' : '#ef4444',
                          color: 'white',
                        }}>
                          {product.available ? 'Доступен' : 'Нет'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
