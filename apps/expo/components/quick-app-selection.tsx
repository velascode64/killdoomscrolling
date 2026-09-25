import { Check, Search } from "@tamagui/lucide-icons";
import type { AndroidBlockableApp } from "expo-app-blocker";
import { Image } from "react-native";
import { Button, H4, SizableText, View, XStack, YStack } from "tamagui";
import { RECOMMENDED_APPS } from "../data/recommended-apps";
import { AppIcon } from "./app-picker-sheet";

export function QuickAppSelection({ apps, replacement, selectedPackages, onToggle, onMore }: { apps: AndroidBlockableApp[]; replacement: boolean; selectedPackages: string[]; onToggle: (packageName: string) => void; onMore: () => void }) {
  const installed = new Map(apps.map((app) => [app.packageName, app]));
  const items = replacement
    ? RECOMMENDED_APPS.map((item) => ({ name: item.name, packageName: item.packageName, iconUrl: item.iconUrl, app: installed.get(item.packageName) })).sort((a, b) => Number(Boolean(b.app)) - Number(Boolean(a.app)))
    : apps.filter((app) => ["social", "video", "game"].includes(app.category ?? "other")).map((app) => ({ name: app.name, packageName: app.packageName, app }));
  return <YStack gap="$3"><H4 color="$text11">{replacement ? "Apps recomendadas" : "Apps que puedes evitar"}</H4><XStack flexWrap="wrap" gap="$2">{items.map((item) => { const selected = selectedPackages.includes(item.packageName); return <Button key={item.packageName} backgroundColor={selected ? "$primary9" : "white"} borderColor={selected ? "$primary9" : "$borderColor"} borderRadius={16} borderWidth={1} color={selected ? "white" : "$text11"} minHeight={48} onPress={() => onToggle(item.packageName)} paddingHorizontal="$2"><XStack alignItems="center" gap="$2">{item.app ? <AppIcon app={item.app} size={28} /> : <CatalogIcon iconUrl={"iconUrl" in item ? item.iconUrl : ""} /> }<SizableText color={selected ? "white" : "$text11"} numberOfLines={1} size="$3">{item.name}</SizableText>{selected ? <Check size={16} color="white" /> : null}</XStack></Button>; })}</XStack><Button alignSelf="flex-start" backgroundColor="white" borderColor="$borderColor" borderRadius={16} borderWidth={1} color="$text11" icon={Search} onPress={onMore}>Ver más apps</Button></YStack>;
}

function CatalogIcon({ iconUrl }: { iconUrl: string }) {
  return <View backgroundColor="white" borderRadius={14} height={28} overflow="hidden" width={28}><Image source={{ uri: iconUrl }} style={{ height: 28, width: 28 }} /></View>;
}
