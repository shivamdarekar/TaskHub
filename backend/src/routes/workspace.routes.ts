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
import { hasWorkspaceAccess } from "../middleware/roleCheck.middleware";

const router = Router();
router.use(verifyJWT);

router.post("/create", validate(createWorkspaceSchema), createWorkSpace);

router.get("/get", hasWorkspaceAccess, getUserWorkspace);

router.get("/:workspaceId", hasWorkspaceAccess,getWorkspaceById);

router.get("/:workspaceId/members", hasWorkspaceAccess, getWorkspaceMembers);

router.get("/:workspaceId/overview", getWorkspaceOverview);

export default router;