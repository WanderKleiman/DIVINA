# Divina — Mobile Build Guide

## Архитектура

Capacitor оборачивает задеплоенный Next.js в нативную оболочку (Remote URL).  
iOS/Android загружают `https://divina.app` → API-роуты работают на сервере.

---

## Шаг 1 — Деплой бэкенда на Vercel

```bash
# Установи Vercel CLI если нет
npm i -g vercel

# Деплой из папки проекта
vercel --prod
# → Получишь URL вида https://divina-app.vercel.app
```

Переменные окружения в Vercel Dashboard:
```
OPENAI_API_KEY=sk-...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

---

## Шаг 2 — Обновить URL в Capacitor конфиге

`capacitor.config.ts`:
```ts
const PRODUCTION_URL = "https://divina-app.vercel.app"; // ← вставь свой URL
```

После этого:
```bash
npm run cap:sync  # синхронизирует конфиг в ios/ и android/
```

---

## Шаг 3 — iOS сборка

Требования: macOS, Xcode 15+, Apple Developer аккаунт

```bash
# Открыть в Xcode
npm run cap:ios
# или
npx cap open ios
```

В Xcode:
1. Выбери Team (подпись) в `Signing & Capabilities`
2. Bundle ID: `app.divina`
3. `Product → Archive` → `Distribute App → App Store Connect`

---

## Шаг 4 — Android сборка

Требования: Android Studio, JDK 17+

```bash
npm run cap:android
# или
npx cap open android
```

В Android Studio:
1. `Build → Generate Signed Bundle / APK`
2. Выбери `Android App Bundle (.aab)` для Play Store
3. Создай/выбери keystore

---

## Обновление приложения

При каждом изменении кода:

```bash
# 1. Деплой обновлений на Vercel
vercel --prod

# 2. Синхронизировать нативные проекты (если менялись плагины/конфиг)
npm run cap:sync
```

Если меняется только веб-код — шаг 2 не нужен, пользователи получат обновление автоматически при следующем открытии.

---

## Структура проекта

```
divina-app/
  ios/          ← Xcode проект (открывай через npx cap open ios)
  android/      ← Android Studio проект
  out/          ← Fallback HTML (показывается если нет сети)
  capacitor.config.ts  ← Главный конфиг: appId, serverUrl, плагины
```

---

## App ID / Bundle ID

| Платформа | ID |
|-----------|-----|
| iOS Bundle ID | `app.divina` |
| Android App ID | `app.divina` |

Зарегистрируй `app.divina` в App Store Connect и Google Play Console.
