export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  PetProfile: { petId: number };
  Weight: { petId: number };
  Vaccine: { petId: number };
  Medication: { petId: number };
};