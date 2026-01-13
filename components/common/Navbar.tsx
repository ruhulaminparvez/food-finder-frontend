'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import {
  BuildingStorefrontIcon,
  SparklesIcon,
  HeartIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
} from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
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
                <Button variant="outline" size="sm" onClick={handleLogout} className="cursor-pointer">
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="cursor-pointer">
                    <ArrowLeftOnRectangleIcon className="h-4 w-4 mr-1" />
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm" className="cursor-pointer">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
