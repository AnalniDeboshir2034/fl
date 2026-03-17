'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Product } from '@/types';
import { useAuth } from '@/lib/auth-context';

function CatalogContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [basket, setBasket] = useState<{ productId: string; quantity: number; size?: string }[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('default');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        let data = await res.json();
        
        // Если товаров нет, инициализируем данные
        if (!data || data.length === 0) {
          console.log('No products found, initializing...');
          const initRes = await fetch('/api/init', { method: 'POST' });
          const initData = await initRes.json();
          console.log('Init result:', initData);
          
          // Загружаем товары снова после инициализации
          const res2 = await fetch('/api/products');
          data = await res2.json();
        }
        
        setProducts(data);
        setLoading(false);

        if (data.length > 0) {
          const prices = data.map((p: Product) => p.price);
          setPriceRange([Math.min(...prices), Math.max(...prices)]);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        setLoading(false);
      }
    };

    loadProducts();
    loadBasket();
  }, [user]);

  useEffect(() => {
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const sort = searchParams.get('sort');
    
    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
    if (sort) setSortBy(sort);
  }, [searchParams]);

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

  const addToBasket = async (productId: string, size?: string) => {
    if (user) {
      await fetch('/api/baskets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          productId,
          quantity: 1,
          size,
          action: 'add',
        }),
      });
      loadBasket();
    } else {
      const newBasket = [...basket];
      const existing = newBasket.find(item => item.productId === productId && item.size === size);
      if (existing) {
        existing.quantity += 1;
      } else {
        newBasket.push({ productId, quantity: 1, size });
      }
      setBasket(newBasket);
      localStorage.setItem('basket', JSON.stringify(newBasket));
    }
  };

  const categories = useMemo(() => ['all', ...new Set(products.map(p => p.category))], [products]);
  const brands = useMemo(() => ['all', ...new Set(products.map(p => p.brand))], [products]);

  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === selectedCategory);
    }

    if (selectedBrand !== 'all') {
      result = result.filter(p => p.brand === selectedBrand);
    }

    result = result.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      default:
        break;
    }

    return result;
  }, [products, searchQuery, selectedCategory, selectedBrand, sortBy, priceRange]);

  const updateUrl = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value && value !== 'all') {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`/catalog?${params.toString()}`, { scroll: false });
  };

  if (loading) {
    return (
      <div className="container">
        <Header user={user} />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Header user={user} />
      <main style={{ padding: '40px 0' }}>
        <h1 style={{ fontSize: '32px', marginBottom: '32px' }}>Каталог товаров</h1>
        
        {/* Filters */}
        <div style={{
          background: 'var(--card)',
          borderRadius: '12px',
          padding: '24px',
          border: '1px solid var(--border)',
          marginBottom: '32px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Поиск</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Название или описание..."
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
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Категория</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  updateUrl('category', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white',
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'Все категории' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Бренд</label>
              <select
                value={selectedBrand}
                onChange={(e) => {
                  setSelectedBrand(e.target.value);
                  updateUrl('brand', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white',
                }}
              >
                {brands.map(brand => (
                  <option key={brand} value={brand}>
                    {brand === 'all' ? 'Все бренды' : brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>Сортировка</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  updateUrl('sort', e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid var(--border)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  background: 'white',
                }}
              >
                <option value="default">По умолчанию</option>
                <option value="price-asc">Сначала дешевые</option>
                <option value="price-desc">Сначала дорогие</option>
                <option value="name-asc">По названию (А-Я)</option>
                <option value="name-desc">По названию (Я-А)</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, fontSize: '14px' }}>
              Цена: {priceRange[0].toLocaleString()} - {priceRange[1].toLocaleString()} ₽
            </label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <input
                type="range"
                min="0"
                max="50000"
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                style={{ flex: 1 }}
              />
              <input
                type="range"
                min="0"
                max="50000"
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <p style={{ marginTop: '16px', color: 'var(--secondary)', fontSize: '14px' }}>
            Найдено товаров: {filteredProducts.length}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <p style={{ textAlign: 'center', padding: '40px', color: 'var(--secondary)' }}>
            Товары не найдены
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            {filteredProducts.map(product => (
              <Link
                key={product.id}
                href={`/catalog/${product.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div
                  style={{
                    background: 'var(--card)',
                    borderRadius: '12px',
                    padding: '20px',
                    border: '1px solid var(--border)',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
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
                    {product.available ? (
                      <span style={{ color: '#10b981', fontSize: '14px' }}>В наличии</span>
                    ) : (
                      <span style={{ color: '#ef4444', fontSize: '14px' }}>Нет в наличии</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Catalog() {
  return (
    <Suspense fallback={
      <div className="container">
        <HeaderFallback />
        <p style={{ textAlign: 'center', padding: '40px' }}>Загрузка...</p>
      </div>
    }>
      <CatalogContent />
    </Suspense>
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

function HeaderFallback() {
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
