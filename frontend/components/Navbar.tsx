"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Navbar() {
  
  return (
     <nav className="border-b border-gray-100 sticky top-0 z-50 bg-white/80 backdrop-blur-sm shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-blue-600 font-bold text-2xl">TaskHub</span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 font-medium">
                Features
              </Link>
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium">
                Pricing
              </Link>
              <Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium">
                Contact
              </Link>
              <Link href="/#faq" className="text-gray-600 hover:text-gray-900 font-medium">
                FAQ
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Link href="/login" className="text-gray-700 hover:text-blue-600 font font-medium">
                Sign in
              </Link>
              <Link href="/register">
                <Button className="bg-blue-800 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
  );
}