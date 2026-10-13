
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { HomeScreen } from "../screens/HomeScreen";
import { LoginScreen } from "../screens/LoginScreen";
import { PetProfileScreen } from "../screens/PetProfileScreen";
import { WeightScreen } from "../screens/WeightScreen";
import { VaccineScreen } from "../screens/VaccineScreen";
import { MedicationScreen } from "../screens/MedicationScreen";

import { RootStackParamList } from "../types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="PetProfile" component={PetProfileScreen} />

      <Stack.Screen name="Weight">
        {({ route, navigation }) => (
          <WeightScreen
            petId={route.params.petId}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Vaccine">
        {({ route, navigation }) => (
          <VaccineScreen
            petId={route.params.petId}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>

      <Stack.Screen name="Medication">
        {({ route, navigation }) => (
          <MedicationScreen
            petId={route.params.petId}
            onBack={() => navigation.goBack()}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}
