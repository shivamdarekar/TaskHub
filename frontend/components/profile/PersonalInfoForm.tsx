import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

interface PersonalInfoFormProps {
  initialName: string;
  email: string;
  loading: boolean;
  onSubmit: (name: string) => void;
}

export default function PersonalInfoForm({ initialName, email, loading, onSubmit }: PersonalInfoFormProps) {
  const [name, setName] = useState(initialName);
  const [nameError, setNameError] = useState("");

  const validateName = (value: string) => {
    if (!value.trim()) {
      setNameError("Name is required");
      return false;
    }
    if (value.trim().length < 2) {
      setNameError("Name must be at least 2 characters");
      return false;
    }
    if (value.trim().length > 50) {
      setNameError("Name must be less than 50 characters");
      return false;
    }
    setNameError("");
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setName(value);
    if (nameError) validateName(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateName(name)) {
      onSubmit(name);
    }
  };

  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="h-5 w-5 text-blue-600" />
          Personal Information
        </CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm font-medium text-gray-700">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={handleNameChange}
                onBlur={() => validateName(name)}
                placeholder="Enter your full name"
                className={`h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500 ${
                  nameError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                }`}
              />
              {nameError && <p className="text-sm text-red-600">{nameError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
              <Input
                id="email"
                value={email}
                disabled
                className="h-11 bg-gray-100 border-gray-300 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
          <Button 
            type="submit" 
            disabled={loading || name === initialName || !!nameError}
            className="bg-blue-600 hover:bg-blue-700 h-11 px-6"
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
