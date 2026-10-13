export type Pet = {
  id: number;
  public_id: string;
  name: string;
  species: string;
  breed: string | null;
  birth_date: string | null;
  weight: number | null;
  sex: string | null;
  color: string | null;
  is_lost: boolean;
  photo_url: string | null;
  lost_message: string | null;
  contact_name: string | null;
  contact_phone: string | null;
};