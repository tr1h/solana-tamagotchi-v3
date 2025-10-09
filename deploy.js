const { Connection, Keypair } = require('@solana/web3.js');
const fs = require('fs');

async function deploy() {
    console.log('🚀 Starting deployment...');
    
    // Загрузи кошелек
    const walletData = JSON.parse(fs.readFileSync('devnet-wallet.json', 'utf8'));
    const wallet = Keypair.fromSecretKey(Uint8Array.from(walletData));
    
    console.log('👛 Wallet:', wallet.publicKey.toString());
    
    // Подключение к devnet
    const connection = new Connection('https://api.devnet.solana.com');
    
    // Проверь баланс
    const balance = await connection.getBalance(wallet.publicKey);
    console.log('💰 Balance:', balance / 1e9, 'SOL');
    
    console.log('✅ Ready to deploy!');
}

deploy().catch(console.error);
