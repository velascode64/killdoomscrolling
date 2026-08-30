import {
  BedDouble,
  BookOpen,
  Brain,
  Briefcase,
  Dumbbell,
  CircleMinus,
  Heart,
  Music,
  Palette,
  Plus,
  Star,
} from "@tamagui/lucide-icons";
import { useEffect, useState } from "react";
import { Button, H4, Input, Sheet, SizableText, View, XStack, YStack } from "tamagui";

import type { PlanCustomCategory, PlanCustomCategoryIcon } from "../data/android-reward";
import { GradientButton } from "./mode-ui";

export type CategoryIconName = "focus" | "exercise" | "sleep" | "meditation" | "hobby" | "work" | PlanCustomCategoryIcon;

export interface CategoryOption {
  id: string;
  icon: CategoryIconName;
  label: string;
}

const CUSTOM_ICONS: PlanCustomCategoryIcon[] = ["briefcase", "book", "heart", "music", "star"];

export function CategoryGlyph({ icon, color = "$text11", size = 20 }: { icon: CategoryIconName; color?: string; size?: number }) {
  const props = { color, size };
  if (icon === "exercise") return <Dumbbell {...props} />;
  if (icon === "sleep") return <BedDouble {...props} />;
  if (icon === "meditation") return <Brain {...props} />;
  if (icon === "hobby") return <Palette {...props} />;
  if (icon === "work") return <Briefcase {...props} />;
  if (icon === "briefcase") return <Briefcase {...props} />;
  if (icon === "book") return <BookOpen {...props} />;
  if (icon === "heart") return <Heart {...props} />;
  if (icon === "music") return <Music {...props} />;
  if (icon === "star") return <Star {...props} />;
  return <CircleMinus {...props} />;
}

export function CategorySelector({
  options,
  selectedId,
  onAdd,
  onSelect,
}: {
  options: CategoryOption[];
  selectedId: string;
  onAdd: (category: PlanCustomCategory) => void;
  onSelect: (category: CategoryOption) => void;
}) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState<PlanCustomCategoryIcon>("briefcase");
  const canSave = name.trim().length > 0;

  useEffect(() => {
    if (!sheetOpen) return;
    setName("");
    setIcon("briefcase");
  }, [sheetOpen]);

  const saveCategory = () => {
    const label = name.trim();
    if (!label) return;
    onAdd({
      icon,
      id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label,
    });
    setSheetOpen(false);
  };

  return (
    <>
      <YStack gap="$3">
        <XStack alignItems="center" justifyContent="space-between">
          <H4 color="$text11">Categoría</H4>
          <Button
            unstyled
            alignItems="center"
            backgroundColor="rgba(255, 255, 255, 0.72)"
            borderColor="rgba(72, 63, 255, 0.2)"
            borderRadius={99}
            borderWidth={1}
            height={38}
            justifyContent="center"
            pressStyle={{ opacity: 0.72 }}
            width={38}
            onPress={() => setSheetOpen(true)}
          >
            <Plus color="$text11" size={19} />
          </Button>
        </XStack>
        <XStack flexWrap="wrap" gap="$2" width="100%">
          {options.map((option) => (
            <CategoryChip
              key={option.id}
              option={option}
              selected={selectedId === option.id}
              onPress={() => onSelect(option)}
            />
          ))}
        </XStack>
      </YStack>

      <Sheet modal open={sheetOpen} snapPointsMode="fit" onOpenChange={setSheetOpen}>
        <Sheet.Overlay animation="quick" backgroundColor="rgba(33, 27, 32, 0.2)" />
        <Sheet.Frame
          backgroundColor="#F8FAFC"
          borderColor="#E2E8F0"
          borderTopLeftRadius={30}
          borderTopRightRadius={30}
          borderWidth={1}
          padding="$5"
        >
          <Sheet.Handle backgroundColor="$borderColor" marginBottom="$3" />
          <YStack gap="$4">
            <H4 color="$text11" fontSize="$7">Nueva categoría</H4>
            <YStack gap="$2">
              <SizableText color="$text10" fontWeight="700">Nombre</SizableText>
              <Input
                backgroundColor="$background2"
                borderColor="$borderColor"
                borderRadius={18}
                color="$text11"
                placeholder="Nombre de la categoría"
                value={name}
                onChangeText={setName}
              />
            </YStack>
            <YStack gap="$2">
              <SizableText color="$text10" fontWeight="700">Ícono</SizableText>
              <XStack gap="$2">
                {CUSTOM_ICONS.map((option) => {
                  const selected = option === icon;
                  return (
                    <Button
                      key={option}
                      unstyled
                      alignItems="center"
                      backgroundColor={selected ? "$primary9" : "$background2"}
                      borderColor={selected ? "$primary9" : "$borderColor"}
                      borderRadius={16}
                      borderWidth={1}
                      flex={1}
                      height={48}
                      justifyContent="center"
                      pressStyle={{ opacity: 0.72 }}
                      onPress={() => setIcon(option)}
                    >
                      <CategoryGlyph color={selected ? "white" : "$text11"} icon={option} />
                    </Button>
                  );
                })}
              </XStack>
            </YStack>
            <GradientButton disabled={!canSave} onPress={saveCategory}>Guardar</GradientButton>
          </YStack>
        </Sheet.Frame>
      </Sheet>
    </>
  );
}

function CategoryChip({ option, selected, onPress }: { option: CategoryOption; selected: boolean; onPress: () => void }) {
  return (
    <Button
      unstyled
      alignItems="center"
      backgroundColor={selected ? "$primary9" : "rgba(255, 255, 255, 0.72)"}
      borderColor={selected ? "$primary9" : "#E2E8F0"}
      borderRadius={18}
      borderWidth={1}
      flexDirection="row"
      gap="$2"
      height={48}
      paddingHorizontal="$3"
      pressStyle={{ opacity: 0.72 }}
      width="48.5%"
      onPress={onPress}
    >
      <View position="relative"><CategoryGlyph color={selected ? "white" : "$text11"} icon={option.icon} /></View>
      <SizableText color={selected ? "white" : "$text11"} flexShrink={1} fontWeight="800" numberOfLines={1}>
        {option.label}
      </SizableText>
    </Button>
  );
}
