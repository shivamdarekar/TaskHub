import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Shield, Key, Check, X } from "lucide-react";
import { validatePassword } from "@/lib/validation";

interface SecuritySettingsProps {
  is2FAenabled: boolean;
  passwordLoading: boolean;
  twoFALoading: boolean;
  onChangePassword: (currentPassword: string, newPassword: string, confirmPassword: string) => void;
  onToggle2FA: (password: string) => void;
}

export default function SecuritySettings({ is2FAenabled, passwordLoading, twoFALoading, onChangePassword, onToggle2FA }: SecuritySettingsProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toggle2FAPassword, setToggle2FAPassword] = useState("");
  
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    toggle2FAPassword: ""
  });

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCurrentPassword(value);
    if (errors.currentPassword) {
      const error = validatePassword(value, "Current password");
      setErrors(prev => ({ ...prev, currentPassword: error }));
    }
  };

  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setNewPassword(value);
    if (errors.newPassword) {
      const error = validatePassword(value, "New password");
      setErrors(prev => ({ ...prev, newPassword: error }));
    }
    if (confirmPassword && value !== confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else if (confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setConfirmPassword(value);
    if (value && value !== newPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: "Passwords don't match" }));
    } else {
      setErrors(prev => ({ ...prev, confirmPassword: "" }));
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const currentError = validatePassword(currentPassword, "Current password");
    const newError = validatePassword(newPassword, "New password");
    const confirmError = validatePassword(confirmPassword, "Confirm password");
    const matchError = newPassword !== confirmPassword ? "Passwords don't match" : "";

    setErrors({
      currentPassword: currentError,
      newPassword: newError,
      confirmPassword: matchError || confirmError,
      toggle2FAPassword: ""
    });

    if (!currentError && !newError && !confirmError && !matchError) {
      onChangePassword(currentPassword, newPassword, confirmPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  const handleToggle2FA = () => {
    const error = validatePassword(toggle2FAPassword, "Password");
    setErrors(prev => ({ ...prev, toggle2FAPassword: error }));
    
    if (!error) {
      onToggle2FA(toggle2FAPassword);
      setToggle2FAPassword("");
    }
  };

  const hasPasswordErrors = !!(errors.currentPassword || errors.newPassword || errors.confirmPassword);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="h-5 w-5 text-blue-600" />
          Security & Authentication
        </CardTitle>
        <CardDescription>Manage your password and two-factor authentication</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Change Password */}
        <div>
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Key className="h-4 w-4" />
            Change Password
          </h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-medium text-gray-700">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={handleCurrentPasswordChange}
                  onBlur={() => setErrors(prev => ({ ...prev, currentPassword: validatePassword(currentPassword, "Current password") }))}
                  placeholder="••••••••"
                  className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.currentPassword && <p className="text-sm text-red-600">{errors.currentPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={handleNewPasswordChange}
                  onBlur={() => setErrors(prev => ({ ...prev, newPassword: validatePassword(newPassword, "New password") }))}
                  placeholder="••••••••"
                  className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.newPassword && <p className="text-sm text-red-600">{errors.newPassword}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  placeholder="••••••••"
                  className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                    errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                  }`}
                />
                {errors.confirmPassword && <p className="text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>
            <Button 
              type="submit" 
              disabled={passwordLoading || hasPasswordErrors || !currentPassword || !newPassword || !confirmPassword}
              className="bg-blue-600 hover:bg-blue-700 h-11 px-6"
            >
              {passwordLoading ? "Changing..." : "Change Password"}
            </Button>
          </form>
        </div>

        <Separator />

        {/* Two-Factor Authentication */}
        <div>
          <h3 className="text-base font-semibold mb-4 text-gray-900">Two-Factor Authentication</h3>
          <div className={`flex items-center justify-between p-4 rounded-lg border-2 ${
            is2FAenabled 
              ? 'bg-green-50 border-green-300' 
              : 'bg-gray-50 border-gray-300'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${
                is2FAenabled ? 'bg-green-600' : 'bg-gray-400'
              }`}>
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-gray-900">
                    2FA is {is2FAenabled ? "Enabled" : "Disabled"}
                  </p>
                  {is2FAenabled ? (
                    <Check className="h-5 w-5 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {is2FAenabled 
                    ? "Your account is protected with two-factor authentication"
                    : "Add an extra layer of security to your account"
                  }
                </p>
              </div>
            </div>
            <Badge 
              variant={is2FAenabled ? "default" : "secondary"}
              className={is2FAenabled ? "bg-green-600" : ""}
            >
              {is2FAenabled ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="mt-4 space-y-3">
            <Label htmlFor="toggle2FAPassword" className="text-sm font-medium text-gray-700">
              Enter your password to {is2FAenabled ? 'disable' : 'enable'} 2FA
            </Label>
            <Input
              id="toggle2FAPassword"
              type="password"
              placeholder="Enter your password"
              value={toggle2FAPassword}
              onChange={(e) => {
                setToggle2FAPassword(e.target.value);
                if (errors.toggle2FAPassword) {
                  setErrors(prev => ({ ...prev, toggle2FAPassword: validatePassword(e.target.value, "Password") }));
                }
              }}
              onBlur={() => setErrors(prev => ({ ...prev, toggle2FAPassword: validatePassword(toggle2FAPassword, "Password") }))}
              className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                errors.toggle2FAPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
              }`}
            />
            {errors.toggle2FAPassword && <p className="text-sm text-red-600">{errors.toggle2FAPassword}</p>}
            <Button 
              onClick={handleToggle2FA} 
              disabled={twoFALoading || !toggle2FAPassword || !!errors.toggle2FAPassword}
              variant={is2FAenabled ? "destructive" : "default"}
              className={`h-11 px-6 ${!is2FAenabled ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
            >
              {twoFALoading ? "Processing..." : is2FAenabled ? "Disable 2FA" : "Enable 2FA"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
