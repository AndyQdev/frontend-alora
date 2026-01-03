type Method = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

export interface ApiResponse<T> {
  stats?: any;
  statusCode: number;
  data?: T;
  message?: string;
  countData?: number;
}

export async function apiFetch<T>(
  url: string,
  { method = "GET", body, headers = {} }: { method?: Method; body?: any; headers?: Record<string, string> } = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("authToken");
  
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...headers,
    },
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${url}`, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error del servidor" }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
}
