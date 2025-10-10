-- Migration: Add nft_mint_address column
-- Run this in Supabase SQL Editor if tables already exist

-- Add nft_mint_address to leaderboard
ALTER TABLE public.leaderboard 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT;

-- Add nft_mint_address to nft_mints
ALTER TABLE public.nft_mints 
ADD COLUMN IF NOT EXISTS nft_mint_address TEXT UNIQUE;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_leaderboard_nft_mint ON public.leaderboard (nft_mint_address);
CREATE INDEX IF NOT EXISTS idx_nft_mints_mint_address ON public.nft_mints (nft_mint_address);

-- Done!
-- Now NFT mint addresses will be saved in the database


