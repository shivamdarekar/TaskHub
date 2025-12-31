import { configureStore } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import { combineReducers } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import workspaceReducer from "./slices/workspaceSlice"
import projectReducer from "./slices/projectSlice"
import taskReducer from "./slices/taskSlice"
import commentReducer from "./slices/commentSlice"
import documentationReducer from "./slices/documentationSlice"

// Create storage that works with SSR
let storage;

if (typeof window !== "undefined") {
  // Browser environment - use localStorage
  storage = require("redux-persist/lib/storage").default;
} else {
  // Server environment - use noop storage
  storage = {
    getItem(_key: string) {
      return Promise.resolve(null);
    },
    setItem(_key: string, value: any) {
      return Promise.resolve(value);
    },
    removeItem(_key: string) {
      return Promise.resolve();
    },
  };
}

const documentationPersistConfig = {
  key: 'documentation',
  storage,
  whitelist: ['taskDocumentations'] // Only persist the task-specific documentation
};

const rootReducer = combineReducers({
  auth: authReducer,
  workspace: workspaceReducer,
  project: projectReducer,
  task: taskReducer,
  comment: commentReducer,
  documentation: persistReducer(documentationPersistConfig, documentationReducer),
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/PURGE'],
            },
        }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;