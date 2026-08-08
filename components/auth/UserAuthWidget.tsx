"use client";

import React, { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { syncUserProgress, UserProgress } from "@/lib/auth/userProgress";

export function UserAuthWidget() {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    // Get current session on load
    client.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        syncUserProgress(client, u.id).then((p) => setProgress(p));
      }
      setLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await syncUserProgress(client, currentUser.id);
        setProgress(p);
      } else {
        setProgress(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleSignIn = async () => {
    if (!supabase) {
      console.warn("Supabase client is not configured.");
      return;
    }
    try {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo:
            typeof window !== "undefined" ? window.location.origin : undefined,
        },
      });
    } catch (err) {
      console.error("InsightML: OAuth sign in error", err);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProgress(null);
    } catch (err) {
      console.error("InsightML: Sign out error", err);
    }
  };

  // If loading or supabase not initialized, show subtle fallback or empty widget
  if (loading) {
    return (
      <div className="flex items-center gap-2 font-pixel text-[9px] text-[#5a9966] opacity-70">
        <span className="inline-block w-2 h-2 rounded-full bg-[#5a9966] animate-pulse" />
      </div>
    );
  }

  // Not logged in (Guest state)
  if (!user) {
    return (
      <button
        onClick={handleSignIn}
        type="button"
        title="Sign in with Google to track your streak"
        className="font-pixel text-[9px] sm:text-[10px] flex items-center gap-2 px-2.5 py-1.5 bg-[#1b3521] hover:bg-[#2a5232] text-[#fefae0] border-2 border-[#386641] shadow-[2px_2px_0px_0px_#050d07] hover:shadow-[3px_3px_0px_0px_#050d07] active:translate-x-[1px] active:translate-y-[1px] transition-all cursor-pointer"
      >
        {/* Pixel Google icon */}
        <svg
          className="w-3.5 h-3.5 flex-shrink-0"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            fill="#EA4335"
          />
        </svg>
        <span>Sign in with Google</span>
      </button>
    );
  }

  // Logged in user state
  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";

  const avatarUrl = user.user_metadata?.avatar_url || user.user_metadata?.picture;

  const currentStreak = progress?.current_streak ?? 1;
  const totalLogins = progress?.total_logins ?? 1;

  return (
    <div className="flex items-center gap-3 bg-[#0d2112] border-2 border-[#2a5c30] px-3 py-1.5 shadow-[2px_2px_0px_0px_#050d07]">
      {/* Avatar & User Name */}
      <div className="flex items-center gap-2">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={userName}
            className="w-5 h-5 rounded-full border border-[#7ecb8a] object-cover"
          />
        ) : (
          <div className="w-5 h-5 rounded-full bg-[#386641] border border-[#7ecb8a] text-[#fefae0] font-pixel text-[8px] flex items-center justify-center">
            {userName.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="font-pixel text-[9px] sm:text-[10px] text-[#e8f0e0] max-w-[90px] sm:max-w-[140px] truncate">
          {userName}
        </span>
      </div>

      {/* Streak badge */}
      <div
        className="font-vt323 text-base sm:text-lg text-[#dda15e] border-l border-[#2a5c30] pl-2.5 flex items-center gap-1"
        title={`Longest streak: ${progress?.longest_streak ?? currentStreak} days`}
      >
        <span className="text-sm">🔥</span>
        <span className="font-pixel text-[9px] text-[#dda15e]">
          {currentStreak}d streak
        </span>
        <span className="text-[#5a9966] text-xs font-vt323 ml-1">
          · {totalLogins} {totalLogins === 1 ? "login" : "logins"}
        </span>
      </div>

      {/* Sign out button */}
      <button
        onClick={handleSignOut}
        type="button"
        title="Sign out"
        className="font-pixel text-[8px] text-[#bc4749] hover:text-[#dda15e] border border-[#6b2123] hover:border-[#dda15e] px-1.5 py-0.5 ml-1 transition-colors cursor-pointer"
      >
        Out
      </button>
    </div>
  );
}
