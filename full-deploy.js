const { Connection, Keypair, PublicKey } = require('@solana/web3.js');
const { Metaplex, keypairIdentity, bundlrStorage } = require('@metaplex-foundation/js');
const fs = require('fs');

async function deploy() {
    console.log('🚀 Starting NFT deployment...');
    
    // Загрузи кошелек
    const walletData = JSON.parse(fs.readFileSync('devnet-wallet.json', 'utf8'));
    const wallet = Keypair.fromSecretKey(Uint8Array.from(walletData));
    
    console.log('👛 Wallet:', wallet.publicKey.toString());
    
    // Подключение к devnet
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Настройка Metaplex
    const metaplex = Metaplex.make(connection)
        .use(keypairIdentity(wallet));
    
    console.log('🍬 Creating NFT Collection...');
    
    // Создание коллекции
    const { nft: collectionNft } = await metaplex.nfts().create({
        name: 'Solana Tamagotchi',
        symbol: 'TAMA',
        uri: 'https://example.com/collection.json', // Временный URI
        sellerFeeBasisPoints: 500, // 5% роялти
        isCollection: true,
    });
    
    console.log('✅ Collection created!');
    console.log('📍 Collection Address:', collectionNft.address.toString());
    
    // Сохрани конфиг
    const config = {
        network: 'devnet',
        collection: {
            address: collectionNft.address.toString(),
            name: 'Solana Tamagotchi',
            symbol: 'TAMA',
        },
        candyMachine: {
            address: 'PLACEHOLDER', // Будет создан позже
        },
        treasury: wallet.publicKey.toString(),
        createdAt: new Date().toISOString(),
    };
    
    fs.writeFileSync('candy-machine-config.json', JSON.stringify(config, null, 2));
    console.log('💾 Config saved to candy-machine-config.json');
    
    console.log('🎉 Collection ready!');
    console.log('Next: Upload metadata and create Candy Machine');
}

deploy().catch(console.error);
