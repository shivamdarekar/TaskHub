import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface InviteDetails {
    invite: {
        id: string;
        inviteToken: string;
        email: string | null;
        expiresAt: string;
        workspace: {
            id: string;
            name: string;
            description: string | null;
            _count: {
                members: number;
                projects: number;
            };
        };
        inviter: {
            name: string;
            email: string;
        };
    };
}

interface InviteState {
    inviteDetails: InviteDetails | null;
    inviteLink: string | null;
    loading: boolean;
    error: string | null;
}

const initialState: InviteState = {
    inviteDetails: null,
    inviteLink: null,
    loading: false,
    error: null,
};

// Create workspace invite
export const createWorkspaceInvite = createAsyncThunk(
    "invite/createWorkspaceInvite",
    async ({ workspaceId, email }: { workspaceId: string; email?: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/v1/invite/${workspaceId}/create`, { email });
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleAxiosError(error));
        }
    }
);

// Get invite details
export const getInviteDetails = createAsyncThunk(
    "invite/getInviteDetails",
    async ({ workspaceId, inviteToken }: { workspaceId: string; inviteToken: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/invite/${workspaceId}/join/${inviteToken}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleAxiosError(error));
        }
    }
);

// Join workspace via invite
export const joinWorkspaceViaInvite = createAsyncThunk(
    "invite/joinWorkspaceViaInvite",
    async ({ workspaceId, inviteToken }: { workspaceId: string; inviteToken: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/v1/invite/${workspaceId}/join/${inviteToken}`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleAxiosError(error));
        }
    }
);

// Reset invite link
export const resetInviteLink = createAsyncThunk(
    "invite/resetInviteLink",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post(`/api/v1/invite/${workspaceId}/reset`);
            return response.data.data;
        } catch (error) {
            return rejectWithValue(handleAxiosError(error));
        }
    }
);

const inviteSlice = createSlice({
    name: "invite",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearInviteDetails: (state) => {
            state.inviteDetails = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Create workspace invite
            .addCase(createWorkspaceInvite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createWorkspaceInvite.fulfilled, (state, action) => {
                state.loading = false;
                state.inviteLink = action.payload.inviteLink;
            })
            .addCase(createWorkspaceInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Get invite details
            .addCase(getInviteDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getInviteDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.inviteDetails = action.payload;
            })
            .addCase(getInviteDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Join workspace via invite
            .addCase(joinWorkspaceViaInvite.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(joinWorkspaceViaInvite.fulfilled, (state) => {
                state.loading = false;
            })
            .addCase(joinWorkspaceViaInvite.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Reset invite link
            .addCase(resetInviteLink.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetInviteLink.fulfilled, (state, action) => {
                state.loading = false;
                state.inviteLink = action.payload.inviteLink;
            })
            .addCase(resetInviteLink.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearError, clearInviteDetails } = inviteSlice.actions;
export default inviteSlice.reducer;

