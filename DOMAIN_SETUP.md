# 🌐 GOTCHIGAME.COM - SETUP GUIDE

## ✅ STATUS: Ready to configure

---

## 📋 STEP-BY-STEP SETUP:

### **STEP 1: Buy Domain (5 min)**

1. Open: https://www.namecheap.com
2. Search: `gotchigame.com`
3. Add to Cart
4. Choose: 1 year ($9-12)
5. **Disable** WhoisGuard (optional)
6. Pay with card

**Alternative registrars:**
- Cloudflare: $8.57/year (cheapest)
- GoDaddy: $12-15/year (popular)

---

### **STEP 2: Configure DNS (5 min)**

In Namecheap panel:

1. **Domain List** → Manage → **Advanced DNS**
2. **Delete** all existing records
3. **Add new records:**

```
Type: A Record
Host: @
Value: 185.199.108.153
TTL: Automatic

Type: A Record  
Host: @
Value: 185.199.109.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.110.153
TTL: Automatic

Type: A Record
Host: @
Value: 185.199.111.153
TTL: Automatic

Type: CNAME Record
Host: www
Value: tr1h.github.io
TTL: Automatic
```

4. **Save All Changes**

---

### **STEP 3: GitHub Pages Setup (2 min)**

1. Open: https://github.com/tr1h/solana-tamagotchi-v3
2. **Settings** → **Pages**
3. **Custom domain:** enter `gotchigame.com`
4. **Save**
5. Wait 10-30 minutes for verification
6. ✅ Enable **Enforce HTTPS** (after domain is verified)

---

### **STEP 4: Verify (wait 30-60 min)**

DNS propagation takes time:

```
Check status: https://dnschecker.org
Enter: gotchigame.com
Wait until all green ✅
```

---

## ⏰ TIMELINE:

```
Purchase domain:      5 minutes
Configure DNS:        5 minutes
DNS propagation:      10-30 minutes
HTTPS certificate:    30-60 minutes
Total time:          ~1-2 hours
```

---

## 🔍 TROUBLESHOOTING:

### **Domain not working?**
1. Check DNS records in Namecheap
2. Wait longer (up to 48 hours max)
3. Clear browser cache

### **HTTPS error?**
1. Wait 30-60 minutes for certificate
2. Try incognito mode
3. Check GitHub Pages settings

### **www not working?**
1. Check CNAME record: www → tr1h.github.io
2. Wait for DNS propagation

---

## ✅ AFTER SETUP:

Your site will be available at:
- ✅ **https://gotchigame.com** ← main
- ✅ **https://www.gotchigame.com** ← redirect
- ✅ Old GitHub Pages also works (backup)

---

## 🎨 BRANDING UPDATE:

### **Everywhere:**
```
🌐 Website: gotchigame.com
🐦 Twitter: @GotchiGame
📱 Telegram: @solana_tamagotchi
💎 Токен: $TAMA
🎮 Brand: Gotchi Game
```

### **Updated files:**
- ✅ `CNAME` - created
- ✅ `bot/bot.py` - links updated
- ✅ Ready to go!

---

## 📝 OPTIONAL: .SOL Domain

Want Web3 domain too?

1. Visit: https://naming.bonfida.org
2. Connect Phantom wallet
3. Search: `gotchigame`
4. Buy for ~$20 (one-time NFT)
5. Use as Web3 identity

---

## 🚀 NEXT STEPS:

After domain is live:

1. **Update Twitter bio** with gotchigame.com
2. **Test all links** on the site
3. **Announce** new domain on social media
4. **Update** any external links

---

## 🎉 DONE!

Your professional domain is ready!

**Contact if issues:** Check GitHub Pages docs
https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site




