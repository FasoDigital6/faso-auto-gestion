"use client";

import { useQuery } from "@tanstack/react-query";
import { listUsersAction } from "@/server/actions/user-actions";
import { getParametresAction } from "@/server/actions/parametres-actions";
import { useAuth } from "@/data/session/auth-context";

export function useUtilisateurs() {
  const user = useAuth();
  return useQuery({ queryKey: ["utilisateurs", user?.uid], queryFn: listUsersAction,
    enabled: user?.role === "admin", retry: false });
}

export function useParametres() {
  const user = useAuth();
  return useQuery({ queryKey: ["parametres", user?.uid], queryFn: getParametresAction,
    enabled: user?.role === "admin", retry: false, refetchOnWindowFocus: false });
}
