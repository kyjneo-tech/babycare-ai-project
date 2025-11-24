// src/widgets/dashboard-header/NavigationLinks.tsx
"use client";

import Link from "next/link";

export function NavigationLinks() {
  return (
    <div className="flex items-center space-x-4 sm:space-x-6 border-t pt-2 pb-1 overflow-x-auto text-sm sm:text-base">
      <Link
        href="/dashboard"
        className="text-gray-600 hover:text-blue-600 whitespace-nowrap"
      >
        🏠 홈
      </Link>
      <span className="border-l h-4"></span> {/* Separator */}
      <Link
        href="/dashboard/family"
        className="text-gray-600 hover:text-blue-600 whitespace-nowrap"
      >
        👨‍👩‍👧‍👦 가족
      </Link>
      <Link
        href="/dashboard/settings"
        className="text-gray-600 hover:text-blue-600 whitespace-nowrap"
      >
        ⚙️ 설정
      </Link>
    </div>
  );
}
