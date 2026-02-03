"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigation = (path: string) => {
    setMobileMenuOpen(false);
    router.push(path);
  };

  return (
    <nav className="border-b border-gray-200 sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-gray-900 font-bold text-xl">TaskHub</span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Features
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Pricing
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              Contact
            </Link>
            <Link href="/#faq" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">
              FAQ
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button
              onClick={() => handleNavigation("/login")}
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors"
            >
              Sign in
            </button>
            <button
              onClick={() => handleNavigation("/register")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all"
            >
              Get Started
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white animate-fade-in-up">
          <div className="px-4 py-4 space-y-3">
            <Link href="/#features" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Features
            </Link>
            <Link href="/pricing" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Pricing
            </Link>
            <Link href="/contact" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              Contact
            </Link>
            <Link href="/#faq" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
              FAQ
            </Link>
            <div className="pt-3 space-y-2">
              <button onClick={() => handleNavigation("/login")} className="w-full text-center px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors">
                Sign in
              </button>
              <button onClick={() => handleNavigation("/register")} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium shadow-md">
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
