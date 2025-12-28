import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch } from "@/redux/hooks";
import { updateProject, deleteProject } from "@/redux/slices/projectSlice";

interface EditProjectDialogProps {
  project: {
    id: string;
    name: string;
    description?: string;
  };
  workspaceId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProjectUpdated?: () => void;
}

export default function EditProjectDialog({ 
  project, 
  workspaceId,
  open, 
  onOpenChange, 
  onProjectUpdated 
}: EditProjectDialogProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [formData, setFormData] = useState({
    name: project.name,
    description: project.description || "",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(updateProject({
        projectId: project.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim() || undefined,
        }
      })).unwrap();
      
      toast.success("Project updated successfully");
      onProjectUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Project update error:', error);
      toast.error(typeof error === 'string' ? error : "Failed to update project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await dispatch(deleteProject(project.id)).unwrap();
      
      toast.success("Project deleted successfully");
      onOpenChange(false);
      router.push(`/workspace/${workspaceId}`);
    } catch (error) {
      console.error('Project delete error:', error);
      toast.error(typeof error === 'string' ? error : "Failed to delete project");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Project Settings</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter project name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter workspace description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gray-900 hover:bg-gray-800"
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>

        <Separator className="my-6" />

        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
            <p className="text-sm text-gray-500 mt-1">
              Irreversible actions for your project
            </p>
          </div>

          {!showDeleteConfirm ? (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Project
            </Button>
          ) : (
            <div className="space-y-3 p-4 border border-red-200 rounded-lg bg-red-50">
              <p className="text-sm text-red-800 font-medium">
                Are you sure you want to delete this project?
              </p>
              <p className="text-xs text-red-600">
                This action cannot be undone. All tasks and data will be permanently deleted.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Deleting..." : "Yes, Delete"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}