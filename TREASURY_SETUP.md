# 💰 TREASURY WALLET SETUP

## 🎯 РАСПРЕДЕЛЕНИЕ СРЕДСТВ ОТ MINT:

```
100% от mint price
├─ 70% - Команда/Разработка
├─ 15% - Маркетинг & Airdrop
├─ 10% - Liquidity Pool (TAMA/SOL)
└─ 5% - Резервный фонд
```

---

## 📝 ТЕКУЩАЯ НАСТРОЙКА (DEVNET):

### Treasury Wallet (основной):
```
GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump
```

**Статус:** Все средства идут на один кошелек

**Где используется:**
- `js/mint.js` - строка 254

---

## 🚀 ДЛЯ MAINNET - СОЗДАТЬ 4 КОШЕЛЬКА:

### 1. Team Wallet (70%)
```bash
solana-keygen new --outfile team-wallet.json
# Сохрани адрес
```

### 2. Marketing Wallet (15%)
```bash
solana-keygen new --outfile marketing-wallet.json
# Сохрани адрес
```

### 3. Liquidity Pool Wallet (10%)
```bash
solana-keygen new --outfile lp-wallet.json
# Сохрани адрес
```

### 4. Reserve Wallet (5%)
```bash
solana-keygen new --outfile reserve-wallet.json
# Сохрани адрес
```

---

## 🔐 БЕЗОПАСНОСТЬ:

