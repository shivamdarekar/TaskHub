import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware";
import { isWorkspaceOwner } from "../middleware/roleCheck.middleware";
import {
    createWorkspaceInvite,
    getInviteDetails,
    joinWorkspaceViaInvite,
    resetInviteLink,
} from "../controllers/invite.controller";
import { 
    inviteLimiter, 
    joinWorkspaceLimiter, 
    createInviteLimiter 
} from "../middleware/rateLimiter";
import { canAddWorkspaceMembers } from "../middleware/subscriptionLimit.middleware";

const router = Router();

// Public route - Get invite details (no auth required but rate limited)
// Used to display workspace info on join page before authentication
router.get("/:workspaceId/join/:inviteToken", inviteLimiter, getInviteDetails);

// Protected routes - Require authentication
router.use(verifyJWT);

// Create workspace invite (owner only, with rate limiting and member limit check)
// Can send email invite or generate shareable link
router.post("/:workspaceId/create", isWorkspaceOwner, canAddWorkspaceMembers, createInviteLimiter, createWorkspaceInvite);

// Join workspace via invite token (authenticated users only, strict rate limiting, member limit check)
router.post("/:workspaceId/join/:inviteToken", canAddWorkspaceMembers, joinWorkspaceLimiter, joinWorkspaceViaInvite);

// Reset/revoke invite link (owner only, with rate limiting)
// Deletes old links and generates new token
router.post("/:workspaceId/reset", isWorkspaceOwner, createInviteLimiter, resetInviteLink);

export default router;