import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";
import { resetAppState } from "../actions/appActions";

interface Project{
    id: string;
    name: string;
    description?: string;
    members: ProjectMember[];
    taskCount: number;
    commentCount: number;
    fileCount: number;
    createdAt: string;
    updatedAt: string;
    _count?: {
        tasks: number;
        comments: number;
        files: number;
    };
}

interface ProjectMember{
    id: string;
    name: string;
    email: string;
    accessLevel:string
}

interface ProjectBasicInfo {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
    workspace: {
        id: string;
        name: string;
    };
    creator: {
        id: string;
        name: string;
        email: string;
    };
}

interface ProjectOverview {
    stats: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        totalComments: number;
        totalFiles: number;
        totalMembers: number;
    };
    tasksByStatus: {
        TODO: number;
        IN_PROGRESS: number;
        IN_REVIEW: number;
        COMPLETED: number;
        BACKLOG: number;
    };
    tasksByPriority: {
        LOW: number;
        MEDIUM: number;
        HIGH: number;
        CRITICAL: number;
    };
}

interface ProjectState {
    projects: Project[];
    projectsLoading: boolean;
    currentProject: ProjectBasicInfo | null;
    currentProjectLoading: boolean;
    deleting: boolean;
    overview: ProjectOverview | null; 
    overviewLoading: boolean;
    activities: Activity[];
    activitiesLoading: boolean;
    activitiesPagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    } | null;
    recentActivities: Activity[];           
    recentActivitiesLoading: boolean;
    members: ProjectMemberDetails[];
    membersLoading: boolean;
    availableMembers: AvailableMember[];
    availableMembersLoading: boolean;
    addingMembers: boolean;
    removingMember: boolean;
    error: string | null;
}


interface Activity {
    id: string;
    type: string;
    description: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
        email: string;
    };
}

interface ProjectMemberDetails {
    workspaceMemberId: string;
    userId: string;
    name: string;
    email: string;
    lastLogin: string | null;
    accessLevel: string;
    joinedAt: string;
}

interface AvailableMember {
    id: string;
    name: string;
    email: string;
    accessLevel: string;
    joinedAt: string;
}

interface CreateProjectData {
    name: string;
    description?: string;
    memberIds?: string[];
}

interface UpdateProjectData {
    name?: string;
    description?: string;
}

const initialState: ProjectState = {
    projects: [],
    projectsLoading: false,
    currentProject: null,
    currentProjectLoading: false,
    deleting: false,
    overview: null,
    overviewLoading: false,
    activities: [],
    activitiesLoading: false,
    activitiesPagination: null,
    recentActivities: [],
    recentActivitiesLoading: false,
    members: [],
    membersLoading: false,
    availableMembers: [],
    availableMembersLoading: false,
    addingMembers: false,
    removingMember: false,
    error: null,
};

export const createProject = createAsyncThunk(
    "project/create",
    async(
        { workspaceId, data }: { workspaceId: string; data: CreateProjectData }, {rejectWithValue}
    ) => {
        try{
            const response = await axiosInstance.post(
                `/api/v1/project/workspace/${workspaceId}/create`,
                data
            );
            return response.data.data.project;
        } catch(error:unknown){
            return rejectWithValue(handleAxiosError(error,"Failed to create project"));
        }
    }
);

export const fetchProjectBasicInfo = createAsyncThunk(
    "project/fetchBasicInfo",
    async(projectId: string, {rejectWithValue}) => {
        try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}`
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project info"));
        }
    }
);

export const fetchWorkspaceProjects = createAsyncThunk(
    "project/get",
    async(workspaceId: string, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/workspace/${workspaceId}`
            );
            return response.data.data.projects;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch projects"));
        }
    }
);

export const fetchProjectMembers = createAsyncThunk(
    "project/fetchMembers",
    async(projectId: string, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/members`
            );
            return response.data.data.members;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project members"));
        }
    }
);

export const fetchProjectActivities = createAsyncThunk(
    "project/fetchActivities",
    async({projectId, page = 1, limit = 20}: {projectId: string, page?: number, limit?: number}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/activities?page=${page}&limit=${limit}`
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project activities"));
        }
    }
);

export const fetchRecentProjectActivities = createAsyncThunk(
    "project/fetchRecentActivities",
    async({projectId, limit = 15}: {projectId: string, limit?: number}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/recent-activities?limit=${limit}`
            );
            return response.data.data.activities;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch recent activities"));
        }
    }
);

export const fetchProjectOverview = createAsyncThunk(
    "project/fetchOverview",
    async(projectId: string, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/overview`
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project overview"));
        }
    }
);

