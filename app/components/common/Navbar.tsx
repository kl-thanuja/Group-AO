'use client';

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 w-full flex items-center justify-center z-50 px-4 sm:px-8 lg:px-12 py-4">
        <div className="flex w-1/2 justify-between items-center border border-[#f4e9d8]/20  backdrop-blur-xl p-3 rounded-full shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#2f2a25] flex items-center justify-center shadow-md">
              <span className="text-[#f4e9d8] text-lg font-bold">Q</span>
            </div>
            <span className="text-[#2f2a25] font-semibold text-lg sm:text-xl">
              Quoraid
            </span>
          </div>

          <div className="sm:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="focus:outline-none p-2 rounded-lg hover:bg-[#f4e9d8]/50 transition-colors"
            >
              {isOpen ? (
                <X className="w-6 h-6 text-[#2f2a25]" />
              ) : (
                <Menu className="w-6 h-6 text-[#2f2a25]" />
              )}
            </button>
          </div>

          <nav
            className={`flex-col sm:flex-row sm:flex items-center gap-4 sm:gap-8 absolute sm:static top-full left-0 w-full sm:w-auto bg-white/30 backdrop-blur-xl sm:bg-transparent border-t sm:border-0 border-[#f4e9d8]/20 sm:p-0 p-4 transition-all duration-300 ${isOpen ? "flex" : "hidden"}`}
          >
            <Link
              href="/"
              className="text-[#2f2a25] hover:text-[#f4e9d8] transition-colors duration-200 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/rooms"
              className="text-[#2f2a25] hover:text-[#f4e9d8] transition-colors duration-200 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Rooms
            </Link>
            <Link
              href="/features"
              className="text-[#2f2a25] hover:text-[#f4e9d8] transition-colors duration-200 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              href="/contact"
              className="text-[#2f2a25] hover:text-[#f4e9d8] transition-colors duration-200 font-medium"
              onClick={() => setIsOpen(false)}
            >
              Contact
            </Link>
            <Button
              onClick={() => {
                setIsDialogOpen(true);
                setIsOpen(false);
              }}
              className="mt-4 cursor-pointer sm:mt-0 bg-[#2f2a25] hover:bg-[#f4e9d8] hover:text-[#2f2a25] text-[#f4e9d8] font-medium px-6 py-2 rounded-lg  transition-all duration-300"
            >
              Get Started
            </Button>
          </nav>
        </div>
      </header>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white/30 backdrop-blur-xl border border-[#f4e9d8]/20 rounded-[20px] p-6 sm:max-w-[360px]">
          <DialogHeader className="flex justify-between items-center">
            <DialogTitle className="text-2xl font-semibold text-[#2f2a25]">
            Quoraid
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 mt-2">
            <Button
              className="flex items-center justify-center gap-3 bg-white text-[#2f2a25] border border-gray-300 hover:bg-[#f4e9d8] hover:text-[#2f2a25] font-medium py-3 rounded-lg transition-all duration-300 cursor-pointer" 
              onClick={() => {
                window.location.href = "http://localhost:8000/auth/google";
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.564,9.505-11.622H12.545z"
                />
              </svg>
              Sign in with Google
            </Button>
            <Button
              className="flex items-center justify-center gap-3 bg-[#2f2a25] text-[#f4e9d8] hover:bg-[#2f2a25e1] hover:text-[#ffffffda] font-medium py-3 rounded-lg transition-all duration-300 cursor-pointer"
              onClick={() => {
                window.location.href = "http://localhost:8000/auth/github";
              }}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.12-1.47-1.12-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.48 2.29 1.05 2.85.8.09-.65.35-1.05.62-1.29-2.17-.25-4.46-1.09-4.46-4.85 0-1.07.38-1.94 1-2.63 0-.27-.45-1.29.1-2.68 0 0 .85-.27 2.78 1.03A9.72 9.72 0 0 1 12 6.5c.85 0 1.71.11 2.52.33 1.93-1.3 2.78-1.03 2.78-1.03.55 1.39.1 2.41.1 2.68.62.69 1 1.56 1 2.63 0 3.76-2.29 4.6-4.47 4.85.27.24.62.64.62 1.29 0 .93-.16 1.69-.16 1.92 0 .27.16.58.66.5A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"
                />
              </svg>
              Sign in with GitHub
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Navbar;