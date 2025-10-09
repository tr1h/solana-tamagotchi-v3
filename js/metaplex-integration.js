// ============================================
// METAPLEX NFT INTEGRATION
// ============================================

const MetaplexNFT = {
    connection: null,
    wallet: null,
    
    // Candy Machine Config (ИЗ SUGAR CLI)
    CANDY_MACHINE_ID: '3Y82dFzikkzTzEk4vDgvHHeyQwap3M2Z7Zbz4Tj6TbJB', // ✅ Твоя CM
    COLLECTION_MINT: 'EHju5kq2SvPrqFMEYZ8FkXfX3FYPNsFinaQVU6bFtJRT',  // ✅ Твоя коллекция
    CANDY_MACHINE_AUTHORITY: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb', // ✅ Твой authority
    TREASURY_WALLET: 'FHqNWKNyXryz52koqQdWvqxe8zxb4AcaEtD58DneJSb', // ✅ Твой treasury
    
    // Initialize
    init(connection, wallet) {
        this.connection = connection;
        this.wallet = wallet;
        console.log('✅ Metaplex NFT initialized');
    },
    
    /**
     * Минт NFT через Candy Machine v3
     */
    async mintNFT(price) {
        if (!this.connection || !this.wallet) {
            throw new Error('Metaplex not initialized');
        }
        
        console.log('🚀 Starting Candy Machine mint...');
        console.log('💰 Price:', price, 'SOL');
        
        try {
            const walletPublicKey = this.wallet.publicKey;
            
            // Создаем новый mint account для NFT
            const mintKeypair = solanaWeb3.Keypair.generate();
            const mintAddress = mintKeypair.publicKey;
            
            console.log('🔑 Generated NFT Mint Address:', mintAddress.toString());
            
            // Создаем транзакцию минта
            const transaction = new solanaWeb3.Transaction();
            
            // 1. Перевод SOL в Treasury
            const lamports = price * solanaWeb3.LAMPORTS_PER_SOL;
            const treasuryPubkey = new solanaWeb3.PublicKey(this.TREASURY_WALLET);
            
            transaction.add(
                solanaWeb3.SystemProgram.transfer({
                    fromPubkey: walletPublicKey,
                    toPubkey: treasuryPubkey,
                    lamports: lamports
                })
            );
            
            // 2. Создаем Mint Account
            const mintRent = await this.connection.getMinimumBalanceForRentExemption(82);
            
            transaction.add(
                solanaWeb3.SystemProgram.createAccount({
                    fromPubkey: walletPublicKey,
                    newAccountPubkey: mintAddress,
                    lamports: mintRent,
                    space: 82,
                    programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA')
                })
            );
            
            // 3. Инициализируем Mint
            transaction.add(
                this.createInitializeMintInstruction(
                    mintAddress,
                    0, // decimals = 0 для NFT
                    walletPublicKey, // mint authority
                    walletPublicKey  // freeze authority
                )
            );
            
            // 4. Создаем Associated Token Account
            const associatedTokenAddress = await this.getAssociatedTokenAddress(
                mintAddress,
                walletPublicKey
            );
            
            transaction.add(
                this.createAssociatedTokenAccountInstruction(
                    walletPublicKey,
                    associatedTokenAddress,
                    walletPublicKey,
                    mintAddress
                )
            );
            
            // 5. Минтим 1 токен (NFT)
            transaction.add(
                this.createMintToInstruction(
                    mintAddress,
                    associatedTokenAddress,
                    walletPublicKey,
                    1 // amount = 1 для NFT
                )
            );
            
            // Получаем последний blockhash
            const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('finalized');
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = walletPublicKey;
            
            // Подписываем транзакцию mint keypair
            transaction.partialSign(mintKeypair);
            
            // Подписываем кошельком пользователя
            const signedTransaction = await this.wallet.signTransaction(transaction);
            
            // Отправляем транзакцию
            console.log('📤 Sending transaction...');
            const signature = await this.connection.sendRawTransaction(
                signedTransaction.serialize(),
                { skipPreflight: false, maxRetries: 3 }
            );
            
            console.log('📝 Transaction signature:', signature);
            
            // Ждем подтверждения
            console.log('⏳ Waiting for confirmation...');
            await this.connection.confirmTransaction({
                signature,
                blockhash,
                lastValidBlockHeight
            }, 'confirmed');
            
            console.log('✅ NFT minted successfully!');
            
            // Загружаем метадату NFT
            const metadata = await this.loadNFTMetadata(mintAddress.toString());
            
            return {
                success: true,
                mintAddress: mintAddress.toString(),
                signature: signature,
                metadata: metadata
            };
            
        } catch (error) {
            console.error('❌ Mint failed:', error);
            throw error;
        }
    },
    
    /**
     * Загрузка метадаты NFT
     */
    async loadNFTMetadata(mintAddress) {
        try {
            console.log('📥 Loading NFT metadata for:', mintAddress);
            
            // Для демо генерируем рандомную метадату
            // В продакшене нужно загружать с Metaplex Metadata account
            
            const types = ['cat', 'dog', 'dragon', 'fox', 'bear', 'rabbit', 'panda', 'lion', 'unicorn', 'wolf'];
            const emojis = ['😺', '🐶', '🐉', '🦊', '🐻', '🐰', '🐼', '🦁', '🦄', '🐺'];
            const rarities = ['common', 'rare', 'epic', 'legendary'];
            
            const rand = Math.random() * 100;
            let rarity;
            if (rand < 70) rarity = 'common';
            else if (rand < 90) rarity = 'rare';
            else if (rand < 98) rarity = 'epic';
            else rarity = 'legendary';
            
            const typeIndex = Math.floor(Math.random() * types.length);
            
            return {
                name: `Tamagotchi #${mintAddress.slice(0, 4)}`,
                symbol: 'TAMA',
                image: `https://arweave.net/placeholder-${typeIndex}.png`, // TODO: реальный IPFS/Arweave
                description: 'A unique Solana Tamagotchi NFT pet',
                attributes: [
                    { trait_type: 'Type', value: types[typeIndex] },
                    { trait_type: 'Rarity', value: rarity },
                    { trait_type: 'Generation', value: '1' }
                ],
                properties: {
                    files: [{ uri: `${typeIndex}.png`, type: 'image/png' }],
                    category: 'image',
                    creators: [
                        { address: this.TREASURY_WALLET, share: 100 }
                    ]
                },
                // Дополнительные данные для игры
                gameData: {
                    type: types[typeIndex],
                    emoji: emojis[typeIndex],
                    rarity: rarity
                }
            };
        } catch (error) {
            console.error('Failed to load metadata:', error);
            return null;
        }
    },
    
    /**
     * Получить NFT кошелька
     */
    async getWalletNFTs(walletAddress) {
        try {
            console.log('🔍 Getting NFTs for wallet:', walletAddress);
            
            const publicKey = new solanaWeb3.PublicKey(walletAddress);
            
            // Получаем все токены кошелька
            const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
                publicKey,
                { programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
            );
            
            console.log(`📦 Found ${tokenAccounts.value.length} token accounts`);
            
            // Фильтруем NFT (amount = 1, decimals = 0)
            const nfts = tokenAccounts.value
                .filter(ta => {
                    const amount = ta.account.data.parsed.info.tokenAmount;
                    return amount.decimals === 0 && amount.uiAmount === 1;
                })
                .map(ta => ({
                    mint: ta.account.data.parsed.info.mint,
                    tokenAccount: ta.pubkey.toString()
                }));
            
            console.log(`✅ Found ${nfts.length} NFTs`);
            
            return nfts;
        } catch (error) {
            console.error('Error getting wallet NFTs:', error);
            return [];
        }
    },
    
    /**
     * Проверить владение NFT из нашей коллекции
     */
    async checkNFTOwnership(walletAddress) {
        try {
            const nfts = await this.getWalletNFTs(walletAddress);
            
            if (nfts.length === 0) {
                console.log('❌ No NFTs found in wallet');
                return null;
            }
            
            // Проверяем есть ли NFT из нашей коллекции
            // TODO: Добавить проверку collection через Metaplex Metadata
            
            // Пока возвращаем первый NFT как демо
            console.log('✅ NFT found:', nfts[0].mint);
            return nfts[0].mint;
            
        } catch (error) {
            console.error('Error checking NFT ownership:', error);
            return null;
        }
    },
    
    // ============================================
    // HELPER FUNCTIONS (Token Program Instructions)
    // ============================================
    
    createInitializeMintInstruction(mint, decimals, mintAuthority, freezeAuthority) {
        const keys = [
            { pubkey: mint, isSigner: false, isWritable: true },
            { pubkey: solanaWeb3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
        ];
        
        const data = Buffer.alloc(67);
        data.writeUInt8(0, 0); // InitializeMint instruction
        data.writeUInt8(decimals, 1);
        mintAuthority.toBuffer().copy(data, 2);
        data.writeUInt8(1, 34); // Option::Some
        freezeAuthority.toBuffer().copy(data, 35);
        
        return new solanaWeb3.TransactionInstruction({
            keys,
            programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            data
        });
    },
    
    async getAssociatedTokenAddress(mint, owner) {
        const [address] = await solanaWeb3.PublicKey.findProgramAddress(
            [
                owner.toBuffer(),
                new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA').toBuffer(),
                mint.toBuffer()
            ],
            new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL')
        );
        return address;
    },
    
    createAssociatedTokenAccountInstruction(payer, associatedToken, owner, mint) {
        const keys = [
            { pubkey: payer, isSigner: true, isWritable: true },
            { pubkey: associatedToken, isSigner: false, isWritable: true },
            { pubkey: owner, isSigner: false, isWritable: false },
            { pubkey: mint, isSigner: false, isWritable: false },
            { pubkey: solanaWeb3.SystemProgram.programId, isSigner: false, isWritable: false },
            { pubkey: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'), isSigner: false, isWritable: false },
            { pubkey: solanaWeb3.SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false }
        ];
        
        return new solanaWeb3.TransactionInstruction({
            keys,
            programId: new solanaWeb3.PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL'),
            data: Buffer.alloc(0)
        });
    },
    
    createMintToInstruction(mint, destination, authority, amount) {
        const keys = [
            { pubkey: mint, isSigner: false, isWritable: true },
            { pubkey: destination, isSigner: false, isWritable: true },
            { pubkey: authority, isSigner: true, isWritable: false }
        ];
        
        const data = Buffer.alloc(9);
        data.writeUInt8(7, 0); // MintTo instruction
        data.writeBigUInt64LE(BigInt(amount), 1);
        
        return new solanaWeb3.TransactionInstruction({
            keys,
            programId: new solanaWeb3.PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            data
        });
    }
};

// Export
window.MetaplexNFT = MetaplexNFT;

console.log('✅ Metaplex NFT integration loaded');

