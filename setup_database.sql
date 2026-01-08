-- ===== إعداد قاعدة البيانات لكلمات كراش =====

-- تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===== جدول المستخدمين =====
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT UNIQUE,
  avatar_url TEXT,
  total_score INTEGER DEFAULT 0,
  current_level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_score ON users(total_score DESC);

-- ===== جدول تقدم المستخدم في المراحل =====
CREATE TABLE IF NOT EXISTS user_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  stars INTEGER DEFAULT 0 CHECK (stars >= 0 AND stars <= 3),
  score INTEGER DEFAULT 0,
  attempts INTEGER DEFAULT 0,
  hints_used INTEGER DEFAULT 0,
  completion_time INTEGER, -- بالثواني
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, level_number)
);

-- فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_progress_user ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_level ON user_progress(level_number);
CREATE INDEX IF NOT EXISTS idx_progress_completed ON user_progress(is_completed);

-- ===== جدول الإنجازات =====
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_achievements_user ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_achievements_id ON user_achievements(achievement_id);

-- ===== جدول الإحصائيات اليومية =====
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  levels_played INTEGER DEFAULT 0,
  levels_completed INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  play_time INTEGER DEFAULT 0, -- بالثواني
  UNIQUE(user_id, date)
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_daily_stats_user ON daily_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- ===== جدول لوحة الصدارة =====
CREATE TABLE IF NOT EXISTS leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  season TEXT NOT NULL, -- مثل "2025-01" للموسم الشهري
  total_score INTEGER DEFAULT 0,
  rank INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, season)
);

-- فهارس
CREATE INDEX IF NOT EXISTS idx_leaderboard_season ON leaderboard(season);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank);

-- ===== تفعيل Row Level Security =====
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;

-- ===== سياسات الأمان للمستخدمين =====

-- المستخدمون يمكنهم قراءة بياناتهم فقط
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- المستخدمون يمكنهم تحديث بياناتهم فقط
CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- إنشاء مستخدم جديد تلقائياً عند التسجيل
CREATE POLICY "Users can insert own data" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ===== سياسات الأمان للتقدم =====

-- المستخدمون يمكنهم قراءة تقدمهم فقط
CREATE POLICY "Users can view own progress" ON user_progress
  FOR SELECT USING (auth.uid() = user_id);

-- المستخدمون يمكنهم إضافة تقدمهم
CREATE POLICY "Users can insert own progress" ON user_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- المستخدمون يمكنهم تحديث تقدمهم
CREATE POLICY "Users can update own progress" ON user_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== سياسات الأمان للإنجازات =====

CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ===== سياسات الأمان للإحصائيات =====

CREATE POLICY "Users can view own stats" ON daily_stats
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own stats" ON daily_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stats" ON daily_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== سياسات الأمان للوحة الصدارة =====

-- الجميع يمكنهم قراءة لوحة الصدارة
CREATE POLICY "Anyone can view leaderboard" ON leaderboard
  FOR SELECT USING (true);

-- المستخدمون يمكنهم تحديث بياناتهم في لوحة الصدارة
CREATE POLICY "Users can update own leaderboard" ON leaderboard
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can modify own leaderboard" ON leaderboard
  FOR UPDATE USING (auth.uid() = user_id);

-- ===== الدوال المساعدة =====

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- تطبيق الدالة على الجداول
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===== دالة لحساب الترتيب في لوحة الصدارة =====
CREATE OR REPLACE FUNCTION update_leaderboard_ranks(season_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE leaderboard
    SET rank = subquery.new_rank
    FROM (
        SELECT 
            id,
            ROW_NUMBER() OVER (ORDER BY total_score DESC) as new_rank
        FROM leaderboard
        WHERE season = season_param
    ) AS subquery
    WHERE leaderboard.id = subquery.id;
END;
$$ LANGUAGE plpgsql;

-- ===== بيانات أولية للاختبار (اختياري) =====

-- إضافة إنجازات نموذجية (يمكن حذف هذا القسم في الإنتاج)
-- سيتم تحميلها من achievements.json

-- ===== إشعارات =====

-- إشعار عند فتح إنجاز جديد
CREATE OR REPLACE FUNCTION notify_achievement_unlocked()
RETURNS TRIGGER AS $$
BEGIN
    PERFORM pg_notify(
        'achievement_unlocked',
        json_build_object(
            'user_id', NEW.user_id,
            'achievement_id', NEW.achievement_id
        )::text
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER achievement_unlocked_trigger
    AFTER INSERT ON user_achievements
    FOR EACH ROW
    EXECUTE FUNCTION notify_achievement_unlocked();

-- ===== نهاية السكريبت =====
-- تم إعداد قاعدة البيانات بنجاح!