"use client";

import { createContext, useContext, useState } from "react";

interface MobileNavContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const MobileNavContext = createContext<MobileNavContextValue>({
  isOpen: false,
  setIsOpen: () => {},
});

export const useMobileNav = () => useContext(MobileNavContext);

/**
 * État partagé du tiroir de navigation mobile — lu/écrit par `GlobalNav`
 * (bouton hamburger) et par la visite guidée (qui doit l'ouvrir pour mettre
 * en évidence un élément du menu, puis le refermer pour le reste du tour).
 */
export function MobileNavProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <MobileNavContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </MobileNavContext.Provider>
  );
}
