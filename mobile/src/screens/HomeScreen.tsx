import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { PetCard } from "../components/PetCard";
import { getPets } from "../services/petService";
import { Pet } from "../types/pet";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Home"
>;


export function HomeScreen({ navigation, }: Props) {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    loadPets();
  }, []);

  async function loadPets() {
    try {
      setLoading(true);
      setError(false);

      const data = await getPets();

      setPets(data);
    } catch (error) {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Carregando seus pets...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Não foi possível carregar seus pets.
        </Text>

        <Text style={styles.errorText}>
          Verifique sua conexão e tente novamente.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>MeuPet</Text>

      <Text style={styles.title}>
        Meus pets
      </Text>

      {pets.length === 0 ? (
        <Text style={styles.emptyText}>
          Você ainda não possui pets cadastrados.
        </Text>
      ) : (
        <FlatList
          data={pets}
          keyExtractor={(pet) => pet.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <PetCard pet={item} 
             onPress={() => navigation.navigate("PetProfile", { 
              petId: item.id,
             })} />
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

  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F7F8FA",
    padding: 24,
  },

  logo: {
    fontSize: 32,
    fontWeight: "800",
    color: "#2563EB",
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
  },

  list: {
    paddingTop: 20,
    paddingBottom: 40,
  },

  emptyText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 20,
  },

  loadingText: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },

  errorText: {
    fontSize: 15,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
  },
});