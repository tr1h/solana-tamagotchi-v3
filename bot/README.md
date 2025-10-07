# 🤖 Solana Tamagotchi Telegram Bot

Official Telegram bot for Solana Tamagotchi game.

## 🚀 Quick Start

### 1. Install Python
Download Python 3.8+ from https://python.org

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Run Bot
```bash
python bot.py
```

## 📋 Commands

### User Commands:
- `/start` - Welcome message
- `/help` - List of commands
- `/game` - Play the game
- `/mint` - Mint NFT Pet
- `/price` - Current NFT price
- `/players` - Total players
- `/pets` - Total pets created
- `/ref` - Get referral link
- `/stats` - Your referral stats

### Admin Commands:
- `/update_stats` - Update statistics
  - Example: `/update_stats players:100 pets:50`
- `/announce` - Broadcast message
  - Example: `/announce Game is launching soon!`

## ⚙️ Configuration

Edit `bot.py`:
- Add your admin Telegram user ID to `admin_ids` list
- Update `GAME_URL` and `MINT_URL` if needed

## 📊 Stats File

Bot stores statistics in `stats.json`:
```json
{
  "players": 0,
  "pets": 0,
  "price": "0.3 SOL"
}
```

## 🔧 Troubleshooting

**Bot doesn't respond:**
- Check bot token
- Ensure bot is running
- Check internet connection

**Commands don't work:**
- Make sure you set commands in BotFather
- Restart the bot

## 🌐 Deploy to Server

### Using screen (Linux):
```bash
screen -S tamagotchi-bot
python bot.py
# Press Ctrl+A, then D to detach
```

### Using PM2 (Node.js):
```bash
npm install -g pm2
pm2 start bot.py --name tamagotchi-bot --interpreter python3
pm2 save
```

### Using systemd (Linux):
Create `/etc/systemd/system/tamagotchi-bot.service`:
```ini
[Unit]
Description=Solana Tamagotchi Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/python3 /path/to/bot/bot.py
Restart=always

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable tamagotchi-bot
sudo systemctl start tamagotchi-bot
```

## 📝 License

MIT License

