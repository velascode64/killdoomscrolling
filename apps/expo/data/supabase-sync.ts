import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Crypto from "expo-crypto";

import type { AndroidRewardPlan } from "./android-reward";
import { supabase } from "./supabase";

const EVENT_QUEUE_KEY = "rehabbit_supabase_event_queue";
const ONBOARDING_QUEUE_KEY = "rehabbit_supabase_onboarding_queue";

type QueuedEvent = {
  eventId: string;
  eventName: string;
  occurredAt: string;
  properties: Record<string, boolean | number | string>;
};

let eventQueueOperation: Promise<void> = Promise.resolve();

async function getUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user.id ?? null;
}

async function readEventQueue(): Promise<QueuedEvent[]> {
  const value = await AsyncStorage.getItem(EVENT_QUEUE_KEY);
  return value ? (JSON.parse(value) as QueuedEvent[]) : [];
}

/** Sends only product events created by Rehabbit, never phone-wide usage history. */
export async function flushProductEvents(): Promise<void> {
  const [userId, events] = await Promise.all([getUserId(), readEventQueue()]);
  if (!userId || events.length === 0) return;

  const { error } = await supabase.from("product_events").upsert(
    events.map((event) => ({
      event_id: event.eventId,
      event_name: event.eventName,
      occurred_at: event.occurredAt,
      properties: event.properties,
      user_id: userId,
    })),
    { ignoreDuplicates: true, onConflict: "user_id,event_id" },
  );
  if (error) throw error;
  await AsyncStorage.removeItem(EVENT_QUEUE_KEY);
}

export async function trackProductEvent(
  eventName: string,
  properties: Record<string, boolean | number | string> = {},
): Promise<void> {
  const operation = eventQueueOperation.then(async () => {
    const events = await readEventQueue();
    events.push({
      eventId: Crypto.randomUUID(),
      eventName,
      occurredAt: new Date().toISOString(),
      properties,
    });
    await AsyncStorage.setItem(EVENT_QUEUE_KEY, JSON.stringify(events));
    await flushProductEvents();
  });
  eventQueueOperation = operation.catch(() => undefined);
  return operation;
}

export async function syncModes(plans: AndroidRewardPlan[]): Promise<void> {
  const userId = await getUserId();
  if (!userId || plans.length === 0) return;

  const { error } = await supabase.from("modes").upsert(
    plans.map((plan) => ({
      category: plan.category,
      client_mode_id: plan.id,
      configuration: plan,
      enabled: plan.enabled,
      name: plan.name,
      user_id: userId,
    })),
    { onConflict: "user_id,client_mode_id" },
  );
  if (error) throw error;
}

export async function syncOnboarding(answers: Record<string, unknown>): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_QUEUE_KEY, JSON.stringify(answers));
  const userId = await getUserId();
  if (!userId) return;

  const completedAt = new Date().toISOString();
  const [{ error: onboardingError }, { error: profileError }] = await Promise.all([
    supabase.from("onboarding_responses").upsert({
      answers,
      completed_at: completedAt,
      user_id: userId,
    }),
    supabase.from("profiles").update({ onboarding_completed_at: completedAt }).eq("id", userId),
  ]);
  if (onboardingError) throw onboardingError;
  if (profileError) throw profileError;
  await AsyncStorage.removeItem(ONBOARDING_QUEUE_KEY);
}

export async function syncPendingOnboarding(): Promise<void> {
  const value = await AsyncStorage.getItem(ONBOARDING_QUEUE_KEY);
  if (!value) return;
  await syncOnboarding(JSON.parse(value) as Record<string, unknown>);
}
