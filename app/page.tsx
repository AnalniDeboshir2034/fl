'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Home() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="container">
      <header style={{ padding: '20px 0', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
        <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary)', textDecoration: 'none' }}>
            L-Shop
          </Link>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/catalog" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Каталог</Link>
            <Link href="/basket" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Корзина</Link>
            {user ? (
              <>
                <Link href="/profile" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Профиль</Link>
                <Link href="/admin" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Админка</Link>
                <button
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--secondary)',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link href="/login" style={{ textDecoration: 'none', color: 'var(--foreground)' }}>Войти</Link>
                <Link href="/register">
                  <button className="primary" style={{ padding: '8px 16px' }}>Регистрация</button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main>
        <section style={{ textAlign: 'center', padding: '60px 0' }}>
          <h1 style={{ fontSize: '48px', marginBottom: '20px' }}>Добро пожаловать в L-Shop</h1>
          <p style={{ fontSize: '20px', color: 'var(--secondary)', marginBottom: '40px' }}>
            Лучшие кроссовки и одежда от MaFinBuSi
          </p>
          <Link href="/catalog">
            <button className="primary" style={{ padding: '12px 32px', fontSize: '18px' }}>
              Перейти в каталог
            </button>
          </Link>
        </section>

        <section style={{ padding: '40px 0' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>Популярные товары</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
            <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ height: '200px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '8px', marginBottom: '16px' }}></div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>MaFinBuSi Runner X</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '12px' }}>Легкие беговые кроссовки</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>7 990 ₽</p>
            </div>
            <div style={{ background: 'var(--card)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
              <div style={{ height: '200px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '8px', marginBottom: '16px' }}></div>
              <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>MaFinBuSi Urban Hoodie</h3>
              <p style={{ color: 'var(--secondary)', fontSize: '14px', marginBottom: '12px' }}>Теплое худи</p>
              <p style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--primary)' }}>4 990 ₽</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '40px 0', marginTop: '60px', borderTop: '1px solid var(--border)', textAlign: 'center', color: 'var(--secondary)' }}>
        <p>&copy; 2026 L-Shop. Все права защищены.</p>
      </footer>
    </div>
  );
}
