import AsyncStorage from "@react-native-async-storage/async-storage";

import { supabase } from "./supabase";
import type { Tip, TipCardLayout, TipIcon, TipSection } from "./tips";
import { tips as bundledTips } from "./tips";

const TIPS_CACHE_KEY = "rehabbit_tips_cache";

type RemoteTip = {
  card_style: Partial<Pick<Tip, "accentColor" | "backgroundColor" | "cardLayout" | "foregroundColor" | "icon">>;
  category: Tip["category"];
  content: TipSection[];
  description: string;
  id: string;
  read_time_minutes: number;
  title: string;
};

function toTip(row: RemoteTip): Tip {
  return {
    accentColor: row.card_style.accentColor ?? "#483FFF",
    backgroundColor: row.card_style.backgroundColor ?? "#F8FAFC",
    cardLayout: (row.card_style.cardLayout ?? "offset") as TipCardLayout,
    category: row.category,
    description: row.description,
    foregroundColor: row.card_style.foregroundColor ?? "#1F2430",
    icon: (row.card_style.icon ?? "shape-outline") as TipIcon,
    id: row.id,
    readTime: row.read_time_minutes,
    sections: row.content,
    title: row.title,
  };
}

export async function loadTips(): Promise<Tip[]> {
  const cached = await AsyncStorage.getItem(TIPS_CACHE_KEY);
  const cachedTips = cached ? (JSON.parse(cached) as Tip[]) : [];
  const { data, error } = await supabase
    .from("tips")
    .select("id, category, title, description, content, card_style, read_time_minutes")
    .eq("status", "published")
    .order("display_order");

  if (!error && data && data.length > 0) {
    const remoteTips = (data as RemoteTip[]).map(toTip);
    await AsyncStorage.setItem(TIPS_CACHE_KEY, JSON.stringify(remoteTips));
    return remoteTips;
  }

  return cachedTips.length > 0 ? cachedTips : bundledTips;
}

export async function loadTip(id: string | undefined): Promise<Tip | undefined> {
  if (!id) return undefined;
  return (await loadTips()).find((tip) => tip.id === id);
}
