# 🚀 TAMA TOKEN DEPLOYMENT GUIDE

## 📋 Pre-Deployment Checklist

### ✅ Prerequisites
- [ ] Solana CLI installed and configured
- [ ] Wallet with SOL for deployment (Mainnet ~0.5 SOL)
- [ ] SPL Token CLI installed
- [ ] Test deployment completed on Devnet
- [ ] Tokenomics finalized and reviewed
- [ ] Legal review completed (if applicable)

---

## 🛠️ Deployment Steps

### 1. Install Required Tools

```bash
# Install Solana CLI
sh -c "$(curl -sSfL https://release.solana.com/stable/install)"

# Install SPL Token CLI
cargo install spl-token-cli

# Verify installations
solana --version
spl-token --version
```

### 2. Configure Mainnet

```bash
# Set Solana to Mainnet
solana config set --url https://api.mainnet-beta.solana.com

# Create new keypair for token authority (or use existing)
solana-keygen new -o ~/tama-token-authority.json

# Fund wallet with SOL
# Send at least 0.5 SOL to the address shown by:
solana address -k ~/tama-token-authority.json
```

### 3. Create SPL Token

```bash
# Create token with 9 decimals
spl-token create-token --decimals 9 ~/tama-token-authority.json

# Save the output token address!
# Example: TokenMintAddress: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
```

### 4. Create Token Account

```bash
# Create token account for minting
spl-token create-account <TOKEN_MINT_ADDRESS>

# Verify account created
spl-token accounts
```

### 5. Mint Initial Supply

```bash
# Mint 1 billion tokens (with 9 decimals)
spl-token mint <TOKEN_MINT_ADDRESS> 1000000000

# Verify supply
spl-token supply <TOKEN_MINT_ADDRESS>
```

### 6. Set Token Metadata (Optional but Recommended)

```bash
# Install Metaplex CLI
npm install -g @metaplex-foundation/mpl-token-metadata

# Set token metadata
metaplex token-metadata create \
  --keypair ~/tama-token-authority.json \
  --mint <TOKEN_MINT_ADDRESS> \
  --name "Tamagotchi Token" \
  --symbol "TAMA" \
  --uri "https://yourdomain.com/tama-metadata.json"
```

### 7. Create Metadata JSON

Create file at: `https://yourdomain.com/tama-metadata.json`

```json
{
  "name": "Tamagotchi Token",
  "symbol": "TAMA",
  "description": "The official token of Solana Tamagotchi - Play, Earn & Collect NFT Pets",
  "image": "https://yourdomain.com/tama-logo.png",
  "external_url": "https://yourdomain.com",
  "attributes": [
    {
      "trait_type": "Network",
      "value": "Solana"
    },
    {
      "trait_type": "Type",
      "value": "Gaming Token"
    },
    {
      "trait_type": "Total Supply",
      "value": "1,000,000,000"
    }
  ],
  "properties": {
    "category": "token",
    "creators": [
      {
        "address": "YOUR_WALLET_ADDRESS",
        "share": 100
      }
    ]
  }
}
```

### 8. Distribute Tokens to Wallets

```bash
# Create distribution wallets
# Treasury (30%)
spl-token transfer <TOKEN_MINT_ADDRESS> 300000000 <TREASURY_WALLET> \
  --fund-recipient --allow-unfunded-recipient

# NFT Holders Pool (25%)
spl-token transfer <TOKEN_MINT_ADDRESS> 250000000 <NFT_POOL_WALLET> \
  --fund-recipient --allow-unfunded-recipient

# Liquidity Pool (20%)
spl-token transfer <TOKEN_MINT_ADDRESS> 200000000 <LIQUIDITY_WALLET> \
  --fund-recipient --allow-unfunded-recipient

# Team (15%)
spl-token transfer <TOKEN_MINT_ADDRESS> 150000000 <TEAM_WALLET> \
  --fund-recipient --allow-unfunded-recipient

# Marketing (10%)
spl-token transfer <TOKEN_MINT_ADDRESS> 100000000 <MARKETING_WALLET> \
  --fund-recipient --allow-unfunded-recipient
```

### 9. (Optional) Revoke Mint Authority

⚠️ **WARNING: This is PERMANENT and prevents future minting!**

```bash
# Only do this after distribution is complete!
spl-token authorize <TOKEN_MINT_ADDRESS> mint --disable

# Verify mint authority disabled
spl-token display <TOKEN_MINT_ADDRESS>
```

---

## 🔗 Integration with Game

### 1. Update Token Configuration

Edit `js/tama-token.js`:

```javascript
CONFIG: {
    TOKEN_MINT: 'YOUR_TOKEN_MINT_ADDRESS', // ← Add your token address
    DECIMALS: 9,
    SYMBOL: 'TAMA',
    NAME: 'Tamagotchi Token',
    USE_DATABASE: false, // ← Switch to false
    USE_SPL_TOKEN: true  // ← Switch to true
}
```

