"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone } from "lucide-react";

export default function MobileWarningDialog() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Only show on mobile screens (< 768px)
    const isMobile = window.innerWidth < 768;
    const dismissed = localStorage.getItem("mobile-warning-accepted");
    
    if (isMobile && !dismissed) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("mobile-warning-accepted", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Monitor className="h-6 w-6 text-blue-600" />
            Desktop Experience Recommended
          </DialogTitle>
          <DialogDescription className="sr-only">
            This application is optimized for desktop viewing
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
            <Smartphone className="h-16 w-16 text-gray-400 mr-4" />
            <div className="text-6xl">→</div>
            <Monitor className="h-20 w-20 text-blue-600 ml-4" />
          </div>

          <div className="space-y-2 text-center">
            <p className="text-gray-700 font-medium">
              TaskHub is a project management platform designed for desktop use.
            </p>
            <p className="text-sm text-gray-600">
              For the best experience with all features and optimal UI, please access this website on:
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">💻 Laptop</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">🖥️ Desktop</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-semibold text-gray-900">📱 Tablet</p>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center">
            You can still continue on mobile, but some features may not display properly.
          </p>
        </div>

        <Button
          onClick={handleAccept}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          I Understand, Continue Anyway
        </Button>
      </DialogContent>
    </Dialog>
  );
}
