import { Badge } from "@/components/ui/badge";

interface ProfileHeaderProps {
  name: string;
  email: string;
  isEmailVerified: boolean;
  createdAt: string;
}

export default function ProfileHeader({ name, email, isEmailVerified, createdAt }: ProfileHeaderProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
        <span className="text-white text-2xl font-bold">
          {name.charAt(0).toUpperCase()}
        </span>
      </div>
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
        <p className="text-gray-600">{email}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant={isEmailVerified ? "default" : "destructive"} className="text-xs">
            {isEmailVerified ? "Verified" : "Unverified"}
          </Badge>
          <span className="text-xs text-gray-500">• Member since {formatDate(createdAt)}</span>
        </div>
      </div>
    </div>
  );
}
