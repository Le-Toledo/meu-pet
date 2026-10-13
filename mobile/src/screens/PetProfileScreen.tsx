
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as ImagePicker from "expo-image-picker";

import {
  getPetSummary,
  uploadPetPhoto,
} from "../services/petService";

import { RootStackParamList } from "../types/navigation";
import { PetSummary } from "../types/petSummary";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "PetProfile"
>;

export function PetProfileScreen({
  route,
  navigation,
}: Props) {
  const { petId } = route.params;

  const [pet, setPet] = useState<PetSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Atualiza o perfil sempre que a tela recebe foco.
  const loadPet = useCallback(async () => {
    try {
      setLoading(true);
      setError(false);

      const data = await getPetSummary(petId);
      setPet(data);
    } catch (err) {
      console.log("Erro ao carregar pet:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [petId]);

  useFocusEffect(
    useCallback(() => {
      void loadPet();
    }, [loadPet]),
  );

  async function choosePhoto() {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      alert("Precisamos de permissão para acessar suas fotos.");
      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

    if (result.canceled) {
      return;
    }

    try {
      setUploadingPhoto(true);

      const photo = result.assets[0];

      const mimeType = photo.mimeType ?? "image/jpeg";
      const fileName = photo.fileName ?? "pet-photo.jpg";

      console.log("URI:", photo.uri);
      console.log("MIME:", mimeType);
      console.log("Arquivo:", fileName);

      await uploadPetPhoto(
        petId,
        photo.uri,
        mimeType,
        fileName,
      );

      await loadPet();

      alert("Foto atualizada com sucesso!");
    } catch (err) {
      console.log("Erro ao atualizar foto:", err);
      alert("Não foi possível atualizar a foto.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando perfil...
        </Text>
      </View>
    );
  }

  if (error || !pet) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Não foi possível carregar o pet.
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={() => void loadPet()}
        >
          <Text style={styles.retryButtonText}>
            Tentar novamente
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {/* VOLTAR */}

      <Pressable
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Text style={styles.backButtonText}>
          ← Voltar
        </Text>
      </Pressable>

      {/* INFORMAÇÕES DO PET */}

      <Text style={styles.name}>
        {pet.name}
      </Text>

      <Text style={styles.description}>
        {pet.species}
        {pet.breed ? ` • ${pet.breed}` : ""}
      </Text>

      {/* FOTO */}

      <Pressable
        style={[
          styles.photoButton,
          uploadingPhoto && styles.photoButtonDisabled,
        ]}
        onPress={choosePhoto}
        disabled={uploadingPhoto}
      >
        {uploadingPhoto ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.photoButtonText}>
            Alterar foto
          </Text>
        )}
      </Pressable>

      {/* PET PERDIDO */}

      {pet.is_lost && (
        <View style={styles.lostCard}>
          <Text style={styles.lostText}>
            Pet marcado como perdido
          </Text>
        </View>
      )}

      {/* PESO */}

      <Text style={styles.sectionTitle}>
        Peso
      </Text>

      <View style={styles.card}>
        {pet.latest_weight ? (
          <>
            <Text style={styles.cardValue}>
              {pet.latest_weight.weight} kg
            </Text>

            <Text style={styles.cardLabel}>
              Último peso registrado
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            Nenhum peso registrado.
          </Text>
        )}

        <Pressable
          style={styles.weightButton}
          onPress={() =>
            navigation.navigate("Weight", { petId })
          }
        >
          <Text style={styles.weightButtonText}>
            Ver histórico de peso →
          </Text>
        </Pressable>
      </View>

      {/* VACINAÇÃO */}

      <Text style={styles.sectionTitle}>
        Próxima vacina
      </Text>

      <View style={styles.card}>
        {pet.next_vaccine ? (
          <>
            <Text style={styles.cardValue}>
              {pet.next_vaccine.name}
            </Text>

            <Text style={styles.cardLabel}>
              {pet.next_vaccine.next_dose_date ??
                "Data não informada"}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma vacina agendada.
          </Text>
        )}

        <Pressable
          style={styles.weightButton}
          onPress={() =>
            navigation.navigate("Vaccine", { petId })
          }
        >
          <Text style={styles.weightButtonText}>
            💉 Carteira de vacinação →
          </Text>
        </Pressable>
      </View>

      {/* MEDICAMENTOS */}

      <Text style={styles.sectionTitle}>
        Medicamentos
      </Text>

      <View style={styles.card}>
        {pet.medications.length > 0 ? (
          pet.medications.map((medication) => (
            <View
              key={medication.id}
              style={styles.medicationItem}
            >
              <Text style={styles.cardValue}>
                {medication.name}
              </Text>

              <Text style={styles.cardLabel}>
                Dosagem: {medication.dosage}
              </Text>

              <Text style={styles.cardLabel}>
                Frequência: {medication.frequency}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>
            Nenhum medicamento ativo.
          </Text>
        )}

        <Pressable
          style={styles.weightButton}
          onPress={() =>
            navigation.navigate("Medication", { petId })
          }
        >
          <Text style={styles.weightButtonText}>
            💊 Ver histórico de medicamentos →
          </Text>
        </Pressable>
      </View>

      {/* PRÓXIMA CONSULTA */}

      <Text style={styles.sectionTitle}>
        Próxima consulta
      </Text>

      <View style={styles.card}>
        {pet.next_vet_visit ? (
          <>
            <Text style={styles.cardValue}>
              {pet.next_vet_visit.clinic ??
                "Clínica não informada"}
            </Text>

            <Text style={styles.cardLabel}>
              {pet.next_vet_visit.veterinarian ??
                "Veterinário não informado"}
            </Text>

            <Text style={styles.cardLabel}>
              {pet.next_vet_visit.next_visit_date ??
                "Data não informada"}
            </Text>
          </>
        ) : (
          <Text style={styles.emptyText}>
            Nenhuma consulta agendada.
          </Text>
        )}
      </View>
    </ScrollView>
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
    paddingBottom: 50,
  },

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    padding: 24,
  },

  name: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
  },

  description: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 6,
    marginBottom: 24,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 10,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    padding: 18,
  },

  cardValue: {
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },

  cardLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 5,
  },

  emptyText: {
    fontSize: 15,
    color: "#6B7280",
  },

  medicationItem: {
    marginBottom: 16,
  },

  lostCard: {
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
    padding: 14,
  },

  lostText: {
    color: "#B91C1C",
    fontSize: 15,
    fontWeight: "700",
  },

  loadingText: {
    marginTop: 14,
    fontSize: 16,
    color: "#6B7280",
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
  },

  retryButton: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 20,
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 24,
  },

  backButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563EB",
  },

  photoButton: {
    backgroundColor: "#2563EB",
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    alignItems: "center",
  },

  photoButtonDisabled: {
    opacity: 0.6,
  },

  photoButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },

  weightButton: {
    backgroundColor: "#EFF6FF",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },

  weightButtonText: {
    color: "#2563EB",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
});
