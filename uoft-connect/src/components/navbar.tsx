"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  Compass,
  MessageCircle,
  LayoutDashboard,
  Newspaper,
  User,
  Menu,
  X,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";

const navLinks = [
  { href: "/", label: "Home", icon: Home },
  { href: "/feed", label: "Feed", icon: Newspaper },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#002A5C]">
            <span className="text-sm font-bold text-white">U</span>
          </div>
          <span className="hidden text-lg font-bold text-[#002A5C] sm:inline">
            UofT Connect
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={
                    isActive
                      ? "bg-[#002A5C] text-white hover:bg-[#002A5C]/90"
                      : "text-gray-600 hover:text-[#002A5C]"
                  }
                >
                  <Icon className="mr-1.5 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Auth + Profile + Mobile Toggle */}
        <div className="flex items-center gap-2">
          {isLoading ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />
          ) : isAuthenticated ? (
            <>
              <Link href="/profile">
                <Avatar className="h-8 w-8 cursor-pointer border-2 border-[#002A5C]/10 hover:border-[#002A5C]/30 transition-colors">
                  <AvatarFallback className="bg-[#002A5C] text-white text-xs">
                    {getInitials(user?.name, user?.email)}
                  </AvatarFallback>
                </Avatar>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="hidden md:flex text-gray-500 hover:text-red-500"
                onClick={() => signOut()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button
                size="sm"
                className="bg-[#002A5C] hover:bg-[#002A5C]/90 text-white"
              >
                <LogIn className="mr-1.5 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <nav className="border-t bg-white px-4 pb-4 pt-2 md:hidden">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
              >
                <div
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-[#002A5C]/10 text-[#002A5C]"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </div>
              </Link>
            );
          })}
          {isAuthenticated ? (
            <div
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 cursor-pointer transition-colors"
              onClick={() => {
                signOut();
                setMobileOpen(false);
              }}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </div>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)}>
              <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#002A5C] hover:bg-[#002A5C]/5 transition-colors">
                <LogIn className="h-4 w-4" />
                Sign In
              </div>
            </Link>
          )}
        </nav>
      )}
    </header>
  );
}
