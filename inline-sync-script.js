// 🔄 ВСТРОЕННЫЙ СКРИПТ СИНХРОНИЗАЦИИ
// Скопируй и вставь этот код в консоль браузера на странице Database Viewer

(async function syncNFTsWithLeaderboard() {
    console.log('🔄 Starting NFT-Leaderboard sync...');
    
    try {
        // Получаем Supabase клиент
        const supabase = window.Database?.supabase || window.supabase;
        if (!supabase) {
            throw new Error('Supabase not available');
        }
        
        // 1. Получаем все NFT минты
        console.log('📊 Fetching all NFT mints...');
        const { data: mints, error: mintsError } = await supabase
            .from('nft_mints')
            .select('*')
            .order('created_at', { ascending: true });
        
        if (mintsError) throw mintsError;
        console.log(`✅ Found ${mints.length} NFT mints`);
        
        // 2. Получаем всех игроков в leaderboard
        console.log('👥 Fetching all players...');
        const { data: players, error: playersError } = await supabase
            .from('leaderboard')
            .select('*');
        
        if (playersError) throw playersError;
        console.log(`✅ Found ${players.length} players in leaderboard`);
        
        // 3. Создаём мапу игроков для быстрого поиска
        const playersMap = new Map();
        players.forEach(player => {
            playersMap.set(player.wallet_address, player);
        });
        
        // 4. Находим NFT минты без соответствующих записей в leaderboard
        const missingPlayers = [];
        const phaseBonuses = { 1: 500, 2: 500, 3: 500, 4: 500 };
        
        mints.forEach(mint => {
            if (!playersMap.has(mint.wallet_address)) {
                missingPlayers.push({
                    wallet_address: mint.wallet_address,
                    nft_mint_address: mint.nft_mint_address,
                    pet_name: mint.nft_data?.name || `${mint.nft_rarity} ${mint.nft_type}`,
                    pet_type: mint.nft_type,
                    pet_rarity: mint.nft_rarity,
                    level: 1,
                    xp: 0,
                    tama: phaseBonuses[mint.mint_phase] || 500,
                    pet_data: mint.nft_data || {
                        type: mint.nft_type,
                        rarity: mint.nft_rarity,
                        name: mint.nft_data?.name || `${mint.nft_rarity} ${mint.nft_type}`,
                        stats: { hunger: 100, energy: 100, happy: 100, health: 100 },
                        level: 1,
                        xp: 0
                    },
                    created_at: mint.created_at,
                    updated_at: new Date().toISOString()
                });
            }
        });
        
        console.log(`🔍 Found ${missingPlayers.length} missing players`);
        
        if (missingPlayers.length === 0) {
            console.log('✅ All NFTs are already synced with leaderboard!');
            return;
        }
        
        // 5. Создаём недостающие записи в leaderboard
        console.log('💾 Creating missing player records...');
        const { data: insertData, error: insertError } = await supabase
            .from('leaderboard')
            .insert(missingPlayers)
            .select();
        
        if (insertError) throw insertError;
        
        console.log(`✅ Successfully created ${insertData.length} player records`);
        
        // 6. Показываем статистику
        console.log('📊 SYNC COMPLETE:');
        console.log(`- NFT Mints: ${mints.length}`);
        console.log(`- Players before: ${players.length}`);
        console.log(`- Players after: ${players.length + insertData.length}`);
        console.log(`- Created: ${insertData.length}`);
        
        // 7. Обновляем страницу
        setTimeout(() => {
            window.location.reload();
        }, 2000);
        
    } catch (error) {
        console.error('❌ Sync failed:', error);
        alert('❌ Sync failed: ' + error.message);
    }
})();
