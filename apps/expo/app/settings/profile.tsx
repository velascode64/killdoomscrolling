import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "@tamagui/lucide-icons";
import { Button, H3, Input, Paragraph, SizableText, YStack } from "tamagui";

import { Container } from "../../components/container";
import { GenderPicker } from "../../components/gender-picker";
import { getProfile, saveProfile } from "../../data/supabase-sync";

export default function Profile() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [genderOpen, setGenderOpen] = useState(false);
  const [occupation, setOccupation] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getProfile().then((profile) => {
      setFullName(profile.fullName);
      setEmail(profile.email);
      setAge(profile.age === null ? "" : String(profile.age));
      setGender(profile.gender);
      setOccupation(profile.occupation);
    }).catch(() => undefined);
  }, []);

  const save = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedName = fullName.trim();
    if (!normalizedName) {
      Alert.alert("Nombre requerido", "Escribe tu nombre para guardar tu perfil.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      Alert.alert("Email requerido", "Escribe un email válido para guardar tu perfil.");
      return;
    }
    const parsedAge = age.trim() ? Number(age) : null;
    if (parsedAge !== null && (!Number.isInteger(parsedAge) || parsedAge < 13 || parsedAge > 120)) {
      Alert.alert("Edad no válida", "Escribe una edad entre 13 y 120.");
      return;
    }
    setSaving(true);
    try {
      await saveProfile({ fullName: normalizedName, email: normalizedEmail, age: parsedAge, gender, occupation });
      router.replace("/(tabs)/overview");
    } catch {
      Alert.alert("No se pudo guardar", "Intenta nuevamente.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container paddingVertical="$4">
      <YStack gap="$4">
        <Button alignSelf="flex-start" chromeless icon={ArrowLeft} onPress={() => router.back()} paddingHorizontal={0}>
          <SizableText color="$text11">Volver</SizableText>
        </Button>
        <YStack gap="$2">
          <H3 color="$text11">Tu perfil</H3>
          <Paragraph color="$text10">Ayúdanos a entender mejor quién usa Rehabbit.</Paragraph>
        </YStack>
        <Field label="Nombre" value={fullName} onChangeText={setFullName} placeholder="Tu nombre" />
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="tu@email.com" keyboardType="email-address" />
        <Field label="Edad" value={age} onChangeText={setAge} placeholder="Tu edad" keyboardType="number-pad" />
        <GenderPicker value={gender} open={genderOpen} onOpenChange={setGenderOpen} onChange={setGender} />
        <Field label="¿A qué te dedicas?" value={occupation} onChangeText={setOccupation} placeholder="Trabajo, estudio, etc." />
        <Button backgroundColor="$primary9" color="white" disabled={saving} onPress={() => void save()}>{saving ? "Guardando..." : "Guardar"}</Button>
      </YStack>
    </Container>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; placeholder: string; keyboardType?: "number-pad" | "email-address" }) {
  return <YStack gap="$2"><SizableText color="$text11" fontWeight="800">{props.label}</SizableText><Input autoCapitalize={props.keyboardType === "email-address" ? "none" : undefined} keyboardType={props.keyboardType} placeholder={props.placeholder} value={props.value} onChangeText={props.onChangeText} /></YStack>;
}
