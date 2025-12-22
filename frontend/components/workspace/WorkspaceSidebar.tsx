"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAppSelector, useAppDispatch } from "@/redux/hooks";

import {
  Home,
  ListChecks,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Plus,
  LayoutGrid,
  LogOut,
  User,
  Menu,
  X,
  ChevronsUpDown
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { clearUser, logoutUser } from "@/redux/slices/authSlice";
import CreateProjectDialog from "./CreateProjectDialog";

interface SidebarProps {
  workspaceId: string;
}

export default function WorkspaceSidebar({ workspaceId }: SidebarProps) {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  // Redux state
  const { currentWorkspace, workspaces } = useAppSelector(
    (state) => state.workspace
  );

  const {projects} = useAppSelector((state) => state.project);
  const { user } = useAppSelector((state) => state.auth);

  // MENU ITEMS
  const menuItems = [
    {
      label: "Home",
      icon: Home,
      href: `/workspace/${workspaceId}`,
      active:
        params.workspaceId === workspaceId &&
        !params.projectId &&
        (params.section === undefined || params.section === null),
    },
    {
      label: "My Tasks",
      icon: ListChecks,
      href: `/workspace/${workspaceId}/tasks`,
      active: params.section === "tasks",
    },
    {
      label: "Members",
      icon: Users,
      href: `/workspace/${workspaceId}/members`,
      active: params.section === "members",
    },
    {
      label: "Settings",
      icon: Settings,
      href: `/workspace/${workspaceId}/settings`,
      active: params.section === "settings",
    },
  ];

  // SWITCH WORKSPACE
  const handleWorkspaceChange = (newWorkspaceId: string) => {
    router.push(`/workspace/${newWorkspaceId}`);
  };

  const handleLogout = async () => {
  try {
    await dispatch(logoutUser()).unwrap();
    dispatch(clearUser());
    router.push("/"); 
  } catch (error) {
    console.error("Logout failed:", error);
    // Even if API fails, clear local state and redirect
    dispatch(clearUser());
    router.push("/login");
  }
};

  // Generate consistent color for workspace based on name
  const getWorkspaceColor = (name: string) => {
    const colors = [
      { bg: "bg-blue-500", text: "text-blue-600", lightBg: "bg-blue-100" },
      { bg: "bg-purple-500", text: "text-purple-600", lightBg: "bg-purple-100" },
      { bg: "bg-green-500", text: "text-green-600", lightBg: "bg-green-100" },
      { bg: "bg-orange-500", text: "text-orange-600", lightBg: "bg-orange-100" },
      { bg: "bg-pink-500", text: "text-pink-600", lightBg: "bg-pink-100" },
      { bg: "bg-indigo-500", text: "text-indigo-600", lightBg: "bg-indigo-100" },
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      {/* MOBILE NAVBAR */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TaskHub</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileOpen(true)}
          className="h-10 w-10"
        >
          <Menu className="h-6 w-6" />
        </Button>
      </div>

      {/* MOBILE OVERLAY */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* SIDEBAR MAIN WRAPPER */}
      <aside
        className={cn(
          "h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out shadow-sm",
          "md:relative fixed top-0 left-0 z-50",
          isCollapsed ? "w-16" : "w-64",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* HEADER */}
        <div className="md:h-16 border-b border-gray-200 flex items-center justify-between px-4 bg-white">
          {/* CLOSE ICON FOR MOBILE */}
          <div className="md:hidden w-full flex justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileOpen(false)}
            className="h-9 w-9  rounded-full hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </Button>
          </div>
          {/* DESKTOP LOGO */}
          {!isCollapsed && (
            <div className="hidden md:flex items-center gap-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">TaskHub</span>
            </div>
          )}

          {/* COLLAPSE BUTTON FOR DESKTOP */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex h-8 w-8 hover:bg-gray-100"
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* WORKSPACE SELECTOR */}
        <div className="p-3 border-b border-gray-100 bg-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 transition-all hover:shadow-sm",
                  isCollapsed && "justify-center"
                )}
              >
                <div className={cn(
                  "h-8 w-8 md:h-9 md:w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  getWorkspaceColor(currentWorkspace?.name || "W").bg
                )}>
                  <span className="text-white text-sm font-semibold">
                    {currentWorkspace?.name?.charAt(0).toUpperCase() || "W"}
                  </span>
                </div>

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {currentWorkspace?.name || "Workspace"}
                      </p>
                      <p className="text-xs text-gray-500">{currentWorkspace?.description}</p>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 text-gray-500 shrink-0" />
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-56">
              <div className="px-2 py-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase">
                  Workspaces
                </p>
              </div>

              {workspaces.length === 0 ? (
                <div className="px-2 py-2 text-xs text-gray-500">
                  No workspaces found
                </div>
              ) : (
                workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() => handleWorkspaceChange(ws.id)}
                    className="cursor-pointer"
                  >
                    <div className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center mr-2",
                      getWorkspaceColor(ws.name).bg
                    )}>
                      <span className="text-white text-xs font-semibold">
                        {ws.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="truncate">{ws.name}</span>
                  </DropdownMenuItem>
                ))
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => router.push(`/workspace/create?from=/workspace/${workspaceId}`)}
                className="cursor-pointer"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Workspace
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* SIDEBAR MENUS */}
        <div className="flex-1 overflow-y-auto py-3">
          {/* MENU SECTION */}
          <div className="px-3 mb-4">
            {!isCollapsed && (
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 px-2">
                Menu
              </p>
            )}

            <nav className="space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.label}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "w-full flex items-center gap-1.5 md:gap-3 px-3 py-2.5 rounded-lg transition-all text-xs md:text-sm font-medium cursor-pointer",
                      isCollapsed && "justify-center",
                      item.active
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                    )}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                    {!isCollapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* PROJECT SECTION */}
          <div className="px-3">
            {!isCollapsed && (
              <div className="flex items-center justify-between mb-2 px-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Projects
                </p>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-blue-50 hover:text-blue-600"
                  onClick={() => setCreateProjectOpen(true)}
                  title="Create new Project"
                >
                  <Plus className="h-5 w-5" />
                </Button>
              </div>
            )}

            {/* Collapsed view */}
            {isCollapsed ? (
              <button
                className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 transition-colors"
                title="Projects"
              >
                <FolderKanban className="h-5 w-5 text-gray-700" />
              </button>
            ) : (
              <nav className="space-y-0.5">
                {projects.length === 0 ? (
                  <p className="text-xs text-gray-500 px-2 py-2">
                    No projects yet
                  </p>
                ) : (
                  <>
                    {projects.slice(0, 5).map((project) => {
                      const isActive = params.projectId === project.id;
                      return (
                        <button
                          key={project.id}
                          onClick={() =>
                            router.push(
                              `/workspace/${workspaceId}/projects/${project.id}`
                            )
                          }
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors group",
                            isActive
                              ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 shadow-sm"
                              : "text-gray-700 hover:bg-gray-100"
                          )}
                        >
                          <FolderKanban className={cn(
                            "h-4 w-4 shrink-0",
                            isActive ? "text-blue-600" : "text-gray-500 group-hover:text-blue-600"
                          )} />
                          <span className="truncate">{project.name}</span>
                        </button>
                      );
                    })}
                    
                    {projects.length > 5 && (
                      <button
                        onClick={() => router.push(`/workspace/${workspaceId}/projects`)}
                        className="w-full flex items-center gap-3 px-3 py-1.5 rounded-lg text-sm transition-colors text-blue-600 hover:bg-blue-50 font-medium"
                      >
                        <LayoutGrid className="h-4 w-4 shrink-0" />
                        <span>Show All ({projects.length})</span>
                      </button>
                    )}
                  </>
                )}
              </nav>
            )}
          </div>
        </div>

        {/* USER FOOTER */}
        <div className="border-t border-gray-200 p-3 bg-white">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  "w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-100 transition-all hover:shadow-sm",
                  isCollapsed && "justify-center"
                )}
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center shrink-0 shadow-sm">
                  <User className="h-4 w-4 text-white" />
                </div>

                {!isCollapsed && (
                  <div className="flex-1 text-left overflow-hidden">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="cursor-pointer"
              >
                Profile Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer text-red-600"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Create Project Dialog */}
      <CreateProjectDialog
        open={createProjectOpen}
        onOpenChange={setCreateProjectOpen}
        workspaceId={workspaceId}
      />
    </>
  );
}
