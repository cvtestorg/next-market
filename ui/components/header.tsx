"use client";

import Link from "next/link";
import { AuthButton } from "./auth/auth-button";
import { Button } from "./ui/button";
import { Package } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-6 w-6" />
            <span className="font-bold text-xl">Next Market</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            <Link href="/plugins" className="transition-colors hover:text-foreground/80">
              Plugins
            </Link>
            <Link href="/upload" className="transition-colors hover:text-foreground/80">
              Upload
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <AuthButton />
        </div>
      </div>
    </header>
  );
}
