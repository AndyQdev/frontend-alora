type Method = "GET" | "POST" | "PUT" | "DELETE";

export async function apiFetch<T>(url: string, { method = "GET", body }: { method?: Method; body?: any } = {}): Promise<T> {
  // Mock local endpoints
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simple router
      if (url.startsWith("/products") && method === "GET") {
        resolve((JSON.parse(localStorage.getItem("products") || "[]")) as T);
        return;
      }
      if (url.startsWith("/products") && method === "POST") {
        const data = JSON.parse(localStorage.getItem("products") || "[]");
        const item = { id: crypto.randomUUID(), ...(body || {}) };
        data.push(item);
        localStorage.setItem("products", JSON.stringify(data));
        resolve(item as T);
        return;
      }
      resolve({} as T);
    }, 200);
  });
}
