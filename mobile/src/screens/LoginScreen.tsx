import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";

import { login } from "../services/authService";
import { RootStackParamList } from "../types/navigation";
import { saveToken } from "../storage/tokenStorage";



type Props = NativeStackScreenProps<
  RootStackParamList,
  "Login"
>;

export function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert(
        "Atenção",
        "Preencha o e-mail e a senha.",
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email,
        password,
      });

      await saveToken(response.access_token);

      navigation.replace("Home");
    } catch (error) {
      Alert.alert(
        "Não foi possível entrar",
        "Verifique seu e-mail e senha.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>MeuPet</Text>

        <Text style={styles.title}>
          Cuide de quem faz parte da família.
        </Text>

        <Text style={styles.subtitle}>
          Acompanhe a saúde e os cuidados do seu pet em um só lugar.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>E-mail</Text>

          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Senha</Text>

          <TextInput
            style={styles.input}
            placeholder="Sua senha"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Pressable
            style={[
              styles.button,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>
                Entrar
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },

  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
  },

  logo: {
    fontSize: 36,
    fontWeight: "800",
    color: "#2563EB",
    marginBottom: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 10,
  },

  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    color: "#6B7280",
    marginBottom: 36,
  },

  form: {
    gap: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    fontSize: 16,
    marginBottom: 8,
  },

  button: {
    height: 54,
    backgroundColor: "#2563EB",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});