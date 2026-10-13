import { apiRequest } from "./api";

type LoginData = {
  email: string;
  password: string;
};

type LoginResponse = {
  access_token: string;
  token_type: string;
};

export async function login(
  data: LoginData,
): Promise<LoginResponse> {
  return apiRequest<LoginResponse>("/users/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}