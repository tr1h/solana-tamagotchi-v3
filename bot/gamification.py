"""
Gamification module for Solana Tamagotchi Bot
Includes: Daily Rewards, Mini-games, Badges, Achievements, Ranks, Quests
"""

import random
from datetime import datetime, timedelta, date
from supabase import Client

# Badge definitions
BADGES = {
    'early_bird': {'name': '🐦 Early Bird', 'desc': 'Joined in first 100 users'},
    'streak_master': {'name': '🔥 Streak Master', 'desc': '30-day login streak'},
    'referral_king': {'name': '👑 Referral King', 'desc': '50+ referrals'},
    'generous': {'name': '💎 Generous', 'desc': '100+ referrals'},
    'gamer': {'name': '🎮 Gamer', 'desc': 'Played 100 mini-games'},
    'lucky': {'name': '🍀 Lucky', 'desc': 'Won spin wheel jackpot'},
    'social': {'name': '👥 Social', 'desc': '5 active referrals'},
    'week_warrior': {'name': '⚔️ Week Warrior', 'desc': '7-day streak'},
}

# Rank definitions
RANKS = {
    'bronze': {'name': '🥉 Bronze', 'min_refs': 0, 'max_refs': 4, 'emoji': '🥉'},
    'silver': {'name': '🥈 Silver', 'min_refs': 5, 'max_refs': 9, 'emoji': '🥈'},
    'gold': {'name': '🥇 Gold', 'min_refs': 10, 'max_refs': 24, 'emoji': '🥇'},
    'platinum': {'name': '💎 Platinum', 'min_refs': 25, 'max_refs': 49, 'emoji': '💎'},
    'legend': {'name': '👑 Legend', 'min_refs': 50, 'max_refs': 999999, 'emoji': '👑'},
}

# Quest definitions
QUESTS = {
    'newbie': {'name': 'Newbie', 'desc': 'Invite 1 friend', 'target': 1, 'reward': 200},
    'active': {'name': 'Active', 'desc': 'Invite 3 friends', 'target': 3, 'reward': 1000},
    'leader': {'name': 'Leader', 'desc': 'Invite 10 friends', 'target': 10, 'reward': 5000},
    'legend': {'name': 'Legend', 'desc': 'Invite 50 friends', 'target': 50, 'reward': 50000},
}

# Achievement definitions
ACHIEVEMENTS = {
    'first_ref': {'name': 'First Referral', 'desc': 'Invite your first friend', 'target': 1, 'reward': 100},
    'referral_5': {'name': 'Collector', 'desc': 'Invite 5 friends', 'target': 5, 'reward': 500},
    'referral_25': {'name': 'Magnate', 'desc': 'Invite 25 friends', 'target': 25, 'reward': 2500},
    'game_10': {'name': 'Player', 'desc': 'Play 10 mini-games', 'target': 10, 'reward': 200},
    'game_50': {'name': 'Pro Gamer', 'desc': 'Play 50 mini-games', 'target': 50, 'reward': 1000},
    'streak_7': {'name': 'Week Streak', 'desc': '7 days streak', 'target': 7, 'reward': 500},
    'streak_30': {'name': 'Month Streak', 'desc': '30 days streak', 'target': 30, 'reward': 3000},
}

# Daily rewards by streak day
DAILY_REWARDS = {
    1: 50,
    2: 100,
    3: 150,
    4: 200,
    5: 250,
    6: 300,
    7: 500,  # Week bonus
    14: 1000,  # 2 weeks
    30: 2000,  # Month bonus
}

def get_daily_reward_amount(streak_days):
    """Calculate daily reward based on streak"""
    if streak_days in DAILY_REWARDS:
        return DAILY_REWARDS[streak_days]
    elif streak_days > 30:
        return 2000 + ((streak_days - 30) * 50)  # +50 TAMA per day after 30
    else:
        return 50 + (streak_days * 10)  # Base + 10 per day


