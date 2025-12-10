import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasProjectAccess,
  canManageProject,
  isWorkspaceOwner
} from "../middleware/roleCheck.middleware";
import {
  createProject,
getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  getProjectActivities,
  getProjectOverview,
  getWorkspaceProjects
} from "../controllers/project.controller";


const router = Router();
router.use(verifyJWT);

router.post("/workspace/:workspaceId/create",
    isWorkspaceOwner,
    createProject
);

router.get(
  "/workspace/:workspaceId",
  hasWorkspaceAccess,
  getWorkspaceProjects
);

router.get("/:projectId", hasProjectAccess, getProjectById);

router.get("/:projectId/members", hasProjectAccess, getProjectMembers);

router.get("/:projectId/activities", hasProjectAccess, getProjectActivities);

router.get("/:projectId/overview", hasProjectAccess, getProjectOverview);

router.patch("/:projectId", canManageProject, updateProject);

router.delete("/:projectId", canManageProject, deleteProject);

export default router;

