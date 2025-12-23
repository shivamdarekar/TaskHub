import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

//request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is due to expired access token
    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "ACCESS_TOKEN_EXPIRED" &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh token endpoint
        await axiosInstance.post("/api/v1/users/refresh-token");

        // Token refreshed successfully
        isRefreshing = false;
        processQueue(null, null);

        // Retry the original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed - user needs to login again
        isRefreshing = false;
        processQueue(refreshError, null);

        // Only redirect to login if on a protected page
        if (typeof window !== "undefined") {
          const currentPath = window.location.pathname;
          const publicPages = ['/', '/pricing', '/contact'];
          const isPublicPage = publicPages.includes(currentPath);
          
          // Don't redirect if on public marketing pages
          if (!isPublicPage && !currentPath.startsWith('/login') && 
              !currentPath.startsWith('/register') && 
              !currentPath.startsWith('/forgot-password') &&
              !currentPath.startsWith('/verify-email')) {
            window.location.href = "/login";
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
