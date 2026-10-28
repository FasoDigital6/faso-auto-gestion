import { Metadata } from "next";

import { GlobalNav } from "@/components/layout/nav";
import { UserMenu } from "@/components/layout/user-menu";
import { PageContainer } from "@/components/layout/page-container";
import { MobileNavProvider } from "@/components/layout/mobile-nav-provider";

export const metadata: Metadata = {
  title: {
    default: "Sacko-Green Gestion",
    template: "%s | Sacko-Green Gestion",
  },
  description: "Gestion des véhicules, clients, conteneurs et paiements de Sacko-Green Inc.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileNavProvider>
      <GlobalNav />
      <div className="pt-16 lg:pt-0 lg:pl-72">
        <div className="hidden lg:flex items-center justify-end gap-2 h-14 px-6 border-b border-border">
          <UserMenu />
        </div>
        <PageContainer>{children}</PageContainer>
      </div>
    </MobileNavProvider>
  );
}
