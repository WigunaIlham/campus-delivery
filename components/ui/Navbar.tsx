"use client";

import {useState} from "react";
import Link from "next/link";
import {usePathname, useRouter} from "next/navigation";
import {Button} from "@/components/ui/Button";
import {useAuth} from "@/components/providers/AuthProvider";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/Avatar";
import {Menu, X, Package, User, MapPin, Bell, Settings} from "lucide-react";
import {cn} from "@/lib/utils";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {user, signOut} = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <Package className="h-4 w-4" />,
      showWhen: user?.role === "mahasiswa",
    },
    {
      name: "Courier",
      href: "/courier",
      icon: <MapPin className="h-4 w-4" />,
      showWhen: user?.role === "kurir",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  if (!user) return null;

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Food<span className="text-primary">Express</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems
              .filter((item) => item.showWhen)
              .map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                  <span>{item.name}</span>
                </Link>
              ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <button className="hidden md:flex relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-destructive" />
            </button>

            <div className="hidden md:flex items-center space-x-3 rounded-lg border bg-card px-4 py-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">
                  {user.full_name || user.email}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t py-4 animate-in slide-in-from-top">
            <div className="space-y-2">
              {navItems
                .filter((item) => item.showWhen)
                .map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center space-x-3 rounded-lg px-3 py-3 text-sm font-medium transition-colors hover:bg-accent",
                      pathname === item.href
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground"
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                ))}

              <div className="border-t pt-4">
                <div className="flex items-center space-x-3 px-3 py-2">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">
                      {user.full_name || user.email}
                    </p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {user.role}
                    </p>
                  </div>
                </div>

                <div className="mt-2 space-y-1">
                  <button className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm hover:bg-accent transition-colors">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
