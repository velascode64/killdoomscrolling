import { useState } from "react";
import { Alert } from "react-native";
import { Adapt, Button, H3, Input, Paragraph, Select, Sheet, SizableText, YStack } from "tamagui";
import { ChevronDown } from "@tamagui/lucide-icons";

import { Container } from "../../components/container";
import { saveProfile } from "../../data/supabase-sync";

export default function Profile() {
  const [fullName, setFullName] = useState("");
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
      await saveProfile({ fullName, age: parsedAge, gender, occupation });
      Alert.alert("Perfil guardado", "Tus datos fueron actualizados.");
    } catch {
      Alert.alert("No se pudo guardar", "Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <YStack gap="$2">
          <H3 color="$text11">Tu perfil</H3>
          <Paragraph color="$text10">Ayúdanos a entender mejor quién usa Rehabbit.</Paragraph>
        </YStack>
        <Field label="Nombre" value={fullName} onChangeText={setFullName} placeholder="Tu nombre" />
        <Field label="Edad" value={age} onChangeText={setAge} placeholder="Tu edad" keyboardType="number-pad" />
        <YStack gap="$2"><SizableText color="$text11" fontWeight="800">Género</SizableText><Select value={gender} onValueChange={setGender}><Select.Trigger iconAfter={ChevronDown}><Select.Value placeholder="Selecciona una opción" /></Select.Trigger><Adapt platform="touch"><Sheet modal dismissOnSnapToBottom><Sheet.Frame><Sheet.ScrollView><Adapt.Contents /></Sheet.ScrollView></Sheet.Frame><Sheet.Overlay /></Sheet></Adapt><Select.Content><Select.Viewport minWidth={260}><Select.Group>{([["M", "Masculino"], ["F", "Femenino"], ["NA", "Prefiero no decir"]] as const).map(([value, label], index) => <Select.Item index={index} key={value} value={value}><Select.ItemText>{label}</Select.ItemText></Select.Item>)}</Select.Group></Select.Viewport></Select.Content></Select></YStack>
        <Field label="¿A qué te dedicas?" value={occupation} onChangeText={setOccupation} placeholder="Trabajo, estudio, etc." />
        <Button backgroundColor="$primary9" color="white" disabled={saving} onPress={() => void save()}>{saving ? "Guardando..." : "Guardar"}</Button>
      </YStack>
    </Container>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "number-pad" }) {
  return <YStack gap="$2"><SizableText color="$text11" fontWeight="800">{props.label}</SizableText><Input keyboardType={props.keyboardType} placeholder={props.placeholder} value={props.value} onChangeText={props.onChangeText} /></YStack>;
}
