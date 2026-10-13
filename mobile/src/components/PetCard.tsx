import {
  Pressable,
  StyleSheet,
  Text,
  Image,
} from "react-native";
import { useEffect,useState } from "react";
import { getToken } from "../storage/tokenStorage";
import { Pet } from "../types/pet";
import { API_URL } from "../services/api";


type Props = {
  pet: Pet;
  onPress: () => void;
};

export function PetCard({
  pet,
  onPress,
}: Props) {

const [token, setToken] = useState<string | null>(null);

useEffect(() => {
  async function loadToken() {
    const savedToken = await getToken();
    setToken(savedToken);
  }

  loadToken();
}, []);

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
    >{pet.photo_url && token && (
     <Image
    source={{
      uri: `${API_URL}/pets/${pet.id}/photo?v=${pet.photo_url}`,
      headers: {
        Authorization: `Bearer ${token}`,
    },
   }}
      style={styles.photo}
      resizeMode="cover"
      />
)}
      <Text style={styles.name}>
        {pet.name}
      </Text>

      <Text style={styles.info}>
        {pet.species}
      </Text>

      {pet.breed && (
        <Text style={styles.info}>
          {pet.breed}
        </Text>
      )}

      {pet.weight && (
        <Text style={styles.info}>
          {pet.weight} kg
        </Text>
      )}

      {pet.is_lost && (
        <Text style={styles.lost}>
          Pet perdido
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  name: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },

  info: {
    fontSize: 18,
    color: "#6B7280",
    marginTop: 5,
  },

  lost: {
    fontSize: 14,
    fontWeight: "700",
    color: "#DC2626",
    marginTop: 12,
  },

  photo: {
  width: "100%",
  aspectRatio: 4 / 3,
  borderRadius: 16,
  marginBottom: 26,
  },
});