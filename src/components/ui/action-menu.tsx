"use client";

import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ActionMenuItem {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (e: React.MouseEvent) => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  separator?: boolean; // Ajouter un séparateur avant cet item
}

interface ActionMenuProps {
  items: ActionMenuItem[];
  className?: string;
  align?: "start" | "center" | "end";
  triggerClassName?: string;
  contentClassName?: string;
}

/**
 * ActionMenu - Menu d'actions standardisé
 *
 * Fonctionnalités:
 * - Menu dropdown avec icône MoreHorizontal
 * - Support des variantes (default, destructive)
 * - Support des icônes par item
 * - Support des séparateurs
 * - Support disabled par item
 * - Alignement personnalisable
 *
 * @example
 * <ActionMenu
 *   items={[
 *     {
 *       label: "Voir les détails",
 *       icon: Eye,
 *       onClick: (e) => {
 *         e.stopPropagation();
 *         onView();
 *       },
 *     },
 *     {
 *       label: "Modifier",
 *       icon: Edit,
 *       onClick: (e) => {
 *         e.stopPropagation();
 *         onEdit();
 *       },
 *       separator: true,
 *     },
 *     {
 *       label: "Supprimer",
 *       icon: Trash2,
 *       onClick: (e) => {
 *         e.stopPropagation();
 *         onDelete();
 *       },
 *       variant: "destructive",
 *     },
 *   ]}
 * />
 */
export function ActionMenu({
  items,
  className,
  align = "end",
  triggerClassName,
  contentClassName,
}: ActionMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0", triggerClassName)}
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Ouvrir le menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn("w-48", contentClassName)}
      >
        {items.map((item, index) => {
          const Icon = item.icon;

          return (
            <React.Fragment key={index}>
              {item.separator && <DropdownMenuSeparator />}
              <DropdownMenuItem
                onClick={item.onClick}
                disabled={item.disabled}
                variant={item.variant}
              >
                {Icon && <Icon className="mr-2 h-4 w-4" />}
                {item.label}
              </DropdownMenuItem>
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
