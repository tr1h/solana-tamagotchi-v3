#!/bin/bash

# 🚀 Solana Tamagotchi - Quick Deploy Script

echo "🎮 Solana Tamagotchi - Deploy Script"
echo "===================================="
echo ""

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git not found. Please install git first."
    exit 1
fi

echo "📋 Checking status..."
git status

echo ""
echo "📦 Staging all changes..."
git add .

echo ""
echo "💬 Creating commit..."
cat GIT_COMMIT_MESSAGE.txt | head -1 | git commit -F -

if [ $? -ne 0 ]; then
    echo "❌ Commit failed. Please check git status."
    exit 1
fi

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ DEPLOY SUCCESSFUL!"
    echo ""
    echo "🌐 Your site will update in 2-3 minutes:"
    echo "   https://tr1h.github.io/solana-tamagotchi-v3"
    echo ""
    echo "📊 Database Viewer:"
    echo "   https://tr1h.github.io/solana-tamagotchi-v3/database-viewer.html"
    echo ""
    echo "⚠️  Don't forget to run database migration:"
    echo "   ALTER TABLE leaderboard ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;"
    echo "   ALTER TABLE nft_mints ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;"
    echo ""
    echo "🎉 Ready to test!"
else
    echo ""
    echo "❌ Push failed. Please check:"
    echo "   1. Git credentials configured"
    echo "   2. Remote repository accessible"
    echo "   3. Internet connection"
fi

