import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { hasProjectAccess, verifyTaskExists, canModifyTask, hasWorkspaceAccess } from "../middleware/roleCheck.middleware";
import { validate } from "../config/validate";
import { createTaskSchema, updateTaskSchema } from "../config/schema";
import {
    createTask,
    getTaskById,
    getProjectTasks,
    getKanbanTasks,
    updateTask,
    deleteTask,
    moveTaskKanban,
    getCalendarTasks,
    getTimelineTasks,
    getUserTasks
} from "../controllers/task.controller";


const router = Router();
router.use(verifyJWT);

//workspace level tasks
router.get("/workspace/:workspaceId/my-tasks", hasWorkspaceAccess, getUserTasks);

//project level tasks
router.post("/project/:projectId/create", hasProjectAccess, validate(createTaskSchema), createTask);

router.get("/project/:projectId/tasks", hasProjectAccess, getProjectTasks);

router.get("/project/:projectId/kanban", hasProjectAccess, getKanbanTasks);

router.get("/project/:projectId/calender", hasProjectAccess, getCalendarTasks);

router.get("/project/:projectId/timeline", hasProjectAccess, getTimelineTasks);

//individual task oprations
router.get("/project/:projectId/get/:taskId", verifyTaskExists, getTaskById);

router.patch("/project/:projectId/update/:taskId", verifyTaskExists, canModifyTask, validate(updateTaskSchema), updateTask);

router.delete("/project/:projectId/delete/:taskId", verifyTaskExists, canModifyTask, deleteTask);

router.patch("/project/:projectId/kanban/:taskId", verifyTaskExists, canModifyTask, moveTaskKanban);

export default router;