#!/bin/bash

# Railway Deploy Script
echo "🚀 Deploying Solana Tamagotchi Bot to Railway..."

# Install Railway CLI if not installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Login to Railway
echo "🔐 Logging in to Railway..."
railway login

# Initialize Railway project
echo "🏗️ Initializing Railway project..."
railway init

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set TOKEN=8278463878:AAH590EtqekSpfoE_uJwaNQ-qKACFyt8eaw
railway variables set SUPABASE_URL=https://zfrazyupameidxpjihrh.supabase.co
railway variables set SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpmcmF6eXVwYW1laWR4cGppaHJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5Mzc1NTAsImV4cCI6MjA3NTUxMzU1MH0.1EkMDqCNJoAjcJDh3Dd3yPfus-JpdcwE--z2dhjh7wU

# Deploy
echo "🚀 Deploying to Railway..."
railway up

echo "✅ Bot deployed to Railway!"
echo "🔗 Check your Railway dashboard for logs and status"
