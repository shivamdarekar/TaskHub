import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { hasProjectAccess, verifyTaskExists } from "../middleware/roleCheck.middleware";
import {
  addComment,
  getTaskComments,
  getProjectComments,
  getRecentProjectComments,
  updateComment,
  deleteComment,
} from "../controllers/comment.controller";

const router = Router();
router.use(verifyJWT);

//project-level comment
router.get("/project/:projectId", hasProjectAccess, getProjectComments);

router.get("/project/:projectId/recent", hasProjectAccess, getRecentProjectComments);

//task-level comment routes
router.post("/project/:projectId/task/:taskId", verifyTaskExists, addComment);

router.get("/project/:projectId/task/:taskId/get", verifyTaskExists, getTaskComments);

//individual comment routes(owner only)
router.patch("/:commentId/update", updateComment);

router.delete("/:commentId/delete", deleteComment);

export default router;