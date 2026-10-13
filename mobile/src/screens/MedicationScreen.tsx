
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
  createPetMedication,
  deletePetMedication,
  getPetMedications,
  updatePetMedication,
  createMedicationDose,
  deleteMedicationDose,
  getMedicationDoses,
  updateMedicationDose,
  type Medication,
  type MedicationDose,
  type MedicationInput,
  type MedicationDoseInput,
} from "../services/medicationService";

type Props = {
  petId: number;
  onBack: () => void;
};

function formatDateInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toApiDate(value: string): string | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
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

function toBrazilianDate(value: string | null): string {
  if (!value) return "";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}

function formatTimeInput(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function validTime(value: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  return (
    match !== null &&
    Number(match[1]) <= 23 &&
    Number(match[2]) <= 59
  );
}

function formatDateTime(value: string): string {
  return `${toBrazilianDate(value)} às ${value.slice(11, 16)}`;
}

function todayBrazilian(): string {
  const now = new Date();
  return [
    String(now.getDate()).padStart(2, "0"),
    String(now.getMonth() + 1).padStart(2, "0"),
    now.getFullYear(),
  ].join("/");
}

function currentTime(): string {
  const now = new Date();
  return [
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join(":");
}

export function MedicationScreen({ petId, onBack }: Props) {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [dosesByMedication, setDosesByMedication] =
    useState<Record<number, MedicationDose[]>>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [editingMedicationId, setEditingMedicationId] =
    useState<number | null>(null);

  const [selectedMedicationId, setSelectedMedicationId] =
    useState<number | null>(null);
  const [doseDate, setDoseDate] = useState(todayBrazilian());
  const [doseTime, setDoseTime] = useState(currentTime());
  const [doseAmount, setDoseAmount] = useState("");
  const [doseNotes, setDoseNotes] = useState("");
  const [editingDoseId, setEditingDoseId] = useState<number | null>(
    null,
  );

  const loadMedications = useCallback(async () => {
    try {
      setLoading(true);

      const items = await getPetMedications(petId);
      const histories = await Promise.all(
        items.map(async (medication) => ({
          id: medication.id,
          doses: await getMedicationDoses(petId, medication.id),
        })),
      );

      const nextHistories: Record<number, MedicationDose[]> = {};

      for (const history of histories) {
        nextHistories[history.id] = history.doses;
      }

      setMedications(items);
      setDosesByMedication(nextHistories);
    } catch (error) {
      console.error("Erro ao carregar medicamentos:", error);
      Alert.alert(
        "Erro",
        "Não foi possível carregar os medicamentos.",
      );
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void loadMedications();
    }, [loadMedications]),
  );

  function resetMedicationForm() {
    setName("");
    setDosage("");
    setFrequency("");
    setStartDate("");
    setEndDate("");
    setEditingMedicationId(null);
  }

  function resetDoseForm() {
    setDoseDate(todayBrazilian());
    setDoseTime(currentTime());
    setDoseAmount("");
    setDoseNotes("");
    setEditingDoseId(null);
  }

  function closeDoseForm() {
    setSelectedMedicationId(null);
    resetDoseForm();
  }

  async function saveMedication() {
    const start = toApiDate(startDate);
    const end = endDate.trim() ? toApiDate(endDate) : null;

    if (
      name.trim().length < 2 ||
      !dosage.trim() ||
      !frequency.trim() ||
      !start
    ) {
      Alert.alert(
        "Atenção",
        "Preencha nome, dosagem, frequência e uma data de início válida.",
      );
      return;
    }

    if (endDate.trim() && !end) {
      Alert.alert("Atenção", "Informe uma data de término válida.");
      return;
    }

    if (end && end < start) {
      Alert.alert(
        "Atenção",
        "A data de término não pode ser anterior ao início.",
      );
      return;
    }

    const data: MedicationInput = {
      name: name.trim(),
      dosage: dosage.trim(),
      frequency: frequency.trim(),
      start_date: start,
      end_date: end,
    };

    try {
      setSaving(true);

      if (editingMedicationId !== null) {
        await updatePetMedication(petId, editingMedicationId, data);
      } else {
        await createPetMedication(petId, data);
      }

      resetMedicationForm();
      await loadMedications();
      Alert.alert("Sucesso", "Medicamento salvo com sucesso!");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar o medicamento.",
      );
    } finally {
      setSaving(false);
    }
  }

  function editMedication(medication: Medication) {
    setEditingMedicationId(medication.id);
    setName(medication.name);
    setDosage(medication.dosage);
    setFrequency(medication.frequency);
    setStartDate(toBrazilianDate(medication.start_date));
    setEndDate(toBrazilianDate(medication.end_date));
  }

  function removeMedication(medication: Medication) {
    Alert.alert(
      "Excluir medicamento",
      `Deseja excluir ${medication.name}? Medicamentos com histórico de doses não podem ser excluídos.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deletePetMedication(petId, medication.id);

              if (selectedMedicationId === medication.id) {
                closeDoseForm();
              }

              if (editingMedicationId === medication.id) {
                resetMedicationForm();
              }

              await loadMedications();
            } catch (error) {
              Alert.alert(
                "Erro",
                error instanceof Error
                  ? error.message
                  : "Não foi possível excluir o medicamento.",
              );
            }
          },
        },
      ],
    );
  }

  function startDoseForm(medication: Medication) {
    if (selectedMedicationId === medication.id) {
      closeDoseForm();
      return;
    }

    resetDoseForm();
    setDoseAmount(medication.dosage);
    setSelectedMedicationId(medication.id);
  }

  async function saveDose() {
    if (selectedMedicationId === null) return;

    const date = toApiDate(doseDate);

    if (!date || !validTime(doseTime) || !doseAmount.trim()) {
      Alert.alert(
        "Atenção",
        "Informe data, horário e dosagem válidos.",
      );
      return;
    }

    const data: MedicationDoseInput = {
      administered_at: `${date}T${doseTime}:00`,
      dosage: doseAmount.trim(),
      notes: doseNotes.trim() || null,
    };

    try {
      setSaving(true);

      if (editingDoseId !== null) {
        await updateMedicationDose(
          petId,
          selectedMedicationId,
          editingDoseId,
          data,
        );
      } else {
        await createMedicationDose(
          petId,
          selectedMedicationId,
          data,
        );
      }

      closeDoseForm();
      await loadMedications();
      Alert.alert("Sucesso", "Dose registrada com sucesso!");
    } catch (error) {
      Alert.alert(
        "Erro",
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a dose.",
      );
    } finally {
      setSaving(false);
    }
  }

  function editDose(medicationId: number, dose: MedicationDose) {
    setSelectedMedicationId(medicationId);
    setEditingDoseId(dose.id);
    setDoseDate(toBrazilianDate(dose.administered_at));
    setDoseTime(dose.administered_at.slice(11, 16));
    setDoseAmount(dose.dosage);
    setDoseNotes(dose.notes ?? "");
  }

  function removeDose(medicationId: number, doseId: number) {
    Alert.alert(
      "Excluir dose",
      "Deseja excluir este registro do histórico?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteMedicationDose(
                petId,
                medicationId,
                doseId,
              );

              if (editingDoseId === doseId) {
                closeDoseForm();
              }

              await loadMedications();
            } catch (error) {
              Alert.alert(
                "Erro",
                error instanceof Error
                  ? error.message
                  : "Não foi possível excluir a dose.",
              );
            }
          },
        },
      ],
    );
  }

  function renderDoseForm() {
    return (
      <View style={styles.doseForm}>
        <Text style={styles.sectionTitle}>
          {editingDoseId !== null
            ? "Editar dose"
            : "Registrar dose administrada"}
        </Text>

        <Text style={styles.label}>Data da administração</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          value={doseDate}
          onChangeText={(value) =>
            setDoseDate(formatDateInput(value))
          }
          keyboardType="number-pad"
          maxLength={10}
        />

        <Text style={styles.label}>Horário</Text>
        <TextInput
          style={styles.input}
          placeholder="HH:MM"
          value={doseTime}
          onChangeText={(value) =>
            setDoseTime(formatTimeInput(value))
          }
          keyboardType="number-pad"
          maxLength={5}
        />

        <Text style={styles.label}>Dosagem administrada</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex.: 1 comprimido"
          value={doseAmount}
          onChangeText={setDoseAmount}
          maxLength={100}
        />

        <Text style={styles.label}>Observações (opcional)</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          placeholder="Ex.: Administrado após alimentação"
          value={doseNotes}
          onChangeText={setDoseNotes}
          multiline
          maxLength={500}
        />

        <Pressable
          style={[styles.button, saving && styles.disabled]}
          onPress={saveDose}
          disabled={saving}
        >
          <Text style={styles.buttonText}>
            {saving
              ? "Salvando..."
              : editingDoseId !== null
                ? "Salvar alterações da dose"
                : "Confirmar administração"}
          </Text>
        </Pressable>

        <Pressable
          style={styles.cancelButton}
          onPress={closeDoseForm}
        >
          <Text style={styles.cancelText}>Cancelar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={medications}
        keyExtractor={(item) => String(item.id)}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View>
            <Pressable onPress={onBack}>
              <Text style={styles.back}>← Voltar ao perfil</Text>
            </Pressable>

            <Text style={styles.title}>💊 Medicamentos</Text>
            <Text style={styles.subtitle}>
              Cadastre tratamentos e acompanhe as doses
              administradas.
            </Text>

            <Text style={styles.sectionTitle}>
              {editingMedicationId !== null
                ? "Editar medicamento"
                : "Cadastrar medicamento"}
            </Text>

            <Text style={styles.label}>Nome do medicamento</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: Medicamento Teste"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />

            <Text style={styles.label}>Dosagem</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: 1 comprimido"
              value={dosage}
              onChangeText={setDosage}
              maxLength={100}
            />

            <Text style={styles.label}>Frequência</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex.: A cada 24 horas"
              value={frequency}
              onChangeText={setFrequency}
              maxLength={100}
            />

            <Text style={styles.label}>Data de início</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={startDate}
              onChangeText={(value) =>
                setStartDate(formatDateInput(value))
              }
              keyboardType="number-pad"
              maxLength={10}
            />

            <Text style={styles.label}>
              Data de término (opcional)
            </Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              value={endDate}
              onChangeText={(value) =>
                setEndDate(formatDateInput(value))
              }
              keyboardType="number-pad"
              maxLength={10}
            />

            <Pressable
              style={[styles.button, saving && styles.disabled]}
              onPress={saveMedication}
              disabled={saving}
            >
              <Text style={styles.buttonText}>
                {saving
                  ? "Salvando..."
                  : editingMedicationId !== null
                    ? "Salvar alterações"
                    : "Cadastrar medicamento"}
              </Text>
            </Pressable>

            {editingMedicationId !== null && (
              <Pressable
                style={styles.cancelButton}
                onPress={resetMedicationForm}
              >
                <Text style={styles.cancelText}>
                  Cancelar edição
                </Text>
              </Pressable>
            )}

            <Text style={styles.sectionTitle}>
              Histórico de medicamentos
            </Text>

            {loading && <ActivityIndicator size="large" />}
          </View>
        }
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.empty}>
              Nenhum medicamento cadastrado.
            </Text>
          ) : null
        }
        renderItem={({ item }) => {
          const doses = dosesByMedication[item.id] ?? [];

          return (
            <View style={styles.card}>
              <Text style={styles.medicationName}>
                {item.name}
              </Text>

              <Text style={styles.detail}>
                Dosagem: {item.dosage}
              </Text>

              <Text style={styles.detail}>
                Frequência: {item.frequency}
              </Text>

              <Text style={styles.detail}>
                Início: {toBrazilianDate(item.start_date)}
              </Text>

              <Text style={styles.detail}>
                Término:{" "}
                {item.end_date
                  ? toBrazilianDate(item.end_date)
                  : "Não informado"}
              </Text>

              <View style={styles.actions}>
                <Pressable onPress={() => editMedication(item)}>
                  <Text style={styles.edit}>Editar</Text>
                </Pressable>

                <Pressable onPress={() => removeMedication(item)}>
                  <Text style={styles.delete}>Excluir</Text>
                </Pressable>
              </View>

              <View style={styles.divider} />

              <Text style={styles.doseTitle}>
                Doses administradas ({doses.length})
              </Text>

              {doses.length === 0 && (
                <Text style={styles.empty}>
                  Nenhuma dose registrada.
                </Text>
              )}

              {doses.map((dose) => (
                <View key={dose.id} style={styles.doseCard}>
                  <Text style={styles.doseDate}>
                    {formatDateTime(dose.administered_at)}
                  </Text>

                  <Text style={styles.detail}>
                    Dosagem: {dose.dosage}
                  </Text>

                  {!!dose.notes && (
                    <Text style={styles.detail}>
                      Observações: {dose.notes}
                    </Text>
                  )}

                  <View style={styles.actions}>
                    <Pressable
                      onPress={() => editDose(item.id, dose)}
                    >
                      <Text style={styles.edit}>Editar dose</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        removeDose(item.id, dose.id)
                      }
                    >
                      <Text style={styles.delete}>Excluir dose</Text>
                    </Pressable>
                  </View>
                </View>
              ))}

              {selectedMedicationId === item.id ? (
                renderDoseForm()
              ) : (
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => startDoseForm(item)}
                >
                  <Text style={styles.secondaryButtonText}>
                    + Registrar dose
                  </Text>
                </Pressable>
              )}
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
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#111827",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 16,
    color: "#111827",
  },
  notesInput: {
    minHeight: 90,
    textAlignVertical: "top",
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
  empty: {
    color: "#6B7280",
    fontSize: 15,
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  medicationName: {
    fontSize: 19,
    fontWeight: "700",
    color: "#111827",
  },
  detail: {
    fontSize: 14,
    color: "#4B5563",
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 24,
    marginTop: 16,
    flexWrap: "wrap",
  },
  edit: {
    color: "#2563EB",
    fontWeight: "700",
  },
  delete: {
    color: "#DC2626",
    fontWeight: "700",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginVertical: 18,
  },
  doseTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  doseCard: {
    backgroundColor: "#F3F6FC",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  doseDate: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#2563EB",
    borderRadius: 12,
    padding: 14,
    alignItems: "center",
    marginTop: 12,
  },
  secondaryButtonText: {
    color: "#2563EB",
    fontSize: 15,
    fontWeight: "700",
  },
  doseForm: {
    marginTop: 12,
  },
});
