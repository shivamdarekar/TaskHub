"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import {
    fetchWorkspaceById,
    fetchUserWorkspaces,
    clearWorkspaceData,
} from "@/redux/slices/workspaceSlice";

import {
    fetchWorkspaceProjects,
    clearProjects
} from "@/redux/slices/projectSlice";

import { Loader2 } from "lucide-react";
import WorkspaceSidebar from "@/components/workspace/WorkspaceSidebar";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { workspaceId } = useParams<{ workspaceId: string }>();

    const { isAuthenticated, authLoading } = useAppSelector((state) => state.auth);
    const { workspaces, loading: workspacesLoading, currentWorkspace } =
        useAppSelector((state) => state.workspace);

    const [checkingWorkspaces, setCheckingWorkspaces] = useState(true);
    const [hasFetchedWorkspace, setHasFetchedWorkspace] = useState(false);
    const hasRedirectedToLoginRef = useRef(false);

    useEffect(() => {
        if (!authLoading && !isAuthenticated && !hasRedirectedToLoginRef.current) {
            hasRedirectedToLoginRef.current = true;
            router.replace("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    //Fetch user workspaces & ensure user has at least one
    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            if (workspaces.length === 0 && !workspacesLoading) {
                dispatch(fetchUserWorkspaces())
                    .unwrap()
                    .then((list) => {
                        if (list.length === 0) {
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
        authLoading,
        isAuthenticated,
        workspaces.length,
        workspacesLoading,
    ]);

    //Fetch workspace details when user switches workspace Prevents double-fetch using hasFetchedWorkspace
    useEffect(() => {
        if (
            workspaceId && !authLoading && isAuthenticated &&
            !checkingWorkspaces && !hasFetchedWorkspace
        ) {
            setHasFetchedWorkspace(true);

            dispatch(clearWorkspaceData());
            dispatch(clearProjects());

            // Fetch all at once
            Promise.all([
                dispatch(fetchWorkspaceById(workspaceId)).unwrap(),
                dispatch(fetchWorkspaceProjects(workspaceId)).unwrap(),
            ]);

        }
    }, [
        workspaceId,
        authLoading,
        isAuthenticated,
        checkingWorkspaces,
        hasFetchedWorkspace,
    ]);

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
            <main className="flex-1 min-w-0 overflow-auto lg:ml-0 pt-16 md:pt-0">
                {children}
            </main>
        </div>
    );
}
