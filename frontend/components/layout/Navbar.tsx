"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthToken, clearAuthToken } from "@/lib/auth-store";

import toast from "react-hot-toast";


export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const token = useAuthToken();

  const handleLogout = () => {
    clearAuthToken();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  const linkClass = (path: string) =>
    `text-sm font-medium transition ${
      pathname === path ? "text-gray-900" : "text-gray-500 hover:text-gray-900"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          FeedPulse
        </Link>

        <nav className="flex items-center gap-6">
          <Link href="/" className={linkClass("/")}>
            Home
          </Link>

          <Link href="/dashboard" className={linkClass("/dashboard")}>
            Dashboard
          </Link>

          {token ? (
            <button
              onClick={handleLogout}
              className="rounded-lg border px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800 cursor-pointer"
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}