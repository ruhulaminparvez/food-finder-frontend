'use client';

import Link from 'next/link';
import {
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhoneIcon,
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <BuildingStorefrontIcon className="h-6 w-6" />
              FoodFinder
            </h3>
            <p className="text-gray-400">
              Discover the best restaurants and food recommendations near you.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/restaurants" className="hover:text-white transition-colors flex items-center gap-2">
                  <BuildingStorefrontIcon className="h-4 w-4" />
                  Restaurants
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors flex items-center gap-2">
                  <SparklesIcon className="h-4 w-4" />
                  Recommendations
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-white transition-colors flex items-center gap-2">
                  <HeartIcon className="h-4 w-4" />
                  Favorites
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <div className="space-y-2 text-gray-400">
              <p className="flex items-center gap-2">
                <EnvelopeIcon className="h-4 w-4" />
                support@foodfinder.com
              </p>
              <p className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                +1 (555) 123-4567
              </p>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} FoodFinder. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
