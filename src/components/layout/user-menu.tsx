"use client";

import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/data/session/auth-context";
import { logout } from "@/data/session/logout";
import { getRoleLabel } from "@/domain/permissions/permissions";

export function UserMenu({ surSidebar = false }: { surSidebar?: boolean }) {
  const authUser = useAuth();

  const displayName = authUser?.displayName || "Utilisateur";
  const initiales = displayName
    .split(" ")
    .map((mot) => mot.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const photoUrl = authUser?.photoURL || undefined;

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          data-tour="user-menu"
          className="group flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Menu utilisateur"
        >
          <span className="hidden lg:block max-w-[140px] truncate text-sm font-medium text-foreground opacity-0 transition-opacity group-hover:opacity-100">
            {displayName}
          </span>
          <Avatar className={`h-11 w-11 border transition-shadow group-hover:ring-2 ${surSidebar ? "border-sidebar-border group-hover:ring-white/40" : "border-border group-hover:ring-brand/40"}`}>
            <AvatarImage src={photoUrl} alt={displayName} />
            <AvatarFallback className={`text-base font-semibold ${surSidebar ? "bg-sidebar-accent text-sidebar-accent-foreground" : "bg-brand/10 text-brand-ink"}`}>
              {initiales || "U"}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
        <div className="flex flex-col items-center gap-2 px-4 pt-6 pb-5">
          <Avatar className="h-20 w-20 border-4 border-background shadow-sm">
            <AvatarImage src={photoUrl} alt={displayName} />
            <AvatarFallback className="bg-brand/10 text-brand-ink text-2xl font-semibold">
              {initiales || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center">
            <p className="font-semibold text-base leading-tight">{displayName}</p>
            <p className="text-sm text-muted-foreground truncate max-w-[220px]">
              {authUser?.email}
            </p>
            <p className="text-xs text-muted-foreground">{getRoleLabel(authUser?.role)}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="p-1.5">
          <DropdownMenuItem onClick={handleLogout} className="text-destructive-ink focus:text-destructive-ink">
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
