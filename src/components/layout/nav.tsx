"use client";

import Link from "next/link";
import Image from "next/image";
import clsx from "clsx";
import { usePathname } from "next/navigation";
import { X, Menu } from "lucide-react";

import { navItems, navFooterItems } from "@/components/layout/nav-data";
import { ItemNav } from "@/components/layout/nav-types";
import { UserMenu } from "@/components/layout/user-menu";
import { useAuth } from "@/data/session/auth-context";
import { useMobileNav } from "@/components/layout/mobile-nav-provider";
import { activeNavSlug, isNavItemVisible } from "@/components/layout/nav-access";
import { SITE_LABELS } from "@/domain/permissions/permissions";
import { sitesDe } from "@/domain/permissions/has-permission";

export function GlobalNav() {
  const { isOpen, setIsOpen } = useMobileNav();
  const close = () => setIsOpen(false);
  const pathname = usePathname();
  const user = useAuth();

  const visibleSections = navItems
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => isNavItemVisible(item, user)),
    }))
    .filter((section) => section.items.length > 0);
  const visibleFooterItems = navFooterItems.filter((item) => isNavItemVisible(item, user));
  const activeSlug = activeNavSlug(
    [...visibleSections.flatMap((s) => s.items), ...visibleFooterItems],
    pathname
  );
  const sites = sitesDe(user).map((site) => SITE_LABELS[site]).join(" · ");

  return (
    <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-3 border-b border-sidebar-border bg-sidebar px-4 text-sidebar-foreground lg:bottom-0 lg:right-auto lg:h-auto lg:w-72 lg:flex-col lg:items-stretch lg:gap-0 lg:border-r lg:border-b-0 lg:px-0">
      <Link
        href="/"
        onClick={close}
        className="flex min-w-0 flex-1 items-center gap-3 lg:flex-none lg:flex-col lg:gap-1 lg:px-5 lg:pt-6 lg:pb-4 lg:text-center"
      >
        <Image
          src="/sacko/logo.webp"
          alt="Sacko-Green Inc."
          width={800}
          height={400}
          priority
          className="h-10 w-auto lg:h-16"
        />
        {sites && (
          <div className="truncate text-xs text-sidebar-foreground/70 max-lg:hidden">{sites}</div>
        )}
      </Link>

      <div className="flex items-center gap-1 lg:hidden">
        <UserMenu surSidebar />
        <button
          type="button"
          className="grid size-11 place-items-center rounded-md text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={isOpen ? "Fermer le menu" : "Ouvrir le menu"}
        >
          {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <div
        className={clsx(
          "flex-col lg:flex lg:min-h-0 lg:flex-1",
          isOpen ? "fixed inset-x-0 top-16 bottom-0 z-30 flex bg-sidebar" : "hidden"
        )}
      >
        <nav aria-label="Navigation principale" className="flex-1 space-y-5 overflow-y-auto px-3 py-2">
          {visibleSections.map((section) => (
            <div key={section.name}>
              {section.name && (
                <div className="px-3 pb-1.5 text-xs font-semibold text-sidebar-foreground/70">
                  {section.name}
                </div>
              )}
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.slug}>
                    <GlobalNavItem item={item} close={close} active={item.slug === activeSlug} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
          {visibleFooterItems.length > 0 && (
            <div>
              <div className="px-3 pb-1.5 text-xs font-semibold text-sidebar-foreground/70">
                Administration
              </div>
              <ul className="space-y-0.5">
                {visibleFooterItems.map((item) => (
                  <li key={item.slug}>
                    <GlobalNavItem item={item} close={close} active={item.slug === activeSlug} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}

function GlobalNavItem({
  item,
  close,
  active,
}: {
  item: ItemNav;
  close: () => void;
  active: boolean;
}) {
  if (!item.icon) return null;

  return (
    <Link
      onClick={close}
      href={`/${item.slug}`}
      aria-current={active ? "page" : undefined}
      className={clsx(
        "relative flex min-h-9 max-lg:min-h-11 items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-brand font-semibold text-brand-foreground"
          : "text-sidebar-foreground/90 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <item.icon className="size-5 shrink-0" />
      <span className="truncate">{item.name}</span>
    </Link>
  );
}
