const { Connection, Keypair, PublicKey, SystemProgram, Transaction } = require('@solana/web3.js');
const fs = require('fs');

async function deploy() {
    console.log('🚀 Simple NFT deployment...');
    
    // Загрузи кошелек
    const walletData = JSON.parse(fs.readFileSync('devnet-wallet.json', 'utf8'));
    const wallet = Keypair.fromSecretKey(Uint8Array.from(walletData));
    
    console.log('👛 Wallet:', wallet.publicKey.toString());
    
    // Подключение к devnet
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Проверь баланс
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Balance:', balance / 1e9, 'SOL');
    
    // Создай простой конфиг
    const config = {
        network: 'devnet',
        collection: {
            address: 'PLACEHOLDER_COLLECTION',
            name: 'Solana Tamagotchi',
            symbol: 'TAMA',
        },
        candyMachine: {
            address: 'PLACEHOLDER_CM',
        },
        treasury: wallet.publicKey.toString(),
        createdAt: new Date().toISOString(),
        status: 'ready_for_sugar'
    };
    
    fs.writeFileSync('candy-machine-config.json', JSON.stringify(config, null, 2));
    console.log('💾 Config saved to candy-machine-config.json');
    
    console.log('✅ Ready for Sugar CLI!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Try Sugar CLI again');
    console.log('2. Or use online tools like:');
    console.log('   - https://www.nft-generator.art/');
    console.log('   - https://www.bueno.art/');
    console.log('');
    console.log('Your assets are ready in nft-assets/');
}

deploy().catch(console.error);