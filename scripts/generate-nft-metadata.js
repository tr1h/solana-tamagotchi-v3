/**
 * 🎨 NFT Metadata Generator
 * Генерирует JSON метаданные для NFT коллекции Solana Tamagotchi
 */

const fs = require('fs');
const path = require('path');

// Конфигурация
const CONFIG = {
  collectionName: 'Solana Tamagotchi',
  symbol: 'TAMA',
  description: 'A unique Solana Tamagotchi NFT Pet - Play, Earn, and Evolve!',
  externalUrl: 'https://tr1h.github.io/solana-tamagotchi-v3/',
  creatorAddress: 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump', // Замените на ваш адрес
  sellerFeeBasisPoints: 500, // 5% роялти
  totalSupply: 100,
  outputDir: './nft-assets'
};

// Типы питомцев
const PET_TYPES = [
  { name: 'Cat', emoji: '🐱' },
  { name: 'Dog', emoji: '🐶' },
  { name: 'Dragon', emoji: '🐉' },
  { name: 'Fox', emoji: '🦊' },
  { name: 'Bear', emoji: '🐻' },
  { name: 'Rabbit', emoji: '🐰' },
  { name: 'Panda', emoji: '🐼' },
  { name: 'Lion', emoji: '🦁' },
  { name: 'Unicorn', emoji: '🦄' },
  { name: 'Wolf', emoji: '🐺' }
];

// Редкости
const RARITIES = [
  { name: 'Common', weight: 70 },
  { name: 'Rare', weight: 20 },
  { name: 'Epic', weight: 8 },
  { name: 'Legendary', weight: 2 }
];

// Цвета
const COLORS = ['Orange', 'Brown', 'Green', 'Red', 'Blue', 'Purple', 'Pink', 'Gold', 'Silver', 'Black', 'White'];

// Фоны
const BACKGROUNDS = ['Forest', 'Ocean', 'Mountain', 'Sky', 'Desert', 'City', 'Space', 'Sunset'];

// Паттерны
const PATTERNS = ['Solid', 'Striped', 'Spotted', 'Gradient'];

// Особые способности
const SPECIAL_ABILITIES = ['None', 'Fire', 'Ice', 'Electric', 'Magic', 'Cosmic'];

// Аксессуары
const ACCESSORIES = ['None', 'Crown', 'Sunglasses', 'Scarf', 'Hat', 'Wings'];

/**
 * Выбирает случайный элемент из массива
 */
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Выбирает редкость на основе весов
 */
function rollRarity() {
  const rand = Math.random() * 100;
  let cumulative = 0;
  
  for (const rarity of RARITIES) {
    cumulative += rarity.weight;
    if (rand < cumulative) {
      return rarity.name;
    }
  }
  
  return RARITIES[0].name;
}

/**
 * Генерирует метаданные для одного NFT
 */
function generateNFTMetadata(index) {
  const petType = randomChoice(PET_TYPES);
  const rarity = rollRarity();
  const color = randomChoice(COLORS);
  const background = randomChoice(BACKGROUNDS);
  const pattern = randomChoice(PATTERNS);
  
  // Особые способности только для редких NFT
  const specialAbility = rarity === 'Legendary' || rarity === 'Epic' 
    ? randomChoice(SPECIAL_ABILITIES.slice(1)) 
    : 'None';
  
  // Аксессуары для редких NFT
  const accessory = rarity === 'Common' 
    ? 'None' 
    : randomChoice(ACCESSORIES.slice(1));
  
  const metadata = {
    name: `${CONFIG.collectionName} #${index}`,
    symbol: CONFIG.symbol,
    description: `${CONFIG.description} This is a ${rarity} ${petType.name} with ${color} ${pattern} pattern.`,
    seller_fee_basis_points: CONFIG.sellerFeeBasisPoints,
    image: `${index}.png`,
    external_url: `${CONFIG.externalUrl}?nft=${index}`,
    attributes: [
      {
        trait_type: 'Type',
        value: petType.name
      },
      {
        trait_type: 'Rarity',
        value: rarity
      },
      {
        trait_type: 'Color',
        value: color
      },
      {
        trait_type: 'Pattern',
        value: pattern
      },
      {
        trait_type: 'Background',
        value: background
      },
      {
        trait_type: 'Accessory',
        value: accessory
      },
      {
        trait_type: 'Special Ability',
        value: specialAbility
      }
    ],
    properties: {
      files: [
        {
          uri: `${index}.png`,
          type: 'image/png'
        }
      ],
      category: 'image',
      creators: [
        {
          address: CONFIG.creatorAddress,
          share: 100
        }
      ]
    }
  };
  
  return metadata;
}

