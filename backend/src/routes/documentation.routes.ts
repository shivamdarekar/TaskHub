import { Router } from "express";
import { saveTaskDocumentation, getTaskDocumentation, saveProjectDocumentation, getProjectDocumentation } from "../controllers/documentation.controller";
import {verifyJWT} from "../middleware/auth.middleware";
import { verifyTaskExists, hasProjectAccess } from "../middleware/roleCheck.middleware";

const router = Router();

router.use(verifyJWT);

// Task documentation routes
router.get("/project/:projectId/task/:taskId", verifyTaskExists, getTaskDocumentation);
router.post("/project/:projectId/task/:taskId", verifyTaskExists, saveTaskDocumentation);

// Project documentation routes
router.get("/project/:projectId", hasProjectAccess, getProjectDocumentation);
router.put("/project/:projectId", hasProjectAccess, saveProjectDocumentation);

export default router;
