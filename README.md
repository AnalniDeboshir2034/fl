# L-Shop - Интернет-магазин кроссовок и одежды

## 🚀 Развертывание на Vercel

### 1. Подключи Vercel KV (Redis)

1. Зайди в проект на [Vercel Dashboard](https://vercel.com/dashboard)
2. Перейди во вкладку **Storage**
3. Нажми **Connect Database** → **Vercel KV**
4. Создай новый KV store (бесплатно до 10K операций/день)
5. После создания Vercel автоматически добавит переменные окружения

### 2. Настрой переменные окружения

В настройках проекта на Vercel добавь:

```env
KV_URL=your_kv_url
KV_REST_API_URL=your_rest_api_url
KV_REST_API_TOKEN=your_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_read_only_token
```

**ИЛИ** просто подключи KV через интерфейс Vercel - переменные добавятся автоматически!

### 3. Деплой

```bash
# Запуш изменения в Git
git push

# Vercel автоматически задеплоит
# Или через CLI:
vercel --prod
```

## 🛠️ Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build

# Запуск production сервера
npm start
```

## 📁 Структура данных

Данные хранятся в:
- **Vercel (production)**: Vercel KV (Redis)
- **Локально (development)**: `backend/data/*.json`

Файлы:
- `users.json` - пользователи
- `products.json` - товары
- `baskets.json` - корзины
- `orders.json` - заказы

## ✨ Функционал

- ✅ Регистрация и авторизация
- ✅ Профиль пользователя
- ✅ Каталог с фильтрами и поиском
- ✅ Карточка товара с выбором размера
- ✅ Корзина с оформлением заказа
- ✅ Админ-панель для добавления товаров
- ✅ История заказов

## 🔧 Технологии

- Next.js 14 (App Router)
- React 18
- TypeScript
- Vercel KV (Redis) для production
- File system для локальной разработки
