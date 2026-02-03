"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/redux/hooks";
import { deleteProject } from "@/redux/slices/projectSlice";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface DeleteProjectDialogProps {
  project: {
    id: string;
    name: string;
  };
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function DeleteProjectDialog({
  project,
  workspaceId,
  open,
  onOpenChange,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteProject = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project.id)).unwrap();
      toast.success("Project deleted successfully");
      router.push(`/workspace/${workspaceId}`);
    } catch (error) {
      toast.error(error as string);
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-red-600">Delete Project</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete:
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-2 py-4">
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>All tasks and subtasks</li>
            <li>All comments and attachments</li>
            <li>All project data and history</li>
            <li>Member access to this project</li>
          </ul>
          <p className="font-medium text-red-600 mt-3">
            Are you sure you want to delete &quot;{project.name}&quot;?
          </p>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteProject}
            className="bg-red-600 hover:bg-red-700"
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Yes, Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}