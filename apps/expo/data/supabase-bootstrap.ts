import { Platform } from "react-native";
import { drainPendingIntercepts, getRewardBlockerStatistics } from "expo-app-blocker";

import { loadAndroidRewardPlans } from "./android-reward";
import { supabase } from "./supabase";
import { flushProductEvents, syncModes, syncPendingOnboarding, trackProductEvent } from "./supabase-sync";

/** Creates a device-local anonymous identity and records a minimal app-open event. */
export async function bootstrapSupabase(): Promise<void> {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) throw sessionError;

  const anonymousSignIn = sessionData.session ? null : await supabase.auth.signInAnonymously();
  if (anonymousSignIn?.error) throw anonymousSignIn.error;

  const session = sessionData.session ?? anonymousSignIn?.data.session;
  if (!session) {
    throw new Error("Supabase could not create an anonymous session.");
  }

  const userId = session.user.id;
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "UTC";
  const now = new Date().toISOString();

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({ id: userId, last_opened_at: now, platform: Platform.OS, timezone }, { onConflict: "id" });
  if (profileError) throw profileError;

  await trackProductEvent("app_opened", { platform: Platform.OS });
  const plans = Platform.OS === "android" ? await loadAndroidRewardPlans() : [];
  if (Platform.OS === "android") {
    const intercepts = drainPendingIntercepts();
    if (intercepts.length > 0) {
      const { OverviewStore } = await import("./overview.store");
      await OverviewStore.importNativeIntercepts(intercepts.map((event) => ({ appId: event.packageName ?? event.appName ?? "unknown", timestamp: event.interceptedAt })));
      await Promise.all(intercepts.map((event) => trackProductEvent("block_overlay_shown", { appName: event.appName ?? "unknown", packageName: event.packageName ?? "unknown" })));
    }
    const statistics = getRewardBlockerStatistics();
    await Promise.all(statistics.map((item) => trackProductEvent("reward_statistics_snapshot", {
      blockedAttempts: item.blockedAttempts,
      clientModeId: item.planId,
      productiveSeconds: item.productiveSeconds,
      redirections: item.redirections,
    })));
  }
  await Promise.all([flushProductEvents(), syncModes(plans), syncPendingOnboarding()]);
}
