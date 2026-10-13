import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  createPetWeight,
  getPetWeights,
  PetWeight,
} from "../services/weightService";

import { WeightChart } from "../components/TempChart";

type Props = {
  petId: number;
  onBack: () => void;
};

export function WeightScreen({ petId, onBack }: Props) {
  const [weights, setWeights] = useState<PetWeight[]>([]);
  const [weight, setWeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadWeights();
  }, [petId]);

  async function loadWeights() {
    try {
      setLoading(true);
      const data = await getPetWeights(petId);
      setWeights(data);
    } catch (error) {
      console.log("Erro ao carregar pesos:", error);
      Alert.alert("Erro", "Não foi possível carregar o histórico.");
    } finally {
      setLoading(false);
    }
  }

  async function saveWeight() {
    const value = Number(weight.replace(",", "."));

    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert("Atenção", "Informe um peso válido.");
      return;
    }

    try {
      setSaving(true);

      const today = new Date();
      const localDate = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
      ].join("-");

      await createPetWeight(petId, value, localDate);

      setWeight("");
      await loadWeights();

      Alert.alert("Sucesso", "Peso registrado com sucesso!");
    } catch (error) {
      console.log("Erro ao salvar peso:", error);
      Alert.alert("Erro", "Não foi possível registrar o peso.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={onBack}>
        <Text style={styles.back}>← Voltar ao perfil</Text>
      </Pressable>

      <Text style={styles.title}>Controle de peso</Text>
      <Text style={styles.subtitle}>
        Registre e acompanhe a evolução do peso.
      </Text>

      <Text style={styles.label}>Novo peso (kg)</Text>

      <TextInput
        style={styles.input}
        placeholder="Ex.: 4,9"
        keyboardType="decimal-pad"
        value={weight}
        onChangeText={setWeight}
      />

      <Pressable
        style={[styles.button, saving && styles.disabled]}
        onPress={saveWeight}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? "Salvando..." : "Registrar peso"}
        </Text>
      </Pressable>


      
      {!loading && <WeightChart weights={weights} />}
      <Text style={styles.sectionTitle}>Histórico</Text>

      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <FlatList
          data={[...weights].sort((a, b) =>
            b.recorded_at.localeCompare(a.recorded_at),
          )}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Nenhum peso registrado.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Text style={styles.cardWeight}>
                {item.weight} kg
              </Text>
              <Text style={styles.cardDate}>
                {item.recorded_at}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#111827",
  },
  subtitle: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    marginBottom: 28,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  disabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginTop: 32,
    marginBottom: 16,
    color: "#111827",
  },
  empty: {
    color: "#6B7280",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardWeight: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  cardDate: {
    color: "#6B7280",
    marginTop: 6,
  },
});