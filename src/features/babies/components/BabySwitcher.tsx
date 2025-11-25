"use client";

import { Baby } from "@prisma/client";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function BabySwitcher({ babies }: { babies: Baby[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const currentBabyId = (params.babyId || params.id || "") as string;

  const handleSwitch = (newBabyId: string) => {
    if (newBabyId === currentBabyId) return; // No change needed

    let newPath = pathname;
    // Special handling for the root path if a baby is selected
    if (pathname === "/") {
      newPath = `/babies/${newBabyId}`;
    } else if (currentBabyId) {
      newPath = pathname.replace(currentBabyId, newBabyId);
    } else {
      // If no baby is currently selected in path, and we're not on '/',
      // this means we're probably on /add-baby or /family, so push to babies page.
      newPath = `/babies/${newBabyId}`;
    }
    router.push(newPath);
  };

  if (babies.length === 0) {
    return null;
  }

  const selectedBaby = babies.find((b) => b.id === currentBabyId);
  const currentBabyName = selectedBaby ? selectedBaby.name : babies[0].name; // Fallback to first baby

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="w-full min-w-[7rem] justify-between pr-2 text-base sm:text-sm"
        >
          {currentBabyName}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[12rem]">
        {babies.map((baby) => (
          <DropdownMenuItem
            key={baby.id}
            onClick={() => handleSwitch(baby.id)}
            className={cn("cursor-pointer", {
              "font-bold text-primary": baby.id === currentBabyId,
            })}
          >
            {baby.name}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/add-baby" className="flex items-center">
            <Plus className="mr-2 h-4 w-4" />
            아기 추가
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
