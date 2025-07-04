import { createTRPCProxyClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../../api/src/trpc/router";

// Token management utilities
export const tokenManager = {
  keys: {
    accessToken: "auth.accessToken",
    refreshToken: "auth.refreshToken",
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem(tokenManager.keys.accessToken, accessToken);
    localStorage.setItem(tokenManager.keys.refreshToken, refreshToken);
  },

  getAccessToken: (): string | null => {
    return localStorage.getItem(tokenManager.keys.accessToken);
  },

  getRefreshToken: (): string | null => {
    return localStorage.getItem(tokenManager.keys.refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem(tokenManager.keys.accessToken);
    localStorage.removeItem(tokenManager.keys.refreshToken);
  },

  hasValidTokens: (): boolean => {
    return !!(
      localStorage.getItem(tokenManager.keys.accessToken) &&
      localStorage.getItem(tokenManager.keys.refreshToken)
    );
  },
};

// Variable to track if we're currently refreshing to prevent multiple simultaneous refreshes
let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

// Custom fetch function that handles token refresh
const customFetch = async (
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> => {
  // Add auth header
  const token = tokenManager.getAccessToken();
  const options = {
    ...init,
    headers: {
      ...init?.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  // Make the request
  let response = await fetch(input, options);

  // If we get a 401, try to refresh the token
  if (response.status === 401) {
    console.log("[API] Got 401 response, attempting token refresh...");

    // If already refreshing, wait for it to complete
    if (isRefreshing && refreshPromise) {
      console.log("[API] Already refreshing, waiting...");
      await refreshPromise;

      // Retry with potentially new token
      const newToken = tokenManager.getAccessToken();
      if (newToken) {
        const newOptions = {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        };
        console.log("[API] Retrying with new token...");
        return fetch(input, newOptions);
      }
    }

    // Start refresh process
    if (!isRefreshing) {
      isRefreshing = true;
      console.log("[API] Starting token refresh process...");

      refreshPromise = (async () => {
        try {
          const refreshToken = tokenManager.getRefreshToken();
          if (!refreshToken) {
            console.log("[API] No refresh token available");
            throw new Error("No refresh token");
          }

          console.log("[API] Calling refresh endpoint...");
          const refreshResponse = await fetch(
            `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/rpc/auth.refreshToken`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ refreshToken }),
            },
          );

          if (!refreshResponse.ok) {
            console.log(
              "[API] Refresh request failed with status:",
              refreshResponse.status,
            );
            throw new Error("Refresh failed");
          }

          const refreshData = await refreshResponse.json();
          console.log("[API] Refresh response:", refreshData);

          // Handle tRPC response format
          const result = refreshData.result?.data || refreshData;

          if (result.success && result.accessToken) {
            console.log("[API] Token refresh successful!");
            tokenManager.setTokens(result.accessToken, refreshToken);
            return result.accessToken;
          } else {
            console.log("[API] Token refresh failed - no valid response");
            throw new Error("Invalid refresh response");
          }
        } catch (error) {
          console.error("[API] Token refresh error:", error);
          // Clear tokens and redirect to login
          tokenManager.clearTokens();
          window.location.href = "/login";
          throw error;
        } finally {
          isRefreshing = false;
          refreshPromise = null;
        }
      })();

      try {
        const newToken = await refreshPromise;
        if (newToken) {
          // Retry original request with new token
          const newOptions = {
            ...options,
            headers: {
              ...options.headers,
              Authorization: `Bearer ${newToken}`,
            },
          };
          console.log("[API] Retrying original request with new token...");
          return fetch(input, newOptions);
        }
      } catch (error) {
        console.error("[API] Failed to refresh token:", error);
        throw error;
      }
    }
  }

  return response;
};

// Create tRPC client with custom fetch
export const api = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${import.meta.env.VITE_API_URL || "http://localhost:3001"}/rpc`,
      fetch: customFetch,
    }),
  ],
});

// Helper function to check authentication status
export const isAuthenticated = (): boolean => {
  return tokenManager.hasValidTokens();
};

// Export type for external use
export type Api = typeof api;
