import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface User {
    id: string;
    name: string;
    email: string;
    profilePicture?: string;
}

interface Task {
    id: string;
    title: string;
}

export interface Comment {
    id: string;
    content: string;
    userId: string;
    taskId: string;
    projectId: string;
    createdAt: string;
    updatedAt: string;
    user: User;
    task?: Task;
}

interface CommentState {
    comments: Comment[];
    commentsLoading: boolean;
    taskComments: Comment[];
    taskCommentsLoading: boolean;
    recentComments: Comment[];
    recentCommentsLoading: boolean;
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    } | null;
    error: string | null;
}

const initialState: CommentState = {
    comments: [],
    commentsLoading: false,
    taskComments: [],
    taskCommentsLoading: false,
    recentComments: [],
    recentCommentsLoading: false,
    pagination: null,
    error: null,
};

interface AddCommentData {
    projectId: string;
    taskId: string;
    content: string;
}

interface UpdateCommentData {
    commentId: string;
    content: string;
}

interface GetProjectCommentsParams {
    projectId: string;
    page?: number;
    limit?: number;
}

interface GetRecentCommentsParams {
    projectId: string;
    limit?: number;
}

// Add Comment
export const addComment = createAsyncThunk(
    "comment/addComment",
    async (data: AddCommentData, { rejectWithValue }) => {
        try {
            const { projectId, taskId, content } = data;
            const response = await axiosInstance.post(
                `/api/v1/comments/project/${projectId}/task/${taskId}`,
                { content }
            );
            return response.data.data.comment;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to add comment"));
        }
    }
);

// Get Project Comments (with pagination)
export const getProjectComments = createAsyncThunk(
    "comment/getProjectComments",
    async (params: GetProjectCommentsParams, { rejectWithValue }) => {
        try {
            const { projectId, page, limit } = params;
            const response = await axiosInstance.get(
                `/api/v1/comments/project/${projectId}`,
                { params: { page, limit } }
            );
            return response.data.data;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch project comments"));
        }
    }
);

// Get Recent Project Comments
export const getRecentProjectComments = createAsyncThunk(
    "comment/getRecentProjectComments",
    async (params: GetRecentCommentsParams, { rejectWithValue }) => {
        try {
            const { projectId, limit } = params;
            const response = await axiosInstance.get(
                `/api/v1/comments/project/${projectId}/recent`,
                { params: { limit } }
            );
            return response.data.data.comments;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch recent comments"));
        }
    }
);

// Get Task Comments
export const getTaskComments = createAsyncThunk(
    "comment/getTaskComments",
    async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.get(
                `/api/v1/comments/project/${projectId}/task/${taskId}/get`
            );
            return response.data.data.comments;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to fetch task comments"));
        }
    }
);

// Update Comment
export const updateComment = createAsyncThunk(
    "comment/updateComment",
    async (data: UpdateCommentData, { rejectWithValue }) => {
        try {
            const response = await axiosInstance.patch(
                `/api/v1/comments/${data.commentId}/update`,
                { content: data.content }
            );
            return response.data.data.comment;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to update comment"));
        }
    }
);

// Delete Comment
export const deleteComment = createAsyncThunk(
    "comment/deleteComment",
    async (commentId: string, { rejectWithValue }) => {
        try {
            await axiosInstance.delete(`/api/v1/comments/${commentId}/delete`);
            return commentId;
        } catch (error: unknown) {
            return rejectWithValue(handleAxiosError(error, "Failed to delete comment"));
        }
    }
);

