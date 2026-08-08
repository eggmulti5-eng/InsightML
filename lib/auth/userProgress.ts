import { SupabaseClient } from "@supabase/supabase-js";

export interface UserProgress {
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_login_date: string; // YYYY-MM-DD format (UTC)
  total_logins: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Returns current UTC date string formatted as YYYY-MM-DD
 */
export function getUTCTodayString(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Computes difference in calendar days (UTC) between two YYYY-MM-DD dates.
 * Returns date2 - date1 in integer days.
 */
export function getUTCDaysDiff(dateStr1: string, dateStr2: string): number {
  const [y1, m1, d1] = dateStr1.split("-").map(Number);
  const [y2, m2, d2] = dateStr2.split("-").map(Number);

  const utc1 = Date.UTC(y1, m1 - 1, d1);
  const utc2 = Date.UTC(y2, m2 - 1, d2);

  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}

/**
 * Syncs user progress and updates daily streak once per login session.
 *
 * Session definition:
 * Uses browser `sessionStorage` (`insightml_session_${userId}_${todayUTC}`) to track if this session
 * has already completed streak processing today.
 * - If new browser session on the same UTC day (`last_login_date == today`): increments `total_logins` by 1.
 * - If consecutive day (`diff == 1`): increments `current_streak` & `total_logins`, updates `longest_streak`.
 * - If 2+ days ago (`diff >= 2`): resets `current_streak` to 1, increments `total_logins`, preserves `longest_streak`.
 */
export async function syncUserProgress(
  supabase: SupabaseClient,
  userId: string
): Promise<UserProgress | null> {
  try {
    const todayStr = getUTCTodayString();
    const sessionKey = `insightml_session_${userId}_${todayStr}`;

    // 1. Fetch existing user progress row
    const { data: existing, error: fetchErr } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (fetchErr && fetchErr.code !== "PGRST116") {
      console.warn("InsightML: Error fetching user_progress", fetchErr);
    }

    // 2. If no row exists: create new row
    if (!existing) {
      const newRow: UserProgress = {
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_login_date: todayStr,
        total_logins: 1,
      };

      const { data: inserted, error: insertErr } = await supabase
        .from("user_progress")
        .insert(newRow)
        .select()
        .single();

      if (insertErr) {
        console.warn("InsightML: Error creating user_progress row", insertErr);
        return newRow;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(sessionKey, "1");
      }

      return inserted || newRow;
    }

    // 3. Row exists: evaluate streak logic
    const lastDateStr: string = existing.last_login_date;
    const diff = getUTCDaysDiff(lastDateStr, todayStr);
    const sessionCounted =
      typeof window !== "undefined" && sessionStorage.getItem(sessionKey) === "1";

    let updatedStreak = existing.current_streak;
    let updatedLongest = existing.longest_streak;
    let updatedLogins = existing.total_logins;
    let updatedDate = existing.last_login_date;
    let needsUpdate = false;

    if (diff === 0) {
      // Same UTC day: do not change streak.
      // If this is a genuinely new browser session today (sessionStorage not set), increment total_logins.
      if (!sessionCounted) {
        updatedLogins = existing.total_logins + 1;
        needsUpdate = true;
      }
    } else if (diff === 1) {
      // Yesterday (consecutive day streak)
      updatedStreak = existing.current_streak + 1;
      updatedLongest = Math.max(existing.longest_streak, updatedStreak);
      updatedLogins = existing.total_logins + 1;
      updatedDate = todayStr;
      needsUpdate = true;
    } else if (diff >= 2) {
      // 2+ days ago: reset streak to 1, preserve longest streak
      updatedStreak = 1;
      updatedLogins = existing.total_logins + 1;
      updatedDate = todayStr;
      needsUpdate = true;
    } else if (diff < 0) {
      // Clock anomaly (last_login_date in future)
      updatedDate = todayStr;
      needsUpdate = true;
    }

    if (needsUpdate) {
      const updates = {
        current_streak: updatedStreak,
        longest_streak: updatedLongest,
        last_login_date: updatedDate,
        total_logins: updatedLogins,
        updated_at: new Date().toISOString(),
      };

      const { data: updated, error: updateErr } = await supabase
        .from("user_progress")
        .update(updates)
        .eq("user_id", userId)
        .select()
        .single();

      if (updateErr) {
        console.warn("InsightML: Error updating user_progress", updateErr);
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem(sessionKey, "1");
      }

      return updated || { ...existing, ...updates };
    }

    // Mark session counted if diff === 0 and already counted
    if (typeof window !== "undefined") {
      sessionStorage.setItem(sessionKey, "1");
    }

    return existing;
  } catch (err) {
    console.warn("InsightML: Failed to sync user progress", err);
    return null;
  }
}
