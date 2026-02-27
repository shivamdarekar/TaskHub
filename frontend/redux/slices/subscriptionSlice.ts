import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface Transaction {
  id: string;
  razorpayPaymentId: string;
  razorpayOrderId: string | null;
  razorpaySignature: string | null;
  amount: number;
  currency: string;
  status: string;
  plan: string;
  frequency: string;
  paymentMethod: string | null;
  email: string | null;
  contact: string | null;
  createdAt: string;
}

interface Subscription {
  id: string;
  userId: string;
  plan: "FREE" | "PRO" | "ENTERPRISE";
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "PAST_DUE";
  frequency: "monthly" | "yearly" | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  maxWorkspaces: number;
  maxMembers: number;
  maxProjects: number;
  maxTasks: number;
  maxStorage: number;
  createdAt: string;
  updatedAt: string;
  transactions?: Transaction[];
}

interface SubscriptionLimits {
  workspaces: {
    current: number;
    max: number;
    canAdd: boolean;
  };
  tasks: {
    current: number;
    max: number;
    canAdd: boolean;
  };
  projects: {
    current: number;
    max: number;
    canAdd: boolean;
  };
}

interface SubscriptionState {
  subscription: Subscription | null;
  limits: SubscriptionLimits | null;
  transactions: Transaction[];
  transactionPagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  } | null;
  loading: boolean;
  error: string | null;
  upgradeLoading: boolean;
  paymentOrder: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  } | null;
  successMessage: string | null;
}

const initialState: SubscriptionState = {
  subscription: null,
  limits: null,
  transactions: [],
  transactionPagination: null,
  loading: false,
  error: null,
  upgradeLoading: false,
  paymentOrder: null,
  successMessage: null,
};

// Get current subscription
export const getCurrentSubscription = createAsyncThunk(
  "subscription/getCurrent",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/subscription/current");
      return response.data.data.subscription;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch subscription"));
    }
  }
);

// Get subscription limits
export const getSubscriptionLimits = createAsyncThunk(
  "subscription/getLimits",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/api/v1/subscription/limits");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch subscription limits"));
    }
  }
);

// Get transaction history
export const getTransactionHistory = createAsyncThunk(
  "subscription/getHistory",
  async ({ page = 1, limit = 10 }: { page?: number; limit?: number }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/subscription/history?page=${page}&limit=${limit}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch transaction history"));
    }
  }
);

// Create subscription order
export const createSubscriptionOrder = createAsyncThunk(
  "subscription/createOrder",
  async (
    { plan, frequency }: { plan: "PRO" | "ENTERPRISE"; frequency: "monthly" | "yearly" },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/api/v1/subscription/create-order", { plan, frequency });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to create subscription order"));
    }
  }
);

// Verify payment and upgrade
export const verifyPaymentAndUpgrade = createAsyncThunk(
  "subscription/verifyPayment",
  async (
    {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      frequency,
    }: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      plan: "PRO" | "ENTERPRISE";
      frequency: "monthly" | "yearly";
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axiosInstance.post("/api/v1/subscription/verify-payment", {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        plan,
        frequency,
      });
      return response.data.data.subscription;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to verify payment"));
    }
  }
);

// Cancel subscription
export const cancelSubscription = createAsyncThunk(
  "subscription/cancel",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/subscription/cancel");
      return response.data.data.subscription;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to cancel subscription"));
    }
  }
);

// Reactivate subscription
export const reactivateSubscription = createAsyncThunk(
  "subscription/reactivate",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/api/v1/subscription/reactivate");
      return response.data.data.subscription;
    } catch (error) {
      return rejectWithValue(handleAxiosError(error, "Failed to reactivate subscription"));
    }
  }
);

const subscriptionSlice = createSlice({
  name: "subscription",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    clearPaymentOrder: (state) => {
      state.paymentOrder = null;
    },
    clearSubscription: (state) => {
      state.subscription = null;
      state.limits = null;
      state.transactions = [];
      state.transactionPagination = null;
      state.paymentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // Get current subscription
    builder
      .addCase(getCurrentSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCurrentSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.subscription = action.payload;
      })
      .addCase(getCurrentSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get subscription limits
    builder
      .addCase(getSubscriptionLimits.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSubscriptionLimits.fulfilled, (state, action) => {
        state.loading = false;
        state.subscription = action.payload.subscription;
        state.limits = action.payload.limits;
      })
      .addCase(getSubscriptionLimits.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get transaction history
    builder
      .addCase(getTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions;
        state.transactionPagination = action.payload.pagination;
      })
      .addCase(getTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create subscription order
    builder
      .addCase(createSubscriptionOrder.pending, (state) => {
        state.upgradeLoading = true;
        state.error = null;
      })
      .addCase(createSubscriptionOrder.fulfilled, (state, action) => {
        state.upgradeLoading = false;
        state.paymentOrder = action.payload;
      })
      .addCase(createSubscriptionOrder.rejected, (state, action) => {
        state.upgradeLoading = false;
        state.error = action.payload as string;
      });

    // Verify payment and upgrade
    builder
      .addCase(verifyPaymentAndUpgrade.pending, (state) => {
        state.upgradeLoading = true;
        state.error = null;
      })
      .addCase(verifyPaymentAndUpgrade.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.upgradeLoading = false;
        state.subscription = action.payload;
        state.paymentOrder = null;
        state.successMessage = "Subscription upgraded successfully!";
      })
      .addCase(verifyPaymentAndUpgrade.rejected, (state, action) => {
        state.upgradeLoading = false;
        state.error = action.payload as string;
      });

    // Cancel subscription
    builder
      .addCase(cancelSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.subscription = action.payload;
        state.successMessage = "Subscription will be cancelled at the end of current period";
      })
      .addCase(cancelSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Reactivate subscription
    builder
      .addCase(reactivateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(reactivateSubscription.fulfilled, (state, action: PayloadAction<Subscription>) => {
        state.loading = false;
        state.subscription = action.payload;
        state.successMessage = "Subscription reactivated successfully!";
      })
      .addCase(reactivateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSuccessMessage, clearPaymentOrder, clearSubscription } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
