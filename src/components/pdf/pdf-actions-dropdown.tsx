"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Download, Printer, ChevronDown, Loader2, Mail } from "lucide-react";

interface PdfActionsDropdownProps {
  onDownload: () => void;
  onPrint: () => void;
  onEmail?: () => void;
  isGenerating?: boolean;
  variant?: "default" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  label?: string;
  icon?: ReactNode;
}

export function PdfActionsDropdown({
  onDownload,
  onPrint,
  onEmail,
  isGenerating = false,
  variant = "outline",
  size = "default",
  label = "Actions PDF",
  icon,
}: PdfActionsDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Génération...
            </>
          ) : (
            <>
              {icon || <FileText className="h-4 w-4 mr-2" />}
              {label}
              <ChevronDown className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={onDownload}>
          <Download className="h-4 w-4 mr-2" />
          Télécharger
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onPrint}>
          <Printer className="h-4 w-4 mr-2" />
          Imprimer
        </DropdownMenuItem>
        {onEmail && (
          <DropdownMenuItem onClick={onEmail}>
            <Mail className="h-4 w-4 mr-2" />
            Envoyer par email
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
