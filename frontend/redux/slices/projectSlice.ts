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
    members: ProjectMembers[];
    taskStats: {
        total: number;
        todo: number;
        inProgress: number;
        inReview: number;
        completed: number;
        backlog: number;
    };
    totalComments: number;
    totalFiles: number;
    totalActivities: number;
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
        profilePicture?: string | null;
    };
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
    currentProject: ProjectDetail | null;
    currentProjectLoading: boolean;
    overview: ProjectOverview | null;
    overviewLoading: boolean;
    activities: Activity[];
    activitiesLoading: boolean;
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
    error: null,
};