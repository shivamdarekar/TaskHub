import Link from "next/link";
import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">T</span>
              </div>
              <span className="text-gray-900 font-bold text-xl">TaskHub</span>
            </div>
            <p className="text-gray-600 max-w-md mb-6">
              Your all-in-one workspace to manage tasks, projects, and team collaboration efficiently.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors transform hover:scale-110">
                <Github size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors transform hover:scale-110">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors transform hover:scale-110">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors transform hover:scale-110">
                <Mail size={20} />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/#features" className="text-gray-600 hover:text-blue-600 transition-colors">Features</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">Pricing</Link></li>
              <li><Link href="/integrations" className="text-gray-600 hover:text-blue-600 transition-colors">Integrations</Link></li>
              <li><Link href="/changelog" className="text-gray-600 hover:text-blue-600 transition-colors">Changelog</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-gray-900 font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gray-600 hover:text-blue-600 transition-colors">About</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-600 hover:text-blue-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-300 text-sm text-gray-600 text-center">
          <p>© {new Date().getFullYear()} TaskHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
