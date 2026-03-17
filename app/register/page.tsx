'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов');
      return;
    }

    setLoading(true);

    const result = await register(email, password, name, phone);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      router.push('/profile');
    }
  };

  return (
    <div className="container">
      <Header />
      <main style={{ maxWidth: '400px', margin: '40px auto', padding: '40px 20px' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '24px', textAlign: 'center' }}>Регистрация</h1>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Имя</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Телефон</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+7 (999) 000-00-00"
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Подтвердите пароль</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
          {error && (
            <p style={{ color: '#ef4444', fontSize: '14px', margin: 0 }}>{error}</p>
          )}
          <button
            type="submit"
            className="primary"
            disabled={loading}
            style={{ padding: '12px', fontSize: '16px' }}
          >
            {loading ? 'Регистрация...' : 'Зарегистрироваться'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--secondary)' }}>
          Уже есть аккаунт? <Link href="/login">Войти</Link>
        </p>
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
