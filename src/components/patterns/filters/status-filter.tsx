"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StatusOption {
  value: string;
  label: string;
  color?: string;
}

interface StatusFilterProps {
  options: StatusOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder?: string;
}

export function StatusFilter({
  options,
  value,
  onChange,
  placeholder = "Sélectionner un statut",
}: StatusFilterProps) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[200px] justify-between">
          {selectedOption ? (
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "h-2 w-2 rounded-full",
                  selectedOption.color || "bg-muted0"
                )}
              />
              {selectedOption.label}
            </span>
          ) : (
            placeholder
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[200px]">
        {options.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onSelect={() => onChange(option.value)}
          >
            <span
              className={cn(
                "mr-2 h-2 w-2 rounded-full",
                option.color || "bg-muted0"
              )}
            />
            {option.label}
          </DropdownMenuItem>
        ))}
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => onChange(null)}>
              Réinitialiser
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
