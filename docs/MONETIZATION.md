# Divina — Монетизация и платный контент

## Продукты в App Store Connect

| ID | Тип | Цена | Триал |
|---|---|---|---|
| `divina_pro_monthly` | Auto-renewable subscription | $4.99/мес | 7 дней бесплатно |

> Годовой план убран — только месячный. Триал настраивается в App Store Connect:  
> Product → Introductory Offer → Free → 7 Days

---

## Что бесплатно навсегда

| Функция | Лимит |
|---|---|
| **План дня** (Today) | ♾ без ограничений |
| Натальная карта (просмотр) | ♾ без ограничений |

---

## Бесплатно до лимита → затем Paywall

| Функция | Бесплатно | Где считается | Storage key |
|---|---|---|---|
| **Недельный план** (Weekly) | 3 разные недели | `app/weekly/page.tsx` → `recordWeeklyUse()` | `divina_free_weekly_weeks` (JSON array) |
| **Расклад на месяц** | 1 раз | `app/for-you/month/page.tsx` → `recordMonthForecastUse()` | `divina_free_month_used` |
| **Совместимость** | 1 раз | `app/for-you/page.tsx` → `recordCompatibilityUse()` | `divina_free_compat_used` |
| **Разбор личности** | 1 раз | `app/profile/personality/page.tsx` → `recordPersonalityUse()` | `divina_free_person_used` |

> Логика в `lib/free-limits.ts`. Счётчики хранятся в `localStorage` — не сбрасываются при перезапуске.  
> Повторное открытие той же недели = бесплатно (кеш), новая неделя = -1 из 3.

---

## Только Pro (без бесплатного доступа)

| Функция | Где гейт |
|---|---|
| **Расклад на год** | `app/for-you/year/page.tsx` — `if (!isPro) → Paywall` |
| **Натальная карта другого человека** | `app/for-you/others/page.tsx` — `if (!isPro) → Paywall` |

---

## Как работает триал (механика App Store)

```
Юзер нажимает "Claim my free week"
  → App Store показывает sheet: "7 days free, then $4.99/month"
  → Юзер подтверждает Face ID / Touch ID (нужна карта)
  → 7 дней полный доступ ко всему Pro
  → На 8-й день автосписание $4.99
  → Отменить можно до конца триала — в Settings → Subscriptions
```

> Если юзер уже использовал триал ранее — App Store автоматически  
> покажет обычную цену без бесплатного периода (не наша логика, Apple).

---

## Paywall — где показывается

`SubscriptionPaywall` (`components/paywall/SubscriptionPaywall.tsx`) появляется когда:

1. Юзер открывает **Year Forecast** или **Others natal** — всегда
2. Юзер открывает **Monthly / Weekly / Compatibility / Personality** — после исчерпания лимита
3. Юзер не Pro → `isPro === false` (RevenueCat `@revenuecat/purchases-capacitor`)

**Текст кнопки:** "Claim my free week"  
**Подпись:** "$1.2 a week · Cancel anytime"

---

## Стоимость AI-запросов (GPT-4o-mini)

Цены: **$0.15 / 1M input** · **$0.60 / 1M output**

| Функция | ~Токены | ~Стоимость |
|---|---|---|
| План дня | 1 500 in + 1 500 out | **$0.00033** |
| Транзиты (today) | 800 in + 600 out | **$0.00013** |
| Недельный план | 2 000 in + 3 000 out | **$0.00048** |
| Расклад месяца | 2 000 in + 6 000 out | **$0.00066** |
| Расклад года | 2 000 in + 8 000 out | **$0.00078** |
| Разбор личности | 3 000 in + 6 000 out | **$0.00081** |
| Интерпретация карты | 3 000 in + 8 000 out | **$0.00093** |
| Совместимость | 2 000 in + 3 000 out | **$0.00048** |
| Жизненные периоды | 1 500 in + 2 000 out | **$0.00038** |

**Первый запуск (всё сразу):** ~$0.005/юзер  
**Повторные запуски:** ~$0 (кеш работает, см. ниже)

---

## Кеширование (после фикса sessionStorage → localStorage)

| Контент | TTL | Обновляется |
|---|---|---|
| План дня | до полуночи | каждый новый день |
| Недельный план | до следующего понедельника | каждую новую неделю |
| Расклад месяца | 7 дней | раз в неделю |
| Расклад года | 7 дней | раз в неделю |
| Разбор личности | 30 дней | раз в месяц |
| Интерпретация карты | 30 дней | раз в месяц |
| Жизненные периоды | 7 дней | раз в неделю |
| Натальная карта (профиль) | 24 ч | ежедневно |

> Модуль: `lib/local-cache.ts` — `lcGet / lcSet / lcDel`  
> Ключи формата: `divina-today-v2_birthDate_tone_lang_tzOffset`

---

## Расчёт затрат на 100 юзеров

| Сценарий | Затраты/день |
|---|---|
| Без кеша (было): 3 запуска/день | ~$1.50/день |
| С кешем (сейчас): 1 генерация/день | **~$0.05–0.10/день** |
| 1 000 юзеров с кешем | ~$0.50–1.00/день |

---

## Технический стек платежей

- **RevenueCat SDK:** `@revenuecat/purchases-capacitor`
- **Проверка подписки:** `useProStatus()` → `isPro: boolean` (`lib/pro-status.tsx`)
- **Timeout на загрузку RC:** 5 сек (если RC завис — `isPro = false`)
- **Ключ Vercel env:** `NEXT_PUBLIC_REVENUECAT_IOS_KEY`
- **Восстановление покупок:** кнопка "Restore purchases" в paywall → `restorePurchases()`

---

## Чеклист перед публикацией

- [ ] Создать продукт `divina_pro_monthly` в App Store Connect
- [ ] Добавить Introductory Offer: Free Trial, 7 дней
- [ ] Создать Entitlement `pro` в RevenueCat Dashboard
- [ ] Привязать продукт к Offering `default` в RevenueCat
- [ ] Добавить `NEXT_PUBLIC_REVENUECAT_IOS_KEY` в Vercel env vars
- [ ] Проверить Sandbox-покупку на тестовом устройстве
- [ ] Добавить Privacy Policy URL в App Store Connect
