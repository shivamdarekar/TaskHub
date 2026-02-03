"use client";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { clearError } from "@/redux/slices/workspaceSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createWorkspace } from "@/redux/slices/workspaceSlice";
import { Loader2 } from "lucide-react";
import AuthNavbar from "@/components/AuthNavbar";

interface CreateWorkspacePayload {
  name: string;
  description?: string
}

export default function CreateWorkspace() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  const { loading, error, workspaces } = useAppSelector((state) => state.workspace);
  const { isAuthenticated, authLoading } = useAppSelector(
    (state) => state.auth
  );
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState<CreateWorkspacePayload>({
    name: "",
    description: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, authLoading, mounted, router]);

  // show loading while checking authentication
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  //Don't render the page if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const created = await dispatch(createWorkspace(formData)).unwrap();
      router.push(`/workspace/${created.id}`);
    } catch (err) {
      console.error("failed to create workspace:", err);
    }
  };

  const handleCancel = () => {
    // Get the redirect param if coming from somewhere specific
    const from = searchParams.get('from');
    
    if (from) {
      // If there's a specific page they came from, go back there
      router.push(from);
    } else if (workspaces.length > 0) {
      // If user has workspaces, go to the first one
      router.push(`/workspace/${workspaces[0].id}`);
    } else {
      // If no workspaces, go to home
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      <AuthNavbar />

      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md relative z-10 animate-fade-in-up">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Create New Workspace
              </h1>
              <p className="text-gray-600 mt-2">
                Set up a workspace for your team to collaborate
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-shake">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="name" className="text-gray-700 font-medium mb-2 block">
                  Workspace Name *
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="My Awesome Team"
                  disabled={loading}
                  required
                  className="h-11 transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <Label htmlFor="description" className="text-gray-700 font-medium mb-2 block">
                  Description (Optional)
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="What's this workspace about?"
                  disabled={loading}
                  rows={4}
                  className="resize-none transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 h-11"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Workspace"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
