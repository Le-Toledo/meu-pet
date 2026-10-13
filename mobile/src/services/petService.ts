import { API_URL, apiRequest } from "./api";
import { getToken } from "../storage/tokenStorage";
import { Pet } from "../types/pet";
import { PetSummary } from "../types/petSummary";

export async function getPets(): Promise<Pet[]> {
  return apiRequest<Pet[]>("/pets/");
}

export async function getPetSummary(
  petId: number,
): Promise<PetSummary> {
  return apiRequest<PetSummary>(
    `/pets/${petId}/summary`,
  );
}

export async function uploadPetPhoto(
  petId: number,
  photoUri: string,
  mimeType: string,
  fileName: string,
): Promise<void> {
  const token = await getToken();

  if (!token) {
    throw new Error("Usuário não autenticado.");
  }

  const response = await fetch(photoUri);

  const originalBlob = await response.blob();

  const blob = new Blob(
    [originalBlob],
    {
      type: mimeType,
    },
  );

  const formData = new FormData();

  formData.append(
    "file",
    blob,
    fileName,
  );

  const uploadResponse = await fetch(
    `${API_URL}/pets/${petId}/photo`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    },
  );

  if (!uploadResponse.ok) {
    const errorText =
      await uploadResponse.text();

    console.log(
      "Erro no upload:",
      uploadResponse.status,
      errorText,
    );

    throw new Error(
      `Erro ao enviar foto: ${uploadResponse.status}`,
    );
  }
}