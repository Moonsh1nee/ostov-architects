"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { asset, localePath, parseLocalePath } from "@/lib/paths";
import { setScrollLocked } from "../motion/events";
import { useHeaderAutoHide } from "./useHeaderAutoHide";
import { useHeaderTone } from "./useHeaderTone";

interface NavLink {
  href: string;
  label: string;
}

interface HeaderNavProps {
  links: NavLink[];
  labels: { open: string; close: string; switchTo: string };
}

function useAlternateLocale() {
  const { locale, path } = parseLocalePath(usePathname());
  const other = locale === "ru" ? "en" : "ru";
  // Different root layouts per locale, so this is a document navigation anyway:
  // a plain <a> (with basePath added by hand) is the honest choice over <Link>.
  return { locale, other, href: asset(localePath(other, path)) };
}

const isActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(href);

export function HeaderNav({ links, labels }: HeaderNavProps) {
  const pathname = usePathname();
  const alt = useAlternateLocale();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on navigation without an effect: compare against the path the menu opened on.
  const isOpen = open && openedAt === pathname;
  useHeaderTone(pathname, isOpen);
  useHeaderAutoHide(isOpen);

  useEffect(() => {
    if (!isOpen) return;
    setScrollLocked(true);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      setScrollLocked(false);
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const langLink = (className: string) => (
    <a href={alt.href} hrefLang={alt.other} lang={alt.other} aria-label={labels.switchTo} className={className}>
      {alt.other.toUpperCase()}
    </a>
  );

  return (
    <>
      <nav className="pointer-events-auto hidden items-center gap-8 md:flex">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            aria-current={isActive(pathname, link.href) ? "page" : undefined}
            className="link-underline text-sm aria-[current=page]:bg-[length:100%_1px]"
          >
            {link.label}
          </Link>
        ))}
        {langLink("caption link-underline ml-4")}
      </nav>

      <button
        ref={buttonRef}
        type="button"
        className="caption pointer-events-auto -mr-3 p-3 md:hidden"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        onClick={() => {
          setOpenedAt(pathname);
          setOpen((v) => !v);
        }}
      >
        {isOpen ? labels.close : labels.open}
      </button>

      {isOpen &&
        createPortal(
          <div
            id="mobile-menu"
            className="fixed inset-0 z-40 flex flex-col justify-end bg-ink px-(--gutter) pb-[max(2rem,env(safe-area-inset-bottom))] text-paper md:hidden"
          >
            <nav className="flex flex-col gap-2">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(pathname, link.href) ? "page" : undefined}
                  className="display flex items-baseline gap-4 py-1 text-[clamp(2.75rem,13vw,4.5rem)]"
                >
                  <span className="caption text-paper/50">0{i + 1}</span>
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="mt-10 flex items-center justify-between border-t border-paper/20 pt-5">
              {langLink("caption py-2")}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
