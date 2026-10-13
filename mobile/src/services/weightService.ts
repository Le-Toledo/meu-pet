import { apiRequest } from "./api";

export type PetWeight = {
  id: number;
  weight: number;
  recorded_at: string;
};

export async function getPetWeights(
  petId: number,
): Promise<PetWeight[]> {
  return apiRequest<PetWeight[]>(
    `/pets/${petId}/weights`,
  );
}

export async function createPetWeight(
  petId: number,
  weight: number,
  recordedAt: string,
): Promise<PetWeight> {
  return apiRequest<PetWeight>(
    `/pets/${petId}/weights`,
    {
      method: "POST",
      body: JSON.stringify({
        weight,
        recorded_at: recordedAt,
      }),
    },
  );
}