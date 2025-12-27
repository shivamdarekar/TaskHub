import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../api/axiosInstance";
import { handleAxiosError } from "../api/axiosError";

interface DocumentationState {
  documentation: string;
  loading: boolean;
  saving: boolean;
  error: string | null;
  taskDocumentations: Record<string, string>; // taskId -> documentation
}

const initialState: DocumentationState = {
  documentation: "",
  loading: false,
  saving: false,
  error: null,
  taskDocumentations: {},
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
  },
  extraReducers: (builder) => {
    builder
      // Get documentation
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
      
      // Save documentation
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
      });
  },
});

export const { clearDocumentationError, setDocumentation, setTaskDocumentation } = documentationSlice.actions;
export default documentationSlice.reducer;