// Проверка NFT в кошельке
const { Connection, PublicKey } = require('@solana/web3.js');

async function checkNFTs() {
    const wallet = 'BFFQEo2b2d9rbXNGLX76RZHoNpbph39F8UPPKZDsie9r'; // Твой кошелёк
    
    const connection = new Connection('https://api.devnet.solana.com');
    
    console.log('🔍 Проверяем NFT для кошелька:', wallet);
    console.log('');
    
    // Получаем все токены
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        new PublicKey(wallet),
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
    );
    
    console.log(`📦 Найдено ${tokenAccounts.value.length} токенов`);
    console.log('');
    
    // Фильтруем NFT (amount = 1, decimals = 0)
    const nfts = tokenAccounts.value.filter(ta => {
        const amount = ta.account.data.parsed.info.tokenAmount;
        return amount.decimals === 0 && amount.uiAmount === 1;
    });
    
    console.log(`🎨 Найдено ${nfts.length} NFT:`);
    console.log('');
    
    nfts.forEach((nft, i) => {
        const mint = nft.account.data.parsed.info.mint;
        console.log(`${i + 1}. NFT Mint: ${mint}`);
        console.log(`   Token Account: ${nft.pubkey.toString()}`);
        console.log(`   Explorer: https://explorer.solana.com/address/${mint}?cluster=devnet`);
        console.log('');
    });
    
    if (nfts.length === 0) {
        console.log('❌ NFT не найдены!');
        console.log('');
        console.log('💡 Возможные причины:');
        console.log('   1. Транзакция еще не подтверждена');
        console.log('   2. Минт не прошёл (проверь транзакцию)');
        console.log('   3. NFT отправлен на другой кошелёк');
    }
}

checkNFTs().catch(console.error);

