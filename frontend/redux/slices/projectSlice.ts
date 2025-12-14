import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

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
}

interface ProjectMember{
    id: string;
    name: string;
    email: string;
    accessLevel:string
}

interface ProjectDetails{
    id: string;
    name: string;
    description?: string;
    workspace:{
        id:string;
        name: string;
        ownerId: string
    };
    creator: {
        id: string;
        name: string;
        email: string;
    };
    members: ProjectMember[];
    totalComments: number;
    totalFiles: number;
    totalTasks: number;
    createdAt: string;
    updatedAt: string;
}

interface ProjectOverview{
    projectId: string;
    projectName: string;
    projectDescription?: string | null;
    workspace: {
        id: string;
        name: string;
    };
    stats: {
        totalTasks: number;
        completedTasks: number;
        overdueTasks: number;
        unassignedTasks: number;
        completionRate: number;
        totalMembers: number;
        totalComments: number;
        totalFiles: number;
        totalActivities: number;
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
    recentActivities: Activity[];
    createdAt: string;
    updatedAt: string;
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

interface CreateProjectData {
    name: string;
    description?: string;
    memberIds?: string[];
}

interface UpdateProjectData {
    name?: string;
    description?: string;
}

interface ProjectState {
    projects: Project[];
    projectsLoading: boolean;
    currentProject: ProjectDetails | null;
    currentProjectLoading: boolean;
    overview: ProjectOverview | null;
    overviewLoading: boolean;
    activities: Activity[];
    activitiesLoading: boolean;
    members: ProjectMemberDetails[];
    membersLoading: boolean;
    error: string | null;
}

const initialState: ProjectState = {
    projects: [],
    projectsLoading: false,
    currentProject: null,
    currentProjectLoading: false,
    overview: null,
    overviewLoading: false,
    activities: [],
    activitiesLoading: false,
    members: [],
    membersLoading: false,
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

export const fetchProjectById = createAsyncThunk(
    "project/fetchById",
    async(projectId: string, {rejectWithValue}) => {
        try{
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}`
            )
            return response.data.data
        } catch (error: unknown){
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project details"));
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
    async({projectId, limit}: {projectId: string, limit?: number}, {rejectWithValue}) => {
       try {
            const response = await axiosInstance.get(
                `/api/v1/project/${projectId}/activities${limit ? `?limit=${limit}` : ""}`
            );
            return response.data.data.activities;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project activities"));
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

            //fetch project by id
            .addCase(fetchProjectById.pending, (state) => {
                state.currentProjectLoading = true;
                state.error = null;
            })
            .addCase(fetchProjectById.fulfilled, (state,action: PayloadAction<ProjectDetails>) => {
                state.currentProjectLoading = false;
                state.currentProject = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectById.rejected, (state, action) => {
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
            .addCase(fetchProjectActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
                state.activitiesLoading = false;
                state.activities = action.payload;
                state.error = null;
            })
            .addCase(fetchProjectActivities.rejected, (state,action) => {
                state.activitiesLoading = false;
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
                state.projectsLoading = true;
                state.error = null;
            })
            .addCase(deleteProject.fulfilled, (state, action: PayloadAction<string>) => {
                state.projectsLoading = false;

                // remove from list
                //filter creates a new array excluding the current id
                state.projects = state.projects.filter((p) => p.id !== action.payload);

                // clear current project data if it was deleted
                if (state.currentProject?.id === action.payload) {
                    state.currentProject = null;
                    state.overview = null;
                    state.activities = [];
                    state.members = [];
                }

                state.error = null;
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.projectsLoading = false;
                state.error = action.payload as string;
            });
    }
});

export const { clearError, clearCurrentProject, clearProjects } = projectSlice.actions;

export default projectSlice.reducer;