# Vercel Deployment Guide

## 🚀 Быстрый деплой

### 1. Подготовка

```bash
# Установи Vercel CLI если еще не установлен
npm install -g vercel

# Залогинься в Vercel
vercel login
```

### 2. Создай Blob Storage

1. Зайди на https://vercel.com/dashboard
2. Выбери свой проект (или создай новый)
3. Перейди во вкладку **Storage**
4. Нажми **Connect Database** → **Vercel Blob**
5. Создай Blob store (10 GB бесплатно)
6. Vercel автоматически добавит `BLOB_READ_WRITE_TOKEN`

### 3. Задеплой

```bash
# Деплой в production
vercel --prod
```

Или просто запуш в Git (если подключен Vercel):
```bash
git push
```

## 📦 Начальные данные

После первого деплоя нужно загрузить начальные данные в Vercel Blob:

### Вариант 1: Через API (рекомендуется)

После деплоя зайди на сайт и добавь товары через админ-панель:
- Зайди на `/login` (войди как существующий пользователь или зарегистрируйся)
- Перейди на `/admin` 
- Добавь товары через форму

### Вариант 2: Автоматическая загрузка

Vercel автоматически загрузит данные из `backend/data/` при первом запросе к API.

## 🔧 Переменные окружения

Vercel автоматически создает:
- `BLOB_READ_WRITE_TOKEN` - токен для Blob Storage

Проверить можно в: Project Settings → Environment Variables

## ✅ Проверка работы

1. **Товары**: GET `/api/products` - должен вернуть список товаров
2. **Корзина**: POST `/api/baskets` - добавление товара в корзину
3. **Заказы**: POST `/api/orders` - создание заказа
4. **Авторизация**: POST `/api/auth/login` - вход

## ⚠️ Важно

- Данные хранятся в **Vercel Blob Storage** (не в файловой системе!)
- Файлы называются: `lshop-users.json`, `lshop-products.json`, и т.д.
- Бесплатный тариф: 10 GB хранилище, 100 GB трафик/месяц

## 🐛 Если что-то не работает

1. Проверь что `BLOB_READ_WRITE_TOKEN` установлен в Vercel
2. Проверь логи в Vercel: Deployment → Logs
3. Убедись что Blob Storage создан: Project Settings → Storage
