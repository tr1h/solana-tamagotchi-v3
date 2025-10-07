# 🐾 Solana Tamagotchi

A blockchain-based virtual pet game built on Solana with NFT pets and Play-to-Earn mechanics.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Solana](https://img.shields.io/badge/Solana-Blockchain-purple)
![License](https://img.shields.io/badge/license-MIT-green)

## 🎮 Features

### 🔗 Blockchain Integration
- **Phantom Wallet** integration
- **Solana Web3.js** for blockchain interactions
- Real SOL transactions
- Network detection (Mainnet/Devnet)
- NFT minting (ready for smart contract)

### 🐾 Game Mechanics
- **5 Pet Types**: Cat, Dog, Dragon, Fox, Bear
- **Unique Traits**: Rarity, color, pattern, size, personality, special abilities
- **Care System**: Feed, play, sleep, heal
- **Levels & XP**: Progressive leveling system
- **Evolution**: Pets evolve at levels 10, 20, 30, 40, 50
- **Death & Revival**: Revive pets with SOL or TAMA tokens

### 💰 Economy
- **Play-to-Earn**: Earn TAMA tokens by playing
- **TAMA Tokens**: In-game currency
- **Referral System**: Earn bonuses for inviting friends
- **Leaderboard**: Compete with other players
- **Daily Rewards**: Login bonuses

### 🏆 Achievements
- 15+ unique achievements
- XP and TAMA rewards
- Daily missions
- Special challenges

### 👥 Social Features
- Global leaderboard
- Referral program
- Transaction history
- Player statistics

### 📱 Progressive Web App
- Install as mobile app
- Offline support
- Push notifications
- Background sync

## 🚀 Quick Start

### Prerequisites
- Modern web browser
- [Phantom Wallet](https://phantom.app/) installed
- Some SOL for transactions (Devnet or Mainnet)

### Installation

1. **Clone or Download**
   ```bash
   git clone https://github.com/yourusername/solana-tamagotchi.git
   cd solana-tamagotchi
   ```

2. **Configure Firebase** (Optional)
   - Open `js/database.js`
   - Replace Firebase config with your own:
   ```javascript
   firebaseConfig: {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_PROJECT.firebaseapp.com",
       projectId: "YOUR_PROJECT_ID",
       // ... other config
   }
   ```

3. **Serve Locally**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

4. **Open in Browser**
   ```
   http://localhost:8000
   ```

## 🎯 How to Play

### 1. Connect Wallet
- Click "Connect Wallet" button
- Approve connection in Phantom
- Your wallet address and balance will display

### 2. Create Your Pet
- Click "Create New Pet" (costs 0.1 SOL)
- Choose pet type: Cat, Dog, Dragon, Fox, or Bear
- Give it a name
- Confirm transaction

### 3. Care for Your Pet
- **Feed** 🍔: Restore hunger (costs energy)
- **Play** 🎮: Increase happiness (costs energy)
- **Sleep** 😴: Restore energy
- **Heal** 💊: Restore health (costs 10 TAMA)

### 4. Level Up & Evolve
- Earn XP by caring for your pet
- Level up to increase stats
- Evolve every 10 levels (costs 50 TAMA)
- Max evolution at level 50

### 5. Earn Rewards
- Claim daily rewards (50 TAMA)
- Complete achievements
- Refer friends for bonuses
- Climb the leaderboard

## 💰 Tokenomics

### TAMA Token
- **Earn**: Daily rewards, achievements, referrals
- **Spend**: Healing, evolution, revival
- **Transfer**: Not yet implemented (coming soon)

### SOL Costs
- **Create Pet**: 0.1 SOL
- **Revive Pet**: 0.05 SOL
- **Heal Pet**: 0.01 SOL (or 10 TAMA)

## 🏗️ Architecture

### Frontend
- **HTML5**: Semantic markup
- **CSS3**: Custom animations, responsive design
- **Vanilla JavaScript**: No framework dependencies

### Blockchain
- **Solana Web3.js**: Blockchain interactions
- **Phantom Wallet**: User authentication
- **SPL Token**: For TAMA token (coming soon)

### Storage
- **localStorage**: Offline data persistence
- **Firebase Firestore**: Cloud sync (optional)
- **IndexedDB**: PWA offline storage

### File Structure
```
solana-tamagotchi/
├── index.html              # Main app
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── main.css           # Core styles
│   ├── mobile.css         # Responsive styles
│   └── animations.css     # Animations
├── js/
│   ├── utils.js           # Utility functions
│   ├── wallet.js          # Phantom integration
│   ├── game.js            # Game logic
│   ├── achievements.js    # Achievement system
│   ├── ui.js              # UI manager
│   └── database.js        # Firebase integration
└── assets/                # Images, sounds (optional)
```

## 🔧 Configuration

### Network Selection
Edit `wallet.js`:
```javascript
network: 'devnet', // or 'mainnet-beta'
```

### Firebase Setup
1. Create Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Firestore Database
3. Copy config to `js/database.js`

### Treasury Wallet
For production, replace treasury wallet in `wallet.js`:
```javascript
const treasuryWallet = 'YOUR_WALLET_ADDRESS';
```

## 📊 Game Balance

### Pet Stats
- **Hunger**: Decreases 2/min, restore by feeding
- **Energy**: Decreases 1/min, restore by sleeping
- **Happiness**: Decreases 1/min, restore by playing
- **Health**: Decreases when hunger/happiness < 20

### XP Formula
```javascript
xpForLevel(level) = 100 * (1.5 ^ (level - 1))
```

### Rarity Distribution
- **Common**: 70%
- **Rare**: 20%
- **Epic**: 9%
- **Legendary**: 1%

## 🚀 Deployment

### GitHub Pages
```bash
# Push to GitHub
git add .
git commit -m "Deploy Solana Tamagotchi"
git push origin main

# Enable GitHub Pages in repository settings
```

### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

## 🔐 Security

- Never commit private keys
- Use environment variables for sensitive data
- Validate all user inputs
- Implement rate limiting
- Audit smart contracts before mainnet

## 🐛 Known Issues

1. **Firebase Config**: Default config is placeholder - add your own
2. **Icons**: Using placeholder images - add custom icons
3. **Sounds**: Sound system is prepared but not implemented
4. **Smart Contract**: Not yet deployed - using simulated transactions

## 🛣️ Roadmap

### Version 1.1
- [ ] Deploy SPL token contract
- [ ] NFT minting integration
- [ ] Pet trading marketplace
- [ ] Mini-games

### Version 2.0
- [ ] Multiplayer features
- [ ] Guild system
- [ ] Breeding mechanics
- [ ] Seasonal events

### Version 3.0
- [ ] Mobile native apps
- [ ] AR pet viewing
- [ ] Metaverse integration

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Solana Foundation
- Phantom Wallet team
- Firebase
- Press Start 2P font
- Open source community

## 📞 Support

- **Twitter**: [@SolanaTamagotchi](https://twitter.com/SolanaTamagotchi)
- **Discord**: [Join our server](https://discord.gg/solanatama)
- **Telegram**: [t.me/solanatama](https://t.me/solanatama)
- **Email**: support@solanatama.io

## ⚠️ Disclaimer

This is an educational project. Play responsibly and never invest more than you can afford to lose. Cryptocurrency transactions are irreversible.

---

**Made with ❤️ on Solana** | [Website](https://solanatama.io) | [Docs](https://docs.solanatama.io)

