import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  Search,
  Menu,
  X,
  ChevronDown,
  Bell,
  User as UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NavBar = () => {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => {
    return location === path;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/courses?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and primary navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <svg 
                className="h-10 w-auto text-primary"
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
              <span className="ml-2 text-xl font-heading font-bold text-primary">Taalim</span>
            </Link>
            
            <nav className="hidden md:ml-8 md:flex md:space-x-6">
              <Link href="/">
                <a className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive("/") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}>
                  Home
                </a>
              </Link>
              <Link href="/courses">
                <a className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive("/courses") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}>
                  Courses
                </a>
              </Link>
              <Link href="/instructors">
                <a className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive("/instructors") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}>
                  Instructors
                </a>
              </Link>
              <Link href="/about">
                <a className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                  isActive("/about") 
                    ? "border-primary text-primary" 
                    : "border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-300"
                }`}>
                  About
                </a>
              </Link>
            </nav>
          </div>

          {/* Search bar */}
          <div className="flex-1 flex items-center justify-center px-2 lg:ml-6 lg:justify-end">
            <div className="max-w-lg w-full lg:max-w-xs">
              <form onSubmit={handleSearch} className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white"
                  placeholder="Search courses..."
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
          </div>

          {/* User menu and mobile menu button */}
          <div className="flex items-center">
            <div className="hidden md:ml-4 md:flex md:items-center md:space-x-4">
              {!user ? (
                <div className="flex space-x-2">
                  <Link href="/auth">
                    <Button variant="outline">Log in</Button>
                  </Link>
                  <Link href="/auth">
                    <Button>Sign up</Button>
                  </Link>
                </div>
              ) : (
                <div className="ml-4 flex items-center md:ml-6">
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                  </Button>

                  {/* Profile dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="ml-3 relative max-w-xs rounded-full flex items-center text-sm focus:outline-none">
                        <span className="sr-only">Open user menu</span>
                        <Avatar>
                          <AvatarImage src={user.profileImage || ""} alt={user.fullName} />
                          <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>
                        <div className="text-sm font-medium">{user.fullName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">Your Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/my-courses">My Courses</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/certificates">Certificates</Link>
                      </DropdownMenuItem>
                      {(user.role === 'instructor' || user.role === 'admin') && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href="/instructor/dashboard">Instructor Dashboard</Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      {user.role === 'admin' && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin/dashboard">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-controls="mobile-menu"
                aria-expanded={mobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {mobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive("/") 
                  ? "border-primary text-primary bg-primary-50" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}>
                Home
              </a>
            </Link>
            <Link href="/courses">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive("/courses") 
                  ? "border-primary text-primary bg-primary-50" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}>
                Courses
              </a>
            </Link>
            <Link href="/instructors">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive("/instructors") 
                  ? "border-primary text-primary bg-primary-50" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}>
                Instructors
              </a>
            </Link>
            <Link href="/about">
              <a className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                isActive("/about") 
                  ? "border-primary text-primary bg-primary-50" 
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              }`}
              onClick={() => setMobileMenuOpen(false)}>
                About
              </a>
            </Link>
          </div>
          
          {user ? (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <Avatar>
                    <AvatarImage src={user.profileImage || ""} alt={user.fullName} />
                    <AvatarFallback>{user.fullName.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.fullName}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link href="/profile">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}>
                    Your Profile
                  </a>
                </Link>
                <Link href="/my-courses">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}>
                    My Courses
                  </a>
                </Link>
                <Link href="/certificates">
                  <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}>
                    Certificates
                  </a>
                </Link>
                {(user.role === 'instructor' || user.role === 'admin') && (
                  <Link href="/instructor/dashboard">
                    <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}>
                      Instructor Dashboard
                    </a>
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link href="/admin/dashboard">
                    <a className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                      onClick={() => setMobileMenuOpen(false)}>
                      Admin Dashboard
                    </a>
                  </Link>
                )}
                <button
                  className="w-full text-left block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-2 px-4">
                <Link href="/auth" className="w-full">
                  <Button variant="outline" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Log in
                  </Button>
                </Link>
                <Link href="/auth" className="w-full">
                  <Button className="w-full" onClick={() => setMobileMenuOpen(false)}>
                    Sign up
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

export default NavBar;
