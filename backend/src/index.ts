import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes";
import workspaceRoutes from "./routes/workspace.routes";
import projectRoutes from "./routes/project.routes"
import taskRoutes from "./routes/task.routes"
import commentRoutes from "./routes/comment.routes"
import documentationRoutes from "./routes/documentation.routes";
import inviteRoutes from "./routes/invite.routes";
import subscriptionRoutes from "./routes/subscription.routes";
import webhookRoutes from "./routes/webhook.routes";
import { errorHandler } from "./middleware/errorHandler";
import { helmetConfig, generalLimiter, corsOptions } from "./middleware/security";


const app = express();

// Security headers
app.use(helmetConfig);

// CORS configuration
app.use(cors(corsOptions));

// Webhook route (before body parser for raw body access)
app.use("/api/v1/webhook", express.raw({ type: "application/json" }), webhookRoutes);

app.use(express.json());
app.use(cookieParser());

// Apply general rate limiting to all API routes
app.use('/api/', generalLimiter);

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workspace", workspaceRoutes);
app.use("/api/v1/project", projectRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/comments", commentRoutes);
app.use("/api/v1/documentation", documentationRoutes);
app.use("/api/v1/invite", inviteRoutes);
app.use("/api/v1/subscription", subscriptionRoutes);

app.use(errorHandler);

export default app;