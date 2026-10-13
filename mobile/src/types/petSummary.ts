export type WeightSummary = {
  weight: number;
  recorded_at: string;
};

export type VaccineSummary = {
  id: number;
  name: string;
  next_dose_date: string | null;
};

export type MedicationSummary = {
  id: number;
  name: string;
  dosage: string;
  frequency: string;
  end_date: string | null;
};

export type ReminderSummary = {
  id: number;
  title: string;
  reminder_at: string;
};

export type VetVisitSummary = {
  id: number;
  veterinarian: string | null;
  clinic: string | null;
  next_visit_date: string | null;
};

export type PetSummary = {
  id: number;
  public_id: string;
  name: string;
  species: string;
  breed: string | null;
  photo_url: string | null;
  is_lost: boolean;
  latest_weight: WeightSummary | null;
  next_vaccine: VaccineSummary | null;
  medications: MedicationSummary[];
  next_reminder: ReminderSummary | null;
  next_vet_visit: VetVisitSummary | null;
};