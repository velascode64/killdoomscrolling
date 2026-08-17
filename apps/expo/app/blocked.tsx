import { Redirect } from "expo-router";

/** Android uses the native OverlayManager locker; this route is retained only for old links. */
export default function BlockedPage() {
  return <Redirect href="/overview" />;
}
