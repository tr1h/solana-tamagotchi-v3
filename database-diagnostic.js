// 🔍 ДИАГНОСТИКА БАЗЫ ДАННЫХ
// Скопируй и вставь этот код в консоль браузера на странице Database Viewer

(async function databaseDiagnostic() {
    console.log('🔍 Starting database diagnostic...');
    
    try {
        // Получаем Supabase клиент
        const supabase = window.Database?.supabase || window.supabase;
        if (!supabase) {
            throw new Error('Supabase not available');
        }
        
        console.log('✅ Supabase client found');
        
        // 1. Проверяем таблицу nft_mints
        console.log('\n📊 Checking NFT Mints table...');
        const { data: mints, error: mintsError, count: mintsCount } = await supabase
            .from('nft_mints')
            .select('*', { count: 'exact' });
        
        if (mintsError) {
            console.error('❌ Error fetching NFT mints:', mintsError);
        } else {
            console.log(`✅ NFT Mints: ${mintsCount} records`);
            
            // Проверяем на дубликаты по wallet_address
            const walletCounts = {};
            mints.forEach(mint => {
                walletCounts[mint.wallet_address] = (walletCounts[mint.wallet_address] || 0) + 1;
            });
            
            const duplicates = Object.entries(walletCounts).filter(([wallet, count]) => count > 1);
            if (duplicates.length > 0) {
                console.warn('⚠️ Duplicate wallets in NFT mints:', duplicates);
            } else {
                console.log('✅ No duplicate wallets in NFT mints');
            }
        }
        
        // 2. Проверяем таблицу leaderboard
        console.log('\n👥 Checking Leaderboard table...');
        const { data: players, error: playersError, count: playersCount } = await supabase
            .from('leaderboard')
            .select('*', { count: 'exact' });
        
        if (playersError) {
            console.error('❌ Error fetching players:', playersError);
        } else {
            console.log(`✅ Players: ${playersCount} records`);
            
            // Проверяем на дубликаты по wallet_address
            const playerWalletCounts = {};
            players.forEach(player => {
                playerWalletCounts[player.wallet_address] = (playerWalletCounts[player.wallet_address] || 0) + 1;
            });
            
            const playerDuplicates = Object.entries(playerWalletCounts).filter(([wallet, count]) => count > 1);
            if (playerDuplicates.length > 0) {
                console.warn('⚠️ Duplicate wallets in leaderboard:', playerDuplicates);
            } else {
                console.log('✅ No duplicate wallets in leaderboard');
            }
        }
        
        // 3. Проверяем синхронизацию между таблицами
        console.log('\n🔗 Checking table synchronization...');
        if (mints && players) {
            const mintWallets = new Set(mints.map(m => m.wallet_address));
            const playerWallets = new Set(players.map(p => p.wallet_address));
            
            const missingInLeaderboard = [...mintWallets].filter(w => !playerWallets.has(w));
            const missingInMints = [...playerWallets].filter(w => !mintWallets.has(w));
            
            console.log(`📊 Sync Status:`);
            console.log(`- NFT Mints: ${mintWallets.size} unique wallets`);
            console.log(`- Leaderboard: ${playerWallets.size} unique wallets`);
            console.log(`- Missing in leaderboard: ${missingInLeaderboard.length}`);
            console.log(`- Missing in mints: ${missingInMints.length}`);
            
            if (missingInLeaderboard.length > 0) {
                console.warn('⚠️ Wallets in NFT mints but not in leaderboard:', missingInLeaderboard);
            }
            
            if (missingInMints.length > 0) {
                console.warn('⚠️ Wallets in leaderboard but not in NFT mints:', missingInMints);
            }
            
            if (missingInLeaderboard.length === 0 && missingInMints.length === 0) {
                console.log('✅ Tables are perfectly synchronized!');
            }
        }
        
        // 4. Проверяем последние транзакции
        console.log('\n⏰ Checking recent transactions...');
        if (mints) {
            const recentMints = mints
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5);
            
            console.log('📋 Last 5 NFT mints:');
            recentMints.forEach((mint, i) => {
                console.log(`${i + 1}. ${mint.wallet_address.slice(0, 8)}... - ${mint.nft_type} ${mint.nft_rarity} - ${mint.mint_price} SOL - ${new Date(mint.created_at).toLocaleString()}`);
            });
        }
        
        // 5. Проверяем TAMA распределение
        console.log('\n💰 Checking TAMA distribution...');
        if (players) {
            const tamaStats = players.reduce((acc, player) => {
                const tama = player.tama || 0;
                if (tama === 0) acc.zero++;
                else if (tama === 500) acc.fiveHundred++;
                else acc.other++;
                return acc;
            }, { zero: 0, fiveHundred: 0, other: 0 });
            
            console.log('📊 TAMA Distribution:');
            console.log(`- 0 TAMA: ${tamaStats.zero} players`);
            console.log(`- 500 TAMA: ${tamaStats.fiveHundred} players`);
            console.log(`- Other amounts: ${tamaStats.other} players`);
        }
        
        // 6. Проверяем структуру данных
        console.log('\n🏗️ Checking data structure...');
        if (mints && mints.length > 0) {
            const sampleMint = mints[0];
            console.log('📋 NFT Mint structure:');
            console.log('- wallet_address:', !!sampleMint.wallet_address);
            console.log('- nft_mint_address:', !!sampleMint.nft_mint_address);
            console.log('- nft_type:', !!sampleMint.nft_type);
            console.log('- nft_rarity:', !!sampleMint.nft_rarity);
            console.log('- nft_data:', !!sampleMint.nft_data);
            console.log('- mint_price:', sampleMint.mint_price);
            console.log('- mint_phase:', sampleMint.mint_phase);
        }
        
        if (players && players.length > 0) {
            const samplePlayer = players[0];
            console.log('📋 Player structure:');
            console.log('- wallet_address:', !!samplePlayer.wallet_address);
            console.log('- nft_mint_address:', !!samplePlayer.nft_mint_address);
            console.log('- pet_name:', !!samplePlayer.pet_name);
            console.log('- pet_type:', !!samplePlayer.pet_type);
            console.log('- pet_rarity:', !!samplePlayer.pet_rarity);
            console.log('- level:', samplePlayer.level);
            console.log('- xp:', samplePlayer.xp);
            console.log('- tama:', samplePlayer.tama);
            console.log('- pet_data:', !!samplePlayer.pet_data);
        }
        
        console.log('\n✅ Database diagnostic complete!');
        
    } catch (error) {
        console.error('❌ Diagnostic failed:', error);
        alert('❌ Diagnostic failed: ' + error.message);
    }
})();
