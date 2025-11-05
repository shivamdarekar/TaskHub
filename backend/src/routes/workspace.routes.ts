import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { createWorkSpace, getUserWorkspace } from "../controllers/workspace.controller";

const router = Router();

router.post("/create", verifyJWT, createWorkSpace);

router.get("/get", verifyJWT, getUserWorkspace);

export default router;