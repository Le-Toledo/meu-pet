
import { useCallback, useState } from "react";
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
import { useFocusEffect } from "@react-navigation/native";

import {
  createPetVaccine,
  deletePetVaccine,
  getPetVaccines,
  updatePetVaccine,
  type Vaccine,
} from "../services/vaccineService";

type Props = {
  petId: number;
  onBack: () => void;
};

function toBrazilianDate(value: string | null): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function toApiDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value.trim());
  if (!match) return null;

  const [, day, month, year] = match;
  const date = new Date(
    Date.UTC(Number(year), Number(month) - 1, Number(day)),
  );

  if (
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return null;
  }

  return `${year}-${month}-${day}`;
}

function formatMoney(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function parsePrice(value: string): number | null {
  const normalized = value.trim().replace(/\./g, "").replace(",", ".");
  if (!normalized) return null;

  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed >= 0
    ? Math.round(parsed * 100) / 100
    : null;
}

function getStatus(nextDoseDate: string | null): string {
  if (!nextDoseDate) return "Sem próxima dose";

  const today = new Date();
  const localToday = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  const next = nextDoseDate.slice(0, 10);

  if (next < localToday) return "Atrasada";
  if (next === localToday) return "Dose hoje";
  return "Agendada";
}

function formatDateInput(value: string): string {
  const numbers = value.replace(/\D/g, "").slice(0, 8);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 4) {
    return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
  }

  return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4)}`;
}

export function VaccineScreen({ petId, onBack }: Props) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([]);
  const [name, setName] = useState("");
  const [applicationDate, setApplicationDate] = useState("");
  const [nextDoseDate, setNextDoseDate] = useState("");
  const [price, setPrice] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadVaccines = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPetVaccines(petId);
      setVaccines(data);
    } catch (error) {
      console.error("Erro ao carregar vacinas:", error);
      Alert.alert("Erro", "Não foi possível carregar as vacinas.");
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void loadVaccines();
    }, [loadVaccines]),
  );

  function resetForm() {
    setName("");
    setApplicationDate("");
    setNextDoseDate("");
    setPrice("");
    setEditingId(null);
  }

  async function saveVaccine() {
    const vaccineName = name.trim();
    const applied = toApiDate(applicationDate);
    const next = nextDoseDate.trim()
      ? toApiDate(nextDoseDate)
      : null;

    if (!vaccineName || !applied) {
      Alert.alert(
        "Atenção",
        "Informe o nome e a data da aplicação no formato DD/MM/AAAA.",
      );
      return;
    }

    if (nextDoseDate.trim() && !next) {
      Alert.alert(
        "Atenção",
        "Informe uma data válida para a próxima dose.",
      );
      return;
    }

    const vaccinePrice = parsePrice(price);

    if (price.trim() && vaccinePrice === null) {
      Alert.alert("Atenção", "Informe um valor válido.");
      return;
    }

    try {
      setSaving(true);

      const data = {
        name: vaccineName,
        application_date: applied,
        next_dose_date: next,
        price: vaccinePrice,
      };

      if (editingId !== null) {
        await updatePetVaccine(petId, editingId, data);
      } else {
        await createPetVaccine(petId, data);
      }

      resetForm();
      await loadVaccines();

      Alert.alert("Sucesso", "Vacina salva com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar vacina:", error);
      Alert.alert("Erro", "Não foi possível salvar a vacina.");
    } finally {
      setSaving(false);
    }
  }

  function editVaccine(vaccine: Vaccine) {
    setEditingId(vaccine.id);
    setName(vaccine.name);
    setApplicationDate(toBrazilianDate(vaccine.application_date));
    setNextDoseDate(toBrazilianDate(vaccine.next_dose_date));
    setPrice(
      vaccine.price == null
        ? ""
        : Number(vaccine.price).toFixed(2).replace(".", ","),
    );
  }

  function removeVaccine(vaccine: Vaccine) {
    Alert.alert(
      "Excluir vacina",
      `Deseja excluir ${vaccine.name}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePetVaccine(petId, vaccine.id);
              await loadVaccines();
            } catch (error) {
              console.error("Erro ao excluir vacina:", error);
              Alert.alert(
                "Erro",
                error instanceof Error
                  ? error.message
                  : "Não foi possível excluir a vacina.",
              );
            }
          },
        },
      ],
    );
  }

  function previousPrice(vaccine: Vaccine): number | null {
    const previous = vaccines
      .filter(
        (item) =>
          item.id !== vaccine.id &&
          item.name.trim().toLowerCase() ===
            vaccine.name.trim().toLowerCase() &&
          (
            item.application_date < vaccine.application_date ||
            (
              item.application_date === vaccine.application_date &&
              item.id < vaccine.id
            )
          ) &&
          item.price !== null &&
          item.price !== undefined,
      )
      .sort(
        (a, b) =>
          b.application_date.localeCompare(a.application_date) ||
          b.id - a.id,
      )[0];

    return previous ? Number(previous.price) : null;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={[...vaccines].sort(
          (a, b) =>
            b.application_date.localeCompare(a.application_date) ||
            b.id - a.id,
        )}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Pressable onPress={onBack}>
              <Text style={styles.back}>← Voltar ao perfil</Text>
            </Pressable>

            <Text style={styles.title}>Carteira de vacinação</Text>
            <Text style={styles.subtitle}>
              Acompanhe vacinas, próximas doses e valores pagos.
            </Text>

            <Text style={styles.label}>Nome da vacina</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: V10"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Data da aplicação</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={applicationDate}
              onChangeText={(text) => setApplicationDate(formatDateInput(text))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Próxima dose (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={nextDoseDate}
              onChangeText={(text) => setNextDoseDate(formatDateInput(text))}
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>Valor pago (R$)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 95,50"
              value={price}
              onChangeText={setPrice}
              keyboardType="decimal-pad"
            />

            <Pressable
              style={[styles.button, saving && styles.disabled]}
              onPress={saveVaccine}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Salvando..."
                  : editingId !== null
                    ? "Salvar alterações"
                    : "Registrar vacina"}
              </Text>
            </Pressable>

            {editingId !== null && (
              <Pressable
                style={styles.cancelButton}
                onPress={resetForm}
              >
                <Text style={styles.cancelText}>Cancelar edição</Text>
              </Pressable>
            )}

            <Text style={styles.sectionTitle}>
              Histórico de vacinação
            </Text>

            {loading && <ActivityIndicator size="large" />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              Nenhuma vacina registrada.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const currentPrice =
            item.price == null ? null : Number(item.price);
          const oldPrice = previousPrice(item);

          const difference =
            currentPrice !== null && oldPrice !== null
              ? currentPrice - oldPrice
              : null;

          return (
            <View style={styles.card}>
              <Text style={styles.vaccineName}>{item.name}</Text>

              <Text style={styles.detail}>
                Aplicação: {toBrazilianDate(item.application_date)}
              </Text>

              <Text style={styles.detail}>
                Próxima dose:{" "}
                {item.next_dose_date
                  ? toBrazilianDate(item.next_dose_date)
                  : "Não informada"}
              </Text>

              <Text style={styles.price}>
                Valor pago:{" "}
                {currentPrice === null
                  ? "Não informado"
                  : formatMoney(currentPrice)}
              </Text>

              {difference !== null && (
                <Text style={styles.comparison}>
                  {difference > 0
                    ? `Aumento de ${formatMoney(difference)}`
                    : difference < 0
                      ? `Redução de ${formatMoney(Math.abs(difference))}`
                      : "Mesmo valor da aplicação anterior"}
                </Text>
              )}

              <Text style={styles.status}>
                {getStatus(item.next_dose_date)}
              </Text>

              <View style={styles.actions}>
                <Pressable onPress={() => editVaccine(item)}>
                  <Text style={styles.edit}>Editar</Text>
                </Pressable>

                <Pressable onPress={() => removeVaccine(item)}>
                  <Text style={styles.delete}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  back: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
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
    fontSize: 16,
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
  cancelButton: {
    alignItems: "center",
    padding: 14,
  },
  cancelText: {
    color: "#6B7280",
    fontWeight: "600",
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
  vaccineName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  detail: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginTop: 12,
  },
  comparison: {
    fontSize: 14,
    color: "#2563EB",
    fontWeight: "600",
    marginTop: 8,
  },
  status: {
    color: "#2563EB",
    fontWeight: "700",
    marginTop: 10,
  },
  actions: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
  },
  edit: {
    color: "#2563EB",
    fontWeight: "700",
  },
  delete: {
    color: "#DC2626",
    fontWeight: "700",
  },
});
