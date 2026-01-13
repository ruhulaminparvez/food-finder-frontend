'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import {
  BuildingStorefrontIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  // Close mobile menu when clicking outside or on route change
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 flex items-center gap-2">
                <BuildingStorefrontIcon className="h-7 w-7" />
                FoodFinder
              </Link>
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  href="/restaurants"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                >
                  <BuildingStorefrontIcon className="h-5 w-5" />
                  Restaurants
                </Link>
                {isAuthenticated && (
                  <>
                    <Link
                      href="/dashboard"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <SparklesIcon className="h-5 w-5" />
                      Recommendations
                    </Link>
                    <Link
                      href="/favorites"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                    >
                      <HeartIcon className="h-5 w-5" />
                      Favorites
                    </Link>
                  </>
                )}
                {isAuthenticated && user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <ShieldCheckIcon className="h-5 w-5" />
                    Admin
                  </Link>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {isAuthenticated ? (
                <>
                  <span
                    className="text-sm text-gray-700 hidden sm:flex items-center gap-2 max-w-[120px] md:max-w-[180px]"
                    title={user?.name}
                  >
                    <UserCircleIcon className="h-5 w-5 shrink-0" />
                    <span className="truncate">{user?.name}</span>
                  </span>
                  <Button variant="outline" size="sm" onClick={handleLogout} className="cursor-pointer hidden sm:flex">
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block">
                    <Button variant="ghost" size="sm" className="cursor-pointer">
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" className="hidden sm:block">
                    <Button variant="primary" size="sm" className="cursor-pointer">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen ? (
                  <XMarkIcon className="h-6 w-6" />
                ) : (
                  <Bars3Icon className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 md:hidden transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black transition-opacity duration-300 ${
            isMobileMenuOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar */}
        <div className="relative w-64 h-full bg-white shadow-xl overflow-y-auto">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <Link
                href="/"
                className="text-xl font-bold text-blue-600 flex items-center gap-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingStorefrontIcon className="h-6 w-6" />
                FoodFinder
              </Link>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              <Link
                href="/restaurants"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BuildingStorefrontIcon className="h-5 w-5" />
                <span className="font-medium">Restaurants</span>
              </Link>

              {isAuthenticated && (
                <>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <span className="font-medium">Recommendations</span>
                  </Link>
                  <Link
                    href="/favorites"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HeartIcon className="h-5 w-5" />
                    <span className="font-medium">Favorites</span>
                  </Link>
                </>
              )}

              {isAuthenticated && user?.role === 'ADMIN' && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShieldCheckIcon className="h-5 w-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}
            </nav>

            {/* User Section */}
            <div className="border-t px-4 py-4 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-3 px-4 py-2">
                    <UserCircleIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 truncate">{user?.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="w-full cursor-pointer"
                  >
                    <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="ghost" size="sm" className="w-full cursor-pointer">
                      <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="sm" className="w-full cursor-pointer">
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
