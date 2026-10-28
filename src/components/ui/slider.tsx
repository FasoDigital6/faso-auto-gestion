"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface SliderProps {
  title: React.ReactNode | string;
  description: string;
  isOpen: boolean;
  onClose: () => void;
  size?: string;
  side?: "top" | "bottom" | "left" | "right" | undefined;
  children?: React.ReactNode;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  title,
  description,
  isOpen,
  onClose,
  size, // size = w-[400px] sm:w-[540px] for example
  side,
  children,
  className,
}) => {
  const onChange = (open: boolean) => {
    if (!open) {
      onClose();
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onChange}>
      <SheetContent
        side={side}
        className={cn(
          "max-h-screen h-full overflow-hidden flex flex-col",
          size,
          className
        )}
      >
        <SheetHeader className="flex-shrink-0">
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-hidden">{children}</div>
      </SheetContent>
    </Sheet>
  );
};