export const updateProject = createAsyncThunk(
    "project/update",
    async({projectId, data}: {projectId: string, data:UpdateProjectData}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.patch(
                `/api/v1/project/${projectId}`,
                data
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to update the project"));
        }
    }
);

export const deleteProject = createAsyncThunk(
    "project/delete",
    async(projectId: string, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.delete(
                `/api/v1/project/${projectId}`,
            );
            return projectId;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to delete the project"));
        }
    }
);

export const fetchAvailableMembers = createAsyncThunk(
    "project/fetchAvailableMembers",
    async(projectId: string, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/available-members`
            );
            return response.data.data.members;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch available members"));
        }
    }
);

export const addProjectMembers = createAsyncThunk(
    "project/addMembers",
    async({projectId, memberIds}: {projectId: string, memberIds: string[]}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.post(
                `/api/v1/project/${projectId}/members`,
                { memberIds }
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to add members"));
        }
    }
);

export const removeProjectMember = createAsyncThunk(
    "project/removeMember",
    async({projectId, userId}: {projectId: string, userId: string}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.delete(
                `/api/v1/project/${projectId}/members`,
                { data: { userId } }
            );
            return { removedUserId: userId, removedMember: response.data.data.removedMember };
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to remove member"));
        }
    }
);


const projectSlice = createSlice({
    name: "project",
    initialState,
    reducers:{
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentProject: (state) => {
            state.currentProject = null;
            state.overview = null;
            state.activities = [];
            state.activitiesPagination = null;
            state.recentActivities = [];
            state.members = [];
            state.error = null
        },
        clearProjects: (state) => {
            state.projects = [];
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            //create Project
            .addCase(createProject.pending, (state) => {
                state.projectsLoading = true;
                state.error = null;
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.projectsLoading = false;
                state.projects.push(action.payload);
                state.error = null;
            })
            .addCase(createProject.rejected, (state, action) => {
                state.projectsLoading = false;
                state.error = action.payload as string;
            })

            .addCase(fetchProjectBasicInfo.pending, (state) => {
                state.currentProjectLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectBasicInfo.fulfilled, (state, action: PayloadAction<ProjectBasicInfo>) => {
                state.currentProjectLoading = false;
                state.currentProject = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectBasicInfo.rejected, (state, action) => {
                state.currentProjectLoading = false;
                state.error = action.payload as string;
            })

            //fetch workspace projects
            .addCase(fetchWorkspaceProjects.pending, (state) => {
                state.projectsLoading = true;
                state.error = null;
            })
            .addCase(fetchWorkspaceProjects.fulfilled, (state,action: PayloadAction<Project[] | null>) => {
                state.projectsLoading = false;
                 if (action.payload !== null) {
                        state.projects = action.payload;
                    }
                state.error = null;
            })
            .addCase(fetchWorkspaceProjects.rejected, (state, action) => {
                state.projectsLoading = false;
                state.error = action.payload as string;
            })

            //fetch project members
            .addCase(fetchProjectMembers.pending, (state) => {
                state.membersLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectMembers.fulfilled, (state, action: PayloadAction<ProjectMemberDetails[]>) => {
                state.membersLoading = false;
                state.members = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectMembers.rejected, (state, action) => {
                state.membersLoading = false;
                state.error = action.payload as string
            })

            //fetch project activities
            .addCase(fetchProjectActivities.pending, (state) => {
                state.activitiesLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectActivities.fulfilled, (state, action) => {
                state.activitiesLoading = false;
                state.activities = action.payload.activities;
                state.activitiesPagination = action.payload.pagination;
                state.error = null;
            })
            .addCase(fetchProjectActivities.rejected, (state, action) => {
                state.activitiesLoading = false;
                state.error = action.payload as string;
            })

            //fetch project recent activities
            .addCase(fetchRecentProjectActivities.pending, (state) => {
                state.recentActivitiesLoading = true;
                state.error = null;
            })
            .addCase(fetchRecentProjectActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
                state.recentActivitiesLoading = false;
                state.recentActivities = action.payload;
                state.error = null;
            })
            .addCase(fetchRecentProjectActivities.rejected, (state,action) => {
                state.recentActivitiesLoading = false;
                state.error = action.payload as string;
            })

            //project overview
            .addCase(fetchProjectOverview.pending, (state) => {
                state.overviewLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectOverview.fulfilled, (state, action: PayloadAction<ProjectOverview>) => {
                state.overviewLoading = false;
                state.overview = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectOverview.rejected, (state, action) => {
                state.overviewLoading = false;
                state.error = action.payload as string;
            })

            //update project
            .addCase(updateProject.pending, (state) => {
                state.currentProjectLoading = true;
                state.error = null;
            })
            .addCase(updateProject.fulfilled, (state, action: PayloadAction<Project>) => {
                state.currentProjectLoading = false;

                // update current project detail if loaded
                if (state.currentProject && state.currentProject.id === action.payload.id) {
                    state.currentProject = {
                        ...state.currentProject,
                        name: action.payload.name,
                        description: action.payload.description,
                        updatedAt: action.payload.updatedAt,
                    };
                }

                // update list item
                const idx = state.projects.findIndex((p) => p.id === action.payload.id);
                if (idx !== -1) {
                    state.projects[idx] = {
                        ...state.projects[idx],
                        name: action.payload.name,
                        description: action.payload.description,
                        updatedAt: action.payload.updatedAt,
                    };
                }

                state.error = null;
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.currentProjectLoading = false;
                state.error = action.payload as string;
            })

            //delete project
            .addCase(deleteProject.pending, (state) => {
                state.deleting = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
                state.deleting = false;

                // remove from list
                //filter creates a new array excluding the current id
                state.projects = state.projects.filter((p) => p.id !== action.payload);

                // clear current project data if it was deleted
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = null;
                    state.overview = null;
                    state.activities = [];
                    state.activitiesPagination = null;
                    state.members = [];
                }

                state.error = null;
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.deleting = false;
                state.error = action.payload as string;
            })

            // Fetch available members
            .addCase(fetchAvailableMembers.pending, (state) => {
                state.availableMembersLoading = true;
                state.error = null;
            })
            .addCase(fetchAvailableMembers.fulfilled, (state, action: PayloadAction<AvailableMember[]>) => {
                state.availableMembersLoading = false;
                state.availableMembers = action.payload;
                state.error = null;
            })
            .addCase(fetchAvailableMembers.rejected, (state, action) => {
                state.availableMembersLoading = false;
                state.error = action.payload as string;
            })

            // Add project members
            .addCase(addProjectMembers.pending, (state) => {
                state.addingMembers = true;
                state.error = null;
            })
            .addCase(addProjectMembers.fulfilled, (state, action) => {
                state.addingMembers = false;
                
                // Backend returns: { addedCount: number, members: Array<{id, name, email}> }
                const addedMembers = action.payload.members;
                const addedUserIds = addedMembers.map((m: { id: string; name: string; email: string }) => m.id);
                
                // Remove added members from available members list
                state.availableMembers = state.availableMembers.filter(
                    member => !addedUserIds.includes(member.id)
                );
                
                // Note: Components should call fetchProjectMembers to refresh the members list
                // Or you can add the new members to state.members here if you have full member details
                
                state.error = null;
            })
            .addCase(addProjectMembers.rejected, (state, action) => {
                state.addingMembers = false;
                state.error = action.payload as string;
            })

            // Remove project member
            .addCase(removeProjectMember.pending, (state) => {
                state.removingMember = true;
                state.error = null;
            })
            .addCase(removeProjectMember.fulfilled, (state, action) => {
                state.removingMember = false;
                
                // Backend returns: { removedMember: {id, name, email} }
                const { removedUserId, removedMember } = action.payload;
                
                // Remove member from members list
                state.members = state.members.filter(
                    member => member.userId !== removedUserId
                );
                
                // Add removed member back to available members
                if (removedMember) {
                    state.availableMembers.push({
                        id: removedMember.id,
                        name: removedMember.name,
                        email: removedMember.email,
                        accessLevel: 'MEMBER', // Default access level
                        joinedAt: new Date().toISOString()
                    });
                }
                
                state.error = null;
            })
            .addCase(removeProjectMember.rejected, (state, action) => {
                state.removingMember = false;
                state.error = action.payload as string;
            })
            
            // Reset all project data on logout
            .addCase(resetAppState, () => initialState);
    }
});

export const { clearError, clearCurrentProject, clearProjects } = projectSlice.actions;

export default projectSlice.reducer;