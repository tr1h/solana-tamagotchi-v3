// ============================================
// SIMPLE TAMA RECALCULATION SCRIPT
// ============================================

// This script works with data already loaded in database viewer
// Run this in browser console on the database viewer page

const SimpleTAMARecalc = {
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

    // Show current TAMA distribution using loaded data
    showTAMADistribution() {
        console.log('📊 Current TAMA distribution:');
        
        if (!window.playersData || !Array.isArray(window.playersData)) {
            console.error('❌ Players data not loaded. Please wait for data to load first.');
            return;
        }

        const distribution = {};
        window.playersData.forEach(player => {
            const tama = player.tama || 0;
            distribution[tama] = (distribution[tama] || 0) + 1;
        });

        console.table(distribution);
        
        // Show phase distribution
        console.log('\n🎯 Phase distribution:');
        const phaseCounts = { 'Phase 1 (600 TAMA)': 0, 'Phase 2 (500 TAMA)': 0, 'Phase 3 (500 TAMA)': 0, 'Phase 4 (500 TAMA)': 0 };
        
        window.playersData.forEach(player => {
            const tama = player.tama || 0;
            if (tama === 600) phaseCounts['Phase 1 (600 TAMA)']++;
            else if (tama === 500) phaseCounts['Phase 2 (500 TAMA)']++;
        });
        
        console.table(phaseCounts);
    },

    // Recalculate TAMA using loaded data
    async recalculateAllTAMA() {
        console.log('🔄 Starting TAMA recalculation...');
        
        if (!window.playersData || !Array.isArray(window.playersData)) {
            console.error('❌ Players data not loaded. Please wait for data to load first.');
            return;
        }

        if (!window.mintsData || !Array.isArray(window.mintsData)) {
            console.error('❌ Mints data not loaded. Please wait for data to load first.');
            return;
        }

        try {
            // Create mint order map
            const mintOrderMap = {};
            window.mintsData.forEach((mint, index) => {
                mintOrderMap[mint.wallet_address] = index + 1; // 1-based order
            });

            console.log(`📊 Found ${window.mintsData.length} NFT mints`);
            console.log(`👥 Found ${window.playersData.length} players`);

            let updatedCount = 0;
            let totalTAMADiff = 0;
            const updates = [];

            // Calculate updates for each player
            for (const player of window.playersData) {
                if (!player.nft_mint_address) continue; // Skip players without NFT

                const mintOrder = mintOrderMap[player.wallet_address];
                if (!mintOrder) continue; // Skip if no mint found

                const phaseIndex = this.getPhaseByMintOrder(mintOrder);
                const correctTAMA = this.phases[phaseIndex].tamaBonus;
                const currentTAMA = player.tama || 0;
                const tamaDiff = correctTAMA - currentTAMA;

                if (tamaDiff !== 0) {
                    console.log(`🔄 Will update ${player.wallet_address.slice(0, 8)}...`);
                    console.log(`   Mint Order: ${mintOrder} (Phase ${phaseIndex + 1})`);
                    console.log(`   Current TAMA: ${currentTAMA} → Correct TAMA: ${correctTAMA}`);
                    console.log(`   Difference: ${tamaDiff > 0 ? '+' : ''}${tamaDiff}`);

                    updates.push({
                        wallet_address: player.wallet_address,
                        tama: correctTAMA
                    });

                    updatedCount++;
                    totalTAMADiff += tamaDiff;
                }
            }

            if (updates.length === 0) {
                console.log('✅ All TAMA values are already correct!');
                return;
            }

            console.log(`\n📋 Summary:`);
            console.log(`   Players to update: ${updatedCount}`);
            console.log(`   Total TAMA difference: ${totalTAMADiff > 0 ? '+' : ''}${totalTAMADiff}`);

            // Ask for confirmation
            const confirmed = confirm(`Update ${updatedCount} players with total TAMA difference of ${totalTAMADiff > 0 ? '+' : ''}${totalTAMADiff}?`);
            if (!confirmed) {
                console.log('❌ Update cancelled by user');
                return;
            }

            // Perform updates
            console.log('🔄 Performing updates...');
            let successCount = 0;
            let errorCount = 0;

            for (const update of updates) {
                try {
                    const { error } = await supabase
                        .from('leaderboard')
                        .update({ 
                            tama: update.tama,
                            updated_at: new Date().toISOString()
                        })
                        .eq('wallet_address', update.wallet_address);

                    if (error) {
                        console.error(`❌ Failed to update ${update.wallet_address}:`, error);
                        errorCount++;
                    } else {
                        console.log(`✅ Updated ${update.wallet_address.slice(0, 8)}...`);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`❌ Error updating ${update.wallet_address}:`, err);
                    errorCount++;
                }
            }

            console.log('\n🎉 TAMA recalculation completed!');
            console.log(`✅ Successfully updated: ${successCount} players`);
            console.log(`❌ Failed updates: ${errorCount} players`);
            console.log(`💰 Total TAMA difference: ${totalTAMADiff > 0 ? '+' : ''}${totalTAMADiff}`);

            // Refresh data
            console.log('🔄 Refreshing data...');
            setTimeout(() => {
                location.reload();
            }, 2000);

        } catch (error) {
            console.error('❌ Recalculation failed:', error);
        }
    }
};

// Make it available globally
window.SimpleTAMARecalc = SimpleTAMARecalc;

console.log('✅ Simple TAMA Recalculation script loaded!');
console.log('📋 Available commands:');
console.log('   SimpleTAMARecalc.showTAMADistribution() - Show current TAMA distribution');
console.log('   SimpleTAMARecalc.recalculateAllTAMA() - Recalculate all TAMA values');
console.log('');
console.log('⚠️  Make sure data is loaded first (wait for "✅ All data loaded" message)');

