import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface Workspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    inviteCode: string;
    createdAt: string;
    updatedAt: string;
}

interface WorkspaceState{
    workspaces: Workspace[];
    loading: boolean;
    error: string | null;
}

interface WorkspaceData{
    name: string;
    description?: string;
}

const initialState: WorkspaceState = {
    workspaces: [],
    loading: false,
    error: null
}

export const createWorkspace = createAsyncThunk(
    "workspace/create",
    async (data:WorkspaceData, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.post("/api/v1/workspace/create", data);

            return response.data.data.workspace
        }
        catch (error:unknown) {
            return rejectWithValue(handleAxiosError(error,"Failed to create workspace"))
        }
    }
);

export const fetchUserWorkspaces = createAsyncThunk(
    "workspace/get",
    async(_ ,{rejectWithValue}) => {
        try{
            const response = await axiosInstance.get("/api/v1/workspace/get");

            return response.data.data.workspaces;
        }
        catch (error: unknown){
            return rejectWithValue(handleAxiosError(error,"Failed to fetch workspaces"))
        }
    }
);

const workspaceSlice = createSlice({
    name:"workspace",
    initialState,
    reducers:{
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(createWorkspace.pending, (state) => {
                state.loading = true;
                state.error = null
            })
            .addCase(createWorkspace.fulfilled, (state,action) => {
                state.loading = false;
                state.workspaces.push(action.payload);
                state.error = null;
            })
            .addCase(createWorkspace.rejected,(state,action) => {
                state.loading = false;
                state.error = action.payload as string
            })

            .addCase(fetchUserWorkspaces.pending,(state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserWorkspaces.fulfilled, (state,action) => {
                state.loading = false;
                state.workspaces = action.payload;
                state.error = null;
            })
            .addCase(fetchUserWorkspaces.rejected, (state,action) => {
                state.loading = false;
                state.error = action.payload as string
            })
    },
});

export const {clearError} = workspaceSlice.actions;
export default workspaceSlice.reducer;