class DailyRewards:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def can_claim(self, telegram_id: str):
        """Check if user can claim daily reward"""
        try:
            result = self.supabase.table('daily_rewards').select('*').eq('telegram_id', telegram_id).execute()
            
            if not result.data:
                return True, 1  # First time claim
            
            last_claim = datetime.fromisoformat(result.data[0]['last_claim'].replace('Z', '+00:00'))
            now = datetime.now()
            
            # Check if 24 hours passed
            if (now - last_claim).total_seconds() >= 24 * 3600:
                # Check if streak continues (claimed yesterday)
                if (now - last_claim).total_seconds() < 48 * 3600:
                    return True, result.data[0]['streak_days'] + 1
                else:
                    return True, 1  # Streak broken, reset
            
            return False, result.data[0]['streak_days']
        except:
            return True, 1
    
    def claim_reward(self, telegram_id: str):
        """Claim daily reward"""
        can_claim, streak_days = self.can_claim(telegram_id)
        
        if not can_claim:
            return False, streak_days, 0
        
        reward_amount = get_daily_reward_amount(streak_days)
        
        try:
            # Update or insert daily_rewards
            result = self.supabase.table('daily_rewards').select('*').eq('telegram_id', telegram_id).execute()
            
            if result.data:
                self.supabase.table('daily_rewards').update({
                    'last_claim': datetime.now().isoformat(),
                    'streak_days': streak_days,
                    'total_claims': result.data[0]['total_claims'] + 1
                }).eq('telegram_id', telegram_id).execute()
            else:
                self.supabase.table('daily_rewards').insert({
                    'telegram_id': telegram_id,
                    'last_claim': datetime.now().isoformat(),
                    'streak_days': streak_days,
                    'total_claims': 1
                }).execute()
            
            # Award TAMA - ensure user exists in leaderboard
            leaderboard = self.supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
            
            if leaderboard.data:
                # User exists - update
                current_tama = leaderboard.data[0].get('tama', 0)
                self.supabase.table('leaderboard').update({
                    'tama': current_tama + reward_amount
                }).eq('telegram_id', telegram_id).execute()
            else:
                # User doesn't exist - create entry
                self.supabase.table('leaderboard').insert({
                    'telegram_id': telegram_id,
                    'wallet_address': f'telegram_{telegram_id}',
                    'tama': reward_amount,
                    'referral_code': None
                }).execute()
            
            return True, streak_days, reward_amount
        except Exception as e:
            print(f"Error claiming daily reward: {e}")
            return False, streak_days, 0
    
    def get_streak(self, telegram_id: str):
        """Get current streak"""
        try:
            result = self.supabase.table('daily_rewards').select('streak_days').eq('telegram_id', telegram_id).execute()
            return result.data[0]['streak_days'] if result.data else 0
        except:
            return 0


