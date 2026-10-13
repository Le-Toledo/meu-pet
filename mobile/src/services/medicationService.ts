
import { apiRequest } from "./api";

// Dados de um medicamento
export type Medication = {
  id: number;
  pet_id: number;
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date: string | null;
};

// Dados para cadastrar ou editar medicamentos
export type MedicationInput = {
  name: string;
  dosage: string;
  frequency: string;
  start_date: string;
  end_date?: string | null;
};

// Registro de uma dose administrada
export type MedicationDose = {
  id: number;
  medication_id: number;
  administered_at: string;
  dosage: string;
  notes: string | null;
};

// Dados para cadastrar ou editar uma dose
export type MedicationDoseInput = {
  administered_at: string;
  dosage: string;
  notes?: string | null;
};

// Buscar medicamentos do pet
export async function getPetMedications(
  petId: number,
): Promise<Medication[]> {
  return apiRequest<Medication[]>(
    `/pets/${petId}/medications`,
  );
}

// Cadastrar medicamento
export async function createPetMedication(
  petId: number,
  data: MedicationInput,
): Promise<Medication> {
  return apiRequest<Medication>(
    `/pets/${petId}/medications`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// Atualizar medicamento
export async function updatePetMedication(
  petId: number,
  medicationId: number,
  data: MedicationInput,
): Promise<Medication> {
  return apiRequest<Medication>(
    `/pets/${petId}/medications/${medicationId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

// Excluir medicamento
export async function deletePetMedication(
  petId: number,
  medicationId: number,
): Promise<void> {
  return apiRequest<void>(
    `/pets/${petId}/medications/${medicationId}`,
    {
      method: "DELETE",
    },
  );
}

// Buscar histórico de doses
export async function getMedicationDoses(
  petId: number,
  medicationId: number,
): Promise<MedicationDose[]> {
  return apiRequest<MedicationDose[]>(
    `/pets/${petId}/medications/${medicationId}/doses`,
  );
}

// Registrar uma dose administrada
export async function createMedicationDose(
  petId: number,
  medicationId: number,
  data: MedicationDoseInput,
): Promise<MedicationDose> {
  return apiRequest<MedicationDose>(
    `/pets/${petId}/medications/${medicationId}/doses`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
  );
}

// Editar uma dose administrada
export async function updateMedicationDose(
  petId: number,
  medicationId: number,
  doseId: number,
  data: MedicationDoseInput,
): Promise<MedicationDose> {
  return apiRequest<MedicationDose>(
    `/pets/${petId}/medications/${medicationId}/doses/${doseId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
  );
}

// Excluir uma dose do histórico
export async function deleteMedicationDose(
  petId: number,
  medicationId: number,
  doseId: number,
): Promise<void> {
  return apiRequest<void>(
    `/pets/${petId}/medications/${medicationId}/doses/${doseId}`,
    {
      method: "DELETE",
    },
  );
}
