// App-wide constants

// OTP Configuration
export const OTP_LENGTH = 6;
export const OTP_EXPIRY_MINUTES = 10;

// Password Requirements
export const PASSWORD_MIN_LENGTH = 6;

// Name Requirements
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 50;

// UI Constants
export const LOGO_SIZE = "w-8 h-8";

// Pagination
export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;

// File Upload
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/gif", "application/pdf"];

// Subscription Plans
export const PLAN_PRICES = {
  FREE: { monthly: 0, yearly: 0 },
  PRO: { monthly: 499, yearly: 4800 },
  ENTERPRISE: { monthly: 1699, yearly: 16990 },
} as const;

export const PLAN_FEATURES = {
  FREE: [
    "1 Workspace",
    "Up to 5 Projects",
    "Up to 20 Tasks",
    "Basic Task Management",
    "2 Team Members",
  ],
  PRO: [
    "Up to 10 Workspaces",
    "Unlimited Projects",
    "Unlimited Tasks",
    "Team Collaboration (Up to 20 Members)",
    "Calendar View",
    "Project Timeline (Gantt Chart)",
    "File Storage (10 Files Per Task)",
  ],
  ENTERPRISE: [
    "Everything in Pro Plan",
    "Unlimited Workspaces",
    "Unlimited Team Collaboration",
    "Unlimited File Storage (Fair-use Policy Applies)",
    "Priority Support",
    "Advanced Security Features",
    "Custom Integrations",
  ],
} as const;

// Task Status Colors
export const TASK_STATUS_COLORS = {
  TODO: "bg-gray-100 text-gray-800",
  IN_PROGRESS: "bg-blue-100 text-blue-800",
  COMPLETED: "bg-green-100 text-green-800",
  IN_REVIEW: "bg-yellow-100 text-yellow-800",
  BACKLOG: "bg-purple-100 text-purple-800",
} as const;

// Task Priority Colors
export const TASK_PRIORITY_COLORS = {
  LOW: "bg-gray-100 text-gray-600",
  MEDIUM: "bg-yellow-100 text-yellow-700",
  HIGH: "bg-orange-100 text-orange-700",
  CRITICAL: "bg-red-100 text-red-700",
} as const;

// Animation Delays
export const ANIMATION_DELAYS = {
  SHORT: 100,
  MEDIUM: 200,
  LONG: 400,
} as const;

// Toast Duration
export const TOAST_DURATION = {
  SHORT: 1500,
  MEDIUM: 3000,
  LONG: 5000,
} as const;
