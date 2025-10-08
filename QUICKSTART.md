# ⚡ Quick Start - Solana Tamagotchi

Get your game running in **5 minutes**!

## 🚀 Steps

### 1. Install Phantom Wallet
- Visit: https://phantom.app/
- Install browser extension
- Create wallet (save seed phrase safely!)
- Switch to **Devnet** in settings

### 2. Get Free SOL (Devnet)
```
https://solfaucet.com/
```
Paste your wallet address → Get 1 SOL

### 3. Run Game Locally

**Option A: Python** (Usually pre-installed)
```bash
cd solana-tamagotchi
python -m http.server 8000
```

**Option B: Node.js**
```bash
cd solana-tamagotchi
npx http-server -p 8000
```

**Option C: PHP**
```bash
cd solana-tamagotchi
php -S localhost:8000
```

### 4. Open Browser
```
http://localhost:8000
```

### 5. Play!
1. Click "Connect Wallet"
2. Approve in Phantom
3. Click "Create New Pet"
4. Choose pet type
5. Name your pet
6. Approve transaction (0.1 SOL)
7. Start playing! 🎮

## 🎯 Game Controls

| Button | Action | Cost |
|--------|--------|------|
| 🍔 Feed | Restore hunger | Energy |
| 🎮 Play | Increase happiness | Energy |
| 😴 Sleep | Restore energy | Free |
| 💊 Heal | Restore health | 10 TAMA |

## 💡 Tips

- **Keep stats above 80** for best XP gain
- **Claim daily rewards** every 24 hours
- **Refer friends** for bonus TAMA
- **Evolve at level 10, 20, 30, 40, 50**
- **Don't let health reach 0** or pet dies!

## 🔧 Optional: Firebase Setup

For leaderboard and cloud sync:

1. Create project: https://console.firebase.google.com/
2. Enable Firestore
3. Copy config to `js/database.js`
4. Deploy security rules

See [SETUP.md](SETUP.md) for details.

## 📱 Install as App

**Desktop**: Click install icon in address bar

**Mobile**: 
- iOS: Safari → Share → Add to Home Screen
- Android: Chrome → Menu → Install App

## 🌐 Deploy to Web

**GitHub Pages** (Easiest):
```bash
git init
git add .
git commit -m "Deploy"
git push origin main
# Enable Pages in repo settings
```

**Netlify** (Best):
```bash
npm install -g netlify-cli
netlify deploy --prod
```

**Vercel**:
```bash
npm install -g vercel
vercel --prod
```

## ⚠️ Important Notes

- **Devnet = Test mode** (free SOL, no value)
- **Mainnet = Real money** (use carefully!)
- **Never share seed phrase**
- **Backup wallet regularly**

## 🆘 Troubleshooting

**Wallet won't connect?**
- Check Phantom is installed
- Refresh page
- Try different browser

**Transaction fails?**
- Check you have enough SOL
- Verify you're on Devnet
- Check console for errors

**Game doesn't load?**
- Clear cache
- Check all files downloaded
- Open browser console (F12)

## 📚 Learn More

- [Full Documentation](README.md)
- [Setup Guide](SETUP.md)
- [Solana Docs](https://docs.solana.com/)
- [Phantom Docs](https://docs.phantom.app/)

## 🎉 Ready to Play!

Your game is now running. Have fun building your pet empire on Solana! 🐾

---

**Need help?** Open an issue or join our Discord!




