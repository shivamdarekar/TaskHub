import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DangerZoneProps {
  loading: boolean;
  error: string | null;
  onDeleteAccount: (password: string, confirmation: string, forceDelete?: boolean) => void;
  onClearError?: () => void;
}

export default function DangerZone({ loading, error, onDeleteAccount, onClearError }: DangerZoneProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [forceDelete, setForceDelete] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirmation: "" });

  // Check if error indicates workspace warning
  const hasWorkspaceWarning = error?.includes("workspaces with other members");

  const handleDelete = () => {
    let hasError = false;
    const newErrors = { password: "", confirmation: "" };

    if (!password) {
      newErrors.password = "Password is required";
      hasError = true;
    }

    if (confirmation !== "DELETE") {
      newErrors.confirmation = "Please type DELETE to confirm";
      hasError = true;
    }

    setErrors(newErrors);

    if (!hasError) {
      onDeleteAccount(password, confirmation, forceDelete);
    }
  };

  const handleCancel = () => {
    setShowDialog(false);
    setPassword("");
    setConfirmation("");
    setForceDelete(false);
    setErrors({ password: "", confirmation: "" });
    onClearError?.();
  };

  return (
    <>
      <Card className="shadow-sm border-red-200 bg-red-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
            <div>
              <p className="font-semibold text-gray-900">Delete Account</p>
              <p className="text-sm text-gray-600 mt-1">
                Permanently delete your account and all associated data
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDialog(true)}
              className="h-11 px-6"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium mb-2">
                  This action cannot be undone. This will permanently:
                </p>
                <ul className="text-sm text-red-700 space-y-1 list-disc list-inside">
                  <li>Delete your account and profile</li>
                  <li>Remove you from all workspaces you&apos;re a member of</li>
                  <li>Delete all workspaces you own as sole owner</li>
                  <li>Unassign you from all tasks</li>
                  <li>Remove your subscription</li>
                </ul>
                <p className="text-xs text-red-600 mt-2 italic">
                  Note: Projects and tasks you created will remain, but your name will be removed.
                </p>
              </div>

              {hasWorkspaceWarning && (
                <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-6 w-6 text-orange-600 shrink-0 mt-0.5" />
                    <div className="space-y-4 flex-1">
                      <p className="text-sm text-orange-800 font-semibold">
                        {error}
                      </p>
                      <div className="flex items-start gap-3 p-3 bg-white rounded-md border border-orange-200">
                        <Checkbox
                          id="force-delete"
                          checked={forceDelete}
                          onCheckedChange={(checked) => setForceDelete(checked as boolean)}
                          className="mt-0.5 h-5 w-5 border-2 border-orange-400 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
                        />
                        <Label
                          htmlFor="force-delete"
                          className="text-sm text-gray-900 font-medium cursor-pointer leading-relaxed"
                        >
                          I understand this will delete all my workspaces and remove all members
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="delete-password">Enter your password</Label>
                  <Input
                    id="delete-password"
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors({ ...errors, password: "" });
                    }}
                    placeholder="Enter your password"
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="delete-confirmation">
                    Type <span className="font-bold">DELETE</span> to confirm
                  </Label>
                  <Input
                    id="delete-confirmation"
                    value={confirmation}
                    onChange={(e) => {
                      setConfirmation(e.target.value);
                      if (errors.confirmation) setErrors({ ...errors, confirmation: "" });
                    }}
                    placeholder="DELETE"
                    className={errors.confirmation ? "border-red-500" : ""}
                  />
                  {errors.confirmation && (
                    <p className="text-sm text-red-600">{errors.confirmation}</p>
                  )}
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading || !password || confirmation !== "DELETE" || (hasWorkspaceWarning && !forceDelete)}
            >
              {loading ? "Deleting..." : "Delete Account"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
