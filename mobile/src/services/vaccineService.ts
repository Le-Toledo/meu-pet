
import { apiRequest } from "./api";

export type Vaccine = {
  id: number;
  pet_id: number;
  name: string;
  application_date: string;
  next_dose_date: string | null;
  price: number | string | null;
};

export type VaccineInput = {
  name: string;
  application_date: string;
  next_dose_date?: string | null;
  price?: number | null;
};

// Buscar vacinas de um pet
export async function getPetVaccines(
  petId: number,
): Promise<Vaccine[]> {
  return apiRequest<Vaccine[]>(
    `/pets/${petId}/vaccines`,
  );
}

// Cadastrar vacina
export async function createPetVaccine(
  petId: number,
  data: VaccineInput,
): Promise<Vaccine> {
  return apiRequest<Vaccine>(
    `/pets/${petId}/vaccines`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// Atualizar vacina
export async function updatePetVaccine(
  petId: number,
  vaccineId: number,
  data: Partial<VaccineInput>,
): Promise<Vaccine> {
  return apiRequest<Vaccine>(
    `/pets/${petId}/vaccines/${vaccineId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

// Excluir vacina
export async function deletePetVaccine(
  petId: number,
  vaccineId: number,
): Promise<void> {
  return apiRequest<void>(
    `/pets/${petId}/vaccines/${vaccineId}`,
    {
      method: "DELETE",
    },
  );
}