const commentSlice = createSlice({
    name: "comment",
    initialState,
    reducers: {
        clearCommentError: (state) => {
            state.error = null;
        },
        clearComments: (state) => {
            state.comments = [];
            state.pagination = null;
        },
        clearTaskComments: (state) => {
            state.taskComments = [];
        },
        clearRecentComments: (state) => {
            state.recentComments = [];
        },
        //  add comment
        addCommentOptimistic: (state, action: PayloadAction<Comment>) => {
            state.taskComments.unshift(action.payload);
        },
        // update comment
        updateCommentOptimistic: (state, action: PayloadAction<{ commentId: string; content: string }>) => {
            const comment = state.taskComments.find(c => c.id === action.payload.commentId);
            if (comment) {
                comment.content = action.payload.content;
            }
            const projectComment = state.comments.find(c => c.id === action.payload.commentId);
            if (projectComment) {
                projectComment.content = action.payload.content;
            }
        },
        // delete comment
        deleteCommentOptimistic: (state, action: PayloadAction<string>) => {
            state.taskComments = state.taskComments.filter(c => c.id !== action.payload);
            state.comments = state.comments.filter(c => c.id !== action.payload);
        },
    },
    extraReducers: (builder) => {
        builder
            // Add Comment
            .addCase(addComment.pending, (state) => {
                state.error = null;
            })
            .addCase(addComment.fulfilled, (state, action) => {
                state.taskComments.unshift(action.payload);
            })
            .addCase(addComment.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Get Project Comments
            .addCase(getProjectComments.pending, (state) => {
                state.commentsLoading = true;
                state.error = null;
            })
            .addCase(getProjectComments.fulfilled, (state, action) => {
                state.commentsLoading = false;
                state.comments = action.payload.comments;
                state.pagination = action.payload.pagination;
            })
            .addCase(getProjectComments.rejected, (state, action) => {
                state.commentsLoading = false;
                state.error = action.payload as string;
            })

            // Get Recent Project Comments
            .addCase(getRecentProjectComments.pending, (state) => {
                state.recentCommentsLoading = true;
                state.error = null;
            })
            .addCase(getRecentProjectComments.fulfilled, (state, action) => {
                state.recentCommentsLoading = false;
                state.recentComments = action.payload;
            })
            .addCase(getRecentProjectComments.rejected, (state, action) => {
                state.recentCommentsLoading = false;
                state.error = action.payload as string;
            })

            // Get Task Comments
            .addCase(getTaskComments.pending, (state) => {
                state.taskCommentsLoading = true;
                state.error = null;
            })
            .addCase(getTaskComments.fulfilled, (state, action) => {
                state.taskCommentsLoading = false;
                state.taskComments = action.payload;
            })
            .addCase(getTaskComments.rejected, (state, action) => {
                state.taskCommentsLoading = false;
                state.error = action.payload as string;
            })

            // Update Comment
            .addCase(updateComment.pending, (state) => {
                state.error = null;
            })
            .addCase(updateComment.fulfilled, (state, action) => {
                const taskCommentIndex = state.taskComments.findIndex(c => c.id === action.payload.id);
                if (taskCommentIndex !== -1) {
                    state.taskComments[taskCommentIndex] = action.payload;
                }
                const commentIndex = state.comments.findIndex(c => c.id === action.payload.id);
                if (commentIndex !== -1) {
                    state.comments[commentIndex] = action.payload;
                }
            })
            .addCase(updateComment.rejected, (state, action) => {
                state.error = action.payload as string;
            })

            // Delete Comment
            .addCase(deleteComment.pending, (state) => {
                state.error = null;
            })
            .addCase(deleteComment.fulfilled, (state, action) => {
                state.taskComments = state.taskComments.filter(c => c.id !== action.payload);
                state.comments = state.comments.filter(c => c.id !== action.payload);
                state.recentComments = state.recentComments.filter(c => c.id !== action.payload);
            })
            .addCase(deleteComment.rejected, (state, action) => {
                state.error = action.payload as string;
            });
    },
});

export const {
    clearCommentError,
    clearComments,
    clearTaskComments,
    clearRecentComments,
    addCommentOptimistic,
    updateCommentOptimistic,
    deleteCommentOptimistic,
} = commentSlice.actions;

export default commentSlice.reducer;
