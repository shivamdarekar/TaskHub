import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/user.routes";
import workspaceRoutes from "./routes/workspace.routes";
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


//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/workspace", workspaceRoutes);

app.use(errorHandler);

export default app;