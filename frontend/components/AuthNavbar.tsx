import Link from "next/link";
import { LayoutGrid } from "lucide-react";

export default function AuthNavbar() {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <LayoutGrid className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">TaskHub</span>
        </Link>
        <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
          ← Back to Home
        </Link>
      </div>
    </header>
  );
}
