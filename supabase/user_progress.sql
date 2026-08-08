-- ==============================================================================
-- Supabase Schema for InsightML User Progress & Daily Login Streak Tracking
-- Run this script in your Supabase SQL Editor (https://supabase.com/dashboard)
-- ==============================================================================

-- 1. Create table user_progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 1,
  longest_streak INTEGER NOT NULL DEFAULT 1,
  last_login_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_logins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- 3. Row Level Security Policies

-- Policy: Users can view their own progress row
CREATE POLICY "Users can view their own user_progress" 
ON public.user_progress 
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can insert their own progress row
CREATE POLICY "Users can insert their own user_progress" 
ON public.user_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own progress row
CREATE POLICY "Users can update their own user_progress" 
ON public.user_progress 
FOR UPDATE 
USING (auth.uid() = user_id);