class MiniGames:
    def __init__(self, supabase: Client):
        self.supabase = supabase
        self.games_per_day = 3
    
    def can_play(self, telegram_id: str):
        """Check if user can play today"""
        try:
            today = date.today()
            result = self.supabase.table('game_limits').select('games_played').eq('telegram_id', telegram_id).eq('game_date', today.isoformat()).execute()
            
            if not result.data:
                return True, 0
            
            games_played = result.data[0]['games_played']
            return games_played < self.games_per_day, games_played
        except:
            return True, 0
    
    def record_play(self, telegram_id: str):
        """Record game play"""
        try:
            today = date.today()
            result = self.supabase.table('game_limits').select('*').eq('telegram_id', telegram_id).eq('game_date', today.isoformat()).execute()
            
            if result.data:
                self.supabase.table('game_limits').update({
                    'games_played': result.data[0]['games_played'] + 1
                }).eq('telegram_id', telegram_id).eq('game_date', today.isoformat()).execute()
            else:
                self.supabase.table('game_limits').insert({
                    'telegram_id': telegram_id,
                    'game_date': today.isoformat(),
                    'games_played': 1
                }).execute()
        except Exception as e:
            print(f"Error recording game play: {e}")
    
    def play_guess_number(self, telegram_id: str, guess: int):
        """Play guess the number (1-100)"""
        can_play, played = self.can_play(telegram_id)
        if not can_play:
            return False, 0, f"Game limit reached! ({played}/{self.games_per_day})"
        
        target = random.randint(1, 100)
        distance = abs(target - guess)
        
        # Reward based on distance
        if distance == 0:
            reward = 500  # Jackpot!
            result_text = f"🎉 JACKPOT! Perfect guess! Number was {target}"
        elif distance <= 5:
            reward = 200
            result_text = f"🔥 Very close! Number was {target}"
        elif distance <= 10:
            reward = 100
            result_text = f"👍 Close! Number was {target}"
        elif distance <= 20:
            reward = 50
            result_text = f"😊 Not bad! Number was {target}"
        else:
            reward = 25
            result_text = f"😅 Far away... Number was {target}"
        
        # Record and award
        self.record_play(telegram_id)
        self._award_tama(telegram_id, reward)
        self._log_game(telegram_id, 'guess_number', 'win', reward)
        
        return True, reward, result_text
    
    def play_trivia(self, telegram_id: str, answer: str, correct_answer: str):
        """Play Solana trivia"""
        can_play, played = self.can_play(telegram_id)
        if not can_play:
            return False, 0, f"Game limit reached! ({played}/{self.games_per_day})"
        
        if answer.lower() == correct_answer.lower():
            reward = 100
            result_text = "✅ Correct!"
        else:
            reward = 25
            result_text = f"❌ Wrong. Answer: {correct_answer}"
        
        self.record_play(telegram_id)
        self._award_tama(telegram_id, reward)
        self._log_game(telegram_id, 'trivia', 'win' if reward == 100 else 'lose', reward)
        
        return True, reward, result_text
    
    def spin_wheel(self, telegram_id: str):
        """Spin the wheel"""
        can_play, played = self.can_play(telegram_id)
        if not can_play:
            return False, 0, f"Game limit reached! ({played}/{self.games_per_day})"
        
        # Weighted random
        outcomes = [
            (10, 40),   # 40% chance for 10 TAMA
            (25, 25),   # 25% chance for 25 TAMA
            (50, 15),   # 15% chance for 50 TAMA
            (100, 10),  # 10% chance for 100 TAMA
            (250, 7),   # 7% chance for 250 TAMA
            (500, 3),   # 3% chance for 500 TAMA
        ]
        
        total_weight = sum(weight for _, weight in outcomes)
        rand = random.randint(1, total_weight)
        
        current = 0
        reward = 10
        for amount, weight in outcomes:
            current += weight
            if rand <= current:
                reward = amount
                break
        
        self.record_play(telegram_id)
        self._award_tama(telegram_id, reward)
        self._log_game(telegram_id, 'spin_wheel', 'win', reward)
        
        # Check for lucky badge
        if reward == 500:
            self._award_badge(telegram_id, 'lucky')
        
        return True, reward, f"🎰 You won: {reward} TAMA!"
    
    def _award_tama(self, telegram_id: str, amount: int):
        """Award TAMA to user"""
        try:
            result = self.supabase.table('leaderboard').select('*').eq('telegram_id', telegram_id).execute()
            
            if result.data:
                # User exists - update
                current = result.data[0].get('tama', 0)
                self.supabase.table('leaderboard').update({
                    'tama': current + amount
                }).eq('telegram_id', telegram_id).execute()
            else:
                # User doesn't exist - create entry
                self.supabase.table('leaderboard').insert({
                    'telegram_id': telegram_id,
                    'wallet_address': f'telegram_{telegram_id}',
                    'tama': amount,
                    'referral_code': None
                }).execute()
        except Exception as e:
            print(f"Error awarding TAMA: {e}")
    
    def _log_game(self, telegram_id: str, game_type: str, result: str, tama_earned: int):
        """Log game play"""
        try:
            self.supabase.table('game_plays').insert({
                'telegram_id': telegram_id,
                'game_type': game_type,
                'result': result,
                'tama_earned': tama_earned
            }).execute()
        except Exception as e:
            print(f"Error logging game: {e}")
    
    def _award_badge(self, telegram_id: str, badge_id: str):
        """Award badge"""
        try:
            self.supabase.table('user_badges').insert({
                'telegram_id': telegram_id,
                'badge_id': badge_id
            }).execute()
        except:
            pass


class RankSystem:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def get_rank(self, referral_count: int):
        """Get rank based on referral count"""
        for rank_id, rank_data in RANKS.items():
            if rank_data['min_refs'] <= referral_count <= rank_data['max_refs']:
                return rank_id, rank_data
        return 'bronze', RANKS['bronze']
    
    def update_rank(self, telegram_id: str, referral_count: int):
        """Update user rank"""
        rank_id, rank_data = self.get_rank(referral_count)
        
        try:
            result = self.supabase.table('user_ranks').select('*').eq('telegram_id', telegram_id).execute()
            
            if result.data:
                old_rank = result.data[0]['rank_level']
                if old_rank != rank_id:
                    # Rank up!
                    self.supabase.table('user_ranks').update({
                        'rank_level': rank_id,
                        'rank_points': referral_count,
                        'updated_at': datetime.now().isoformat()
                    }).eq('telegram_id', telegram_id).execute()
                    return True, rank_id, rank_data  # Rank changed
            else:
                self.supabase.table('user_ranks').insert({
                    'telegram_id': telegram_id,
                    'rank_level': rank_id,
                    'rank_points': referral_count
                }).execute()
            
            return False, rank_id, rank_data  # No change
        except Exception as e:
            print(f"Error updating rank: {e}")
            return False, rank_id, rank_data
    
    def get_user_rank(self, telegram_id: str):
        """Get user's current rank"""
        try:
            result = self.supabase.table('user_ranks').select('*').eq('telegram_id', telegram_id).execute()
            if result.data:
                rank_id = result.data[0]['rank_level']
                return rank_id, RANKS[rank_id]
            return 'bronze', RANKS['bronze']
        except:
            return 'bronze', RANKS['bronze']


