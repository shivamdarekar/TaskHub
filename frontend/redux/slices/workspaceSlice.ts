import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
    overview: WorkspaceOverview | null;
    overviewLoading: boolean;
    currentWorkspace: WorkspaceDetail | null;
    members: Member[];
    membersLoading: boolean;
}

interface WorkspaceData{
    name: string;
    description?: string;
}

interface WorkspaceOverviewStats{
    totalProjects: number;
    totalTasks: number;
    myTasks: number;
    completedTasks: number;
    teamMembers: number;
    taskByStatus: {
        status: string,
        count: number
    }[];
}

interface WorkspaceOverviewMember{
    id: string;
    name: string;
    email: string;
    joinedAt: string;
}

interface WorkspaceOverviewProjects{
    id: string;
    name: string;
    createdAt: string;
    taskCount: number;
}

interface WorkspaceOverview{
    workspace: {
        id: string;
        name: string;
        description?: string | null;
        createdAt: string;
        owner: {
            id: string;
            name: string;
            email: string
        }
    };
    stats: WorkspaceOverviewStats;
    recentMembers: WorkspaceOverviewMember[];
    recentProjects: WorkspaceOverviewProjects[];
}

interface WorkspaceDetail {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
    ownerId: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    _count: {
        members: number;
        projects: number;
    };
}

interface Member {
    id: string;
    userId: string;
    user: {
        id: string;
        name: string;
        email: string;
        profilePicture?: string | null;
    };
    accessLevel: string;
    createdAt: string;
}

const initialState: WorkspaceState = {
    workspaces: [],
    loading: false,
    error: null,
    overview: null,
    overviewLoading: false,
    currentWorkspace: null,
    members: [],
    membersLoading: false,
};

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

export const fetchWorkspaceById = createAsyncThunk(
    "workspace/fetchById",
    async(workspaceId:string,{rejectWithValue}) => {
        try{
            const response = await axiosInstance.get(`/api/v1/workspace/${workspaceId}`);

            return response.data.data.workspace;
        }
        catch (error:unknown){
            return rejectWithValue(handleAxiosError(error, "Failed to fetch Workspace"));
        }
    }
);

export const fetchWorkspaceMembers = createAsyncThunk(
    "workspace/fetchMembers",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/workspace/${workspaceId}/members`);
            return response.data.data.members;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch members"));
        }
    }
);

export const fetchWorkspaceOverview = createAsyncThunk(
    "workspace/overview",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(
                `/api/v1/workspace/${workspaceId}/overview`
            );
            return response.data.data as WorkspaceOverview;
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to fetch workspace overview")
            );
        }
    }
);

const workspaceSlice = createSlice({
    name:"workspace",
    initialState,
    reducers:{
        clearError: (state) => {
            state.error = null;
        },
    clearWorkspaceData: (state) => {
      state.currentWorkspace = null;
      state.members = [];
      state.overview = null;
      state.membersLoading = false;
      state.overviewLoading = false;
      state.error = null;
    },
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

            // Fetch Workspace By ID
            .addCase(fetchWorkspaceById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaceById.fulfilled, (state, action: PayloadAction<WorkspaceDetail>) => {
                state.loading = false;
                state.currentWorkspace = action.payload;
                state.error = null;
            })
            .addCase(fetchWorkspaceById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Fetch Workspace Members
            .addCase(fetchWorkspaceMembers.pending, (state) => {
                state.membersLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaceMembers.fulfilled, (state, action: PayloadAction<Member[]>) => {
                state.membersLoading = false;
                state.members = action.payload;
                state.error = null;
            })
            .addCase(fetchWorkspaceMembers.rejected, (state, action) => {
                state.membersLoading = false;
                state.error = action.payload as string;
            })

        //workspace Overview
            .addCase(fetchWorkspaceOverview.pending, (state) => {
                state.overviewLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaceOverview.fulfilled,
                (state, action: PayloadAction<WorkspaceOverview>) => {
                    state.overviewLoading = false;
                    state.overview = action.payload;
                    state.error = null;
                }
            )
            .addCase(fetchWorkspaceOverview.rejected, (state, action) => {
                state.overviewLoading = false;
                state.overview = null;
                state.error = action.payload as string;
            })
    },
});

export const {clearError, clearWorkspaceData} = workspaceSlice.actions;
export default workspaceSlice.reducer;