import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { loadAndroidRewardPlans } from "../data/android-reward";
import { hasCompletedOnboarding, markOnboardingCompleted } from "../data/onboarding-state";

export default function IndexPage() {
  const [destination, setDestination] = useState<"/onboarding" | "/overview" | null>(
    Platform.OS === "android" ? null : "/overview",
  );

  useEffect(() => {
    if (Platform.OS !== "android") return;
    void Promise.all([hasCompletedOnboarding(), loadAndroidRewardPlans()])
      .then(async ([completed, plans]) => {
        if (completed || plans.length > 0) {
          if (!completed) await markOnboardingCompleted();
          setDestination("/overview");
          return;
        }
        setDestination("/onboarding");
      })
      .catch(() => setDestination("/onboarding"));
  }, []);

  return destination ? <Redirect href={destination} /> : null;
}
