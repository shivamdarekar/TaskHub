import { createSlice, createAsyncThunk, PayloadAction, isRejectedWithValue } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";
import { resetAppState } from "../actions/appActions";

interface Workspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    inviteCode: string;
    createdAt: string;
    updatedAt: string;
}

interface WorkspaceState {
    workspaces: Workspace[];
    loading: boolean;
    error: string | null;
    overview: WorkspaceOverview | null;
    overviewLoading: boolean;
    currentWorkspace: WorkspaceDetail | null;
    currentWorkspaceLoading: boolean;
    members: Member[];
    membersLoading: boolean;
    memberProjects: MemberProject[];
    memberProjectsLoading: boolean;
    selectedMember: Member | null;
}

interface WorkspaceData {
    name: string;
    description?: string;
}

interface WorkspaceOverviewStats {
    totalProjects: number;
    totalTasks: number;
    myTasks: number;
    completedTasks: number;
    teamMembers: number;
    taskByStatus: {
        status: string,
        count: number
    }[];
    taskCreationTrend?: {
        date: string;
        tasks: number;
    }[];
}

interface WorkspaceOverviewMember {
    id: string;
    name: string;
    email: string;
    joinedAt: string;
}

interface WorkspaceOverviewProjects {
    id: string;
    name: string;
    createdAt: string;
    taskCount: number;
}

interface WorkspaceOverview {
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
    isOwner: boolean; // Add this field
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

interface UpdateWorkspaceData {
    name?: string;
    description?: string;
}

interface MemberProject {
    id: string;
    name: string;
    description?: string | null;
    createdAt: string;
    taskCount: number;
    accessType: "owner" | "member";
}

interface MemberProjectsResponse {
    member: {
        id: string;
        name: string;
        email: string;
        accessLevel: string;
    };
    projects: MemberProject[];
    totalProjects: number;
}

interface UpdateMemberAccessData {
    accessLevel: "OWNER" | "MEMBER" | "VIEWER";
}

const initialState: WorkspaceState = {
    workspaces: [],
    loading: false,
    error: null,
    overview: null,
    overviewLoading: false,
    currentWorkspace: null,
    currentWorkspaceLoading: false,
    members: [],
    membersLoading: false,
    memberProjects: [],
    memberProjectsLoading: false,
    selectedMember: null,
};

export const createWorkspace = createAsyncThunk(
    "workspace/create",
    async (data: WorkspaceData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.post("/api/v1/workspace/create", data);

            return response.data.data.workspace
        }
        catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to create workspace"))
        }
    }
);

export const fetchUserWorkspaces = createAsyncThunk(
    "workspace/get",
    async (_, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get("/api/v1/workspace/get");

            return response.data.data.workspaces;
        }
        catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch workspaces"))
        }
    }
);

export const fetchWorkspaceById = createAsyncThunk(
    "workspace/fetchById",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/workspace/${workspaceId}`);

            return response.data.data.workspace;
        }
        catch (error: unknown) {
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

export const updateWorkspace = createAsyncThunk(
    "workspace/update",
    async ({ workspaceId, data }: { workspaceId: string, data: UpdateWorkspaceData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/workspace/${workspaceId}/update`,
                data
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to update workspace")
            );
        }
    }
);

