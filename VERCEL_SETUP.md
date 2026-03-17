# 🚀 Vercel Deployment - Complete Guide

## ✅ Все готово для деплоя!

Этот проект полностью настроен для работы на **Vercel** с использованием **Vercel Blob Storage**.

---

## 📦 Что было сделано

### 1. Конфигурация Vercel Blob
- ✅ `vercel.json` - включена поддержка Blob Storage
- ✅ `lib/json-storage.ts` - работает только с Vercel Blob
- ✅ Все данные хранятся в облаке, не в файловой системе

### 2. API маршруты
- ✅ `/api/products` - товары
- ✅ `/api/baskets` - корзины
- ✅ `/api/orders` - заказы
- ✅ `/api/auth/login` - вход
- ✅ `/api/auth/register` - регистрация
- ✅ `/api/auth/me` - проверка авторизации
- ✅ `/api/auth/logout` - выход

### 3. Данные
- ✅ `backend/data/products.json` - начальные данные о товарах
- ✅ `backend/data/users.json` - пользователи
- ✅ `backend/data/baskets.json` - корзины
- ✅ `backend/data/orders.json` - заказы

---

## 🔧 Деплой за 3 минуты

### Шаг 1: Push в Git

```bash
git push
```

### Шаг 2: Создай Vercel Blob Storage

1. Зайди на https://vercel.com/dashboard
2. Импортируй проект из GitHub (твой репозиторий)
3. Перейди во вкладку **Storage**
4. Нажми **Connect Database** → **Vercel Blob**
5. Создай Blob store (бесплатно 10 GB!)
6. ✅ Vercel автоматически добавит `BLOB_READ_WRITE_TOKEN`

### Шаг 3: Готово!

Vercel автоматически задеплоит проект. После деплоя:
- ✅ Все API работают
- ✅ Данные сохраняются в Vercel Blob
- ✅ Дизайн без изменений

---

## 📊 Проверка работы

### 1. Проверь API

```bash
# Товары
curl https://your-app.vercel.app/api/products

# Корзина
curl -X POST https://your-app.vercel.app/api/baskets \
  -H "Content-Type: application/json" \
  -d '{"userId":"u123","items":[],"action":"add"}'
```

### 2. Проверь сайт

- `/` - главная
- `/catalog` - каталог товаров
- `/admin` - админ-панель
- `/basket` - корзина
- `/profile` - профиль

---

## 💡 Как это работает

### Локально
```
File System → backend/data/*.json
```

### На Vercel
```
Vercel Blob Storage → lshop-*.json
```

Код автоматически переключается через `@vercel/blob`.

---

## 🎁 Бесплатный тариф Vercel Blob

- ✅ 10 GB хранилище
- ✅ 100 GB трафик в месяц
- ✅ Достаточно для небольшого магазина!

---

## 🆘 Если что-то не работает

### 1. Проверь переменные окружения

Vercel Dashboard → Project Settings → Environment Variables

Должна быть:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

### 2. Проверь Blob Storage

Vercel Dashboard → Project → Storage

Должен быть подключен **Vercel Blob**

### 3. Посмотри логи

Vercel Dashboard → Deployment → Logs

---

## 📝 Дополнительные команды

```bash
# Локальная разработка
npm run dev

# Сборка
npm run build

# Запуск production локально
npm start

# Загрузить данные в Blob (на Vercel)
npm run seed
```

---

## ✨ Итог

- ✅ **Дизайн не изменен**
- ✅ **Все функции работают**
- ✅ **Данные загружаются и сохраняются**
- ✅ **Готово к деплою на Vercel**

**Просто сделай `git push` и следуй шагам выше!** 🚀
