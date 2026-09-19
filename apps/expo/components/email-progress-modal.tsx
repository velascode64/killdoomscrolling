import { useState } from "react";
import { Alert, Modal, StyleSheet } from "react-native";
import { Button, H3, Input, Paragraph, SizableText, View, YStack } from "tamagui";

import { saveProfileEmail } from "../data/supabase-sync";

export function EmailProgressModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) { Alert.alert("Email no válido", "Escribe un email válido."); return; }
    setSaving(true);
    try { await saveProfileEmail(email); onClose(); } catch { Alert.alert("No se pudo guardar", "Intenta nuevamente."); } finally { setSaving(false); }
  };
  return <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}><View alignItems="center" flex={1} justifyContent="center" padding="$5" style={styles.backdrop}><YStack backgroundColor="white" borderRadius={28} gap="$4" padding="$5" width="100%"><YStack gap="$2"><H3 color="$text11">Guarda tu progreso</H3><Paragraph color="$text10">Agrega tu email para guardar tu progreso y continuar con tus Planes.</Paragraph></YStack><Input autoCapitalize="none" keyboardType="email-address" placeholder="tu@email.com" value={email} onChangeText={setEmail} /><Button backgroundColor="$primary9" color="white" disabled={saving} onPress={() => void save()}>{saving ? "Guardando..." : "Guardar progreso"}</Button><Button chromeless onPress={onClose}><SizableText color="$text10">Ahora no</SizableText></Button></YStack></View></Modal>;
}

const styles = StyleSheet.create({ backdrop: { backgroundColor: "rgba(31, 36, 48, 0.42)" } });
