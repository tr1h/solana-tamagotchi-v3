// Migration script to add total_xp to existing players
// Run this in browser console on database-viewer.html

async function migrateTotalXP() {
    console.log('🔄 Starting total_xp migration...');
    
    try {
        // Get Supabase client
        const supabase = window.Database?.supabase || window.supabase;
        if (!supabase) {
            throw new Error('Supabase not available');
        }
        
        // Get all players
        const { data: players, error } = await supabase
            .from('leaderboard')
            .select('*');
        
        if (error) throw error;
        
        console.log(`📊 Found ${players.length} players to migrate`);
        
        let updated = 0;
        
        for (const player of players) {
            // Calculate total_xp based on level and current xp
            const calculatedTotalXP = (player.level - 1) * 100 + (player.xp || 0);
            
            // Only update if total_xp is missing or 0
            if (!player.total_xp || player.total_xp === 0) {
                const { error: updateError } = await supabase
                    .from('leaderboard')
                    .update({ 
                        total_xp: calculatedTotalXP,
                        updated_at: new Date().toISOString()
                    })
                    .eq('wallet_address', player.wallet_address);
                
                if (updateError) {
                    console.error(`❌ Failed to update ${player.wallet_address}:`, updateError);
                } else {
                    updated++;
                    console.log(`✅ Updated ${player.wallet_address}: Level ${player.level}, XP ${player.xp} → Total XP ${calculatedTotalXP}`);
                }
            }
        }
        
        console.log(`🎉 Migration complete! Updated ${updated} players`);
        
        // Show new leaderboard
        const { data: newPlayers } = await supabase
            .from('leaderboard')
            .select('*')
            .order('total_xp', { ascending: false })
            .limit(10);
        
        console.log('🏆 New Top 10 by Total XP:');
        newPlayers.forEach((player, i) => {
            console.log(`${i + 1}. ${player.wallet_address.slice(0, 8)}... - Level ${player.level}, Total XP: ${player.total_xp}`);
        });
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
    }
}

// Auto-run migration
migrateTotalXP();
