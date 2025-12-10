"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    fetchWorkspaceById,
    fetchUserWorkspaces,
    clearWorkspaceData
} from "@/redux/slices/workspaceSlice";
import { Loader2 } from "lucide-react";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const dispatch = useAppDispatch();

    const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);

    const { isAuthenticated, authLoading } = useAppSelector((state) => state.auth);
    const { workspaces, loading: workspacesLoading, currentWorkspace } = useAppSelector((state) => state.workspace);

    //Redirect unauthenticated users
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.replace("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    //Fetch user workspaces & ensure user has at least one
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            if (workspaces.length === 0 && !workspacesLoading) {
                dispatch(fetchUserWorkspaces())
                    .unwrap()
                    .then((fetched) => {
                        if (fetched.length === 0) {
                            router.replace("/workspace/create");
                        }
                        setCheckingWorkspaces(false);
                    })
                    .catch(() => setCheckingWorkspaces(false));
            } else {
                setCheckingWorkspaces(false);
            }
        }
    }, [
        isAuthenticated,
        authLoading,
        workspaces.length,
        workspacesLoading,
        dispatch,
        router,
    ]);

    // Fetch Workspace Details when workspace switch
    useEffect(() => {
        if (!authLoading && isAuthenticated && !checkingWorkspaces) {
            if (!currentWorkspace || currentWorkspace.id !== workspaceId) {
                dispatch(clearWorkspaceData());
                dispatch(fetchWorkspaceById(workspaceId as string));
            }
        }
    }, [
        workspaceId,
        currentWorkspace,
        checkingWorkspaces,
        isAuthenticated,
        authLoading,
        dispatch,
    ]);

    //Global loading screen
    if (authLoading || checkingWorkspaces || !isAuthenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            <WorkspaceSidebar workspaceId={workspaceId as string} />
            <main className="flex-1 overflow-auto lg:ml-0 pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
