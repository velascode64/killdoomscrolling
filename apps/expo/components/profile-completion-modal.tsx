import { useState } from "react";
import { Alert, Modal, StyleSheet } from "react-native";
import { Adapt, Button, H3, Input, Paragraph, Select, Sheet, SizableText, View, YStack } from "tamagui";
import { Check, ChevronDown, ChevronUp } from "@tamagui/lucide-icons";

import { saveProfile } from "../data/supabase-sync";

export function ProfileCompletionModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [occupation, setOccupation] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    const parsedAge = age.trim() ? Number(age) : null;
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
      Alert.alert("Edad no válida", "Escribe una edad entre 13 y 120.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ age: parsedAge, gender, occupation });
      onClose();
    } catch {
      Alert.alert("No se pudo guardar", "Puedes intentarlo nuevamente desde Ajustes.");
    } finally {
      setSaving(false);
    }
  };

  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <View alignItems="center" flex={1} justifyContent="center" padding="$5" style={styles.backdrop}>
      <YStack backgroundColor="white" borderRadius={28} gap="$4" padding="$5" width="100%">
        <YStack gap="$2"><H3 color="$text11">Completa tu perfil</H3><Paragraph color="$text10">Estos datos son opcionales y nos ayudan a mejorar Rehabbit.</Paragraph></YStack>
        <Input keyboardType="number-pad" placeholder="Edad" value={age} onChangeText={setAge} />
        <Select value={gender} onValueChange={setGender}>
          <Select.Trigger iconAfter={ChevronDown}><Select.Value placeholder="Género" /></Select.Trigger>
          <Adapt platform="touch">
            <Sheet modal dismissOnSnapToBottom>
              <Sheet.Frame><Sheet.ScrollView><Adapt.Contents /></Sheet.ScrollView></Sheet.Frame>
              <Sheet.Overlay animation="lazy" enterStyle={{ opacity: 0 }} exitStyle={{ opacity: 0 }} />
            </Sheet>
          </Adapt>
          <Select.Content>
            <Select.ScrollUpButton alignItems="center" justifyContent="center" height="$3" width="100%"><ChevronUp size={20} /></Select.ScrollUpButton>
            <Select.Viewport minWidth={260}><Select.Group>
              {([["M", "Masculino"], ["F", "Femenino"], ["NA", "Prefiero no decir"]] as const).map(([value, label], index) => <Select.Item index={index} key={value} value={value}><Select.ItemText>{label}</Select.ItemText><Select.ItemIndicator marginLeft="auto"><Check size={16} /></Select.ItemIndicator></Select.Item>)}
            </Select.Group></Select.Viewport>
            <Select.ScrollDownButton alignItems="center" justifyContent="center" height="$3" width="100%"><ChevronDown size={20} /></Select.ScrollDownButton>
          </Select.Content>
        </Select>
        <Input placeholder="¿A qué te dedicas?" value={occupation} onChangeText={setOccupation} />
        <Button backgroundColor="$primary9" color="white" disabled={saving} onPress={() => void save()}>{saving ? "Guardando..." : "Guardar"}</Button>
        <Button chromeless onPress={onClose}><SizableText color="$text10">Ahora no</SizableText></Button>
      </YStack>
    </View>
  </Modal>;
}

const styles = StyleSheet.create({ backdrop: { backgroundColor: "rgba(31, 36, 48, 0.42)" } });
