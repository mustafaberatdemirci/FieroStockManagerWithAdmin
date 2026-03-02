import axios from "axios";

const IS_MOCK = import.meta.env.VITE_USE_MOCK === "true";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Mock Mode ───────────────────────────────────────────────────────────────
// When VITE_USE_MOCK=true, completely replace all HTTP methods on the api
// instance so that NO real network requests are ever made. This is the most
// reliable approach — no adapter, no interceptor, just direct function override.
if (IS_MOCK) {
  console.log(
    "%c🧪 MOCK MODE ACTIVE — all API calls intercepted",
    "color: #f59e0b; font-weight: bold; font-size: 14px",
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const createMockMethod = (method: string) => {
    // axios signature: api.get(url, config?) or api.post(url, data?, config?)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return async (url: string, dataOrConfig?: any, maybeConfig?: any) => {
      const { handleMockRequest } = await import("../mocks/handlers");

      const isBodyMethod = ["POST", "PUT", "PATCH"].includes(method);
      const config = isBodyMethod ? maybeConfig || {} : dataOrConfig || {};
      const data = isBodyMethod ? dataOrConfig : undefined;

      const reqConfig = { url, method, data, params: config.params };
      console.log(`%c[Mock] ${method} ${url}`, 'color: #06b6d4', reqConfig);
      const mockResponse = await handleMockRequest(reqConfig);
      console.log(`%c[Mock] → ${mockResponse.status}`, 'color: #22c55e', mockResponse.data);

      if (mockResponse.status >= 400) {
        const error = {
          response: {
            data: mockResponse.data,
            status: mockResponse.status,
            statusText: "Error",
            headers: {},
          },
          config: { url, method },
          isAxiosError: true,
          message: `Mock request failed with status ${mockResponse.status}`,
        };
        return Promise.reject(error);
      }

      return {
        data: mockResponse.data,
        status: mockResponse.status,
        statusText: "OK",
        headers: {},
        config: { url, method },
      };
    };
  };

  // Override all HTTP methods — nuclear option, zero network leaks
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).get = createMockMethod("GET");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).post = createMockMethod("POST");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).put = createMockMethod("PUT");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).patch = createMockMethod("PATCH");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (api as any).delete = createMockMethod("DELETE");
}

// ─── Real Mode: Request interceptor to add auth token ────────────────────────
if (!IS_MOCK) {
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}

// ─── Real Mode: Response interceptor for token refresh ───────────────────────
if (!IS_MOCK) {
  let isRefreshing = false;
  interface QueueItem {
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
  }

  let failedQueue: QueueItem[] = [];

  const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    failedQueue = [];
  };

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return api(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const refreshToken = localStorage.getItem("refreshToken");

        if (!refreshToken) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL || "/api"}/auth/refresh`,
            {
              refreshToken,
            },
          );

          if (response.data.success) {
            const { accessToken, refreshToken: newRefreshToken } =
              response.data.data;

            localStorage.setItem("token", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);

            originalRequest.headers.Authorization = `Bearer ${accessToken}`;

            processQueue(null, accessToken);

            return api(originalRequest);
          } else {
            throw new Error("Token refresh failed");
          }
        } catch (refreshError) {
          processQueue(refreshError, null);

          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
}

export default api;