### Вариант 1: Мультисиг (рекомендуется)
Используй [Squads Protocol](https://squads.so/) для мультисиг:

```
Team Wallet = Multisig (2/3 подписей)
- Подпись 1: Разработчик 1
- Подпись 2: Разработчик 2  
- Подпись 3: Разработчик 3
```

### Вариант 2: Простые кошельки
- Храни seed phrases в разных местах
- Используй hardware wallet (Ledger)
- 2FA на всех сервисах

---

## 💻 АВТОМАТИЧЕСКОЕ РАСПРЕДЕЛЕНИЕ:

### Способ 1: Вручную (простой)
После каждого минта вручную переводи средства:

```bash
# 70% на team
solana transfer TEAM_WALLET 0.21 --from treasury-wallet.json

# 15% на marketing
solana transfer MARKETING_WALLET 0.045 --from treasury-wallet.json

# 10% на LP
solana transfer LP_WALLET 0.03 --from treasury-wallet.json

# 5% на reserve
solana transfer RESERVE_WALLET 0.015 --from treasury-wallet.json
```

### Способ 2: Solana Program (продвинутый)
Создай программу на Rust для автораспределения:

```rust
// treasury-splitter/src/lib.rs
use anchor_lang::prelude::*;

#[program]
pub mod treasury_splitter {
    use super::*;
    
    pub fn split_payment(ctx: Context<SplitPayment>) -> Result<()> {
        let amount = ctx.accounts.treasury.lamports();
        
        // 70% team
        **ctx.accounts.team.lamports.borrow_mut() += amount * 70 / 100;
        
        // 15% marketing
        **ctx.accounts.marketing.lamports.borrow_mut() += amount * 15 / 100;
        
        // 10% LP
        **ctx.accounts.lp.lamports.borrow_mut() += amount * 10 / 100;
        
        // 5% reserve
        **ctx.accounts.reserve.lamports.borrow_mut() += amount * 5 / 100;
        
        Ok(())
    }
}
```

### Способ 3: JavaScript (средний)
Создай скрипт для автораспределения:

```javascript
// scripts/distribute-treasury.js
const { Connection, Keypair, Transaction, SystemProgram } = require('@solana/web3.js');
const fs = require('fs');

const WALLETS = {
    team: 'TEAM_WALLET_ADDRESS',
    marketing: 'MARKETING_WALLET_ADDRESS',
    lp: 'LP_WALLET_ADDRESS',
    reserve: 'RESERVE_WALLET_ADDRESS'
};

const DISTRIBUTION = {
    team: 0.70,
    marketing: 0.15,
    lp: 0.10,
    reserve: 0.05
};

async function distributeFunds() {
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    
    // Load treasury wallet
    const treasuryData = JSON.parse(fs.readFileSync('treasury-wallet.json', 'utf8'));
    const treasury = Keypair.fromSecretKey(Uint8Array.from(treasuryData));
    
    // Get balance
    const balance = await connection.getBalance(treasury.publicKey);
    console.log(`Treasury balance: ${balance / 1e9} SOL`);
    
    // Create transaction
    const transaction = new Transaction();
    
    for (const [key, percentage] of Object.entries(DISTRIBUTION)) {
        const amount = Math.floor(balance * percentage);
        
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: treasury.publicKey,
                toPubkey: new PublicKey(WALLETS[key]),
                lamports: amount
            })
        );
        
        console.log(`Sending ${amount / 1e9} SOL to ${key}`);
    }
    
    // Send transaction
    const signature = await connection.sendTransaction(transaction, [treasury]);
    await connection.confirmTransaction(signature);
    
    console.log('Distribution complete!', signature);
}

distributeFunds().catch(console.error);
```

**Запуск:**
```bash
node scripts/distribute-treasury.js
```

---

## 📊 ОТЧЕТНОСТЬ:

### Публичная прозрачность:
1. **Twitter** - раз в месяц постить отчет
2. **Dashboard** - создать публичную страницу с балансами
3. **Discord** - канал #treasury-reports

### Пример отчета:
```
💰 Monthly Treasury Report - January 2025

Total Mints: 500 NFTs
Total Revenue: 250 SOL ($37,500)

Distribution:
├─ Team (70%): 175 SOL → Development, Servers
├─ Marketing (15%): 37.5 SOL → Ads, Partnerships
├─ LP (10%): 25 SOL → TAMA/SOL Liquidity
└─ Reserve (5%): 12.5 SOL → Emergency Fund

Current Balances:
- Team Wallet: 50 SOL
- Marketing Wallet: 10 SOL
- LP Wallet: 25 SOL
- Reserve Wallet: 12.5 SOL

Total: 97.5 SOL
```

---

## 🛠️ ОБНОВЛЕНИЕ MINT.JS ДЛЯ MAINNET:

```javascript
// js/mint.js
// Замени:
const treasuryWallet = 'GXvKWk8VierD1H6VXzQz7GxZBMZUxXKqvmHkBRGdPump';

// На:
const TREASURY_WALLETS = {
    team: 'TEAM_WALLET_ADDRESS',      // 70%
    marketing: 'MARKETING_WALLET',     // 15%
    lp: 'LP_WALLET_ADDRESS',          // 10%
    reserve: 'RESERVE_WALLET_ADDRESS'  // 5%
};

// В mintNFT():
const price = this.getCurrentPrice();
const lamports = price * solanaWeb3.LAMPORTS_PER_SOL;

// Create multiple transfers
const transaction = new solanaWeb3.Transaction();

// 70% to team
transaction.add(
    solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.publicKey,
        toPubkey: new solanaWeb3.PublicKey(TREASURY_WALLETS.team),
        lamports: Math.floor(lamports * 0.70)
    })
);

// 15% to marketing
transaction.add(
    solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.publicKey,
        toPubkey: new solanaWeb3.PublicKey(TREASURY_WALLETS.marketing),
        lamports: Math.floor(lamports * 0.15)
    })
);

// 10% to LP
transaction.add(
    solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.publicKey,
        toPubkey: new solanaWeb3.PublicKey(TREASURY_WALLETS.lp),
        lamports: Math.floor(lamports * 0.10)
    })
);

// 5% to reserve
transaction.add(
    solanaWeb3.SystemProgram.transfer({
        fromPubkey: this.publicKey,
        toPubkey: new solanaWeb3.PublicKey(TREASURY_WALLETS.reserve),
        lamports: Math.floor(lamports * 0.05)
    })
);
```

---

## ✅ ЧЕКЛИСТ ДЛЯ MAINNET:

### Перед запуском:
- [ ] Создать 4 кошелька
- [ ] Настроить мультисиг на team wallet
- [ ] Протестировать распределение на devnet
- [ ] Обновить mint.js с новыми адресами
- [ ] Создать скрипт для автораспределения
- [ ] Настроить мониторинг балансов

### После запуска:
- [ ] Проверить первый минт
- [ ] Убедиться что распределение работает
- [ ] Опубликовать treasury адреса
- [ ] Настроить ежемесячные отчеты

---

## 🔗 ПОЛЕЗНЫЕ ССЫЛКИ:

- **Squads (Multisig):** https://squads.so/
- **Solana Explorer:** https://explorer.solana.com/
- **Treasury Dashboard:** https://www.step.finance/ (для мониторинга)

---

**ВАЖНО:** Для devnet оставь как есть (один кошелек). Для mainnet - следуй этой инструкции!




