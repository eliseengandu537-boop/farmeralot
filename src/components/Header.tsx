"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useStorefront } from "@/components/StorefrontProvider";

export function Header() {
  const { cart } = useStorefront();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") { setMenuOpen(false); menuRef.current?.focus(); }
    }
    function closeOutside(event: PointerEvent) {
      if (event.target instanceof Node && !headerRef.current?.contains(event.target)) setMenuOpen(false);
    }
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOutside);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, [menuOpen]);

  return (
    <>
      <header ref={headerRef} className={`site-header${pathname === "/" ? " header-home" : ""}`}>
        <Link className="brand" href="/" aria-label="Farmeralot home">
          <Image className="brand-logo" src="/catalogue/farmeralot-logo.webp" alt="Farmeralot" width={220} height={95} priority />
        </Link>
        <button
          className="menu-toggle"
          ref={menuRef}
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="main-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav id="main-navigation" aria-label="Main navigation" className={`main-nav${menuOpen ? " is-open" : ""}`}>
          <Link href="/shop" aria-current={pathname === "/shop" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Shop parts</Link>
          <Link href="/about" aria-current={pathname === "/about" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Our story</Link>
          <Link href="/request-quote" aria-current={pathname === "/request-quote" ? "page" : undefined} onClick={() => setMenuOpen(false)}>Get a quote</Link>
        </nav>
        <div className="header-actions">
          <form action="/shop" className="header-search">
            <label className="visually-hidden" htmlFor="header-search">Search parts</label>
            <input id="header-search" type="search" name="search" placeholder="Find a part or SKU" />
            <button aria-label="Search" type="submit">⌕</button>
          </form>
          <Link className="cart-link" href="/cart" aria-label={`Cart with ${cart?.items_count ?? 0} items`}>
            <span className="cart-icon" aria-hidden="true">Bag</span>
            <span className="cart-count">{cart?.items_count ?? 0}</span>
          </Link>
        </div>
      </header>
    </>
  );
}
