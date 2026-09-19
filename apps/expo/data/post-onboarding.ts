import AsyncStorage from "@react-native-async-storage/async-storage";

const OPEN_COUNT_KEY = "rehabbit_app_open_count";
const EMAIL_PROMPTED_KEY = "rehabbit_email_prompted";

export async function recordAppOpen(): Promise<number> {
  const count = Number(await AsyncStorage.getItem(OPEN_COUNT_KEY) ?? 0) + 1;
  await AsyncStorage.setItem(OPEN_COUNT_KEY, String(count));
  return count;
}

export async function shouldShowEmailPrompt(): Promise<boolean> {
  const [count, prompted] = await Promise.all([AsyncStorage.getItem(OPEN_COUNT_KEY), AsyncStorage.getItem(EMAIL_PROMPTED_KEY)]);
  return Number(count ?? 0) >= 2 && prompted !== "true";
}

export function markEmailPrompted(): Promise<void> {
  return AsyncStorage.setItem(EMAIL_PROMPTED_KEY, "true");
}
