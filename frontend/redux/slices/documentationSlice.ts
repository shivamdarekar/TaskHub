import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";
import { resetAppState } from "../actions/appActions";

interface DocumentationState {
  documentation: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  taskDocumentations: Record<string, string>; // taskId -> documentation
  projectDocumentations: Record<string, string>; // projectId -> documentation
}

const initialState: DocumentationState = {
  documentation: "",
  loading: false,
  saving: false,
  error: null,
  taskDocumentations: {},
  projectDocumentations: {},
};

// Get task documentation
export const fetchDocumentation = createAsyncThunk(
  "documentation/fetchDocumentation",
  async ({ projectId, taskId }: { projectId: string; taskId: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/documentation/project/${projectId}/task/${taskId}`);
      return response.data.data.documentation || "";
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch documentation"));
    }
  }
);

// Save task documentation
export const saveDocumentation = createAsyncThunk(
  "documentation/saveDocumentation",
  async ({ projectId, taskId, documentation }: { projectId: string; taskId: string; documentation: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`/api/v1/documentation/project/${projectId}/task/${taskId}`, {
        documentation,
      });
      return response.data.data.documentation;
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to save documentation"));
    }
  }
);

// Get project documentation
export const fetchProjectDocumentation = createAsyncThunk(
  "documentation/fetchProjectDocumentation",
  async (projectId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/api/v1/documentation/project/${projectId}`);
      return { projectId, content: response.data.data.content || "" };
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to fetch project documentation"));
    }
  }
);

// Save project documentation
export const saveProjectDocumentation = createAsyncThunk(
  "documentation/saveProjectDocumentation",
  async ({ projectId, content }: { projectId: string; content: string }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/api/v1/documentation/project/${projectId}`, {
        content,
      });
      return { projectId, content: response.data.data.content };
    } catch (error: unknown) {
      return rejectWithValue(handleAxiosError(error, "Failed to save project documentation"));
    }
  }
);

const documentationSlice = createSlice({
  name: "documentation",
  initialState,
  reducers: {
    clearDocumentationError: (state) => {
      state.error = null;
    },
    setDocumentation: (state, action) => {
      state.documentation = action.payload;
    },
    setTaskDocumentation: (state, action) => {
      const { taskId, documentation } = action.payload;
      state.taskDocumentations[taskId] = documentation;
    },
    setProjectDocumentation: (state, action) => {
      const { projectId, content } = action.payload;
      state.projectDocumentations[projectId] = content;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get task documentation
      .addCase(fetchDocumentation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocumentation.fulfilled, (state, action) => {
        state.loading = false;
        state.documentation = action.payload;
      })
      .addCase(fetchDocumentation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Save task documentation
      .addCase(saveDocumentation.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveDocumentation.fulfilled, (state, action) => {
        state.saving = false;
        state.documentation = action.payload;
      })
      .addCase(saveDocumentation.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      
      // Get project documentation
      .addCase(fetchProjectDocumentation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectDocumentation.fulfilled, (state, action) => {
        state.loading = false;
        const { projectId, content } = action.payload;
        state.projectDocumentations[projectId] = content;
        state.documentation = content;
      })
      .addCase(fetchProjectDocumentation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Save project documentation
      .addCase(saveProjectDocumentation.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(saveProjectDocumentation.fulfilled, (state, action) => {
        state.saving = false;
        const { projectId, content } = action.payload;
        state.projectDocumentations[projectId] = content;
        state.documentation = content;
      })
      .addCase(saveProjectDocumentation.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      })
      
      // Reset all documentation data on logout
      .addCase(resetAppState, () => initialState);
  },
});

export const { clearDocumentationError, setDocumentation, setTaskDocumentation, setProjectDocumentation } = documentationSlice.actions;
export default documentationSlice.reducer;