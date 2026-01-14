import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ApolloWrapper } from '@/components/common/ApolloWrapper';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/common/Navbar';
import Footer from '@/components/common/Footer';
import AuthInitializer from '@/components/common/AuthInitializer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FoodFinder - Discover Restaurants & Food Recommendations",
  description: "Interactive Restaurant Finder & Food Recommendation System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased flex flex-col min-h-screen`} suppressHydrationWarning>
        <ApolloWrapper>
          <AuthInitializer />
          <Navbar />
          <main className="flex-grow">
            {children}
          </main>
          <Footer />
          <Toaster position="top-right" />
        </ApolloWrapper>
      </body>
    </html>
  );
}