export const deleteWorkspace = createAsyncThunk(
    "workspace/delete",
    async (workspaceId: string, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/api/v1/workspace/${workspaceId}/delete`);
            return workspaceId;
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to delete workspace")
            );
        }
    }
);

export const removeMember = createAsyncThunk(
    "workspace/removeMember",
    async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.delete(`/api/v1/workspace/${workspaceId}/members/${memberId}`);
            return { memberId, removedMember: response.data.data.removedMember };
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to remove member")
            );
        }
    }
);

export const getMemberProjects = createAsyncThunk(
    "workspace/getMemberProjects",
    async ({ workspaceId, memberId }: { workspaceId: string; memberId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(`/api/v1/workspace/${workspaceId}/members/${memberId}/projects`);
            return response.data.data as MemberProjectsResponse;
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to fetch member projects")
            );
        }
    }
);

export const updateMemberAccess = createAsyncThunk(
    "workspace/updateMemberAccess",
    async ({ workspaceId, memberId, data }: { workspaceId: string; memberId: string; data: UpdateMemberAccessData }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(`/api/v1/workspace/${workspaceId}/members/${memberId}/access`, data);
            return response.data.data.member;
        } catch (error: unknown) {
            return rejectWithValue(
                handleAxiosError(error, "Failed to update member access")
            );
        }
    }
);

const workspaceSlice = createSlice({
    name: "workspace",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearWorkspaceData: (state) => {
            state.currentWorkspace = null;
            state.members = [];
            state.overview = null;
            state.currentWorkspaceLoading = false;
            state.membersLoading = false;
            state.overviewLoading = false;
            state.memberProjects = [];
            state.memberProjectsLoading = false;
            state.selectedMember = null;
            state.error = null;
        },
        setSelectedMember: (state, action) => {
            state.selectedMember = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(createWorkspace.pending, (state) => {
                state.loading = true;
                state.error = null
            })
            .addCase(createWorkspace.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces.push(action.payload);
                state.error = null;
            })
            .addCase(createWorkspace.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })

            .addCase(fetchUserWorkspaces.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserWorkspaces.fulfilled, (state, action) => {
                state.loading = false;
                state.workspaces = action.payload;
                state.error = null;
            })
            .addCase(fetchUserWorkspaces.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string
            })

            // Fetch Workspace By ID
            .addCase(fetchWorkspaceById.pending, (state) => {
                state.currentWorkspaceLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaceById.fulfilled, (state, action: PayloadAction<WorkspaceDetail>) => {
                state.currentWorkspaceLoading = false;
                state.currentWorkspace = action.payload;
                state.error = null;
            })
            .addCase(fetchWorkspaceById.rejected, (state, action) => {
                state.currentWorkspaceLoading = false;
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

            .addCase(updateWorkspace.pending, (state) => {
                state.currentWorkspaceLoading = true;
                state.error = null;
            })
            .addCase(updateWorkspace.fulfilled, (state, action: PayloadAction<Workspace>) => {
                state.currentWorkspaceLoading = false;

                if (state.currentWorkspace && state.currentWorkspace.id === action.payload.id) {
                    state.currentWorkspace = {
                        ...state.currentWorkspace,
                        name: action.payload.name,
                        description: action.payload.description,
                        updatedAt: action.payload.updatedAt,
                    };
                }

                const idx = state.workspaces.findIndex((p) => p.id === action.payload.id);
                if (idx != -1) {
                    state.workspaces[idx] = {
                        ...state.workspaces[idx],
                        name: action.payload.name,
                        description: action.payload.description,
                        updatedAt: action.payload.updatedAt,
                    }
                };
                state.error = null;
            })
            .addCase(updateWorkspace.rejected, (state, action) => {
                state.currentWorkspaceLoading = false;
                state.error = action.payload as string;
            })

            .addCase(deleteWorkspace.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                state.loading = false;

                state.workspaces = state.workspaces.filter((p) => p.id !== action.payload);
                if (state.currentWorkspace?.id === action.payload) {
                    state.currentWorkspace = null;
                    state.overview = null;
                    state.members = [];
                }
                state.error = null;
            })
            .addCase(deleteWorkspace.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Remove Member
            .addCase(removeMember.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeMember.fulfilled, (state, action) => {
                state.loading = false;
                state.members = state.members.filter(m => m.id !== action.payload.memberId);
                state.error = null;
            })
            .addCase(removeMember.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Get Member Projects
            .addCase(getMemberProjects.pending, (state) => {
                state.memberProjectsLoading = true;
                state.error = null;
            })
            .addCase(getMemberProjects.fulfilled, (state, action) => {
                state.memberProjectsLoading = false;
                state.memberProjects = action.payload.projects;
                if (state.selectedMember) {
                    state.selectedMember = {
                        ...state.selectedMember,
                        user: {
                            ...state.selectedMember.user,
                            name: action.payload.member.name,
                            email: action.payload.member.email
                        },
                        accessLevel: action.payload.member.accessLevel
                    };
                }
                state.error = null;
            })
            .addCase(getMemberProjects.rejected, (state, action) => {
                state.memberProjectsLoading = false;
                state.error = action.payload as string;
            })

            // Update Member Access
            .addCase(updateMemberAccess.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateMemberAccess.fulfilled, (state, action) => {
                state.loading = false;
                const memberIndex = state.members.findIndex(m => m.id === action.payload.id);
                if (memberIndex !== -1) {
                    state.members[memberIndex] = action.payload;
                }
                if (state.selectedMember?.id === action.payload.id) {
                    state.selectedMember = action.payload;
                }
                state.error = null;
            })
            .addCase(updateMemberAccess.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            
            // Reset all workspace data on logout
            .addCase(resetAppState, () => initialState);
    },
});

export const { clearError, clearWorkspaceData, setSelectedMember } = workspaceSlice.actions;
export default workspaceSlice.reducer;