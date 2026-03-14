"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-black/60 sticky top-0 z-50 backdrop-blur-md">
      {/* Top accent — three thin red bars */}
      <div className="flex gap-[3px]">
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
        <div className="h-[3px] bg-primary flex-1" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-3">
            <Image src="/logo.svg" alt="ACP" width={40} height={33} className="h-8 w-auto" />
            <span className="font-black text-lg uppercase tracking-[0.15em]">
              <span className="text-primary">Jobs</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/listings"
              className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors"
            >
              Browse
            </Link>
            <Link
              href="/dashboard"
              className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/messages"
              className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors"
            >
              Messages
            </Link>
            <Link href="/listings/create" className="btn-primary">
              Post a Job
            </Link>
            <Link
              href="/auth/login"
              className="btn-secondary"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-4">
              <Link href="/listings" className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors" onClick={() => setIsMenuOpen(false)}>
                Browse
              </Link>
              <Link href="/dashboard" className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link href="/messages" className="text-white/60 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-colors" onClick={() => setIsMenuOpen(false)}>
                Messages
              </Link>
              <Link href="/listings/create" className="btn-primary text-center" onClick={() => setIsMenuOpen(false)}>
                Post a Job
              </Link>
              <Link href="/auth/login" className="btn-secondary text-center" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
