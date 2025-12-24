import { Router } from "express";
import { saveTaskDocumentation, getTaskDocumentation } from "../controllers/documentation.controller";
import {verifyJWT} from "../middleware/auth.middleware";
import { verifyTaskExists } from "../middleware/roleCheck.middleware";

const router = Router();

router.use(verifyJWT);

// Get documentation for a task
// Save/update documentation for a task
router.get("/project/:projectId/task/:taskId", verifyTaskExists, getTaskDocumentation);
router.post("/project/:projectId/task/:taskId", verifyTaskExists, saveTaskDocumentation);

export default router;
