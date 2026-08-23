import { Redirect } from "expo-router";

/** Kept for existing deep links from earlier Android builds. */
export default function AndroidFocusPage() {
  return <Redirect href="/onboarding?mode=create" />;
}
