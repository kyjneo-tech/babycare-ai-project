"use client";

import { Baby } from "@prisma/client";
import { useParams, usePathname, useRouter } from "next/navigation";

export function BabySwitcher({ babies }: { babies: Baby[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentBabyId = params.babyId || params.id || "";

  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBabyId = e.target.value;
    if (!currentBabyId) {
      // If we are on a page without a babyId, like /dashboard, navigate to the baby's specific page
      router.push(`/dashboard/babies/${newBabyId}`);
      return;
    }
    // Replace the old babyId with the new one in the current path
    const newPath = pathname.replace(currentBabyId as string, newBabyId);
    router.push(newPath);
  };

  if (babies.length === 0) {
    return null;
  }

  return (
    <select
      value={currentBabyId}
      onChange={handleSwitch}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
    >
      {babies.map((baby) => (
        <option key={baby.id} value={baby.id}>
          {baby.name}
        </option>
      ))}
    </select>
  );
}
