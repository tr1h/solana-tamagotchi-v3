/**
 * 🍬 Candy Machine Creator
 * Создает Candy Machine v3 для Solana Tamagotchi NFT
 */

const { 
  Connection, 
  clusterApiUrl, 
  Keypair, 
  PublicKey,
  LAMPORTS_PER_SOL 
} = require('@solana/web3.js');
const { 
  Metaplex, 
  keypairIdentity, 
  bundlrStorage,
  toBigNumber,
  sol
} = require('@metaplex-foundation/js');
const fs = require('fs');

// Конфигурация
const CONFIG = {
  // Network: 'devnet' или 'mainnet-beta'
  network: 'devnet',
  
  // Параметры коллекции
  collectionName: 'Solana Tamagotchi',
  collectionSymbol: 'TAMA',
  collectionDescription: 'The Ultimate Blockchain Pet Game on Solana!',
  
  // Параметры Candy Machine
  itemsAvailable: 100,
  price: 0.3, // SOL
  sellerFeeBasisPoints: 500, // 5% роялти
  
  // Путь к кошельку создателя
  walletPath: './devnet-wallet.json',
  
  // Метаданные
  collectionMetadataUri: 'https://arweave.net/YOUR_COLLECTION_METADATA_URI',
  
  // Treasury (куда идут деньги от минтов)
  treasuryWallet: 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump'
};

/**
 * Загружает кошелек из файла
 */
function loadWallet(walletPath) {
  try {
    const walletFile = fs.readFileSync(walletPath, 'utf-8');
    const secretKey = Uint8Array.from(JSON.parse(walletFile));
    return Keypair.fromSecretKey(secretKey);
  } catch (error) {
    console.error('❌ Error loading wallet:', error.message);
    console.log('💡 Create a wallet with: solana-keygen new --outfile devnet-wallet.json');
    process.exit(1);
  }
}

/**
 * Создает коллекцию NFT
 */
async function createCollection(metaplex, wallet) {
  console.log('🎨 Creating NFT Collection...');
  
  try {
    const { nft: collectionNft } = await metaplex.nfts().create({
      name: CONFIG.collectionName,
      symbol: CONFIG.collectionSymbol,
      uri: CONFIG.collectionMetadataUri,
      sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
      isCollection: true,
      updateAuthority: wallet,
    });
    
    console.log('✅ Collection created!');
    console.log('📍 Collection Address:', collectionNft.address.toString());
    
    return collectionNft;
  } catch (error) {
    console.error('❌ Error creating collection:', error);
    throw error;
  }
}

/**
 * Создает Candy Machine
 */
async function createCandyMachine(metaplex, collectionNft, wallet) {
  console.log('🍬 Creating Candy Machine...');
  
  try {
    const { candyMachine } = await metaplex.candyMachines().create({
      collection: collectionNft.address,
      itemsAvailable: toBigNumber(CONFIG.itemsAvailable),
      sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
      symbol: CONFIG.collectionSymbol,
      maxEditionSupply: toBigNumber(0), // Unlimited editions
      isMutable: true,
      creators: [
        {
          address: wallet.publicKey,
          share: 100,
        },
      ],
      guards: {
        solPayment: {
          amount: sol(CONFIG.price),
          destination: new PublicKey(CONFIG.treasuryWallet),
        },
        startDate: {
          date: new Date(),
        },
      },
    });
    
    console.log('✅ Candy Machine created!');
    console.log('📍 Candy Machine Address:', candyMachine.address.toString());
    
    return candyMachine;
  } catch (error) {
    console.error('❌ Error creating Candy Machine:', error);
    throw error;
  }
}

/**
 * Добавляет NFT в Candy Machine
 */
async function insertItems(metaplex, candyMachine, itemsData) {
  console.log('📦 Adding items to Candy Machine...');
  
  try {
    await metaplex.candyMachines().insertItems({
      candyMachine,
      items: itemsData,
    });
    
    console.log(`✅ Added ${itemsData.length} items to Candy Machine`);
  } catch (error) {
    console.error('❌ Error inserting items:', error);
    throw error;
  }
}

/**
 * Сохраняет конфигурацию в файл
 */
function saveConfig(collectionAddress, candyMachineAddress) {
  const config = {
    network: CONFIG.network,
    collection: {
      address: collectionAddress,
      name: CONFIG.collectionName,
      symbol: CONFIG.collectionSymbol,
    },
    candyMachine: {
      address: candyMachineAddress,
      itemsAvailable: CONFIG.itemsAvailable,
      price: CONFIG.price,
      sellerFeeBasisPoints: CONFIG.sellerFeeBasisPoints,
    },
    treasury: CONFIG.treasuryWallet,
    createdAt: new Date().toISOString(),
  };
  
  const configPath = './candy-machine-config.json';
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  
  console.log('💾 Configuration saved to:', configPath);
}

/**
 * Основная функция
 */
async function main() {
  console.log('🚀 Solana Tamagotchi - Candy Machine Setup');
  console.log('==========================================');
  console.log('Network:', CONFIG.network);
  console.log('Items:', CONFIG.itemsAvailable);
  console.log('Price:', CONFIG.price, 'SOL');
  console.log('');
  
  // Подключение к Solana
  const endpoint = CONFIG.network === 'devnet' 
    ? clusterApiUrl('devnet')
    : clusterApiUrl('mainnet-beta');
  
  const connection = new Connection(endpoint);
  console.log('🔗 Connected to:', endpoint);
  
  // Загрузка кошелька
  const wallet = loadWallet(CONFIG.walletPath);
  console.log('👛 Wallet loaded:', wallet.publicKey.toString());
  
  // Проверка баланса
  const balance = await connection.getBalance(wallet.publicKey);
  console.log('💰 Balance:', balance / LAMPORTS_PER_SOL, 'SOL');
  
  if (balance < 1 * LAMPORTS_PER_SOL) {
    console.log('');
    console.log('⚠️  WARNING: Low balance!');
    if (CONFIG.network === 'devnet') {
      console.log('💡 Get devnet SOL: solana airdrop 2 ' + wallet.publicKey.toString() + ' --url devnet');
    } else {
      console.log('💡 You need at least 1 SOL for mainnet deployment');
    }
    console.log('');
  }
  
  // Настройка Metaplex
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(wallet))
    .use(bundlrStorage({
      address: CONFIG.network === 'devnet' 
        ? 'https://devnet.bundlr.network'
        : 'https://node1.bundlr.network',
      providerUrl: endpoint,
      timeout: 60000,
    }));
  
  try {
    // Создание коллекции
    const collectionNft = await createCollection(metaplex, wallet);
    console.log('');
    
    // Создание Candy Machine
    const candyMachine = await createCandyMachine(metaplex, collectionNft, wallet);
    console.log('');
    
    // Сохранение конфигурации
    saveConfig(
      collectionNft.address.toString(),
      candyMachine.address.toString()
    );
    
    console.log('');
    console.log('✅ Setup complete!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('  1. Upload your NFT assets using Sugar CLI or Metaplex');
    console.log('  2. Update js/mint.js with Candy Machine address');
    console.log('  3. Test minting on devnet');
    console.log('  4. Deploy to mainnet when ready');
    console.log('');
    console.log('🔑 Important addresses:');
    console.log('  Collection:', collectionNft.address.toString());
    console.log('  Candy Machine:', candyMachine.address.toString());
    console.log('  Treasury:', CONFIG.treasuryWallet);
    console.log('');
    
  } catch (error) {
    console.error('');
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

// Запуск
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { createCollection, createCandyMachine };