### 2. Implement SPL Token Functions

```javascript
// In tama-token.js, implement:

async getSPLBalance(walletAddress) {
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    const publicKey = new PublicKey(walletAddress);
    
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(this.CONFIG.TOKEN_MINT) }
    );
    
    if (tokenAccounts.value.length === 0) return 0;
    
    const balance = tokenAccounts.value[0].account.data.parsed.info.tokenAmount.uiAmount;
    return balance;
}

async transferSPL(walletAddress, amount, reason) {
    // Implement token transfer from treasury
    const connection = new Connection(clusterApiUrl('mainnet-beta'));
    
    // Get or create associated token account
    const recipientTokenAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        treasuryWallet, // Payer
        new PublicKey(this.CONFIG.TOKEN_MINT),
        new PublicKey(walletAddress)
    );
    
    // Transfer tokens
    const signature = await transfer(
        connection,
        treasuryWallet,
        treasuryTokenAccount,
        recipientTokenAccount.address,
        treasuryWallet,
        amount * Math.pow(10, this.CONFIG.DECIMALS)
    );
    
    return signature;
}
```

### 3. Test Integration

```javascript
// Test on Devnet first!
solana config set --url https://api.devnet.solana.com

// Create test token
spl-token create-token --decimals 9

// Test all functions
```

---

## 💧 Create Liquidity Pool

### Using Raydium

1. Go to [Raydium](https://raydium.io/)
2. Connect wallet with TAMA tokens
3. Select "Create Pool"
4. Pair: TAMA/SOL or TAMA/USDC
5. Add initial liquidity (e.g., 200M TAMA + matching SOL/USDC)
6. Set pool fees (typically 0.25%)
7. Confirm transaction

### Using Orca

1. Go to [Orca](https://www.orca.so/)
2. Navigate to "Create Pool"
3. Select TAMA and pair token
4. Add liquidity
5. Set fee tier
6. Confirm

---

## 🔒 Security Best Practices

### Wallet Security
- Use hardware wallet for token authority
- Store recovery phrases offline
- Use multisig for treasury
- Enable 2FA on all services

### Smart Contract Security
- Audit token program
- Test thoroughly on Devnet
- Use well-established SPL token standard
- Monitor for unusual activity

### Operational Security
- Limit team access to critical wallets
- Use time-locked vesting for team tokens
- Set up monitoring alerts
- Document all procedures

---

## 📊 Post-Deployment Monitoring

### Track These Metrics

```bash
# Token supply
spl-token supply <TOKEN_MINT_ADDRESS>

# Holder count
solana-token-list holders <TOKEN_MINT_ADDRESS>

# Transaction volume
# Use Solscan or SolanaFM API
```

### Set Up Alerts
- Large transfers (whale alerts)
- Unusual trading activity
- Treasury balance changes
- Liquidity pool health

---

## 🐛 Troubleshooting

### Issue: Transaction Failed
```bash
# Check wallet balance
solana balance

# Increase compute units
solana transfer --priority-fees 1000
```

### Issue: Token Not Showing
- Add to wallet manually with token address
- Verify on Solscan: `https://solscan.io/token/<TOKEN_ADDRESS>`
- Check if token account exists

### Issue: Can't Transfer Tokens
- Ensure recipient has token account
- Use `--fund-recipient` flag
- Check if token is frozen

---

## 📈 Marketing & Listings

### After Deployment

1. **Update Website**
   - Add token address
   - Update documentation
   - Create "Buy TAMA" page

2. **Submit to Aggregators**
   - CoinGecko
   - CoinMarketCap
   - DexTools
   - DexScreener

3. **Social Announcement**
   - Twitter thread with token address
   - Discord announcement
   - Telegram pinned message
   - Medium/Blog post

4. **Exchange Listings**
   - Apply to CEX listings
   - Provide token info
   - Liquidity proof
   - Community metrics

---

## 📞 Support Resources

- **Solana Docs:** https://docs.solana.com/
- **SPL Token Docs:** https://spl.solana.com/token
- **Metaplex Docs:** https://docs.metaplex.com/
- **Raydium Docs:** https://docs.raydium.io/
- **Solana Discord:** https://discord.gg/solana

---

## ✅ Final Checklist

Before going live:
- [ ] Token deployed and verified
- [ ] Metadata set correctly
- [ ] Initial distribution complete
- [ ] Liquidity pools created
- [ ] Integration tested
- [ ] Security audit complete
- [ ] Monitoring set up
- [ ] Marketing materials ready
- [ ] Community informed
- [ ] Legal compliance checked

---

**Good luck with your token launch! 🚀**

*Remember: Take your time, test everything thoroughly, and engage with your community throughout the process.*


