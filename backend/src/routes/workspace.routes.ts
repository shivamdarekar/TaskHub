import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { createWorkSpace, 
    getUserWorkspace, 
    getWorkspaceOverview,
    getWorkspaceById,
    getWorkspaceMembers,
} from "../controllers/workspace.controller";
import { validate } from "../config/validate";
import { createWorkspaceSchema } from "../config/schema";

const router = Router();

router.post("/create", verifyJWT, validate(createWorkspaceSchema), createWorkSpace);

router.get("/get", verifyJWT, getUserWorkspace);

router.get("/:workspaceId",verifyJWT,getWorkspaceById);

router.get("/:workspaceId/members", verifyJWT, getWorkspaceMembers);

router.get("/:workspaceId/overview",verifyJWT,getWorkspaceOverview);

export default router;