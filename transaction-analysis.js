// 🔍 АНАЛИЗ ТРАНЗАКЦИЙ
// Скопируй и вставь этот код в консоль браузера на странице Database Viewer

(async function analyzeTransactions() {
    console.log('🔍 Analyzing transactions...');
    
    try {
        // Получаем Supabase клиент
        const supabase = window.Database?.supabase || window.supabase;
        if (!supabase) {
            throw new Error('Supabase not available');
        }
        
        // 1. Получаем все NFT минты
        const { data: mints, error: mintsError } = await supabase
            .from('nft_mints')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (mintsError) throw mintsError;
        
        console.log(`📊 Found ${mints.length} NFT mints`);
        
        // 2. Группируем по кошелькам
        const walletGroups = {};
        mints.forEach(mint => {
            if (!walletGroups[mint.wallet_address]) {
                walletGroups[mint.wallet_address] = [];
            }
            walletGroups[mint.wallet_address].push(mint);
        });
        
        // 3. Ищем кошельки с множественными транзакциями
        const multipleTransactions = Object.entries(walletGroups)
            .filter(([wallet, transactions]) => transactions.length > 1)
            .sort((a, b) => b[1].length - a[1].length);
        
        console.log(`\n🔍 Wallets with multiple transactions: ${multipleTransactions.length}`);
        
        if (multipleTransactions.length > 0) {
            console.log('\n📋 Multiple transaction details:');
            multipleTransactions.forEach(([wallet, transactions]) => {
                console.log(`\n💰 Wallet: ${wallet.slice(0, 8)}...${wallet.slice(-8)}`);
                console.log(`   Transactions: ${transactions.length}`);
                
                transactions.forEach((tx, i) => {
                    const time = new Date(tx.created_at).toLocaleString();
                    console.log(`   ${i + 1}. ${tx.nft_type} ${tx.nft_rarity} - ${tx.mint_price} SOL - ${time}`);
                });
                
                // Проверяем на дубликаты по времени
                const timeGroups = {};
                transactions.forEach(tx => {
                    const timeKey = new Date(tx.created_at).toISOString().slice(0, 16); // минуты
                    if (!timeGroups[timeKey]) {
                        timeGroups[timeKey] = [];
                    }
                    timeGroups[timeKey].push(tx);
                });
                
                const simultaneous = Object.entries(timeGroups)
                    .filter(([time, txs]) => txs.length > 1);
                
                if (simultaneous.length > 0) {
                    console.log(`   ⚠️ Simultaneous transactions:`);
                    simultaneous.forEach(([time, txs]) => {
                        console.log(`     ${time}: ${txs.length} transactions`);
                        txs.forEach(tx => {
                            console.log(`       - ${tx.mint_price} SOL (${tx.nft_type})`);
                        });
                    });
                }
            });
        }
        
        // 4. Анализируем цены
        console.log('\n💰 Price analysis:');
        const priceGroups = {};
        mints.forEach(mint => {
            const price = mint.mint_price;
            if (!priceGroups[price]) {
                priceGroups[price] = 0;
            }
            priceGroups[price]++;
        });
        
        Object.entries(priceGroups)
            .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
            .forEach(([price, count]) => {
                console.log(`- ${price} SOL: ${count} transactions`);
            });
        
        // 5. Анализируем фазы
        console.log('\n📊 Phase analysis:');
        const phaseGroups = {};
        mints.forEach(mint => {
            const phase = mint.mint_phase || 'unknown';
            if (!phaseGroups[phase]) {
                phaseGroups[phase] = 0;
            }
            phaseGroups[phase]++;
        });
        
        Object.entries(phaseGroups)
            .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
            .forEach(([phase, count]) => {
                console.log(`- Phase ${phase}: ${count} transactions`);
            });
        
        // 6. Ищем аномалии
        console.log('\n🚨 Anomaly detection:');
        
        // Проверяем на одинаковые mint_address
        const mintAddressGroups = {};
        mints.forEach(mint => {
            if (mint.nft_mint_address) {
                if (!mintAddressGroups[mint.nft_mint_address]) {
                    mintAddressGroups[mint.nft_mint_address] = [];
                }
                mintAddressGroups[mint.nft_mint_address].push(mint);
            }
        });
        
        const duplicateMintAddresses = Object.entries(mintAddressGroups)
            .filter(([mintAddress, transactions]) => transactions.length > 1);
        
        if (duplicateMintAddresses.length > 0) {
            console.log(`⚠️ Duplicate mint addresses: ${duplicateMintAddresses.length}`);
            duplicateMintAddresses.forEach(([mintAddress, transactions]) => {
                console.log(`   ${mintAddress}: ${transactions.length} records`);
            });
        } else {
            console.log('✅ No duplicate mint addresses');
        }
        
        // Проверяем на пустые mint_address
        const emptyMintAddresses = mints.filter(mint => !mint.nft_mint_address);
        if (emptyMintAddresses.length > 0) {
            console.log(`⚠️ Empty mint addresses: ${emptyMintAddresses.length}`);
        } else {
            console.log('✅ All mint addresses are filled');
        }
        
        console.log('\n✅ Transaction analysis complete!');
        
    } catch (error) {
        console.error('❌ Analysis failed:', error);
        alert('❌ Analysis failed: ' + error.message);
    }
})();

