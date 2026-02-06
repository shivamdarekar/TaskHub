import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { createWorkSpace, 
    getUserWorkspace, 
    getWorkspaceOverview,
    getWorkspaceById,
    getWorkspaceMembers,
    updateWorkspace,
    deleteWorkspace,
    removeMember,
    getMemberProjects,
    updateMemberAccess,
    transferOwnership
} from "../controllers/workspace.controller";
import { validate } from "../config/validate";
import { createWorkspaceSchema } from "../config/schema";
import { hasWorkspaceAccess, isWorkspaceOwner } from "../middleware/roleCheck.middleware";

const router = Router();
router.use(verifyJWT);

router.post("/create", validate(createWorkspaceSchema), createWorkSpace);

router.get("/get", getUserWorkspace);

router.get("/:workspaceId", hasWorkspaceAccess,getWorkspaceById);

router.get("/:workspaceId/members", hasWorkspaceAccess, getWorkspaceMembers);

router.get("/:workspaceId/members/:memberId/projects", hasWorkspaceAccess, getMemberProjects);

router.get("/:workspaceId/overview", hasWorkspaceAccess, getWorkspaceOverview);

router.patch("/:workspaceId/update", isWorkspaceOwner, updateWorkspace);

router.patch("/:workspaceId/members/:memberId/access", isWorkspaceOwner, updateMemberAccess);

router.patch("/:workspaceId/transfer-ownership", isWorkspaceOwner, transferOwnership);

router.delete("/:workspaceId/delete", isWorkspaceOwner, deleteWorkspace);

router.delete("/:workspaceId/members/:memberId", isWorkspaceOwner, removeMember);

export default router;