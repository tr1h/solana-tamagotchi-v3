// ============================================
// DIAGNOSTIC SCRIPT - Test Candy Machine
// ============================================

// Wait for Umi SDK to load
async function waitForUmiSDK() {
    if (window.UmiLoader) {
        console.log('🔄 Using UmiLoader to load SDK...');
        return await window.UmiLoader.waitForUmiSDK();
    } else {
        // Fallback to old method
        const maxAttempts = 50; // 5 секунд максимум
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window['@metaplex-foundation/umi-bundle-defaults'] && 
                window['@metaplex-foundation/mpl-candy-machine']) {
                console.log('✅ Umi SDK loaded successfully');
                return true;
            }
            
            console.log(`⏳ Waiting for Umi SDK... (${attempts + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        console.log('❌ Umi SDK failed to load after 5 seconds');
        return false;
    }
}

// Test if Candy Machine exists and is accessible
async function testCandyMachine() {
    console.log('🔍 Testing Candy Machine...');
    
    const CANDY_MACHINE_ID = '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB';
    const COLLECTION_MINT = 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT';
    
    try {
        // 1. Test connection
        const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
        console.log('✅ Connection established');
        
        // 2. Test Candy Machine account
        const candyMachinePubkey = new solanaWeb3.PublicKey(CANDY_MACHINE_ID);
        const candyMachineInfo = await connection.getAccountInfo(candyMachinePubkey);
        
        if (candyMachineInfo) {
            console.log('✅ Candy Machine account exists');
            console.log('📊 Account data length:', candyMachineInfo.data.length);
            console.log('💰 Lamports:', candyMachineInfo.lamports);
            console.log('👤 Owner:', candyMachineInfo.owner.toString());
        } else {
            console.log('❌ Candy Machine account NOT FOUND!');
            console.log('🔍 This means the Candy Machine ID is wrong or not deployed');
            return false;
        }
        
        // 3. Test Collection account
        const collectionPubkey = new solanaWeb3.PublicKey(COLLECTION_MINT);
        const collectionInfo = await connection.getAccountInfo(collectionPubkey);
        
        if (collectionInfo) {
            console.log('✅ Collection account exists');
            console.log('📊 Account data length:', collectionInfo.data.length);
            console.log('💰 Lamports:', collectionInfo.lamports);
            console.log('👤 Owner:', collectionInfo.owner.toString());
        } else {
            console.log('❌ Collection account NOT FOUND!');
            console.log('🔍 This means the Collection Mint is wrong');
            return false;
        }
        
        // 4. Test Umi initialization
        const umiLoaded = await waitForUmiSDK();
        if (umiLoaded) {
            
            const { createUmi } = window['@metaplex-foundation/umi-bundle-defaults'];
            const umi = createUmi('https://api.devnet.solana.com');
            console.log('✅ Umi instance created');
            
            // Test fetchCandyMachine
            const { fetchCandyMachine } = window['@metaplex-foundation/mpl-candy-machine'];
            const { publicKey } = window['@metaplex-foundation/umi'];
            
            try {
                const candyMachine = await fetchCandyMachine(umi, publicKey(CANDY_MACHINE_ID));
                console.log('✅ Candy Machine fetched successfully!');
                console.log('📊 Items available:', candyMachine.data.itemsAvailable);
                console.log('📊 Items redeemed:', candyMachine.itemsRedeemed);
                console.log('💰 Price:', candyMachine.data.price);
                console.log('👤 Authority:', candyMachine.authority.toString());
                
                return true;
            } catch (error) {
                console.log('❌ Failed to fetch Candy Machine:', error);
                return false;
            }
        } else {
            console.log('❌ Umi SDK not loaded');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Test failed:', error);
        return false;
    }
}

// Test wallet connection
async function testWallet() {
    console.log('🔍 Testing wallet connection...');
    
    if (window.solana && window.solana.isPhantom) {
        console.log('✅ Phantom wallet detected');
        
        try {
            const response = await window.solana.connect();
            console.log('✅ Wallet connected:', response.publicKey.toString());
            
            const connection = new solanaWeb3.Connection('https://api.devnet.solana.com', 'confirmed');
            const balance = await connection.getBalance(response.publicKey);
            console.log('💰 Balance:', balance / solanaWeb3.LAMPORTS_PER_SOL, 'SOL');
            
            return response.publicKey.toString();
        } catch (error) {
            console.log('❌ Failed to connect wallet:', error);
            return null;
        }
    } else {
        console.log('❌ Phantom wallet not found');
        return null;
    }
}

// Run all tests
async function runDiagnostics() {
    console.log('🚀 Starting Candy Machine Diagnostics...');
    console.log('=====================================');
    
    // Test 1: Wallet
    const walletAddress = await testWallet();
    console.log('');
    
    // Test 2: Candy Machine
    const candyMachineOk = await testCandyMachine();
    console.log('');
    
    // Summary
    console.log('📋 DIAGNOSTIC SUMMARY:');
    console.log('======================');
    console.log('Wallet connected:', walletAddress ? '✅' : '❌');
    console.log('Candy Machine accessible:', candyMachineOk ? '✅' : '❌');
    
    if (!candyMachineOk) {
        console.log('');
        console.log('🔧 POSSIBLE SOLUTIONS:');
        console.log('1. Check if Candy Machine ID is correct');
        console.log('2. Verify Candy Machine is deployed on devnet');
        console.log('3. Check if Collection Mint is correct');
        console.log('4. Ensure Umi SDK is loaded properly');
    }
    
    return {
        wallet: walletAddress,
        candyMachine: candyMachineOk
    };
}

// Export for use in console
window.testCandyMachine = testCandyMachine;
window.testWallet = testWallet;
window.runDiagnostics = runDiagnostics;

console.log('🔧 Diagnostic functions loaded!');
console.log('Run: runDiagnostics() to test everything');
