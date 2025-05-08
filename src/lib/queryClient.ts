import { QueryClient } from "@tanstack/react-query";

// Default fetcher for API requests
async function defaultFetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
}

// Helper for API requests with custom options
interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: HeadersInit;
}

export async function apiRequest<T>(
  url: string, 
  options: ApiRequestOptions = {}
): Promise<T> {
  const { method = "GET", body, headers = {} } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    credentials: "include",
  };
  
  if (body && method !== "GET") {
    config.body = JSON.stringify(body);
  }
  
  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }
  
  return response.json();
}

// Configure the global query client with default options
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
      queryFn: ({ queryKey }) => {
        const [url] = queryKey as [string, ...unknown[]];
        return defaultFetcher(url);
      },
    },
  },
});