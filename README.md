# Vault — Web

Веб-версия Vault Finance App на **чистом React + Vite** — без Expo и React Native.
Работает полностью в браузере, бэкенд не нужен. Данные хранятся в `localStorage`.

## Запуск

```bash
npm install
npm run dev      # дев-сервер → http://localhost:5173
```

## Сборка

```bash
npm run build    # статика в dist/ (~112 KB gzip)
npm run preview  # локальный просмотр сборки
```

Папку `dist/` можно деплоить на любой статический хостинг (Netlify, Vercel, GitHub Pages).

## Как устроен проект

Код экранов, компонентов и вся бизнес-логика в `src/` идентичны мобильному
приложению — они не менялись. Написаны они в нотации React Native, поэтому
модули `react-native` / `expo-*` подменяются на лёгкие локальные шимы на чистом
React через алиасы Vite (`vite.config.ts`) и TypeScript (`tsconfig.json`):

| Модуль | Шим |
| --- | --- |
| `react-native` | `src/shims/react-native.tsx` — View/Text/Pressable/ScrollView/TextInput/Modal → div/span/input + конвертация RN-стилей в CSS, мини-Animated, PanResponder на Pointer Events, Alert → confirm, Share → Web Share API |
| `react-native-svg` | `src/shims/react-native-svg.tsx` — нативные SVG-элементы DOM |
| `expo-linear-gradient` | `src/shims/expo-linear-gradient.tsx` — CSS `linear-gradient()` |
| `@expo/vector-icons` | `src/shims/vector-icons.tsx` — Ionicons из `react-icons/io5` |
| `@react-navigation/*` | `src/shims/navigation-*.tsx` — мини таб-навигатор с тем же контрактом |
| `@react-native-async-storage` | `src/shims/async-storage.ts` — `localStorage` |
| `react-native-safe-area-context`, `expo-status-bar`, `react-native-gesture-handler` | заглушки |

Зависимости рантайма: только `react`, `react-dom`, `react-icons`.

## Скрипты

- `npm run dev` / `npm start` — дев-сервер с hot reload
- `npm run build` — typecheck + продакшен-сборка в `dist/`
- `npm run typecheck` — только проверка типов
