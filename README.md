# L-Shop - Интернет-магазин MaFinBuSi

Проект интернет-магазина на **Next.js** для развертывания на **Vercel**.

## Структура проекта

```
L_Shop/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── products/      # API товаров
│   │   ├── baskets/       # API корзин
│   │   └── orders/        # API заказов
│   ├── assets/images/     # Изображения товаров
│   ├── catalog/           # Страница каталога
│   ├── basket/            # Страница корзины
│   ├── globals.css        # Глобальные стили
│   ├── layout.tsx         # Корневой layout
│   └── page.tsx           # Главная страница
├── backend/data/          # JSON файлы с данными
│   ├── products.json      # Товары
│   ├── users.json         # Пользователи
│   ├── baskets.json       # Корзины
│   └── orders.json        # Заказы
├── components/            # React компоненты
├── lib/                   # Утилиты и хелперы
├── types/                 # TypeScript типы
├── next.config.js         # Конфигурация Next.js
├── vercel.json            # Конфигурация Vercel
└── tsconfig.json          # Конфигурация TypeScript
```

## API Endpoints

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/products` | Получить все товары |
| POST | `/api/products` | Создать товар |
| GET | `/api/baskets` | Получить все корзины |
| POST | `/api/baskets` | Сохранить корзину |
| GET | `/api/orders` | Получить все заказы |
| POST | `/api/orders` | Создать заказ |

## Локальная разработка

```bash
# Установка зависимостей
npm install

# Запуск dev-сервера
npm run dev

# Сборка для production
npm run build

# Запуск production-сервера
npm start
```

## Развертывание на Vercel

1. Установите Vercel CLI:
```bash
npm install -g vercel
```

2. Выполните деплой:
```bash
vercel
```

3. Или подключите репозиторий GitHub к Vercel для автоматического деплоя.

## Технологии

- **Next.js 14** - React фреймворк с App Router
- **TypeScript** - Типизация
- **Vercel** - Хостинг и CI/CD
