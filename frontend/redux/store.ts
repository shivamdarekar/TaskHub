import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import workspaceReducer from "./slices/workspaceSlice"
import projectReducer from "./slices/projectSlice"
import taskReducer from "./slices/taskSlice"
import commentReducer from "./slices/commentSlice"

export const store = configureStore({
    reducer: {
        auth: authReducer,
        workspace: workspaceReducer,
        project: projectReducer,
        task: taskReducer,
        comment: commentReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false,
        }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;