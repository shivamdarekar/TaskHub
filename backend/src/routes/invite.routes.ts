import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { isWorkspaceOwner } from "../middleware/roleCheck.middleware";
import {
    createWorkspaceInvite,
    getInviteDetails,
    joinWorkspaceViaInvite,
    resetInviteLink,
} from "../controllers/invite.controller";

const router = Router();

// Public route - Get invite details (no auth required)
// Used to display workspace info on join page before authentication
router.get("/:workspaceId/join/:inviteToken", getInviteDetails);

// Protected routes - Require authentication
router.use(verifyJWT);

// Create workspace invite (owner only)
// Can send email invite or generate shareable link
router.post("/:workspaceId/create", isWorkspaceOwner, createWorkspaceInvite);

// Join workspace via invite token (authenticated users only)
router.post("/:workspaceId/join/:inviteToken", joinWorkspaceViaInvite);

// Reset/revoke invite link (owner only)
// Deletes old links and generates new token
router.post("/:workspaceId/reset", isWorkspaceOwner, resetInviteLink);

export default router;