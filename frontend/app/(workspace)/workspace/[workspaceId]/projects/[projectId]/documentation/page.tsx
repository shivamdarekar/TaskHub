"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { fetchProjectBasicInfo } from "@/redux/slices/projectSlice";
import { ProjectDocumentation } from "@/components/workspace/project";

export default function DocumentationPage() {
  const dispatch = useAppDispatch();
  const { currentProject, currentProjectLoading } = useAppSelector(state => state.project);
  const params = useParams();
  const projectId = params.projectId as string;
  const workspaceId = params.workspaceId as string;
  
  useEffect(() => {
    dispatch(fetchProjectBasicInfo(projectId));
  }, [dispatch, projectId]);

  if (currentProjectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading project...</div>
      </div>
    );
  }

  return (
    <ProjectDocumentation 
      project={{
        id: currentProject.id,
        name: currentProject.name
      }}
      workspaceId={workspaceId}
    />
  );
}