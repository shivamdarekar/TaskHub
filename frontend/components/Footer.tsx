import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-2 border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
            <span className="text-blue-600 font-bold text-xl">TaskHub</span>
            </div>
            <p className="text-gray-600 max-w-md">
              Your all-in-one workspace to manage tasks, projects, and team collaboration efficiently.
              Stay organized and boost productivity with TaskHub.
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-gray-900">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/features" className="text-gray-600 hover:text-gray-900">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="text-gray-600 hover:text-gray-900">
                  Integrations
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-600 hover:text-gray-900">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-gray-900">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-gray-900">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-gray-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600 text-center">
          <p>© {new Date().getFullYear()} TaskHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}