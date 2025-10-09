// ============================================
// TAMA RECALCULATION SCRIPT
// ============================================

// This script recalculates TAMA for all users based on their mint phase
// Run this in browser console on the database viewer page

const TAMARecalculation = {
    // Phase bonuses (same as in mint.js)
    phases: [
        { max: 100, price: 0.3, tamaBonus: 600 },
        { max: 500, price: 0.5, tamaBonus: 500 },
        { max: 1000, price: 0.8, tamaBonus: 500 },
        { max: 10000, price: 1.0, tamaBonus: 500 }
    ],

    // Get phase by mint order
    getPhaseByMintOrder(mintOrder) {
        if (mintOrder <= 100) return 0; // Phase 1
        if (mintOrder <= 500) return 1; // Phase 2
        if (mintOrder <= 1000) return 2; // Phase 3
        return 3; // Phase 4
    },

    // Recalculate TAMA for all users
    async recalculateAllTAMA() {
        console.log('🔄 Starting TAMA recalculation...');
        
        try {
            // Get Supabase instance from database viewer
            let supabase;
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                // If supabase is available globally, use it
                supabase = window.supabase;
            } else if (typeof supabase !== 'undefined') {
                // If supabase is available as const in database viewer
                supabase = supabase;
            } else {
                console.error('❌ Supabase not found. Make sure you are on the database viewer page.');
                console.log('Available objects:', Object.keys(window).filter(k => k.includes('supabase') || k.includes('Supabase')));
                return;
            }
            
            // Get all NFT mints ordered by creation time
            const { data: mints, error: mintsError } = await supabase
                .from('nft_mints')
                .select('*')
                .order('created_at', { ascending: true });

            if (mintsError) {
                console.error('❌ Error fetching mints:', mintsError);
                return;
            }

            console.log(`📊 Found ${mints.length} NFT mints`);

            // Get all leaderboard entries
            const { data: players, error: playersError } = await supabase
                .from('leaderboard')
                .select('*');

            if (playersError) {
                console.error('❌ Error fetching players:', playersError);
                return;
            }

            console.log(`👥 Found ${players.length} players`);

            // Create mint order map
            const mintOrderMap = {};
            mints.forEach((mint, index) => {
                mintOrderMap[mint.wallet_address] = index + 1; // 1-based order
            });

            let updatedCount = 0;
            let totalTAMADiff = 0;

            // Update each player
            for (const player of players) {
                if (!player.nft_mint_address) continue; // Skip players without NFT

                const mintOrder = mintOrderMap[player.wallet_address];
                if (!mintOrder) continue; // Skip if no mint found

                const phaseIndex = this.getPhaseByMintOrder(mintOrder);
                const correctTAMA = this.phases[phaseIndex].tamaBonus;
                const currentTAMA = player.tama || 0;
                const tamaDiff = correctTAMA - currentTAMA;

                if (tamaDiff !== 0) {
                    console.log(`🔄 Updating ${player.wallet_address.slice(0, 8)}...`);
                    console.log(`   Mint Order: ${mintOrder} (Phase ${phaseIndex + 1})`);
                    console.log(`   Current TAMA: ${currentTAMA} → Correct TAMA: ${correctTAMA}`);
                    console.log(`   Difference: ${tamaDiff > 0 ? '+' : ''}${tamaDiff}`);

                    // Update player's TAMA
                    const { error: updateError } = await supabase
                        .from('leaderboard')
                        .update({ 
                            tama: correctTAMA,
                            updated_at: new Date().toISOString()
                        })
                        .eq('wallet_address', player.wallet_address);

                    if (updateError) {
                        console.error(`❌ Failed to update ${player.wallet_address}:`, updateError);
                    } else {
                        updatedCount++;
                        totalTAMADiff += tamaDiff;
                        console.log(`✅ Updated successfully`);
                    }
                }
            }

            console.log('🎉 TAMA recalculation completed!');
            console.log(`📊 Updated ${updatedCount} players`);
            console.log(`💰 Total TAMA difference: ${totalTAMADiff > 0 ? '+' : ''}${totalTAMADiff}`);

        } catch (error) {
            console.error('❌ Recalculation failed:', error);
        }
    },

    // Show current TAMA distribution
    async showTAMADistribution() {
        console.log('📊 Current TAMA distribution:');
        
        try {
            // Get Supabase instance from database viewer
            let supabase;
            if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
                // If supabase is available globally, use it
                supabase = window.supabase;
            } else if (typeof supabase !== 'undefined') {
                // If supabase is available as const in database viewer
                supabase = supabase;
            } else {
                console.error('❌ Supabase not found. Make sure you are on the database viewer page.');
                console.log('Available objects:', Object.keys(window).filter(k => k.includes('supabase') || k.includes('Supabase')));
                return;
            }
            
            const { data: players, error } = await supabase
                .from('leaderboard')
                .select('wallet_address, tama, nft_mint_address')
                .not('nft_mint_address', 'is', null)
                .order('tama', { ascending: false });

            if (error) {
                console.error('❌ Error fetching players:', error);
                return;
            }

            const distribution = {};
            players.forEach(player => {
                const tama = player.tama || 0;
                distribution[tama] = (distribution[tama] || 0) + 1;
            });

            console.table(distribution);
            
            // Show phase distribution
            console.log('\n🎯 Phase distribution:');
            const phaseCounts = { 'Phase 1 (600 TAMA)': 0, 'Phase 2 (500 TAMA)': 0, 'Phase 3 (500 TAMA)': 0, 'Phase 4 (500 TAMA)': 0 };
            
            players.forEach(player => {
                const tama = player.tama || 0;
                if (tama === 600) phaseCounts['Phase 1 (600 TAMA)']++;
                else if (tama === 500) phaseCounts['Phase 2 (500 TAMA)']++;
            });
            
            console.table(phaseCounts);

        } catch (error) {
            console.error('❌ Error showing distribution:', error);
        }
    }
};

// Make it available globally
window.TAMARecalculation = TAMARecalculation;

console.log('✅ TAMA Recalculation script loaded!');
console.log('📋 Available commands:');
console.log('   TAMARecalculation.showTAMADistribution() - Show current TAMA distribution');
console.log('   TAMARecalculation.recalculateAllTAMA() - Recalculate all TAMA values');