/**
 * Генерирует метаданные коллекции
 */
function generateCollectionMetadata() {
  return {
    name: CONFIG.collectionName,
    symbol: CONFIG.symbol,
    description: 'The Ultimate Blockchain Pet Game on Solana! Collect, Play, Earn with unique NFT pets. 10 types, 4 rarities, endless fun!',
    seller_fee_basis_points: CONFIG.sellerFeeBasisPoints,
    image: 'collection.png',
    external_url: CONFIG.externalUrl,
    attributes: [],
    properties: {
      files: [
        {
          uri: 'collection.png',
          type: 'image/png'
        }
      ],
      category: 'image',
      creators: [
        {
          address: CONFIG.creatorAddress,
          share: 100
        }
      ]
    }
  };
}

/**
 * Основная функция генерации
 */
function generateAllMetadata() {
  // Создаем директорию, если не существует
  if (!fs.existsSync(CONFIG.outputDir)) {
    fs.mkdirSync(CONFIG.outputDir, { recursive: true });
  }
  
  console.log('🎨 Generating NFT metadata...');
  console.log(`📊 Total supply: ${CONFIG.totalSupply}`);
  console.log(`💾 Output directory: ${CONFIG.outputDir}`);
  console.log('');
  
  // Статистика по редкости
  const rarityStats = {};
  RARITIES.forEach(r => rarityStats[r.name] = 0);
  
  // Генерируем метаданные для каждого NFT
  for (let i = 0; i < CONFIG.totalSupply; i++) {
    const metadata = generateNFTMetadata(i);
    const filePath = path.join(CONFIG.outputDir, `${i}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2));
    
    // Обновляем статистику
    const rarity = metadata.attributes.find(attr => attr.trait_type === 'Rarity').value;
    rarityStats[rarity]++;
    
    if ((i + 1) % 10 === 0) {
      console.log(`✅ Generated ${i + 1}/${CONFIG.totalSupply} metadata files...`);
    }
  }
  
  // Генерируем метаданные коллекции
  const collectionMetadata = generateCollectionMetadata();
  const collectionPath = path.join(CONFIG.outputDir, 'collection.json');
  fs.writeFileSync(collectionPath, JSON.stringify(collectionMetadata, null, 2));
  
  console.log('');
  console.log('✅ All metadata generated successfully!');
  console.log('');
  console.log('📊 Rarity Distribution:');
  Object.entries(rarityStats).forEach(([rarity, count]) => {
    const percentage = ((count / CONFIG.totalSupply) * 100).toFixed(1);
    console.log(`  ${rarity}: ${count} (${percentage}%)`);
  });
  console.log('');
  console.log('📝 Next steps:');
  console.log('  1. Add images (0.png, 1.png, ...) to ' + CONFIG.outputDir);
  console.log('  2. Add collection.png image');
  console.log('  3. Run: sugar validate');
  console.log('  4. Run: sugar upload');
  console.log('  5. Run: sugar deploy');
  console.log('');
  console.log('🎉 Happy minting!');
}

// Запуск генерации
if (require.main === module) {
  generateAllMetadata();
}

module.exports = { generateNFTMetadata, generateCollectionMetadata, CONFIG };




