# 🎨 Генерация NFT картинок

## Проблема
Все NFT используют одну картинку. Нужны уникальные изображения для каждого типа питомца.

## Решение

### Вариант 1: Простые эмодзи (БЫСТРО) ✅
Используем эмодзи как временные изображения:
- 🐱 Cat
- 🐶 Dog
- 🐉 Dragon
- 🦊 Fox
- 🐻 Bear
- 🐰 Rabbit
- 🐼 Panda
- 🦁 Lion
- 🦄 Unicorn
- 🐺 Wolf

**Преимущества:**
- Работает из коробки
- Нет дополнительных файлов
- Быстро

### Вариант 2: Pixel Art генератор (РЕКОМЕНДУЕМ)

Используй один из этих инструментов:

#### A) Piskel (Online)
https://www.piskelapp.com/
1. Создай 64x64px спрайты
2. Экспортируй PNG для каждого типа
3. Сохрани в `nft-assets/`

#### B) Aseprite (Платный)
https://www.aseprite.org/
- Профессиональный pixel art редактор
- $19.99

#### C) AI генератор (ChatGPT/Midjourney)
Промпты для ChatGPT:
```
Create a cute pixel art tamagotchi cat character, 
64x64 pixels, simple design, pastel colors, 
transparent background
```

### Вариант 3: Arweave upload (Для mainnet)

1. Создай изображения
2. Загрузи на Arweave:
```bash
npm install -g @bundlr-network/client
bundlr upload image.png -c solana -w wallet.json
```

3. Обнови metadata в `scripts/generate-nft-metadata.js`

## Текущее состояние

✅ Эмодзи работают в игре
🔄 Нужны реальные PNG для NFT metadata
⏳ Для mainnet - загрузить на Arweave

## Быстрый старт

Для devnet используй эмодзи (уже настроено).

Для production:
1. Создай 10 PNG файлов
2. Положи в `nft-assets/pets/`
3. Обнови `umi-candy-machine.js` строку 177:
   ```js
   image: `https://arweave.net/YOUR_ARWEAVE_HASH_${types[typeIndex]}.png`
   ```

## Примеры размеров

- **Минимум:** 64x64px
- **Рекомендуем:** 512x512px
- **Максимум:** 1024x1024px

PNG с прозрачным фоном.


