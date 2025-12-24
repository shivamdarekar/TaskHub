import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes";
import workspaceRoutes from "./routes/workspace.routes";
import projectRoutes from "./routes/project.routes"
import taskRoutes from "./routes/task.routes"
import commentRoutes from "./routes/comment.routes"
import documentationRoutes from "./routes/documentation.routes";
import { errorHandler } from "./middleware/errorHandler";


const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000', // Specific origin
  credentials: true,  // Allow credentials
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// // Debug middleware - remove after fixing
// app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path}`);
//     console.log('Content-Type:', req.headers['content-type']);
//     console.log('Body:', req.body);
//     next();
// });

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/documentation", documentationRoutes);

app.use(errorHandler);

export default app;