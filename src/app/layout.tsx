import type { Metadata } from "next";
import "./globals.css";

import { Source_Sans_3, Source_Serif_4 } from "next/font/google";

import { AuthProvider } from "@/data/session/auth-context";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { getCurrentUser } from "@/server/auth/users-services";
import { Toaster } from "sonner";
import ReactQueryProvider from "@/data/query-provider";

const sourceSans = Source_Sans_3({ subsets: ["latin"], variable: "--font-source-sans" });
const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });

export const metadata: Metadata = {
  title: "Sacko-Green Gestion",
  description: "Gestion des véhicules, clients, conteneurs et paiements de Sacko-Green Inc.",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${sourceSans.variable} ${sourceSerif.variable} font-sans`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReactQueryProvider>
            <AuthProvider user={user}>
              {children}
            </AuthProvider>
            <Toaster position="top-right" richColors />
          </ReactQueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
