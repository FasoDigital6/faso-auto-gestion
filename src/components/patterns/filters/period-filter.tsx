"use client";

import { Calendar, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { fr } from "date-fns/locale";

interface PeriodValue {
  type: "week" | "month" | "year" | "custom";
  startDate?: Date;
  endDate?: Date;
}

interface PeriodFilterProps {
  value: PeriodValue | null;
  onChange: (value: PeriodValue | null) => void;
  placeholder?: string;
}

export function PeriodFilter({
  value,
  onChange,
  placeholder = "Sélectionner une période",
}: PeriodFilterProps) {
  const [showCustom, setShowCustom] = useState(false);
  const [customRange, setCustomRange] = useState<{ from?: Date; to?: Date }>({});

  const getPeriodLabel = () => {
    if (!value) return placeholder;

    switch (value.type) {
      case "week":
        return "Cette semaine";
      case "month":
        return "Ce mois";
      case "year":
        return "Cette année";
      case "custom":
        if (value.startDate && value.endDate) {
          return `${format(value.startDate, "dd MMM", { locale: fr })} - ${format(value.endDate, "dd MMM yyyy", { locale: fr })}`;
        }
        return "Personnalisé";
      default:
        return placeholder;
    }
  };

  const handlePeriodSelect = (type: "week" | "month" | "year") => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (type) {
      case "week":
        startDate = startOfWeek(now, { locale: fr });
        endDate = endOfWeek(now, { locale: fr });
        break;
      case "month":
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case "year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
    }

    onChange({ type, startDate, endDate });
  };

  const handleCustomRangeSelect = () => {
    if (customRange.from && customRange.to) {
      onChange({
        type: "custom",
        startDate: customRange.from,
        endDate: customRange.to,
      });
      setShowCustom(false);
      setCustomRange({});
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-full sm:w-[200px] justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {getPeriodLabel()}
          </span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuItem onClick={() => handlePeriodSelect("week")}>
          Cette semaine
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePeriodSelect("month")}>
          Ce mois
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handlePeriodSelect("year")}>
          Cette année
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <Popover open={showCustom} onOpenChange={setShowCustom} modal={true}>
          <PopoverTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setShowCustom(true);
              }}
            >
              Personnalisé...
            </DropdownMenuItem>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0"
            align="start"
            onInteractOutside={(e) => {
              // Empêcher la fermeture si on clique sur le calendrier
              const target = e.target as HTMLElement;
              if (target.closest('[role="dialog"]')) {
                e.preventDefault();
              }
            }}
          >
            <CalendarComponent
              mode="range"
              selected={{
                from: customRange.from,
                to: customRange.to,
              }}
              onSelect={(range) => {
                setCustomRange({
                  from: range?.from,
                  to: range?.to,
                });
              }}
              locale={fr}
              numberOfMonths={2}
            />
            <div className="p-3 border-t">
              <Button
                onClick={handleCustomRangeSelect}
                disabled={!customRange.from || !customRange.to}
                className="w-full"
              >
                Appliquer
              </Button>
            </div>
          </PopoverContent>
        </Popover>
        {value && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange(null)}>
              Réinitialiser
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
