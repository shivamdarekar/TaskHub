import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture?: string | null;
  isEmailVerified: boolean;
  is2FAenabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  authLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
}

interface Verify2FAData {
  email: string;
  twoFAToken: string;
  otp: string;
}

//initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  authLoading: true,
  error: null,
  isAuthenticated: false,
};

//fetch current user
export const fetchCurrentUser = createAsyncThunk(
  "auth/fetchCurrentUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/users/me");
      return response.data.data.user;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch user"));
    }
  }
);

//login user
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/users/login",
        credentials
      );

      //check if 2FA is required
      if (response.data.data?.requiresTwoFA) {
        return {
          requiresTwoFA: true,
          twoFAToken: response.data.data.twoFAToken,
          email: response.data.data.email,
        };
      }
      return response.data.data.user;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Login failed"));
    }
  }
);

// verify 2FA
export const verify2FA = createAsyncThunk(
  "auth/verify2FA",
  async (data: Verify2FAData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/users/verify-2fa", data);
      return response.data.data.user;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "2FA verification failed"));
    }
  }
);

// register user
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        "/api/v1/users/register",
        userData
      );
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Registration failed"));

    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk(
  "auth/logoutUser",
  async (_, { rejectWithValue }) => {
    try {
      await axiosInstance.post("/api/v1/users/logout");
      return true;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Logout failed"));
    }
  }
);

// Forgot password
export const forgotPassword = createAsyncThunk(
  "auth/forgotPassword",
  async (email: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/users/forgot-password", {
        email,
      });
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to send otp"));

    }
  }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
  "auth/verifyOTP",
  async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/users/verify-otp", {
        email,
        otp,
      });
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "OTP verification failed"));
    }
  }
);


//reset password
export const resetPassword = createAsyncThunk(
  "auth/resetPassword",
  async (
    { email, password, confirmPassword }:
      {
        email: string,
        password: string,
        confirmPassword: string
      },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/api/v1/users/reset-password", {
        email, password, confirmPassword
      });
      return response.data.message;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Password reset failed"));

    }
  }
);

//auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    clearUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.authLoading = false;
    }
  },
  extraReducers: (builder) => {
    //fetch cuurent user
    builder
      .addCase(fetchCurrentUser.pending, (state) => {
        state.authLoading = true;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action) => {
        state.authLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.rejected, (state) => {
        state.authLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });

    // Login user
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.authLoading = false;

        // Check if 2FA is required
        if (action.payload.requiresTwoFA) {
          // Don't set user yet, wait for 2FA verification
          state.error = null;
        }
        else {
          state.user = action.payload;
          state.isAuthenticated = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify 2FA
    builder
      .addCase(verify2FA.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verify2FA.fulfilled, (state, action) => {
        state.loading = false;
        state.authLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verify2FA.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register user
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout user
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Forgot password
    builder
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Verify OTP
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reset password
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, setUser, clearUser } = authSlice.actions;
export default authSlice.reducer;


