import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import {
  hasWorkspaceAccess,
  hasProjectAccess,
  canManageProject,
  isWorkspaceOwner
} from "../middleware/roleCheck.middleware";
import { validate } from "../config/validate";
import { createProjectSchema, updateProjectSchema, addProjectMembersSchema, removeProjectMemberSchema } from "../config/schema";
import {
  createProject,
  getProjectBasicInfo,
  updateProject,
  deleteProject,
  getProjectMembers,
  getProjectActivities,
  getProjectOverview,
  getWorkspaceProjects,
  getRecentProjectActivities,
  addProjectMembers,
  removeProjectMember,
  getAvailableMembers
} from "../controllers/project.controller";


const router = Router();
router.use(verifyJWT);

router.post("/workspace/:workspaceId/create",
    isWorkspaceOwner,
    validate(createProjectSchema),
    createProject
);

router.get(
  "/workspace/:workspaceId",
  hasWorkspaceAccess,
  getWorkspaceProjects
);

router.get("/:projectId", hasProjectAccess, getProjectBasicInfo);

router.get("/:projectId/members", hasProjectAccess, getProjectMembers);

router.get("/:projectId/activities", hasProjectAccess, getProjectActivities);

router.get("/:projectId/recent-activities",hasProjectAccess, getRecentProjectActivities)

router.get("/:projectId/overview", hasProjectAccess, getProjectOverview);

router.patch("/:projectId", canManageProject, validate(updateProjectSchema), updateProject);

router.delete("/:projectId", canManageProject, deleteProject);

// Project member management routes
router.get("/:projectId/available-members", canManageProject, getAvailableMembers);

router.post("/:projectId/members", canManageProject, validate(addProjectMembersSchema), addProjectMembers);

router.delete("/:projectId/members", canManageProject, validate(removeProjectMemberSchema), removeProjectMember);

export default router;

