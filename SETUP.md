# 🛠️ Setup Guide - Solana Tamagotchi

Complete setup instructions for deploying your Solana Tamagotchi game.

## 📋 Prerequisites

### Required
- ✅ Modern web browser (Chrome, Firefox, Edge, Safari)
- ✅ [Phantom Wallet](https://phantom.app/) browser extension
- ✅ Basic knowledge of HTML/CSS/JavaScript
- ✅ SOL tokens (Devnet for testing, Mainnet for production)

### Optional
- 📱 [Node.js](https://nodejs.org/) (for local development server)
- 🔥 [Firebase Account](https://firebase.google.com/) (for cloud features)
- 🚀 [GitHub Account](https://github.com/) (for deployment)
- 📊 [Netlify](https://netlify.com/) or [Vercel](https://vercel.com/) account (for hosting)

---

## 🚀 Quick Start (5 Minutes)

### 1. Download Files
```bash
# Clone repository
git clone https://github.com/yourusername/solana-tamagotchi.git
cd solana-tamagotchi

# Or download ZIP and extract
```

### 2. Start Local Server
```bash
# Option A: Python (usually pre-installed)
python -m http.server 8000

# Option B: Node.js http-server
npx http-server -p 8000

# Option C: PHP
php -S localhost:8000
```

### 3. Open in Browser
```
http://localhost:8000
```

### 4. Install Phantom Wallet
1. Visit [phantom.app](https://phantom.app/)
2. Install browser extension
3. Create new wallet or import existing
4. **IMPORTANT**: Switch to Devnet for testing
   - Settings → Change Network → Devnet

### 5. Get Free SOL (Devnet Only)
```
Visit: https://solfaucet.com/
Enter your wallet address
Receive 1-2 SOL for testing
```

✅ **You're ready to play!**

---

## 🔥 Firebase Setup (Optional but Recommended)

Firebase enables cloud features: leaderboard, achievements sync, player stats.

### Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `solana-tamagotchi`
4. Disable Google Analytics (optional)
5. Click "Create Project"

### Step 2: Enable Firestore

1. In Firebase Console, go to "Firestore Database"
2. Click "Create Database"
3. Choose "Start in test mode" (we'll secure it later)
4. Select region (closest to your users)
5. Click "Enable"

### Step 3: Get Configuration

1. Go to Project Settings (⚙️ icon)
2. Scroll to "Your apps"
3. Click Web icon (`</>`)
4. Register app: `solana-tamagotchi`
5. Copy the `firebaseConfig` object

### Step 4: Update Code

Open `js/database.js` and replace:

```javascript
firebaseConfig: {
    apiKey: "YOUR_API_KEY_HERE",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "1:123456789:web:abcdef"
}
```

### Step 5: Set Security Rules

In Firestore, go to "Rules" tab:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Players collection
    match /players/{playerId} {
      allow read: if true;
      allow write: if request.auth != null || request.resource.data.wallet == playerId;
      
      match /pets/{petId} {
        allow read: if true;
        allow write: if request.auth != null || get(/databases/$(database)/documents/players/$(playerId)).data.wallet == playerId;
      }
      
      match /achievements/{achievementId} {
        allow read: if true;
        allow write: if request.auth != null;
      }
    }
    
    // Leaderboard (read-only)
    match /leaderboard/{entry} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Transactions
    match /transactions/{txId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

✅ **Firebase is ready!**

---

## 🌐 Deployment Options

### Option 1: GitHub Pages (Free)

**Best for**: Static hosting, easy updates

```bash
# 1. Create GitHub repository
# 2. Push code
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/solana-tamagotchi.git
git push -u origin main

# 3. Enable GitHub Pages
# Repository Settings → Pages → Source: main branch → Save
```

Your game will be at: `https://yourusername.github.io/solana-tamagotchi/`

### Option 2: Netlify (Free + CDN)

**Best for**: Automatic deployments, custom domain

```bash
# 1. Install Netlify CLI
npm install -g netlify-cli

# 2. Deploy
netlify deploy

# Follow prompts:
# - Authorize with GitHub
# - Create new site
# - Publish directory: . (current)

# 3. Deploy to production
netlify deploy --prod
```

**Or use UI**:
1. Visit [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import existing project"
3. Connect GitHub repository
4. Deploy settings: Build command: (none), Publish directory: `.`
5. Click "Deploy"

### Option 3: Vercel (Free + Edge Network)

**Best for**: Performance, serverless functions

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
vercel

# Follow prompts
# 3. Deploy to production
vercel --prod
```

**Or use UI**:
1. Visit [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Connect GitHub repository
4. Click "Deploy"

### Option 4: Firebase Hosting

**Best for**: Integration with Firebase features

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Initialize
firebase init hosting

# Select:
# - Use existing project: solana-tamagotchi
# - Public directory: .
# - Single-page app: No
# - Overwrite index.html: No

# 4. Deploy
firebase deploy --only hosting
```

---

## 🔧 Configuration

### Network Selection

**For Testing (Devnet)**
- Free SOL from faucets
- No real money risk
- Faster transactions

Edit `js/wallet.js`:
```javascript
network: 'devnet'
```

**For Production (Mainnet)**
- Real SOL required
- Production-ready
- Real value

Edit `js/wallet.js`:
```javascript
network: 'mainnet-beta'
```

### Treasury Wallet

**Important**: Change this to YOUR wallet for production!

Edit `js/wallet.js`:
```javascript
const treasuryWallet = 'YOUR_SOLANA_WALLET_ADDRESS';
```

### Game Parameters

Edit `js/game.js` to customize:

```javascript
// Pet stat decay rates (per minute)
statDecayRates: {
    hunger: 2,    // Faster = more challenging
    energy: 1,
    happy: 1
}

// XP requirements
getXPForLevel(level) {
    return 100 * Math.pow(1.5, level - 1); // Adjust difficulty
}

// Costs
costs: {
    createPet: 0.1,    // SOL
    revivePet: 0.05,   // SOL
    healPet: 10        // TAMA
}
```

---

## 🎨 Customization

### Add Your Icons

Replace placeholder icons in `manifest.json`:

```javascript
"icons": [
    {
        "src": "/icons/icon-48.png",   // Add these files
        "sizes": "48x48",
        "type": "image/png"
    },
    // ... other sizes
]
```

Create icons: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512

**Tools**:
- [Favicon Generator](https://realfavicongenerator.net/)
- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)

### Add Sounds

Create `assets/sounds/` directory:
```
assets/sounds/
├── feed.mp3
├── play.mp3
├── sleep.mp3
├── level-up.mp3
└── achievement.mp3
```

Update `js/utils.js`:
```javascript
playSound(soundName) {
    const audio = new Audio(`/assets/sounds/${soundName}.mp3`);
    audio.play();
}
```

### Custom Styling

Edit colors in `css/main.css`:
```css
:root {
    --primary-yellow: #YOUR_COLOR;
    --secondary-green: #YOUR_COLOR;
    --accent-blue: #YOUR_COLOR;
    /* ... */
}
```

---

## 📱 PWA Installation

### Desktop
1. Open game in browser
2. Look for install icon in address bar
3. Click "Install"

### Mobile
1. Open in Safari (iOS) or Chrome (Android)
2. Tap Share button
3. Select "Add to Home Screen"

### Verify PWA

Test your PWA:
```
# Lighthouse audit
1. Open Chrome DevTools
2. Go to Lighthouse tab
3. Select "Progressive Web App"
4. Click "Generate report"

# Or online
https://www.pwabuilder.com/
```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Change Firebase config to your own
- [ ] Update Firestore security rules
- [ ] Set up proper treasury wallet
- [ ] Enable HTTPS (automatic with hosting providers)
- [ ] Add rate limiting for API calls
- [ ] Validate all user inputs
- [ ] Test on Devnet thoroughly
- [ ] Audit smart contracts (if using)
- [ ] Enable error monitoring (Sentry, etc.)
- [ ] Set up analytics (Google Analytics, etc.)

---

## 🧪 Testing

### Manual Testing

1. **Wallet Connection**
   - Connect/disconnect wallet
   - Check balance display
   - Verify network detection

2. **Pet Creation**
   - Create different pet types
   - Verify transaction
   - Check pet traits

3. **Game Actions**
   - Feed, play, sleep, heal
   - Verify stat changes
   - Check XP gain

4. **Achievements**
   - Trigger each achievement
   - Verify rewards
   - Check persistence

5. **Leaderboard**
   - Verify ranking updates
   - Check player count
   - Test referral system

### Browser Testing

Test on:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (iOS/macOS)
- ✅ Mobile browsers

### Performance Testing

```javascript
// Check load time
window.addEventListener('load', () => {
    console.log('Load time:', performance.now());
});

// Monitor FPS
let lastTime = performance.now();
function checkFPS() {
    const now = performance.now();
    const fps = 1000 / (now - lastTime);
    console.log('FPS:', fps);
    lastTime = now;
    requestAnimationFrame(checkFPS);
}
checkFPS();
```

---

## 🐛 Troubleshooting

### Common Issues

**1. Wallet won't connect**
```
Solution:
- Check Phantom is installed
- Try different browser
- Clear cache and cookies
- Check console for errors
```

**2. Firebase errors**
```
Solution:
- Verify config is correct
- Check Firestore is enabled
- Review security rules
- Check network tab for 403/404
```

**3. Game doesn't load**
```
Solution:
- Check console for JS errors
- Verify all files are served
- Check service worker registration
- Clear application cache
```

**4. Transactions fail**
```
Solution:
- Check wallet has enough SOL
- Verify network (Devnet/Mainnet)
- Check RPC endpoint status
- Review transaction logs
```

### Debug Mode

Enable debug logging:

```javascript
// Add to utils.js
const DEBUG = true;

function debugLog(...args) {
    if (DEBUG) console.log('[DEBUG]', ...args);
}
```

---

## 📊 Analytics (Optional)

### Google Analytics

Add to `index.html` before `</head>`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Track Events

```javascript
// Track pet creation
gtag('event', 'create_pet', {
    'pet_type': petType,
    'pet_rarity': rarity
});

// Track level up
gtag('event', 'level_up', {
    'level': newLevel
});
```

---

## 🎯 Next Steps

1. ✅ Deploy to hosting platform
2. 📱 Test on mobile devices
3. 🔗 Share referral links
4. 📣 Promote on social media
5. 👥 Build community
6. 🚀 Add new features

---

## 💡 Tips for Success

1. **Start on Devnet**: Test everything before mainnet
2. **Backup Data**: Export player data regularly
3. **Monitor Costs**: Track SOL spending
4. **Engage Community**: Discord, Twitter, Telegram
5. **Regular Updates**: Add features based on feedback
6. **Security First**: Never compromise on security

---

## 📞 Need Help?

- 📚 [Documentation](https://docs.solanatama.io)
- 💬 [Discord Community](https://discord.gg/solanatama)
- 🐦 [Twitter @SolanaTamagotchi](https://twitter.com/SolanaTamagotchi)
- ✉️ support@solanatama.io

---

**Happy Building! 🚀**









