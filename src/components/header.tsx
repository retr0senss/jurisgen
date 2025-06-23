"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useClerk } from "@clerk/nextjs";
import { MessageSquare, User, Settings, LogOut, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Image from "next/image";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const { user, isSignedIn, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Loading state
  if (!isLoaded) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
          <Link href="/" className="flex items-center space-x-2">
            <Image src="/Logo.png" alt="JurisGen" width={32} height={32} />
            <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              JurisGen
            </span>
          </Link>
          <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
        </div>
      </header>
    );
  }

  const getInitials = (firstName?: string, lastName?: string) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 mx-auto max-w-7xl">
        <div className="flex items-center space-x-2">
          <Link href={isSignedIn ? "/dashboard" : "/"} className="flex items-center space-x-2">
            <Image src="/Logo.png" alt="JurisGen" width={32} height={32} />
            <span className="text-xl font-bold text-foreground hover:text-primary transition-colors">
              JurisGen
            </span>
          </Link>
        </div>

        {/* Authenticated User Navigation */}
        {isSignedIn ? (
          <>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/dashboard" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Dashboard
              </Link>
              <Link href="/chat" className="text-sm font-medium text-foreground hover:text-primary transition-colors flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Chat
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Planlar
              </Link>
              <Link href="/faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Yardım
              </Link>
            </nav>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {/* Custom Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 h-8 px-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.imageUrl || ''} alt={user?.fullName || ''} />
                      <AvatarFallback className="text-sm">
                        {getInitials(user?.firstName || '', user?.lastName || '')}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline-block text-sm font-medium">
                      {user?.firstName || 'Kullanıcı'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-popover text-popover-foreground">
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Ayarlar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="flex items-center cursor-pointer text-red-600 focus:text-red-600"
                    onClick={() => signOut()}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          /* Unauthenticated User Navigation */
          <>
            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/about" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Hakkında
              </Link>
              <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                Fiyatlar
              </Link>
              <Link href="/faq" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                SSS
              </Link>
              <Link href="/contact" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
                İletişim
              </Link>
            </nav>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button className="bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" asChild>
                <Link href="/login">Giriş Yap</Link>
              </Button>
              <Button className="bg-black text-white hover:bg-white hover:text-black dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white" variant="outline" asChild>
                <Link href="/register">Kaydol</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </header>
  );
} 