class BadgeSystem:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def award_badge(self, telegram_id: str, badge_id: str):
        """Award badge to user"""
        try:
            self.supabase.table('user_badges').insert({
                'telegram_id': telegram_id,
                'badge_id': badge_id
            }).execute()
            return True
        except:
            return False  # Already has badge
    
    def get_user_badges(self, telegram_id: str):
        """Get all user badges"""
        try:
            result = self.supabase.table('user_badges').select('badge_id').eq('telegram_id', telegram_id).execute()
            return [BADGES[b['badge_id']] for b in result.data if b['badge_id'] in BADGES]
        except:
            return []
    
    def check_and_award_badges(self, telegram_id: str, referral_count: int, streak_days: int, games_played: int):
        """Check and award badges automatically"""
        awarded = []
        
        # Check referral badges
        if referral_count >= 50:
            if self.award_badge(telegram_id, 'referral_king'):
                awarded.append('referral_king')
        if referral_count >= 100:
            if self.award_badge(telegram_id, 'generous'):
                awarded.append('generous')
        
        # Check streak badges
        if streak_days >= 7:
            if self.award_badge(telegram_id, 'week_warrior'):
                awarded.append('week_warrior')
        if streak_days >= 30:
            if self.award_badge(telegram_id, 'streak_master'):
                awarded.append('streak_master')
        
        # Check game badges
        if games_played >= 100:
            if self.award_badge(telegram_id, 'gamer'):
                awarded.append('gamer')
        
        return awarded


class QuestSystem:
    def __init__(self, supabase: Client):
        self.supabase = supabase
    
    def check_quests(self, telegram_id: str, referral_count: int):
        """Check and update quest progress"""
        completed_quests = []
        
        for quest_id, quest_data in QUESTS.items():
            try:
                result = self.supabase.table('user_quests').select('*').eq('telegram_id', telegram_id).eq('quest_id', quest_id).execute()
                
                if not result.data:
                    # Create quest
                    self.supabase.table('user_quests').insert({
                        'telegram_id': telegram_id,
                        'quest_id': quest_id,
                        'progress': referral_count,
                        'completed': referral_count >= quest_data['target']
                    }).execute()
                    
                    if referral_count >= quest_data['target']:
                        completed_quests.append((quest_id, quest_data))
                else:
                    quest = result.data[0]
                    if not quest['completed'] and referral_count >= quest_data['target']:
                        # Complete quest
                        self.supabase.table('user_quests').update({
                            'progress': referral_count,
                            'completed': True,
                            'completed_at': datetime.now().isoformat()
                        }).eq('telegram_id', telegram_id).eq('quest_id', quest_id).execute()
                        
                        completed_quests.append((quest_id, quest_data))
                    else:
                        # Update progress
                        self.supabase.table('user_quests').update({
                            'progress': referral_count
                        }).eq('telegram_id', telegram_id).eq('quest_id', quest_id).execute()
            except Exception as e:
                print(f"Error checking quest {quest_id}: {e}")
        
        return completed_quests
    
    def claim_quest_reward(self, telegram_id: str, quest_id: str):
        """Claim quest reward"""
        try:
            result = self.supabase.table('user_quests').select('*').eq('telegram_id', telegram_id).eq('quest_id', quest_id).execute()
            
            if not result.data:
                return False, 0, "Quest not found"
            
            quest = result.data[0]
            if not quest['completed']:
                return False, 0, "Quest not completed"
            if quest['claimed']:
                return False, 0, "Reward already claimed"
            
            reward = QUESTS[quest_id]['reward']
            
            # Award reward
            leaderboard = self.supabase.table('leaderboard').select('tama').eq('telegram_id', telegram_id).execute()
            current = leaderboard.data[0]['tama'] if leaderboard.data else 0
            
            self.supabase.table('leaderboard').update({
                'tama': current + reward
            }).eq('telegram_id', telegram_id).execute()
            
            # Mark as claimed
            self.supabase.table('user_quests').update({
                'claimed': True
            }).eq('telegram_id', telegram_id).eq('quest_id', quest_id).execute()
            
            return True, reward, f"Claimed {reward} TAMA!"
        except Exception as e:
            print(f"Error claiming quest: {e}")
            return False, 0, "Error claiming reward"

