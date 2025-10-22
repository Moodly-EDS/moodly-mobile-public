-- ============================================
-- MOODLY - Supabase Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. ENUMS
-- ============================================

CREATE TYPE public.mood_level AS ENUM ('very_bad', 'bad', 'okay', 'good', 'very_good');

-- ============================================
-- 2. PROFILES TABLE (extends auth.users)
-- ============================================

CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    username TEXT NOT NULL,
    account_type TEXT NOT NULL DEFAULT 'employee' CHECK (account_type IN ('employee', 'manager', 'superadmin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- ============================================
-- 3. REPORTS TABLE (mood check-ins)
-- ============================================

CREATE TABLE public.reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL,
    mood public.mood_level NOT NULL,
    reasons TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Policies for reports
CREATE POLICY "Users can view their own reports"
    ON public.reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
    ON public.reports FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
    ON public.reports FOR DELETE
    USING (auth.uid() = user_id);

CREATE POLICY "Managers can view all reports"
    ON public.reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid()
            AND account_type IN ('manager', 'superadmin')
        )
    );

-- ============================================
-- 4. INDEXES
-- ============================================

CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_profiles_account_type ON public.profiles(account_type);

CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_date ON public.reports(date);
CREATE INDEX idx_reports_user_date ON public.reports(user_id, date);

-- ============================================
-- 5. FUNCTION - Auto update timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_reports_updated_at
    BEFORE UPDATE ON public.reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
