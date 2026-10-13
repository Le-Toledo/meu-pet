import { getToken } from "../storage/tokenStorage";

export const API_URL = "http://192.168.1.4:8000";

type RequestOptions = {
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export async function apiRequest<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const token = await getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  if (response.status === 204) {
  return undefined as T;
}

return response.json() as Promise<T>;
}